-- The comments table existed in the original Lovable Cloud database but was never
-- captured in migrations (two later migrations note this as a "temporary fix").
-- Recreated here from the generated types + client usage so a fresh project can
-- apply the later trigger (20260508034233) and the app's useComments hook works.
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spot_id uuid NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  parent_id uuid NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_spot_id_idx ON public.comments(spot_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- Comments carry a free-text author_name and the app allows visitors to post them.
CREATE POLICY "Anyone can create comments" ON public.comments
  FOR INSERT WITH CHECK (char_length(content) BETWEEN 1 AND 2000 AND char_length(author_name) BETWEEN 1 AND 80);

-- Comments have no user_id, so deletion is limited to the hosts of the spot's village.
CREATE POLICY "Hosts can delete comments" ON public.comments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.spots s
      WHERE s.id = comments.spot_id
        AND s.village_id IS NOT NULL
        AND public.is_village_host(auth.uid(), s.village_id)
    )
  );
