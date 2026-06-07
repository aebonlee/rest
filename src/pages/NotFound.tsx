/**
 * NotFound.tsx — 404 페이지(존재하지 않는 경로 폴백)
 *
 * [이 파일이 무엇인가요?]
 *  웹사이트 주소(URL)를 잘못 입력했거나, 예전에는 있었지만 지금은 사라진 페이지로
 *  들어왔을 때 사용자에게 "그런 페이지는 없어요"라고 알려주는 안내 화면입니다.
 *  흔히 말하는 "404 페이지"가 바로 이것입니다.
 *
 * [왜 필요한가요?]
 *  - 잘못된 주소로 들어왔을 때 빈 화면이나 에러만 보이면 사용자가 당황합니다.
 *  - 그래서 "여기는 없는 페이지예요. 대신 홈이나 문의로 가보세요" 라고
 *    친절하게 길을 안내해 주는 화면을 따로 만들어 둡니다.
 *
 * [라우터(Router)와의 관계 — 초보자용 배경]
 *  - 이 프로젝트는 react-router-dom 이라는 도구로 "주소 → 화면" 연결을 관리합니다.
 *  - 라우터 설정에서 와일드카드(`*`) 경로는 "위에서 정의한 어떤 주소에도
 *    해당되지 않는 나머지 전부"를 의미합니다.
 *  - 그 `*` 경로에 이 NotFound 컴포넌트를 연결해 두면,
 *    매칭되는 정상 페이지가 없을 때 이 화면이 폴백(fallback, 대비책)으로 뜹니다.
 *
 * 역할:
 *  - 라우터의 와일드카드(`*`) 경로에 매칭되어, 잘못된 URL 접근 시 표시되는 안내 화면.
 *
 * 핵심 책임:
 *  - 404 코드/안내 문구 표시 + 홈·문의로 이동하는 링크 제공.
 *
 * 주요 export:
 *  - default: NotFound (React 페이지 컴포넌트)
 *    └ "default export"는 이 파일을 import 할 때 이름 없이 가져올 수 있게 해주는
 *      대표 내보내기입니다. (예: import NotFound from '../pages/NotFound')
 */
// [import 설명]
// Link: react-router-dom이 제공하는 "페이지 이동용 링크" 컴포넌트.
//  - 일반 <a> 태그와 달리, 클릭해도 브라우저 전체를 새로 불러오지(새로고침) 않고
//    필요한 부분만 바꿔 보여줍니다. 그래서 화면 전환이 빠릅니다. (SPA 방식)
import { Link } from 'react-router-dom';
// SEOHead: 검색엔진 노출(SEO)이나 브라우저 탭 제목 등 <head> 정보를 설정해 주는
//  우리 프로젝트의 자체 컴포넌트입니다.
import SEOHead from '../components/SEOHead';
// ReactElement: 이 컴포넌트가 "화면에 그릴 React 요소"를 반환한다는 것을 TypeScript에
//  알려주기 위한 타입입니다.
//  - `import type ...` 은 "이건 실제 코드가 아니라 타입 정보일 뿐"이라는 표시로,
//    빌드 결과물에는 포함되지 않아 더 가볍습니다.
import type { ReactElement } from 'react';

// NotFound — 404 안내 화면을 렌더하는 단순 표시용 컴포넌트(상태/부수효과 없음).
//
// [무엇을 하나요?]
//  화면에 보여줄 JSX(아래 <> ... </> 부분)를 반환합니다.
//
// [왜 이렇게 하나요?]
//  이 컴포넌트는 사용자 입력을 받거나 데이터를 불러올 일이 없습니다.
//  그저 정해진 안내 문구와 링크만 보여주면 되므로,
//  상태(useState)나 부수효과(useEffect) 없이 "보여주기"만 하는
//  가장 단순한 형태로 만들었습니다. (이런 컴포넌트를 흔히 '프레젠테이션 컴포넌트'라 부릅니다)
//
// [매개변수] 없음 (props를 받지 않습니다)
// [반환값] ReactElement — 화면에 그려질 JSX
// [부수효과] 없음 (외부 상태를 바꾸거나 네트워크 요청을 하지 않음)
const NotFound = (): ReactElement => {
  // return 안에서 JSX를 돌려줍니다.
  // JSX란? HTML처럼 생겼지만 JavaScript 안에서 화면 구조를 표현하는 문법입니다.
  return (
    // <> ... </> 는 "Fragment(조각)"입니다.
    //  - React 컴포넌트는 반드시 "하나의 부모 요소"만 반환할 수 있습니다.
    //  - 그런데 여기서는 SEOHead와 section, 두 개를 나란히 반환하고 싶습니다.
    //  - 이때 의미 없는 <div>로 감싸 불필요한 태그를 늘리는 대신,
    //    화면에 실제 태그를 추가하지 않는 빈 껍데기 <></> 로 묶어줍니다.
    <>
      {/* 검색엔진/탭 제목용 메타 — 404 명시 */}
      {/* title 속성으로 넘긴 글자가 브라우저 탭과 검색 결과 제목에 반영됩니다. */}
      {/* 주의: SEOHead는 화면에 직접 보이는 요소가 아니라 <head> 정보를 바꾸는 역할이라 */}
      {/*       페이지 본문에는 아무것도 그리지 않습니다. */}
      <SEOHead title="404 - 페이지를 찾을 수 없습니다" />
      {/* section: 이 페이지의 본문 영역 전체를 감싸는 묶음. */}
      {/* className: HTML의 class와 같습니다. JSX에서는 'class'가 자바스크립트 예약어와 */}
      {/*            겹치기 때문에 'className'이라고 씁니다. (CSS 스타일 연결용) */}
      <section className="not-found-page">
        <div className="not-found-content">
          {/* 큰 "404" 숫자 — 시각적으로 한눈에 상황을 알리는 부분 */}
          <h1 className="not-found-code">404</h1>
          {/* 사람이 읽는 짧은 제목 */}
          <h2 className="not-found-title">페이지를 찾을 수 없습니다</h2>
          {/* 왜 이 화면이 떴는지 설명하는 안내 문장 */}
          <p className="not-found-desc">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          {/* 복귀 동선: 홈 / 문의 */}
          <div className="not-found-actions">
            {/* to="/" : 사이트의 홈("/") 주소로 이동시키는 링크 */}
            {/* 주의: react-router의 Link는 href가 아니라 'to' 속성을 사용합니다. */}
            <Link to="/" className="not-found-btn primary">홈으로 돌아가기</Link>
            {/* to="/contact" : 문의 페이지로 이동시키는 링크 */}
            <Link to="/contact" className="not-found-btn secondary">문의하기</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound;
