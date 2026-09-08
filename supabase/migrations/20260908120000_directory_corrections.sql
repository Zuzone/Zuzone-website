-- Directory corrections found during the 2026-09-08 launch pass.
-- These rows need host/admin rights to change, so they are applied as a migration
-- (or paste into the Supabase SQL editor) rather than from the anon client.

-- Scratch row that leaked into the public list
DELETE FROM public.villages WHERE id = '_test_perm_check';

-- ETHChiangmai 2025 actually ran Dec 8, 2025 - Feb 3, 2026 (Opening Day luma.com/9p9uj74x,
-- hackathon ethchiangmai.devfolio.co). The upcoming season is the separate ethchiangmai-2026 row.
UPDATE public.villages
SET dates = 'Dec 8, 2025 - Feb 3, 2026'
WHERE id = 'ethchiangmai-2025';

-- 4Seas is the permanent Nimman coliving/coworking hub; the Nov 11 - Jan 5 dates belonged to ETHChiangmai 2026.
UPDATE public.villages
SET village_type = 'permanent', dates = 'Permanent'
WHERE id = '4seas';

-- Network School left Forest City (Malaysia) in Aug 2026 and relocated to Kazakhstan.
UPDATE public.villages
SET location = 'Kazakhstan (relocated from Forest City, Malaysia, Aug 2026)'
WHERE id = 'network-school-learn-burn-and-earn';
