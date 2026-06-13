/**
 * AdminAttendance.tsx
 * ────────────────────────────────────────────────────────────────────────
 * 역할: 관리자(총괄/일반) 전용 "출결 관리(출결일지)" 페이지 컴포넌트.
 *
 * [초보자를 위한 배경 지식]
 *  - 이 파일은 "React 컴포넌트"이다. 컴포넌트란 화면의 한 조각을 그려내는
 *    함수라고 생각하면 된다. 이 함수는 마지막에 JSX(HTML처럼 생긴 코드)를
 *    return 하고, React가 그것을 실제 웹 화면으로 그려준다.
 *  - 확장자가 .tsx 인 이유: TypeScript(TS) + JSX 를 함께 쓰기 때문이다.
 *    TypeScript 는 자바스크립트에 "타입(자료형)"을 붙여 실수를 줄여주는 언어다.
 *    예: number(숫자), string(문자열), UserProfile(사용자 정보 묶음) 등.
 *  - "Supabase"는 이 프로젝트가 쓰는 데이터베이스(백엔드) 서비스다. 학생 정보,
 *    출결 기록 같은 데이터를 인터넷 너머 서버에 저장하고 불러온다.
 *  - "RLS(Row Level Security)/인증": Supabase는 로그인한 사용자의 권한에 따라
 *    어떤 행(row)을 읽고 쓸 수 있는지 서버에서 제한한다. 즉 여기서 데이터를
 *    불러올 수 있다는 것은 이미 관리자 권한으로 로그인했다는 뜻이다.
 *
 * 책임:
 *  - 선택한 날짜의 학생 자가 체크인 현황을 표로 보여주고, 관리자가 출결 상태를
 *    출석/지각/결석/사유로 수정·보완하거나 상태를 해제(삭제)할 수 있게 한다.
 *  - 6월 한 달간의 전체 출석 현황을 정규 수업일 매트릭스로 집계해 표시한다.
 *  - 일자별 출결일지를 Word/PDF 파일로 내보낸다.
 *  - "동일인(전화/이름 기준 같은 사람)이 이메일 2개 이상으로 가입"한 경우를
 *    groupByPerson 으로 한 명으로 통합해 다룬다.
 *    (왜? 한 학생이 구글 계정과 카카오 계정으로 따로 가입하면 표에 두 번
 *     나타나 버린다. 이를 한 줄로 합쳐 혼선을 막기 위함이다.)
 *
 * 출석 대상 필터링(인증/권한 관련):
 *  - user_profiles 테이블에서 signup_domain 이 본 사이트 호스트명과 일치하는
 *    사용자만 조회(타 사이트 가입자 제외).
 *    (여러 사이트가 같은 DB를 공유할 수 있어, 우리 사이트 가입자만 골라낸다.)
 *  - 그중 STAFF_ROLES(admin/superadmin) 역할 + ADMIN_EMAILS(관리자 이메일)는
 *    출석 대상에서 제외하여 순수 학생만 남긴다.
 *
 * 주요 export: 기본 export 인 AdminAttendance 컴포넌트.
 */
// React 훅(hook)들을 가져온다. 훅이란 "함수형 컴포넌트에서 상태/생명주기 같은
// React 기능을 쓰게 해주는 특수 함수"이며, 이름이 보통 use~ 로 시작한다.
//  - useState: 화면이 기억해야 하는 값(상태)을 다룬다.
//  - useEffect: 특정 시점(렌더 후, 값 변경 시)에 부수효과(데이터 로드 등)를 실행.
//  - useMemo: 비싼 계산 결과를 캐시(기억)해 불필요한 재계산을 막는다.
//  - type ReactElement: "React가 그릴 수 있는 화면 요소" 타입(반환 타입 표기용).
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import { EmojiIcon } from '../../utils/emojiIcon';
// 화면 구성 요소(컴포넌트)들을 다른 파일에서 가져온다. import 는 "다른 파일의
// 기능을 이 파일에서 쓰겠다"는 선언이다.
import AdminSidebar from '../../components/AdminSidebar'; // 관리자 화면 왼쪽 사이드바
import SEOHead from '../../components/SEOHead';           // <head> 태그(제목/검색노출) 설정 컴포넌트
// 커스텀 훅(우리가 만든 훅). 화면 우측 등에 잠깐 뜨는 알림(토스트)을 띄운다.
import { useToast } from '../../contexts/ToastContext';
// Supabase 클라이언트(데이터베이스에 접속하는 객체)를 가져오는 함수.
import getSupabase from '../../utils/supabase';
// 사이트 설정(주소, DB 접두사 등)이 담긴 객체.
import site from '../../config/site';
// 동일인 통합 유틸 함수와 그 결과 타입(PersonGroup).
import { groupByPerson, type PersonGroup } from '../../utils/people';
// 표를 Word/PDF 파일로 내보내는 함수들과 셀(Cell) 타입.
import { exportTableWord, exportTablePdf, type Cell } from '../../utils/exportTable';
// 출석 대상에서 제외할 관리자 이메일 목록.
import { ADMIN_EMAILS } from '../../config/admin';
// TypeScript 타입만 가져온다(import type). 실제 코드가 아니라 "자료형 정의"라서
// 빌드 결과물에는 포함되지 않는다.
import type { Attendance, UserProfile } from '../../types';

// 사용할 Supabase 테이블명. site.dbPrefix(사이트별 접두사)를 붙여 멀티사이트 충돌 방지
// 주의: 백틱(`)으로 감싼 부분은 "템플릿 리터럴"이라 부르며, ${...} 안의 값을 문자열에
//       끼워 넣는다. 예) dbPrefix 가 'rest_' 이면 결과는 'rest_attendance'.
const TABLES = { attendance: `${site.dbPrefix}attendance` };
// 본 사이트의 호스트명(예: rest.dreamitbiz.com). signup_domain 필터에 사용
// new URL(...) 은 주소 문자열을 분해해주는 내장 객체이고, .hostname 으로 도메인만 뽑는다.
const REST_HOSTNAME = new URL(site.url).hostname;
// 출석 대상에서 제외할 스태프 역할 목록
const STAFF_ROLES = ['admin', 'superadmin'];

/** 정규 수업일 (6/1~6/22 평일, 6/3 공휴일) */
const CLASS_DAYS: number[] = (() => {
  // 즉시실행함수(IIFE)로 6월 1~22일 중 수업일만 산출해 상수에 고정
  // IIFE(Immediately Invoked Function Expression): 함수를 정의하자마자 ()로 곧바로
  // 실행해 그 반환값을 얻는 패턴. 여기서는 반복 계산을 한 번만 해서 결과 배열을 만든다.
  const arr: number[] = [];
  for (let d = 1; d <= 22; d++) {
    // 월은 0-based 이므로 5 = 6월. 해당 일자의 요일(0=일,6=토) 계산
    // 주의: JavaScript Date 에서 "월"은 0부터 센다. 1월=0, 6월=5 이다(자주 하는 실수!).
    const dow = new Date(2026, 5, d).getDay();
    // 주말(일/토) 및 공휴일(6/3) 제외한 평일만 수업일로 포함
    if (dow !== 0 && dow !== 6 && d !== 3) arr.push(d);
  }
  return arr;
})();
// 월별 매트릭스 셀에 표시할 상태별 한 글자 약어
// Record<string, string> 은 "키도 문자열, 값도 문자열인 객체" 타입이다(사전/맵 형태).
const ABBR: Record<string, string> = { present: '출', late: '지', absent: '결', excused: '사' };
// 상태별 약어 색상(녹색=출석, 주황=지각, 빨강=결석, 회색=사유)
const ABBR_COLOR: Record<string, string> = { present: '#10b981', late: '#d97706', absent: '#ef4444', excused: '#6b7280' };
// 일자(1~22)를 'YYYY-06-DD' 형식 날짜 문자열로 변환(monthLookup 키 생성용)
// padStart(2, '0') 은 한 자리 숫자 앞에 0을 채워 두 자리로 만든다. 예) 5 → '05'.
const dateOfJune = (d: number) => `2026-06-${String(d).padStart(2, '0')}`;

// 출결 관리 메인 컴포넌트
// (): ReactElement 는 "이 함수는 인자를 받지 않고, 화면 요소를 반환한다"는 타입 표기.
const AdminAttendance = (): ReactElement => {
  // 토스트 알림 표시 함수
  // 구조 분해 할당: useToast() 가 돌려준 객체에서 showToast 만 꺼내 쓴다.
  const { showToast } = useToast();
  // selectedDate 의 출결 레코드 목록(일자별 표용)
  // useState 사용법: [현재값, 바꾸는함수] = useState(초깃값).
  // setRecords(...) 를 호출하면 React가 화면을 다시 그린다. (변수에 직접 대입하면 안 됨!)
  const [records, setRecords] = useState<Attendance[]>([]);
  // 6월 한 달 전체 출결 레코드(월별 매트릭스용)
  const [monthly, setMonthly] = useState<Attendance[]>([]);
  // 출석 대상 학생(사용자 프로필) 목록
  const [students, setStudents] = useState<UserProfile[]>([]);
  // 조회 기준 날짜. 기본값은 오늘(YYYY-MM-DD)
  // new Date().toISOString() → '2026-06-07T01:23:...Z' 형태. split('T')[0] 로 날짜만 자른다.
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // 로딩 상태(스피너 표시 및 버튼 비활성화 제어). 처음엔 true(데이터 불러오는 중).
  const [loading, setLoading] = useState(true);

  // selectedDate 기준 일자/월별 출결 + 학생 목록을 한 번에 로드
  // async 함수: 내부에서 await 로 "끝날 때까지 기다리는" 비동기 작업을 쓸 수 있다.
  // 부수효과(side effect): 외부의 데이터베이스에서 값을 읽어와 상태(state)를 바꾼다.
  const loadData = async () => {
    const client = getSupabase();
    // Supabase 미초기화 시 로딩만 해제하고 중단(엣지케이스)
    // 주의: client 가 없을 수 있으므로(설정 누락 등) 항상 먼저 확인한다. 안 하면 에러 발생.
    if (!client) { setLoading(false); return; }

    // 출석 대상: 본 사이트 가입 학생만 (총괄관리자/관리자 역할 + 백진주 등 관리자 이메일 제외)
    // 세 가지 쿼리를 병렬 실행: ① 선택일 출결, ② 6월 전체 출결, ③ 본 사이트 가입 프로필
    // Promise.all: 여러 비동기 작업을 "동시에" 보내고 모두 끝날 때까지 기다린다.
    //   하나씩 순서대로 await 하는 것보다 빠르다(셋이 동시에 진행되므로).
    //   반환은 입력 순서대로 [attRes, monthRes, signupRes] 배열에 담긴다.
    // 체이닝 의미: .from(테이블).select(컬럼).eq/gte/lte(조건) 으로 SQL 조회를 조립한다.
    //   .eq = 같음, .gte = 크거나같음(>=), .lte = 작거나같음(<=).
    const [attRes, monthRes, signupRes] = await Promise.all([
      client.from(TABLES.attendance).select('*').eq('date', selectedDate),
      client.from(TABLES.attendance).select('student_id, date, status').gte('date', '2026-06-01').lte('date', '2026-06-30'),
      client.from('user_profiles').select('*').eq('signup_domain', REST_HOSTNAME),
    ]);

    // 선택일 출결 레코드 반영(데이터 없으면 기존 상태 유지)
    // as Attendance[] 는 "이 값을 Attendance 배열로 취급하라"는 타입 단언(TypeScript 문법).
    if (attRes.data) setRecords(attRes.data as Attendance[]);
    // 월별 레코드 반영(null 방어로 빈 배열 대입)
    // (monthRes.data || []) : data 가 null/undefined 면 대신 빈 배열을 쓴다(에러 방지).
    setMonthly((monthRes.data || []) as Attendance[]);

    // 가입자 중 스태프 역할/관리자 이메일 제외 → 학생만 남기고 표시명 기준 정렬
    // filter: 조건이 true 인 항목만 남긴 "새 배열"을 만든다(원본은 그대로 — 불변성 유지).
    // sort: 항목을 정렬한다. localeCompare 는 한글/영문을 사전 순으로 비교한다.
    // 옵셔널 체이닝 대신 여기선 (u.email || '') 로 email 이 없을 때 빈 문자열로 대체한다.
    //   .toLowerCase() 는 대소문자 차이로 비교가 어긋나는 것을 막기 위함.
    const list = ((signupRes.data || []) as UserProfile[])
      .filter((u) => !STAFF_ROLES.includes(u.role) && !ADMIN_EMAILS.includes((u.email || '').toLowerCase()))
      .sort((a, b) => (a.display_name || a.name || a.email || '').localeCompare(b.display_name || b.name || b.email || ''));
    setStudents(list);
    setLoading(false); // 모든 처리가 끝났으니 로딩 종료(스피너 사라지고 표 표시)
  };

  // selectedDate 변경 시마다 데이터 재로드(날짜 선택 → 즉시 갱신)
  // useEffect(실행할함수, [의존성배열]): 의존성 값이 바뀔 때마다 함수를 실행한다.
  //   여기선 [selectedDate] 이므로 날짜가 바뀔 때(그리고 첫 렌더 직후) loadData 가 돈다.
  // 주의: 의존성 배열을 빼먹으면 매 렌더마다 실행되어 무한 호출이 될 수 있다.
  useEffect(() => { loadData(); }, [selectedDate]);

  // 동일인(전화/이름) 통합 — 이메일 2개여도 한 명. 출결은 모든 계정 id 기준으로 조회
  // students 가 바뀔 때만 재계산(useMemo 메모이제이션)
  // useMemo(계산함수, [의존성]): 의존성이 그대로면 이전 결과를 재사용해 불필요한 계산을 막는다.
  //   groupByPerson 이 무거울 수 있으니, students 가 바뀔 때만 다시 묶는다.
  const people = useMemo(() => groupByPerson(students), [students]);

  /** 동일인의 여러 계정 중 선택일 출결 레코드 */
  // person.ids(동일인의 모든 계정 id) 중 하나라도 일치하는 레코드를 찾음
  // find: 조건을 처음 만족하는 "한 개"를 반환(없으면 undefined). 동일인이 여러 계정으로
  //       체크인했어도 그중 하나의 출결 레코드를 찾아내기 위함.
  const findRecord = (ids: string[]) => records.find(r => ids.includes(r.student_id));

  // 출결 상태 기록/수정(출석/결석/지각/사유)
  // 매개변수: person(통합된 한 사람), status(설정할 상태 4종 중 하나).
  // 부수효과: DB를 변경한 뒤 토스트를 띄우고 화면 데이터를 다시 불러온다.
  const markAttendance = async (person: PersonGroup, status: 'present' | 'absent' | 'late' | 'excused') => {
    const client = getSupabase();
    if (!client) return; // 클라이언트 없으면 아무 것도 안 하고 종료
    // 동일인의 기존 출결 레코드 존재 여부 확인
    const existing = findRecord(person.ids);
    if (existing) {
      // 관리자 수정·보완: 상태만 변경, 학생의 원래 체크인 시각은 보존
      // (왜 시각을 안 건드리나? 학생이 실제로 찍은 시각은 사실 그대로 남겨두는 게 맞다.)
      await client.from(TABLES.attendance).update({ status }).eq('id', existing.id);
    } else {
      // 신규 기록은 대표 계정 id로 저장
      // 체크인 시각은 관리자가 기록하는 현재 시각으로 설정
      // new Date().toISOString(): 현재 시각을 표준(UTC, 'Z'로 끝나는) 문자열로 저장.
      await client.from(TABLES.attendance).insert({ student_id: person.primary.id, date: selectedDate, status, check_in_time: new Date().toISOString() });
    }
    showToast('출결이 수정되었습니다.', 'success');
    // DB 반영 후 화면 동기화를 위해 재로드
    // 주의: await 로 기다려야 최신 데이터가 화면에 반영된다. 비동기 경쟁(작업 순서가
    //       꼬여 옛 데이터가 보이는 현상)을 막기 위함이다.
    await loadData();
  };

  // 상태 해제 — 선택일의 출결 기록 삭제(미체크 상태로 되돌림)
  const clearAttendance = async (person: PersonGroup) => {
    const client = getSupabase();
    if (!client) return;
    const existing = findRecord(person.ids);
    // 기록이 없으면 삭제할 대상이 없으므로 중단
    if (!existing) return;
    // delete: 해당 id 의 행을 DB에서 영구 삭제한다. (되돌릴 수 없으니 신중)
    await client.from(TABLES.attendance).delete().eq('id', existing.id);
    showToast('출결 상태를 해제했습니다.', 'success');
    await loadData();
  };

  // 선택일 출결 상태 조회(없으면 'none')
  // 옵셔널 체이닝 ?. : findRecord 가 undefined 면 에러 없이 undefined 가 된다.
  //   그 뒤 || 'none' 으로 기본값을 준다. → 기록 없으면 'none' 반환.
  const getStatus = (ids: string[]) => findRecord(ids)?.status || 'none';
  // 선택일 체크인 시각을 한국어 시:분 형식으로 반환(없으면 '-')
  const getCheckIn = (ids: string[]) => {
    const t = findRecord(ids)?.check_in_time;
    // t 가 있으면 Date 로 바꿔 "오후 2:05" 같은 한국어 시각 문자열로, 없으면 '-' 반환.
    return t ? new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';
  };

  // 월별 매트릭스 조회 { personKey|date → status } — 동일인 합산(우선순위: 출석>지각>사유>결석)
  // 같은 날 같은 사람이 여러 계정으로 기록 시 더 높은 우선순위 상태를 채택하기 위한 가중치
  // (예: 한 계정은 '결석', 다른 계정은 '출석'이면 더 좋은 쪽인 '출석'을 택한다.)
  const STATUS_RANK: Record<string, number> = { present: 3, late: 2, excused: 1, absent: 0 };
  // 계정 id → 동일인 key 매핑 테이블(월별 레코드를 사람 단위로 묶기 위함)
  // Map: 키-값 쌍을 저장하는 자료구조. get(키)으로 값을 빠르게 찾는다.
  const idToKey = new Map<string, string>();
  // 각 사람(p)의 모든 계정 id 마다 "id → 그 사람의 key" 를 등록한다(이중 forEach).
  people.forEach(p => p.ids.forEach(id => idToKey.set(id, p.key)));
  // 'personKey|date' → status 조회용 룩업 테이블
  // 룩업(lookup) 테이블: 나중에 "이 사람의 이 날짜 상태가 뭐였지?"를 즉시 찾기 위한 사전.
  const monthLookup: Record<string, string> = {};
  monthly.forEach(r => {
    const pkey = idToKey.get(r.student_id);
    // 출석 대상이 아닌(매핑 없는) 레코드는 건너뜀
    // (스태프나 타 사이트 가입자처럼 students 에 없는 사람의 기록은 무시한다.)
    if (!pkey) return;
    const k = `${pkey}|${r.date}`; // 사람키와 날짜를 '|'로 합쳐 고유 키 생성
    const prev = monthLookup[k];
    // 동일 키에 기존 값이 없거나, 새 상태의 우선순위가 더 높으면 갱신
    // ?? -1 : STATUS_RANK 에 없는 알 수 없는 상태면 -1(최하위)로 취급(널 병합 연산자).
    if (!prev || (STATUS_RANK[r.status] ?? -1) > (STATUS_RANK[prev] ?? -1)) monthLookup[k] = r.status;
  });
  // 특정 사람(pkey)의 특정 상태(st) 일수를 정규 수업일 범위에서 카운트
  // 수업일들 중 해당 사람·날짜의 상태가 st 와 같은 날만 걸러(filter) 그 개수(length)를 센다.
  const tally = (pkey: string, st: string) => CLASS_DAYS.filter(d => monthLookup[`${pkey}|${dateOfJune(d)}`] === st).length;

  // ── 일자별 출결일지 다운로드 (Word / PDF) ──
  // 상태 코드 → 한국어 표기 매핑(파일 출력용)
  const STATUS_KO: Record<string, string> = { present: '출석', late: '지각', absent: '결석', excused: '사유', none: '-' };
  // 내보낼 표의 열 제목
  const ATT_COLUMNS = ['이름', '이메일', '체크인', '출결상태'];
  // 사람 단위로 표의 각 행(Cell 배열)을 구성. 이메일은 ' / '로 결합
  // map: 각 사람(g)을 [이름, 이메일들, 체크인, 상태] 형태의 한 줄(Cell 배열)로 변환한다.
  //      결과는 "행들의 배열" = 2차원 배열(Cell[][]).
  const buildAttendanceRows = (): Cell[][] =>
    people.map((g) => [g.name, g.emails.join(' / '), getCheckIn(g.ids), STATUS_KO[getStatus(g.ids)] || '-']);
  // 문서 제목/부제(대상 인원수·발행일 포함)
  const attTitle = `출결일지 ${selectedDate}`;
  const attSubtitle = `AI Reboot Academy · ${selectedDate} · 대상 ${people.length}명 · 발행 ${new Date().toLocaleDateString('ko-KR')}`;
  // Word 다운로드 핸들러(파일명/제목/열/행/부제 전달)
  // 버튼 클릭 시 호출되며, 현재 표 데이터를 즉석에서 만들어 파일로 내보낸다.
  const downloadAttWord = () => exportTableWord(`출결일지_${selectedDate}`, attTitle, ATT_COLUMNS, buildAttendanceRows(), attSubtitle);
  // PDF 다운로드 핸들러
  const downloadAttPdf = () => exportTablePdf(attTitle, ATT_COLUMNS, buildAttendanceRows(), attSubtitle);

  // 여기서부터 return 안의 JSX = "이 컴포넌트가 실제로 그리는 화면"이다.
  // <> ... </> 는 Fragment(빈 껍데기). 여러 요소를 불필요한 div 없이 함께 묶을 때 쓴다.
  // JSX 안에서 { } 를 쓰면 자바스크립트 값/식을 화면에 끼워 넣을 수 있다.
  return (
    <>
      {/* 검색엔진 비노출(noindex) 관리자 페이지 메타 설정 */}
      {/* noindex: 관리자 페이지가 구글 검색 결과에 뜨지 않게 막는 설정이다. */}
      <SEOHead title="출석 관리" path="/admin/attendance" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          {/* 상단 헤더: 제목/설명과 총 인원 요약 */}
          {/* style={{ ... }} : JSX에서 인라인 스타일은 객체로 준다(바깥 {}는 JS 표현식, 안쪽 {}는 객체). */}
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
              {/* 조건부 렌더링: {조건 && <JSX/>} 는 조건이 true 일 때만 JSX를 그린다. */}
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
            {/* "제어 컴포넌트": value 는 상태(selectedDate)가, 변경은 onChange 가 책임진다. */}
            {/* e.target.value 는 사용자가 입력창에 고른 새 날짜 문자열이다. */}
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="date-input" />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)' }}>이 날짜 출결일지:</span>
            {/* 로딩 중이거나 대상이 없으면 다운로드 버튼 비활성화 */}
            {/* disabled 조건이 true 면 버튼이 눌리지 않는다(빈 표를 받지 않도록 방지). */}
            <button type="button" onClick={downloadAttWord} disabled={loading || people.length === 0} style={{
              padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: 'none', borderRadius: '7px', background: '#2b579a', color: '#fff',
            }}><EmojiIcon char="⬇" /> Word</button>
            <button type="button" onClick={downloadAttPdf} disabled={loading || people.length === 0} style={{
              padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              border: 'none', borderRadius: '7px', background: '#b91c1c', color: '#fff',
            }}><EmojiIcon char="⬇" /> PDF</button>
          </div>
          {/* 로딩/빈 상태/데이터 표 3분기 렌더링 */}
          {/* 삼항 연산자(조건 ? A : B)를 중첩해 세 가지 화면 중 하나를 고른다. */}
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
                  {/* people 배열을 한 명씩 <tr>(표의 한 행)로 변환해 그린다. */}
                  {people.map(g => {
                    // 대표 계정(primary) 기준으로 구분/역할 표시
                    const s = g.primary;
                    const status = getStatus(g.ids);
                    // 스태프 여부에 따라 배지 색/문구 분기
                    const isStaff = STAFF_ROLES.includes(s.role);
                    return (
                      // 주의: 목록을 map 으로 그릴 때는 각 항목에 고유한 key 가 꼭 필요하다.
                      //       React가 어떤 항목이 바뀌었는지 효율적으로 추적하기 위함이다.
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
                          {/* map 의 두 번째 인자 i 는 인덱스(0부터). i > 0 이면 첫째가 아니므로 흐린 스타일. */}
                          {g.emails.map((e, i) => (
                            <div key={e} style={i > 0 ? { fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)' } : undefined}>{e}</div>
                          ))}
                        </td>
                        {/* 체크인 시각(숫자 정렬용 tabular-nums) */}
                        {/* tabular-nums: 숫자 폭을 일정하게 만들어 시각이 세로로 가지런히 보이게 한다. */}
                        <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary, #6b7280)' }}>{getCheckIn(g.ids)}</td>
                        {/* 현재 출결 상태를 한국어로 표시 */}
                        <td><span className={`attendance-status ${status}`}>{status === 'present' ? '출석' : status === 'absent' ? '결석' : status === 'late' ? '지각' : status === 'excused' ? '사유' : '-'}</span></td>
                        <td>
                          {/* 수정·보완 버튼들: 현재 상태와 같으면 active 강조 */}
                          {/* onClick={() => markAttendance(...)}: 화살표 함수로 감싸야 "클릭할 때" 실행된다. */}
                          {/* 주의: onClick={markAttendance(g, 'present')} 처럼 쓰면 렌더 즉시 실행돼 버린다. */}
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
              {/* overflowX: 'auto' — 표가 화면보다 넓으면 가로 스크롤이 생긴다(수업일이 많아서). */}
              <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {/* 이름 열은 가로 스크롤 시 좌측 고정(sticky) */}
                      {/* position: 'sticky', left: 0 — 가로로 스크롤해도 이름 칸이 왼쪽에 붙어 있게 한다. */}
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
                          // 앞서 만든 monthLookup 사전에서 '사람키|날짜' 로 상태를 즉시 꺼낸다.
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

// 이 컴포넌트를 기본(default) 내보내기. 다른 파일에서 import AdminAttendance 로 쓴다.
export default AdminAttendance;
