-- supabase/migrations/20260222000000_aggregated_snapshots.sql
-- Replace apply_widget_event RPC so it stores aggregated state instead of raw payload.

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
  v_state    jsonb := '{}'::jsonb;
  v_hunt_id       uuid;
  v_tournament_id uuid;
  v_battle_id     uuid;
  v_wheel_id      uuid;
  v_pb_id         uuid;
begin
  -- 1. Persist the raw event for audit / replay
  insert into widget_events (
    channel_id, overlay_id, widget_instance_id, widget_type, event_type, payload, actor_id
  ) values (
    p_channel_id, p_overlay_id, p_widget_instance_id, p_widget_type, p_event_type, p_payload, p_actor_id
  ) returning id into v_event_id;

  -- 2. Compute aggregated state from the live tables
  --    (applyWidgetSideEffects in the API has already written to the domain tables)

  if p_widget_type = 'wager_bar' then
    select jsonb_build_object('value', coalesce(value, 0))
    into v_state
    from wagers
    where overlay_id = p_overlay_id
    limit 1;

  elsif p_widget_type = 'current_playing' then
    select jsonb_build_object(
      'game_name',       game_name,
      'game_identifier', game_identifier,
      'provider',        provider
    )
    into v_state
    from current_playing
    where channel_id = p_channel_id
    limit 1;

  elsif p_widget_type = 'deposit_withdrawal' then
    select jsonb_build_object(
      'tx_type',            t.tx_type,
      'amount',             t.amount,
      'source',             t.source,
      'total_deposits',     coalesce((select sum(amount) from transactions where channel_id = p_channel_id and tx_type = 'deposit'),    0),
      'total_withdrawals',  coalesce((select sum(amount) from transactions where channel_id = p_channel_id and tx_type = 'withdrawal'), 0),
      'balance',            coalesce((select sum(case when tx_type = 'deposit' then amount else -amount end) from transactions where channel_id = p_channel_id), 0)
    )
    into v_state
    from transactions t
    where t.channel_id = p_channel_id
    order by t.created_at desc
    limit 1;

  elsif p_widget_type = 'bonushunt' then
    select id into v_hunt_id
    from bonushunts
    where channel_id = p_channel_id and overlay_id = p_overlay_id
    order by updated_at desc
    limit 1;

    if v_hunt_id is not null then
      select jsonb_build_object(
        'title',        h.title,
        'status',       h.status,
        'total',        (select count(*)                                      from bonushunt_entries where bonushunt_id = h.id),
        'opened',       (select count(*)                                      from bonushunt_entries where bonushunt_id = h.id and opened = true),
        'total_buyins', (select coalesce(sum(bet), 0)                         from bonushunt_entries where bonushunt_id = h.id),
        'total_win',    (select coalesce(sum(result_win), 0)                  from bonushunt_entries where bonushunt_id = h.id and opened = true),
        'best_x',       (select coalesce(max(result_multiplier), 0)           from bonushunt_entries where bonushunt_id = h.id and opened = true),
        'biggest_win',  (select coalesce(max(result_win), 0)                  from bonushunt_entries where bonushunt_id = h.id and opened = true),
        'entries', (
          select coalesce(
            jsonb_agg(
              jsonb_build_object(
                'slot_name',   e.slot_name,
                'provider',    coalesce(e.provider, ''),
                'bet',         e.bet,
                'cost',        e.cost,
                'opened',      e.opened,
                'win',         coalesce(e.result_win, 0),
                'multiplier',  coalesce(e.result_multiplier, 0)
              ) order by e.created_at
            ), '[]'::jsonb)
          from bonushunt_entries e
          where e.bonushunt_id = h.id
        )
      )
      into v_state
      from bonushunts h
      where h.id = v_hunt_id;
    end if;

  elsif p_widget_type = 'tournament' then
    select id into v_tournament_id
    from tournaments
    where channel_id = p_channel_id and overlay_id = p_overlay_id
    order by created_at desc
    limit 1;

    if v_tournament_id is not null then
      select jsonb_build_object(
        'name', t.name,
        'standings', (
          select coalesce(
            jsonb_agg(
              jsonb_build_object('participant', ts.participant, 'score', ts.score)
              order by ts.score desc
            ), '[]'::jsonb)
          from tournament_scores ts
          where ts.tournament_id = t.id
        )
      )
      into v_state
      from tournaments t
      where t.id = v_tournament_id;
    end if;

  elsif p_widget_type = 'slot_battle' then
    select id into v_battle_id
    from slot_battles
    where channel_id = p_channel_id and overlay_id = p_overlay_id
    order by created_at desc
    limit 1;

    if v_battle_id is not null then
      select jsonb_build_object(
        'slot_a',    slot_a,
        'slot_b',    slot_b,
        'round',     round,
        'score_a',   score_a,
        'score_b',   score_b,
        'status',    status,
        'stage',     'Stage ' || round::text
      )
      into v_state
      from slot_battles
      where id = v_battle_id;
    end if;

  elsif p_widget_type = 'slot_requests' then
    select jsonb_build_object(
      'requests', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'slot_name', sr.slot_name,
              'username',  sr.twitch_user_id,
              'status',    sr.status
            ) order by sr.created_at desc
          ), '[]'::jsonb)
        from slot_requests sr
        where sr.channel_id = p_channel_id and sr.status = 'open'
      ),
      'winner', (
        select jsonb_build_object(
          'slot_name', sr.slot_name,
          'username',  sr.twitch_user_id
        )
        from raffles r
        join slot_requests sr on sr.id = r.winner_request_id
        where r.channel_id = p_channel_id
        order by r.created_at desc
        limit 1
      )
    )
    into v_state;

  elsif p_widget_type = 'hot_words' then
    select jsonb_build_object(
      'words', (
        select coalesce(
          jsonb_agg(sub.obj order by sub.hit_count desc),
          '[]'::jsonb
        )
        from (
          select
            jsonb_build_object('phrase', hw.phrase, 'count', count(hwo.id)) as obj,
            count(hwo.id) as hit_count
          from hot_words hw
          left join hot_word_occurrences hwo on hwo.hot_word_id = hw.id
          where hw.channel_id = p_channel_id
          group by hw.id, hw.phrase
        ) sub
      )
    )
    into v_state;

  elsif p_widget_type = 'wheel' then
    select id into v_wheel_id
    from wheels
    where channel_id = p_channel_id and overlay_id = p_overlay_id
    order by created_at desc
    limit 1;

    if v_wheel_id is not null then
      select jsonb_build_object(
        'segments',     w.segments,
        'result',       (select result->>'value' from wheel_spins where wheel_id = w.id order by created_at desc limit 1),
        'result_index', (select (result->>'index')::int from wheel_spins where wheel_id = w.id order by created_at desc limit 1)
      )
      into v_state
      from wheels w
      where w.id = v_wheel_id;
    end if;

  elsif p_widget_type = 'personal_bests' then
    select jsonb_build_object(
      'metrics', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object('metric_key', pb.metric_key, 'metric_value', pb.metric_value)
            order by pb.updated_at desc
          ), '[]'::jsonb)
        from personal_bests pb
        where pb.channel_id = p_channel_id
      )
    )
    into v_state;

  elsif p_widget_type = 'quick_guessing' then
    select jsonb_build_object(
      'open', (p_event_type = 'guessing_open'),
      'messages', (
        select coalesce(jsonb_agg(sub.obj), '[]'::jsonb)
        from (
          select jsonb_build_object('user', g.twitch_user_id, 'text', g.value::text) as obj
          from guesses g
          join bonushunts bh on bh.id = g.bonushunt_id
          where bh.channel_id = p_channel_id
          order by g.created_at desc
          limit 20
        ) sub
      )
    )
    into v_state;

  elsif p_widget_type = 'loyalty' then
    select jsonb_build_object(
      'total_points_granted', coalesce((select sum(points_delta) from points_ledger where channel_id = p_channel_id and points_delta > 0), 0),
      'store_items', (
        select coalesce(
          jsonb_agg(jsonb_build_object('name', name, 'cost', cost) order by cost),
          '[]'::jsonb)
        from store_items
        where channel_id = p_channel_id and is_active = true
      ),
      'recent_redemptions', (
        select coalesce(
          jsonb_agg(
            jsonb_build_object('user', r.twitch_user_id, 'item', si.name)
            order by r.created_at desc
          ), '[]'::jsonb)
        from (
          select twitch_user_id, store_item_id, created_at
          from redemptions
          where channel_id = p_channel_id
          order by created_at desc
          limit 5
        ) r
        join store_items si on si.id = r.store_item_id
      )
    )
    into v_state;

  elsif p_widget_type = 'points_battle' then
    select id into v_pb_id
    from points_battles
    where channel_id = p_channel_id and overlay_id = p_overlay_id
    order by created_at desc
    limit 1;

    if v_pb_id is not null then
      select jsonb_build_object(
        'team_a',    pb.team_a,
        'team_b',    pb.team_b,
        'entry_cost', pb.entry_cost,
        'status',    pb.status,
        'ends_at',   pb.ends_at,
        'score_a',   coalesce((select sum(points) from points_battle_entries where points_battle_id = pb.id and team = pb.team_a), 0),
        'score_b',   coalesce((select sum(points) from points_battle_entries where points_battle_id = pb.id and team = pb.team_b), 0),
        'count_a',   (select count(*) from points_battle_entries where points_battle_id = pb.id and team = pb.team_a),
        'count_b',   (select count(*) from points_battle_entries where points_battle_id = pb.id and team = pb.team_b)
      )
      into v_state
      from points_battles pb
      where pb.id = v_pb_id;
    end if;

  end if;

  -- Fallback: if state is still null, store raw payload
  if v_state is null then
    v_state := p_payload;
  end if;

  -- 3. Upsert snapshot → triggers Supabase Realtime push to overlay subscribers
  insert into widget_snapshots (
    channel_id, overlay_id, widget_instance_id, widget_type, state, updated_at
  ) values (
    p_channel_id, p_overlay_id, p_widget_instance_id, p_widget_type, v_state, now()
  )
  on conflict (overlay_id, widget_instance_id)
  do update set state = excluded.state, updated_at = now();

  -- 4. Audit log
  insert into audit_logs (channel_id, actor_id, action, metadata)
  values (p_channel_id, p_actor_id, p_event_type,
    jsonb_build_object('widget_type', p_widget_type, 'event_id', v_event_id));

  return v_event_id;
end;
$$;
