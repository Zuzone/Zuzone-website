# Zuzone rebrand reel — treatment v1 (2026-10-13)

**v2 (2026-10-13, after user approval):** end card now reads zuzone.org; two masters: `out/zuzone_reel_v2.mp4` (AI guide voice, timing reference) and `out/zuzone_reel_v2_bed.mp4` (music + tocks + SFX, no voice) because the user records the VO themselves — script with time codes and budgets in `VO_SCRIPT.md`. Re-cut with `SKIP_EXISTING=1 VERSION=v2 python3 tools/assemble.py` (+ `NOVO=1` for the bed); only `segments/s16.mp4` and the caption/mix passes were rebuilt.

**Status 2026-10-13 (later the same day):** v1 fully rendered and assembled — `out/zuzone_reel_v1.mp4` (1080×1920, 60.0 s, audio mixed), `out/zuzone_reel_v1_720.mp4`, per-shot clips in `out/shots/`. Master copied to `~/Desktop/Projects/Zuzone/reel/Zuzone-reel-v1.mp4 (moved there in the 2026-10-16 Desktop cleanup)`. HTML treatment with every shot embedded: `treatment/index.html` (published as an artifact). Pipeline: `tools/render_plates.mjs` (brand plates + captions from `plates/index.html`), `tools/capture_old.mjs`, `HEADFUL=1 node tools/capture_new5.mjs` (phone capture; the headless screencast only gives 1× frames, a visible Retina Chrome window gives 1080×1920), `tools/assemble.py`. monid: 9 VO lines (ElevenLabs, voice River), music bed (Eleven Music v2), 3 SFX, Seedance 2.0 transition for shot 15 — $0.95 total.

**Format:** 9:16, 1080×1920, 30 fps, 60 s. Captions-first (must work muted); VO optional.
**Working title:** From a page to a planet.
**Logline:** Zuzone was a newsletter page with a house icon. Now it is a living mark and a live globe of 24 hubs and pop-up cities. Three movements: the page, the mark, the world.

**Rhythm:** the whole edit is cut to the logo's tick. A soft wooden "tock" every 0.8 s (75 BPM) is the metronome; every cut lands on a tock.
**Look:** old-site shots flat, desaturated (−40 sat, +10 contrast), light vignette. New-platform shots untouched cream / forest / lime.
**Colours:** forest #1F4D3A, cream #FAF6EC, lime #C4D63E, blush #FBE6E6.
**Captions:** DM Sans, forest on a cream pill, key word underlined in lime. Keep inside the Reels safe zone (clear of the top 250 px and bottom 320 px).

## Shot list

| # | Time | What is on screen (exact) | Caption | Source |
|---|------|---------------------------|---------|--------|
| 1 | 0:00–0:03 | Old logo full-frame on white: green circle with the white house icon + "ZUZONE" serif caps. Hold 1.5 s. Hard cut on a tock to the new Zu ring on cream; the lime dot advances one step. | We rebranded Zuzone. | old: zuzone.org header zoomed ~400 % · new: logo plate A |
| 2 | 0:03–0:07 | Screen-record of zuzone.org at 1440×900, pushed in so the text column fills 9:16. Slow scroll: ECOSYSTEM eyebrow → big ZUZONE → tagline → mission box → "ZULETTER · March 2026 Edition" card. | It was a newsletter page. | Chrome recording (ref/old_full.png) |
| 3 | 0:07–0:09 | Jump cut to zuzone.org/crossword: the black-and-white grid, "March 2026 Crossword". | …with a crossword. (neutral alt: Static. Monthly.) | Chrome recording (ref/old_crossword.png) |
| 4 | 0:09–0:12 | Push into the old nav: "March 2026 · February 2026 · Crossword · Announcements · Archive". Then push to the tagline "The home for all permanent hubs and pop-up cities." | A home for hubs… with no map. | Chrome recording (ref/old_desktop.png) |
| 5 | 0:12–0:14 | Empty cream. One tock. Nothing else. | So we started with the mark. | logo plate (blank) |
| 6 | 0:14–0:18 | Twelve forest dots appear clockwise from 12 o'clock, one per fast tock (0.3 s). "Zu" in Cormorant fades in at the centre on the twelfth dot. | Twelve dots. Twelve months. | logo plate B (brand/zu-mark-forest.svg) |
| 7 | 0:18–0:21 | The 2 o'clock dot turns lime. It advances clockwise three steps, one per tock. | One lime dot: where the year is now. | logo plate C |
| 8 | 0:21–0:27 | The lockup. Ring fixed on the left; the name on the right swaps on each tick: Zone → Zuitzerland → muShanghai → Zanzalu → 4Seas → ZuCity Japan → Valley of the Commons. Cormorant, baseline locked, exact casing, room reserved for the longest name. | One tick. A new place. | logo plate D (site lockup logic at 0.8 s) |
| 9 | 0:27–0:30 | Colour flip: forest-on-cream → cream-on-forest. Then three 0.7 s inserts: the "Zu" favicon in a browser tab, the OG share card, the phone header (ring + ticking name). | Forest. Cream. Lime. | logo plate E + screenshots |
| 10 | 0:30–0:35 | Phone recording of the new home. Globe loads over Europe and turns slowly; village pins pop in with avatars: Futura Camp 2026, Zuitzerland, ZuKaş 2026, mushanghai, 4Seas, AMAGI LIFE, AyaHQ, Web3Clubs. Header lockup ticks top-left. | Now it's a world. 24 hubs and pop-up cities, live. | iPhone Safari recording (ref/new_phone.png) |
| 11 | 0:35–0:39 | Tap the Zuitzerland pin → village card (name, dates, Laax, Switzerland, links). Swipe the globe to Asia, tap 4Seas. | Every village: when, where, how to join. | iPhone recording |
| 12 | 0:39–0:43 | Tap the chevron at the bottom; the Gantt strip rises. Drag across the 18 months past the "Today" marker; village bars slide by. | A year of pop-ups on one timeline. | desktop window at 1080×1920 |
| 13 | 0:43–0:47 | Tap Zupulse. Side panel: "The pulse of the network", "Read the Zuletter" button, then ZuThread "286 posts · 21 accounts", village chips, feed scrolls. | The network's pulse: every village's posts, one thread. | desktop window at 1080×1920 |
| 14 | 0:47–0:52 | Rapid trio, ~1.6 s each: Events panel; newsletter strip (type an email, press Subscribe); Historic Brief page scrolling to the stat tiles (200 residents · 2 months · ~100 apartments · 8 organisers). | Events. Newsletter. The history. | desktop recordings (ref/new_why.png, ref/new_newsletter.png) |
| 15 | 0:52–0:56 | Split screen. Left: old zuzone.org, grey and still. Right: the globe turning. On a tock the old half slides off left and the globe fills the frame. | From a page… to a planet. | composite |
| 16 | 0:56–1:00 | End card on forest: cream Zu ring ticking, lockup reads "Zu Zone", zuzone.org below in lime. Hold. | zuzone.org | logo plate F |

Timings sum to 60 s.

## Audio
- Metronome: soft wooden tock every 0.8 s from 0:00. Every cut lands on one.
- Music: minimal, warm, low (muted keys loop at 75 BPM). Drops out at 0:12 for one bar of silence, returns at 0:14 with the dots.
- SFX: paper slide under old-site scrolls; low air whoosh on the globe reveal (0:30); one bright ding on the final tick (0:58).

## VO (optional, ~75 words, mirrors the captions)
"Zuzone was a newsletter page. A house icon, a monthly issue, a crossword. The home for hubs and pop-up cities, with no map. So we started with the mark. Twelve dots for twelve months. One lime dot for where the year is now. One tick, a new place. Then we gave it a world: twenty-four hubs and pop-up cities, live, on one globe, one timeline, one thread. From a page to a planet. Zuzone."

## Alternative hooks (A/B the first 3 s)
1. We rebranded Zuzone. (default)
2. Same name. New world.
3. Our logo was a house. Now it's a clock.

## Capture notes
- Old site: zuzone.org still serves the old Next.js build; capture it before DNS moves. Chrome window 1440×900, 100 % zoom, toolbar hidden, QuickTime screen recording. The Luma "Community Events" block renders as grey skeleton loaders; if it stays blank in the recording that is an honest 1 s shot of "nothing live", if it loads skip it.
- New site (as built): scripted Playwright run in a visible Retina Chrome window, 540×960 viewport at 2× = 1080×1920, screencast at ~20 fps; globe drags, pin tap, Gantt, Zupulse, Events, newsletter typing, Historic Brief scroll. Shots 10–14 all come from this one run.
- Logo plates (shots 1, 5–9, 16): do not screen-record the brand book (desktop layout, 1.5 s tick). Build a 1080×1920 motion page from brand/zu-mark-forest.svg, zu-mark-cream.svg, zuzone-lockup.svg with the tick at 0.8 s and each sequence as its own scene; render at 30 fps with headless Chrome + ffmpeg.
- Copy rules: no funding mentions anywhere; the history shot (14) stays about history, never implies Zuzone was part of Zuzalu 2023. Spelling "Zuzone". Casing muShanghai / ShanHaiWoo in the lockup.

## Open before production
1. ~~End-card domain~~ → zuzone.org (done in v2). The domain still serves the old build until DNS moves; post after the move.
2. ~~Captions-only or VO?~~ → user records the VO; bed version has no voice.
3. Keep the crossword line (shot 3) or the neutral alternative? (user said "I love it" — keeping.)
4. Events beat shows demo placeholder events until LUMA_API_KEY is set.
