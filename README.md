# 🥾 Hike Research

Personal catalog of hut-to-hut hikes worth considering. Single-user, statically
generated, deployed free on Vercel. Data lives in `data/hikes.yaml` and is
Zod-validated at build.

## Develop

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # also runs YAML validation
```

If the build fails with a schema error, the Zod issue path points to the
offending entry (e.g. `3.downsides.2` = fourth hike, third downside).

## Add or edit a hike

In Claude Code in this repo:

- `/add-hike <name>` — drafts a new entry and appends it after you confirm.
- `/enrich-hike <slug>` — fills gaps in an existing entry without touching
  the `notes` field.

Or just edit `data/hikes.yaml` by hand — `lib/schema.ts` is the source of
truth for allowed fields and enum values.

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
