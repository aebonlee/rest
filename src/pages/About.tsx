import SEOHead from '../components/SEOHead';
import type { ReactElement } from 'react';
import site from '../config/site';

interface FeatureItem {
  emoji: string;
  title: string;
  desc: string;
}

interface ProgramItem {
  emoji: string;
  phase: string;
  duration: string;
  desc: string;
}

interface StepItem {
  no: string;
  title: string;
  desc: string;
}

const FEATURES: FeatureItem[] = [
  {
    emoji: '🚀',
    title: 'AI 리부트',
    desc: '쉬었음청년의 재도약을 위한 맞춤형 AI 교육. 4주 80시간 단기 집중 트랙으로 빠르게 현장 역량을 회복합니다.',
  },
  {
    emoji: '💻',
    title: '바이브코딩',
    desc: 'Cursor·Claude Code·GitHub Copilot 등 AI 코딩 도구로 자연어 대화 기반 개발 워크플로우를 학습합니다.',
  },
  {
    emoji: '🏆',
    title: '경진대회 출품',
    desc: '국내 LLM(Solar/HyperCLOVA X/EXAONE) 활용 AI 서비스 개발 — AI 리부트 경진대회 출품을 목표로 합니다.',
  },
  {
    emoji: '🤝',
    title: '팀·커뮤니티',
    desc: '팀 프로젝트, 1:1 기술코칭, 동기 네트워크로 학습 이후에도 지속 가능한 성장 기반을 제공합니다.',
  },
];

const PROGRAMS: ProgramItem[] = [
  {
    emoji: '📘',
    phase: '선수과정',
    duration: '4일 · 20H',
    desc: 'AI 기초·LLM 이해·프롬프트 엔지니어링·개발환경 세팅. 정규과정 진입을 위한 사전 준비.',
  },
  {
    emoji: '⚡',
    phase: '정규과정 (DT)',
    duration: '13일 · 52H',
    desc: '바이브코딩·웹개발(HTML/CSS/JS/React)·Supabase·LLM API 연동·팀 프로젝트·배포·발표.',
  },
  {
    emoji: '🎯',
    phase: '기술코칭',
    duration: '4회 · 8H',
    desc: '전문가 1:1 멘토링. 프로젝트 코드리뷰, 디버깅 지원, 발표 리허설, 경진대회 출품 컨설팅.',
  },
];

const STEPS: StepItem[] = [
  { no: '01', title: '문제 정의', desc: '쉬었음청년이 마주한 디지털 전환 격차와 진로 단절 문제에서 출발했습니다.' },
  { no: '02', title: '솔루션 설계', desc: 'AI 도구로 코드 진입 장벽을 낮추고, 4주 단기로 실전 프로젝트까지 완주하는 트랙을 설계했습니다.' },
  { no: '03', title: '국내 LLM 중심', desc: 'Solar(업스테이지)·HyperCLOVA X(네이버)·EXAONE(LG)을 활용해 한국어 서비스를 제작합니다.' },
  { no: '04', title: '경진대회 연결', desc: '교육 산출물이 곧 AI 리부트 경진대회 출품작이 되는 결과 중심 커리큘럼입니다.' },
];

const ROW_LABEL: React.CSSProperties = {
  width: '120px',
  fontWeight: 600,
  color: 'var(--text-secondary, #6b7280)',
  fontSize: '13px',
  flexShrink: 0,
};
const ROW_VALUE: React.CSSProperties = {
  color: 'var(--text-primary, #1a1a1a)',
  fontSize: '14px',
  lineHeight: 1.6,
};

export default function About(): ReactElement {
  const c = site.company;

  return (
    <>
      <SEOHead
        title="회사소개 | AI Reboot Academy"
        description="드림아이티비즈(DreamIT Biz)가 운영하는 쉬었음청년 AI·바이브코딩 교육과정. 4주 80시간 집중 트랙으로 AI 리부트 경진대회 출품까지 완주합니다."
        path="/about"
      />

      <section className="page-header">
        <div className="container">
          <h1>회사소개</h1>
          <p>드림아이티비즈가 만드는 쉬었음청년 AI·바이브코딩 교육</p>
        </div>
      </section>

      <section className="section" style={{ padding: '60px 0' }}>
        <div className="container">

          {/* ───── 미션 박스 ───── */}
          <div style={{
            background: 'var(--bg-secondary, #f8f9fa)',
            borderLeft: '4px solid var(--primary-blue, #0046C8)',
            padding: '32px 36px',
            borderRadius: '0 12px 12px 0',
            marginBottom: '56px',
            lineHeight: 1.8,
            color: 'var(--text-primary, #1a1a1a)',
          }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--primary-blue, #0046C8)',
              margin: '0 0 12px',
            }}>OUR MISSION</p>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary, #1a1a1a)' }}>
              AI로 다시 시작하는 청년에게,<br />가장 빠른 재도약의 길을 만듭니다.
            </h2>
            <p style={{ margin: 0, fontSize: '15px' }}>
              <strong>AI Reboot Academy</strong>는 쉬었음청년을 대상으로 한 4주 80시간 AI·바이브코딩 집중 교육 플랫폼입니다.
              AI 코딩 도구와 국내 LLM을 활용해 빠르게 실전 프로젝트를 완성하고, <strong>AI 리부트 경진대회</strong> 출품까지
              완주하도록 돕습니다. 단순 강의가 아닌 <strong>결과물 중심</strong>의 트랙으로, 교육 종료 시점에 포트폴리오와
              운영 가능한 서비스를 동시에 확보합니다.
            </p>
          </div>

          {/* ───── 주요 특징 4종 (이모지) ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>주요 특징</span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}>
            {FEATURES.map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '16px',
                padding: '24px',
                background: 'var(--bg-card, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'var(--bg-secondary, #f0f4ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '28px',
                  lineHeight: 1,
                }}>
                  <span role="img" aria-label={item.title}>{item.emoji}</span>
                </div>
                <div>
                  <strong style={{ fontSize: '16px', color: 'var(--text-primary, #1a1a1a)', display: 'block', marginBottom: '6px' }}>
                    {item.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.6 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ───── 교육 프로그램 구성 ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>
              교육 프로그램 구성 (총 80H)
            </span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}>
            {PROGRAMS.map((p, i) => (
              <div key={i} style={{
                padding: '24px',
                background: 'var(--bg-card, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderTop: '4px solid var(--primary-blue, #0046C8)',
                borderRadius: '12px',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px', lineHeight: 1 }}>
                  <span role="img" aria-label={p.phase}>{p.emoji}</span>
                </div>
                <strong style={{ fontSize: '17px', color: 'var(--text-primary, #1a1a1a)', display: 'block', marginBottom: '4px' }}>
                  {p.phase}
                </strong>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  background: 'var(--bg-secondary, #f0f4ff)',
                  color: 'var(--primary-blue, #0046C8)',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '999px',
                  marginBottom: '14px',
                }}>{p.duration}</span>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.7 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ───── 우리가 만드는 방식 ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>우리가 만드는 방식</span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '56px',
          }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                padding: '24px',
                background: 'var(--bg-card, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
                position: 'relative',
              }}>
                <div style={{
                  fontSize: '36px',
                  fontWeight: 900,
                  color: 'var(--primary-blue-light, #4A8FE7)',
                  opacity: 0.35,
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>{s.no}</div>
                <strong style={{ fontSize: '15px', color: 'var(--text-primary, #1a1a1a)', display: 'block', marginBottom: '6px' }}>
                  {s.title}
                </strong>
                <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ───── 운영사 정보 (회사 상세) ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>운영사 정보</span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}>
            {/* 회사 정보 카드 */}
            <div style={{
              padding: '28px 32px',
              background: 'var(--bg-card, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: '12px',
            }}>
              <p style={{
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--primary-blue, #0046C8)', margin: '0 0 12px',
              }}>COMPANY</p>
              <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary, #1a1a1a)' }}>
                {c.name}
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.6 }}>
                100여 개 교육 사이트를 운영하는 에듀테크 전문 기업.<br />
                기업·기관·개인 맞춤형 디지털 교육 플랫폼을 설계·구축·운영합니다.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex' }}>
                  <span style={ROW_LABEL}>대표자</span>
                  <span style={ROW_VALUE}>{c.ceo} (Ph.D Aebon Lee)</span>
                </div>
                <div style={{ display: 'flex' }}>
                  <span style={ROW_LABEL}>사업자번호</span>
                  <span style={ROW_VALUE}>{c.bizNumber}</span>
                </div>
                {c.salesNumber && (
                  <div style={{ display: 'flex' }}>
                    <span style={ROW_LABEL}>통신판매번호</span>
                    <span style={ROW_VALUE}>{c.salesNumber}</span>
                  </div>
                )}
                <div style={{ display: 'flex' }}>
                  <span style={ROW_LABEL}>주소</span>
                  <span style={ROW_VALUE}>{c.address}</span>
                </div>
                {c.businessHours && (
                  <div style={{ display: 'flex' }}>
                    <span style={ROW_LABEL}>운영시간</span>
                    <span style={ROW_VALUE}>{c.businessHours}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 연락처 카드 */}
            <div style={{
              padding: '28px 32px',
              background: 'var(--bg-card, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: '12px',
            }}>
              <p style={{
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--primary-blue, #0046C8)', margin: '0 0 12px',
              }}>CONTACT</p>
              <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-primary, #1a1a1a)' }}>
                문의 / 제휴
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="이메일">📧</span>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>이메일</div>
                    <a href={`mailto:${c.email}`} style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      {c.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="전화">📞</span>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>전화</div>
                    <a href={`tel:${c.phone.replace(/-/g, '')}`} style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      {c.phone}
                    </a>
                  </div>
                </div>

                {c.kakao && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="카카오톡">💬</span>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>카카오톡</div>
                      <span style={{ color: 'var(--text-primary, #1a1a1a)', fontWeight: 600 }}>@{c.kakao}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="웹사이트">🌐</span>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>본 사이트</div>
                    <a href={site.parentSite.url} target="_blank" rel="noopener noreferrer"
                       style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      www.dreamitbiz.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ───── 패밀리 사이트 ───── */}
          {site.familySites && site.familySites.length > 0 && (
            <>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
                <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>패밀리 사이트</span>
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                marginBottom: '32px',
              }}>
                {site.familySites.map((fs, i) => (
                  <a key={i} href={fs.url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '16px 20px',
                    background: 'var(--bg-card, #fff)',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: 'var(--text-primary, #1a1a1a)',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'border-color 0.2s',
                  }}>
                    <span role="img" aria-label="link" style={{ fontSize: '18px', lineHeight: 1 }}>🔗</span>
                    <span>{fs.name}</span>
                  </a>
                ))}
              </div>
            </>
          )}

          {/* ───── 저작권 ───── */}
          <div style={{
            marginTop: '40px',
            padding: '20px',
            textAlign: 'center',
            fontSize: '12.5px',
            color: 'var(--text-muted, #9ca3af)',
            borderTop: '1px solid var(--border-color, #e5e7eb)',
          }}>
            Copyright © 2025-2026 {c.name}. All Rights Reserved.
          </div>
        </div>
      </section>
    </>
  );
}
