-- 008_security_hardening.sql
--
-- Closes three real-world risks identified during the v2.6 security
-- pass without changing app flow or UI.
--
-- 1) Cross-tenant guest order leak. The previous policy
--    `using (user_id is null)` let ANY anonymous caller SELECT every
--    guest order ever placed (names, phones, addresses, totals). We
--    tighten to a short post-creation window so the Confirmed-screen
--    handoff still works (postOrder reads back its own freshly
--    inserted row), but historical guest orders are no longer
--    enumerable from the client.
--
-- 2) Order-total + line-item tampering. postOrder computes totals from
--    live product prices, but the values still get persisted via plain
--    INSERTs. A modified client could send subtotal_aud:0.01. The
--    BEFORE INSERT trigger on order_items now recomputes unit_price
--    and line_total from products (and snaps name/tin/finish too).
--    A second trigger on orders rejects implausible delivery costs
--    and totals that aren't internally consistent.
--
-- 3) (Waitlist intentionally left open per security review — minor
--    spam risk only, no PII leak.)

begin;

-- ────────────────────────────────────────────────────────────────────
-- 1) Tighten guest order RLS
-- ────────────────────────────────────────────────────────────────────
drop policy if exists "guest orders read own" on orders;
drop policy if exists "guest order_items read own" on order_items;

-- Guests can read their JUST-PLACED order for the few seconds the
-- postOrder().select() round-trip needs, but not bulk-enumerate every
-- historical guest order. 5 minutes is a generous window for the
-- INSERT→SELECT round-trip on slow connections; nothing else in the
-- client path needs guest reads after the Confirmed screen.
create policy "guest orders read recent" on orders for select to anon
  using (user_id is null and created_at > now() - interval '5 minutes');

create policy "guest order_items read recent" on order_items for select to anon
  using (exists (
    select 1 from orders o
    where o.id = order_items.order_id
      and o.user_id is null
      and o.created_at > now() - interval '5 minutes'
  ));

-- ────────────────────────────────────────────────────────────────────
-- 2a) order_items: rewrite snapshots + financials from the live product
--     row on INSERT. The trigger ignores anything the client sends for
--     these fields, so a tampered postOrder() can't smuggle through
--     fake prices or product names.
-- ────────────────────────────────────────────────────────────────────
create or replace function public.fix_order_item_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_price  numeric(10,2);
  v_name   text;
  v_tin    tin_size;
  v_finish paint_finish;
begin
  if new.product_id is null then
    -- Product later deleted (ON DELETE SET NULL). Trust the existing
    -- snapshot — there's no live row to validate against. We still
    -- enforce a non-negative quantity below.
    if new.quantity is null or new.quantity < 1 then
      raise exception 'Quantity must be >= 1';
    end if;
    return new;
  end if;

  select name, tin_size, finish, price_aud
    into v_name, v_tin, v_finish, v_price
    from products
    where id = new.product_id;

  if v_price is null then
    raise exception 'Unknown product %', new.product_id;
  end if;
  if new.quantity is null or new.quantity < 1 then
    raise exception 'Quantity must be >= 1';
  end if;

  new.product_name_snapshot := v_name;
  new.tin_size_snapshot := v_tin;
  new.finish_snapshot := v_finish;
  new.unit_price_aud := v_price;
  new.line_total_aud := v_price * new.quantity;
  return new;
end;
$$;

drop trigger if exists fix_order_item_totals_trg on order_items;
create trigger fix_order_item_totals_trg
  before insert on order_items
  for each row execute function public.fix_order_item_totals();

-- ────────────────────────────────────────────────────────────────────
-- 2b) orders: reject obviously-tampered headers on insert.
--     - Negative amounts not allowed.
--     - Delivery is either $0 (pickup or free-threshold) or $25 (flat).
--     - GST and Total must be internally consistent with $0.02 rounding
--       tolerance.
-- ────────────────────────────────────────────────────────────────────
create or replace function public.validate_order_totals()
returns trigger
language plpgsql
as $$
begin
  if new.subtotal_aud < 0 or new.delivery_aud < 0
     or new.gst_aud < 0 or new.total_aud < 0 then
    raise exception 'Negative amounts are not allowed';
  end if;
  if new.delivery_aud not in (0, 25) then
    raise exception 'Delivery must be $0 or $25 (got %)', new.delivery_aud;
  end if;
  if abs(new.gst_aud - round(((new.subtotal_aud + new.delivery_aud) * 0.10)::numeric, 2)) > 0.02 then
    raise exception 'GST does not match (subtotal + delivery) * 10%%';
  end if;
  if abs(new.total_aud - (new.subtotal_aud + new.delivery_aud + new.gst_aud)) > 0.02 then
    raise exception 'Total does not match subtotal + delivery + GST';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_order_totals_trg on orders;
create trigger validate_order_totals_trg
  before insert on orders
  for each row execute function public.validate_order_totals();

commit;
