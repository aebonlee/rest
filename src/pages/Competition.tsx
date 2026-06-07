/**
 * Competition.tsx
 *
 * 역할:
 *   AI 리부트 아카데미 LMS의 "AI 리부트 경진대회" 안내 페이지 컴포넌트.
 *   대회 개요, 참가 혜택, 활용 가능한 LLM 목록 등 정적 정보를 표시한다.
 *
 * 핵심 책임:
 *   - 페이지 헤더(제목/부제)는 다국어(useLanguage)의 t() 키를 통해 렌더링.
 *   - 대회 개요/혜택/LLM 카드 등 본문 콘텐츠를 시맨틱 섹션으로 마크업.
 *   - SEOHead 컴포넌트로 페이지별 메타데이터(제목/경로) 주입.
 *
 * 주요 export:
 *   - default: Competition (라우팅에서 /competition 경로에 매핑되는 페이지 컴포넌트)
 *
 * 참고:
 *   - 상태/부수효과 없는 순수 프레젠테이션 컴포넌트(데이터 fetch·인증 로직 없음).
 */
import { type ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';

/**
 * Competition
 * 경진대회 안내 페이지를 렌더링하는 함수형 컴포넌트.
 * @returns {ReactElement} 페이지 헤더와 대회 정보 섹션을 포함한 JSX 트리.
 * @sideeffect 없음(렌더링 외 부수효과 없음).
 */
const Competition = (): ReactElement => {
  // 다국어 컨텍스트에서 번역 함수 t를 구독 — 언어 변경 시 자동 리렌더.
  const { t } = useLanguage();

  return (
    <>
      {/* 페이지 메타데이터(문서 title, canonical path) 설정용 헤드 컴포넌트 */}
      <SEOHead title="AI 리부트 경진대회" path="/competition" />

      {/* 페이지 상단 헤더: 제목/부제는 번역 키로 다국어 처리 */}
      <section className="page-header">
        <div className="container">
          <h2>{t('site.competition.title')}</h2>
          <p>{t('site.competition.subtitle')}</p>
        </div>
      </section>

      {/* 본문 섹션: 대회 개요 / 참가 혜택 / 활용 가능 LLM 카드 묶음 */}
      <section className="section">
        <div className="container">
          <div className="competition-overview">
            {/* 카드 1: 대회 기본 정보(대회명/주최/주제/우대사항)를 그리드로 표기 */}
            <div className="competition-info-card">
              <h3>📋 대회 개요</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>대회명</strong>
                  <span>AI 리부트 경진대회</span>
                </div>
                <div className="info-item">
                  <strong>주최</strong>
                  <span>과학기술정보통신부 / 정보통신산업진흥원(NIPA)</span>
                </div>
                <div className="info-item">
                  <strong>주제</strong>
                  <span>AI를 활용한 사회문제 해결 서비스 개발</span>
                </div>
                <div className="info-item">
                  <strong>우대 사항</strong>
                  {/* 국내 LLM(Solar 등) 사용 시 가산점 부여 안내 */}
                  <span>국내 LLM(Solar 등) 활용 가산점</span>
                </div>
              </div>
            </div>

            {/* 카드 2: 참가자에게 제공되는 혜택 목록 */}
            <div className="competition-info-card">
              <h3>🎁 참가 혜택</h3>
              <ul className="benefit-list">
                <li>Claude 유료 플랜 1개월 제공(6월 한달)</li>
                <li>국내 LLM API 비용 지원 (Solar 등)</li>
                <li>전문 기술코칭 8시간 지원</li>
                <li>프로젝트 포트폴리오 완성</li>
                <li>수상 시 상금 및 인증서</li>
              </ul>
            </div>

            {/* 카드 3: 활용 가능한 LLM 안내 — 국내(Solar)는 '추천', 그 외는 '해외' 배지 */}
            <div className="competition-info-card">
              <h3>🤖 활용 가능 LLM</h3>
              <div className="llm-cards">
                {/* Solar: 국내 LLM, 가산점 대상이라 recommended 배지 부여 */}
                <div className="llm-card">
                  <h4>☀️ Solar (Upstage)</h4>
                  <p>국내 대표 LLM - 가산점 적용</p>
                  <span className="llm-badge recommended">추천</span>
                </div>
                <div className="llm-card">
                  <h4>💬 ChatGPT (OpenAI)</h4>
                  <p>범용 LLM</p>
                  <span className="llm-badge">해외</span>
                </div>
                <div className="llm-card">
                  <h4>✨ Gemini (Google)</h4>
                  <p>멀티모달 LLM</p>
                  <span className="llm-badge">해외</span>
                </div>
                <div className="llm-card">
                  <h4>🧠 Claude (Anthropic)</h4>
                  <p>안전한 AI 어시스턴트 - 유료 플랜 1개월 제공(6월 한달)</p>
                  <span className="llm-badge">해외</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// 라우터에서 /competition 경로에 연결되는 기본 export
export default Competition;
