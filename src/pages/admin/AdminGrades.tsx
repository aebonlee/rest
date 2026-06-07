/**
 * AdminGrades.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * 역할:
 *   관리자(superadmin/admin)용 "학습평가 성적" 페이지.
 *   본 사이트(rest) 수강생들의 선수평가/사후평가 채점 결과를 집계·표시하고,
 *   성적표(Excel/PDF) 다운로드 기능을 제공한다.
 *
 * 핵심 책임:
 *   1) Supabase에서 본 사이트 수강생 프로필 + 전체 평가기록을 로드.
 *   2) 동일인(전화/이름 기준) 여러 계정을 한 명으로 통합하고, 평가별 최고점을 채택.
 *   3) 평가별 요약 통계(응시/합격/평균) 계산.
 *   4) "고아 점수"(기록은 있으나 수강생 목록에 매칭 안 된 평가) 경고 표시.
 *   5) 선수/사후 × Excel/PDF 성적표 다운로드.
 *
 * 주요 export:
 *   - default: AdminGrades (React 컴포넌트)
 *
 * 부수효과:
 *   - 마운트 시 Supabase 조회(user_profiles, assessments).
 *   - 다운로드 버튼 클릭 시 exportTableExcel / exportTablePdf 로 파일 생성.
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { getAllAssessments, type AssessmentRecord } from '../../utils/assessments';
import { groupByPerson } from '../../utils/people';
import { exportTableExcel, exportTablePdf, type Cell } from '../../utils/exportTable';
import { ADMIN_EMAILS } from '../../config/admin';
import type { UserProfile } from '../../types';

// 본 사이트 호스트명 (예: rest.dreamitbiz.com) — 수강생 소속 판별 기준값.
const REST_HOSTNAME = new URL(site.url).hostname;
// 수강생 집계에서 제외할 운영진 역할.
const STAFF_ROLES = ['admin', 'superadmin'];
// 점수로 집계하는 평가 종류(진단평가 제외) — 표시 순서이기도 함.
const GRADED_TYPES = ['prerequisite', 'summative'] as const;
// 평가 종류 → 한글 라벨 매핑.
const TYPE_LABEL: Record<string, string> = { prerequisite: '선수평가', summative: '사후평가' };

/**
 * AdminGrades — 학습평가 성적 관리 페이지 컴포넌트.
 * 매개변수: 없음.
 * 반환값: 성적 요약/고아 경고/다운로드/성적표 테이블을 포함한 ReactElement.
 * 부수효과: 마운트 시 Supabase 데이터 로드, 다운로드 버튼 클릭 시 파일 생성.
 */
const AdminGrades = (): ReactElement => {
  // 본 사이트 수강생(운영진/관리자 제외 전) 프로필 목록.
  const [students, setStudents] = useState<UserProfile[]>([]);
  // 전체 평가기록(선수/사후/진단 등 모든 종류 포함).
  const [grades, setGrades] = useState<AssessmentRecord[]>([]);
  // 초기 로딩 상태 — 스피너/빈 상태 분기에 사용.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 마운트 시 1회: 수강생 프로필 + 평가기록을 비동기 로드.
    const load = async () => {
      const client = getSupabase();
      // Supabase 미설정 환경(빌드/프리뷰 등)에서는 로딩만 해제하고 종료.
      if (!client) { setLoading(false); return; }
      const gradeList = await getAllAssessments();
      // 본 사이트 수강생: signup_domain 일치 OR visited_sites 에 호스트 포함
      // (다른 dreamitbiz 사이트로 가입했지만 rest 에서 평가를 본 사람도 포함)
      // .or() 안의 cs.{...} 는 배열 컬럼 contains 연산 (visited_sites 에 호스트 포함 여부).
      const { data: base } = await client
        .from('user_profiles')
        .select('*')
        .or(`signup_domain.eq.${REST_HOSTNAME},visited_sites.cs.{${REST_HOSTNAME}}`);
      const merged = [...((base || []) as UserProfile[])];
      // 이미 포함된 계정 id 집합 — 중복 보강 방지용.
      const seen = new Set(merged.map((u) => u.id));
      // 평가기록은 있으나 위 목록에 없는 계정(타 도메인 가입 등)은 student_id 로 직접 보강 → 점수 누락 방지
      const missingIds = [...new Set(gradeList.map((g) => g.student_id))].filter((id) => id && !seen.has(id));
      if (missingIds.length) {
        // 누락된 id 들의 프로필을 추가 조회해 merged 에 합침(이미 본 id는 건너뜀).
        const { data: byId } = await client.from('user_profiles').select('*').in('id', missingIds);
        for (const u of (byId || []) as UserProfile[]) if (!seen.has(u.id)) { seen.add(u.id); merged.push(u); }
      }
      // 총괄관리자·관리자(역할) + 백진주 등 관리자 이메일(ADMIN_EMAILS) 제외 → 순수 수강생만
      // 정렬: 표시 이름 우선순위(display_name → name → email)로 한글 로캘 가나다 정렬.
      const list = merged
        .filter((u) => !STAFF_ROLES.includes(u.role) && !ADMIN_EMAILS.includes((u.email || '').toLowerCase()))
        .sort((a, b) => (a.display_name || a.name || a.email || '').localeCompare(b.display_name || b.name || b.email || ''));
      setStudents(list);
      setGrades(gradeList);
      setLoading(false);
    };
    load();
  }, []);

  // 동일인(전화/이름) 통합 — 이메일 2개여도 한 명, 성적은 두 계정 중 최고점 채택
  // groupByPerson: 계정 목록을 사람 단위(person)로 묶음. students 변경 시에만 재계산.
  const people = useMemo(() => groupByPerson(students), [students]);

  /**
   * pickBest — 같은 사람의 여러 계정(student_id) 중, 한 평가종류에서 최고점 기록 선택.
   * 매개변수: g1(기존 누적 기록|undefined), g2(비교 대상 기록).
   * 반환값: 더 나은(높은 점수, 동점이면 더 최근) AssessmentRecord.
   * 부수효과: 없음(순수 함수).
   */
  const pickBest = (g1: AssessmentRecord | undefined, g2: AssessmentRecord): AssessmentRecord => {
    if (!g1) return g2;
    if (g2.score !== g1.score) return g2.score > g1.score ? g2 : g1;
    // 동점이면 더 최근 제출
    return (g2.submitted_at || '') > (g1.submitted_at || '') ? g2 : g1;
  };

  /** personKey → { type → 성적(동일인 합산) } 매핑 */
  // grades 또는 people 변경 시 재계산. 각 사람의 모든 계정 id를 훑어 종류별 최고점만 남김.
  const gradeMap = useMemo(() => {
    const m = new Map<string, Record<string, AssessmentRecord>>();
    people.forEach((p) => {
      // 이 사람에 속한 계정 id 집합.
      const idSet = new Set(p.ids);
      const byType: Record<string, AssessmentRecord> = {};
      grades.forEach((g) => {
        // 이 사람의 계정이 아니면 무시.
        if (!idSet.has(g.student_id)) return;
        // 같은 평가종류에서 더 나은 기록으로 갱신.
        byType[g.type] = pickBest(byType[g.type], g);
      });
      m.set(p.key, byType);
    });
    return m;
  }, [grades, people]);

  /**
   * 고아 점수 — 평가기록은 있으나 표시된 수강생 목록에 매칭되는 계정이 없는 경우.
   * (signup_domain 불일치·관리자필터·프로필 누락 등으로 student_id 가 안 잡힘 →
   *  점수가 DB엔 있는데 표에서 조용히 사라지던 문제를 드러냄)
   */
  const orphanGrades = useMemo(() => {
    // 표에 표시되는 모든 사람의 계정 id 집합 구성.
    const known = new Set<string>();
    people.forEach((p) => p.ids.forEach((id) => known.add(id)));
    // 알려진 id에 속하지 않는 평가기록만 추려 경고로 노출.
    return grades.filter((g) => !known.has(g.student_id));
  }, [grades, people]);

  /** 평가별 통계 (응시 인원 / 합격 인원 / 평균) — 동일인 1명 기준 */
  // gradeMap 변경 시 재계산.
  const stats = useMemo(() => {
    return GRADED_TYPES.map((t) => {
      // 해당 종류 기록만 추출(미응시자는 undefined → filter 로 제거).
      const rows = Array.from(gradeMap.values()).map((byType) => byType[t]).filter(Boolean) as AssessmentRecord[];
      const passed = rows.filter((g) => g.passed).length;
      // 평균은 정수 반올림, 응시자 0명이면 0.
      const avg = rows.length ? Math.round(rows.reduce((s, g) => s + g.score, 0) / rows.length) : 0;
      return { type: t, taken: rows.length, passed, avg };
    });
  }, [gradeMap]);

  // ── 성적표 다운로드 (선수평가 / 사후평가 × Excel / PDF) ──
  // 다운로드 파일의 헤더 컬럼 순서.
  const GRADE_COLUMNS = ['No.', '이름', '이메일', '점수', '합격여부', '정답수', '총문항', '응시일시'];
  // 평가 종류별 합격 기준 점수(부제목 표기용).
  const PASS_SCORE: Record<string, number> = { prerequisite: 40, summative: 60 };

  /**
   * buildGradeRows — 특정 평가종류의 성적표 행(2차원 셀 배열) 생성.
   * 매개변수: type(평가 종류).
   * 반환값: 사람 1명 = 1행인 Cell[][] (미응시자도 빈/미응시로 포함).
   * 부수효과: 없음.
   */
  const buildGradeRows = (type: typeof GRADED_TYPES[number]): Cell[][] =>
    people.map((g, idx) => {
      // 이 사람의 해당 종류 기록(없으면 undefined).
      const rec = (gradeMap.get(g.key) || {})[type];
      return [
        idx + 1,
        g.name,
        g.emails.join(' / '),
        rec ? rec.score : '',
        rec ? (rec.passed ? '합격' : '불합격') : '미응시',
        rec ? rec.correct : '',
        rec ? rec.total : '',
        rec?.submitted_at ? new Date(rec.submitted_at).toLocaleString('ko-KR') : '',
      ];
    });

  /**
   * subtitleFor — PDF 성적표 상단 부제목 문자열 생성(학원명·종류·합격기준·인원·발행일).
   * 매개변수: type(평가 종류). 반환값: 부제목 string. 부수효과: 없음.
   */
  const subtitleFor = (type: typeof GRADED_TYPES[number]): string =>
    `AI Reboot Academy · ${TYPE_LABEL[type]} · 합격기준 ${PASS_SCORE[type]}점 · 수강생 ${people.length}명 · 발행 ${new Date().toLocaleDateString('ko-KR')}`;

  /** downloadExcel — 해당 종류 성적표를 .xlsx 로 내보냄. 부수효과: 파일 다운로드. */
  const downloadExcel = (type: typeof GRADED_TYPES[number]) =>
    exportTableExcel(`${TYPE_LABEL[type]}_성적표.xlsx`, TYPE_LABEL[type], GRADE_COLUMNS, buildGradeRows(type));
  /** downloadPdf — 해당 종류 성적표를 PDF 로 내보냄. 부수효과: 파일 다운로드. */
  const downloadPdf = (type: typeof GRADED_TYPES[number]) =>
    exportTablePdf(`${TYPE_LABEL[type]} 성적표`, GRADE_COLUMNS, buildGradeRows(type), subtitleFor(type));

  /**
   * scoreCell — 점수 셀 렌더러. 미응시면 회색 "미응시", 응시면 점수+합격/불합격 배지.
   * 매개변수: g(평가기록|undefined). 반환값: ReactElement. 부수효과: 없음.
   */
  const scoreCell = (g: AssessmentRecord | undefined): ReactElement => {
    if (!g) return <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>미응시</span>;
    return (
      <span style={{ fontWeight: 700, color: g.passed ? '#10b981' : '#ef4444' }}>
        {g.score}점
        <span style={{
          marginLeft: '6px', fontSize: '12px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px',
          background: g.passed ? '#d1fae5' : '#fee2e2', color: g.passed ? '#065f46' : '#991b1b',
        }}>{g.passed ? '합격' : '불합격'}</span>
      </span>
    );
  };

  return (
    <>
      {/* noindex: 관리자 전용 페이지라 검색엔진 색인 제외 */}
      <SEOHead title="학습평가 성적" path="/admin/grades" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 헤더: 제목/설명 + 우측 수강생 수(계정 통합 여부 표시) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>학습평가 성적</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                <strong>선수평가</strong>(합격 40점) · <strong>사후평가</strong>(합격 60점) 채점 결과입니다. 진단평가는 자습용이라 집계되지 않습니다.
              </p>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              수강생 {people.length}명
              {/* 통합 후 사람 수와 원본 계정 수가 다르면 "동일인 통합" 안내 노출 */}
              {people.length !== students.length && (
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}>
                  {' '}· 계정 {students.length}개(동일인 통합)
                </span>
              )}
            </div>
          </div>

          {/* 평가별 요약 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {stats.map((s) => (
              <div key={s.type} style={{
                border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px',
                padding: '16px 18px', background: 'var(--bg-white, #fff)',
              }}>
                <strong style={{ fontSize: '14.5px' }}>{TYPE_LABEL[s.type]}</strong>
                <div style={{ display: 'flex', gap: '18px', marginTop: '8px', fontSize: '13.5px' }}>
                  <span>응시 <strong>{s.taken}</strong></span>
                  <span>합격 <strong style={{ color: '#10b981' }}>{s.passed}</strong></span>
                  <span>평균 <strong>{s.avg}점</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* 고아 점수 경고 — 기록은 있으나 수강생 목록에 매칭 안 된 평가 */}
          {/* 로딩 완료 후 + 고아 기록이 있을 때만 표시 */}
          {!loading && orphanGrades.length > 0 && (
            <div style={{
              marginBottom: '24px', padding: '14px 16px', borderRadius: '12px',
              background: '#fff7ed', border: '1px solid #fdba74',
            }}>
              <strong style={{ fontSize: '14px', color: '#9a3412' }}>
                ⚠ 매칭 안 된 평가기록 {orphanGrades.length}건
              </strong>
              <p style={{ margin: '4px 0 10px', fontSize: '12.5px', color: '#9a3412' }}>
                점수는 저장돼 있으나 수강생 계정과 연결되지 않았습니다. 가입 도메인이 다르거나(다른 사이트로 가입),
                프로필이 없는 계정으로 응시한 경우입니다. 아래 이메일로 가입 상태를 확인하세요.
              </p>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead><tr><th>이름</th><th>이메일</th><th>평가</th><th>점수</th><th>응시일시</th><th>student_id</th></tr></thead>
                  <tbody>
                    {/* key: student_id+type 조합으로 한 사람의 여러 평가도 고유 보장 */}
                    {orphanGrades.map((g) => (
                      <tr key={`${g.student_id}-${g.type}`}>
                        <td>{g.student_name || '-'}</td>
                        <td>{g.student_email || '-'}</td>
                        <td>{TYPE_LABEL[g.type] || g.type}</td>
                        <td>{scoreCell(g)}</td>
                        <td>{g.submitted_at ? new Date(g.submitted_at).toLocaleString('ko-KR') : '-'}</td>
                        {/* 매칭 디버깅용 원본 student_id 노출(monospace) */}
                        <td style={{ fontSize: '11px', color: 'var(--text-secondary, #9ca3af)', fontFamily: 'monospace' }}>{g.student_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 성적표 다운로드 */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '24px',
            padding: '14px 16px', background: 'var(--bg-light-gray, #f8f9fa)',
            border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px',
          }}>
            {/* 평가 종류별로 Excel/PDF 버튼 한 쌍씩 생성 */}
            {GRADED_TYPES.map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '13.5px' }}>{TYPE_LABEL[t]} 성적표</strong>
                {/* 로딩 중이거나 수강생이 없으면 다운로드 비활성화 */}
                <button type="button" onClick={() => downloadExcel(t)} disabled={loading || people.length === 0} style={{
                  padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: 'none', borderRadius: '7px', background: '#107c41', color: '#fff',
                }}>⬇ Excel</button>
                <button type="button" onClick={() => downloadPdf(t)} disabled={loading || people.length === 0} style={{
                  padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  border: 'none', borderRadius: '7px', background: '#b91c1c', color: '#fff',
                }}>⬇ PDF</button>
              </div>
            ))}
          </div>

          {/* 본문: 로딩 중 → 스피너 / 수강생 0명 → 안내 / 그 외 → 성적 테이블 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : people.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: 'var(--bg-light-gray, #f8f9fa)',
              borderRadius: '12px', color: 'var(--text-secondary, #6b7280)',
            }}>
              본 사이트에 가입한 학생이 없습니다.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th style={{ width: '48px', textAlign: 'center' }}>No.</th><th>이름</th><th>이메일</th><th>선수평가</th><th>사후평가</th><th>최근 응시</th></tr></thead>
                <tbody>
                  {/* 사람(통합 단위) 1명 = 1행 */}
                  {people.map((g, idx) => {
                    // 이 사람의 종류별 최고점 맵.
                    const byType = gradeMap.get(g.key) || {};
                    // 응시한 평가들의 제출일시만 모아(undefined 제거)…
                    const dates = GRADED_TYPES.map((t) => byType[t]?.submitted_at).filter(Boolean) as string[];
                    // …문자열(ISO) 정렬 후 가장 마지막 = 최근 응시일.
                    const latest = dates.sort().slice(-1)[0];
                    return (
                      <tr key={g.key}>
                        <td style={{ textAlign: 'center', color: 'var(--text-secondary, #6b7280)' }}>{idx + 1}</td>
                        <td>
                          {g.name}
                          {/* 동일인 통합된 사람은 계정 수 배지 표시(툴팁에 합산 설명) */}
                          {g.isMerged && (
                            <span title={`동일인 ${g.accounts.length}계정 — 최고점 합산`} style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 7px',
                              borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                            }}>동일인 {g.accounts.length}계정</span>
                          )}
                        </td>
                        <td>
                          {/* 여러 이메일을 줄바꿈 표시. 두 번째부터는 작고 흐리게(보조 계정) */}
                          {g.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '13px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                          ))}
                        </td>
                        <td>{scoreCell(byType.prerequisite)}</td>
                        <td>{scoreCell(byType.summative)}</td>
                        <td>{latest ? new Date(latest).toLocaleDateString('ko-KR') : '-'}</td>
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

export default AdminGrades;
