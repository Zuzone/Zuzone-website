-- ZuCity Japan as a permanent hub (owner request 2026-09-25). zucity.org describes a
-- community-owned coliving and coworking neighbourhood in Komoro, Nagano: three restored
-- houses, a coworking commons and a 120-person venue, with an annual pop-up city each
-- September–October. The two earlier pop-up rows (zucity-japan-march-2026, zucity-popup-2026-…)
-- stay hidden; this row is the year-round entry.
INSERT INTO public.villages (id, name, dates, location, center, description, focus, village_type, website_url, twitter_url, telegram_url, instagram_url, logo_url, thumbnail_url, hidden)
VALUES (
  'zucity-japan',
  'ZuCity Japan',
  'Permanent',
  'Komoro, Nagano, Japan',
  '[138.432252, 36.321759]'::jsonb,
  'A community-owned neighbourhood in the mountains of Komoro, Nagano, ninety minutes from Tokyo: three restored houses, a coworking commons and a 120-person venue a few minutes'' walk apart. Day passes, long-term coliving, a summer build residency and an annual pop-up city every September–October.',
  'Coliving, d/acc, DeSci, longevity, regeneration',
  'permanent',
  'https://zucity.org/',
  'https://x.com/zucity_japan',
  'https://t.me/+hqHkbnXdw4ZjMDVh',
  'https://instagram.com/zucity_japan',
  'https://zucity.org/zucity-logo-light-icon.png',
  'https://zucity.org/api/og?page=home&locale=en',
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, dates = EXCLUDED.dates, location = EXCLUDED.location, center = EXCLUDED.center,
  description = EXCLUDED.description, focus = EXCLUDED.focus, village_type = EXCLUDED.village_type,
  website_url = EXCLUDED.website_url, twitter_url = EXCLUDED.twitter_url, telegram_url = EXCLUDED.telegram_url,
  instagram_url = EXCLUDED.instagram_url, logo_url = EXCLUDED.logo_url, thumbnail_url = EXCLUDED.thumbnail_url,
  hidden = false, updated_at = now();
