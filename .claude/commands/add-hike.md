---
description: Research a new hike and append it to data/hikes.yaml
argument-hint: <hike name or description>
---

Research the hike **$ARGUMENTS** and add it to `data/hikes.yaml`.

## Steps

1. **Read the schema** at `lib/schema.ts` so the entry passes Zod validation on build. Every field in `hikeSchema` is required unless marked `.optional()` or `.default(...)`. Pay attention to the allowed enum values (`STYLES`, `ACCOMMODATIONS`, `PACK_WEIGHTS`, `DIFFICULTIES`, `STATUSES`).

2. **Skim existing entries** in `data/hikes.yaml` to match tone and rating scale. In particular, calibrate `obscurity` against the seed entries:
   - `1` = as touristy as Tour du Mont Blanc
   - `3` = moderately known (Mardi Himal, Cavalls del Vent)
   - `4-5` = few English-language guides, locals outnumber foreigners (Mestia→Ushguli)

3. **Research** the hike. Use web search to gather:
   - Country, region, approximate center coordinates `[lat, lon]`
   - Length in km and days, total elevation gain in meters
   - Typical accommodation (refuge / hut / teahouse / guesthouse / homestay / bnb / hotel / camping / bivy)
   - Whether it's typically done with a full pack, light pack, or either
   - Best months to go
   - 3-5 specific highlights and 1-3 honest downsides
   - 2-4 guide links (Cicerone, national trail sites, blog trip reports — real URLs only)

4. **Draft the YAML entry** in the same style as existing entries. Important:
   - `slug` is lowercase kebab-case and unique.
   - `coordinates` is `[lat, lon]` — double-check the order.
   - Leave `notes: ""` — that column is mine, not yours.
   - Set `status: researching` by default.
   - Prefer honesty on `obscurity`: if it has a dedicated English Wikipedia article and a Cicerone guide, it's probably a 2, not a 4.

5. **Show me a unified diff** of what you plan to append before writing. If I approve, append (don't overwrite) to the end of `data/hikes.yaml`.

6. **Do not** run `git add` / `git commit` or any network-writing commands. I'll commit and push myself.

7. After writing, suggest running `npm run build` to confirm the Zod schema accepts it.
