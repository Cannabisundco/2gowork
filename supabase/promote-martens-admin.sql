-- Einmalig im Supabase SQL Editor ausführen.
-- Der Account muss zuvor registriert und per E-Mail bestätigt sein.
update public.profiles
set is_admin = true
where id = (
  select id from auth.users
  where email = 'martens.michael@me.com'
);
