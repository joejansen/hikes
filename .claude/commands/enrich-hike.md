---
description: Fill gaps in an existing hike entry without touching the owner's notes
argument-hint: <slug>
---

Enrich the hike with slug **$ARGUMENTS** in `data/hikes.yaml`.

## Steps

1. **Read the schema** at `lib/schema.ts` and the existing entry for `$ARGUMENTS` in `data/hikes.yaml`.

2. **Identify gaps.** Look for missing or thin fields:
   - `coordinates` obviously off (e.g., `[0, 0]`)
   - `elevation_gain_m` absent
   - `length_km` absent
   - Fewer than 3 `highlights`
   - Zero `guide_links`
   - An `obscurity` rating that seems wrong given current popularity

3. **Research only the gaps.** Use web search to fill them in. Do not rewrite fields that already look reasonable.

4. **Never touch these fields:**
   - `notes` — always mine, always preserved verbatim.
   - `status` — always mine.
   - Any `highlights`, `downsides`, or `guide_links` entries I've already authored (only *add* new ones).

5. **Show me a unified diff** of the proposed changes before writing. Apply only after I confirm.

6. **Do not** run `git add` / `git commit`. I'll commit and push myself.

7. After writing, suggest running `npm run build` to confirm the Zod schema still accepts it.
