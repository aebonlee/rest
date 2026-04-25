import { type ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';

const Competition = (): ReactElement => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title="AI 리부트 경진대회" path="/competition" />

      <section className="page-header">
        <div className="container">
          <h2>{t('site.competition.title')}</h2>
          <p>{t('site.competition.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="competition-overview">
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
                  <span>국내 LLM(Solar 등) 활용 가산점</span>
                </div>
              </div>
            </div>

            <div className="competition-info-card">
              <h3>🎁 참가 혜택</h3>
              <ul className="benefit-list">
                <li>ChatGPT 유료 플랜 제공 (교육 기간)</li>
                <li>국내 LLM API 비용 지원 (Solar 등)</li>
                <li>전문 기술코칭 8시간 지원</li>
                <li>프로젝트 포트폴리오 완성</li>
                <li>수상 시 상금 및 인증서</li>
              </ul>
            </div>

            <div className="competition-info-card">
              <h3>🤖 활용 가능 LLM</h3>
              <div className="llm-cards">
                <div className="llm-card">
                  <h4>☀️ Solar (Upstage)</h4>
                  <p>국내 대표 LLM - 가산점 적용</p>
                  <span className="llm-badge recommended">추천</span>
                </div>
                <div className="llm-card">
                  <h4>💬 ChatGPT (OpenAI)</h4>
                  <p>범용 LLM - 유료 플랜 제공</p>
                  <span className="llm-badge">해외</span>
                </div>
                <div className="llm-card">
                  <h4>✨ Gemini (Google)</h4>
                  <p>멀티모달 LLM</p>
                  <span className="llm-badge">해외</span>
                </div>
                <div className="llm-card">
                  <h4>🧠 Claude (Anthropic)</h4>
                  <p>안전한 AI 어시스턴트</p>
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

export default Competition;
