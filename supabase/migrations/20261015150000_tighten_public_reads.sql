-- Public-repo audit 2026-10-15: two tables were readable by anonymous visitors.
--   settings            (admin key/value store; was "Anyone can view settings")
--   notification_routes (Telegram chat ids per village; was "Anyone can view notification routes")
-- Readers are the Admin page (admins), the bot managers (village hosts), stay applicants
-- (signed in) and edge functions (service role, which bypasses RLS), so nothing public needs them.
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Admins can view settings" ON public.settings
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view notification routes" ON public.notification_routes;
CREATE POLICY "Signed-in users can view notification routes" ON public.notification_routes
  FOR SELECT TO authenticated USING (true);
