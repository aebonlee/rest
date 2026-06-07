/**
 * Assessment.tsx — 평가(시험) 페이지 컴포넌트
 *
 * [역할/책임]
 * - URL 파라미터(type)에 따라 사전평가/진단평가/사후평가 중 하나의 평가지를 렌더링한다.
 * - 객관식(MCQ) 문항 선택, 제출 및 채점, 결과 배너/문항별 정오 표시, 정답·해설 노출을 담당한다.
 * - 답안 상태를 localStorage에 자동 저장하여 새로고침/이탈 후에도 복원한다.
 * - 채점형 평가의 결과는 Supabase에 저장하며(saveAssessmentResult), 비로그인/세션 끊김 등의
 *   엣지케이스에 대한 저장 상태(saveStatus)를 사용자에게 표시한다.
 * - 좌측 사이드바에 진행 상태/문항 점프 그리드/범례/액션 버튼을 sticky로 제공한다.
 *
 * [주요 export]
 * - default: Assessment (React 컴포넌트)
 */
import { useState, useMemo, useEffect, useRef, type ReactElement } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { assessmentSets, type AssessmentType } from '../data/assessmentData';
import { useAuth } from '../contexts/AuthContext';
import { saveAssessmentResult, type GradedType } from '../utils/assessments';

// 탭/네비게이션에서 사용할 평가 유형 노출 순서 (사전 → 진단 → 사후)
const TYPE_ORDER: AssessmentType[] = ['prerequisite', 'diagnostic', 'summative'];

// 답안 상태 타입: 문항 번호(no) → 선택한 보기 인덱스(0-based)
type Answers = Record<number, number>;
// 성적 저장 상태: 대기/저장중/완료/실패/비로그인(게스트)
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'guest';

// 채점 결과 구조 (총 문항/정답 수/백분율 점수/문항별 상세)
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

/** 평가 페이지 메인 컴포넌트 */
const Assessment = (): ReactElement => {
  // URL 파라미터에서 평가 유형 추출 (예: /assessment/prerequisite)
  const { type } = useParams<{ type: string }>();
  // 유효한 평가 유형인지 검증 (TYPE_ORDER에 포함되어야 함)
  const isValid = type && (TYPE_ORDER as string[]).includes(type);
  // 잘못된 유형이면 사전평가로 리다이렉트 (히스토리 대체)
  if (!isValid) return <Navigate to="/assessment/prerequisite" replace />;

  // 검증을 통과한 유형으로 해당 평가지 데이터셋을 가져옴
  const set = assessmentSets[type as AssessmentType];
  // 자습(연습) 모드 여부: practice면 채점/저장 없이 정답·해설만 공개
  const isPractice = set.mode === 'practice';
  // localStorage 키: 평가 유형별로 답안/제출여부를 분리 저장
  const storageKey = `rest-assessment-${set.type}`;
  const submitKey = `${storageKey}-submitted`;

  // 인증 컨텍스트: 로그인 사용자/프로필 (성적 저장 시 식별자로 사용)
  const { user, profile } = useAuth();
  // 성적 저장 진행 상태
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // 답안 상태 — 초기값을 localStorage에서 lazy 복원 (JSON 파싱 실패 시 빈 객체)
  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // 제출 여부 — localStorage의 문자열 'true'와 비교하여 복원
  const [submitted, setSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(submitKey) === 'true';
  });

  // 평가 유형(탭)이 바뀌면 해당 유형의 저장값으로 답안/제출여부/저장상태를 재초기화한다.
  // (storageKey/submitKey는 set.type에 종속되므로 함께 의존성에 포함)
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

  // 답안이 변경될 때마다 localStorage에 자동 저장 (직렬화 실패는 무시)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch { /* ignore */ }
  }, [answers, storageKey]);

  // 제출된 상태에서만 채점 결과를 계산 (메모이즈하여 불필요한 재계산 방지)
  const result: Result | null = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    // 문항별로 사용자의 답과 정답을 비교하여 정오/정답 수 집계
    const perQuestion = set.mcq.map((q) => {
      const userAnswer = answers[q.no];
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) correct++;
      return { no: q.no, isCorrect, userAnswer, correctAnswer: q.answer };
    });
    return {
      total: set.mcq.length,
      correct,
      // 백분율 점수 (정답/총문항 * 100, 반올림)
      scorePercent: Math.round((correct / set.mcq.length) * 100),
      perQuestion,
    };
  }, [submitted, answers, set.mcq]);

  // 보기 선택 핸들러: 제출 완료 후에는 잠금
  const handleSelect = (questionNo: number, optionIndex: number) => {
    if (submitted) return;  // 채점 완료 후 잠금 (진단평가는 submitted=false라 항상 선택 가능)
    setAnswers((prev) => ({ ...prev, [questionNo]: optionIndex }));
  };

  /** 채점형 평가 결과를 Supabase에 저장 */
  const persistResult = async (correct: number, total: number) => {
    if (isPractice) return;                              // 자습 모드는 저장하지 않음
    if (!user) { setSaveStatus('guest'); return; }      // 비로그인 시 게스트 처리(저장 안내)
    setSaveStatus('saving');
    const score = Math.round((correct / total) * 100);
    // 프로필 정보(이름/이메일)는 우선순위에 따라 폴백 처리
    const res = await saveAssessmentResult({
      student_id: user.id,
      student_name: profile?.name || profile?.display_name || user.email || '',
      student_email: profile?.email || user.email || '',
      type: set.type as GradedType,
      score,
      correct,
      total,
      passed: score >= set.passingScore,                // 합격 기준 점수 이상이면 합격
      answers,
    });
    // 저장 결과에 따라 상태 갱신 (RLS/네트워크 실패 시 saved=false → error)
    setSaveStatus(res.saved ? 'saved' : 'error');
  };

  // 세션 끊김 등으로 저장되지 못한 채점 결과를 로그인 복구 시 자동 저장.
  // (시험 중 자동 로그아웃 → 제출 시 게스트 처리된 경우, 다시 로그인해 평가 페이지를 열면 반영됨)
  useEffect(() => {
    if (isPractice || !submitted || !user) return;             // 채점형 + 제출됨 + 로그인 상태에서만
    if (saveStatus === 'saving' || saveStatus === 'saved') return;  // 이미 저장 중/완료면 중복 방지
    // 저장된 답안으로 정답 수를 재집계하여 저장 시도
    const correct = set.mcq.reduce((acc, q) => acc + (answers[q.no] === q.answer ? 1 : 0), 0);
    void persistResult(correct, set.mcq.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, submitted, set.type]);

  // 제출 & 채점 핸들러
  const handleSubmit = () => {
    // 미응답 문항 확인 — 있으면 0점 처리 경고 후 진행 여부 확인
    const unanswered = set.mcq.filter((q) => answers[q.no] === undefined);
    if (unanswered.length > 0) {
      const confirmMsg = `${unanswered.length}개 문항이 미응답입니다. 그래도 제출하시겠습니까?\n(미응답은 0점 처리됩니다)`;
      if (!confirm(confirmMsg)) return;
    }
    // 제출 상태로 전환 및 localStorage 기록
    setSubmitted(true);
    localStorage.setItem(submitKey, 'true');
    // 정답 수 집계 후 즉시 성적 저장 시도
    const correct = set.mcq.reduce((acc, q) => acc + (answers[q.no] === q.answer ? 1 : 0), 0);
    void persistResult(correct, set.mcq.length);
    window.scrollTo({ top: 0, behavior: 'smooth' });  // 결과 배너를 보도록 상단으로 스크롤
  };

  // 초기화 핸들러: 답안/결과/저장상태/localStorage를 모두 비움
  const handleReset = () => {
    // 모드에 따라 확인 메시지 분기 (자습은 답안만, 채점형은 결과까지 초기화)
    const msg = isPractice ? '선택한 답안을 모두 지울까요?' : '답안과 결과를 모두 초기화하고 다시 풀까요?';
    if (!confirm(msg)) return;
    setAnswers({});
    setSubmitted(false);
    setSaveStatus('idle');
    localStorage.removeItem(storageKey);
    localStorage.removeItem(submitKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredCount = Object.keys(answers).length;          // 응답한 문항 수
  const passed = result ? result.scorePercent >= set.passingScore : false;  // 합격 여부
  // 정답·해설을 노출할지: 채점 완료(graded) 또는 자습 모드(practice)
  const reveal = submitted || isPractice;

  // 문항별 DOM 노드 참조 (사이드바 그리드 클릭 시 해당 문항으로 스크롤)
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollToQuestion = (no: number) => {
    questionRefs.current[no]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 박스 상태별 색상
  // 사이드바 문항 점프 박스의 배경/글자/테두리 색을 상태(정답/오답/미응답/응답완료)에 따라 반환
  const getBoxStyle = (no: number) => {
    const userAnswer = answers[no];
    const isAnswered = userAnswer !== undefined;

    // 제출(채점) 상태: 정/오/미응답에 따라 색상 결정
    if (submitted) {
      const q = set.mcq.find((q) => q.no === no);
      if (!q) return { bg: 'transparent', color: 'inherit', border: 'var(--border-light)' };  // 방어 코드(문항 미존재)
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
      return { bg: 'var(--primary-blue, #0046C8)', color: '#fff', border: 'var(--primary-blue, #0046C8)' };  // 응답 완료
    }
    return { bg: 'transparent', color: 'var(--text-secondary, #6b7280)', border: 'var(--border-light, #e5e7eb)' };  // 미응답
  };

  return (
    <>
      {/* 페이지 메타데이터(SEO) — 제목/설명/경로를 평가지 정보로 구성 */}
      <SEOHead
        title={`${set.title} | AI Reboot Academy`}
        description={set.description}
        path={`/assessment/${set.type}`}
      />

      {/* 페이지 헤더 — 평가 제목/부제 */}
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
            {/* 사전/진단/사후 평가로 이동하는 탭 링크 (현재 유형은 활성 스타일) */}
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
              {/* 채점 완료 시에만 합격/불합격 + 점수 배너 표시 */}
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
              {/* 설명/제한시간/배점/합격기준/문항수 등 메타 정보 (모드에 따라 분기) */}
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
                  {/* 자습 모드는 배점/합격기준 대신 채점 없음 안내 */}
                  {isPractice ? (
                    <span><strong>방식:</strong> 자습용 · 채점 없음 · 정답·해설 공개</span>
                  ) : (
                    <>
                      {/* 채점형: 문항당 배점은 100점을 문항 수로 나눠 산출 */}
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
                  // 문항별 응답/정오 상태 계산
                  const userAnswer = answers[q.no];
                  const isAnswered = userAnswer !== undefined;
                  const isCorrect = submitted && userAnswer === q.answer;
                  const isWrong = submitted && isAnswered && userAnswer !== q.answer;
                  const isUnanswered = submitted && !isAnswered;

                  // 문항 카드 테두리 색상: 정답=초록, 오답/미응답=빨강, 그 외 기본
                  let borderColor = 'var(--border-light, #e5e7eb)';
                  if (isCorrect) borderColor = '#10b981';
                  else if (isWrong || isUnanswered) borderColor = '#ef4444';

                  return (
                    <div
                      key={q.no}
                      // 사이드바 점프용으로 문항 카드 DOM 참조 저장
                      ref={(el) => { questionRefs.current[q.no] = el; }}
                      style={{
                        background: 'var(--bg-white, #fff)',
                        border: `2px solid ${borderColor}`,
                        borderRadius: '12px',
                        padding: '20px 24px',
                        scrollMarginTop: '80px',  // 스크롤 이동 시 상단 고정 헤더에 가리지 않도록 여백
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
                        {/* 채점 후 문항별 정답/오답/미응답 배지 */}
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

                      {/* 보기 목록 (라디오 선택) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '8px' }}>
                        {q.options.map((opt, i) => {
                          // 각 보기의 상태: 사용자 선택 / 정답 보기 / 잘못 선택한 보기
                          const isUserChoice = userAnswer === i;
                          const isCorrectOption = reveal && i === q.answer;          // 정답 노출 가능할 때만
                          const isWrongChoice = reveal && isUserChoice && i !== q.answer;

                          // 보기 배경/글자/테두리 색상 기본값
                          let bg = 'transparent';
                          let color = 'var(--text-primary, #1a1a1a)';
                          let optBorderColor = 'var(--border-light, #e5e7eb)';

                          if (reveal) {
                            // 정답·해설 노출 모드: 정답 보기는 초록, 내가 틀린 보기는 빨강 강조
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
                            // 미제출 상태에서 현재 선택한 보기 강조 (파랑)
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
                                disabled={submitted}  // 제출 후 보기 변경 불가
                                style={{
                                  marginTop: '3px',
                                  accentColor: 'var(--primary-blue, #0046C8)',
                                  cursor: submitted ? 'default' : 'pointer',
                                }}
                              />
                              <span style={{ color, lineHeight: 1.5, flex: 1, minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere', fontWeight: isCorrectOption ? 700 : 400 }}>
                                {/* 보기 번호를 원문자(①②③…)로 표시: 0x2460(①)에 인덱스를 더함 */}
                                <span style={{ marginRight: '6px', fontWeight: 600 }}>{String.fromCharCode(0x2460 + i)}</span>
                                {opt}
                                {/* 정답 보기/내가 선택한 오답 보기에 라벨 추가 */}
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

                      {/* 해설 — 정답 노출 모드이고 해설 데이터가 있을 때만 표시 */}
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
                {/* 제출/자습/풀이중에 따라 헤더 라벨과 표시 수치를 분기 */}
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
                    // 채점 후: 정답수/총문항(점수)
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: passed ? '#10b981' : '#ef4444' }}>
                      {result.correct} / {result.total} ({result.scorePercent}점)
                    </p>
                  ) : (
                    // 풀이 중: 응답수/총문항
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
                    {/* 응답 비율만큼 채워지는 진행률 바 */}
                    <div style={{
                      width: `${(answeredCount / set.mcq.length) * 100}%`,
                      height: '100%',
                      background: 'var(--primary-blue, #0046C8)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                )}

                {/* 1~50 박스 그리드 */}
                {/* 문항 번호 버튼 그리드 — 클릭 시 해당 문항으로 스크롤, 상태별 색상 적용 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '6px',
                  marginBottom: '16px',
                }}>
                  {set.mcq.map((q) => {
                    const style = getBoxStyle(q.no);  // 문항 상태별 색상 계산
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
                        // 호버 시 살짝 확대 (인라인 DOM 조작)
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        {q.no}
                      </button>
                    );
                  })}
                </div>

                {/* 범례 */}
                {/* 박스 색상 의미 안내 — 제출/미제출 상태에 따라 다른 범례 표시 */}
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
                      {/* 채점 후 범례: 정답(초록) / 오답·미응답(빨강) */}
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
                      {/* 풀이 중 범례: 응답 완료(파랑) / 미응답(빈칸) */}
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
                {/* 모드/제출 상태에 따라 버튼 구성 분기: 자습 / 풀이중 / 채점완료 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {isPractice ? (
                    /* 자습 모드: 안내문 + 선택 초기화 버튼만 */
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
                    /* 채점형 · 미제출: 제출&채점 + 초기화 버튼 */
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
                    /* 채점형 · 제출 완료: 저장 상태 표시 + 다시 풀기 버튼 */
                    <>
                      {/* 성적 저장 상태 */}
                      {/* idle이 아닐 때만 저장 상태 메시지 박스 노출 (상태별 색상/문구) */}
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
