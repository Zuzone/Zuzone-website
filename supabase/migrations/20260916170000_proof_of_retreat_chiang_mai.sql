-- Owner request 2026-09-16: Proof of Retreat moves to Chiang Mai, Nov 7 – Dec 7 (was Vietnam, Jan–Feb 2027).
UPDATE villages SET
  location = 'Chiang Mai, Thailand',
  dates = 'Nov 7 - Dec 7, 2026',
  center = '[98.9853, 18.7883]'
WHERE id = 'proof-of-retreat';
