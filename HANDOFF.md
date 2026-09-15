# Handoff — current state (2026-09-15)

Read this before continuing work. Setup, commands and architecture are in [README.md](README.md)
and [CONTRIBUTING.md](CONTRIBUTING.md); this file covers what is live, the content rules, and what
is still open.

Live: **https://zuzone.boogaav.workers.dev** · deploy with `npm run deploy` (a push does not deploy).

## What is live

- **Home `/`**: globe, header (Why Zuzone, Newsletter, Manifesto, Events, Add to calendar, Zupulse, X;
  inline at ≥1024px, hamburger below). Panels open in a right-hand `SidePanel` (30% width, full screen on
  phones). Bottom panel: newsletter signup strip, then Gantt/List, **collapsed by default**. The Gantt is
  a horizontal scroll strip (6 months back, 12 forward; 12 months visible on desktop, 4 on phones).
- **Directory**: 25 public villages. Curation is `villages.hidden`: hide, never delete.
- **Add a village**: needs a Zupass login. The Worker verifies the signed POD and inserts the village with `hidden = true`.
  - Review queue:
    `SELECT id, name, website_url, created_at FROM villages WHERE hidden AND zupass_public_key IS NOT NULL ORDER BY created_at DESC;`
  - Approve: `UPDATE villages SET hidden = false WHERE id = '<id>';`
  - After approving, rerun `node scripts/og-card/build.mjs`.
- **ZuThread** (inside Zupulse): X posts from 21 accounts, including @zuzones (`EXTRA_SOURCES` in
  `worker/src/zuthread.mjs`).
  - The refresh button chains Worker invocations, 4 accounts each, through the `SELF` binding.
  - Limits: 10-minute cooldown, 20 refreshes per day.
- **`/why-zuzone`**: two parts, each in a collapsed card.
  - Part I: an interactive reading of Vitalik's essay.
  - Part II: photo chapters for Montenegro, Istanbul and Chiang Mai.
  - No timeline.
- **`/newsletter`**: the issues, newest first (`src/data/zuzoneNewsletter.ts`; add new issues at the top).
- **Newsletter signups**: `POST /api/newsletter/subscribe` writes to the `newsletter_subscribers` table.
  - Luma forwarding is built but stays off until `LUMA_API_KEY` is set.
- **Analytics**: GA4 `G-KBFF3YEEBM`, Microsoft Clarity `yimkgkl8vb` (`index.html`).

## Content rules (from the project owner)

1. **Zuzone was not part of Zuzalu 2023.**
   - Zuzalu was the experiment and an ecosystem followed. Zuzone came later as an independent coordination layer.
   - Never write that Zuzone grew out of Zuzalu.
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
     - "Futura House": the row is still named "Futura Camp 2026 x ZuBerlin".

## Gotchas

- Mapbox paints nothing in a hidden browser tab, so use headless Chrome with `--window-size` for screenshots.
- Workers free plan limits: 50 subrequests per invocation (hence the batched refresh), and the account's cron quota is used up.
- Register internal POST routes before the non-GET → assets guard in `worker/src/index.mjs`, or they return 405.
- Clear test rate limits with `npx wrangler kv key delete --remote --binding ZUTHREAD <key>`
  (`refresh-stamp`, `sub-rate:<ipHash>:<hour>`).
- zsh: never name a shell variable `path`.
