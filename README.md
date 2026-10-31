# Zuzone

**The home for permanent hubs and pop-up cities.** Every Zuzalu-style pop-up village on one
globe, with a timeline of who is running when, per-village pages, a subscribable calendar feed,
and a combined feed of what the villages are posting.

Live: **https://zuzone.org**

---

## What is in here

| Area | What it does |
| --- | --- |
| **Globe** | Mapbox globe of every village, with a scrollable 18-month Gantt strip below it (6 months back, 12 forward). |
| **Village pages** | `/:slug` — about, map, residents, scenius projects, events, treasury. |
| **Manifesto & Historic Brief** | `/why-zuzone` — the manifesto, then where Zuzone comes from: an interactive reading of Vitalik's 2023 essay (collapsed by default) and the photo dossier. |
| **Newsletter** | `/newsletter` — Zuzone newsletter issues, newest first, summarised with photos; data in `src/data/zuzoneNewsletter.ts`. |
| **Zupulse** | Header panel: the weekly Zuletter, and **ZuThread** — every village's X posts in one chronological feed. |
| **Add a village** | Open to anyone with a [Zupass](https://zupass.org); the edge worker verifies a signed POD, and the village stays hidden until the team approves it. |
| **Calendar feed** | `/calendar.ics` — every pop-up as all-day events, subscribable in Google/Apple/Outlook. |
| **Open API** | `/api/villages.json` and `/api/zuthread.json`. |

## Architecture

```
browser ──► Vercel (static build + api/edge.mjs) ──►  Supabase (Postgres + Auth + 20 edge functions)
                 │                                  ▲
                 │ serves the Vite build            │ villages, profiles, stays, events…
                 │ + per-village Open Graph tags
                 │ + /calendar.ics, /api/*
                 └──► monid → TikHub (X timelines for ZuThread)
```

- **Frontend** — Vite + React + TypeScript + Tailwind + shadcn/ui. Originally generated in
  Lovable, now maintained here.
- **Edge layer** — Vercel serves the static Vite build; every other path goes to one Vercel
  Function (`api/edge.mjs` → `server/index.mjs`) that adds what a static host cannot: Open Graph tags injected per village so shared links unfurl, the
  iCalendar feed, the JSON APIs, and the Zupass-gated write path. Its small key/value state
  (the cached ZuThread feed, refresh locks, rate limits) lives in the Supabase table `edge_kv`.
- **Database** — Supabase project `exgxlhlecglvuctbrsco`. Schema lives in
  `supabase/migrations/` and travels with the repo, seed villages included.

## Quick start

```bash
npm install
npm run dev          # http://localhost:8080
```

That is all you need for frontend work. The committed `.env` points at the shared cloud
Supabase and holds only the **publishable** anon key, which is safe in the clear and is what
row-level security is designed around. There is no secret to obtain to run the app.

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 8080 |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint |
| `npm run deploy` | `vercel --prod` (needs access to the Vercel project) |
| `node scripts/zuthread-refresh.mjs` | Rebuild `public/zuthread.json` locally via the monid CLI |
| `node scripts/og-card/build.mjs` | Regenerate the social share image from the visible villages |

## Layout

```
src/
  components/       GlobalMap (globe + Gantt), SidePanel, ZuThread, villages/, stays/, ui/
  pages/            Index, Village, WhyZuzone, Newsletter, Profile, Admin, …
  hooks/            one hook per table — useVillages, useStays, useEvents, …
  integrations/     Supabase client + generated types
api/
  edge.mjs          Vercel Function: maps Vercel/Supabase onto the edge layer's bindings
server/
  index.mjs         routing, OG injection, calendar feed, Zupass-verified writes
  zuthread.mjs      X timeline fetch + normalization
vercel.json         build settings, www → apex redirect, rewrites into api/edge.mjs
supabase/
  migrations/       schema, in order; the seed migration carries the villages
  functions/        20 edge functions (Telegram bots, wallets, Luma, auth)
```

## Deploying

Vercel hosts the site at **https://zuzone.org**. With the GitHub repo connected to the Vercel
project, every push to `main` deploys production and every other branch gets a preview URL.

```bash
npm run deploy                       # manual production deploy (Vercel CLI)
npx supabase db push                 # migrations
npx supabase functions deploy --use-api
```

Secrets live in Vercel (Project → Settings → Environment Variables) and Supabase, never in the repo:

| Vercel variable | Needed for |
| --- | --- |
| `VITE_MAPBOX_TOKEN` | the globe (read at build time) |
| `SUPABASE_SERVICE_ROLE_KEY` | add-village, newsletter signups, `edge_kv` (feed cache, rate limits) |
| `MONID_API_KEY` | live ZuThread refreshes (optional; falls back to `public/zuthread.json`) |
| `LUMA_API_KEY`, `LUMA_CONTACT_TAG` | syncing signups to Luma (optional) |

`SUPABASE_URL` and the anon key are read from the committed `.env` (`VITE_SUPABASE_*`).

## Notes worth knowing

- **Two lockfiles.** `bun.lock` is a leftover from Lovable; deploys and CI use **npm**.
- **`zuzone.lovable.app`** still exists and points at the *old* Lovable backend. Ignore it.
- **Lovable created some tables outside migrations.** `comments` and `villages.landing_blocks`
  were captured retroactively; if you add a column through a GUI, write the migration too.
- **The directory is curated.** `villages.hidden = true` removes a village from the map, timeline,
  calendar, APIs and ZuThread without deleting it. Unhide with
  `UPDATE villages SET hidden = false WHERE id = '<id>';`, then rerun the share-card script.
- **Reviewing submissions.** New villages arrive with `hidden = true` and a `zupass_public_key`.
  List the queue with `SELECT id, name, website_url, created_at FROM villages WHERE hidden AND zupass_public_key IS NOT NULL ORDER BY created_at DESC;`
  and approve with `UPDATE villages SET hidden = false WHERE id = '<id>';`.
- **Newsletter signups** land in the `newsletter_subscribers` table (written only by the Worker;
  no public access). Export the active list with
  `SELECT email, created_at FROM newsletter_subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at;`
  or from the Supabase Table Editor (Export → CSV). With the `LUMA_API_KEY` worker secret set
  (Luma Plus calendar), each signup is also imported into the Zuzone Luma calendar with the tag
  `Zuzone newsletter` (override with `LUMA_CONTACT_TAG`), and earlier signups are backfilled on the
  next signup. `luma_synced_at` / `luma_error` show the state; `/api/_health` shows `luma_sync`.
- **ZuThread costs money.** Free X timeline sources are all dead; refreshes go through monid at
  roughly $0.0015 per account, so the refresh path is rate limited in the Worker.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Current state and open items: [HANDOFF.md](HANDOFF.md).
