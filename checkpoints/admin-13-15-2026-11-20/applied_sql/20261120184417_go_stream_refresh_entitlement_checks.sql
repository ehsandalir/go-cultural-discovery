create function public.go_server_music_stream(p_key text,p_user uuid,p_work text,p_track uuid default null,p_download boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare u jsonb; today date:=(now() at time zone 'Asia/Tehran')::date; source text; cap integer;
begin
 if not exists(select 1 from go_private.room_number_policy where id=1 and sync_key_hash=sha256(convert_to(p_key,'UTF8'))) then raise exception 'stream_denied';end if;
 if not exists(select 1 from auth.users where id=p_user) or exists(select 1 from go_private.member_deletions where target_id=p_user) or exists(select 1 from public.go_member_controls where user_id=p_user and status!='active') then return jsonb_build_object('allowed',false);end if;
 u:=go_private.music_policy(p_user);cap:=(u->>'limit')::integer;
 if p_download then
 if not (u->>'downloads')::boolean then return jsonb_build_object('allowed',false);end if;
 elsif cap=0 or not (exists(select 1 from go_private.music_daily_works where user_id=p_user and day_key=today and work_key=p_work) or exists(select 1 from public.go_music_play_events where user_id=p_user and played_day=today and 'library:'||track_id::text=p_work)) then return jsonb_build_object('allowed',false);end if;
 if p_track is not null then
 if p_work!='library:'||p_track::text then return jsonb_build_object('allowed',false);end if;
 select t.file_url into source from public.go_music_tracks t join public.go_works w on w.id=t.go_work_id where t.id=p_track and t.status='published' and w.status='published';
 if source is null then return jsonb_build_object('allowed',false);end if;
 end if;
 return jsonb_build_object('allowed',true,'url',source);
end $$;
revoke all on function public.go_server_music_stream(text,uuid,text,uuid,boolean) from public;
grant execute on function public.go_server_music_stream(text,uuid,text,uuid,boolean) to anon,authenticated;
