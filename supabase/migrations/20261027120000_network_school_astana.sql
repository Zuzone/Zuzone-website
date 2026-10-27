-- Network School: the Forest City (Malaysia) campus closed in July 2026 and ns.com now says "Our new
-- campus in Astana" (built in partnership with the Republic of Kazakhstan). Owner request 2026-10-27:
-- add the Kazakhstan hub and remove the Malaysia one. There is only one Network School row, so it
-- moves to Astana and is unhidden; nothing remains pinned in Malaysia.
UPDATE public.villages SET
  name = 'Network School',
  village_type = 'permanent',
  dates = 'Permanent',
  location = 'Astana, Kazakhstan',
  center = '[71.4491, 51.1694]'::jsonb,
  description = 'A frontier community for techno-optimists: learn technology, work remotely and train together while living on campus. Its campus is in Astana, built in partnership with the Republic of Kazakhstan.',
  website_url = 'https://ns.com/',
  twitter_url = 'https://x.com/ns',
  logo_url = 'https://ns.com/favicon.ico',
  thumbnail_url = 'https://ns.com/home/opengraph-image.png',
  hidden = false,
  updated_at = now()
WHERE id = 'network-school-learn-burn-and-earn';
