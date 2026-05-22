DROP POLICY IF EXISTS "Authenticated users can create villages" ON public.villages;
CREATE POLICY "Anyone can create villages" ON public.villages FOR INSERT WITH CHECK (true);