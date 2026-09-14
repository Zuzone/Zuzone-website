-- Remove funding claims from village copy (2026-09-14). Zuzone does not describe who funds a community.
UPDATE public.villages
SET description = 'Month-long longevity and biotech pop-up city inside Japan''s largest biomedical cluster (KBIC), with 300+ builders, two summit weekends, lab access and regulatory tracks.'
WHERE id = 'mirai-tech-city-kobe-2026';
