import { useState, type ReactElement } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { assessmentSets, type AssessmentType } from '../data/assessmentData';

const TYPE_ORDER: AssessmentType[] = ['prerequisite', 'diagnostic', 'summative'];

const Assessment = (): ReactElement => {
  const { type } = useParams<{ type: string }>();
  const [revealed, setRevealed] = useState(false);

  const isValid = type && (TYPE_ORDER as string[]).includes(type);
  if (!isValid) return <Navigate to="/assessment/prerequisite" replace />;

  const set = assessmentSets[type as AssessmentType];

  return (
    <>
      <SEOHead
        title={`${set.title} | AI Reboot Academy`}
        description={set.description}
        path={`/assessment/${set.type}`}
      />

      <section className="page-header">
        <div className="container">
          <h1>{set.title}</h1>
          <p>{set.subtitle}</p>
        </div>
      </section>

      <section className="section" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          {/* 하위 메뉴 탭 */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '32px',
              borderBottom: '1px solid var(--border-color, #e5e7eb)',
              paddingBottom: '12px',
            }}
          >
            {TYPE_ORDER.map((t) => {
              const isActive = t === set.type;
              return (
                <Link
                  key={t}
                  to={`/assessment/${t}`}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                    background: isActive ? 'var(--primary-blue, #0046C8)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-primary, #1a1a1a)',
                    border: '1px solid var(--border-color, #e5e7eb)',
                  }}
                >
                  {assessmentSets[t].title}
                </Link>
              );
            })}
          </div>

          {/* 평가 개요 */}
          <div
            style={{
              background: 'var(--bg-secondary, #f8f9fa)',
              borderLeft: '4px solid var(--primary-blue, #0046C8)',
              padding: '24px 28px',
              borderRadius: '0 12px 12px 0',
              marginBottom: '32px',
              lineHeight: 1.7,
              color: 'var(--text-primary, #1a1a1a)',
            }}
          >
            <p style={{ margin: 0, marginBottom: '12px' }}>{set.description}</p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '14px' }}>
              <span>
                <strong>평가 범위:</strong> 정규과정 (Day 1~13)
              </span>
              <span>
                <strong>제한 시간:</strong> {set.duration}
              </span>
              <span>
                <strong>합격 기준:</strong> {set.passingScore}점 이상
              </span>
              <span>
                <strong>문항 수:</strong> 객관식 {set.mcq.length}개 + 단답식 {set.short.length}개
              </span>
            </div>
          </div>

          {/* 정답 토글 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--primary-blue, #0046C8)',
                background: revealed ? 'var(--primary-blue, #0046C8)' : 'transparent',
                color: revealed ? '#fff' : 'var(--primary-blue, #0046C8)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              {revealed ? '정답 숨기기' : '정답 보기'}
            </button>
          </div>

          {/* 객관식 15문항 */}
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '20px',
              color: 'var(--text-primary, #1a1a1a)',
              borderLeft: '4px solid var(--primary-blue, #0046C8)',
              paddingLeft: '12px',
            }}
          >
            객관식 ({set.mcq.length}문항)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            {set.mcq.map((q) => (
              <div
                key={q.no}
                style={{
                  background: 'var(--bg-card, #fff)',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                }}
              >
                <p style={{ margin: '0 0 14px', fontWeight: 600, color: 'var(--text-primary, #1a1a1a)' }}>
                  {q.no}. {q.question}
                </p>
                <ol style={{ margin: 0, paddingLeft: '24px', lineHeight: 1.9 }}>
                  {q.options.map((opt, i) => {
                    const isAnswer = revealed && i === q.answer;
                    return (
                      <li
                        key={i}
                        style={{
                          color: isAnswer ? 'var(--primary-blue, #0046C8)' : 'var(--text-secondary, #4b5563)',
                          fontWeight: isAnswer ? 700 : 400,
                        }}
                      >
                        {opt}
                        {isAnswer && (
                          <span style={{ marginLeft: '8px', fontSize: '13px' }}>← 정답</span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>

          {/* 단답식 5문항 */}
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '20px',
              color: 'var(--text-primary, #1a1a1a)',
              borderLeft: '4px solid var(--primary-blue, #0046C8)',
              paddingLeft: '12px',
            }}
          >
            단답식 ({set.short.length}문항)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {set.short.map((q) => (
              <div
                key={q.no}
                style={{
                  background: 'var(--bg-card, #fff)',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                }}
              >
                <p style={{ margin: '0 0 12px', fontWeight: 600, color: 'var(--text-primary, #1a1a1a)' }}>
                  {q.no}. {q.question}
                </p>
                <div
                  style={{
                    background: 'var(--bg-secondary, #f8f9fa)',
                    border: '1px dashed var(--border-color, #e5e7eb)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    minHeight: '44px',
                    color: revealed ? 'var(--primary-blue, #0046C8)' : 'var(--text-muted, #9ca3af)',
                    fontWeight: revealed ? 700 : 400,
                  }}
                >
                  {revealed ? `정답: ${q.answer}` : '— 답안 작성란 —'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Assessment;
