
CREATE OR REPLACE FUNCTION public.go_music_my_play_usage() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
declare v_uid uuid; v_count integer; v_sub boolean; v_day date;
begin
 v_uid := (select auth.uid()); if v_uid is null then raise exception 'authentication_required' using errcode='42501';end if;
 v_day := (now() at time zone 'Asia/Tehran')::date;
 select count(distinct track_id) into v_count from public.go_music_play_events where user_id=v_uid and played_day=v_day;
 select exists(select 1 from public.go_music_entitlements where user_id=v_uid and status='active' and valid_from<=now() and valid_until>now()) into v_sub;
 return jsonb_build_object('daily_limit',5,'unique_played',v_count,'remaining',case when v_sub then null else greatest(0,5-v_count) end,'subscription_active',v_sub,'timezone','Asia/Tehran');
end $function$;
CREATE OR REPLACE FUNCTION public.go_music_request_play(p_track_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
declare v_uid uuid; v_url text; v_today date; v_has_subscription boolean; v_already_played boolean; v_distinct_count integer;
begin
 v_uid := (select auth.uid());if v_uid is null then raise exception 'authentication_required' using errcode='42501';end if;
 select t.file_url into v_url from public.go_music_tracks t join public.go_works w on w.id=t.go_work_id where t.id=p_track_id and t.status='published' and w.status='published';
 if v_url is null then return jsonb_build_object('allowed',false,'reason','not_available');end if;
 v_today := (now() at time zone 'Asia/Tehran')::date;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_uid::text||':'||v_today::text,0));
 select exists(select 1 from public.go_music_entitlements e where e.user_id=v_uid and e.status='active' and e.valid_from<=now() and e.valid_until>now()) into v_has_subscription;
 select exists(select 1 from public.go_music_play_events pe where pe.user_id=v_uid and pe.played_day=v_today and pe.track_id=p_track_id) into v_already_played;
 select count(distinct pe.track_id) into v_distinct_count from public.go_music_play_events pe where pe.user_id=v_uid and pe.played_day=v_today;
 if not v_has_subscription and not v_already_played and v_distinct_count>=5 then return jsonb_build_object('allowed',false,'reason','subscription_required','daily_limit',5,'unique_played',v_distinct_count,'remaining',0,'timezone','Asia/Tehran');end if;
 insert into public.go_music_play_events(user_id,track_id,played_day,was_subscribed) values(v_uid,p_track_id,v_today,v_has_subscription);
 if not v_already_played then v_distinct_count:=v_distinct_count+1;end if;
 return jsonb_build_object('allowed',true,'url',v_url,'daily_limit',5,'unique_played',v_distinct_count,'remaining',case when v_has_subscription then null else greatest(0,5-v_distinct_count) end,'subscription_active',v_has_subscription,'timezone','Asia/Tehran');
end $function$;
