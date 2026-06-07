/**
 * SEOHead.tsx
 *
 * [이 파일은 무엇인가? — 한 문장으로]
 *   화면에는 안 보이지만 "검색엔진(구글 등)"과 "SNS 공유 미리보기"를 위해
 *   페이지마다 필요한 정보(제목, 설명, 대표 이미지 등)를 만들어 주는 컴포넌트다.
 *
 * [배경 용어 — 초보자가 먼저 알아두면 좋은 것들]
 *   - SEO(Search Engine Optimization, 검색엔진 최적화):
 *       내 페이지가 구글 검색 결과에 잘 노출되도록 정보를 잘 정리해 주는 작업.
 *   - 메타 태그(meta tag):
 *       사람 눈에는 안 보이지만 브라우저/검색엔진/SNS가 읽는 "페이지 설명서".
 *       예) <meta name="description" content="이 페이지 설명..."> 처럼 생겼다.
 *   - <head> / <title> / <link>:
 *       HTML 문서 맨 위(<head>)에 들어가는 메타 정보 영역.
 *       <title>은 브라우저 탭에 뜨는 제목, <link rel="canonical">은 "대표 주소"를 가리킨다.
 *   - Open Graph(og:*):
 *       페이스북/카카오톡 등에 링크를 붙여넣었을 때 뜨는 "미리보기 카드"를 위한 규약.
 *   - Twitter Card(twitter:*):
 *       트위터(X)에서 링크를 붙여넣었을 때 뜨는 미리보기 카드를 위한 규약.
 *
 * [왜 이 컴포넌트가 필요한가?]
 *   페이지마다 제목/설명/대표이미지가 달라야 검색과 공유가 잘 된다.
 *   그런데 보통 <head>는 페이지 컴포넌트 안에서 직접 건드리기 어렵다.
 *   React 19+ 부터는 컴포넌트가 <title>/<meta>/<link>를 그냥 반환(return)하기만 하면
 *   React가 알아서 그 태그들을 문서의 <head>로 옮겨(호이스팅) 준다.
 *   → 그래서 react-helmet 같은 추가 라이브러리 없이도 이 한 컴포넌트로 SEO 메타를 관리할 수 있다.
 *
 * [핵심 책임]
 *   - 페이지별 제목/설명/정규(canonical) URL 구성.
 *   - Open Graph(og:*) 및 Twitter Card(twitter:*) 메타 태그 출력으로 SNS 공유 미리보기 지원.
 *   - noindex 옵션 처리로 검색엔진 색인 제외 제어.
 *   - 사이트 전역 설정(config/site)에서 기본값(사이트명/URL/설명/기본 OG 이미지) 참조.
 *
 * [주요 export]
 *   - default: SEOHead 컴포넌트.
 */

// useLanguage: 현재 선택된 언어 정보를 가져오는 "커스텀 훅"(아래에서 호출 부분 참고).
//   훅(hook)이란? React 함수 컴포넌트 안에서만 쓸 수 있는 특수 함수로, 이름이 보통 use~ 로 시작한다.
import { useLanguage } from '../contexts/LanguageContext';
// site: 사이트 전역 설정값 묶음(사이트명, 기본 URL, 기본 설명 등). 여러 곳에서 같은 값을 재사용하려고 한 곳에 모아둔 것.
import site from '../config/site';
// ReactElement: "React가 그려낼 수 있는 한 덩어리의 화면 요소" 타입.
//   `import type`은 "이건 타입(TypeScript용)일 뿐, 실제 실행 코드가 아니다"라는 표시 → 번들에 포함되지 않음.
import type { ReactElement } from 'react';

// SEOHead 컴포넌트가 받는 props 타입 정의 (모두 선택적이며 기본값으로 대체됨)
//   interface: TypeScript에서 "객체가 어떤 모양이어야 하는지" 미리 약속해 두는 틀.
//   각 속성 뒤의 물음표(?)는 "있어도 되고 없어도 된다(선택적, optional)"는 의미.
//   주의: ?가 붙은 값은 전달되지 않으면 undefined가 되므로, 아래에서 기본값으로 채워준다.
interface SEOHeadProps {
  title?: string;        // 페이지 고유 제목 (없으면 사이트명만 사용)
  description?: string;  // 페이지 설명 (없으면 사이트 기본 설명 사용)
  path?: string;         // 사이트 루트 기준 경로 (canonical/og:url 구성에 사용, 기본 '')
  ogImage?: string;      // OG/트위터 공유 이미지 URL (없으면 기본 og-image.png 사용)
  noindex?: boolean;     // true면 검색엔진 색인 제외 메타 태그 추가
}

/**
 * SEOHead
 *   페이지의 SEO 메타데이터를 렌더링한다.
 *
 * 매개변수(props):
 *   - title, description, path, ogImage, noindex (SEOHeadProps 참조)
 *     path 기본값 '', noindex 기본값 false.
 *   - 참고: 함수 괄호 안에서 { title, description, ... } 처럼 받는 것을 "구조 분해 할당"이라 한다.
 *     props 객체에서 필요한 값만 골라 변수로 꺼내 쓰는 문법이다.
 *
 * 반환값:
 *   - <title>/<meta>/<link> 들을 담은 Fragment(ReactElement). React가 head로 호이스팅한다.
 *     (Fragment = 화면에 별도 박스를 만들지 않고 여러 요소를 한 묶음으로 감싸는 빈 껍데기 <>...</>)
 *
 * 부수효과:
 *   - 직접적인 부수효과는 없으나, 렌더링 결과가 문서 <head> 에 반영된다.
 *     (부수효과 = 화면 그리기 외에 바깥 세상을 바꾸는 일. 여기선 <head>가 바뀌는 것이 그에 해당)
 *   - useLanguage() 호출로 LanguageContext 를 구독한다(아래 주석 참조).
 */
// 화살표 함수(=>)로 컴포넌트를 정의한다. ': SEOHeadProps'는 매개변수의 타입, ': ReactElement'는 반환값의 타입 표기.
// path = '' / noindex = false 처럼 매개변수에 적은 것은 "기본값(default parameter)" — 값이 안 넘어오면 이 값을 쓴다.
const SEOHead = ({ title, description, path = '', ogImage, noindex = false }: SEOHeadProps): ReactElement => {
  // 사이트 표시명: "영문명 | 한글명" 형태로 조합 (예: og:site_name 및 제목 접미사용)
  //   `${...}` 문법은 "템플릿 리터럴"로, 문자열 안에 변수 값을 끼워 넣을 수 있다.
  //   주의: 백틱(`) 문자열 안에는 주석을 쓰면 안 된다(그 글자가 그대로 출력돼 버린다).
  const SITE = `${site.name} | ${site.nameKo}`;
  // 사이트 기준 절대 URL (canonical / og:url 의 도메인 부분). 예: "https://rest.dreamitbiz.com"
  const BASE = site.url;
  // 페이지별 설명이 없을 때 사용할 사이트 기본 설명
  const DEFAULT_DESC = site.description;
  // 최종 <title>: 페이지 제목이 있으면 "제목 | 사이트", 없으면 사이트명만
  //   삼항 연산자 (조건 ? A : B): 조건이 참이면 A, 거짓이면 B 를 고른다.
  //   여기서 title은 빈 값(undefined/빈 문자열)이면 "거짓"으로 취급되어 SITE만 쓰인다.
  const fullTitle = title ? `${title} | ${SITE}` : SITE;
  // 최종 설명: 전달된 설명이 있으면 사용, 없으면 기본 설명으로 대체
  //   `A || B` 는 "A가 비어있으면(falsy) B를 쓴다"는 흔한 기본값 패턴.
  const desc = description || DEFAULT_DESC;
  // 공유 이미지: 전달된 ogImage 우선, 없으면 사이트 기본 og-image.png 절대경로
  //   SNS 미리보기 이미지는 상대경로가 아니라 "전체 주소(절대경로)"여야 외부에서 불러올 수 있다 → 그래서 BASE를 앞에 붙인다.
  const image = ogImage || `${BASE}/og-image.png`;

  // useLanguage is called to stay consistent with original (future i18n SEO)
  // (원본과의 일관성 유지 및 향후 다국어 SEO 대응을 위해 컨텍스트를 구독만 해 둠. 반환값은 현재 미사용)
  //   왜 반환값을 안 쓰는데 호출만 하나? 훅 호출 자체로 LanguageContext의 변화를 "구독"하게 되어,
  //   나중에 언어별로 다른 제목/설명을 만들 때 이 자리만 고치면 되도록 미리 자리를 잡아둔 것이다.
  //   주의: 훅은 컴포넌트 최상단에서 "조건문/반복문 없이" 호출해야 한다(React 훅 규칙). if 안에서 호출하면 오류가 난다.
  useLanguage();

  // React 19+ natively hoists <title>, <meta>, <link> to <head>
  // (React 19+ 는 아래 태그들을 자동으로 문서 <head> 로 끌어올려 렌더링한다)
  return (
    // <>...</> 는 Fragment(빈 껍데기). 컴포넌트는 하나의 묶음만 반환할 수 있어서 여러 태그를 이걸로 감싼다.
    <>
      {/* 페이지 제목: 브라우저 탭 및 검색 결과 제목으로 사용. {fullTitle}처럼 중괄호 안은 JS 값을 끼워 넣는 자리. */}
      <title>{fullTitle}</title>
      {/* 검색엔진/SNS용 페이지 설명 */}
      <meta name="description" content={desc} />
      {/* 정규 URL: 같은 내용이 여러 주소로 보일 때 "이게 대표 주소다"라고 알려 중복 콘텐츠 패널티를 막는 canonical 링크 (BASE + path) */}
      <link rel="canonical" href={`${BASE}${path}`} />
      {/* noindex가 true일 때만 색인/추적 제외 robots 메타 태그 출력 (조건부 렌더링).
          {조건 && <태그>} 패턴: 조건이 참이면 뒤의 태그를 그리고, 거짓이면 아무것도 안 그린다.
          noindex=false면 false가 되어 화면에 아무 태그도 추가되지 않는다. */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {/* --- Open Graph: 페이스북/카카오 등 SNS 공유 미리보기용 --- */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={`${BASE}${path}`} />
      <meta property="og:image" content={image} />
      {/* OG 이미지 권장 규격(1200x630) 명시로 일관된 썸네일 표시 유도 (SNS가 이 크기로 깔끔하게 보여준다) */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="DreamIT Biz" />
      {/* --- Twitter Card: 트위터/X 공유 미리보기용. summary_large_image = 큰 이미지가 들어간 카드 형태 --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
    </>
  );
};

// 이 파일의 "기본 내보내기". 다른 파일에서 `import SEOHead from '...'` 로 자유롭게 이름 붙여 가져다 쓸 수 있다.
export default SEOHead;
