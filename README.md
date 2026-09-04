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

## Prüfung

```sh
npm run build
npm run lint
```
