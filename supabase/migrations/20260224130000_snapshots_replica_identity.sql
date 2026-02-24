-- Without REPLICA IDENTITY FULL, Supabase Realtime UPDATE events only
-- include the primary key — not the state column. The OBS overlay would
-- receive empty payloads and never update. This fixes that.
alter table widget_snapshots replica identity full;
