-- ZuKansa as a permanent hub in Helsinki (owner request 2026-10-25). Public information is thin:
-- zukansa.org is a "Coming Soon" placeholder, so the entry carries only what the owner gave
-- (name, Helsinki, hub) plus the site. Add socials, logo and a fuller description once they are
-- published; do not guess handles.
INSERT INTO public.villages (id, name, dates, location, center, description, village_type, website_url, hidden)
VALUES (
  'zukansa',
  'ZuKansa',
  'Permanent',
  'Helsinki, Finland',
  '[24.9384, 60.1699]'::jsonb,
  'An independent hub in Helsinki, Finland, for people carrying the Zuzalu ideas forward. Kansa is Finnish for "people".',
  'permanent',
  'https://zukansa.org/',
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, dates = EXCLUDED.dates, location = EXCLUDED.location, center = EXCLUDED.center,
  description = EXCLUDED.description, village_type = EXCLUDED.village_type,
  website_url = EXCLUDED.website_url, hidden = false, updated_at = now();
