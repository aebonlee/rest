/**
 * AnnouncementDetail.tsx
 *
 * [이 파일이 무엇인가요?]
 *   사용자가 공지사항 "하나"를 클릭했을 때 그 공지의 전체 내용을 보여주는 화면(페이지)입니다.
 *   예: 주소창이 /announcements/123 이면, 123번 공지 한 건을 화면에 그려줍니다.
 *
 * [초보자를 위한 배경 용어]
 *   - React 컴포넌트: 화면의 한 조각(또는 한 페이지)을 만드는 함수입니다. 여기서는 "함수 1개 = 페이지 1개".
 *   - 라우트(route)/라우팅: 주소(URL)에 따라 어떤 화면을 보여줄지 정하는 규칙입니다.
 *   - 라우트 파라미터 :id : 주소의 일부를 변수처럼 받는 값입니다. /announcements/:id 에서 :id 자리에
 *     실제로 123이 들어오면 id === "123"이 됩니다. (항상 문자열 string 입니다!)
 *   - Supabase: 데이터를 저장/조회하는 백엔드(데이터베이스 + API)입니다. 여기서는 공지 데이터를 읽어옵니다.
 *   - 비동기(async): 데이터베이스에서 데이터를 가져오는 일은 "시간이 걸리는 작업"이라, 결과를 기다렸다가(await)
 *     처리해야 합니다. 그동안 화면은 "로딩 중"을 보여줍니다.
 *   - 상태(state): 화면이 기억해야 하는 값. 값이 바뀌면 React가 화면을 자동으로 다시 그립니다.
 *
 * 역할:
 *   - URL 파라미터(:id)로 전달된 단일 공지사항(announcement)의 상세 내용을 조회/표시하는 페이지 컴포넌트.
 *
 * 핵심 책임:
 *   - 라우트 파라미터 id를 읽어 Supabase 공지 테이블에서 해당 레코드 1건을 비동기 조회.
 *   - 로딩/없음(notFound)/정상 표시 3가지 상태를 분기 렌더링.
 *     (즉, 화면은 항상 이 셋 중 하나의 모습입니다: ① 로딩 스피너 ② "없음" 안내 ③ 실제 공지 내용)
 *   - SEOHead를 통한 페이지 메타데이터 설정(검색엔진 비노출 noindex).
 *
 * 주요 export:
 *   - default: AnnouncementDetail 컴포넌트.
 */

// [import] 다른 파일에 있는 기능을 이 파일로 "가져오기"하는 부분입니다.
//   - useState  : 컴포넌트가 값을 기억하게 해주는 React 훅(hook). (훅 = use로 시작하는 특수 함수)
//   - useEffect : "마운트(화면에 처음 나타남)" 또는 특정 값이 바뀔 때 코드를 실행하게 해주는 훅.
//   - type ReactElement : 이 컴포넌트가 "리액트 화면 요소"를 반환한다는 것을 타입으로 표시(TypeScript 문법).
import { useState, useEffect, type ReactElement } from 'react';
import { EmojiIcon } from '../utils/emojiIcon';
// useParams : 주소(URL)의 파라미터(:id 등)를 꺼내오는 훅. / Link : 새로고침 없이 다른 페이지로 이동하는 링크 컴포넌트.
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
// type Announcement : 공지 데이터 한 건의 "모양"을 정의한 타입(어떤 필드들이 있는지). import type은 타입만 가져옴.
import type { Announcement } from '../types';
import { CategoryBadge } from './Announcements';

// 조회 대상 테이블명. site.dbPrefix(프로젝트별 접두사) + 'announcements'로 동적 구성.
//   - 백틱(`)으로 감싼 문자열을 "템플릿 리터럴"이라 하며, ${...} 안의 값이 문자열에 끼워 넣어집니다.
//   - 예) dbPrefix가 'rest_'이면 TABLE === 'rest_announcements'. 프로젝트마다 테이블을 분리하기 위한 장치.
//   - 주의: 백틱 문자열 안에는 주석을 넣으면 안 됩니다(주석 글자가 그대로 문자열에 들어가 값이 망가짐).
const TABLE = `${site.dbPrefix}announcements`;

/**
 * AnnouncementDetail
 *   - 단일 공지사항 상세 페이지 컴포넌트.
 *   - 매개변수: 없음(라우트 파라미터 id는 useParams로 획득).
 *   - 반환값: 공지 상세 화면 ReactElement.
 *   - 부수효과: 마운트/ id 변경 시 Supabase에서 공지 1건을 비동기 조회하여 상태 갱신.
 *
 *   [왜 이렇게 하나요?]
 *     화면이 처음 그려진 직후에는 아직 데이터가 없습니다(서버에서 받아와야 하니까요).
 *     그래서 ① 일단 빈 화면 + 로딩 표시로 그리고 ② useEffect로 데이터를 불러온 뒤
 *     ③ 상태(state)를 갱신하면 React가 화면을 다시 그려서 실제 내용이 보이게 됩니다.
 */
const AnnouncementDetail = (): ReactElement => {
  // 라우트의 :id 파라미터(조회할 공지의 PK). 존재하지 않으면 undefined.
  //   - 구조 분해 할당: useParams()가 돌려준 객체에서 id 속성만 꺼내 변수 id로 받는 문법입니다.
  //   - useParams<{ id: string }>()의 <{...}>는 "이 파라미터의 타입은 이렇다"고 알려주는 TypeScript 표기.
  //   - 주의: URL에서 온 값이라 항상 문자열입니다. 숫자처럼 보여도 "123" 형태입니다.
  const { id } = useParams<{ id: string }>();
  // 조회된 공지 데이터. 초기/실패 시 null.
  //   - useState(초기값)는 [현재값, 값을바꾸는함수] 두 개를 배열로 돌려줍니다(구조 분해로 받음).
  //   - setItem(...)을 호출하면 item이 바뀌고 화면이 자동으로 다시 그려집니다.
  //   - <Announcement | null> : item은 "공지 데이터" 또는 "아직 없음(null)" 둘 중 하나라는 타입.
  const [item, setItem] = useState<Announcement | null>(null);
  // 비동기 조회 진행 여부. true 동안 스피너 노출.
  //   - 처음에는 true(=로딩 중)로 시작합니다. 데이터를 다 받으면 false로 바꿉니다.
  const [loading, setLoading] = useState(true);
  // 공지를 찾지 못했는지 여부(클라이언트 없음/ id 없음/ 데이터 없음).
  const [notFound, setNotFound] = useState(false);

  // useEffect: 첫 번째 인자(함수)를 "특정 시점"에 실행해 줍니다.
  //   - 여기서는 데이터 불러오기처럼 "화면 그리는 일 바깥의 작업(부수효과)"을 처리합니다.
  //   - 두 번째 인자 [id]는 "의존성 배열"입니다 → id 값이 바뀔 때마다 이 함수를 다시 실행합니다.
  useEffect(() => {
    // 공지 1건을 비동기로 불러오는 내부 함수.
    //   - useEffect의 콜백 자체는 async로 만들 수 없어서, 안에 async 함수(load)를 따로 만들고 아래에서 호출합니다.
    const load = async () => {
      const client = getSupabase(); // Supabase 접속 객체(클라이언트)를 가져옵니다. 설정이 없으면 null일 수 있음.
      // Supabase 클라이언트가 없거나 id가 비어있으면 조회 불가 → 로딩 종료 후 notFound 처리.
      //   - !client : 클라이언트가 없으면(=null/undefined) true. || 는 "둘 중 하나라도 참이면" 의미.
      //   - return으로 함수를 즉시 끝내, 아래 조회 코드가 실행되지 않게 막습니다(불필요한 에러 방지).
      if (!client || !id) { setLoading(false); setNotFound(true); return; }
      // id가 일치하는 단일 레코드 조회. maybeSingle은 0건일 때 에러 대신 null 반환(엣지케이스 안전).
      //   - from(TABLE)        : 어떤 테이블에서
      //   - select('*')        : 모든 컬럼을
      //   - eq('id', id)       : id 컬럼이 우리가 받은 id와 같은 행만 (eq = equal, 같다)
      //   - maybeSingle()      : 결과가 정확히 1건이면 그 객체를, 0건이면 null을 줍니다(2건 이상이면 에러).
      //   - await : 이 조회가 끝날 때까지 기다렸다가 결과를 받습니다(시간이 걸리는 작업이라서).
      //   - { data } : 응답 객체에서 data 부분만 구조 분해로 꺼냅니다(에러는 여기서 따로 다루지 않음).
      const { data } = await client.from(TABLE).select('*').eq('id', id).maybeSingle();
      // 데이터가 있으면 표시용 상태에 저장, 없으면 notFound로 분기.
      //   - data as Announcement : "이 data를 Announcement 타입으로 취급하라"는 타입 단언(TypeScript).
      if (data) setItem(data as Announcement);
      else setNotFound(true);
      setLoading(false); // 성공/실패와 무관하게 로딩은 끝났으므로 스피너를 멈춥니다.
    };
    load(); // 위에서 정의한 비동기 함수를 실제로 실행. (정의만 하면 동작하지 않으니 반드시 호출해야 함)
    // id가 바뀌면(다른 공지로 이동) 다시 조회.
    //   - 주의: 이 배열에서 id를 빼면 다른 공지로 이동해도 데이터가 갱신되지 않습니다(처음 값에 고정됨).
  }, [id]);

  // return 이후가 실제로 화면에 그려지는 부분(JSX)입니다.
  //   - JSX: HTML처럼 생겼지만 JavaScript 안에서 화면을 표현하는 문법입니다.
  //   - <>...</> : "프래그먼트"로, 여러 요소를 불필요한 div 없이 하나로 묶을 때 씁니다.
  return (
    <>
      {/* 공지 제목이 있으면 제목 포함 타이틀, 없으면 기본값. noindex로 검색엔진 색인 제외. */}
      {/* item ? A : B 는 삼항 연산자: item이 있으면 A, 없으면 B를 사용. */}
      {/* id ?? '' : 널 병합 연산자. id가 null/undefined이면 빈 문자열 ''을 대신 사용(주소가 깨지지 않게). */}
      <SEOHead title={item ? `공지 · ${item.title}` : '공지사항'} path={`/announcements/${id ?? ''}`} noindex />
      <section className="page-header">
        <div className="container">
          <h2>공지사항</h2>
          <p>AI Reboot Academy 전체 공지입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          {/* 공지 목록으로 돌아가는 링크 (Link는 새로고침 없이 페이지 이동) */}
          <Link to="/announcements" style={{ fontSize: '14px', color: 'var(--primary-blue, #0046C8)', textDecoration: 'none' }}>
            ← 공지사항 목록
          </Link>

          {/* 3분기 렌더링: 로딩 중 → 스피너 / 없음 → 안내 문구 / 정상 → 상세 article */}
          {/* 삼항 연산자를 연달아 쓴 구조입니다: 조건1 ? A : 조건2 ? B : C */}
          {loading ? (
            // ① 로딩 중: 데이터를 받는 동안 빙글빙글 도는 스피너만 보여줍니다.
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : notFound || !item ? (
            // ② 없음: notFound이거나 item이 비어있으면 안내 문구. (!item을 함께 확인해 아래에서 item이 항상 존재함을 보장)
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>존재하지 않는 공지입니다.</p>
          ) : (
            // ③ 정상: 여기까지 오면 item은 반드시 존재하므로 item.title 등을 안전하게 사용할 수 있습니다.
            <article style={{
              marginTop: '16px', border: '1px solid var(--border-light, #e5e7eb)',
              borderRadius: '12px', padding: '28px 26px', background: 'var(--bg-white, #fff)',
            }}>
              {/* 상단 배지 영역: 고정 공지 핀 아이콘(조건부) + 카테고리 배지 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* {조건 && <요소/>} : 조건이 참일 때만 뒤의 요소를 그립니다(거짓이면 아무것도 안 그림). */}
                {/* 즉 is_pinned(고정 공지)가 true일 때만 핀 아이콘을 표시. */}
                {item.is_pinned && <span style={{ fontSize: '14px' }}><EmojiIcon char="📌" /></span>}
                <CategoryBadge category={item.category} />
              </div>
              <h2 style={{ margin: '12px 0 8px', fontSize: '24px', lineHeight: 1.35 }}>{item.title}</h2>
              {/* 메타 정보 영역: 작성자(있을 때만) + 작성일시(ko-KR 로컬 포맷) */}
              <div style={{
                display: 'flex', gap: '14px', flexWrap: 'wrap', paddingBottom: '18px',
                borderBottom: '1px solid var(--border-light, #e5e7eb)',
                fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)',
              }}>
                {/* author_name이 있을 때만 작성자 표시(없으면 이 부분 자체를 그리지 않음). */}
                {item.author_name && <span>작성자 {item.author_name}</span>}
                {/* created_at(저장된 시각 문자열)을 Date 객체로 바꾼 뒤 한국어 형식 날짜/시간 문자열로 출력. */}
                <span>{new Date(item.created_at).toLocaleString('ko-KR')}</span>
              </div>
              {/* 본문 영역: pre-wrap으로 줄바꿈 보존, break-word로 긴 단어 줄바꿈 처리 */}
              {/* whiteSpace: 'pre-wrap' → 글쓴이가 넣은 줄바꿈/공백을 화면에서도 그대로 보여줍니다. */}
              {/* wordBreak: 'break-word' → 긴 URL처럼 끊을 곳 없는 단어가 박스를 넘치지 않게 강제로 줄바꿈. */}
              <div style={{
                marginTop: '20px', fontSize: '15.5px', lineHeight: 1.8,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {item.content}
              </div>
            </article>
          )}
        </div>
      </section>
    </>
  );
};

// 이 컴포넌트를 다른 파일(주로 라우터 설정)에서 import해서 쓸 수 있도록 기본(default)으로 내보냅니다.
export default AnnouncementDetail;
