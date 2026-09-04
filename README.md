# free2be

Eine einfache, moderne Authentifizierungsbasis mit React, Vite, TypeScript und Supabase.

## Start

```sh
npm install
npm run dev
```

## Supabase einrichten

1. Supabase-Projekt anlegen.
2. `supabase/schema.sql` im SQL Editor ausführen.
3. `.env.example` nach `.env` kopieren und URL sowie Anon-Key eintragen.
4. In Supabase Auth die E-Mail-Bestätigung nach Bedarf aktivieren.

Die App verwendet ausschließlich den öffentlichen Supabase Anon-Key im Browser. Profildaten sind durch Row Level Security geschützt. Service-Role-Keys gehören niemals in die Frontend-Umgebung.

## Admin einrichten

1. Einen normalen Account über die Website registrieren und die E-Mail bestätigen.
2. Im Supabase SQL Editor den Account einmalig zum Admin machen:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'DEINE-EMAIL');
```

3. Neu einloggen. Danach erscheint der Admin-Bereich. Admins können alle Places löschen und den Hero-Titel der Website ändern. Supabase RLS erzwingt diese Rechte serverseitig.

Für den gewünschten Account liegt die einmalige Abfrage zusätzlich in `supabase/promote-martens-admin.sql`.

## Prüfung

```sh
npm run build
npm run lint
```
