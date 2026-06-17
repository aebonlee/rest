/**
 * 휴리스틱 자동 채점 — 학생이 작성한 프롬프트/생각을 점수로 평가 (LLM 없이 규칙 기반).
 * 분량 + 구체성 + 구조화 + 핵심요소(키워드) → 0~100.
 * keywords: ['단어1|동의어', '단어2', …] (| 로 동의어 묶음, 하나라도 포함되면 인정)
 */
export interface EvalBreakdown { label: string; got: number; max: number; }
export interface EvalResult {
  score: number;
  grade: string;
  color: string;
  breakdown: EvalBreakdown[];
  tips: string[];
}

export function evaluateWriting(text: string, keywords: string[] = []): EvalResult | null {
  const t = (text || '').trim();
  if (t.length === 0) return null;

  // 1) 분량 (0~25): 10자 이하 0, 80자 이상 만점
  const lengthScore = Math.max(0, Math.min(25, Math.round(((t.length - 10) / 70) * 25)));

  // 2) 구체성 (0~15): 숫자·단위·예시 표현
  let spec = 0;
  if (/\d/.test(t)) spec += 6;
  if (/[%원개명점층초분월일초개수가지건]/.test(t)) spec += 3;
  if (/(예:|예를|예시|→|->|즉,|처럼|구체적)/.test(t)) spec += 6;
  const specScore = Math.min(15, spec);

  // 3) 구조화 (0~20): 줄바꿈·목록기호·여러 문장
  const lines = t.split(/\n/).filter((s) => s.trim()).length;
  const listMarks = (t.match(/(^|\n|\s)(①|②|③|④|⑤|⑥|[1-9][.)]|[-*·])/g) || []).length;
  const sentences = t.split(/[.!?。\n]/).filter((s) => s.trim().length > 3).length;
  let struct = 0;
  if (lines >= 2) struct += 8;
  if (listMarks >= 2) struct += 7;
  if (sentences >= 2) struct += 5;
  const structScore = Math.min(20, struct);

  // 4) 핵심요소 (0~40): 단계별 기대 키워드 포함 여부
  let kwScore: number;
  const miss: string[] = [];
  if (keywords.length) {
    let hit = 0;
    keywords.forEach((k) => {
      const alts = k.split('|');
      if (alts.some((a) => t.includes(a))) hit += 1;
      else miss.push(alts[0]);
    });
    kwScore = Math.round((hit / keywords.length) * 40);
  } else {
    kwScore = Math.round(((lengthScore / 25 + structScore / 20) / 2) * 40);
  }

  const score = Math.min(100, lengthScore + specScore + structScore + kwScore);

  const tips: string[] = [];
  if (t.length < 40) tips.push('내용이 짧아요. 한두 문장 더 구체적으로 작성해 보세요.');
  if (specScore < 12) tips.push('숫자·단위·구체적 예시(예: …)를 넣으면 훨씬 명확해집니다.');
  if (structScore < 12) tips.push('줄바꿈이나 ①②③·번호로 항목을 나눠 정리해 보세요.');
  if (keywords.length && miss.length) tips.push(`이런 요소도 포함하면 좋아요: ${miss.join(', ')}`);
  if (tips.length === 0) tips.push('핵심을 잘 갖췄어요! 표현을 조금만 더 다듬으면 완벽합니다. 👏');

  let grade: string, color: string;
  if (score >= 90) { grade = '우수'; color = '#059669'; }
  else if (score >= 75) { grade = '양호'; color = '#2563EB'; }
  else if (score >= 60) { grade = '보통'; color = '#D97706'; }
  else { grade = '보완 필요'; color = '#DC2626'; }

  return {
    score, grade, color,
    breakdown: [
      { label: '분량', got: lengthScore, max: 25 },
      { label: '구체성', got: specScore, max: 15 },
      { label: '구조화', got: structScore, max: 20 },
      { label: '핵심요소', got: kwScore, max: 40 },
    ],
    tips,
  };
}

/** PBL(컴퓨팅 사고 7단계 개발 프로젝트) 단계별 기대 키워드 (stage.key 기준) */
export const PBL_STAGE_KEYWORDS: Record<string, string[]> = {
  recognition: ['불편|문제|번거|어려', '누가|언제|어디서|사용자|대상', '관찰|발견|후보', '선정|선택|이유'],
  definition: ['목표|만들|해결', '무엇|기능|서비스|앱', '사용자|대상|시나리오'],
  decomposition: ['분해|나누|하위|쪼개', '입력|처리|출력', '단계|부분|모듈'],
  abstraction: ['핵심|중요|필요', '데이터|정보|값', '규칙|패턴|구조|자료구조', '제거|제외|단순'],
  algorithm: ['절차|단계|순서', '알고리즘|로직|흐름', '의사코드|슈도코드|흐름도|플로우'],
  implementation: ['구현|코드|개발|프로토타입', 'python|react|flask|supabase|ai|gpt|claude|도구|언어|프레임워크', '링크|github|배포|http|데모|동작'],
  presentation: ['시연|데모|발표', '핵심|메시지|요약', '문제|해결|효과', '회고|배운|개선'],
};
