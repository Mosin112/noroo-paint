-- Account deletion: keep the business records (orders) but anonymize the
-- link to the user being deleted. Without this, deleting a profile is
-- blocked by the FK from orders.user_id.
--
-- ON DELETE SET NULL on the FK keeps each order row intact with user_id =
-- null, so revenue reports still account for the sale and fulfilment
-- history is preserved.

alter table orders
  drop constraint if exists orders_user_id_fkey;

alter table orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references profiles(id) on delete set null;
