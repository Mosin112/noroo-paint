-- Server-side order_number generation
--
-- The client used to count today's orders and pick the next letter
-- (MMDD-A → MMDD-AZ → MMDD-BA …). That SELECT runs under the user's
-- session, so RLS hides other users' orders from it — every new user's
-- first order today picked "A", colliding with whatever A already
-- existed and tripping the orders.order_number UNIQUE constraint:
--   POST /rest/v1/orders → 409 Conflict
--
-- Fix: generate the number inside a BEFORE INSERT trigger that runs as
-- security definer, so it can see every order today regardless of RLS.

-- Suffix encoding: A..Z, then AA..AZ, BA..BZ … (base-26, no zero digit).
create or replace function public.order_number_suffix(n integer)
returns text
language plpgsql
immutable
as $$
declare
  result text := '';
  m int := n;
begin
  loop
    result := chr(65 + (m % 26)) || result;
    m := (m / 26) - 1;
    exit when m < 0;
  end loop;
  return result;
end;
$$;

create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  prefix text := to_char(now() at time zone 'utc', 'MMDD');
  cnt int;
begin
  select count(*) into cnt
  from orders
  where order_number like prefix || '-%';
  return prefix || '-' || order_number_suffix(cnt);
end;
$$;

-- Trigger that auto-assigns order_number when the client INSERT doesn't
-- supply one (or supplies an empty string). The client now sends only
-- the customer + line item data; the database is the source of truth
-- for the number.
create or replace function public.set_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := generate_order_number();
  end if;
  return new;
end;
$$;

drop trigger if exists set_order_number_trigger on orders;
create trigger set_order_number_trigger
  before insert on orders
  for each row
  execute function set_order_number();

-- order_number was NOT NULL; the trigger fills it in before the row
-- lands, so the constraint still holds. Drop the NOT NULL flag so the
-- client INSERT can omit the field without Postgres complaining.
alter table orders alter column order_number drop not null;
