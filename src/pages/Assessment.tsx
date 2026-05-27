import { useState, useMemo, useEffect, useRef, type ReactElement } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { assessmentSets, type AssessmentType } from '../data/assessmentData';

const TYPE_ORDER: AssessmentType[] = ['prerequisite', 'diagnostic', 'summative'];

type Answers = Record<number, number>;   // questionNo → selected option index

interface Result {
  total: number;
  correct: number;
  scorePercent: number;
  perQuestion: Array<{
    no: number;
    isCorrect: boolean;
    userAnswer: number | undefined;
    correctAnswer: number;
  }>;
}

const Assessment = (): ReactElement => {
  const { type } = useParams<{ type: string }>();
  const isValid = type && (TYPE_ORDER as string[]).includes(type);
  if (!isValid) return <Navigate to="/assessment/prerequisite" replace />;

  const set = assessmentSets[type as AssessmentType];
  const storageKey = `rest-assessment-${set.type}`;
  const submitKey = `${storageKey}-submitted`;

  // 사용자 답안 (localStorage에서 복원)
  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // 제출 여부
  const [submitted, setSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(submitKey) === 'true';
  });

  // 평가지 변경 시 상태 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setAnswers(saved ? JSON.parse(saved) : {});
      setSubmitted(localStorage.getItem(submitKey) === 'true');
    } catch {
      setAnswers({});
      setSubmitted(false);
    }
  }, [set.type, storageKey, submitKey]);

  // 답안 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch { /* ignore */ }
  }, [answers, storageKey]);

  // 채점 결과 계산
  const result: Result | null = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    const perQuestion = set.mcq.map((q) => {
      const userAnswer = answers[q.no];
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) correct++;
      return { no: q.no, isCorrect, userAnswer, correctAnswer: q.answer };
    });
    return {
      total: set.mcq.length,
      correct,
      scorePercent: Math.round((correct / set.mcq.length) * 100),
      perQuestion,
    };
  }, [submitted, answers, set.mcq]);

  // 답안 선택
  const handleSelect = (questionNo: number, optionIndex: number) => {
    if (submitted) return;   // 제출 후에는 변경 불가
    setAnswers((prev) => ({ ...prev, [questionNo]: optionIndex }));
  };

  // 제출
  const handleSubmit = () => {
    const unanswered = set.mcq.filter((q) => answers[q.no] === undefined);
    if (unanswered.length > 0) {
      const confirmMsg = `${unanswered.length}개 문항이 미응답입니다. 그래도 제출하시겠습니까?\n(미응답은 0점 처리됩니다)`;
      if (!confirm(confirmMsg)) return;
    }
    setSubmitted(true);
    localStorage.setItem(submitKey, 'true');
    // 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 다시 풀기
  const handleReset = () => {
    if (!confirm('답안과 결과를 모두 초기화하고 다시 풀까요?')) return;
    setAnswers({});
    setSubmitted(false);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(submitKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredCount = Object.keys(answers).length;
  const passed = result ? result.scorePercent >= set.passingScore : false;

  // 문항으로 스크롤
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollToQuestion = (no: number) => {
    questionRefs.current[no]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
          {/* 평가지 탭 */}
          <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border-color, #e5e7eb)',
            paddingBottom: '12px',
          }}>
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

          {/* 결과 배너 (제출 후) */}
          {result && (
            <div style={{
              background: passed ? '#ecfdf5' : '#fef2f2',
              border: `2px solid ${passed ? '#10b981' : '#ef4444'}`,
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '14px', fontWeight: 600,
                color: passed ? '#065f46' : '#991b1b',
                margin: '0 0 8px',
                letterSpacing: '0.05em',
              }}>
                {passed ? '✓ 합격' : '✗ 불합격'}
              </p>
              <h2 style={{
                fontSize: '48px', fontWeight: 800, margin: '0 0 8px',
                color: passed ? '#10b981' : '#ef4444',
              }}>
                {result.correct} / {result.total}
              </h2>
              <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #1a1a1a)', margin: '0 0 4px' }}>
                {result.scorePercent}점
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)', margin: '0 0 20px' }}>
                합격 기준: {set.passingScore}점 이상
              </p>

              {/* 빠른 점프 — 오답만 */}
              {result.perQuestion.filter((q) => !q.isCorrect).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary, #6b7280)', margin: '0 0 8px' }}>
                    오답 문항으로 이동:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                    {result.perQuestion
                      .filter((q) => !q.isCorrect)
                      .map((q) => (
                        <button
                          key={q.no}
                          type="button"
                          onClick={() => scrollToQuestion(q.no)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: '#fff',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >{q.no}</button>
                      ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: 'var(--primary-blue, #0046C8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >다시 풀기</button>
            </div>
          )}

          {/* 평가 개요 */}
          <div style={{
            background: 'var(--bg-secondary, #f8f9fa)',
            borderLeft: '4px solid var(--primary-blue, #0046C8)',
            padding: '20px 24px',
            borderRadius: '0 12px 12px 0',
            marginBottom: '24px',
            lineHeight: 1.7,
            color: 'var(--text-primary, #1a1a1a)',
          }}>
            <p style={{ margin: '0 0 10px', fontSize: '14px' }}>{set.description}</p>
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13px' }}>
              <span><strong>제한 시간:</strong> {set.duration}</span>
              <span><strong>합격 기준:</strong> {set.passingScore}점</span>
              <span><strong>문항 수:</strong> {set.mcq.length}문항</span>
              {!submitted && (
                <span style={{ color: 'var(--primary-blue, #0046C8)', fontWeight: 700 }}>
                  진행: {answeredCount} / {set.mcq.length}
                </span>
              )}
            </div>
          </div>

          {/* 진행률 막대 (미제출 상태) */}
          {!submitted && (
            <div style={{
              background: 'var(--border-color, #e5e7eb)',
              height: '6px',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '24px',
            }}>
              <div style={{
                width: `${(answeredCount / set.mcq.length) * 100}%`,
                height: '100%',
                background: 'var(--primary-blue, #0046C8)',
                transition: 'width 0.3s',
              }} />
            </div>
          )}

          {/* 문항 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {set.mcq.map((q) => {
              const userAnswer = answers[q.no];
              const isAnswered = userAnswer !== undefined;
              const isCorrect = submitted && userAnswer === q.answer;
              const isWrong = submitted && isAnswered && userAnswer !== q.answer;
              const isUnanswered = submitted && !isAnswered;

              // 카드 테두리 색상
              let borderColor = 'var(--border-color, #e5e7eb)';
              if (isCorrect) borderColor = '#10b981';
              else if (isWrong || isUnanswered) borderColor = '#ef4444';

              return (
                <div
                  key={q.no}
                  ref={(el) => { questionRefs.current[q.no] = el; }}
                  style={{
                    background: 'var(--bg-card, #fff)',
                    border: `2px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '20px 24px',
                    scrollMarginTop: '80px',
                  }}
                >
                  {/* 문제 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary, #1a1a1a)', flex: 1 }}>
                      <span style={{
                        display: 'inline-block',
                        width: '28px',
                        textAlign: 'center',
                        color: 'var(--primary-blue, #0046C8)',
                        fontWeight: 700,
                      }}>{q.no}.</span>
                      {q.question}
                    </p>
                    {submitted && (
                      <span style={{
                        flexShrink: 0,
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '999px',
                        background: isCorrect ? '#d1fae5' : '#fee2e2',
                        color: isCorrect ? '#065f46' : '#991b1b',
                      }}>
                        {isCorrect ? '✓ 정답' : isUnanswered ? '미응답' : '✗ 오답'}
                      </span>
                    )}
                  </div>

                  {/* 보기 — 라디오 버튼 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '8px' }}>
                    {q.options.map((opt, i) => {
                      const isUserChoice = userAnswer === i;
                      const isCorrectOption = submitted && i === q.answer;
                      const isWrongChoice = submitted && isUserChoice && i !== q.answer;

                      let bg = 'transparent';
                      let color = 'var(--text-primary, #1a1a1a)';
                      let optBorderColor = 'var(--border-color, #e5e7eb)';

                      if (submitted) {
                        if (isCorrectOption) {
                          bg = '#ecfdf5';
                          color = '#065f46';
                          optBorderColor = '#10b981';
                        } else if (isWrongChoice) {
                          bg = '#fef2f2';
                          color = '#991b1b';
                          optBorderColor = '#ef4444';
                        }
                      } else if (isUserChoice) {
                        bg = 'var(--bg-secondary, #f0f4ff)';
                        optBorderColor = 'var(--primary-blue, #0046C8)';
                      }

                      return (
                        <label
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 12px',
                            background: bg,
                            border: `1px solid ${optBorderColor}`,
                            borderRadius: '8px',
                            cursor: submitted ? 'default' : 'pointer',
                            transition: 'background 0.15s, border-color 0.15s',
                          }}
                        >
                          <input
                            type="radio"
                            name={`q-${q.no}`}
                            checked={isUserChoice}
                            onChange={() => handleSelect(q.no, i)}
                            disabled={submitted}
                            style={{
                              marginTop: '3px',
                              accentColor: 'var(--primary-blue, #0046C8)',
                              cursor: submitted ? 'default' : 'pointer',
                            }}
                          />
                          <span style={{ color, lineHeight: 1.5, flex: 1, fontWeight: isCorrectOption ? 700 : 400 }}>
                            <span style={{ marginRight: '6px', fontWeight: 600 }}>{String.fromCharCode(0x2460 + i)}</span>
                            {opt}
                            {submitted && isCorrectOption && (
                              <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 700 }}>← 정답</span>
                            )}
                            {submitted && isWrongChoice && (
                              <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 700 }}>← 내 답</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* 해설 (제출 후 표시) */}
                  {submitted && q.explanation && (
                    <div style={{
                      marginTop: '14px',
                      padding: '14px 16px',
                      background: 'var(--bg-secondary, #f8f9fa)',
                      borderLeft: '3px solid var(--primary-blue, #0046C8)',
                      borderRadius: '0 8px 8px 0',
                    }}>
                      <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: 'var(--primary-blue, #0046C8)', letterSpacing: '0.05em' }}>
                        💡 해설
                      </p>
                      <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.7, color: 'var(--text-primary, #1a1a1a)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 하단 제출 / 다시 풀기 버튼 */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            textAlign: 'center',
            background: 'var(--bg-secondary, #f8f9fa)',
            borderRadius: '12px',
          }}>
            {!submitted ? (
              <>
                <p style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
                  {answeredCount === set.mcq.length
                    ? '모든 문항을 완료했습니다. 제출하여 채점을 받으세요.'
                    : `미응답 ${set.mcq.length - answeredCount}문항 — 답안은 자동 저장됩니다.`}
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: 700,
                    background: 'var(--primary-blue, #0046C8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >제출하고 채점받기</button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: '#fff',
                  color: 'var(--primary-blue, #0046C8)',
                  border: '2px solid var(--primary-blue, #0046C8)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >다시 풀기</button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Assessment;
