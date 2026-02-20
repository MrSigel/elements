-- supabase/migrations/20260220162000_event_rpc.sql
create or replace function apply_widget_event(
  p_channel_id uuid,
  p_overlay_id uuid,
  p_widget_instance_id uuid,
  p_widget_type widget_kind,
  p_event_type text,
  p_payload jsonb,
  p_actor_id uuid
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_event_id uuid;
begin
  insert into widget_events (
    channel_id, overlay_id, widget_instance_id, widget_type, event_type, payload, actor_id
  ) values (
    p_channel_id, p_overlay_id, p_widget_instance_id, p_widget_type, p_event_type, p_payload, p_actor_id
  ) returning id into v_event_id;

  insert into widget_snapshots (
    channel_id, overlay_id, widget_instance_id, widget_type, state, updated_at
  ) values (
    p_channel_id, p_overlay_id, p_widget_instance_id, p_widget_type, p_payload, now()
  )
  on conflict (overlay_id, widget_instance_id)
  do update set state = excluded.state, updated_at = now();

  insert into audit_logs (channel_id, actor_id, action, metadata)
  values (p_channel_id, p_actor_id, p_event_type, jsonb_build_object('widget_type', p_widget_type, 'event_id', v_event_id));

  return v_event_id;
end;
$$;

