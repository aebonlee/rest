-- ============================================================
-- 2026-06-09 팀 프로젝트 산출물 제출 테이블 신설
--  · Supabase SQL Editor에서 실행 (한 번만)
--  · 팀별 최종 산출물(요약/데모/발표자료/소스 링크)을 저장한다.
-- ============================================================

create table if not exists rest_team_submission (
  team_id    uuid primary key references rest_teams(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,   -- { summary, demo_url, slides_url, repo_url }
  updated_at timestamptz not null default now()
);

create or replace function rest_team_submission_touch() returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_team_submission_touch on rest_team_submission;
create trigger trg_team_submission_touch
  before update on rest_team_submission
  for each row execute function rest_team_submission_touch();

-- ── RLS ──────────────────────────────────────────────
alter table rest_team_submission enable row level security;

-- 조회: 로그인 사용자 전체(결과 허브·강사).
drop policy if exists submission_select on rest_team_submission;
create policy submission_select on rest_team_submission
  for select to authenticated using (true);

-- 삽입/수정: 해당 팀의 팀원만(members JSONB에 본인 id 포함).
drop policy if exists submission_insert on rest_team_submission;
create policy submission_insert on rest_team_submission
  for insert to authenticated
  with check (
    exists (select 1 from rest_teams t where t.id = team_id
            and t.members @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
  );

drop policy if exists submission_update on rest_team_submission;
create policy submission_update on rest_team_submission
  for update to authenticated
  using (
    exists (select 1 from rest_teams t where t.id = team_id
            and t.members @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
  )
  with check (
    exists (select 1 from rest_teams t where t.id = team_id
            and t.members @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text)))
  );

-- 확인
-- SELECT team_id, data, updated_at FROM rest_team_submission;
