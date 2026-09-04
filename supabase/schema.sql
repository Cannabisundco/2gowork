create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'Sonstiger Ort',
  area text not null,
  wifi text not null default 'Kein WLAN',
  wifi_password text,
  outlets text not null default 'Nein',
  seating boolean not null default false,
  food boolean not null default false,
  rating numeric(2,1) not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;
create policy "Anyone can view places" on public.places for select using (true);
create policy "Authenticated users can create places" on public.places for insert to authenticated with check (auth.uid() = created_by);
create policy "Owners can update their places" on public.places for update to authenticated using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy "Owners can delete their places" on public.places for delete to authenticated using (auth.uid() = created_by);

-- Optional: enable email confirmation in Supabase Auth settings for production.
