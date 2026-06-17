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

/** PBL 단계별 기대 키워드 (stage.key 기준) */
export const PBL_STAGE_KEYWORDS: Record<string, string[]> = {
  problem: ['지역|서울|제주|환경|ESG', '문제|불편|이슈', '누가|사용자|대상|시민', '데이터|공공데이터|통계', '아이디어|해결|생성형|AI'],
  teaming: ['기술|인문|트랙', '역할|분담|담당', '사용자|타깃|대상', '가치|제안|효과'],
  midreview: ['문제정의|정의|명확', '데이터|활용|분석', '해커톤|확장|생태포럼|발전'],
  mentoring: ['멘토|피드백|조언|코칭', '반영|개선|수정|보완'],
  build: ['분석|시각화|대시보드|프로토타입|지도|구현', '서비스|정책|콘텐츠|사용자|기획', '링크|github|배포|http|데모'],
  final: ['보고서|결과|요약', '피치|발표|덱|슬라이드', '시각화|데모|링크', '회고|배운|확장'],
};
