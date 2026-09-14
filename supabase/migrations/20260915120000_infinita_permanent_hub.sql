-- Infinita City as a permanent hub (2026-09-15). Infinita describes itself as a year-round
-- community in Próspera, Roatán. The Infinite Games 2026 pop-up keeps its own row so the
-- Gantt history stays intact; it is renamed so the two entries read clearly side by side.
INSERT INTO public.villages (id, name, dates, location, center, description, village_type, website_url, twitter_url, telegram_url, logo_url, thumbnail_url, hidden)
VALUES (
  'infinita-city',
  'Infinita City',
  'Permanent',
  'Próspera, Roatán, Honduras',
  '[-86.5333, 16.3333]'::jsonb,
  'A year-round frontier community in Próspera on Roatán, where founders, researchers and builders live and work side by side, with talks, co-working and extended stays.',
  'permanent',
  'https://www.infinita.city/',
  'https://x.com/Infinitacity',
  'https://t.me/InfinitaCity',
  'https://cdn.prod.website-files.com/6724125117125f2970da4c89/69cb0185c8b4730fd752a61a_webclip-256x256.png',
  'https://cdn.prod.website-files.com/6724125117125f2970da4c89/6a302f785a1112dec20bb666_opengraph%20newest.webp',
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, dates = EXCLUDED.dates, location = EXCLUDED.location, center = EXCLUDED.center,
  description = EXCLUDED.description, village_type = EXCLUDED.village_type, website_url = EXCLUDED.website_url,
  twitter_url = EXCLUDED.twitter_url, telegram_url = EXCLUDED.telegram_url, logo_url = EXCLUDED.logo_url,
  thumbnail_url = EXCLUDED.thumbnail_url, hidden = false, updated_at = now();

UPDATE public.villages
SET name = 'Infinite Games 2026', logo_url = COALESCE(logo_url, 'https://cdn.prod.website-files.com/6724125117125f2970da4c89/69cb0185c8b4730fd752a61a_webclip-256x256.png'), updated_at = now()
WHERE id = 'infinita-city-2026';
