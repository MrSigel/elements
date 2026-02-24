-- Allow OBS browser (anon key) to read widget_snapshots for Realtime subscriptions.
-- Without this, the overlay never receives live updates because RLS blocks anon SELECT.
create policy widget_snapshots_public_read on widget_snapshots
  for select using (true);
