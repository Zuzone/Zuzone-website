-- Tighten row-level security found open during the 2026-10-31 review.
-- The service role bypasses RLS, so "Service role full access" policies granted to `public`
-- only opened these tables to everyone (anon included). Drop them and keep the reads the app needs.

-- Telegram bot state: service role only.
drop policy if exists "Service role full access" on public.pending_villages;

-- Donation log: service role writes; admins read it on the Admin page.
drop policy if exists "Service role full access" on public.notified_donations;
create policy "Admins can view notified donations" on public.notified_donations
  for select to authenticated using (public.is_admin(auth.uid()));

-- Telegram subscriptions for stays: service role writes; the stay owner and village hosts read.
drop policy if exists "Service role full access" on public.stay_notifications;
create policy "Stay owners and hosts can view stay notifications" on public.stay_notifications
  for select to authenticated using (exists (
    select 1 from public.stays s
    where s.id = stay_notifications.stay_id
      and (s.user_id = auth.uid() or public.is_village_host(auth.uid(), s.village_id))
  ));

-- Referrals are written by use_invitation_code (security definer), never by clients.
drop policy if exists "Service role can insert referrals" on public.referrals;

-- Application answers: only the owner of the stay can add answers to it.
drop policy if exists "Authenticated users can insert answers" on public.stay_application_answers;
create policy "Stay owners can insert answers" on public.stay_application_answers
  for insert to authenticated with check (exists (
    select 1 from public.stays s
    where s.id = stay_application_answers.stay_id and s.user_id = auth.uid()
  ));

-- Spot images: signed-in users upload; only the uploader changes or deletes.
drop policy if exists "Anyone can upload spot images" on storage.objects;
drop policy if exists "Anyone can update spot images" on storage.objects;
drop policy if exists "Anyone can delete spot images" on storage.objects;
create policy "Signed-in users can upload spot images" on storage.objects
  for insert to authenticated with check (bucket_id = 'spot-images');
create policy "Uploaders can update spot images" on storage.objects
  for update to authenticated using (bucket_id = 'spot-images' and owner = auth.uid());
create policy "Uploaders can delete spot images" on storage.objects
  for delete to authenticated using (bucket_id = 'spot-images' and owner = auth.uid());

-- Village thumbnails: any signed-in user could replace or delete any thumbnail.
drop policy if exists "Hosts can update village thumbnails" on storage.objects;
drop policy if exists "Hosts can delete village thumbnails" on storage.objects;
create policy "Uploaders or admins can update village thumbnails" on storage.objects
  for update to authenticated using (bucket_id = 'village-thumbnails' and (owner = auth.uid() or public.is_admin(auth.uid())));
create policy "Uploaders or admins can delete village thumbnails" on storage.objects
  for delete to authenticated using (bucket_id = 'village-thumbnails' and (owner = auth.uid() or public.is_admin(auth.uid())));

-- create_notification is only called from triggers; clients could use it to forge notifications.
revoke execute on function public.create_notification(uuid, uuid, text, text, text, text, text, jsonb) from public, anon, authenticated;
