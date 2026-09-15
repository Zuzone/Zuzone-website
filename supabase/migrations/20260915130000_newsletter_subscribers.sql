-- Newsletter signups from the home page (2026-09-15).
-- Written only by the edge worker with the service role; no public policies, so the list is
-- never readable or writable from the browser.
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  CONSTRAINT newsletter_subscribers_email_lowercase CHECK (email = lower(email)),
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.newsletter_subscribers IS 'Newsletter signups. Active list: WHERE unsubscribed_at IS NULL.';
