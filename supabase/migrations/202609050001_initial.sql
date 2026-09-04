-- Run once in a new Supabase project. All access is through the Next.js server.
begin;
create table public.anonymous_sessions (
 session_id uuid primary key, created_at timestamptz not null default now(), last_seen_at timestamptz not null default now()
);
create table public.quiz_sessions (
 id uuid primary key, session_id uuid not null references public.anonymous_sessions(session_id) on delete cascade,
 level text not null check(level in ('A1','A2','B1','B2')), category text not null,
 total_questions integer not null check(total_questions between 1 and 10), correct_answers integer not null check(correct_answers>=0 and correct_answers<=total_questions),
 score_percentage numeric(5,2) not null check(score_percentage between 0 and 100), completed_at timestamptz not null default now()
);
create table public.quiz_attempts (
 id bigint generated always as identity primary key, run_id uuid not null references public.quiz_sessions(id) on delete cascade,
 session_id uuid not null references public.anonymous_sessions(session_id) on delete cascade,
 question_id text not null, category text not null, is_correct boolean not null, created_at timestamptz not null default now(), unique(run_id,question_id)
);
create table public.assessments (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.anonymous_sessions(session_id) on delete cascade,
 assessment_type text not null check(assessment_type in ('before','after')), version text not null,
 vocabulary_score numeric(5,2) not null check(vocabulary_score between 0 and 100), grammar_score numeric(5,2) not null check(grammar_score between 0 and 100),
 speaking_score numeric(5,2) not null check(speaking_score between 0 and 100), writing_score numeric(5,2) not null check(writing_score between 0 and 100),
 total_score numeric(5,2) not null check(total_score between 0 and 100), created_at timestamptz not null default now(), unique(session_id,assessment_type,version)
);
create table public.ai_usage (id bigint generated always as identity primary key,session_id uuid not null references public.anonymous_sessions(session_id) on delete cascade,created_at timestamptz not null default now());
create table public.activity_events (
 id bigint generated always as identity primary key,session_id uuid not null references public.anonymous_sessions(session_id) on delete cascade,
 name text not null check(name in ('visit','practice_started','question_answered','speaking_topic_opened','prompt_copied')),detail text check(length(detail)<=80),created_at timestamptz not null default now()
);
-- Budget counters contain no messages or IP addresses. Old buckets may be deleted safely.
create table public.ai_budgets (bucket text primary key, requests integer not null default 0, expires_at timestamptz not null);
create index quiz_sessions_session_time on public.quiz_sessions(session_id,completed_at);
create index quiz_attempts_session on public.quiz_attempts(session_id);
create index assessments_session_version on public.assessments(session_id,version);
create index ai_usage_session_time on public.ai_usage(session_id,created_at);
create index activity_events_name_time on public.activity_events(name,created_at);
create index activity_events_session on public.activity_events(session_id);
alter table public.anonymous_sessions enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.assessments enable row level security;
alter table public.ai_usage enable row level security;
alter table public.activity_events enable row level security;
alter table public.ai_budgets enable row level security;
revoke all on public.anonymous_sessions,public.quiz_sessions,public.quiz_attempts,public.assessments,public.ai_usage,public.activity_events,public.ai_budgets from anon,authenticated;
grant all on public.anonymous_sessions,public.quiz_sessions,public.quiz_attempts,public.assessments,public.ai_usage,public.activity_events,public.ai_budgets to service_role;
grant usage,select on all sequences in schema public to service_role;

create function public.save_quiz(p_run uuid,p_session uuid,p_level text,p_category text,p_total integer,p_correct integer,p_score numeric,p_attempts jsonb) returns void
language plpgsql security invoker set search_path=public as $$
begin
 insert into quiz_sessions(id,session_id,level,category,total_questions,correct_answers,score_percentage)
 values(p_run,p_session,p_level,p_category,p_total,p_correct,p_score) on conflict(id) do nothing;
 if not found then return; end if;
 insert into quiz_attempts(run_id,session_id,question_id,category,is_correct)
 select p_run,p_session,x.question_id,x.category,x.is_correct from jsonb_to_recordset(p_attempts) as x(question_id text,category text,is_correct boolean);
end;$$;

create function public.save_assessment(p_session uuid,p_type text,p_version text,p_vocabulary numeric,p_grammar numeric,p_speaking numeric,p_writing numeric,p_total numeric) returns jsonb
language plpgsql security invoker set search_path=public as $$
declare existing assessments; btime timestamptz; saved assessments;
begin
 -- Serialize writes for this browser and keep first submissions immutable.
 perform 1 from anonymous_sessions where session_id=p_session for update;
 select * into existing from assessments where session_id=p_session and assessment_type=p_type and version=p_version;
 if found then return to_jsonb(existing); end if;
 if p_type='after' then
  select created_at into btime from assessments where session_id=p_session and assessment_type='before' and version=p_version;
  if btime is null then raise exception 'before_required'; end if;
  if not exists(select 1 from quiz_sessions where session_id=p_session and completed_at>btime) and not exists(select 1 from ai_usage where session_id=p_session and created_at>btime) then raise exception 'practice_required'; end if;
 end if;
 insert into assessments(session_id,assessment_type,version,vocabulary_score,grammar_score,speaking_score,writing_score,total_score)
 values(p_session,p_type,p_version,p_vocabulary,p_grammar,p_speaking,p_writing,p_total) returning * into saved;
 return to_jsonb(saved);
end;$$;

create function public.reserve_ai_request(p_session uuid) returns boolean
language plpgsql security invoker set search_path=public as $$
declare daykey text; userkey text; n integer;
begin
 daykey:='day:'||to_char(now() at time zone 'UTC','YYYY-MM-DD');
 userkey:='hour:'||p_session::text||':'||to_char(now() at time zone 'UTC','YYYY-MM-DD-HH24');
 delete from ai_budgets where expires_at<now();
 insert into ai_budgets(bucket,requests,expires_at) values(daykey,1,now()+interval '2 days') on conflict(bucket) do update set requests=ai_budgets.requests+1 returning requests into n;
 if n>150 then return false; end if;
 insert into ai_budgets(bucket,requests,expires_at) values(userkey,1,now()+interval '2 hours') on conflict(bucket) do update set requests=ai_budgets.requests+1 returning requests into n;
 return n<=20;
end;$$;

create function public.research_summary() returns jsonb
language sql stable security invoker set search_path=public as $$
with pairs as (
 select b.total_score btotal,a.total_score atotal,b.vocabulary_score bv,a.vocabulary_score av,b.grammar_score bg,a.grammar_score ag,b.speaking_score bs,a.speaking_score ass,b.writing_score bw,a.writing_score aw
 from assessments b join assessments a on a.session_id=b.session_id and a.version=b.version and a.assessment_type='after'
 where b.assessment_type='before' and b.version='v1' and a.created_at>=b.created_at
), averages as (select count(*) n,round(avg(btotal),1) b,round(avg(atotal),1) a,round(avg(atotal-btotal),1) d,
 round(avg(bv),1) bv,round(avg(av),1) av,round(avg(bg),1) bg,round(avg(ag),1) ag,round(avg(bs),1) bs,round(avg(ass),1) ass,round(avg(bw),1) bw,round(avg(aw),1) aw from pairs)
select jsonb_build_object('pairs',n,'before',b,'after',a,'difference',d,
 'skills',case when n=0 then '[]'::jsonb else jsonb_build_array(jsonb_build_object('skill','Vocabulary','before',bv,'after',av),jsonb_build_object('skill','Grammar','before',bg,'after',ag),jsonb_build_object('skill','Speaking','before',bs,'after',ass),jsonb_build_object('skill','Writing','before',bw,'after',aw)) end,
 'browsers',(select count(*) from anonymous_sessions), 'practiceSessions',(select count(*) from quiz_sessions), 'questionsAnswered',(select count(*) from quiz_attempts),
 'averagePractice',(select round(avg(score_percentage),1) from quiz_sessions),'aiSessions',(select count(*) from ai_usage),
 'mostPracticed',(select category from quiz_attempts group by category order by count(*) desc,category limit 1), 'visits',(select count(*) from activity_events where name='visit')) from averages;
$$;
revoke execute on function public.save_quiz(uuid,uuid,text,text,integer,integer,numeric,jsonb),public.save_assessment(uuid,text,text,numeric,numeric,numeric,numeric,numeric),public.reserve_ai_request(uuid),public.research_summary() from public,anon,authenticated;
grant execute on function public.save_quiz(uuid,uuid,text,text,integer,integer,numeric,jsonb),public.save_assessment(uuid,text,text,numeric,numeric,numeric,numeric,numeric),public.reserve_ai_request(uuid),public.research_summary() to service_role;
commit;
