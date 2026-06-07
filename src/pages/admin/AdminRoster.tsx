/**
 * AdminRoster.tsx
 *
 * [역할]
 *   관리자 전용 "수강생 명단 ↔ 회원가입 대조" 페이지.
 *   내장된 정적 수강생 명단(ROSTER)과 Supabase user_profiles(실제 가입 회원)를
 *   '이름' 기준으로 대조하여 가입/미가입/명단외 가입 현황을 보여준다.
 *
 * [핵심 책임]
 *   - 본 사이트(REST) 가입자 프로필을 Supabase에서 로드 (도메인/방문기록/동일인 이메일·이름 보강 조회).
 *   - STAFF(관리자) 역할 계정은 기본 제외하되 동일인 묶음에 속하면 예외 포함.
 *   - groupByPerson으로 동일인 계정(전화/이름)을 통합 후, 명단의 각 학생을 이름으로 매칭.
 *   - 미가입 / 명단외 가입 / 전체 명단 + 가입상태 / 경험수준 분포 / 요약 카운트를 렌더링.
 *
 * [주요 export]
 *   - default: AdminRoster (React 페이지 컴포넌트)
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { ROSTER, ROSTER_COUNT, type RosterStudent } from '../../data/rosterData';
import { groupByPerson, type PersonGroup } from '../../utils/people';
import { SAME_PERSON_EMAIL_GROUPS } from '../../config/admin';
import type { UserProfile } from '../../types';

// 본 사이트(REST) 호스트명. signup_domain / visited_sites 비교의 기준값.
const REST_HOSTNAME = new URL(site.url).hostname;
// 명단 대조에서 기본 제외할 운영/관리자 역할 목록.
const STAFF_ROLES = ['admin', 'superadmin'];

// 동일인 묶음에 등록된 이메일은 도메인 조건/STAFF 역할과 무관하게 항상 명단 대조에 포함한다.
// (다른 사이트로 가입했거나 관리자 역할이어도 '명단외 가입'에 보여야 하는 사람)
// 모든 그룹의 이메일을 평탄화하고 소문자로 정규화한 배열.
const INCLUDE_EMAILS = SAME_PERSON_EMAIL_GROUPS
  .flatMap((g) => g.emails)
  .map((e) => e.toLowerCase());
// 빠른 포함 여부 판정용 Set.
const INCLUDE_SET = new Set(INCLUDE_EMAILS);
// 동일인 묶음에 지정된 이름들(빈 값 제거). 이메일이 달라도 이름으로 보강 조회/포함하기 위함.
const INCLUDE_NAMES = SAME_PERSON_EMAIL_GROUPS.map((g) => g.name).filter(Boolean) as string[];
// 이름 비교용 Set(공백 제거). \s+ 정규식으로 모든 공백을 제거해 표기 차이를 흡수.
const NAME_SET = new Set(INCLUDE_NAMES.map((n) => n.replace(/\s+/g, '')));

// 이름 매칭용 정규화 함수: null 안전, 소문자화, 모든 공백 제거, 양끝 trim.
// 매개변수 s - 원본 문자열, 반환 - 정규화된 비교용 문자열.
const norm = (s: string) => (s || '').toLowerCase().replace(/\s+/g, '').trim();

// 테이블 한 행 = 명단 학생 1명 + 매칭된 동일인 그룹(없으면 null).
interface RosterRow {
  student: RosterStudent;
  person: PersonGroup | null;
}

// 경험 수준별 표시 색상 매핑. (입문=빨강, 기초=주황, 경험자=초록)
const levelColor: Record<string, string> = { 입문: '#ef4444', 기초: '#d97706', 경험자: '#10b981' };

/**
 * AdminRoster
 *   수강생 명단과 가입 회원을 대조해 표시하는 관리자 페이지 컴포넌트.
 *   매개변수: 없음
 *   반환값: ReactElement (페이지 전체 레이아웃)
 *   부수효과: 마운트 시 Supabase에서 user_profiles를 비동기 로드해 상태(profiles)에 저장.
 */
const AdminRoster = (): ReactElement => {
  // 로드된 가입 회원 프로필 목록.
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  // 데이터 로딩 중 여부(초기 true).
  const [loading, setLoading] = useState(true);

  // [마운트 시 1회] Supabase에서 가입 회원을 조회하고 STAFF 필터링 후 상태에 저장.
  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      // Supabase 미설정/연결 불가 시 로딩만 종료(빈 명단으로 처리).
      if (!client) { setLoading(false); return; }
      // 본 사이트 가입자: signup_domain 일치 OR visited_sites 에 호스트 포함
      // .cs(contains) 연산자로 배열 컬럼 visited_sites에 호스트가 포함되는지 검사.
      const { data } = await client
        .from('user_profiles')
        .select('*')
        .or(`signup_domain.eq.${REST_HOSTNAME},visited_sites.cs.{${REST_HOSTNAME}}`);
      // 1차 조회 결과를 기준으로 병합 배열 시작.
      const merged = [...((data || []) as UserProfile[])];
      // 중복 추가 방지를 위한 id Set.
      const seen = new Set(merged.map((u) => u.id));
      // 추가 조회 결과를 중복 없이 merged에 합치는 헬퍼.
      const addAll = (rows: UserProfile[] | null) => {
        for (const u of rows || []) if (!seen.has(u.id)) { seen.add(u.id); merged.push(u); }
      };

      // 동일인 묶음 이메일은 도메인 조건에 안 걸려도 별도 조회해 합친다 (예: 다른 사이트로 가입)
      if (INCLUDE_EMAILS.length) {
        // .in으로 지정 이메일 목록에 해당하는 프로필을 한 번에 조회.
        const { data: byEmail } = await client.from('user_profiles').select('*').in('email', INCLUDE_EMAILS);
        addAll(byEmail as UserProfile[] | null);
      }
      // 이메일이 달라도 이름(예: 주윤미)으로도 추가 조회해 누락을 막는다
      if (INCLUDE_NAMES.length) {
        // name/display_name 두 컬럼 각각에 대한 eq 조건을 OR 문자열로 조합.
        const nameOr = INCLUDE_NAMES.flatMap((n) => [`name.eq.${n}`, `display_name.eq.${n}`]).join(',');
        const { data: byName } = await client.from('user_profiles').select('*').or(nameOr);
        addAll(byName as UserProfile[] | null);
      }

      // STAFF 역할은 제외하되, 동일인 묶음 이메일/이름은 예외로 항상 포함
      // isIncluded: 해당 프로필이 동일인 묶음(이메일 또는 이름)에 속하는지 판정.
      const isIncluded = (u: UserProfile) =>
        INCLUDE_SET.has((u.email || '').toLowerCase()) ||
        NAME_SET.has((u.name || '').replace(/\s+/g, '')) ||
        NAME_SET.has((u.display_name || '').replace(/\s+/g, ''));
      // STAFF가 아니거나(일반 수강생) 동일인 예외에 해당하면 명단 대상에 포함.
      const list = merged.filter((u) => !STAFF_ROLES.includes(u.role) || isIncluded(u));
      setProfiles(list);
      setLoading(false);
    };
    load();
  }, []);

  // [파생 데이터] profiles 변경 시에만 재계산: 명단 행/명단외 그룹/일치 수.
  const { rows, notInRoster, matchedCount } = useMemo(() => {
    // 동일인(전화/이름) 통합 후 이름으로 매칭
    // 같은 이름 그룹이 여러 개면(전화번호 등으로 분리된 동일인 계정) 모두 매칭 처리해
    // 한 계정만 매칭되고 나머지가 '명단외'로 남는 문제를 방지한다.
    const people = groupByPerson(profiles);
    // 정규화된 이름 -> 해당 이름을 가진 동일인 그룹들의 맵.
    const byName = new Map<string, PersonGroup[]>();
    people.forEach((g) => {
      // 한 그룹 안 모든 계정의 name/display_name을 정규화해 후보 이름 집합으로 수집.
      const names = new Set<string>();
      g.accounts.forEach((a) => { if (a.name) names.add(norm(a.name)); if (a.display_name) names.add(norm(a.display_name)); });
      // 각 후보 이름마다 그룹을 인덱싱(같은 이름에 여러 그룹이 들어갈 수 있음).
      names.forEach((n) => { const arr = byName.get(n) || []; arr.push(g); byName.set(n, arr); });
    });
    // 명단 매칭에 사용(소비)된 그룹 key 집합 — '명단외 가입' 산출 시 제외용.
    const usedKeys = new Set<string>();
    const rows: RosterRow[] = ROSTER.map((student) => {
      // 학생 이름을 정규화해 매칭되는 그룹들을 찾는다.
      const groups = byName.get(norm(student.name)) || [];
      // 매칭된 그룹은 모두 used 처리(동일인 다중 그룹이 명단외로 남지 않도록).
      groups.forEach((g) => usedKeys.add(g.key));
      // 표시용으로는 첫 그룹만 person에 연결(없으면 null=미가입).
      return { student, person: groups[0] || null };
    });
    return {
      rows,
      // 가입 매칭된 명단 학생 수.
      matchedCount: rows.filter((r) => r.person).length,
      // 어떤 명단 학생과도 매칭되지 않은 그룹 = 명단외 가입(운영사 관리자 등).
      notInRoster: people.filter((g) => !usedKeys.has(g.key)),
    };
  }, [profiles]);

  // 중도포기는 미가입 경고에서 제외 (출석 대상이 아니므로)
  // 미매칭 + 비(非)중도포기 학생만 '미가입'으로 본다.
  const notSignedUp = rows.filter((r) => !r.person && !r.student.dropped);
  // 명단 내 중도포기 인원 수(고정 명단이라 의존성 없음).
  const droppedCount = useMemo(() => ROSTER.filter((s) => s.dropped).length, []);

  // 경험 수준 분포 (중도포기 제외 = 실제 수강 인원 기준)
  const levelDist = useMemo(() => {
    const d: Record<string, number> = { 입문: 0, 기초: 0, 경험자: 0 };
    // 중도포기 제외 학생들을 수준별로 카운트.
    ROSTER.filter((s) => !s.dropped).forEach((s) => { d[s.level] += 1; });
    return d;
  }, []);

  // 상단 요약 카드 데이터. 중도포기가 있을 때만 마지막 카드를 조건부로 추가.
  const summary = [
    { label: '명단 인원', val: ROSTER_COUNT - droppedCount, color: 'var(--text-primary, #1a1a1a)' },
    { label: '가입 회원', val: matchedCount + notInRoster.length, color: 'var(--primary-blue, #0046C8)' },
    { label: '일치(가입완료)', val: matchedCount, color: '#10b981' },
    { label: '미가입', val: notSignedUp.length, color: '#ef4444' },
    { label: '명단외 가입', val: notInRoster.length, color: '#d97706' },
    ...(droppedCount > 0 ? [{ label: '중도포기', val: droppedCount, color: '#6b7280' }] : []),
  ];

  return (
    <>
      {/* 검색엔진 비노출(noindex) 관리자 페이지 SEO 헤더 */}
      <SEOHead title="수강생 명단 대조" path="/admin/roster" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 페이지 제목 + 대조 방식 안내(이메일 부재로 이름 매칭임을 명시) */}
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>수강생 명단 ↔ 회원가입 대조</h2>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
              내장된 수강생 명단 <strong>{ROSTER_COUNT}명</strong>을 본 사이트 가입 회원과 <strong>이름 기준</strong>으로 대조합니다.
              (명단에 이메일이 없어 이름 매칭이며, 동명이인·닉네임 가입은 수동 확인이 필요합니다.)
            </p>
          </div>

          {/* 요약 카운트 */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {/* summary 배열을 순회하며 카운트 카드 렌더 */}
            {summary.map((c) => (
              <div key={c.label} style={{
                flex: '1 1 130px', border: '1px solid var(--border-light, #e5e7eb)',
                borderRadius: '10px', padding: '12px 14px', background: 'var(--bg-white, #fff)',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: c.color }}>{c.val}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* 경험 수준 분포 */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '13.5px' }}>
            {/* levelDist를 [수준, 인원] 쌍으로 순회하며 칩 형태로 표시 */}
            {Object.entries(levelDist).map(([lvl, n]) => (
              <span key={lvl} style={{
                padding: '4px 12px', borderRadius: '999px', fontWeight: 700,
                background: 'var(--bg-light-gray, #f8f9fa)', color: levelColor[lvl],
                border: `1px solid ${levelColor[lvl]}`,
              }}>{lvl} {n}명</span>
            ))}
          </div>

          {/* 로딩 중에는 스피너, 완료 후 대조 결과 테이블들 표시 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : (
            <>
              {/* 미가입 — 가장 중요 */}
              <h3 style={{ margin: '8px 0 10px', color: '#ef4444' }}>⚠ 미가입 ({notSignedUp.length}) — 명단에 있으나 회원가입 미확인</h3>
              {/* 전원 가입 시 안내 문구, 아니면 미가입자 테이블 */}
              {notSignedUp.length === 0 ? (
                <p style={{ color: '#10b981', fontSize: '14.5px', marginBottom: '24px' }}>✓ 명단 전원이 가입을 완료했습니다.</p>
              ) : (
                <div className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
                  <table className="admin-table">
                    <thead><tr><th>No</th><th>이름</th><th>성별</th><th>전공</th><th>수준</th></tr></thead>
                    <tbody>
                      {/* 미가입 학생 행 렌더 */}
                      {notSignedUp.map((r) => (
                        <tr key={r.student.no}>
                          <td>{r.student.no}</td>
                          <td>{r.student.name}</td>
                          <td>{r.student.gender}</td>
                          <td>{r.student.major}</td>
                          <td style={{ color: levelColor[r.student.level], fontWeight: 700 }}>{r.student.level}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 명단외 가입 — 그룹이 있을 때만 섹션 표시 */}
              {notInRoster.length > 0 && (
                <>
                  <h3 style={{ margin: '8px 0 10px', color: '#d97706' }}>명단외 가입 ({notInRoster.length}) — 운영사 관리자</h3>
                  <div className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
                    <table className="admin-table">
                      <thead><tr><th>이름</th><th>이메일</th><th>전화</th><th>가입경로</th></tr></thead>
                      <tbody>
                        {/* 동일인 그룹 단위로 행 렌더 */}
                        {notInRoster.map((g) => (
                          <tr key={g.key}>
                            <td>
                              {g.name}
                              {/* 동일인 통합 그룹이면 계정 수 배지 표시 */}
                              {g.isMerged && (
                                <span title={`동일인 ${g.accounts.length}계정`} style={{
                                  marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                                  borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                                }}>동일인 {g.accounts.length}</span>
                              )}
                            </td>
                            <td>
                              {/* 그룹의 모든 이메일 나열(첫 번째 외에는 보조 스타일) */}
                              {g.emails.map((e, i) => (
                                <div key={e} style={i > 0 ? { fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                              ))}
                            </td>
                            <td>{g.phone || '-'}</td>
                            {/* 가입 경로(provider) 중복 제거 후 콤마로 연결, 없으면 '-' */}
                            <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>{Array.from(new Set(g.accounts.map(a => a.provider).filter(Boolean))).join(', ') || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* 전체 명단 + 가입 상태 */}
              <h3 style={{ margin: '8px 0 10px' }}>전체 명단 ({ROSTER_COUNT})</h3>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>No</th><th>이름</th><th>성별</th><th>전공</th><th>계열</th><th>수준</th><th>가입</th><th>가입 이메일</th></tr></thead>
                  <tbody>
                    {/* 명단 전체를 순회: 중도포기 행은 취소선/흐림 처리 */}
                    {rows.map((r) => {
                      const dropped = !!r.student.dropped;
                      return (
                      <tr key={r.student.no} style={dropped ? { textDecoration: 'line-through', color: 'var(--text-secondary, #9ca3af)', opacity: 0.65 } : undefined}>
                        <td>{r.student.no}</td>
                        <td>
                          {r.student.name}
                          {/* 중도포기 배지(취소선 영향 제거 위해 textDecoration none) */}
                          {dropped && (
                            <span style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                              borderRadius: '999px', background: '#f3f4f6', color: '#6b7280',
                              textDecoration: 'none', display: 'inline-block', verticalAlign: 'middle',
                            }}>중도포기</span>
                          )}
                        </td>
                        <td>{r.student.gender}</td>
                        <td>{r.student.major}</td>
                        <td>{r.student.majorCategory}</td>
                        <td style={{ color: dropped ? '#9ca3af' : levelColor[r.student.level], fontWeight: 700 }}>{r.student.level}</td>
                        <td>
                          {/* 가입 상태 배지: 중도포기 > 가입(매칭됨) > 미가입 순으로 색/문구 결정 */}
                          <span style={{
                            fontSize: '12.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                            textDecoration: 'none',
                            background: dropped ? '#f3f4f6' : (r.person ? '#d1fae5' : '#fee2e2'),
                            color: dropped ? '#6b7280' : (r.person ? '#065f46' : '#991b1b'),
                          }}>{dropped ? '중도포기' : (r.person ? '가입' : '미가입')}</span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                          {/* 매칭된 그룹의 가입 이메일들을 나열(없으면 '-') */}
                          {r.person ? r.person.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '12px' } : undefined}>{e}</div>
                          )) : '-'}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* 로딩 완료 후에도 프로필이 0건이면 Supabase 미연결/미가입 안내 */}
              {!loading && profiles.length === 0 && (
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)', marginTop: '12px' }}>
                  ※ Supabase가 연결되지 않았거나 아직 가입한 회원이 없어 가입 데이터를 불러오지 못했습니다.
                  배포 환경(관리자 로그인 상태)에서 정확히 표시됩니다.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminRoster;
