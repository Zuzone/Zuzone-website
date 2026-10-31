# Contributing to Zuzone

Thanks for pitching in. This is a small codebase with a real live site behind it, so the rules
are short.

## Getting set up

```bash
git clone git@github.com:boogaav/zuzone.git
cd zuzone
npm install
npm run dev          # http://localhost:8080
```

Nothing else is required. The `.env` in the repo carries only the Supabase **publishable** key,
so a fresh clone talks to the real directory straight away.

### What you can and cannot do without access

| You can, on a clone | You need access for |
| --- | --- |
| Everything in `src/` — UI, pages, hooks | Deploying (the Vercel project) |
| Read the live data through the anon key | Writing to the database outside the app's own rules |
| Run the edge layer locally (`npx vercel dev`) | Applying migrations (`supabase db push`) |
| Rebuild the ZuThread snapshot, with your own monid key | Setting Vercel environment variables |

Ask for access rather than working around row-level security: anonymous writes are closed on
purpose, and the add-village path is gated behind a Zupass signature that the edge layer verifies.

## Workflow

1. Branch off `main`: `git checkout -b your-thing`.
2. Keep commits scoped, and write messages that say *why*, not just what.
3. Before pushing: `npx tsc -p tsconfig.app.json --noEmit && npm run lint && npm run build`.
4. Open a PR against `main`. Say what you changed and how you checked it.
5. Don't deploy from a branch. `main` is what ships.

## House style

- **TypeScript, no `any`** in new code. The Supabase types are generated; regenerate rather than
  hand-edit them.
- **Tailwind with the theme tokens.** Use `bg-background`, `text-muted-foreground`,
  `border-border` and friends. Avoid raw hex; the palette is defined once in `src/index.css`.
- **shadcn/ui components** live in `src/components/ui/` and are vendored. Treat them as
  third-party: extend around them rather than editing in place.
- **One hook per table** in `src/hooks/`, matching the existing `useVillages` shape.
- **Comment the surprising parts only.** If a line needs explaining, explain why it is that way.

## Database changes

Every schema change is a migration:

```bash
# write supabase/migrations/<timestamp>_what_it_does.sql, then
npx supabase db push
```

Never change a migration that has already been applied — add a new one. The seed migration
holds the villages, so a fresh project comes up with real content.

## Things that bite

- A `git push` does not redeploy the site. `npm run deploy` does.
- The Mapbox map paints nothing in a hidden browser tab, so screenshots come back blank. Verify
  on a visible tab.
- The Gantt strip and the side panel both size themselves off the map container; if you change
  that layout, check 375px, 820px and 1280px widths.
- PostgREST bulk inserts require identical keys on every row.

## Secrets

Nothing secret goes in the repo. The anon key is publishable by design; anything else
(`SUPABASE_SERVICE_ROLE_KEY`, `MONID_API_KEY`, Telegram tokens) belongs in Cloudflare Worker
secrets or Supabase function secrets. If you ever commit a real secret, rotate it first, then
worry about the history.
