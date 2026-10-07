-- Frontier Tower as a permanent hub (owner request 2026-10-07). The row existed hidden since the
-- seed; refreshed from frontiertower.io: a 16-floor "vertical village" at 995 Market St, San
-- Francisco, for founders and researchers in AI, crypto, biotech, robotics, neurotech and
-- longevity, with team offices, a founder residency, event venues and a membership model.
UPDATE public.villages SET
  name = 'Frontier Tower',
  village_type = 'permanent',
  dates = 'Permanent',
  location = '995 Market St, San Francisco, CA, USA',
  center = '[-122.4089, 37.7826]'::jsonb,
  description = 'A sixteen-floor vertical village at 995 Market Street in San Francisco, built for founders and researchers in AI, crypto, biotech, robotics, neurotech and longevity. Each floor hosts a community; the tower adds team offices, a founder residency, event venues and several events a day, with membership on a monthly or annual basis.',
  focus = 'AI, crypto, biotech, robotics, neurotech, longevity',
  website_url = 'https://frontiertower.io/',
  twitter_url = 'https://x.com/frontiertower',
  telegram_url = 'https://t.me/+M0KxFTd3LnJkNzky',
  instagram_url = 'https://www.instagram.com/frontiertower/',
  luma_calendar_id = NULL,
  logo_url = 'https://frontiertower.io/apple-icon?10df4d934fce44cb',
  thumbnail_url = 'https://frontiertower.io/opengraph-image?03d9e32ccfa178ee',
  hidden = false,
  updated_at = now()
WHERE id = 'frontier-tower';
