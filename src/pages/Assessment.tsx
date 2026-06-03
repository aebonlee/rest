import { useState, useMemo, useEffect, useRef, type ReactElement } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { assessmentSets, type AssessmentType } from '../data/assessmentData';
import { useAuth } from '../contexts/AuthContext';
import { saveAssessmentResult, type GradedType } from '../utils/assessments';

const TYPE_ORDER: AssessmentType[] = ['prerequisite', 'diagnostic', 'summative'];

type Answers = Record<number, number>;
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'guest';

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
  const isPractice = set.mode === 'practice';
  const storageKey = `rest-assessment-${set.type}`;
  const submitKey = `${storageKey}-submitted`;

  const { user, profile } = useAuth();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [submitted, setSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(submitKey) === 'true';
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setAnswers(saved ? JSON.parse(saved) : {});
      setSubmitted(localStorage.getItem(submitKey) === 'true');
    } catch {
      setAnswers({});
      setSubmitted(false);
    }
    setSaveStatus('idle');
  }, [set.type, storageKey, submitKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch { /* ignore */ }
  }, [answers, storageKey]);

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

  const handleSelect = (questionNo: number, optionIndex: number) => {
    if (submitted) return;  // 채점 완료 후 잠금 (진단평가는 submitted=false라 항상 선택 가능)
    setAnswers((prev) => ({ ...prev, [questionNo]: optionIndex }));
  };

  /** 채점형 평가 결과를 Supabase에 저장 */
  const persistResult = async (correct: number, total: number) => {
    if (isPractice) return;
    if (!user) { setSaveStatus('guest'); return; }
    setSaveStatus('saving');
    const score = Math.round((correct / total) * 100);
    const res = await saveAssessmentResult({
      student_id: user.id,
      student_name: profile?.name || profile?.display_name || user.email || '',
      student_email: profile?.email || user.email || '',
      type: set.type as GradedType,
      score,
      correct,
      total,
      passed: score >= set.passingScore,
      answers,
    });
    setSaveStatus(res.saved ? 'saved' : 'error');
  };

  // 세션 끊김 등으로 저장되지 못한 채점 결과를 로그인 복구 시 자동 저장.
  // (시험 중 자동 로그아웃 → 제출 시 게스트 처리된 경우, 다시 로그인해 평가 페이지를 열면 반영됨)
  useEffect(() => {
    if (isPractice || !submitted || !user) return;
    if (saveStatus === 'saving' || saveStatus === 'saved') return;
    const correct = set.mcq.reduce((acc, q) => acc + (answers[q.no] === q.answer ? 1 : 0), 0);
    void persistResult(correct, set.mcq.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, submitted, set.type]);

  const handleSubmit = () => {
    const unanswered = set.mcq.filter((q) => answers[q.no] === undefined);
    if (unanswered.length > 0) {
      const confirmMsg = `${unanswered.length}개 문항이 미응답입니다. 그래도 제출하시겠습니까?\n(미응답은 0점 처리됩니다)`;
      if (!confirm(confirmMsg)) return;
    }
    setSubmitted(true);
    localStorage.setItem(submitKey, 'true');
    const correct = set.mcq.reduce((acc, q) => acc + (answers[q.no] === q.answer ? 1 : 0), 0);
    void persistResult(correct, set.mcq.length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    const msg = isPractice ? '선택한 답안을 모두 지울까요?' : '답안과 결과를 모두 초기화하고 다시 풀까요?';
    if (!confirm(msg)) return;
    setAnswers({});
    setSubmitted(false);
    setSaveStatus('idle');
    localStorage.removeItem(storageKey);
    localStorage.removeItem(submitKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredCount = Object.keys(answers).length;
  const passed = result ? result.scorePercent >= set.passingScore : false;
  // 정답·해설을 노출할지: 채점 완료(graded) 또는 자습 모드(practice)
  const reveal = submitted || isPractice;

  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollToQuestion = (no: number) => {
    questionRefs.current[no]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 박스 상태별 색상
  const getBoxStyle = (no: number) => {
    const userAnswer = answers[no];
    const isAnswered = userAnswer !== undefined;

    if (submitted) {
      const q = set.mcq.find((q) => q.no === no);
      if (!q) return { bg: 'transparent', color: 'inherit', border: 'var(--border-light)' };
      const isCorrect = userAnswer === q.answer;
      if (!isAnswered) {
        return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };  // 미응답
      }
      if (isCorrect) {
        return { bg: '#d1fae5', color: '#065f46', border: '#10b981' };  // 정답
      }
      return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };    // 오답
    }

    // 미제출 상태
    if (isAnswered) {
      return { bg: 'var(--primary-blue, #0046C8)', color: '#fff', border: 'var(--primary-blue, #0046C8)' };
    }
    return { bg: 'transparent', color: 'var(--text-secondary, #6b7280)', border: 'var(--border-light, #e5e7eb)' };
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
            borderBottom: '1px solid var(--border-light, #e5e7eb)',
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
                    fontSize: '16px',
                    textDecoration: 'none',
                    background: isActive ? 'var(--primary-blue, #0046C8)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-primary, #1a1a1a)',
                    border: '1px solid var(--border-light, #e5e7eb)',
                  }}
                >
                  {assessmentSets[t].title}
                </Link>
              );
            })}
          </div>

          {/* ───── Sidebar + Content 2단 레이아웃 ───── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '24px',
          }} className="assessment-layout">

            {/* ─── 메인 컨텐츠 (먼저 정의되지만 CSS Grid order로 사이드바 옆에 배치) ─── */}
            <div style={{ minWidth: 0, order: 2 }} className="assessment-main">
              {/* 결과 배너 */}
              {result && (
                <div style={{
                  background: passed ? '#ecfdf5' : '#fef2f2',
                  border: `2px solid ${passed ? '#10b981' : '#ef4444'}`,
                  borderRadius: '16px',
                  padding: '32px',
                  marginBottom: '24px',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontSize: '16px', fontWeight: 600,
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
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
                    {result.scorePercent}점
                  </p>
                  <p style={{ fontSize: '16px', color: '#4B5563', margin: 0 }}>
                    합격 기준: {set.passingScore}점 이상
                  </p>
                </div>
              )}

              {/* 평가 개요 */}
              <div style={{
                background: 'var(--bg-light-gray, #f8f9fa)',
                borderLeft: '4px solid var(--primary-blue, #0046C8)',
                padding: '20px 24px',
                borderRadius: '0 12px 12px 0',
                marginBottom: '24px',
                lineHeight: 1.7,
                color: 'var(--text-primary, #1a1a1a)',
              }}>
                <p style={{ margin: '0 0 10px', fontSize: '16px' }}>{set.description}</p>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '15px' }}>
                  <span><strong>제한 시간:</strong> {set.duration}</span>
                  {isPractice ? (
                    <span><strong>방식:</strong> 자습용 · 채점 없음 · 정답·해설 공개</span>
                  ) : (
                    <>
                      <span><strong>배점:</strong> 문항당 {Math.round(100 / set.mcq.length)}점 (100점 만점)</span>
                      <span><strong>합격 기준:</strong> {set.passingScore}점</span>
                    </>
                  )}
                  <span><strong>문항 수:</strong> {set.mcq.length}문항</span>
                </div>
              </div>

              {/* 문항 목록 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {set.mcq.map((q) => {
                  const userAnswer = answers[q.no];
                  const isAnswered = userAnswer !== undefined;
                  const isCorrect = submitted && userAnswer === q.answer;
                  const isWrong = submitted && isAnswered && userAnswer !== q.answer;
                  const isUnanswered = submitted && !isAnswered;

                  let borderColor = 'var(--border-light, #e5e7eb)';
                  if (isCorrect) borderColor = '#10b981';
                  else if (isWrong || isUnanswered) borderColor = '#ef4444';

                  return (
                    <div
                      key={q.no}
                      ref={(el) => { questionRefs.current[q.no] = el; }}
                      style={{
                        background: 'var(--bg-white, #fff)',
                        border: `2px solid ${borderColor}`,
                        borderRadius: '12px',
                        padding: '20px 24px',
                        scrollMarginTop: '80px',
                      }}
                    >
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
                            fontSize: '14px',
                            fontWeight: 700,
                            borderRadius: '999px',
                            background: isCorrect ? '#d1fae5' : '#fee2e2',
                            color: isCorrect ? '#065f46' : '#991b1b',
                          }}>
                            {isCorrect ? '✓ 정답' : isUnanswered ? '미응답' : '✗ 오답'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '8px' }}>
                        {q.options.map((opt, i) => {
                          const isUserChoice = userAnswer === i;
                          const isCorrectOption = reveal && i === q.answer;
                          const isWrongChoice = reveal && isUserChoice && i !== q.answer;

                          let bg = 'transparent';
                          let color = 'var(--text-primary, #1a1a1a)';
                          let optBorderColor = 'var(--border-light, #e5e7eb)';

                          if (reveal) {
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
                            bg = 'var(--bg-light-gray, #f0f4ff)';
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
                              <span style={{ color, lineHeight: 1.5, flex: 1, minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere', fontWeight: isCorrectOption ? 700 : 400 }}>
                                <span style={{ marginRight: '6px', fontWeight: 600 }}>{String.fromCharCode(0x2460 + i)}</span>
                                {opt}
                                {isCorrectOption && (
                                  <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 700 }}>← 정답</span>
                                )}
                                {isWrongChoice && (
                                  <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 700 }}>← 내 답</span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                      </div>

                      {reveal && q.explanation && (
                        <div style={{
                          marginTop: '14px',
                          padding: '14px 16px',
                          background: 'var(--bg-light-gray, #f8f9fa)',
                          borderLeft: '3px solid var(--primary-blue, #0046C8)',
                          borderRadius: '0 8px 8px 0',
                        }}>
                          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: 'var(--primary-blue, #0046C8)', letterSpacing: '0.05em' }}>
                            💡 해설
                          </p>
                          <p style={{ margin: 0, fontSize: '15.5px', lineHeight: 1.7, color: 'var(--text-primary, #1a1a1a)' }}>
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── 왼쪽 사이드바 (sticky) ─── */}
            <aside style={{ order: 1 }} className="assessment-sidebar">
              <div style={{
                position: 'sticky',
                top: '90px',
                background: 'var(--bg-white, #fff)',
                border: '1px solid var(--border-light, #e5e7eb)',
                borderRadius: '12px',
                padding: '16px',
              }}>
                {/* 진행 상태 */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{
                    margin: '0 0 4px',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--primary-blue, #0046C8)',
                    letterSpacing: '0.05em',
                  }}>
                    {submitted ? '채점 결과' : isPractice ? '자습 진행' : '진행 상태'}
                  </p>
                  {submitted && result ? (
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: passed ? '#10b981' : '#ef4444' }}>
                      {result.correct} / {result.total} ({result.scorePercent}점)
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text-primary, #1a1a1a)' }}>
                      {answeredCount} / {set.mcq.length}
                    </p>
                  )}
                </div>

                {/* 진행률 막대 (미제출) */}
                {!submitted && (
                  <div style={{
                    background: 'var(--bg-light-gray, #f8f9fa)',
                    height: '6px',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '14px',
                  }}>
                    <div style={{
                      width: `${(answeredCount / set.mcq.length) * 100}%`,
                      height: '100%',
                      background: 'var(--primary-blue, #0046C8)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                )}

                {/* 1~50 박스 그리드 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px',
                  marginBottom: '16px',
                }}>
                  {set.mcq.map((q) => {
                    const style = getBoxStyle(q.no);
                    return (
                      <button
                        key={q.no}
                        type="button"
                        onClick={() => scrollToQuestion(q.no)}
                        aria-label={`${q.no}번 문항으로 이동`}
                        style={{
                          aspectRatio: '1 / 1',
                          fontSize: '14px',
                          fontWeight: 700,
                          background: style.bg,
                          color: style.color,
                          border: `1.5px solid ${style.border}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.1s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        {q.no}
                      </button>
                    );
                  })}
                </div>

                {/* 범례 */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '13px',
                  color: 'var(--text-secondary, #6b7280)',
                  marginBottom: '16px',
                  padding: '10px',
                  background: 'var(--bg-light-gray, #f8f9fa)',
                  borderRadius: '6px',
                }}>
                  {submitted ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', background: '#d1fae5', border: '1.5px solid #10b981', borderRadius: '3px' }} />
                        정답
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', background: '#fee2e2', border: '1.5px solid #ef4444', borderRadius: '3px' }} />
                        오답 / 미응답
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', background: 'var(--primary-blue, #0046C8)', borderRadius: '3px' }} />
                        응답 완료
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', background: 'transparent', border: '1.5px solid var(--border-light, #e5e7eb)', borderRadius: '3px' }} />
                        미응답
                      </div>
                    </>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {isPractice ? (
                    <>
                      <p style={{
                        margin: 0, fontSize: '14px', lineHeight: 1.6,
                        color: 'var(--text-secondary, #6b7280)',
                        padding: '10px', background: 'var(--bg-light-gray, #f8f9fa)', borderRadius: '6px',
                      }}>
                        자습용 평가입니다. 정답과 해설이 공개되어 있으니 사후평가 전 스스로 풀어보세요.
                      </p>
                      <button
                        type="button"
                        onClick={handleReset}
                        style={{
                          padding: '10px 16px', fontSize: '15px', fontWeight: 600,
                          background: 'transparent', color: 'var(--text-secondary, #6b7280)',
                          border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '8px',
                          cursor: 'pointer', width: '100%',
                        }}
                      >
                        선택 초기화
                      </button>
                    </>
                  ) : !submitted ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        style={{
                          padding: '12px 16px',
                          fontSize: '16px',
                          fontWeight: 700,
                          background: 'var(--primary-blue, #0046C8)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        제출 & 채점
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        style={{
                          padding: '10px 16px',
                          fontSize: '15px',
                          fontWeight: 600,
                          background: 'transparent',
                          color: 'var(--text-secondary, #6b7280)',
                          border: '1px solid var(--border-light, #e5e7eb)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        초기화
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 성적 저장 상태 */}
                      {saveStatus !== 'idle' && (
                        <div style={{
                          fontSize: '14px', fontWeight: 600, textAlign: 'center',
                          padding: '8px 10px', borderRadius: '6px',
                          background:
                            saveStatus === 'saved' ? '#ecfdf5'
                            : saveStatus === 'error' ? '#fef2f2'
                            : 'var(--bg-light-gray, #f8f9fa)',
                          color:
                            saveStatus === 'saved' ? '#065f46'
                            : saveStatus === 'error' ? '#991b1b'
                            : 'var(--text-secondary, #6b7280)',
                        }}>
                          {saveStatus === 'saving' && '성적 저장 중…'}
                          {saveStatus === 'saved' && '✓ 성적이 저장되었습니다'}
                          {saveStatus === 'error' && '⚠ 성적 저장 실패 (네트워크 확인)'}
                          {saveStatus === 'guest' && '로그인하면 성적이 저장됩니다'}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleReset}
                        style={{
                          padding: '12px 16px',
                          fontSize: '16px',
                          fontWeight: 700,
                          background: 'var(--primary-blue, #0046C8)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        다시 풀기
                      </button>
                    </>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 반응형 레이아웃 — 데스크탑은 사이드바 옆에, 모바일은 위에 */}
      <style>{`
        @media (min-width: 1024px) {
          .assessment-layout {
            grid-template-columns: 220px 1fr !important;
          }
          .assessment-sidebar { order: 1 !important; }
          .assessment-main { order: 2 !important; }
        }
        @media (max-width: 1023px) {
          .assessment-sidebar { order: 1 !important; }
          .assessment-main { order: 2 !important; }
        }
      `}</style>
    </>
  );
};

export default Assessment;
