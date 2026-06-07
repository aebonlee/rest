/**
 * Footer.tsx
 *
 * [파일 역할]
 *   사이트 전역에서 사용되는 푸터(footer) 레이아웃 컴포넌트.
 *   브랜드 정보, 회사 정보, 빠른 링크, 연락처, 패밀리 사이트 선택,
 *   저작권 표시를 한 곳에 모아 렌더링한다.
 *
 * [핵심 책임]
 *   - site 설정(config/site)에 정의된 브랜드/회사/링크/패밀리 사이트 데이터를 화면에 출력.
 *   - 다국어 처리(useLanguage 훅의 t 함수)를 통해 라벨/문구를 번역.
 *   - 패밀리 사이트 select 변경 시 새 탭으로 해당 URL을 열어줌.
 *
 * [주요 export]
 *   - default: Footer (React 함수형 컴포넌트)
 */
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import site from '../../config/site';
import type { ReactElement, ChangeEvent } from 'react';

/**
 * Footer
 *   사이트 하단 푸터 UI를 렌더링하는 함수형 컴포넌트.
 *
 * @returns {ReactElement} 푸터 전체 마크업
 * @sideeffect select 변경 핸들러에서 window.open으로 새 탭을 여는 부수효과가 발생할 수 있음.
 */
const Footer = (): ReactElement => {
  // 다국어 컨텍스트에서 번역 함수 t를 가져온다. t(key) 형태로 라벨을 번역.
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* 브랜드 영역: 로고 텍스트(파트별 스타일) + 태그라인 + 회사 기본 정보 */}
          <div className="footer-brand">
            <h3>
              {/* 브랜드명을 여러 파트로 나누어 파트별 className(색상/강조 등)을 적용 */}
              {site.brand.parts.map((part, i) => (
                <span key={i} className={part.className}>
                  {part.text}
                </span>
              ))}
            </h3>
            {/* 브랜드 태그라인(슬로건) — 번역 키로 출력 */}
            <p>{t('footer.tagline')}</p>
            <div className="company-info">
              <p><strong>{site.company.name}</strong></p>
              <p>대표이사: {site.company.ceo}</p>
              <p>사업자등록번호: {site.company.bizNumber}</p>
              {/* 통신판매신고번호는 설정에 값이 있을 때만 노출(없으면 렌더링 생략) */}
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
              {site.footerLinks.map((link, i) => (
                <li key={i}>
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
            {/* 카카오톡 정보는 설정에 있을 때만 노출 */}
            {site.company.kakao && <p>카카오톡: {site.company.kakao}</p>}
            {/* 영업시간 정보도 설정에 있을 때만 노출 */}
            {site.company.businessHours && <p className="business-hours">{site.company.businessHours}</p>}

            <div className="footer-family">
              {/* 패밀리 사이트 드롭다운: 선택 시 새 탭으로 이동.
                  defaultValue=""로 초기에는 placeholder 옵션이 선택된 상태 */}
              <select
                defaultValue=""
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  // 빈 값(placeholder)이 아니면 선택된 URL을 새 탭으로 연다.
                  if (e.target.value) window.open(e.target.value, '_blank');
                  // 선택 직후 값을 다시 ""로 초기화해 같은 사이트를 연속 선택해도 onChange가 동작하도록 함.
                  e.target.value = '';
                }}
              >
                {/* placeholder 역할의 비활성 옵션 — 선택 불가 */}
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
        <div className="footer-bottom">
          <p>&copy; 2020-{new Date().getFullYear()} DreamIT Biz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
