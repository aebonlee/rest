-- ============================================================
-- 2026-06-08 팀 프로젝트 수행 체크리스트 테이블 신설
--  · Supabase SQL Editor에서 실행 (한 번만)
--  · 팀별로 표준 마일스톤 완료 상태(items JSONB)를 저장한다.
--  · 항목 정의(키/라벨)는 프런트(data/projectChecklist.ts)에 있고, 여기는 상태만 저장.
-- ============================================================

create table if not exists rest_team_checklist (
  team_id    uuid primary key references rest_teams(id) on delete cascade, -- 팀당 한 행
  items      jsonb not null default '{}'::jsonb,   -- { "topic": true, "plan": true, ... }
  updated_at timestamptz not null default now()
);

-- updated_at 자동 갱신 트리거(선택) — upsert 시 수정 시각 반영
create or replace function rest_team_checklist_touch() returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_team_checklist_touch on rest_team_checklist;
create trigger trg_team_checklist_touch
  before update on rest_team_checklist
  for each row execute function rest_team_checklist_touch();

-- ── RLS ──────────────────────────────────────────────
alter table rest_team_checklist enable row level security;

-- 조회: 로그인 사용자 전체(강사가 전체 팀 진행률을 모니터링).
drop policy if exists checklist_select on rest_team_checklist;
create policy checklist_select on rest_team_checklist
  for select to authenticated using (true);

-- 삽입: 해당 팀의 팀원만(members JSONB에 본인 id 포함).
drop policy if exists checklist_insert on rest_team_checklist;
create policy checklist_insert on rest_team_checklist
  for insert to authenticated
  with check (
    exists (
      select 1 from rest_teams t
       where t.id = team_id
         and t.members @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))
    )
  );

-- 수정: 해당 팀의 팀원만.
drop policy if exists checklist_update on rest_team_checklist;
create policy checklist_update on rest_team_checklist
  for update to authenticated
  using (
    exists (
      select 1 from rest_teams t
       where t.id = team_id
         and t.members @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))
    )
  )
  with check (
    exists (
      select 1 from rest_teams t
       where t.id = team_id
         and t.members @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))
    )
  );

-- 확인
-- SELECT team_id, items, updated_at FROM rest_team_checklist;
