-- free2be Supabase schema
-- Safe to run more than once in the SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles enable row level security;

drop policy if exists "Users can view their profile" on public.profiles;
drop policy if exists "Users can create their profile" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Admins can manage all profiles" on public.profiles;
create policy "Users can view their profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Sonstiger Ort',
  city text not null,
  wifi boolean not null default false,
  outlets boolean not null default false,
  seating boolean not null default false,
  food boolean not null default false,
  lat double precision not null,
  lng double precision not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;
drop policy if exists "Anyone can view places" on public.places;
drop policy if exists "Authenticated users can create places" on public.places;
drop policy if exists "Owners can update places" on public.places;
drop policy if exists "Owners can delete places" on public.places;
drop policy if exists "Admins can manage all places" on public.places;
create policy "Anyone can view places" on public.places
  for select using (true);
create policy "Authenticated users can create places" on public.places
  for insert to authenticated with check (auth.uid() = created_by);
create policy "Owners can update places" on public.places
  for update to authenticated using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy "Owners can delete places" on public.places
  for delete to authenticated using (auth.uid() = created_by);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
drop policy if exists "Anyone can view site settings" on public.site_settings;
drop policy if exists "Admins can manage site settings" on public.site_settings;
drop policy if exists "Admins can manage all profiles" on public.profiles;
drop policy if exists "Admins can manage all places" on public.places;
create policy "Anyone can view site settings" on public.site_settings
  for select using (true);
create policy "Admins can manage site settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage all profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins can manage all places" on public.places
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (key, value)
values ('hero_title', 'Finde deinen free2be Place.')
on conflict (key) do nothing;

-- After registering your own account, run this once to grant admin access:
-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'DEINE-EMAIL');
