-- ============================================================
-- 2026-06-19 프로젝트 결과평가(경진대회 · 최종) 테이블 신설
--  · Supabase SQL Editor에서 1회 실행
--  · 사전평가 상위 10팀을 대상으로 10개 항목(각 10점, 합 100점)으로 평가
--    - score_topic      : 주제
--    - score_idea       : 아이디어
--    - score_team       : 팀역량(AI리터러시·협업)
--    - score_biz        : 사업화 가능성
--    - score_design     : 디자인
--    - score_program    : 프로그래밍
--    - score_ai         : AI 기능개발
--    - score_solar      : Solar 활용
--    - score_completion : 완성도
--    - score_present    : 발표·시연
--    - comment          : 종합평(자유 서술)
--  · project_id = TEAM_PROJECTS.id (1~23) = 팀 고정 번호
--  · UNIQUE(project_id, evaluator_id) — 1인 1프로젝트 1건(재평가 시 upsert 갱신)
-- ============================================================

create table if not exists rest_project_result_evals (
  id              uuid primary key default gen_random_uuid(),
  project_id      int  not null,
  evaluator_id    uuid not null,
  evaluator_name  text not null default '',
  score_topic      int not null default 0 check (score_topic      between 0 and 10),
  score_idea       int not null default 0 check (score_idea       between 0 and 10),
  score_team       int not null default 0 check (score_team       between 0 and 10),
  score_biz        int not null default 0 check (score_biz        between 0 and 10),
  score_design     int not null default 0 check (score_design     between 0 and 10),
  score_program    int not null default 0 check (score_program    between 0 and 10),
  score_ai         int not null default 0 check (score_ai         between 0 and 10),
  score_solar      int not null default 0 check (score_solar      between 0 and 10),
  score_completion int not null default 0 check (score_completion between 0 and 10),
  score_present    int not null default 0 check (score_present    between 0 and 10),
  comment         text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (project_id, evaluator_id)
);

create index if not exists idx_project_result_evals_project on rest_project_result_evals (project_id);

create or replace function rest_project_result_evals_touch() returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_project_result_evals_touch on rest_project_result_evals;
create trigger trg_project_result_evals_touch
  before update on rest_project_result_evals
  for each row execute function rest_project_result_evals_touch();

-- ── RLS (사전평가 테이블과 동일 정책) ──────────────────
alter table rest_project_result_evals enable row level security;

drop policy if exists project_result_evals_select on rest_project_result_evals;
create policy project_result_evals_select on rest_project_result_evals
  for select to authenticated using (true);

drop policy if exists project_result_evals_insert on rest_project_result_evals;
create policy project_result_evals_insert on rest_project_result_evals
  for insert to authenticated
  with check (evaluator_id = auth.uid());

drop policy if exists project_result_evals_update on rest_project_result_evals;
create policy project_result_evals_update on rest_project_result_evals
  for update to authenticated
  using (evaluator_id = auth.uid())
  with check (evaluator_id = auth.uid());

drop policy if exists project_result_evals_delete on rest_project_result_evals;
create policy project_result_evals_delete on rest_project_result_evals
  for delete to authenticated
  using (evaluator_id = auth.uid());

-- 확인
-- SELECT project_id, count(*) AS n FROM rest_project_result_evals GROUP BY project_id ORDER BY n DESC;
