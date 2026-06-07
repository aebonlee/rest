/**
 * searchStorage.ts
 * 통합 검색 — blog/board/gallery ilike 병렬 검색
 *
 * [이 파일이 무엇인가? — 초보자를 위한 한 줄 요약]
 * "검색창에 글자를 입력하면, 블로그/게시판/갤러리 세 곳을 한꺼번에 뒤져서
 *  결과를 모아 돌려주는 함수"가 들어 있는 파일이다.
 *
 * [파일 개요]
 * 이 모듈은 사이트 전역(통합) 검색 기능을 담당한다.
 * 사용자가 입력한 검색어 하나로 블로그(blog_posts), 게시판(board_posts),
 * 갤러리(gallery_items) 세 개의 테이블을 동시에(병렬) 조회한다.
 *
 * [먼저 알아야 할 배경 용어 — 쉽게 풀어서]
 * - Supabase: 데이터베이스(DB)를 웹에서 쉽게 쓰게 해 주는 서비스.
 *   여기서는 "글 목록이 저장된 표(테이블)에서 원하는 줄을 골라오는" 용도로 쓴다.
 * - 테이블(table): 엑셀 시트처럼 '행(row)'과 '열(column)'로 이뤄진 데이터 묶음.
 *   행 1개 = 글 1개, 열 1개 = 제목/날짜 같은 항목 하나라고 생각하면 된다.
 * - ilike: SQL의 LIKE(부분 일치 검색)에서 '대소문자를 구분하지 않는' 버전.
 *   예) 'apple'로 검색해도 'Apple', 'APPLE'까지 모두 찾는다.
 * - 비동기(async/await): DB 조회처럼 '시간이 걸리는 일'을 기다리는 방식.
 *   await을 붙이면 "이 작업이 끝날 때까지 기다렸다가 다음 줄로 넘어가라"는 뜻이다.
 * - Promise(프로미스): "지금은 결과가 없지만, 나중에 결과가 올 약속"을 담은 값.
 *   DB 조회 함수들은 결과 대신 Promise를 먼저 돌려주고, await으로 실제 값을 꺼낸다.
 *
 * [핵심 동작]
 * - Supabase의 ilike(대소문자 무시 LIKE) 연산자로 부분 일치 검색을 수행한다.
 * - Promise.all로 세 테이블 쿼리를 병렬 실행하여 응답 속도를 높인다.
 * - DB의 snake_case 컬럼명을 프론트엔드에서 쓰는 camelCase로 변환한다.
 * - 한국어/영어 컬럼(title/title_en 등)을 함께 검색하여 다국어 대응한다.
 *
 * [snake_case vs camelCase — 왜 변환이 필요한가?]
 * - snake_case: 단어를 밑줄(_)로 잇는 표기. 예) title_en, category_en. (DB가 즐겨 쓰는 방식)
 * - camelCase: 두 번째 단어부터 첫 글자를 대문자로. 예) titleEn, categoryEn. (JS/TS가 즐겨 쓰는 방식)
 *   DB에서 온 데이터를 화면 코드에서 자연스럽게 쓰려고 표기법을 바꿔 주는 것이다.
 */

// 검색 결과 타입 정의를 가져온다.
// (타입: 이 값이 '어떤 모양의 데이터'인지 TypeScript에게 알려 주는 설명서. 실행에는 영향 없음)
// SearchResults: blog/board/gallery 세 그룹을 묶은 최종 반환 타입
// SearchResultItem: 각 검색 결과 한 건(항목)의 타입
import type { SearchResults, SearchResultItem } from '../types';
// Supabase 클라이언트 인스턴스를 반환하는 헬퍼 (환경 미설정 시 null 가능)
// (클라이언트: DB와 대화하기 위한 '연결 통로' 객체)
import getSupabase from './supabase';

/**
 * toCamelKey
 * snake_case 형태의 키 문자열을 camelCase로 변환한다.
 * 예) "title_en" -> "titleEn", "category_en" -> "categoryEn"
 *
 * [왜 이렇게 하는가?]
 * DB 컬럼명(예: title_en)을 그대로 쓰면 화면 코드와 표기법이 달라 헷갈린다.
 * 그래서 키 이름만 JS 스타일(titleEn)로 바꿔 준다. (값은 건드리지 않음)
 *
 * [정규식 설명 — /_([a-z])/g]
 * 정규식(Regular Expression): 문자열에서 특정 '패턴'을 찾는 규칙 표현.
 * - _        : 밑줄 문자 그 자체를 찾는다.
 * - ([a-z])  : 그 뒤에 오는 '소문자 한 글자'를 찾아서 따로 기억(캡처)해 둔다.
 * - g        : (global) 문자열 전체에서 일치하는 곳을 '모두' 찾는다(첫 번째만이 아니라).
 * 즉 "밑줄 + 소문자 한 글자" 패턴을 전부 찾아, 밑줄은 없애고 그 글자를 대문자로 바꾼다.
 *
 * @param key - 변환할 키 문자열 (예: "title_en")
 * @returns camelCase로 바뀐 문자열 (예: "titleEn")
 */
function toCamelKey(key: string): string {
  // replace의 두 번째 인자로 '함수'를 넘기면, 일치한 부분마다 그 함수가 호출된다.
  // 첫 번째 인자(_)는 일치한 전체("_e" 같은 것)인데 안 쓰므로 관례상 _ 로 무시한다.
  // 두 번째 인자 c 는 캡처 그룹([a-z])에 잡힌 글자이며, 대문자로 바꿔 반환한다.
  // 반환된 값이 일치한 부분을 대체하므로 "_e" -> "E" 처럼 바뀐다.
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * toCamel
 * DB에서 받아온 한 행(row) 객체의 모든 키를 camelCase로 변환한 새 객체를 만든다.
 * row가 null이면 그대로 null을 반환한다.
 *
 * [왜 '새 객체'를 만드는가? — 불변성(immutability)]
 * 원본 row를 직접 고치지 않고 새 객체(out)에 담는다.
 * 원본을 함부로 바꾸면 다른 곳에서 그 데이터를 쓸 때 예상치 못한 버그가 생길 수 있어,
 * "원본은 그대로 두고 바뀐 사본을 만든다"는 방식을 쓴다. 이를 불변성이라 부른다.
 *
 * @param row - DB 한 건(스네이크 케이스 키를 가진 객체) 또는 null
 * @returns camelCase 키로 변환된 SearchResultItem 또는 null
 */
function toCamel(row: Record<string, unknown> | null): SearchResultItem | null {
  // row가 없으면(null) 변환할 것이 없으므로 즉시 null 반환.
  // 주의: 이 검사가 없으면 아래 Object.entries(null)에서 에러가 난다. (방어 코드)
  if (!row) return null;
  // 변환 결과를 담을 빈 객체. (여기에 키를 바꿔 가며 하나씩 채워 넣는다)
  const out: Record<string, unknown> = {};
  // Object.entries(row): 객체를 [키, 값] 쌍의 배열로 펼쳐 준다.
  //   예) { title_en: "Hi" } -> [ ["title_en", "Hi"] ]
  // 이 쌍들을 하나씩 꺼내며(k=키, v=값), 키만 camelCase로 바꿔 새 객체에 옮긴다.
  // 주의: 값(v)은 변환하지 않고 그대로 옮긴다. 바꾸는 것은 '키 이름'뿐이다.
  for (const [k, v] of Object.entries(row)) {
    out[toCamelKey(k)] = v;
  }
  // 구조상 SearchResultItem과 호환되므로 unknown을 경유해 단언 캐스팅한다.
  // (타입 단언 'as': "이 값을 이런 타입으로 봐 달라"고 TS에게 알려 주는 것.
  //  실제 데이터를 바꾸는 게 아니라 '타입 표시'만 바꾸므로 실행 동작은 동일하다.)
  return out as unknown as SearchResultItem;
}

/**
 * searchAll
 * 통합 검색: blog_posts, board_posts, gallery_items에서 ilike 병렬 검색
 *
 * [async 함수란?]
 * 함수 앞에 async가 붙으면 '비동기 함수'가 되어, 항상 Promise를 반환한다.
 * 내부에서 await으로 시간이 걸리는 DB 조회를 '기다렸다가' 결과를 받을 수 있다.
 *
 * @param query - 사용자가 입력한 검색어
 * @returns blog/board/gallery 별 검색 결과 배열을 담은 객체 (Promise로 감싸여 반환됨)
 *
 * [흐름]
 * 1) Supabase 클라이언트 확보 및 검색어 유효성 검사
 * 2) ilike용 와일드카드 패턴 생성
 * 3) 세 테이블을 Promise.all로 병렬 조회
 * 4) 각 결과를 camelCase로 변환하여 반환
 */
export async function searchAll(query: string): Promise<SearchResults> {
  // Supabase 클라이언트를 가져온다. (DB와 대화할 연결 통로)
  const client = getSupabase();
  // 아래는 '조기 반환(early return)' 패턴: 검색할 필요가 없는 경우 일찍 끝낸다.
  // - !client      : 환경설정이 안 되어 연결 통로가 없을 때 (null)
  // - !query.trim(): trim()으로 양끝 공백을 없앤 결과가 빈 문자열("")일 때.
  //                  빈 문자열은 자바스크립트에서 거짓(falsy)으로 취급되어 !가 참이 된다.
  // 둘 중 하나라도 해당하면 DB 조회 없이 빈 결과를 즉시 반환한다(불필요한 쿼리 방지).
  if (!client || !query.trim()) {
    return { blog: [], board: [], gallery: [] };
  }

  // ilike 부분 일치 검색을 위한 패턴: 앞뒤로 % 를 붙여 "포함" 검색을 만든다.
  // % 는 '아무 글자나 0개 이상'을 뜻하는 와일드카드. 예) "%사과%" -> "사과"가 들어간 모든 글.
  // `...` 는 템플릿 리터럴(문자열 안에 ${...}로 변수를 끼워 넣는 문법)이다.
  // 양끝 공백은 trim 으로 제거하여 검색 정확도를 높인다.
  const pattern = `%${query.trim()}%`;

  // 세 개의 독립적인 테이블 쿼리를 병렬로 실행한다.
  // [Promise.all 이란?]
  //   여러 비동기 작업을 '동시에' 시작해 두고, '셋 다 끝날 때까지' 한 번에 기다린다.
  //   하나씩 순서대로(await A; await B; await C) 기다리는 것보다 전체 시간이 짧다.
  //   결과는 넣은 순서 그대로 배열로 돌아오므로 구조 분해로 받는다.
  // 주의: Promise.all은 셋 중 '하나라도 실패'하면 전체가 실패(reject)한다는 점에 유의.
  const [blogRes, boardRes, galleryRes] = await Promise.all([
    // [블로그] 제목/영문제목/요약/영문요약을 대상으로 검색한다(다국어 대응).
    client
      .from('blog_posts')                 // 어떤 테이블에서 가져올지 지정
      .select('id, title, title_en, excerpt, excerpt_en, category, category_en, date') // 필요한 열만 골라 가져옴(통신량 절약)
      // or(...) 안의 여러 ilike 조건은 OR 로 묶여, 하나라도 일치하면 선택된다.
      // 형식: "컬럼명.연산자.값" 을 콤마로 이어 쓴다. (한국어/영어 컬럼을 함께 검색)
      .or(`title.ilike.${pattern},title_en.ilike.${pattern},excerpt.ilike.${pattern},excerpt_en.ilike.${pattern}`)
      // 최신 글이 먼저 오도록 id 내림차순 정렬 (ascending: false = 큰 값 먼저)
      .order('id', { ascending: false })
      // 통합 검색 미리보기 용도이므로 그룹당 최대 5건으로 제한
      .limit(5),
    // [게시판] 제목과 본문(content)을 대상으로 검색한다.
    // 주의: content는 검색 조건에는 쓰지만 select에는 없다.
    //       조건으로 거르는 컬럼과 결과로 받아오는 컬럼은 서로 달라도 된다.
    client
      .from('board_posts')
      .select('id, title, category, author, date')
      .or(`title.ilike.${pattern},content.ilike.${pattern}`)
      .order('id', { ascending: false })
      .limit(5),
    // [갤러리] 제목/영문제목/설명/영문설명을 대상으로 검색한다(다국어 대응).
    client
      .from('gallery_items')
      .select('id, title, title_en, description, description_en, category, date')
      .or(`title.ilike.${pattern},title_en.ilike.${pattern},description.ilike.${pattern},description_en.ilike.${pattern}`)
      .order('id', { ascending: false })
      .limit(5)
  ]);

  // 각 쿼리 결과(data)는 null일 수 있으므로 || [] 로 빈 배열을 보장한 뒤,
  //   (|| 는 '왼쪽이 거짓이면 오른쪽 값을 쓴다'는 뜻. data가 null이면 [] 사용)
  // toCamel 로 키를 camelCase 변환한다.
  // [.map(...) 이란?]
  //   배열의 각 요소를 '하나씩 변환'해 같은 길이의 새 배열을 만든다. (여기선 각 행을 camelCase로)
  // map 결과의 ! (non-null 단언)는 위에서 row가 항상 존재함을 전제로 한 것.
  //   (toCamel은 null을 줄 수도 있지만, 여기서는 실제 행만 들어오므로 'null 아님'을 단언함)
  // 주의: !는 TS에게 'null 아니라고 믿어 달라'는 표시일 뿐, 실제 검사를 하진 않는다.
  return {
    blog: (blogRes.data || []).map(r => toCamel(r as unknown as Record<string, unknown>)!),
    board: (boardRes.data || []).map(r => toCamel(r as unknown as Record<string, unknown>)!),
    gallery: (galleryRes.data || []).map(r => toCamel(r as unknown as Record<string, unknown>)!)
  };
}
