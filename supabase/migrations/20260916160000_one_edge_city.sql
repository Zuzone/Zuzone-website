-- Owner request 2026-09-16: a single "Edge City" entry, no edition names. The Goa row stays as
-- the next upcoming edition (Oct 11 – Nov 1, 2026) and takes the organisation's name, logo and
-- site; Edge Esmeralda 2026 (past) and Edge City Bhutan 2026 are hidden, not deleted.
UPDATE villages SET
  name = 'Edge City',
  website_url = 'https://www.edgecity.live/',
  logo_url = 'https://cdn.prod.website-files.com/65b2cb5abdecf7cd7747e170/65d5ef08c6a2bf96d1f60a27_favicon.png'
WHERE id = 'edgecity-goa-2026';
UPDATE villages SET hidden = true WHERE id IN ('edge-esmeralda-2026-may-30-june-27', 'edge-city-bhutan-2026');
