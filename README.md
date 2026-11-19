# 🥾 Hike Research

Personal catalog of hut-to-hut hikes worth considering. Single-user, statically
generated, deployed free on Vercel. Data lives in `data/hikes.yaml` and is
Zod-validated at build.

## Develop

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # also runs YAML validation
npm test          # unit tests (vitest) for filters, URL state, data
npm run lint && npm run typecheck
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and build on
every PR and push to `main`.

## Features

- **List** (`/`): free-text search (name, country, region, highlights) plus
  filters for country, month, length, difficulty, style, pack weight,
  accommodation, status, and obscurity.
- **Map** (`/map`): the same filters on a MapLibre map.
- **Compare** (`/compare`): tick *compare* on up to four cards and view them
  side by side.
- **Hike page**: stats, season strip, locator map, nearest hikes, similar
  trips, and prev/next within the filtered list you came from.

Filters, sort, and the compare selection live in the URL query string
(`lib/hike-filters.ts`), so any view can be bookmarked and is carried between
pages.

If the build fails with a schema error, the Zod issue path points to the
offending entry (e.g. `3.downsides.2` = fourth hike, third downside).

## Add or edit a hike

In Claude Code in this repo:

- `/add-hike <name>` — drafts a new entry and appends it after you confirm.
- `/enrich-hike <slug>` — fills gaps in an existing entry without touching
  the `notes` field.

Or just edit `data/hikes.yaml` by hand — `lib/schema.ts` is the source of
truth for allowed fields and enum values.

A hike in a country not yet in the catalog needs a line in `COUNTRY_CODES`
(`lib/countries.ts`); the build fails with a pointer there otherwise. Flags
are derived from that ISO code.

## Deploy

Push to GitHub and import the repo in Vercel. Every `git push` to `main`
triggers a rebuild and deploy.

The repo and live site are public, so treat `notes` as world-readable.

### Map tiles (optional)

The `/map` page uses MapLibre GL. With no configuration it falls back to
[OpenFreeMap](https://openfreemap.org) (streets only, no key required).

To enable Outdoor and Satellite layers, sign up for a free
[MapTiler](https://www.maptiler.com) account and set:

```
NEXT_PUBLIC_MAPTILER_KEY=your_key_here
```

In Vercel, add it under Project Settings → Environment Variables. Locally,
put it in `.env.local`.

The key is exposed to the browser (the `NEXT_PUBLIC_` prefix is required for
client-side use), so restrict it to your deployment domain in the MapTiler
dashboard under Account → Keys → Allowed origins.
