/**
 * AdminStudents.tsx
 * ------------------------------------------------------------------
 * 역할:
 *   관리자(admin) 화면의 "수강생 관리" 페이지 컴포넌트.
 *   Supabase의 user_profiles 테이블에서 회원 목록을 조회하여
 *   본 사이트(rest.dreamitbiz.com) 기준으로 가입자 또는 방문자를
 *   필터링해 테이블 형태로 보여준다.
 *
 * 핵심 책임:
 *   - scope(가입자/방문자)에 따라 Supabase 쿼리 조건을 분기해 데이터 로딩
 *   - groupByPerson 유틸로 동일인(전화/이름 기준)을 통합해 한 명으로 표시
 *   - 키워드(이름·이메일·전화)로 클라이언트 측 필터링
 *   - 로딩/빈 상태/결과 테이블 렌더링
 *
 * 주요 export:
 *   - default export: AdminStudents (React 함수형 컴포넌트)
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { groupByPerson } from '../../utils/people';
import type { UserProfile } from '../../types';

// 본 사이트의 호스트네임을 site.url에서 추출(예: 'rest.dreamitbiz.com').
// signup_domain / visited_sites 비교 기준값으로 사용된다.
const REST_HOSTNAME = new URL(site.url).hostname; // 'rest.dreamitbiz.com'

// 조회 범위 타입: 'signup' = 본 사이트 가입자, 'visited' = 본 사이트 방문자
type Scope = 'signup' | 'visited';

/**
 * AdminStudents
 * 수강생 관리 페이지를 렌더링하는 함수형 컴포넌트.
 *
 * 매개변수: 없음
 * 반환값: ReactElement (페이지 전체 UI)
 * 부수효과:
 *   - useEffect 내에서 Supabase 비동기 조회를 수행해 students 상태를 갱신.
 */
const AdminStudents = (): ReactElement => {
  // 조회된 원본 계정 목록(동일인 통합 전, 계정 단위)
  const [students, setStudents] = useState<UserProfile[]>([]);
  // 데이터 로딩 중 여부(스피너 표시 제어)
  const [loading, setLoading] = useState(true);
  // 현재 조회 범위(가입자 / 방문자)
  const [scope, setScope] = useState<Scope>('signup');
  // 검색 키워드(이름·이메일·전화)
  const [keyword, setKeyword] = useState('');

  // scope가 바뀔 때마다 Supabase에서 회원 목록을 다시 조회.
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const client = getSupabase();
      // Supabase 클라이언트가 없으면(환경설정 누락 등) 로딩만 해제하고 종료.
      if (!client) { setLoading(false); return; }

      // 기본 쿼리: user_profiles 전체 컬럼을 최근 접속 시각 내림차순으로.
      const query = client
        .from('user_profiles')
        .select('*')
        .order('last_sign_in_at', { ascending: false });

      // 본 사이트 가입자만 / 또는 방문 이력 포함
      if (scope === 'signup') {
        // signup_domain이 본 사이트 호스트네임과 정확히 일치하는 행만.
        query.eq('signup_domain', REST_HOSTNAME);
      } else {
        // visited_sites 배열에 본 사이트 호스트네임이 포함된 행만.
        query.contains('visited_sites', [REST_HOSTNAME]);
      }

      const { data } = await query;
      // 결과가 있을 때만 상태 반영(에러/널이면 기존 유지).
      if (data) setStudents(data as UserProfile[]);
      setLoading(false);
    };
    load();
  }, [scope]); // scope 변경 시에만 재조회

  // 동일인(전화/이름 기준) 통합 — 이메일 2개여도 한 명으로 표시
  // students가 바뀔 때만 재계산(메모이제이션)
  const people = useMemo(() => groupByPerson(students), [students]);

  // 키워드 기반 필터링 결과(people 또는 keyword 변경 시 재계산).
  const filtered = useMemo(() => {
    // 키워드가 공백뿐이면 전체 반환
    if (!keyword.trim()) return people;
    // 대소문자 무시 비교를 위해 소문자로 정규화
    const k = keyword.trim().toLowerCase();
    return people.filter(g =>
      // 이메일 중 하나라도 키워드를 포함하거나,
      g.emails.some(e => e.toLowerCase().includes(k)) ||
      // 통합된 계정들의 display_name/name 중 하나라도 포함하거나,
      g.accounts.some(a =>
        (a.display_name || '').toLowerCase().includes(k) ||
        (a.name || '').toLowerCase().includes(k)
      ) ||
      // 전화번호에 키워드가 포함되면 매칭(전화는 소문자 변환 불필요)
      (g.phone || '').includes(k)
    );
  }, [people, keyword]);

  return (
    <>
      {/* 검색엔진 비노출(noindex) 처리된 관리자 페이지용 SEO 헤더 */}
      <SEOHead title="수강생 관리" path="/admin/students" noindex />
      <div className="admin-layout">
        {/* 좌측 관리자 사이드바 */}
        <AdminSidebar />
        <div className="admin-content">
          {/* 상단 헤더: 제목/설명 + 인원 통계 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>수강생 관리</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                {/* 현재 scope에 따라 안내 문구가 가입자/방문자로 바뀜 */}
                <strong>rest.dreamitbiz.com</strong>{scope === 'signup' ? '에서 가입한 회원' : '에 접속한 회원'}만 표시됩니다.
              </p>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              {/* 필터링된 인원수, 검색 중이면 전체 인원수도 병기 */}
              총 {filtered.length}명{keyword && ` (전체 ${people.length}명 중)`}
              {/* 통합 인원 수와 원본 계정 수가 다르면(동일인 통합 발생) 계정 수 표시 */}
              {people.length !== students.length && (
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}>
                  {' '}· 계정 {students.length}개(동일인 통합)
                </span>
              )}
            </div>
          </div>

          {/* 필터 컨트롤 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px',
            padding: '12px 16px',
            background: 'var(--bg-secondary, #f8f9fa)',
            borderRadius: '8px',
          }}>
            {/* 범위 토글 버튼 그룹(가입자 / 방문자) */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setScope('signup')}
                style={{
                  padding: '8px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  // 선택된 범위면 강조색 배경, 아니면 투명
                  background: scope === 'signup' ? 'var(--primary-blue, #0046C8)' : 'transparent',
                  color: scope === 'signup' ? '#fff' : 'var(--text-primary, #1a1a1a)',
                  cursor: 'pointer',
                }}
              >본 사이트 가입자</button>
              <button
                type="button"
                onClick={() => setScope('visited')}
                style={{
                  padding: '8px 14px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  // 선택된 범위면 강조색 배경, 아니면 투명
                  background: scope === 'visited' ? 'var(--primary-blue, #0046C8)' : 'transparent',
                  color: scope === 'visited' ? '#fff' : 'var(--text-primary, #1a1a1a)',
                  cursor: 'pointer',
                }}
              >본 사이트 방문자</button>
            </div>
            {/* 검색 입력: 입력 즉시 keyword 상태 갱신 → filtered 재계산 */}
            <input
              type="search"
              placeholder="이름·이메일·전화 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '6px',
                background: 'var(--bg-card, #fff)',
                color: 'var(--text-primary, #1a1a1a)',
              }}
            />
          </div>

          {/* 상태별 분기: 로딩 중 → 스피너 / 결과 없음 → 안내 / 그 외 → 테이블 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-secondary, #f8f9fa)',
              borderRadius: '12px',
              color: 'var(--text-secondary, #6b7280)',
            }}>
              {/* 검색 중이면 검색 결과 없음, 아니면 scope별 빈 상태 안내 */}
              {keyword
                ? '검색 결과가 없습니다.'
                : scope === 'signup'
                  ? '본 사이트에서 가입한 회원이 아직 없습니다.'
                  : '본 사이트에 방문한 회원이 아직 없습니다.'}
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr><th>이름</th><th>이메일</th><th>전화번호</th><th>가입방식</th><th>가입처</th><th>역할</th><th>최근접속</th></tr>
                </thead>
                <tbody>
                  {/* 통합·필터된 인원(g)을 행 단위로 렌더링 */}
                  {filtered.map(g => {
                    // 대표 계정(primary): 이름/역할/가입처/최근접속 등 표시 기준
                    const s = g.primary;
                    return (
                      <tr key={g.key}>
                        <td>
                          {g.name}
                          {/* 동일 전화번호로 여러 계정이 통합된 경우 배지 표시 */}
                          {g.isMerged && (
                            <span title={`동일 전화번호 ${g.phone}로 ${g.accounts.length}개 계정`} style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 7px',
                              borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                            }}>동일인 {g.accounts.length}계정</span>
                          )}
                        </td>
                        <td>
                          {/* 통합된 모든 이메일 표시. 첫 이메일 외에는 보조색/작은 글씨 */}
                          {g.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '13px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                          ))}
                        </td>
                        <td>{g.phone || '-'}</td>
                        {/* 가입방식: 통합 계정들의 provider 중복 제거 후 콤마로 결합 */}
                        <td>{Array.from(new Set(g.accounts.map(a => a.provider).filter(Boolean))).join(', ') || '-'}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                          {s.signup_domain || '-'}
                        </td>
                        <td><span className={`role-badge ${s.role}`}>{s.role}</span></td>
                        {/* 최근 접속일을 한국어 로케일 날짜로 표기, 없으면 '-' */}
                        <td>{s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminStudents;
