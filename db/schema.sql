-- Noroo Paint MVP schema — PRD §10.
-- Run inside Supabase SQL Editor (or any Postgres ≥ 14 with pgcrypto for gen_random_uuid).
-- Row-level security policies are sketched at the bottom; tighten before launch.

-- ────────────────────────────────────────────────────────────────────────
-- Profiles — extends Supabase auth.users
-- ────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  phone       text,
  full_name   text,
  created_at  timestamptz default now()
);

-- ────────────────────────────────────────────────────────────────────────
-- Addresses
-- ────────────────────────────────────────────────────────────────────────
create table if not exists addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  line1        text not null,
  suburb       text,
  postcode     text not null,
  state        text default 'WA',
  country      text default 'AU',
  is_default   boolean default true,
  created_at   timestamptz default now()
);
create index if not exists addresses_user_idx on addresses(user_id);

-- ────────────────────────────────────────────────────────────────────────
-- Enums + products
-- ────────────────────────────────────────────────────────────────────────
do $$ begin
  create type product_category as enum
    ('Interior','Exterior','Ceilings','Trim','Undercoat','Premium All-in-One','Accessories');
exception when duplicate_object then null; end $$;

do $$ begin
  create type paint_finish as enum
    ('Matt','Low Sheen','Semi Gloss','Gloss','Ultra Flat','Eggshell');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tin_size as enum ('1L','4L','10L');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tinting_base as enum ('Tintable','White Base Only');
exception when duplicate_object then null; end $$;

create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  category      product_category not null,
  name          text not null,
  finish        paint_finish,
  tin_size      tin_size,
  tinting_base  tinting_base,
  price_aud     numeric(10,2) not null,
  image_url     text,
  swatch_hex    text default '#e9e2cf',
  is_active     boolean default true,
  created_at    timestamptz default now()
);
create index if not exists products_category_idx on products(category) where is_active;

-- ────────────────────────────────────────────────────────────────────────
-- Saved colours — per-user reusable (brand, colour_name) pairs
-- ────────────────────────────────────────────────────────────────────────
create table if not exists saved_colours (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete cascade,
  brand          text,
  colour_name    text not null,
  last_used_at   timestamptz default now(),
  unique (user_id, lower(brand), lower(colour_name))
);

-- ────────────────────────────────────────────────────────────────────────
-- Orders + items
-- ────────────────────────────────────────────────────────────────────────
create table if not exists orders (
  id                       uuid primary key default gen_random_uuid(),
  order_number             text unique not null,
  user_id                  uuid references profiles(id),
  guest_email              text,
  customer_name            text not null,
  customer_phone           text not null,
  delivery_address_line1   text not null,
  delivery_postcode        text not null,
  delivery_suburb          text,
  subtotal_aud             numeric(10,2) not null,
  delivery_aud             numeric(10,2) not null,
  gst_aud                  numeric(10,2) not null,
  total_aud                numeric(10,2) not null,
  notes                    text,
  status                   text default 'received',
  created_at               timestamptz default now()
);
create index if not exists orders_user_idx on orders(user_id);
create index if not exists orders_created_idx on orders(created_at desc);

create table if not exists order_items (
  id                       uuid primary key default gen_random_uuid(),
  order_id                 uuid references orders(id) on delete cascade,
  product_id               uuid references products(id),
  product_name_snapshot    text not null,
  tin_size_snapshot        tin_size,
  finish_snapshot          paint_finish,
  brand                    text,
  colour_name              text,
  quantity                 integer not null check (quantity >= 1),
  unit_price_aud           numeric(10,2) not null,
  line_total_aud           numeric(10,2) not null
);
create index if not exists order_items_order_idx on order_items(order_id);

-- ────────────────────────────────────────────────────────────────────────
-- Waitlist for out-of-zone postcodes
-- ────────────────────────────────────────────────────────────────────────
create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  postcode    text not null,
  created_at  timestamptz default now()
);

-- ────────────────────────────────────────────────────────────────────────
-- Row-level security (Supabase pattern). Tighten and test before launch.
-- ────────────────────────────────────────────────────────────────────────
alter table profiles       enable row level security;
alter table addresses      enable row level security;
alter table saved_colours  enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;
alter table waitlist       enable row level security;

-- Products are world-readable
alter table products enable row level security;
create policy "products are public" on products for select using (true);

-- Per-user scoping
create policy "own profile"        on profiles      for all using (auth.uid() = id);
create policy "own addresses"      on addresses     for all using (auth.uid() = user_id);
create policy "own saved_colours"  on saved_colours for all using (auth.uid() = user_id);
create policy "own orders"         on orders        for all using (auth.uid() = user_id);
create policy "own order_items"    on order_items   for all using (
  exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

-- Waitlist: insert-only for everyone; service role reads
create policy "waitlist insert" on waitlist for insert with check (true);
