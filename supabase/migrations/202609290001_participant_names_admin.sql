-- Apply after the recovery migration. Existing participants and scores are preserved.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter table public.anonymous_sessions add column if not exists display_name text;
do $$
begin
 if not exists (select 1 from pg_constraint where conrelid='public.anonymous_sessions'::regclass and conname='anonymous_sessions_display_name_len') then
  alter table public.anonymous_sessions add constraint anonymous_sessions_display_name_len
   check (display_name is null or char_length(display_name) between 2 and 40);
 end if;
end;$$;

create or replace function public.set_participant_name(p_session uuid, p_name text) returns text
language plpgsql security invoker set search_path=public as $$
declare normalized text;
begin
 if p_name is null or p_name ~ '[[:cntrl:]]' then raise exception 'invalid_name'; end if;
 normalized := regexp_replace(btrim(p_name), ' +', ' ', 'g');
 if char_length(normalized) not between 2 and 40 then raise exception 'invalid_name'; end if;
 update anonymous_sessions set display_name=normalized, last_seen_at=now() where session_id=p_session;
 if not found then raise exception 'session_not_found'; end if;
 return normalized;
end;$$;

create or replace function public.admin_results(p_version text, p_participant_limit integer default 500, p_practice_limit integer default 1000) returns jsonb
language plpgsql stable security invoker set search_path=public as $$
begin
 if p_participant_limit is null or p_practice_limit is null or p_participant_limit not between 1 and 50000 or p_practice_limit not between 1 and 50000 then
  raise exception 'invalid_limit';
 end if;
 return (
  with participants as (
   select s.session_id, s.display_name, b.total_score btotal, a.total_score atotal,
    a.created_at >= b.created_at paired,
    greatest(b.created_at,a.created_at) last_at,
    jsonb_build_object(
     'shortId',left(s.session_id::text,6), 'name',s.display_name,
     'before',case when b.id is null then null else jsonb_build_object('total',b.total_score,'vocabulary',b.vocabulary_score,'grammar',b.grammar_score,'speaking',b.speaking_score,'writing',b.writing_score,'at',b.created_at) end,
     'after',case when a.id is null then null else jsonb_build_object('total',a.total_score,'vocabulary',a.vocabulary_score,'grammar',a.grammar_score,'speaking',a.speaking_score,'writing',a.writing_score,'at',a.created_at) end,
     'difference',case when a.created_at >= b.created_at then round(a.total_score-b.total_score,1) else null end,
     'lastActivityAt',greatest(b.created_at,a.created_at)
    ) item
   from anonymous_sessions s
   left join assessments b on b.session_id=s.session_id and b.assessment_type='before' and b.version=p_version
   left join assessments a on a.session_id=s.session_id and a.assessment_type='after' and a.version=p_version
   where b.id is not null or a.id is not null
  ), participant_page as (
   select item,last_at,session_id from participants order by last_at desc,session_id limit p_participant_limit
  ), practice_page as (
   select q.completed_at,q.id,jsonb_build_object(
    'shortId',left(q.session_id::text,6),'name',s.display_name,'level',q.level,'category',q.category,
    'correct',q.correct_answers,'total',q.total_questions,'percentage',q.score_percentage,'completedAt',q.completed_at
   ) item
   from quiz_sessions q join anonymous_sessions s on s.session_id=q.session_id
   order by q.completed_at desc,q.id limit p_practice_limit
  ), totals as (select count(*) n from quiz_sessions)
  select jsonb_build_object(
   'summary', (select jsonb_build_object(
    'participants',count(*),'named',count(display_name),'pairs',count(*) filter (where paired),
    'before',round(avg(btotal) filter (where paired),1),'after',round(avg(atotal) filter (where paired),1),
    'difference',round(avg(atotal-btotal) filter (where paired),1),'practiceSessions',(select n from totals)
   ) from participants),
   'participants',coalesce((select jsonb_agg(item order by last_at desc,session_id) from participant_page),'[]'::jsonb),
   'practice',coalesce((select jsonb_agg(item order by completed_at desc,id) from practice_page),'[]'::jsonb),
   'truncated',jsonb_build_object('participants',(select count(*)>p_participant_limit from participants),'practice',(select n>p_practice_limit from totals))
  )
 );
end;$$;

revoke execute on function public.set_participant_name(uuid,text),public.admin_results(text,integer,integer) from public,anon,authenticated;
grant execute on function public.set_participant_name(uuid,text),public.admin_results(text,integer,integer) to service_role;
notify pgrst, 'reload schema';
commit;
