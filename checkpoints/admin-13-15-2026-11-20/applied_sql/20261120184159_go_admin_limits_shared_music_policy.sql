-- GO #13 / #14. One server-owned policy and distinct-work ledger for all music paths.
create table go_private.member_limits (
 user_id uuid primary key references auth.users(id) on delete cascade,
 music_mode text not null default 'inherit' check(music_mode in ('inherit','limited','unlimited')),
 music_limit integer not null default 5 check(music_limit between 0 and 100000),
 movies integer check(movies between 0 and 100000), music integer check(music between 0 and 100000), books integer check(books between 0 and 100000),
 downloads boolean, revision integer not null default 0, updated_at timestamptz not null default now()
);
alter table go_private.member_limits enable row level security;
create table go_private.limit_audit(request_id uuid primary key,actor_id uuid not null,target_id uuid not null,previous jsonb not null,next jsonb not null,reason text not null,created_at timestamptz not null default now());
alter table go_private.limit_audit enable row level security;
create table go_private.music_daily_works(user_id uuid not null references auth.users(id) on delete cascade,day_key date not null,work_key text not null,created_at timestamptz not null default now(),primary key(user_id,day_key,work_key));
alter table go_private.music_daily_works enable row level security;
create table go_private.music_server_entitlements(user_id uuid primary key references auth.users(id) on delete cascade,valid_until timestamptz not null,downloads boolean not null);
alter table go_private.music_server_entitlements enable row level security;
create function go_private.music_policy(p_user uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a boolean; r bigint; sub boolean; dl boolean; l go_private.member_limits; cap integer; src text;
begin
 select exists(select 1 from public.user_roles where user_id=p_user and role='admin') into a;
 select room_number into r from go_private.room_allocations where user_id=p_user;
 select exists(select 1 from public.go_music_entitlements where user_id=p_user and status='active' and valid_from<=now() and valid_until>now()),exists(select 1 from public.go_music_entitlements where user_id=p_user and status='active' and valid_from<=now() and valid_until>now() and plan_code in ('quarterly','half-year','yearly','3_month','6_month','12_month')) into sub,dl;
 sub:=sub or exists(select 1 from go_private.music_server_entitlements where user_id=p_user and valid_until>now());
 dl:=dl or exists(select 1 from go_private.music_server_entitlements where user_id=p_user and valid_until>now() and downloads);
 select * into l from go_private.member_limits where user_id=p_user;
 src:=case when a then 'admin' when r between 1 and 50 then 'room_1_50' when sub then 'subscription' else 'free' end;
 cap:=case when a or r between 1 and 50 or sub then null else 5 end;
 if not a and coalesce(l.music_mode,'inherit')!='inherit' then cap:=case when l.music_mode='unlimited' then null else l.music_limit end;src:='admin_override';end if;
 return jsonb_build_object('isAdmin',a,'roomNumber',r,'subscription',sub,'limit',cap,'unlimited',cap is null,'source',src,'downloads',coalesce(l.downloads,dl),'overrides',coalesce(to_jsonb(l),'{"music_mode":"inherit","music_limit":5,"revision":0}'::jsonb),'timezone','Asia/Tehran');
end $$;
create function go_private.music_usage(p_user uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare p jsonb; used integer; cap integer;
begin
 p:=go_private.music_policy(p_user);cap:=(p->>'limit')::integer;
 select count(*) into used from (select work_key from go_private.music_daily_works where user_id=p_user and day_key=(now() at time zone 'Asia/Tehran')::date union select 'library:'||track_id::text from public.go_music_play_events where user_id=p_user and played_day=(now() at time zone 'Asia/Tehran')::date) s;
 return p||jsonb_build_object('used',used,'remaining',case when cap is null then null else greatest(0,cap-used) end,'daily_limit',coalesce(cap,0),'unique_played',used,'subscription_active',(p->>'subscription')::boolean,'resetAt',extract(epoch from (((now() at time zone 'Asia/Tehran')::date+1)::timestamp at time zone 'Asia/Tehran'))*1000);
end $$;
create function go_private.reserve_music(p_user uuid,p_work text) returns jsonb language plpgsql security definer set search_path='' as $$
declare u jsonb; cap integer; seen boolean; today date:=(now() at time zone 'Asia/Tehran')::date;
begin
 if not exists(select 1 from auth.users where id=p_user) or exists(select 1 from go_private.member_deletions where target_id=p_user) or exists(select 1 from public.go_member_controls where user_id=p_user and status!='active') then raise exception 'account_access_denied';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text||':'||today::text,0));
 u:=go_private.music_usage(p_user);cap:=(u->>'limit')::integer;
 select exists(select 1 from go_private.music_daily_works where user_id=p_user and day_key=today and work_key=p_work) or exists(select 1 from public.go_music_play_events where user_id=p_user and played_day=today and 'library:'||track_id::text=p_work) into seen;
 if cap=0 or (not seen and cap is not null and (u->>'used')::integer>=cap) then return u||jsonb_build_object('allowed',false,'reason','subscription_required');end if;
 insert into go_private.music_daily_works(user_id,day_key,work_key) values(p_user,today,p_work) on conflict do nothing;
 return go_private.music_usage(p_user)||jsonb_build_object('allowed',true,'reason','ready');
end $$;
create function public.go_my_limits() returns jsonb language plpgsql security definer set search_path='' as $$ begin if auth.uid() is null then raise exception 'authentication_required';end if;return go_private.music_usage(auth.uid());end $$;
-- Only the GO server can import its historical D1 reservations. Never trust browser counts.
create function public.go_server_music_reserve(p_key text,p_work text,p_history jsonb default '[]',p_entitlement jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare item jsonb; today date:=(now() at time zone 'Asia/Tehran')::date;
begin
 if auth.uid() is null or not exists(select 1 from go_private.room_number_policy where id=1 and sync_key_hash=sha256(convert_to(p_key,'UTF8'))) then raise exception 'music_server_denied';end if;
 if length(p_work)>160 or length(p_work)<1 or jsonb_typeof(p_history)!='array' or jsonb_array_length(p_history)>10000 then raise exception 'invalid_request';end if;
 if p_entitlement is not null then
 insert into go_private.music_server_entitlements values(auth.uid(),to_timestamp((p_entitlement->>'validUntil')::numeric/1000),(p_entitlement->>'downloads')::boolean) on conflict(user_id) do update set valid_until=excluded.valid_until,downloads=excluded.downloads;
 else delete from go_private.music_server_entitlements where user_id=auth.uid();end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':'||today::text,0));
 for item in select value from jsonb_array_elements(p_history) loop
 if jsonb_typeof(item)!='string' or length(item#>>'{}')>160 then raise exception 'invalid_history';end if;
 insert into go_private.music_daily_works(user_id,day_key,work_key) values(auth.uid(),today,item#>>'{}') on conflict do nothing;
 end loop;
 if p_work='__usage__' then return go_private.music_usage(auth.uid());end if;
 return go_private.reserve_music(auth.uid(),p_work);
end $$;
create function public.go_admin_member_limits(p_user uuid) returns jsonb language plpgsql security definer set search_path='' as $$ begin perform go_private.assert_admin();if not exists(select 1 from auth.users where id=p_user) then raise exception 'user_not_found';end if; return go_private.music_usage(p_user)||jsonb_build_object('history',coalesce((select jsonb_agg(to_jsonb(x)) from (select * from go_private.limit_audit where target_id=p_user order by created_at desc limit 20)x),'[]'::jsonb));end $$;
create function public.go_admin_save_limits(p_user uuid,p_revision integer,p_request uuid,p_limits jsonb,p_reason text,p_confirm_reduction boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare prev jsonb; oldcap integer; newcap integer; nxt jsonb; replay go_private.limit_audit;
begin
 perform go_private.assert_admin();
 if not (p_limits ?& array['music_mode','music_limit']) or p_limits->>'music_mode' is null or p_limits->>'music_limit' is null or length(trim(p_reason))<3 or length(p_reason)>500 or p_limits->>'music_mode' not in ('inherit','limited','unlimited') or (p_limits->>'music_limit')::integer not between 0 and 100000 or (p_limits-'music_mode'-'music_limit'-'movies'-'music'-'books'-'downloads')!='{}'::jsonb then raise exception 'invalid_limits';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,91));
 select * into replay from go_private.limit_audit where request_id=p_request;
 if found then if replay.actor_id!=auth.uid() or replay.target_id!=p_user or replay.next!=p_limits or replay.reason!=p_reason then raise exception 'request_conflict';end if;return public.go_admin_member_limits(p_user);end if;
 prev:=go_private.music_usage(p_user);oldcap:=(prev->>'limit')::integer;
 if coalesce((prev->'overrides'->>'revision')::integer,0)!=p_revision then raise exception 'limits_conflict';end if;
 insert into go_private.member_limits(user_id,music_mode,music_limit,movies,music,books,downloads,revision) values(p_user,p_limits->>'music_mode',(p_limits->>'music_limit')::integer,(p_limits->>'movies')::integer,(p_limits->>'music')::integer,(p_limits->>'books')::integer,(p_limits->>'downloads')::boolean,p_revision+1) on conflict(user_id) do update set music_mode=excluded.music_mode,music_limit=excluded.music_limit,movies=excluded.movies,music=excluded.music,books=excluded.books,downloads=excluded.downloads,revision=excluded.revision,updated_at=now();
 nxt:=go_private.music_policy(p_user);newcap:=(nxt->>'limit')::integer;
 if not p_confirm_reduction and ((newcap is not null and (oldcap is null or newcap<oldcap)) or (p_limits->>'downloads')='false' or (p_limits->>'movies')::integer is not null or (p_limits->>'music')::integer is not null or (p_limits->>'books')::integer is not null) then raise exception 'reduction_confirmation_required';end if;
 insert into go_private.limit_audit values(p_request,auth.uid(),p_user,prev,p_limits,p_reason,now());
 insert into public.go_admin_audit(actor_id,target_id,action,reason) values(auth.uid(),p_user,'limits_updated',p_reason);
 return public.go_admin_member_limits(p_user);
end $$;
create or replace function public.go_music_my_play_usage() returns jsonb language plpgsql security definer set search_path='' as $$ begin if auth.uid() is null then raise exception 'authentication_required';end if;return go_private.music_usage(auth.uid());end $$;
create or replace function public.go_music_request_play(p_track_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u jsonb; v_url text;
begin
 if auth.uid() is null then raise exception 'authentication_required';end if;
 select t.file_url into v_url from public.go_music_tracks t join public.go_works w on w.id=t.go_work_id where t.id=p_track_id and t.status='published' and w.status='published';
 if v_url is null then return jsonb_build_object('allowed',false,'reason','not_available');end if;
 u:=go_private.reserve_music(auth.uid(),'library:'||p_track_id::text);
 if not (u->>'allowed')::boolean then return u;end if;
 insert into public.go_music_play_events(user_id,track_id,played_day,was_subscribed) values(auth.uid(),p_track_id,(now() at time zone 'Asia/Tehran')::date,(u->>'subscription')::boolean);
 return u||jsonb_build_object('url',v_url);
end $$;
revoke all on function go_private.music_policy(uuid) from public,anon,authenticated;
revoke all on function go_private.music_usage(uuid) from public,anon,authenticated;
revoke all on function go_private.reserve_music(uuid,text) from public,anon,authenticated;
revoke all on function public.go_my_limits() from public,anon;
grant execute on function public.go_my_limits() to authenticated;
revoke all on function public.go_server_music_reserve(text,text,jsonb,jsonb) from public,anon;
grant execute on function public.go_server_music_reserve(text,text,jsonb,jsonb) to authenticated;
revoke all on function public.go_admin_member_limits(uuid) from public,anon;
grant execute on function public.go_admin_member_limits(uuid) to authenticated;
revoke all on function public.go_admin_save_limits(uuid,integer,uuid,jsonb,text,boolean) from public,anon;
grant execute on function public.go_admin_save_limits(uuid,integer,uuid,jsonb,text,boolean) to authenticated;
