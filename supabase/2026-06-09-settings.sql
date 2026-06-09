-- ============================================================
-- 2026-06-09 운영 설정 키-값 테이블 (팀구성 '강사 최종 확정' 잠금 등)
--  · Supabase SQL Editor에서 실행 (한 번만)
--  · key 예: 'project_vote_locked'(boolean) — true면 팀구성 화면이 잠긴다.
-- ============================================================

create table if not exists rest_settings (
  key        text primary key,
  value      jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function rest_settings_touch() returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_settings_touch on rest_settings;
create trigger trg_settings_touch before update on rest_settings
  for each row execute function rest_settings_touch();

alter table rest_settings enable row level security;

-- 조회: 로그인 사용자 전체(잠금 상태를 모두가 읽어야 함).
drop policy if exists settings_select on rest_settings;
create policy settings_select on rest_settings for select to authenticated using (true);

-- 쓰기: 로그인 사용자(실제 토글 버튼은 강사에게만 노출 — 클라이언트에서 제어).
--   ※ 더 엄격히 강사만 쓰게 하려면 auth.email() 화이트리스트 정책으로 교체.
drop policy if exists settings_write on rest_settings;
create policy settings_write on rest_settings for all to authenticated using (true) with check (true);
