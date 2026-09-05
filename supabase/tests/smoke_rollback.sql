-- Run the WHOLE file in SQL Editor after migration. All fixture rows roll back.
-- If the editor reports an error, run ROLLBACK before using that connection again.
begin isolation level repeatable read;
set local statement_timeout = '15s';
set local role service_role;
do $test$
declare
 sid uuid := gen_random_uuid();
 run uuid := gen_random_uuid();
 baseline jsonb := public.research_summary();
 result jsonb;
 first_result jsonb;
 item record;
begin
 for item in select c.oid, c.relrowsecurity from pg_class c
 join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relname in
 ('anonymous_sessions','quiz_sessions','quiz_attempts','assessments','ai_usage','activity_events','ai_budgets')
 loop
  assert item.relrowsecurity, 'RLS must be enabled';
  assert not has_table_privilege('anon',item.oid,'SELECT,INSERT,UPDATE,DELETE'), 'anon table access';
  assert not has_table_privilege('authenticated',item.oid,'SELECT,INSERT,UPDATE,DELETE'), 'authenticated table access';
 end loop;
 for item in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in ('save_quiz','save_assessment','research_summary','reserve_ai_request')
 loop
  assert not has_function_privilege('anon',item.oid,'EXECUTE'), 'anon RPC access';
  assert not has_function_privilege('authenticated',item.oid,'EXECUTE'), 'authenticated RPC access';
  assert has_function_privilege('service_role',item.oid,'EXECUTE'), 'missing server RPC access';
 end loop;
 insert into public.anonymous_sessions(session_id) values(sid);
 begin
  perform public.save_assessment(sid,'after','v1',100,100,100,100,100);
  raise exception 'After unexpectedly accepted without Before';
 exception when raise_exception then
  if sqlerrm <> 'before_required' then raise; end if;
 end;
 first_result := public.save_assessment(sid,'before','v1',50,50,50,50,50);
 result := public.save_assessment(sid,'before','v1',0,0,0,0,0);
 assert result = first_result, 'First assessment was overwritten';
 assert (public.research_summary()->>'pairs')::bigint = (baseline->>'pairs')::bigint, 'Unpaired record counted';
 begin
  perform public.save_assessment(sid,'after','v1',100,100,100,100,100);
  raise exception 'After unexpectedly accepted without practice';
 exception when raise_exception then
  if sqlerrm <> 'practice_required' then raise; end if;
 end;
 -- now() is constant within a transaction; place only this fixture's Before earlier.
 update public.assessments set created_at=now()-interval '1 minute' where session_id=sid;
 perform public.save_quiz(run,sid,'A1','Vocabulary',1,1,100,'[{"question_id":"smoke","category":"Vocabulary","is_correct":true}]');
 perform public.save_quiz(run,sid,'A1','Vocabulary',1,1,100,'[{"question_id":"smoke","category":"Vocabulary","is_correct":true}]');
 assert (select count(*) from public.quiz_attempts where run_id=run)=1, 'Duplicate quiz save';
 perform public.save_assessment(sid,'after','v1',100,100,100,100,100);
 result := public.research_summary();
 assert (result->>'pairs')::bigint = (baseline->>'pairs')::bigint+1, 'Missing assessment pair';
 assert (result->>'practiceSessions')::bigint = (baseline->>'practiceSessions')::bigint+1, 'Incorrect practice count';
 assert (result->>'questionsAnswered')::bigint = (baseline->>'questionsAnswered')::bigint+1, 'Incorrect answer count';
 if (baseline->>'pairs')::bigint=0 then
  assert (result->>'before')::numeric=50 and (result->>'after')::numeric=100 and (result->>'difference')::numeric=50, 'Incorrect paired scores';
 end if;
end;
$test$;
rollback;
select 'PASS: permissions, assessment ordering, immutable scores, quiz retries, paired summary; fixture rows rolled back' as result;
