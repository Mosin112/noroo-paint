-- orders.delivery_mode — pickup vs delivery
--
-- v2.3 added a "Pick up in store" option on the checkout screen. Pickup
-- orders skip the postcode zone check and the $25 delivery fee. We need a
-- column on `orders` so the fulfilment side (and any future admin) can
-- distinguish the two without parsing free-text address fields.
--
-- Defaults to 'delivery' so existing rows keep their semantics.

do $$ begin
  create type order_delivery_mode as enum ('delivery', 'pickup');
exception when duplicate_object then null; end $$;

alter table orders
  add column if not exists delivery_mode order_delivery_mode default 'delivery' not null;
