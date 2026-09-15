-- Track forwarding of newsletter signups to the Zuzone Luma calendar (2026-09-15).
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS luma_synced_at timestamptz;
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS luma_error text;
COMMENT ON COLUMN public.newsletter_subscribers.luma_synced_at IS 'When this address was imported into the Luma calendar; NULL = not yet.';
