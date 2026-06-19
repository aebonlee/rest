/**
 * CompetitionResult.tsx — 경진대회 · 프로젝트 결과평가 (공개 예정)
 *
 * [역할]
 *  - 프로젝트 결과평가는 2026-06-22 공개 예정. 그 전까지 "곧 공개" 안내만 보여 주는 페이지.
 *  - 공개일 이후에는 이 자리에 결과평가/최종 순위 화면을 붙인다(추후 확장).
 *
 * [주요 export]
 *  - default CompetitionResult
 *
 * [초보자 메모]
 *  - 외부 통신/상태 없이 안내 문구만 그리는 순수 프레젠테이션 컴포넌트다.
 */
import { type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';
import { EmojiIcon } from '../utils/emojiIcon';

// 결과평가 공개일(표시는 한 곳에서만 관리).
const OPEN_DATE = '2026년 6월 22일';

const CompetitionResult = (): ReactElement => {
  return (
    <>
      <SEOHead title="프로젝트 결과평가 — AI 리부트 경진대회" path="/competition/result" noindex />

      <section className="page-header">
        <div className="container">
          <h2>프로젝트 결과평가</h2>
          <p>최종 산출물에 대한 결과평가 결과를 공개합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div
            style={{
              background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '16px',
              padding: '56px 28px', textAlign: 'center', color: 'var(--text-primary)',
            }}
          >
            <div style={{ fontSize: '56px', marginBottom: '16px' }}><EmojiIcon char="🏆" /></div>
            <h3 style={{ margin: '0 0 10px', fontSize: '24px' }}>Coming Soon</h3>
            <p style={{ margin: '0 0 20px', fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              프로젝트 결과평가는 준비 중입니다.<br />
              <strong style={{ color: 'var(--primary-blue)' }}>{OPEN_DATE}</strong>에 공개됩니다.
            </p>
            <span
              style={{
                display: 'inline-block', fontSize: '14px', fontWeight: 700, padding: '8px 18px',
                borderRadius: '999px', background: '#dbeafe', color: '#1e3a8a',
              }}
            >
              <EmojiIcon char="📅" /> {OPEN_DATE} 공개 예정
            </span>
            <p style={{ margin: '24px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              그 전까지는 <strong>프로젝트 사전평가</strong>에서 23개 팀 프로젝트를 평가하실 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default CompetitionResult;
