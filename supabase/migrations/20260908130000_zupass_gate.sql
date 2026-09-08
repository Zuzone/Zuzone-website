-- Add-village is now open to anyone with a Zupass, verified by the edge worker
-- (worker/src/index.mjs → POST /api/villages). The worker inserts with the service
-- role key, so the anonymous INSERT policy is no longer needed and is removed here.
--
-- After applying: set the worker secret so inserts keep working once anon is closed:
--   cd worker && npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY

ALTER TABLE public.villages
  ADD COLUMN IF NOT EXISTS zupass_public_key text;

COMMENT ON COLUMN public.villages.zupass_public_key IS
  'EdDSA public key of the Zupass identity that added this village (verified POD signature).';

DROP POLICY IF EXISTS "Anyone can create villages" ON public.villages;
