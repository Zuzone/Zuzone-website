-- Official X accounts for villages that had none or linked a person instead of the city
-- (researched 2026-09-08 from official sites / Luma pages). Feeds ZuThread.
UPDATE public.villages SET twitter_url = 'https://x.com/ns'             WHERE id = 'network-school-learn-burn-and-earn';
UPDATE public.villages SET twitter_url = 'https://x.com/frontiertower'  WHERE id = 'frontier-tower';
UPDATE public.villages SET twitter_url = 'https://x.com/zucity_japan'   WHERE id IN ('zucity-popup-2026-annual-popup-city-in-komoro-nagano', 'zucity-japan-march-2026');
UPDATE public.villages SET twitter_url = 'https://x.com/VotC2026'       WHERE id = 'valley-of-the-commons';
UPDATE public.villages SET twitter_url = 'https://x.com/AmagiLife'      WHERE id = 'amagi-life-villages-for-the-future';
UPDATE public.villages SET twitter_url = 'https://x.com/ETHChiangmai'   WHERE id = 'ethchiangmai-2025';
UPDATE public.villages SET twitter_url = 'https://x.com/infinitacity'   WHERE id = 'infinita-city-2026';
UPDATE public.villages SET twitter_url = 'https://x.com/ipecity'        WHERE id = 'ipe-village-2026';
UPDATE public.villages SET twitter_url = 'https://x.com/zuafrique'      WHERE id = 'zuafrique-2026';
UPDATE public.villages SET twitter_url = 'https://x.com/zuzalukas'      WHERE id = 'zukas-2026';
UPDATE public.villages SET twitter_url = 'https://x.com/shanhaiwoo'     WHERE id = 'shanhaiwoo-singapore-2026';
UPDATE public.villages SET twitter_url = 'https://x.com/joinedgecity'   WHERE id = 'edgecity-goa-2026';
UPDATE public.villages SET twitter_url = 'https://x.com/prosperaglobal' WHERE id = 'pr-spera';        -- was a personal account
UPDATE public.villages SET twitter_url = 'https://x.com/JoinFutura'     WHERE id = 'futura-camp-2026-x-zuberlin'; -- was the 2024 ZuBerlin account
UPDATE public.villages SET twitter_url = NULL                           WHERE id = 'cosmo-local-cnx-join-us-september-2026-cosmo-local-cnx'; -- was an xmlrpc link
