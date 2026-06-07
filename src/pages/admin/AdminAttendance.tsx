/**
 * AdminAttendance.tsx
 * ────────────────────────────────────────────────────────────────────────
 * 역할: 관리자(총괄/일반) 전용 "출결 관리(출결일지)" 페이지 컴포넌트.
 *
 * 책임:
 *  - 선택한 날짜의 학생 자가 체크인 현황을 표로 보여주고, 관리자가 출결 상태를
 *    출석/지각/결석/사유로 수정·보완하거나 상태를 해제(삭제)할 수 있게 한다.
 *  - 6월 한 달간의 전체 출석 현황을 정규 수업일 매트릭스로 집계해 표시한다.
 *  - 일자별 출결일지를 Word/PDF 파일로 내보낸다.
 *  - "동일인(전화/이름 기준 같은 사람)이 이메일 2개 이상으로 가입"한 경우를
 *    groupByPerson 으로 한 명으로 통합해 다룬다.
 *
 * 출석 대상 필터링(인증/권한 관련):
 *  - user_profiles 테이블에서 signup_domain 이 본 사이트 호스트명과 일치하는
 *    사용자만 조회(타 사이트 가입자 제외).
 *  - 그중 STAFF_ROLES(admin/superadmin) 역할 + ADMIN_EMAILS(관리자 이메일)는
 *    출석 대상에서 제외하여 순수 학생만 남긴다.
 *
 * 주요 export: 기본 export 인 AdminAttendance 컴포넌트.
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import { useToast } from '../../contexts/ToastContext';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import { groupByPerson, type PersonGroup } from '../../utils/people';
import { exportTableWord, exportTablePdf, type Cell } from '../../utils/exportTable';
import { ADMIN_EMAILS } from '../../config/admin';
import type { Attendance, UserProfile } from '../../types';

// 사용할 Supabase 테이블명. site.dbPrefix(사이트별 접두사)를 붙여 멀티사이트 충돌 방지
const TABLES = { attendance: `${site.dbPrefix}attendance` };
// 본 사이트의 호스트명(예: rest.dreamitbiz.com). signup_domain 필터에 사용
const REST_HOSTNAME = new URL(site.url).hostname;
// 출석 대상에서 제외할 스태프 역할 목록
const STAFF_ROLES = ['admin', 'superadmin'];

/** 정규 수업일 (6/1~6/22 평일, 6/3 공휴일) */
const CLASS_DAYS: number[] = (() => {
  // 즉시실행함수(IIFE)로 6월 1~22일 중 수업일만 산출해 상수에 고정
  const arr: number[] = [];
  for (let d = 1; d <= 22; d++) {
    // 월은 0-based 이므로 5 = 6월. 해당 일자의 요일(0=일,6=토) 계산
    const dow = new Date(2026, 5, d).getDay();
    // 주말(일/토) 및 공휴일(6/3) 제외한 평일만 수업일로 포함
    if (dow !== 0 && dow !== 6 && d !== 3) arr.push(d);
  }
  return arr;
})();
// 월별 매트릭스 셀에 표시할 상태별 한 글자 약어
const ABBR: Record<string, string> = { present: '출', late: '지', absent: '결', excused: '사' };
// 상태별 약어 색상(녹색=출석, 주황=지각, 빨강=결석, 회색=사유)
const ABBR_COLOR: Record<string, string> = { present: '#10b981', late: '#d97706', absent: '#ef4444', excused: '#6b7280' };
// 일자(1~22)를 'YYYY-06-DD' 형식 날짜 문자열로 변환(monthLookup 키 생성용)
const dateOfJune = (d: number) => `2026-06-${String(d).padStart(2, '0')}`;

// 출결 관리 메인 컴포넌트
const AdminAttendance = (): ReactElement => {
  // 토스트 알림 표시 함수
  const { showToast } = useToast();
  // selectedDate 의 출결 레코드 목록(일자별 표용)
  const [records, setRecords] = useState<Attendance[]>([]);
  // 6월 한 달 전체 출결 레코드(월별 매트릭스용)
  const [monthly, setMonthly] = useState<Attendance[]>([]);
  // 출석 대상 학생(사용자 프로필) 목록
  const [students, setStudents] = useState<UserProfile[]>([]);
  // 조회 기준 날짜. 기본값은 오늘(YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // 로딩 상태(스피너 표시 및 버튼 비활성화 제어)
  const [loading, setLoading] = useState(true);

  // selectedDate 기준 일자/월별 출결 + 학생 목록을 한 번에 로드
  const loadData = async () => {
    const client = getSupabase();
    // Supabase 미초기화 시 로딩만 해제하고 중단(엣지케이스)
    if (!client) { setLoading(false); return; }

    // 출석 대상: 본 사이트 가입 학생만 (총괄관리자/관리자 역할 + 백진주 등 관리자 이메일 제외)
    // 세 가지 쿼리를 병렬 실행: ① 선택일 출결, ② 6월 전체 출결, ③ 본 사이트 가입 프로필
    const [attRes, monthRes, signupRes] = await Promise.all([
      client.from(TABLES.attendance).select('*').eq('date', selectedDate),
      client.from(TABLES.attendance).select('student_id, date, status').gte('date', '2026-06-01').lte('date', '2026-06-30'),
      client.from('user_profiles').select('*').eq('signup_domain', REST_HOSTNAME),
    ]);

    // 선택일 출결 레코드 반영(데이터 없으면 기존 상태 유지)
    if (attRes.data) setRecords(attRes.data as Attendance[]);
    // 월별 레코드 반영(null 방어로 빈 배열 대입)
    setMonthly((monthRes.data || []) as Attendance[]);

    // 가입자 중 스태프 역할/관리자 이메일 제외 → 학생만 남기고 표시명 기준 정렬
    const list = ((signupRes.data || []) as UserProfile[])
      .filter((u) => !STAFF_ROLES.includes(u.role) && !ADMIN_EMAILS.includes((u.email || '').toLowerCase()))
      .sort((a, b) => (a.display_name || a.name || a.email || '').localeCompare(b.display_name || b.name || b.email || ''));
    setStudents(list);
    setLoading(false);
  };

  // selectedDate 변경 시마다 데이터 재로드(날짜 선택 → 즉시 갱신)
  useEffect(() => { loadData(); }, [selectedDate]);

  // 동일인(전화/이름) 통합 — 이메일 2개여도 한 명. 출결은 모든 계정 id 기준으로 조회
  // students 가 바뀔 때만 재계산(useMemo 메모이제이션)
  const people = useMemo(() => groupByPerson(students), [students]);

  /** 동일인의 여러 계정 중 선택일 출결 레코드 */
  // person.ids(동일인의 모든 계정 id) 중 하나라도 일치하는 레코드를 찾음
  const findRecord = (ids: string[]) => records.find(r => ids.includes(r.student_id));

  // 출결 상태 기록/수정(출석/결석/지각/사유)
  const markAttendance = async (person: PersonGroup, status: 'present' | 'absent' | 'late' | 'excused') => {
    const client = getSupabase();
    if (!client) return;
    // 동일인의 기존 출결 레코드 존재 여부 확인
    const existing = findRecord(person.ids);
    if (existing) {
      // 관리자 수정·보완: 상태만 변경, 학생의 원래 체크인 시각은 보존
      await client.from(TABLES.attendance).update({ status }).eq('id', existing.id);
    } else {
      // 신규 기록은 대표 계정 id로 저장
      // 체크인 시각은 관리자가 기록하는 현재 시각으로 설정
      await client.from(TABLES.attendance).insert({ student_id: person.primary.id, date: selectedDate, status, check_in_time: new Date().toISOString() });
    }
    showToast('출결이 수정되었습니다.', 'success');
    // DB 반영 후 화면 동기화를 위해 재로드
    await loadData();
  };

  // 상태 해제 — 선택일의 출결 기록 삭제(미체크 상태로 되돌림)
  const clearAttendance = async (person: PersonGroup) => {
    const client = getSupabase();
    if (!client) return;
    const existing = findRecord(person.ids);
    // 기록이 없으면 삭제할 대상이 없으므로 중단
    if (!existing) return;
    await client.from(TABLES.attendance).delete().eq('id', existing.id);
    showToast('출결 상태를 해제했습니다.', 'success');
    await loadData();
  };

  // 선택일 출결 상태 조회(없으면 'none')
  const getStatus = (ids: string[]) => findRecord(ids)?.status || 'none';
  // 선택일 체크인 시각을 한국어 시:분 형식으로 반환(없으면 '-')
  const getCheckIn = (ids: string[]) => {
    const t = findRecord(ids)?.check_in_time;
    return t ? new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';
  };

  // 월별 매트릭스 조회 { personKey|date → status } — 동일인 합산(우선순위: 출석>지각>사유>결석)
  // 같은 날 같은 사람이 여러 계정으로 기록 시 더 높은 우선순위 상태를 채택하기 위한 가중치
  const STATUS_RANK: Record<string, number> = { present: 3, late: 2, excused: 1, absent: 0 };
  // 계정 id → 동일인 key 매핑 테이블(월별 레코드를 사람 단위로 묶기 위함)
  const idToKey = new Map<string, string>();
  people.forEach(p => p.ids.forEach(id => idToKey.set(id, p.key)));
  // 'personKey|date' → status 조회용 룩업 테이블
  const monthLookup: Record<string, string> = {};
  monthly.forEach(r => {
    const pkey = idToKey.get(r.student_id);
    // 출석 대상이 아닌(매핑 없는) 레코드는 건너뜀
    if (!pkey) return;
    const k = `${pkey}|${r.date}`;
    const prev = monthLookup[k];
    // 동일 키에 기존 값이 없거나, 새 상태의 우선순위가 더 높으면 갱신
    if (!prev || (STATUS_RANK[r.status] ?? -1) > (STATUS_RANK[prev] ?? -1)) monthLookup[k] = r.status;
  });
  // 특정 사람(pkey)의 특정 상태(st) 일수를 정규 수업일 범위에서 카운트
  const tally = (pkey: string, st: string) => CLASS_DAYS.filter(d => monthLookup[`${pkey}|${dateOfJune(d)}`] === st).length;

  // ── 일자별 출결일지 다운로드 (Word / PDF) ──
  // 상태 코드 → 한국어 표기 매핑(파일 출력용)
  const STATUS_KO: Record<string, string> = { present: '출석', late: '지각', absent: '결석', excused: '사유', none: '-' };
  // 내보낼 표의 열 제목
  const ATT_COLUMNS = ['이름', '이메일', '체크인', '출결상태'];
  // 사람 단위로 표의 각 행(Cell 배열)을 구성. 이메일은 ' / '로 결합
  const buildAttendanceRows = (): Cell[][] =>
    people.map((g) => [g.name, g.emails.join(' / '), getCheckIn(g.ids), STATUS_KO[getStatus(g.ids)] || '-']);
  // 문서 제목/부제(대상 인원수·발행일 포함)
  const attTitle = `출결일지 ${selectedDate}`;
  const attSubtitle = `AI Reboot Academy · ${selectedDate} · 대상 ${people.length}명 · 발행 ${new Date().toLocaleDateString('ko-KR')}`;
  // Word 다운로드 핸들러(파일명/제목/열/행/부제 전달)
  const downloadAttWord = () => exportTableWord(`출결일지_${selectedDate}`, attTitle, ATT_COLUMNS, buildAttendanceRows(), attSubtitle);
  // PDF 다운로드 핸들러
  const downloadAttPdf = () => exportTablePdf(attTitle, ATT_COLUMNS, buildAttendanceRows(), attSubtitle);

  return (
    <>
      {/* 검색엔진 비노출(noindex) 관리자 페이지 메타 설정 */}
      <SEOHead title="출석 관리" path="/admin/attendance" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 상단 헤더: 제목/설명과 총 인원 요약 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0 }}>출결일지</h2>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                학생 자가 체크인 시각을 확인하고 출결을 <strong>수정·보완</strong>하세요. <strong>rest.dreamitbiz.com 가입 학생</strong>만 표시됩니다(관리자 제외).
              </p>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
              총 {people.length}명
              {/* 통합된 사람 수와 실제 계정 수가 다를 때만 계정 수를 부가 표기 */}
              {people.length !== students.length && (
                <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary, #6b7280)' }}>
                  {' '}· 계정 {students.length}개(동일인 통합)
                </span>
              )}
            </div>
          </div>
          {/* 날짜 선택 + 출결일지 다운로드 버튼 영역 */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* 날짜 변경 시 selectedDate 갱신 → useEffect 로 재조회 */}
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="date-input" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>이 날짜 출결일지:</span>
            {/* 로딩 중이거나 대상이 없으면 다운로드 버튼 비활성화 */}
            <button type="button" onClick={downloadAttWord} disabled={loading || people.length === 0} style={{
              padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: 'none', borderRadius: '7px', background: '#2b579a', color: '#fff',
            }}>⬇ Word</button>
            <button type="button" onClick={downloadAttPdf} disabled={loading || people.length === 0} style={{
              padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: 'none', borderRadius: '7px', background: '#b91c1c', color: '#fff',
            }}>⬇ PDF</button>
          </div>
          {/* 로딩/빈 상태/데이터 표 3분기 렌더링 */}
          {loading ? (
            // 로딩 중: 스피너 표시
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : people.length === 0 ? (
            // 대상 학생이 한 명도 없을 때의 빈 상태 안내
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-secondary, #f8f9fa)',
              borderRadius: '12px',
              color: 'var(--text-secondary, #6b7280)',
            }}>
              본 사이트에 가입한 학생이나 등록된 관리자가 없습니다.
            </div>
          ) : (
            // 일자별 출결 표
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead><tr><th>구분</th><th>이름</th><th>이메일</th><th>체크인</th><th>상태</th><th>수정·보완</th></tr></thead>
                <tbody>
                  {people.map(g => {
                    // 대표 계정(primary) 기준으로 구분/역할 표시
                    const s = g.primary;
                    const status = getStatus(g.ids);
                    // 스태프 여부에 따라 배지 색/문구 분기
                    const isStaff = STAFF_ROLES.includes(s.role);
                    return (
                      <tr key={g.key}>
                        <td>
                          {/* 역할 배지: 스태프는 노란 계열, 학생은 파란 계열 */}
                          <span className={`role-badge ${s.role}`} style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            background: isStaff ? '#fef3c7' : '#dbeafe',
                            color: isStaff ? '#92400e' : '#1e3a8a',
                          }}>
                            {s.role === 'superadmin' ? '총괄 관리자' : s.role === 'admin' ? '관리자' : '학생'}
                          </span>
                        </td>
                        <td>
                          {g.name}
                          {/* 동일인 통합 그룹이면 합쳐진 계정 수 배지 표시 */}
                          {g.isMerged && (
                            <span title={`동일인 ${g.accounts.length}계정`} style={{
                              marginLeft: '6px', fontSize: '11px', fontWeight: 700, padding: '1px 6px',
                              borderRadius: '999px', background: '#ede9fe', color: '#5b21b6',
                            }}>동일인 {g.accounts.length}</span>
                          )}
                        </td>
                        <td>
                          {/* 동일인의 여러 이메일을 줄바꿈으로 나열(2번째부터 보조 스타일) */}
                          {g.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                          ))}
                        </td>
                        {/* 체크인 시각(숫자 정렬용 tabular-nums) */}
                        <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary, #6b7280)' }}>{getCheckIn(g.ids)}</td>
                        {/* 현재 출결 상태를 한국어로 표시 */}
                        <td><span className={`attendance-status ${status}`}>{status === 'present' ? '출석' : status === 'absent' ? '결석' : status === 'late' ? '지각' : status === 'excused' ? '사유' : '-'}</span></td>
                        <td>
                          {/* 수정·보완 버튼들: 현재 상태와 같으면 active 강조 */}
                          <div className="attendance-actions">
                            <button className={`att-btn ${status === 'present' ? 'active' : ''}`} onClick={() => markAttendance(g, 'present')}>출석</button>
                            <button className={`att-btn ${status === 'late' ? 'active' : ''}`} onClick={() => markAttendance(g, 'late')}>지각</button>
                            <button className={`att-btn ${status === 'absent' ? 'active' : ''}`} onClick={() => markAttendance(g, 'absent')}>결석</button>
                            <button className={`att-btn ${status === 'excused' ? 'active' : ''}`} onClick={() => markAttendance(g, 'excused')}>사유</button>
                            {/* 미체크(none) 상태에서는 해제 버튼 비활성화 */}
                            <button className="att-btn att-btn-clear" onClick={() => clearAttendance(g)} disabled={status === 'none'} title="출결 상태 해제(미체크로 되돌림)">상태해제</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 월별 전체 출석 현황 */}
          {/* 로딩이 끝나고 대상이 있을 때만 6월 매트릭스 표시 */}
          {!loading && people.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ margin: '0 0 4px' }}>6월 전체 출석 현황</h3>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>
                정규 수업일 {CLASS_DAYS.length}일 기준 (6/1~6/22 평일, 6/3 공휴일) · <span style={{ color: '#10b981', fontWeight: 700 }}>출</span> 출석 · <span style={{ color: '#d97706', fontWeight: 700 }}>지</span> 지각 · <span style={{ color: '#ef4444', fontWeight: 700 }}>결</span> 결석 · <span style={{ color: '#6b7280', fontWeight: 700 }}>사</span> 사유
              </p>
              <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {/* 이름 열은 가로 스크롤 시 좌측 고정(sticky) */}
                      <th style={{ position: 'sticky', left: 0, background: 'var(--bg-light-gray, #f5f7fa)' }}>이름</th>
                      {/* 수업일 일자를 열 헤더로 나열 */}
                      {CLASS_DAYS.map(d => <th key={d} style={{ textAlign: 'center', minWidth: '30px' }}>{d}</th>)}
                      <th style={{ textAlign: 'center' }}>출석</th>
                      <th style={{ textAlign: 'center' }}>지각</th>
                      <th style={{ textAlign: 'center' }}>결석</th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map(g => (
                      <tr key={g.key}>
                        {/* 이름 셀도 좌측 고정 */}
                        <td style={{ position: 'sticky', left: 0, background: 'var(--bg-white, #fff)', fontWeight: 600, whiteSpace: 'nowrap' }}>{g.name}</td>
                        {CLASS_DAYS.map(d => {
                          // 해당 사람·날짜의 통합 상태를 룩업
                          const st = monthLookup[`${g.key}|${dateOfJune(d)}`];
                          return (
                            <td key={d} style={{ textAlign: 'center', padding: '6px 2px' }}>
                              {/* 기록 있으면 색상 약어, 없으면 점(·) 표시 */}
                              {st ? <span style={{ fontWeight: 800, color: ABBR_COLOR[st] }}>{ABBR[st]}</span> : <span style={{ color: 'var(--border-light, #d1d5db)' }}>·</span>}
                            </td>
                          );
                        })}
                        {/* 상태별 누계(출석/지각/결석) */}
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#10b981' }}>{tally(g.key, 'present')}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#d97706' }}>{tally(g.key, 'late')}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#ef4444' }}>{tally(g.key, 'absent')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAttendance;
