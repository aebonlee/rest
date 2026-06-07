/**
 * Teams.tsx
 *
 * 역할:
 *   - 프로젝트 "팀 구성" 페이지 컴포넌트.
 *   - Supabase의 teams 테이블에서 팀 목록을 조회하여 카드 형태로 렌더링한다.
 *
 * 핵심 책임:
 *   - 마운트 시 비동기로 팀 데이터를 로드(created_at 정렬)하고 로딩/빈/정상 상태를 분기 렌더링.
 *   - 각 팀의 팀원(members) 배열을 안전하게 순회하여 이름/역할을 표시.
 *   - SEO 메타(noindex)를 설정해 검색엔진 색인을 막는다(내부용 페이지).
 *
 * 주요 export:
 *   - default: Teams 컴포넌트(React 함수 컴포넌트, ReactElement 반환).
 */
import { useState, useEffect, type ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Team } from '../types';

// 사이트별 DB 접두사(site.dbPrefix)를 붙여 실제 테이블명을 구성한다.
// 동일 Supabase 프로젝트를 여러 사이트가 공유할 때 테이블 충돌을 방지하기 위함.
const TABLES = { teams: `${site.dbPrefix}teams` };

/**
 * Teams - 팀 구성 페이지 컴포넌트.
 *
 * 매개변수: 없음.
 * 반환값: ReactElement (페이지 헤더 + 팀 카드 그리드 또는 빈/로딩 상태).
 * 부수효과: 마운트 시 Supabase에서 팀 목록을 조회하여 상태에 반영(아래 useEffect 참조).
 */
const Teams = (): ReactElement => {
  // 인증 컨텍스트 초기화/구독 목적의 호출(반환값은 사용하지 않음 — 세션 보장용).
  useAuth();
  // teams: 조회된 팀 목록 상태. 초기값은 빈 배열.
  const [teams, setTeams] = useState<Team[]>([]);
  // loading: 데이터 조회 진행 중 여부. 초기에는 true로 시작해 스피너를 노출.
  const [loading, setLoading] = useState(true);

  // 마운트 시 1회 실행: 팀 목록을 비동기로 로드한다(의존성 배열 [] — 재실행 없음).
  useEffect(() => {
    const load = async () => {
      // Supabase 클라이언트 획득. 환경설정 미비 시 null일 수 있음.
      const client = getSupabase();
      // 클라이언트가 없으면 더 진행하지 않고 로딩만 종료(빈 상태로 폴백).
      if (!client) { setLoading(false); return; }
      // teams 테이블 전체 컬럼을 created_at 오름차순으로 조회.
      // (RLS 정책에 따라 접근 가능한 행만 반환될 수 있음.)
      const { data } = await client.from(TABLES.teams).select('*').order('created_at');
      // 데이터가 있을 때만 상태 갱신(에러/널 시 기존 빈 배열 유지).
      if (data) setTeams(data as Team[]);
      // 성공/실패 무관하게 로딩 상태 해제.
      setLoading(false);
    };
    // 비동기 로더 실행(반환 Promise는 의도적으로 await하지 않음).
    load();
  }, []);

  return (
    <>
      {/* 내부용 페이지이므로 noindex로 검색엔진 색인 제외 */}
      <SEOHead title="팀" path="/teams" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀 구성</h2>
          <p>프로젝트 팀 정보입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 3분기 렌더링: 로딩 중 → 스피너 / 팀 존재 → 그리드 / 없음 → 안내 문구 */}
          {loading ? (
            // 로딩 스피너(중앙 정렬)
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : teams.length > 0 ? (
            <div className="teams-grid">
              {/* 팀 목록 순회: 각 팀을 카드로 렌더링 */}
              {teams.map(team => (
                <div key={team.id} className="team-card">
                  <h3 className="team-name">{team.name}</h3>
                  {/* 프로젝트 주제 우선 표시, 없으면 설명으로 폴백 */}
                  <p className="team-topic">{team.project_topic || team.description}</p>
                  <div className="team-members">
                    <h4>팀원</h4>
                    <ul>
                      {/* members가 배열이 아닐 수 있어(엣지케이스) 가드 후 빈 배열로 폴백하여 순회 */}
                      {(Array.isArray(team.members) ? team.members : []).map((m, i) => (
                        // members에 안정적 id가 없을 수 있어 index를 key로 사용
                        <li key={i}>
                          <span className="member-name">{m.name}</span>
                          {/* 역할(role)은 있을 때만 표시 */}
                          {m.role && <span className="member-role">{m.role}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 로딩 완료 + 팀 0건일 때의 빈 상태 안내
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>팀이 아직 편성되지 않았습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Teams;
