# Handoff — current state (2026-09-15)

Read this before continuing work. Setup, commands and architecture are in [README.md](README.md)
and [CONTRIBUTING.md](CONTRIBUTING.md); this file covers what is live, the content rules, and what
is still open.

Live: **https://zuzone.boogaav.workers.dev** · deploy with `npm run deploy` (a push does not deploy).

## What is live

- **Home `/`**: globe, header (Historic Brief, Newsletter, Events, Zupulse, X; inline at
  ≥1024px, hamburger below). Panels open in a right-hand `SidePanel` (30% width, full screen on
  phones). **"Add a village" and "Add to calendar" sit at the top of the Events panel** (moved out of
  the header 2026-09-16; the calendar feed keeps its own panel, reached from that button). Bottom
  panel: newsletter signup strip, then Gantt/List, **collapsed by default**. The Gantt is a horizontal
  scroll strip (6 months back, 12 forward; 12 months visible on desktop, 4 on phones).
  - The globe **spins slowly on its own** (2°/s, one turn per three minutes; `GlobalMap.tsx` idle-spin
    effect). It pauses on grab/wheel/touch, resumes 3 s after release, stays still past zoom 3, in hidden
    tabs and under reduced motion. Dev builds expose the map as `window.__zuzoneMap` for checks.
- **Village pages** `/:slug` have tabs About, Map, Residents, Scenius, Events and **Pulse**
  (`src/components/villages/VillagePulse.tsx`, added 2026-09-16): the village's own X posts, filtered
  out of the shared ZuThread feed by the village id / its `twitter_url` handle. Desktop: a panel over
  the right third of the map; phones: the usual bottom sheet. A village without an X link shows an
  empty state asking for one.
- **Directory**: 23 public villages (ZuCity Japan added as a permanent hub 2026-09-25; hidden 2026-09-16: Infinite Games 2026, Edge Esmeralda 2026, Edge City Bhutan 2026; the Goa row is now plain "Edge City"). Curation is `villages.hidden`: hide, never delete.
- **Add a village**: needs a Zupass login. The Worker verifies the signed POD and inserts the village with `hidden = true`.
  - Review queue:
    `SELECT id, name, website_url, created_at FROM villages WHERE hidden AND zupass_public_key IS NOT NULL ORDER BY created_at DESC;`
  - Approve: `UPDATE villages SET hidden = false WHERE id = '<id>';`
  - After approving, rerun `node scripts/og-card/build.mjs`.
- **ZuThread** (inside Zupulse): X posts from 21 accounts, including @zuzones (`EXTRA_SOURCES` in
  `worker/src/zuthread.mjs`).
  - The refresh button chains Worker invocations, 4 accounts each, through the `SELF` binding.
  - Limits: 10-minute cooldown, 20 refreshes per day.
  - Blocked personal accounts: `EXCLUDED_HANDLES` in `worker/src/zuthread.mjs` (currently
    @James_of_Arc). Never a source, and their reposts/quotes are dropped both when a feed is built
    and when a cached feed is served.
- **`/why-zuzone`**: the manifesto on top (`src/components/why/ManifestoSection.tsx`; merged from the
  old header panel 2026-09-16, `/manifesto` redirects here), then the **Historic Brief** (renamed from
  "Why Zuzone" the same day; `/historic-brief` redirects to it) in two parts, each in a collapsed card.
  - Part I: an interactive reading of Vitalik's essay.
  - Part II: photo chapters for Montenegro, Istanbul and Chiang Mai.
  - No timeline.
- **`/newsletter`**: the issues, newest first (`src/data/zuzoneNewsletter.ts`; add new issues at the top),
  with a signup strip above and below them (not dismissible there).
- **Newsletter signups**: `POST /api/newsletter/subscribe` writes to the `newsletter_subscribers` table.
  - Luma forwarding is built but stays off until `LUMA_API_KEY` is set.
- **Analytics**: GA4 `G-KBFF3YEEBM`, Microsoft Clarity `yimkgkl8vb` (`index.html`).

## Brand (identity v2, September 2026)

- The designer's brand book is `brand/Zuzone-Motion-Preview.html` (self-contained, fonts embedded).
  Palette: forest `#1F4D3A`, cream `#FAF6EC`, lime `#C4D63E`, blush `#FBE6E6`; Cormorant Garamond
  Medium for display, DM Sans for body — the same tokens `src/index.css` already uses.
- The **Zu symbol** (12-dot ring, one lime marker, "Zu" inside) is `src/components/brand/ZuMark.tsx`;
  static copies in `brand/zu-mark-forest.svg` and `brand/zu-mark-cream.svg`. The earlier
  exploration files in `brand/` (`zone.svg`, `constellation.svg`, …) are superseded.
- The **living lockup** in the home header is `src/components/brand/ZuLockup.tsx`: the symbol stays
  fixed, every 2.4 s the lime marker steps clockwise and the next village name slides in
  ("Zu Zone", "Zu Zanzalu", "Zu Afrique", …). Names come from the live directory through
  `src/lib/lockupName.ts`, which drops years and parentheticals and strips a leading "Zu" so the
  symbol supplies it. Pauses on hover, in hidden tabs and for reduced-motion users; clicking the
  symbol advances by hand. Phones (below 640px) fall under the brand's 64px ring minimum, so they
  get plain "Zu" text plus the ticking name. **Rule (owner, 2026-09-16): every visit starts on
  "Zu Zone"** — the index resets when the village list arrives and the first beat is held 1.75× longer.
- Favicon: `public/favicon.svg` (plain "Zu" on cream, the brand's under-64px expression), with
  `favicon.ico`/`favicon.png` rendered from it. The share card (`scripts/og-card/build.mjs`) carries
  the ring beside the wordmark.
- Casing to confirm with the owner: the directory row is `mushanghai`; the brand book writes `muShanghai`.

## Content rules (from the project owner)

1. **Zuzone emerged from Zuzalu's ideas, a few years after 2023, and was never physically part of it.**
   - Zuzalu was the experiment and an ecosystem followed. Zuzone came later as an independent coordination
     layer that carries those ideas forward (the owner's narrative, confirmed 2026-09-16).
   - Say "emerged from Zuzalu's ideas"; never imply Zuzone was present at, or run by, the 2023 gathering.
2. **No funding information**: no backers, grants, subsidies, sponsors, prize or raise amounts.
   The Ethereum Foundation did not fund any community.
3. Long sections go in **collapsible cards** (the pattern in `src/components/why/DossierSection.tsx`).
4. The Gantt stays **horizontal** on mobile.
5. For new villages:
   - Research them from primary sources and check that every image URL loads.
   - Flag name/location mismatches instead of silently changing them.

## Health check

`GET /api/_health` must report `service_kind: "jwt:service_role:xflmthlxogmbslglgdwj"`. If the
service-role secret holds the publishable key instead, every Worker write fails with RLS 42501.

Worker secrets currently set: `SUPABASE_SERVICE_ROLE_KEY`, `MONID_API_KEY`. Not set: `LUMA_API_KEY`.

## Open items

1. **Luma**: waiting on the owner.
   - Create a Zuzone calendar on Luma Plus.
   - Run `cd worker && npx wrangler secret put LUMA_API_KEY`. Optionally also set `LUMA_CONTACT_TAG`.
   - Submit a test signup, then check `luma_synced_at` or `luma_error` on the row.
2. **Edge functions**: several secrets are unset: Telegram, Firecrawl, Twitter, Magic, Privy, Villedge.
   - `admin-ai-chat`, `agent-create-village`, `generate-village-about` and `telegram-webhook` still call
     Lovable's AI gateway and need a real LLM provider.
   - Google login (Lovable auth) is broken; email/password works.
3. **No in-app review screen** for submitted villages; review is SQL only.
4. **Unanswered questions for the owner**:
   - Brand spelling: "Zuzone" or "ZuZone"?
   - Keep the old GA ID as well as the new one?
   - Remove the $15/day food budget and the "Switzerland, home of the EF" mention from the essay reading?
   - Location mismatches:
     - ShanHaiWoo: the row says Singapore, the owner says Hong Kong.
     - Invisible Garden: the row says India, the owner says Chiang Mai.
     - "Futura House": the row is now "Futura Camp 2026" (the "x ZuBerlin" was dropped 2026-09-16);
       the owner has not asked for "Futura House" yet. Invisible Garden lost "Reunion" the same day.

## Gotchas

- **Supabase Free auto-pauses the project after 7 quiet days** (happened 2026-09-25; the hostname
  stops resolving, the site's village API returns `supabase 530`, the CLI fails with a login-role
  timeout). Resume from the dashboard project page ("Resume project", ~10 min). Usage was under 1%,
  so it is never a quota issue. Cloudflare cron quota is used up, so no keep-alive ping there yet.

- Mapbox paints nothing in a hidden browser tab, so use headless Chrome with `--window-size` for screenshots.
- Workers free plan limits: 50 subrequests per invocation (hence the batched refresh), and the account's cron quota is used up.
- Register internal POST routes before the non-GET → assets guard in `worker/src/index.mjs`, or they return 405.
- Clear test rate limits with `npx wrangler kv key delete --remote --binding ZUTHREAD <key>`
  (`refresh-stamp`, `sub-rate:<ipHash>:<hour>`).
- zsh: never name a shell variable `path`.
