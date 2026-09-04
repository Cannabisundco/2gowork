# 2gowork

2gowork hilft Menschen, Orte zum Arbeiten mit kostenlosem WLAN, Steckdosen und Aufenthaltsmöglichkeiten zu finden.

## Aktueller Prototyp

- Öffentliche Suche nach Stadt, Stadtteil oder Ort
- Filter für Steckdosen, WLAN, Sitzplätze und Bistro
- Umschaltung zwischen Karten- und Listenansicht
- Beispiel-Orte rund um Berlin
- Formular zum Melden eines Ortes für registrierte Nutzer

## Supabase einrichten

1. Lege ein Supabase-Projekt an.
2. Führe [supabase/schema.sql](supabase/schema.sql) im SQL Editor aus.
3. Kopiere `.env.example` nach `.env` und trage Projekt-URL sowie Anon-Key ein.
4. Starte die Anwendung mit `npm run dev`.

Die App lädt Orte öffentlich aus Supabase. Registrierung, Login und Abmeldung laufen über Supabase Auth. Das Melden neuer Orte ist durch die Session und Row Level Security auf registrierte Nutzer begrenzt.

## Entwicklung

```sh
npm install
npm run dev
```

## Prüfung

```sh
npm run build
npm run lint
```

Die App ist mit React, Vite und TypeScript aufgebaut.
