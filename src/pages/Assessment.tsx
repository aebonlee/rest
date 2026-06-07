/**
 * Assessment.tsx — 평가(시험) 페이지 컴포넌트
 *
 * ──────────────────────────────────────────────────────────────────────────
 * [이 파일이 무엇인가? — 초보자용 설명]
 * 이 파일은 "온라인 객관식 시험 한 페이지"를 화면에 그려주는 React 컴포넌트입니다.
 * 학생이 문제를 풀고(보기 선택) → 제출하면 → 자동 채점되고 → 정답/해설을 보여줍니다.
 *
 * [꼭 알아야 할 용어]
 * - 컴포넌트(Component): 화면의 한 조각을 만들어 내는 "함수". 여기서는 함수 하나가 곧 시험 페이지 전체.
 * - JSX: 자바스크립트 안에서 HTML처럼 생긴 문법으로 화면을 표현하는 방식. (예: <div>...</div>)
 * - 상태(state): 사용자의 행동에 따라 바뀌는 데이터(예: 어떤 보기를 골랐는지). 값이 바뀌면 화면도 다시 그려짐.
 * - 훅(Hook): use로 시작하는 특별한 함수(useState 등). 컴포넌트에 "기억력"이나 "부수 동작"을 더해줌.
 * - props/파라미터: 함수에 넘기는 입력값.
 * - localStorage: 브라우저에 데이터를 저장하는 공간. 새로고침/창을 닫아도 남아 있음(문자열만 저장 가능).
 * - Supabase: 서버 데이터베이스 서비스. 여기서는 채점 결과(성적)를 서버에 영구 저장하는 데 사용.
 * - RLS(Row Level Security): Supabase에서 "로그인한 본인 데이터만 쓸 수 있게" 막는 보안 규칙.
 *   → 비로그인이거나 권한이 없으면 저장이 거부될 수 있음(그래서 저장 상태를 따로 관리함).
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

// React에서 제공하는 훅들을 가져온다. 각 훅의 역할:
// - useState: "기억하는 값(상태)"을 만든다. 값이 바뀌면 화면이 자동으로 다시 그려진다.
// - useMemo: 무거운 계산 결과를 "기억"해 두었다가, 입력이 바뀔 때만 다시 계산한다(성능 최적화).
// - useEffect: 화면이 그려진 뒤(또는 특정 값이 바뀐 뒤) 실행할 "부수 동작"을 등록한다(저장, 통신 등).
// - useRef: 다시 그려져도 사라지지 않는 "보관함". 여기서는 각 문항 DOM 요소를 가리키는 데 사용.
// - type ReactElement: 이 컴포넌트가 "화면 요소"를 반환한다는 타입 표시(TypeScript 전용, 실행에는 영향 없음).
import { useState, useMemo, useEffect, useRef, type ReactElement } from 'react';
// react-router-dom: 페이지(주소) 이동을 다루는 라이브러리.
// - useParams: 주소 안의 변수(예: /assessment/:type 의 type)를 꺼낸다.
// - Navigate: 다른 주소로 자동 이동시키는 컴포넌트.
// - Link: 새로고침 없이 다른 페이지로 가는 링크(<a> 대신 사용).
import { useParams, Navigate, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
// assessmentSets: 평가지 데이터 모음(문항/정답/해설 등). AssessmentType: 평가 종류 타입.
import { assessmentSets, type AssessmentType } from '../data/assessmentData';
// useAuth: 로그인한 사용자/프로필 정보를 가져오는 커스텀 훅(Context 기반).
import { useAuth } from '../contexts/AuthContext';
// saveAssessmentResult: 채점 결과를 Supabase에 저장하는 함수. GradedType: 채점형 평가 종류 타입.
import { saveAssessmentResult, type GradedType } from '../utils/assessments';

// 탭/네비게이션에서 사용할 평가 유형 노출 순서 (사전 → 진단 → 사후)
// 주의: 이 배열에 들어 있는 값만 "유효한 평가 유형"으로 인정된다(아래 유효성 검사에 사용).
const TYPE_ORDER: AssessmentType[] = ['prerequisite', 'diagnostic', 'summative'];

// 답안 상태 타입: 문항 번호(no) → 선택한 보기 인덱스(0-based)
// Record<K, V>는 "키가 K 타입, 값이 V 타입인 객체"를 뜻하는 TypeScript 표기.
// 예: { 1: 2, 3: 0 } → 1번 문항은 세 번째 보기(인덱스 2), 3번 문항은 첫 번째 보기(인덱스 0)를 선택.
// 주의: 보기 인덱스는 0부터 시작한다(첫 보기 = 0).
type Answers = Record<number, number>;
// 성적 저장 상태: 대기/저장중/완료/실패/비로그인(게스트)
// 이렇게 정해진 문자열만 허용하는 타입을 "유니온 타입"이라 한다. 오타로 인한 버그를 막아준다.
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'guest';

// 채점 결과 구조 (총 문항/정답 수/백분율 점수/문항별 상세)
// interface는 "객체가 어떤 모양이어야 하는지"를 정의하는 TypeScript 설계도.
interface Result {
  total: number;        // 전체 문항 수
  correct: number;      // 맞힌 문항 수
  scorePercent: number; // 100점 만점 환산 점수
  // 문항별 상세 배열: 각 원소가 한 문항의 정오/내 답/정답을 담음
  perQuestion: Array<{
    no: number;                     // 문항 번호
    isCorrect: boolean;             // 정답 여부(true/false)
    userAnswer: number | undefined; // 내가 고른 보기 인덱스(안 골랐으면 undefined)
    correctAnswer: number;          // 정답 보기 인덱스
  }>;
}

/** 평가 페이지 메인 컴포넌트 */
// 이 함수 하나가 시험 페이지 전체다. 반환값(JSX)이 곧 화면에 그려진다.
const Assessment = (): ReactElement => {
  // URL 파라미터에서 평가 유형 추출 (예: /assessment/prerequisite → type = 'prerequisite')
  // useParams는 주소에 들어 있는 변수를 객체로 돌려준다. 여기선 그중 type만 꺼낸다.
  const { type } = useParams<{ type: string }>();
  // 유효한 평가 유형인지 검증 (TYPE_ORDER에 포함되어야 함)
  // 주의: type이 undefined일 수도 있으므로 먼저 type이 존재하는지 확인한 뒤 includes로 검사한다.
  // (TYPE_ORDER as string[])는 타입을 string 배열로 잠깐 바꿔, 임의 문자열도 비교할 수 있게 함.
  const isValid = type && (TYPE_ORDER as string[]).includes(type);
  // 잘못된 유형이면 사전평가로 리다이렉트 (히스토리 대체)
  // replace는 "뒤로 가기" 기록을 남기지 않고 주소를 갈아끼운다(잘못된 주소로 다시 돌아가지 않게).
  // 주의: 컴포넌트 함수 중간에서 return하면 이 아래 코드는 실행되지 않는다(조기 종료).
  if (!isValid) return <Navigate to="/assessment/prerequisite" replace />;

  // 검증을 통과한 유형으로 해당 평가지 데이터셋을 가져옴
  // (type as AssessmentType): 위에서 유효성을 확인했으므로 안전하게 정확한 타입으로 단언한다.
  const set = assessmentSets[type as AssessmentType];
  // 자습(연습) 모드 여부: practice면 채점/저장 없이 정답·해설만 공개
  const isPractice = set.mode === 'practice';
  // localStorage 키: 평가 유형별로 답안/제출여부를 분리 저장
  // 주의: 키가 같으면 다른 평가의 데이터를 덮어쓰므로, 유형(set.type)을 키에 포함해 분리한다.
  const storageKey = `rest-assessment-${set.type}`;
  const submitKey = `${storageKey}-submitted`;

  // 인증 컨텍스트: 로그인 사용자/프로필 (성적 저장 시 식별자로 사용)
  const { user, profile } = useAuth();
  // 성적 저장 진행 상태 — useState는 [현재값, 바꾸는함수] 한 쌍을 돌려준다. 초기값은 'idle'.
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // 답안 상태 — 초기값을 localStorage에서 lazy 복원 (JSON 파싱 실패 시 빈 객체)
  // useState에 "함수"를 넘기면 첫 렌더 때 딱 한 번만 실행된다(lazy 초기화 = 무거운 초기 작업 절약).
  // localStorage에는 문자열만 저장되므로 JSON.parse로 다시 객체로 되돌린다.
  // try/catch: 저장값이 깨져서 파싱이 실패해도 앱이 멈추지 않도록 빈 객체로 안전 처리.
  const [answers, setAnswers] = useState<Answers>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // 제출 여부 — localStorage의 문자열 'true'와 비교하여 복원
  // 주의: localStorage는 모든 값을 문자열로 저장하므로, 불리언 true가 아니라 문자열 'true'와 비교해야 한다.
  const [submitted, setSubmitted] = useState<boolean>(() => {
    return localStorage.getItem(submitKey) === 'true';
  });

  // 평가 유형(탭)이 바뀌면 해당 유형의 저장값으로 답안/제출여부/저장상태를 재초기화한다.
  // (storageKey/submitKey는 set.type에 종속되므로 함께 의존성에 포함)
  // useEffect의 두 번째 인자 [의존성 배열]: 이 안의 값이 바뀔 때마다 첫 번째 함수가 다시 실행된다.
  // 이유: 같은 컴포넌트가 탭만 바꿔 재사용될 때, 새 탭의 데이터로 화면 상태를 새로 맞춰주기 위함.
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
  // 의존성 [answers, storageKey]: 답안이 바뀔 때마다 실행되어, 새로고침해도 답이 남도록 보관한다.
  // JSON.stringify: 객체를 문자열로 바꿔 저장(localStorage는 문자열만 보관 가능).
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch { /* ignore */ }
  }, [answers, storageKey]);

  // 제출된 상태에서만 채점 결과를 계산 (메모이즈하여 불필요한 재계산 방지)
  // useMemo: [submitted, answers, set.mcq]가 바뀔 때만 다시 계산하고, 그 외에는 이전 결과를 재사용한다.
  const result: Result | null = useMemo(() => {
    if (!submitted) return null; // 아직 제출 전이면 결과 없음(null)
    let correct = 0;
    // 문항별로 사용자의 답과 정답을 비교하여 정오/정답 수 집계
    // map: 배열을 같은 길이의 새 배열로 변환한다. 여기선 각 문항을 "채점 결과 객체"로 바꾼다.
    const perQuestion = set.mcq.map((q) => {
      const userAnswer = answers[q.no];           // 이 문항에 내가 고른 보기(없으면 undefined)
      const isCorrect = userAnswer === q.answer;   // 내 답과 정답이 같은지 비교(=== 는 값+타입 모두 일치)
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
  // 매개변수: questionNo(문항 번호), optionIndex(선택한 보기 인덱스). 반환값 없음(상태만 바꿈).
  const handleSelect = (questionNo: number, optionIndex: number) => {
    if (submitted) return;  // 채점 완료 후 잠금 (진단평가는 submitted=false라 항상 선택 가능)
    // 불변성(immutability): 기존 객체를 직접 고치지 않고, ...prev로 복사한 새 객체를 만들어 교체한다.
    // 이렇게 해야 React가 "값이 바뀌었다"고 인식해 화면을 다시 그린다.
    // [questionNo]: 대괄호 키 표기 — questionNo 변수의 값을 키 이름으로 사용한다(계산된 속성명).
    setAnswers((prev) => ({ ...prev, [questionNo]: optionIndex }));
  };

  /** 채점형 평가 결과를 Supabase에 저장 */
  // async 함수: 안에서 await로 "서버 응답을 기다렸다가" 다음 줄로 넘어갈 수 있다(비동기 작업).
  // 매개변수: correct(맞힌 수), total(전체 수). 부수효과: 서버 저장 + saveStatus 상태 변경.
  const persistResult = async (correct: number, total: number) => {
    if (isPractice) return;                              // 자습 모드는 저장하지 않음
    if (!user) { setSaveStatus('guest'); return; }      // 비로그인 시 게스트 처리(저장 안내)
    setSaveStatus('saving');
    const score = Math.round((correct / total) * 100);
    // 프로필 정보(이름/이메일)는 우선순위에 따라 폴백 처리
    // || 연산자: 앞 값이 비어 있으면(빈문자/undefined 등) 다음 값을 쓴다. profile?.은 옵셔널 체이닝으로,
    // profile이 없을(null/undefined) 때 에러 대신 undefined를 돌려준다.
    // await: 저장이 끝날 때까지 기다린 뒤 결과(res)를 받는다.
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
    // 삼항연산자 조건 ? A : B: 조건이 참이면 A, 거짓이면 B.
    setSaveStatus(res.saved ? 'saved' : 'error');
  };

  // 세션 끊김 등으로 저장되지 못한 채점 결과를 로그인 복구 시 자동 저장.
  // (시험 중 자동 로그아웃 → 제출 시 게스트 처리된 경우, 다시 로그인해 평가 페이지를 열면 반영됨)
  // 이 useEffect는 "제출은 했는데 아직 서버 저장이 안 된" 상황을 자동으로 메워주는 안전장치다.
  useEffect(() => {
    if (isPractice || !submitted || !user) return;             // 채점형 + 제출됨 + 로그인 상태에서만
    if (saveStatus === 'saving' || saveStatus === 'saved') return;  // 이미 저장 중/완료면 중복 방지
    // 저장된 답안으로 정답 수를 재집계하여 저장 시도
    // reduce: 배열을 하나의 값으로 누적한다. 여기선 acc(누적 정답 수)에 맞은 문항마다 1씩 더한다.
    const correct = set.mcq.reduce((acc, q) => acc + (answers[q.no] === q.answer ? 1 : 0), 0);
    // void: async 함수가 돌려주는 Promise를 일부러 무시한다는 표시(여기선 결과를 기다리지 않음).
    void persistResult(correct, set.mcq.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // 주의: 위 줄은 "의존성 배열이 불완전하다"는 ESLint 경고를 의도적으로 끈다.
    // answers/saveStatus까지 의존성에 넣으면 저장 시도가 반복될 수 있어, 핵심 조건만 추적한다.
  }, [user, submitted, set.type]);

  // 제출 & 채점 핸들러
  const handleSubmit = () => {
    // 미응답 문항 확인 — 있으면 0점 처리 경고 후 진행 여부 확인
    // filter: 조건에 맞는 원소만 골라 새 배열을 만든다. 여기선 답이 undefined(안 고름)인 문항만 추린다.
    const unanswered = set.mcq.filter((q) => answers[q.no] === undefined);
    if (unanswered.length > 0) {
      // 백틱(`)으로 감싼 문자열(템플릿 리터럴): ${...} 안의 값을 문자열에 끼워 넣을 수 있다.
      // \n은 줄바꿈 문자.
      const confirmMsg = `${unanswered.length}개 문항이 미응답입니다. 그래도 제출하시겠습니까?\n(미응답은 0점 처리됩니다)`;
      // confirm: 브라우저 확인창. 사용자가 "취소"를 누르면 false가 되어 제출을 중단한다.
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
    if (!confirm(msg)) return; // 사용자가 취소하면 아무것도 하지 않고 종료
    setAnswers({});            // 답안 비우기(빈 객체로 교체)
    setSubmitted(false);
    setSaveStatus('idle');
    localStorage.removeItem(storageKey);  // 저장된 답안 삭제
    localStorage.removeItem(submitKey);   // 저장된 제출여부 삭제
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const answeredCount = Object.keys(answers).length;          // 응답한 문항 수 (객체의 키 개수 = 답한 문항 수)
  const passed = result ? result.scorePercent >= set.passingScore : false;  // 합격 여부 (결과 없으면 false)
  // 정답·해설을 노출할지: 채점 완료(graded) 또는 자습 모드(practice)
  // reveal이 true면 정답 보기/해설을 화면에 보여준다.
  const reveal = submitted || isPractice;

  // 문항별 DOM 노드 참조 (사이드바 그리드 클릭 시 해당 문항으로 스크롤)
  // useRef로 만든 .current 객체에 "문항 번호 → DOM 요소"를 저장해 두고, 나중에 스크롤에 사용한다.
  // ref는 값이 바뀌어도 화면을 다시 그리지 않는다(상태와의 차이점).
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollToQuestion = (no: number) => {
    // 옵셔널 체이닝(?.): 해당 문항의 DOM이 아직 없으면(null) 에러 없이 그냥 아무것도 안 한다.
    // scrollIntoView: 그 요소가 보이도록 화면을 부드럽게 스크롤한다.
    questionRefs.current[no]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 박스 상태별 색상
  // 사이드바 문항 점프 박스의 배경/글자/테두리 색을 상태(정답/오답/미응답/응답완료)에 따라 반환
  // 반환값: { bg, color, border } 색상 묶음. (이런 분기 로직을 함수로 빼면 JSX가 깔끔해진다.)
  const getBoxStyle = (no: number) => {
    const userAnswer = answers[no];
    const isAnswered = userAnswer !== undefined; // undefined가 아니면 답을 골랐다는 뜻

    // 제출(채점) 상태: 정/오/미응답에 따라 색상 결정
    if (submitted) {
      const q = set.mcq.find((q) => q.no === no); // 번호로 해당 문항 데이터를 찾음
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

  // 아래 return 부터가 실제 화면(JSX)이다.
  // <>...</>는 "Fragment"로, 불필요한 div를 만들지 않고 여러 요소를 한 덩어리로 묶는 빈 껍데기다.
  return (
    <>
      {/* 페이지 메타데이터(SEO) — 제목/설명/경로를 평가지 정보로 구성 */}
      {/* JSX에서 중괄호 { }는 "여기에 자바스크립트 값을 넣는다"는 표시다. */}
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
            {/* 배열.map(...)으로 항목 개수만큼 화면 요소를 자동으로 만든다(반복 렌더링). */}
            {TYPE_ORDER.map((t) => {
              const isActive = t === set.type; // 현재 보고 있는 탭인지 여부
              return (
                <Link
                  // 주의: 반복 렌더링되는 요소에는 고유한 key가 필요하다(React가 항목을 구분하는 식별자).
                  key={t}
                  to={`/assessment/${t}`}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '16px',
                    textDecoration: 'none',
                    // 활성 탭은 파란 배경, 나머지는 투명 배경 (삼항연산자로 분기)
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
            {/* 참고: HTML 순서상 본문이 먼저지만, CSS의 order 값으로 화면에서는 사이드바가 왼쪽으로 간다. */}
            <div style={{ minWidth: 0, order: 2 }} className="assessment-main">
              {/* 결과 배너 */}
              {/* 채점 완료 시에만 합격/불합격 + 점수 배너 표시 */}
              {/* {result && (...)} 패턴: result가 있을 때만 뒤의 JSX를 그린다(없으면 아무것도 안 그림). */}
              {result && (
                <div style={{
                  // 합격이면 연두 배경, 불합격이면 연빨강 배경
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
                    // <>...</>로 여러 <span>을 묶어 한 분기에서 함께 반환
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
                {/* set.mcq 배열을 돌며 문항 카드를 하나씩 만든다. */}
                {set.mcq.map((q) => {
                  // 문항별 응답/정오 상태 계산
                  const userAnswer = answers[q.no];                 // 내가 고른 보기(없으면 undefined)
                  const isAnswered = userAnswer !== undefined;       // 답을 골랐는지
                  const isCorrect = submitted && userAnswer === q.answer;                 // 제출됨 + 정답
                  const isWrong = submitted && isAnswered && userAnswer !== q.answer;     // 제출됨 + 답함 + 틀림
                  const isUnanswered = submitted && !isAnswered;                          // 제출됨 + 안 함

                  // 문항 카드 테두리 색상: 정답=초록, 오답/미응답=빨강, 그 외 기본
                  let borderColor = 'var(--border-light, #e5e7eb)';
                  if (isCorrect) borderColor = '#10b981';
                  else if (isWrong || isUnanswered) borderColor = '#ef4444';

                  return (
                    <div
                      key={q.no}
                      // 사이드바 점프용으로 문항 카드 DOM 참조 저장
                      // ref 콜백: 이 div가 화면에 생기면 el(실제 DOM)을, 사라지면 null을 받는다.
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
                            {/* 중첩 삼항연산자: 정답이면 정답, 아니면 미응답인지 따져 미응답/오답 표시 */}
                            {isCorrect ? '✓ 정답' : isUnanswered ? '미응답' : '✗ 오답'}
                          </span>
                        )}
                      </div>

                      {/* 보기 목록 (라디오 선택) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '8px' }}>
                        {/* q.options(보기 배열)를 돌며 보기 한 줄씩 만든다. i는 0부터 시작하는 인덱스. */}
                        {q.options.map((opt, i) => {
                          // 각 보기의 상태: 사용자 선택 / 정답 보기 / 잘못 선택한 보기
                          const isUserChoice = userAnswer === i;                    // 이 보기를 내가 골랐는지
                          const isCorrectOption = reveal && i === q.answer;          // 정답 노출 가능할 때만
                          const isWrongChoice = reveal && isUserChoice && i !== q.answer; // 내가 고른 오답 보기

                          // 보기 배경/글자/테두리 색상 기본값 (let: 아래에서 조건에 따라 다시 바꿀 수 있게 변수로 둠)
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
                            // <label>로 감싸면 글자를 클릭해도 안의 라디오 버튼이 선택된다(클릭 영역 확대).
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
                                // 같은 name을 가진 라디오끼리는 한 그룹 → 한 문항당 하나만 선택되게 한다.
                                name={`q-${q.no}`}
                                checked={isUserChoice} // 선택 여부를 상태(answers)가 결정 → "제어 컴포넌트"
                                onChange={() => handleSelect(q.no, i)} // 사용자가 고르면 상태를 갱신
                                disabled={submitted}  // 제출 후 보기 변경 불가
                                style={{
                                  marginTop: '3px',
                                  accentColor: 'var(--primary-blue, #0046C8)',
                                  cursor: submitted ? 'default' : 'pointer',
                                }}
                              />
                              <span style={{ color, lineHeight: 1.5, flex: 1, minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere', fontWeight: isCorrectOption ? 700 : 400 }}>
                                {/* 보기 번호를 원문자(①②③…)로 표시: 0x2460(①)에 인덱스를 더함 */}
                                {/* String.fromCharCode: 유니코드 코드값을 글자로 바꾼다. 0x2460은 '①'의 코드. */}
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
                      {/* && 를 연달아 쓰면 "둘 다 참일 때만" 뒤의 JSX를 그린다. */}
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
            {/* sticky: 스크롤을 내려도 화면 상단(top:90px)에 달라붙어 따라오는 위치 방식. */}
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
                    {/* width를 (응답수 / 전체) * 100 % 로 계산해 막대 길이로 표현. */}
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
                    const style = getBoxStyle(q.no);  // 문항 상태별 색상 계산(위에서 정의한 함수 사용)
                    return (
                      <button
                        key={q.no}
                        type="button"
                        onClick={() => scrollToQuestion(q.no)} // 클릭하면 해당 문항으로 스크롤 이동
                        // aria-label: 화면 낭독기(스크린리더)가 읽어줄 설명. 접근성을 위해 추가.
                        aria-label={`${q.no}번 문항으로 이동`}
                        style={{
                          aspectRatio: '1 / 1', // 가로:세로 = 1:1 정사각형
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
                        // e.currentTarget: 이벤트가 붙은 그 버튼 자신. 마우스를 올리면 1.1배, 떼면 원래대로.
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
                {/* 분기 구조: isPractice ? (자습) : !submitted ? (풀이중) : (채점완료) */}
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
                          // 저장 상태에 따라 배경색을 다르게(완료=연두, 실패=연빨강, 그 외=회색)
                          background:
                            saveStatus === 'saved' ? '#ecfdf5'
                            : saveStatus === 'error' ? '#fef2f2'
                            : 'var(--bg-light-gray, #f8f9fa)',
                          color:
                            saveStatus === 'saved' ? '#065f46'
                            : saveStatus === 'error' ? '#991b1b'
                            : 'var(--text-secondary, #6b7280)',
                        }}>
                          {/* 상태별 안내 문구 (해당 상태일 때만 그려진다) */}
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
      {/* <style>{`...`}</style>: 이 페이지에만 적용할 CSS를 직접 넣는다. @media는 화면 너비별 규칙. */}
      {/* 주의: 아래 백틱 문자열 안에는 절대 주석을 넣지 말 것(그대로 CSS로 출력되어 깨진다). */}
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
