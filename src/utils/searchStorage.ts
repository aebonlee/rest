/**
 * searchStorage.ts
 * 통합 검색 — blog/board/gallery ilike 병렬 검색
 *
 * [파일 개요]
 * 이 모듈은 사이트 전역(통합) 검색 기능을 담당한다.
 * 사용자가 입력한 검색어 하나로 블로그(blog_posts), 게시판(board_posts),
 * 갤러리(gallery_items) 세 개의 테이블을 동시에(병렬) 조회한다.
 *
 * [핵심 동작]
 * - Supabase의 ilike(대소문자 무시 LIKE) 연산자로 부분 일치 검색을 수행한다.
 * - Promise.all로 세 테이블 쿼리를 병렬 실행하여 응답 속도를 높인다.
 * - DB의 snake_case 컬럼명을 프론트엔드에서 쓰는 camelCase로 변환한다.
 * - 한국어/영어 컬럼(title/title_en 등)을 함께 검색하여 다국어 대응한다.
 */

// 검색 결과 타입 정의를 가져온다.
// SearchResults: blog/board/gallery 세 그룹을 묶은 최종 반환 타입
// SearchResultItem: 각 검색 결과 한 건(항목)의 타입
import type { SearchResults, SearchResultItem } from '../types';
// Supabase 클라이언트 인스턴스를 반환하는 헬퍼 (환경 미설정 시 null 가능)
import getSupabase from './supabase';

/**
 * toCamelKey
 * snake_case 형태의 키 문자열을 camelCase로 변환한다.
 * 예) "title_en" -> "titleEn", "category_en" -> "categoryEn"
 *
 * 정규식 /_([a-z])/g 는 "언더스코어 + 소문자 한 글자" 패턴을 모두 찾아,
 * 언더스코어를 제거하고 뒤따르는 소문자를 대문자로 치환한다.
 */
function toCamelKey(key: string): string {
  // 두 번째 인자 c 는 캡처 그룹([a-z])에 잡힌 글자이며, 대문자로 바꿔 반환한다.
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * toCamel
 * DB에서 받아온 한 행(row) 객체의 모든 키를 camelCase로 변환한 새 객체를 만든다.
 * row가 null이면 그대로 null을 반환한다.
 *
 * @param row - DB 한 건(스네이크 케이스 키를 가진 객체) 또는 null
 * @returns camelCase 키로 변환된 SearchResultItem 또는 null
 */
function toCamel(row: Record<string, unknown> | null): SearchResultItem | null {
  // row가 없으면(null) 변환할 것이 없으므로 즉시 null 반환
  if (!row) return null;
  // 변환 결과를 담을 빈 객체
  const out: Record<string, unknown> = {};
  // 원본 객체의 [키, 값] 쌍을 순회하며 키만 camelCase로 바꿔 새 객체에 채운다.
  for (const [k, v] of Object.entries(row)) {
    out[toCamelKey(k)] = v;
  }
  // 구조상 SearchResultItem과 호환되므로 unknown을 경유해 단언 캐스팅한다.
  return out as unknown as SearchResultItem;
}

/**
 * searchAll
 * 통합 검색: blog_posts, board_posts, gallery_items에서 ilike 병렬 검색
 *
 * @param query - 사용자가 입력한 검색어
 * @returns blog/board/gallery 별 검색 결과 배열을 담은 객체
 *
 * [흐름]
 * 1) Supabase 클라이언트 확보 및 검색어 유효성 검사
 * 2) ilike용 와일드카드 패턴 생성
 * 3) 세 테이블을 Promise.all로 병렬 조회
 * 4) 각 결과를 camelCase로 변환하여 반환
 */
export async function searchAll(query: string): Promise<SearchResults> {
  // Supabase 클라이언트를 가져온다.
  const client = getSupabase();
  // 클라이언트가 없거나(환경 미설정) 검색어가 공백뿐이면
  // DB 조회 없이 빈 결과를 즉시 반환한다(불필요한 쿼리 방지).
  if (!client || !query.trim()) {
    return { blog: [], board: [], gallery: [] };
  }

  // ilike 부분 일치 검색을 위한 패턴: 앞뒤로 % 를 붙여 "포함" 검색을 만든다.
  // 양끝 공백은 trim 으로 제거하여 검색 정확도를 높인다.
  const pattern = `%${query.trim()}%`;

  // 세 개의 독립적인 테이블 쿼리를 병렬로 실행한다.
  // Promise.all 을 사용하므로 순차 실행보다 전체 응답 시간이 짧아진다.
  const [blogRes, boardRes, galleryRes] = await Promise.all([
    // [블로그] 제목/영문제목/요약/영문요약을 대상으로 검색한다(다국어 대응).
    client
      .from('blog_posts')
      .select('id, title, title_en, excerpt, excerpt_en, category, category_en, date')
      // or(...) 안의 여러 ilike 조건은 OR 로 묶여, 하나라도 일치하면 선택된다.
      .or(`title.ilike.${pattern},title_en.ilike.${pattern},excerpt.ilike.${pattern},excerpt_en.ilike.${pattern}`)
      // 최신 글이 먼저 오도록 id 내림차순 정렬
      .order('id', { ascending: false })
      // 통합 검색 미리보기 용도이므로 그룹당 최대 5건으로 제한
      .limit(5),
    // [게시판] 제목과 본문(content)을 대상으로 검색한다.
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
  // toCamel 로 키를 camelCase 변환한다.
  // map 결과의 ! (non-null 단언)는 위에서 row가 항상 존재함을 전제로 한 것.
  return {
    blog: (blogRes.data || []).map(r => toCamel(r as unknown as Record<string, unknown>)!),
    board: (boardRes.data || []).map(r => toCamel(r as unknown as Record<string, unknown>)!),
    gallery: (galleryRes.data || []).map(r => toCamel(r as unknown as Record<string, unknown>)!)
  };
}
