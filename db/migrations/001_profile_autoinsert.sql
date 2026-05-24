-- Auto-create a profiles row whenever Supabase Auth creates a new user.
-- Without this, the first INSERT into orders / addresses / saved_colours
-- for a new signup fails with a foreign-key violation on user_id.
--
-- security definer is required because auth.users is owned by the supabase_auth
-- role; trigger functions need elevated privileges to insert into public schema.

-- Backfill anyone who already signed up before this trigger existed.
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

-- Trigger function — idempotent via on conflict do nothing.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop-and-recreate so the trigger always points at the latest function body.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
