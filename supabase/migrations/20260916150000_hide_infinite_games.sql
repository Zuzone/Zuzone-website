-- Owner request 2026-09-16: remove "Infinite Games 2026" from everywhere. Hidden, not deleted
-- (map, timeline, calendar, APIs, ZuThread and the share card all skip hidden rows; the slug
-- redirects home). Its X account (@infinitacity) stays in ZuThread through the Infinita City hub.
UPDATE villages SET hidden = true WHERE id = 'infinita-city-2026';
