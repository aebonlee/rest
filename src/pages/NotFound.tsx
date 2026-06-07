/**
 * NotFound.tsx — 404 페이지(존재하지 않는 경로 폴백)
 *
 * 역할:
 *  - 라우터의 와일드카드(`*`) 경로에 매칭되어, 잘못된 URL 접근 시 표시되는 안내 화면.
 *
 * 핵심 책임:
 *  - 404 코드/안내 문구 표시 + 홈·문의로 이동하는 링크 제공.
 *
 * 주요 export:
 *  - default: NotFound (React 페이지 컴포넌트)
 */
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import type { ReactElement } from 'react';

// NotFound — 404 안내 화면을 렌더하는 단순 표시용 컴포넌트(상태/부수효과 없음).
const NotFound = (): ReactElement => {
  return (
    <>
      {/* 검색엔진/탭 제목용 메타 — 404 명시 */}
      <SEOHead title="404 - 페이지를 찾을 수 없습니다" />
      <section className="not-found-page">
        <div className="not-found-content">
          <h1 className="not-found-code">404</h1>
          <h2 className="not-found-title">페이지를 찾을 수 없습니다</h2>
          <p className="not-found-desc">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
          {/* 복귀 동선: 홈 / 문의 */}
          <div className="not-found-actions">
            <Link to="/" className="not-found-btn primary">홈으로 돌아가기</Link>
            <Link to="/contact" className="not-found-btn secondary">문의하기</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound;
