import SEOHead from '../components/SEOHead';
import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import site from '../config/site';

interface ReasonItem {
  emoji: string;
  title: string;
  desc: string;
}

interface BizArea {
  emoji: string;
  title: string;
  desc: string;
}

const REASONS: ReasonItem[] = [
  {
    emoji: '🧑‍🏫',
    title: '강사가 직접 운영합니다',
    desc: '이 사이트는 외주 제작이 아닌, 본 과정의 총괄 책임교수가 직접 설계·개발·운영합니다. 교육 내용과 동일한 기술 스택(React·Supabase·국내 LLM)으로 만들어 살아 있는 교재로 기능합니다.',
  },
  {
    emoji: '📚',
    title: '과정의 교재이자 결과물',
    desc: '강의 자료·과제·평가·팀 프로젝트가 한 곳에서 흐르도록 LMS 형태로 통합했습니다. 수강생이 학습하는 동안 사이트 자체가 “바이브코딩으로 무엇을 만들 수 있는가”의 살아 있는 사례가 됩니다.',
  },
  {
    emoji: '🤝',
    title: '교육 종료 후에도 이어집니다',
    desc: '강사의 회사(DreamIT Biz)가 지속적으로 사이트를 운영합니다. 단발성 강의가 아닌, 수강 이후의 커뮤니티·후속 코칭·경진대회 출품까지 함께 갑니다.',
  },
];

const BIZ_AREAS: BizArea[] = [
  {
    emoji: '🎓',
    title: '대학·기관 위탁교육',
    desc: '한신대학교 AI·SW대학을 포함한 교육기관과 협력하여 AI·SW 정규/특강 과정을 설계하고 운영합니다.',
  },
  {
    emoji: '🏢',
    title: '기업 맞춤형 AI 교육',
    desc: '국내 LLM과 바이브코딩 도구를 활용한 사내 교육·리스킬링 프로그램을 기업 요구에 맞게 설계·진행합니다.',
  },
  {
    emoji: '🌐',
    title: '교육 플랫폼 운영',
    desc: '대학 강의·자격증·진로·연구 등 분야별 90여 개의 교육 사이트를 자체 인프라(Supabase + GitHub Pages)로 운영 중입니다.',
  },
  {
    emoji: '📝',
    title: '교재·콘텐츠 출판',
    desc: 'AI·바이브코딩·경영정보 분야의 교육 자료와 도서, 온라인 강좌를 제작·배포합니다.',
  },
];

const ROW_LABEL: React.CSSProperties = {
  width: '120px',
  fontWeight: 600,
  color: 'var(--text-secondary, #6b7280)',
  fontSize: '15px',
  flexShrink: 0,
};
const ROW_VALUE: React.CSSProperties = {
  color: 'var(--text-primary, #1a1a1a)',
  fontSize: '16px',
  lineHeight: 1.6,
};

export default function About(): ReactElement {
  const c = site.company;

  return (
    <>
      <SEOHead
        title="회사소개 | AI Reboot Academy"
        description="본 사이트는 강사의 소속 회사 드림아이티비즈(DreamIT Biz)가 운영합니다. 회사 대표인 이애본 박사가 본 과정의 총괄 책임교수로 참여하며, 강의 운영을 위해 직접 사이트를 설계·개발했습니다."
        path="/about"
      />

      <section className="page-header">
        <div className="container">
          <h1>회사소개</h1>
          <p>본 사이트를 운영하는 강사의 소속 회사 · 드림아이티비즈(DreamIT Biz)</p>
        </div>
      </section>

      <section className="section" style={{ padding: '60px 0' }}>
        <div className="container">

          {/* ───── 이 사이트에 대해 (운영 주체 명시) ───── */}
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
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'var(--primary-blue, #0046C8)',
              margin: '0 0 12px',
            }}>ABOUT THIS SITE</p>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary, #1a1a1a)' }}>
              본 사이트는 강사의 회사가 직접 운영합니다.
            </h2>
            <p style={{ margin: 0, fontSize: '16px' }}>
              <strong>AI Reboot Academy</strong>는 본 과정의 총괄 책임교수인 <strong>이애본 박사</strong>가 대표로 있는{' '}
              <strong>드림아이티비즈(DreamIT Biz)</strong>가 운영합니다. 강사가 본 과정을 진행하기 위해
              직접 기획·설계·개발한 사이트로, 강의 자료·과제·평가·팀 프로젝트가 하나의 LMS로 통합되어 있습니다.
              따라서 회사 소개는 곧 <strong>본 강의의 운영 주체와 강사의 배경</strong>을 함께 설명하는 페이지입니다.
            </p>
          </div>

          {/* ───── 강사 프로필 카드 ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>총괄 책임교수 / 운영사 대표</span>
          </h3>
          <div style={{
            display: 'flex',
            gap: '24px',
            padding: '32px',
            background: 'var(--bg-card, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '12px',
            marginBottom: '56px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--bg-secondary, #f0f4ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              lineHeight: 1,
              flexShrink: 0,
            }}>
              <span role="img" aria-label="이애본 박사">👩‍🏫</span>
            </div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h4 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary, #1a1a1a)' }}>
                이애본 (Ph.D Aebon Lee)
              </h4>
              <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--primary-blue, #0046C8)' }}>
                총괄 책임교수 · DreamIT Biz 대표
              </p>
              <p style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.7 }}>
                한신대학교 AI·SW대학 겸임교수 · 드림아이티비즈 대표.<br />
                대학 강의와 기업 교육 현장에서 AI·SW·경영정보 분야를 가르치며, 본 과정은 회사 대표인 강사가 직접 설계하고
                운영하는 단기 집중 트랙입니다.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {['AI·SW 교육', '바이브코딩', '경영정보학', '인적자원관리', '에듀테크 운영'].map((tag) => (
                  <span key={tag} style={{
                    padding: '4px 12px',
                    background: 'var(--bg-secondary, #f0f4ff)',
                    color: 'var(--primary-blue, #0046C8)',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>{tag}</span>
                ))}
              </div>
              <Link to="/instructor" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '15.5px',
                fontWeight: 600,
                color: 'var(--primary-blue, #0046C8)',
                textDecoration: 'none',
              }}>
                강사진 상세 보기 →
              </Link>
            </div>
          </div>

          {/* ───── 이 사이트를 강사가 직접 만든 이유 ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>
              왜 강사가 직접 사이트를 만들었나
            </span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}>
            {REASONS.map((r, i) => (
              <div key={i} style={{
                padding: '24px',
                background: 'var(--bg-card, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
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
                  marginBottom: '14px',
                }}>
                  <span role="img" aria-label={r.title}>{r.emoji}</span>
                </div>
                <strong style={{ fontSize: '17px', color: 'var(--text-primary, #1a1a1a)', display: 'block', marginBottom: '8px' }}>
                  {r.title}
                </strong>
                <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.7 }}>
                  {r.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ───── 소속 회사 소개 ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>강사의 소속 회사</span>
          </h3>
          <div style={{
            padding: '32px 36px',
            background: 'var(--bg-card, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '12px',
            marginBottom: '24px',
            lineHeight: 1.8,
          }}>
            <p style={{
              fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em',
              color: 'var(--primary-blue, #0046C8)', margin: '0 0 8px',
            }}>COMPANY</p>
            <h4 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px', color: 'var(--text-primary, #1a1a1a)' }}>
              드림아이티비즈 (DreamIT Biz)
            </h4>
            <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.8 }}>
              드림아이티비즈는 본 과정의 강사가 대표로 운영하는 <strong>에듀테크 전문 회사</strong>입니다.
              대학·기관 위탁교육과 기업 맞춤형 AI 교육을 중심으로, 자체 인프라로 90여 개의 교육 사이트를
              설계·운영합니다. 본 과정 또한 회사의 교육 운영 사례 중 하나로, 강사가 대표 자격이자
              책임교수 자격으로 동시에 참여합니다.
            </p>
          </div>

          {/* 회사 사업 영역 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '56px',
          }}>
            {BIZ_AREAS.map((b, i) => (
              <div key={i} style={{
                padding: '20px 22px',
                background: 'var(--bg-card, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderTop: '3px solid var(--primary-blue, #0046C8)',
                borderRadius: '10px',
              }}>
                <div style={{ fontSize: '28px', lineHeight: 1, marginBottom: '10px' }}>
                  <span role="img" aria-label={b.title}>{b.emoji}</span>
                </div>
                <strong style={{ fontSize: '16px', color: 'var(--text-primary, #1a1a1a)', display: 'block', marginBottom: '6px' }}>
                  {b.title}
                </strong>
                <p style={{ margin: 0, fontSize: '15.5px', color: 'var(--text-secondary, #6b7280)', lineHeight: 1.65 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ───── 회사 상세 정보 + 연락처 ───── */}
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary, #1a1a1a)' }}>
            <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>회사 정보 / 문의</span>
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            marginBottom: '56px',
          }}>
            <div style={{
              padding: '28px 32px',
              background: 'var(--bg-card, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: '12px',
            }}>
              <p style={{
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--primary-blue, #0046C8)', margin: '0 0 16px',
              }}>회사 정보</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '16px' }}>
                <div style={{ display: 'flex' }}>
                  <span style={ROW_LABEL}>상호</span>
                  <span style={ROW_VALUE}>{c.name}</span>
                </div>
                <div style={{ display: 'flex' }}>
                  <span style={ROW_LABEL}>대표자</span>
                  <span style={ROW_VALUE}>{c.ceo} (본 과정 책임교수 겸직)</span>
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

            <div style={{
              padding: '28px 32px',
              background: 'var(--bg-card, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: '12px',
            }}>
              <p style={{
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--primary-blue, #0046C8)', margin: '0 0 16px',
              }}>연락처</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="이메일">📧</span>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>이메일 (강사 직통)</div>
                    <a href={`mailto:${c.email}`} style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      {c.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="전화">📞</span>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>전화</div>
                    <a href={`tel:${c.phone.replace(/-/g, '')}`} style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      {c.phone}
                    </a>
                  </div>
                </div>

                {c.kakao && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="카카오톡">💬</span>
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>카카오톡 ID</div>
                      <span style={{ color: 'var(--text-primary, #1a1a1a)', fontWeight: 600 }}>@{c.kakao}</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }} role="img" aria-label="본 사이트">🌐</span>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', marginBottom: '2px' }}>회사 본 사이트</div>
                    <a href={site.parentSite.url} target="_blank" rel="noopener noreferrer"
                       style={{ color: 'var(--text-primary, #1a1a1a)', textDecoration: 'none', fontWeight: 600 }}>
                      www.dreamitbiz.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ───── 회사가 운영하는 다른 사이트 ───── */}
          {site.familySites && site.familySites.length > 0 && (
            <>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary, #1a1a1a)' }}>
                <span style={{ borderLeft: '4px solid var(--primary-blue, #0046C8)', paddingLeft: '12px' }}>
                  회사가 운영하는 다른 교육 사이트
                </span>
              </h3>
              <p style={{ fontSize: '15.5px', color: 'var(--text-secondary, #6b7280)', margin: '0 0 20px', lineHeight: 1.7 }}>
                강사의 회사가 동일한 인프라로 운영 중인 사이트 예시입니다. 본 과정도 이 운영 체계 위에서 안정적으로 진행됩니다.
              </p>
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
                    fontSize: '16px',
                    fontWeight: 600,
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
            fontSize: '14.5px',
            color: 'var(--text-muted, #9ca3af)',
            borderTop: '1px solid var(--border-color, #e5e7eb)',
          }}>
            Copyright © 2025-2026 {c.name}. All Rights Reserved.<br />
            본 사이트는 {c.ceo} 대표(총괄 책임교수)가 직접 설계·운영합니다.
          </div>
        </div>
      </section>
    </>
  );
}
