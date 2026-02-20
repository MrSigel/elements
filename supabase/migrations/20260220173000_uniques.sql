-- supabase/migrations/20260220173000_uniques.sql
alter table bonushunts add constraint bonushunts_channel_overlay_unique unique (channel_id, overlay_id);
alter table tournaments add constraint tournaments_channel_overlay_name_unique unique (channel_id, overlay_id, name);
alter table wheels add constraint wheels_channel_overlay_title_unique unique (channel_id, overlay_id, title);
alter table wagers add constraint wagers_overlay_unique unique (overlay_id);
