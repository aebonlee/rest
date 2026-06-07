/**
 * SEOHead.tsx
 *
 * 역할:
 *   - 각 페이지의 SEO 관련 메타 태그(<title>, <meta>, <link>)를 선언적으로 렌더링하는 컴포넌트.
 *   - React 19+ 가 <title>/<meta>/<link> 를 자동으로 문서의 <head> 로 끌어올려 주는 기능을
 *     활용하여, 별도의 react-helmet 같은 라이브러리 없이 head 메타데이터를 관리한다.
 *
 * 핵심 책임:
 *   - 페이지별 제목/설명/정규(canonical) URL 구성.
 *   - Open Graph(og:*) 및 Twitter Card(twitter:*) 메타 태그 출력으로 SNS 공유 미리보기 지원.
 *   - noindex 옵션 처리로 검색엔진 색인 제외 제어.
 *   - 사이트 전역 설정(config/site)에서 기본값(사이트명/URL/설명/기본 OG 이미지) 참조.
 *
 * 주요 export:
 *   - default: SEOHead 컴포넌트.
 */
import { useLanguage } from '../contexts/LanguageContext';
import site from '../config/site';
import type { ReactElement } from 'react';

// SEOHead 컴포넌트가 받는 props 타입 정의 (모두 선택적이며 기본값으로 대체됨)
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
 *
 * 반환값:
 *   - <title>/<meta>/<link> 들을 담은 Fragment(ReactElement). React가 head로 호이스팅한다.
 *
 * 부수효과:
 *   - 직접적인 부수효과는 없으나, 렌더링 결과가 문서 <head> 에 반영된다.
 *   - useLanguage() 호출로 LanguageContext 를 구독한다(아래 주석 참조).
 */
const SEOHead = ({ title, description, path = '', ogImage, noindex = false }: SEOHeadProps): ReactElement => {
  // 사이트 표시명: "영문명 | 한글명" 형태로 조합 (예: og:site_name 및 제목 접미사용)
  const SITE = `${site.name} | ${site.nameKo}`;
  // 사이트 기준 절대 URL (canonical / og:url 의 도메인 부분)
  const BASE = site.url;
  // 페이지별 설명이 없을 때 사용할 사이트 기본 설명
  const DEFAULT_DESC = site.description;
  // 최종 <title>: 페이지 제목이 있으면 "제목 | 사이트", 없으면 사이트명만
  const fullTitle = title ? `${title} | ${SITE}` : SITE;
  // 최종 설명: 전달된 설명이 있으면 사용, 없으면 기본 설명으로 대체
  const desc = description || DEFAULT_DESC;
  // 공유 이미지: 전달된 ogImage 우선, 없으면 사이트 기본 og-image.png 절대경로
  const image = ogImage || `${BASE}/og-image.png`;

  // useLanguage is called to stay consistent with original (future i18n SEO)
  // (원본과의 일관성 유지 및 향후 다국어 SEO 대응을 위해 컨텍스트를 구독만 해 둠. 반환값은 현재 미사용)
  useLanguage();

  // React 19+ natively hoists <title>, <meta>, <link> to <head>
  // (React 19+ 는 아래 태그들을 자동으로 문서 <head> 로 끌어올려 렌더링한다)
  return (
    <>
      {/* 페이지 제목: 브라우저 탭 및 검색 결과 제목으로 사용 */}
      <title>{fullTitle}</title>
      {/* 검색엔진/SNS용 페이지 설명 */}
      <meta name="description" content={desc} />
      {/* 정규 URL: 중복 콘텐츠 방지를 위한 canonical 링크 (BASE + path) */}
      <link rel="canonical" href={`${BASE}${path}`} />
      {/* noindex가 true일 때만 색인/추적 제외 robots 메타 태그 출력 (조건부 렌더링) */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {/* --- Open Graph: 페이스북/카카오 등 SNS 공유 미리보기용 --- */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={`${BASE}${path}`} />
      <meta property="og:image" content={image} />
      {/* OG 이미지 권장 규격(1200x630) 명시로 일관된 썸네일 표시 유도 */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="DreamIT Biz" />
      {/* --- Twitter Card: 트위터/X 공유 미리보기용 (큰 이미지 카드) --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
    </>
  );
};

export default SEOHead;
