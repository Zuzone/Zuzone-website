-- Curated directory (2026-09-14): only villages on the owner's list are shown publicly.
-- Hidden rows are kept, not deleted, so any of them can come back with one UPDATE:
--   UPDATE public.villages SET hidden = false WHERE id = '<id>';
ALTER TABLE public.villages ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.villages.hidden IS 'Excluded from the public map, timeline, list, calendar feed, APIs and ZuThread.';

UPDATE public.villages SET hidden = true
WHERE id NOT IN (
  'zukas-2026',                          -- ZuKaş, Kaş
  'zanzalu',                             -- Zanzalu, Fumba Town
  'futura-camp-2026-x-zuberlin',         -- Futura House (ZuBerlin), Berlin
  'zuafrique-2026',                      -- ZuAfrique, Kilifi
  'shanhaiwoo-singapore-2026',           -- ShanHaiWoo
  'edge-esmeralda-2026-may-30-june-27',  -- Edge City
  'edgecity-goa-2026',                   -- Edge City
  'edge-city-bhutan-2026',               -- Edge City
  'ipe-village-2026',                    -- Ipê City, Brazil
  'invisible-garden-reunion-india-2026', -- Invisible Garden
  '4seas',                               -- 4Seas, Chiang Mai
  'amagi-life-villages-for-the-future',  -- Amagi Life, Koh Phangan
  'mushanghai',                          -- muShanghai
  'infinita-city-2026',                  -- Infinita, Roatán
  'valley-of-the-commons'                -- Valley of the Commons, Austria
);
