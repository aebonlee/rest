import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import site from '../config/site';
import { coursePhases, projectExamples } from '../config/curriculum';
import type { ReactElement } from 'react';

const Home = (): ReactElement => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={`${site.name} | ${site.nameKo}`} description={site.description} />

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-effect">
          <div className="particles">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${3 + Math.random() * 6}px`,
                height: `${3 + Math.random() * 6}px`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }} />
            ))}
          </div>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">{t('site.home.title')}</span>
              <span className="title-line"><span className="highlight">{t('site.home.subtitle')}</span></span>
            </h1>
            <p className="hero-description">{t('site.home.description')}</p>
            <div className="hero-info-cards">
              <div className="hero-info-card">
                <span className="hero-info-icon">📅</span>
                <div><strong>교육 기간</strong><br/>2026.6.1 ~ 6.22</div>
              </div>
              <div className="hero-info-card">
                <span className="hero-info-icon">⏱️</span>
                <div><strong>총 교육시간</strong><br/>80H (선수20H+정규52H+코칭8H)</div>
              </div>
              <div className="hero-info-card">
                <span className="hero-info-icon">💻</span>
                <div><strong>교육 방식</strong><br/>오프라인 집중 교육</div>
              </div>
              <div className="hero-info-card">
                <span className="hero-info-icon">🏆</span>
                <div><strong>목표</strong><br/>AI 리부트 경진대회 출품</div>
              </div>
            </div>
            <div className="hero-buttons">
              <Link to="/curriculum" className="btn btn-primary">{t('site.home.viewCurriculum')}</Link>
              <Link to="/register" className="btn btn-secondary">{t('site.home.applyNow')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 과정 개요 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('site.home.courseOverview')}</h2>
            <p className="section-subtitle">{t('site.home.courseOverviewDesc')}</p>
          </div>
          <div className="course-cards">
            {coursePhases.map((phase) => (
              <div key={phase.id} className="course-card" style={{ borderTopColor: phase.color }}>
                <div className="course-card-icon">{phase.icon}</div>
                <h3 className="course-card-title">{phase.name}</h3>
                <p className="course-card-hours">{phase.hours}시간</p>
                <p className="course-card-desc">{phase.description}</p>
                <div className="course-card-days">{phase.days.length}일 과정</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 프로젝트 산출물 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('site.home.projectOutputs')}</h2>
            <p className="section-subtitle">{t('site.home.projectOutputsDesc')}</p>
          </div>
          <div className="project-timeline">
            <div className="timeline-item">
              <div className="timeline-marker" style={{ background: '#10B981' }}>1</div>
              <div className="timeline-content">
                <h4>개인 미니프로젝트</h4>
                <p>1~3일차 | AI 자동화 도구를 활용한 개인 프로젝트</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker" style={{ background: '#3B82F6' }}>2</div>
              <div className="timeline-content">
                <h4>팀 미니프로젝트</h4>
                <p>4~5일차 | 바이브코딩 기반 팀 협업 프로젝트</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker" style={{ background: '#0D2B5E' }}>3</div>
              <div className="timeline-content">
                <h4>실전 프로젝트</h4>
                <p>6~13일차 | AI 리부트 경진대회 출품작 개발</p>
              </div>
            </div>
          </div>
          <div className="project-examples">
            <h3>프로젝트 예시</h3>
            <div className="example-cards">
              {projectExamples.map((ex, i) => (
                <div key={i} className="example-card">
                  <h4>{ex.title}</h4>
                  <p>{ex.description}</p>
                  <span className="example-llm">LLM: {ex.llm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI 리부트 대회 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('site.home.competition')}</h2>
            <p className="section-subtitle">{t('site.home.competitionDesc')}</p>
          </div>
          <div className="competition-highlight">
            <div className="competition-card">
              <h3>AI 리부트 경진대회</h3>
              <p>국내 LLM(Solar 등)을 활용한 서비스 개발 경진대회에 출품합니다.</p>
              <ul>
                <li>국내 LLM 활용 가산점</li>
                <li>ChatGPT 유료 플랜 제공</li>
                <li>국내 LLM API 비용 지원</li>
              </ul>
              <Link to="/competition" className="btn btn-primary">대회 상세 보기</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 특이사항 */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('site.home.eligibility')}</h2>
          </div>
          <div className="eligibility-cards">
            <div className="eligibility-card">
              <h4>교육 대상</h4>
              <p>고용보험 미가입, 아르바이트/계약직에 비참여 중인 청년</p>
            </div>
            <div className="eligibility-card">
              <h4>AI 도구 지원</h4>
              <p>ChatGPT 유료 플랜 제공 + 국내 LLM API 비용 지원</p>
            </div>
            <div className="eligibility-card">
              <h4>수료 후 혜택</h4>
              <p>AI 리부트 경진대회 출품 + 포트폴리오 완성</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
