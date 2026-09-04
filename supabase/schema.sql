create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view their profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users can create their profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, display_name) values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
