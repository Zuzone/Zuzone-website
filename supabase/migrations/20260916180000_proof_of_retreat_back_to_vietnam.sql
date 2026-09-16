-- Owner reverted the 2026-09-16 move: Proof of Retreat stays in Vĩnh Hải, Vietnam, Jan 3 – Feb 3, 2027.
UPDATE villages SET
  location = 'Vĩnh Hải, Khánh Hòa, Vietnam',
  dates = 'Jan 3 - Feb 3, 2027',
  center = '[109.1471268, 11.6154176]'
WHERE id = 'proof-of-retreat';
