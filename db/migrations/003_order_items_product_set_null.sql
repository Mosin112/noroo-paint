-- order_items.product_id → ON DELETE SET NULL
--
-- Catalogue churn (removed/renamed SKUs) needs to not break historical
-- order records. The product_name_snapshot / tin_size_snapshot /
-- finish_snapshot columns preserve what was ordered, so we can safely
-- drop the strict FK and let the link go null when the product is removed.

alter table order_items
  drop constraint if exists order_items_product_id_fkey;

alter table order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references products(id) on delete set null;
