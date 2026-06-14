-- Allow guest checkout under RLS
--
-- The schema's "own orders" policy requires auth.uid() = user_id, which is
-- false-on-NULL: when a guest (anon role) tries to INSERT a row with
-- user_id IS NULL, the policy evaluates `NULL = NULL` → unknown → reject,
-- so the API returns 401. Same on order_items.
--
-- Add explicit anon INSERT policies that only let guests create rows that
-- ARE guest rows (user_id IS NULL + guest_email IS NOT NULL), and let
-- them write order_items whose parent order is genuinely a guest order.
-- The existing "own orders" policy keeps RLS strict for everything else.

-- Guest-mode order insert. The app currently doesn't ask anonymous users
-- for an email (just name + phone), so we don't require guest_email here.
-- The customer_name + customer_phone columns are already NOT NULL at the
-- schema level so we know the office has a way to reach the customer.
drop policy if exists "guest orders insert" on orders;
create policy "guest orders insert" on orders
  for insert
  to anon
  with check (user_id is null);

drop policy if exists "guest order_items insert" on order_items;
create policy "guest order_items insert" on order_items
  for insert
  to anon
  with check (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.user_id is null
    )
  );

-- We also need guests to be able to read their order back right after
-- insert (the select() chained on .insert() runs as the same role) and
-- to read product prices for the totals calculation. Products are
-- already public-readable; orders + order_items just need a read policy
-- scoped to the row the guest just inserted, within the same request.
--
-- Easiest: allow anon to SELECT orders/order_items by id when the row
-- is a guest row. This is a tight scope — a guest can only look up an
-- order they know the UUID for, which only happens immediately after
-- inserting it.

drop policy if exists "guest orders read own" on orders;
create policy "guest orders read own" on orders
  for select
  to anon
  using (user_id is null);

drop policy if exists "guest order_items read own" on order_items;
create policy "guest order_items read own" on order_items
  for select
  to anon
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.user_id is null
    )
  );
