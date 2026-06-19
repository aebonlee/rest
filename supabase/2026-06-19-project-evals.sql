-- ============================================================
-- 2026-06-19 프로젝트 사전평가(경진대회) 테이블 신설
--  · Supabase SQL Editor에서 1회 실행
--  · 수강생이 23개 팀 프로젝트를 5개 항목(각 20점, 합 100점)으로 평가
--    - score_topic   : 주제
--    - score_idea    : 아이디어
--    - score_biz     : 사업화 가능성
--    - score_design  : 구현1 · 디자인
--    - score_program : 구현2 · 프로그래밍
--    - comment       : 종합평(자유 서술)
--  · project_id = TEAM_PROJECTS.id (1~23) = 팀 고정 번호
--  · UNIQUE(project_id, evaluator_id) — 1인이 한 프로젝트에 1건(재평가 시 upsert로 갱신)
-- ============================================================

create table if not exists rest_project_evals (
  id             uuid primary key default gen_random_uuid(),
  project_id     int  not null,                       -- 평가 대상 프로젝트(팀) 번호 1~23
  evaluator_id   uuid not null,                       -- 평가자 auth.uid()
  evaluator_name text not null default '',            -- 평가자 표시 이름(스냅샷)
  score_topic    int  not null default 0 check (score_topic   between 0 and 20),
  score_idea     int  not null default 0 check (score_idea    between 0 and 20),
  score_biz      int  not null default 0 check (score_biz     between 0 and 20),
  score_design   int  not null default 0 check (score_design  between 0 and 20),
  score_program  int  not null default 0 check (score_program between 0 and 20),
  comment        text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (project_id, evaluator_id)                   -- upsert onConflict 기준
);

-- 집계(프로젝트별 평균) 조회 가속용 인덱스
create index if not exists idx_project_evals_project on rest_project_evals (project_id);

-- updated_at 자동 갱신 트리거
create or replace function rest_project_evals_touch() returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_project_evals_touch on rest_project_evals;
create trigger trg_project_evals_touch
  before update on rest_project_evals
  for each row execute function rest_project_evals_touch();

-- ── RLS ──────────────────────────────────────────────
alter table rest_project_evals enable row level security;

-- 조회: 로그인 사용자 전체(결과 집계를 모두가 볼 수 있어야 함).
drop policy if exists project_evals_select on rest_project_evals;
create policy project_evals_select on rest_project_evals
  for select to authenticated using (true);

-- 삽입: 본인 이름(evaluator_id = auth.uid())으로만.
drop policy if exists project_evals_insert on rest_project_evals;
create policy project_evals_insert on rest_project_evals
  for insert to authenticated
  with check (evaluator_id = auth.uid());

-- 수정: 본인이 작성한 평가만.
drop policy if exists project_evals_update on rest_project_evals;
create policy project_evals_update on rest_project_evals
  for update to authenticated
  using (evaluator_id = auth.uid())
  with check (evaluator_id = auth.uid());

-- 삭제: 본인이 작성한 평가만.
drop policy if exists project_evals_delete on rest_project_evals;
create policy project_evals_delete on rest_project_evals
  for delete to authenticated
  using (evaluator_id = auth.uid());

-- 확인
-- SELECT project_id, count(*) AS n,
--        round(avg(score_topic + score_idea + score_biz + score_design + score_program), 1) AS avg_total
-- FROM rest_project_evals GROUP BY project_id ORDER BY avg_total DESC;
