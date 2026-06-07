/**
 * Footer.tsx
 *
 * [이 파일이 무엇인가 — 초보자용 한 줄 요약]
 *   웹사이트 화면 맨 아래에 항상 보이는 "푸터(footer)" 영역을 그려주는 부품(컴포넌트)이다.
 *   회사 정보, 빠른 링크, 연락처, 패밀리 사이트 선택 메뉴, 저작권 문구가 여기에 모여 있다.
 *
 * [왜 이런 파일이 필요한가]
 *   - 푸터는 거의 모든 페이지에서 똑같이 보여야 한다. 페이지마다 따로 만들면 수정할 때마다
 *     여러 곳을 고쳐야 해서 실수가 잦다. 그래서 "한 번 만들어 재사용"하려고 컴포넌트로 분리한다.
 *   - 이렇게 화면을 작은 부품(컴포넌트) 단위로 쪼개는 것이 React의 기본 사고방식이다.
 *
 * [초보자가 먼저 알아두면 좋은 용어]
 *   - 컴포넌트(component): 화면의 한 조각을 만들어 돌려주는 함수. 여기서는 Footer가 그 함수다.
 *   - JSX: 자바스크립트 안에서 HTML처럼 생긴 문법을 쓰는 것. (예: <footer>...</footer>)
 *           실제로는 React가 화면 요소로 변환해 준다. 진짜 HTML은 아니다.
 *   - props/state: 컴포넌트가 받는 입력값(props)과 내부에서 바뀌는 값(state). 이 파일은
 *     입력값(props)을 받지 않고, 별도 state도 쓰지 않는 단순한 "표시 전용" 컴포넌트다.
 *   - 훅(hook): use로 시작하는 특수 함수. React 기능(번역, 상태 등)을 컴포넌트에서 꺼내 쓰게 해준다.
 *
 * [핵심 책임]
 *   - site 설정(config/site)에 정의된 브랜드/회사/링크/패밀리 사이트 데이터를 화면에 출력.
 *     (즉, 문구를 코드에 직접 박지 않고 설정 파일에서 읽어와 "데이터와 화면"을 분리한다.)
 *   - 다국어 처리(useLanguage 훅의 t 함수)를 통해 라벨/문구를 번역.
 *   - 패밀리 사이트 select 변경 시 새 탭으로 해당 URL을 열어줌.
 *
 * [주요 export]
 *   - default: Footer (React 함수형 컴포넌트)
 */

// react-router-dom의 Link: 페이지 전체를 새로고침하지 않고 앱 내부 경로로 이동시키는 컴포넌트.
//   주의: 외부 사이트(다른 도메인)로 갈 때는 <a> 태그나 window.open을 쓰고, Link는 "앱 내부 경로"에만 쓴다.
import { Link } from 'react-router-dom';
// useLanguage: 우리가 직접 만든 커스텀 훅. 현재 언어 설정과 번역 함수 t를 꺼내 쓸 수 있게 해준다.
//   (Context란 컴포넌트 트리 전체가 공유하는 "전역 보관함" 같은 것. 언어 같은 공통값을 담아둔다.)
import { useLanguage } from '../../contexts/LanguageContext';
// site: 회사명, 링크, 패밀리 사이트 등 사이트 전반의 설정값이 담긴 객체. 문구를 한곳에서 관리하려고 분리.
import site from '../../config/site';
// type import: 타입(설계도)만 가져온다는 표시. 'import type'은 실제 실행 코드에는 포함되지 않는다(TypeScript 전용).
//   - ReactElement: "React 화면 요소" 타입. 컴포넌트가 무엇을 돌려주는지 명시할 때 쓴다.
//   - ChangeEvent: input/select 등의 값이 바뀔 때 발생하는 "변경 이벤트" 객체의 타입.
import type { ReactElement, ChangeEvent } from 'react';

/**
 * Footer
 *   사이트 하단 푸터 UI를 렌더링하는 함수형 컴포넌트.
 *
 *   왜 함수로 만드나: React에서 컴포넌트는 "화면을 설명하는 JSX를 return하는 함수"다.
 *   이 함수를 <Footer /> 형태로 부르면 React가 실행해서 그 결과를 화면에 그린다.
 *
 * @returns {ReactElement} 푸터 전체 마크업
 *   - 반환 타입 ReactElement는 "이 함수는 화면 요소를 돌려준다"고 TypeScript에 알려주는 약속이다.
 * @sideeffect select 변경 핸들러에서 window.open으로 새 탭을 여는 부수효과가 발생할 수 있음.
 *   - 부수효과(side effect): 화면을 그리는 것 외에 외부 세계에 영향을 주는 동작(새 탭 열기 등).
 */
const Footer = (): ReactElement => {
  // 다국어 컨텍스트에서 번역 함수 t를 가져온다. t(key) 형태로 라벨을 번역.
  //   { t } 문법은 "구조 분해 할당": useLanguage()가 돌려준 객체에서 t라는 속성만 꺼내는 것.
  //   동작 예: t('footer.contact') -> 현재 언어가 한국어면 '연락처', 영어면 'Contact' 식으로 변환.
  const { t } = useLanguage();

  // 아래 return 안의 JSX가 실제로 화면에 그려질 내용이다.
  //   주의: JSX에서 HTML의 class 속성은 'className'으로 써야 한다(class는 JS 예약어이기 때문).
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* 브랜드 영역: 로고 텍스트(파트별 스타일) + 태그라인 + 회사 기본 정보 */}
          <div className="footer-brand">
            <h3>
              {/* 브랜드명을 여러 파트로 나누어 파트별 className(색상/강조 등)을 적용 */}
              {/* .map(): 배열의 각 요소를 다른 형태(여기서는 <span>)로 바꿔 새 배열을 만든다.
                  JSX에서 목록을 그릴 때 가장 많이 쓰는 패턴이다.
                  (part, i)에서 part는 각 항목, i는 그 항목의 순서 번호(0,1,2...)다. */}
              {site.brand.parts.map((part, i) => (
                // key: React가 목록의 각 항목을 구분하려고 요구하는 고유 식별자.
                //   주의: 가능하면 고유 id를 쓰는 게 안전하지만, 여기처럼 순서가 바뀌지 않는
                //   고정 목록에서는 인덱스 i를 key로 써도 무방하다.
                <span key={i} className={part.className}>
                  {part.text}
                </span>
              ))}
            </h3>
            {/* 브랜드 태그라인(슬로건) — 번역 키로 출력 */}
            <p>{t('footer.tagline')}</p>
            <div className="company-info">
              {/* {site.company.name} 처럼 중괄호 {} 안에는 자바스크립트 값을 넣어 화면에 출력한다. */}
              <p><strong>{site.company.name}</strong></p>
              <p>대표이사: {site.company.ceo}</p>
              <p>사업자등록번호: {site.company.bizNumber}</p>
              {/* 통신판매신고번호는 설정에 값이 있을 때만 노출(없으면 렌더링 생략) */}
              {/* 패턴 설명: {조건 && <화면요소>}
                  - 조건이 참(값이 있음)이면 뒤의 <p>가 그려지고, 거짓이면 아무것도 안 그려진다.
                  - 이를 "조건부 렌더링"이라 한다. if문 대신 JSX 안에서 간결하게 쓰는 방법.
                  주의: 숫자 0은 거짓처럼 취급되어 화면에 '0'이 그대로 찍힐 수 있으니, 0이 의미 있는
                        값이라면 이 && 패턴 대신 다른 방식을 써야 한다. (여기 값들은 문자열이라 안전) */}
              {site.company.salesNumber && <p>통신판매신고번호: {site.company.salesNumber}</p>}
              {/* 출판사 신고번호도 설정에 존재할 때만 조건부 노출 */}
              {site.company.publisherNumber && <p>출판사 신고번호: {site.company.publisherNumber}</p>}
            </div>
          </div>
          {/* 빠른 링크 영역: site.footerLinks 배열을 내부 라우트 Link로 렌더링 */}
          <div className="footer-links">
            <h4>{t('footer.quickLinks')}</h4>
            <ul>
              {/* 각 링크의 path로 이동하는 react-router Link, 라벨은 번역 키 사용 */}
              {/* 설정 배열 footerLinks를 돌면서 링크 목록을 자동으로 만든다.
                  링크가 추가/삭제되어도 이 코드는 그대로 두고 설정 파일만 고치면 된다. */}
              {site.footerLinks.map((link, i) => (
                <li key={i}>
                  {/* to={link.path}: 클릭하면 그 경로로 이동. 새로고침 없이 앱 내부에서 화면만 바뀐다. */}
                  <Link to={link.path}>{t(link.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/* 연락처 영역: 주소/이메일/전화 + 선택적 카카오·영업시간 + 패밀리 사이트 선택 */}
          <div className="footer-contact">
            <h4>{t('footer.contact')}</h4>
            <p>{site.company.address}</p>
            <p>{site.company.email}</p>
            <p>{site.company.phone}</p>
            {/* 카카오톡 정보는 설정에 있을 때만 노출 (위에서 설명한 조건부 렌더링과 같은 패턴) */}
            {site.company.kakao && <p>카카오톡: {site.company.kakao}</p>}
            {/* 영업시간 정보도 설정에 있을 때만 노출 */}
            {site.company.businessHours && <p className="business-hours">{site.company.businessHours}</p>}

            <div className="footer-family">
              {/* 패밀리 사이트 드롭다운: 선택 시 새 탭으로 이동.
                  defaultValue=""로 초기에는 placeholder 옵션이 선택된 상태 */}
              {/* defaultValue: 처음 화면에 그려질 때의 선택값. value(제어 컴포넌트) 대신 defaultValue를
                  쓰면 React가 값을 계속 관리하지 않는 "비제어 컴포넌트"가 된다.
                  여기서는 선택값을 저장할 필요가 없고 "선택하면 바로 이동"만 하면 되므로 이 방식이 간단하다. */}
              <select
                defaultValue=""
                // onChange: 드롭다운에서 다른 항목을 고르면 호출되는 함수(이벤트 핸들러).
                //   e: 변경 이벤트 객체. e.target은 변경이 일어난 select 요소, e.target.value는 선택된 값.
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  // 빈 값(placeholder)이 아니면 선택된 URL을 새 탭으로 연다.
                  //   '_blank'는 "새 탭/창에서 열기"를 의미한다. 외부 사이트라 Link 대신 window.open을 쓴다.
                  if (e.target.value) window.open(e.target.value, '_blank');
                  // 선택 직후 값을 다시 ""로 초기화해 같은 사이트를 연속 선택해도 onChange가 동작하도록 함.
                  //   이유: onChange는 "값이 바뀔 때"만 호출된다. 값을 비워두지 않으면 같은 항목을
                  //         다시 골랐을 때 값이 그대로라 onChange가 안 불려서 다시 열리지 않는다.
                  e.target.value = '';
                }}
              >
                {/* placeholder 역할의 비활성 옵션 — 선택 불가 */}
                {/* disabled: 선택 못 하게 막아, 안내문구("Family Site")가 진짜 항목처럼 골라지는 걸 방지. */}
                <option value="" disabled>Family Site</option>
                {/* 본사이트(상위 사이트) 옵션 */}
                <option value={site.parentSite.url}>{site.parentSite.name} (본사이트)</option>
                {/* 그 외 패밀리 사이트 목록을 설정 배열에서 동적으로 렌더링 */}
                {site.familySites.map((s, i) => (
                  <option key={i} value={s.url}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* 푸터 하단: 저작권 표기. 시작 연도(2020)부터 현재 연도까지 자동 표시 */}
        {/* new Date().getFullYear(): 현재 연도를 숫자로 얻는다. 이렇게 하면 해가 바뀌어도
            코드를 고칠 필요 없이 "2020-올해" 가 자동으로 갱신된다.
            &copy;는 저작권 기호 ⓒ 를 뜻하는 HTML 특수문자 표기다. */}
        <div className="footer-bottom">
          <p>&copy; 2020-{new Date().getFullYear()} DreamIT Biz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// 이 파일의 대표 출력물로 Footer를 내보낸다. 다른 파일에서 import Footer from '...'로 가져다 쓴다.
export default Footer;
