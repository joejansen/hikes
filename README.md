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

Push to GitHub and import the repo in Vercel. No env vars, no config.
Every `git push` to `main` triggers a rebuild and deploy.

The repo and live site are public, so treat `notes` as world-readable.
