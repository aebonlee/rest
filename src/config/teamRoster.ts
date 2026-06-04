/**
 * 프로젝트 팀 구성 확정 명단 (2026-06-04 확정).
 * 팀 번호 = 투표 순위/프로젝트 번호. topic 은 각 팀의 프로젝트 주제.
 * 관리자 페이지에서 이 명단으로 rest_teams 를 일괄 정리한다(이름→실제 계정 매칭).
 * 팀장은 미지정 — 학생이 직접 '내가 팀장 할게요'를 먼저 누른 1명이 팀장이 된다.
 */
export interface RosterTeam {
  no: number;
  topic: string;
  members: string[];
}

export const CONFIRMED_TEAMS: RosterTeam[] = [
  { no: 1, topic: '한국형 AI 동화책 제작 앱', members: ['이소민', '신슬', '유용주', '구자성'] },
  { no: 2, topic: '청년지원정책 안내 챗봇', members: ['임종권', '최윤경', '박수아', '권규빈'] },
  { no: 3, topic: '회복탄력성 루틴 코치', members: ['김건희', '이초월', '김서우', '최윤정'] },
  { no: 4, topic: '회복탄력성 루틴 코치 (2팀)', members: ['전유미', '오지원', '윤혜수'] },
  { no: 5, topic: 'AI 창업 아이템 코치', members: ['이시민', '조윤서'] },
  { no: 6, topic: '청년지원정책 안내 챗봇 (2팀)', members: ['박정우', '한승우', '이수현'] },
  { no: 7, topic: '문화재 AI 해설 앱', members: ['박남영'] },
  { no: 8, topic: '나이대별 한국사 학습·시험 앱', members: ['이유민'] },
  { no: 9, topic: '자격증 취약점 분석 학습 앱', members: ['장호준'] },
  { no: 10, topic: 'AI 자기소개서·면접 코치', members: ['최재영', '김권우'] },
  { no: 11, topic: '밀려도 괜찮은, AI 생성 학습 플래너', members: ['임윤서'] },
  { no: 12, topic: '내 아이 근시 관리용 플랫폼', members: ['조하령'] },
  { no: 13, topic: 'JD 기반 채용 진단 서비스', members: ['정미경'] },
  { no: 14, topic: '외국인 관광객 맞춤형 실시간 맛집 동선 가이드 앱', members: ['하소희'] },
];

export const teamName = (no: number) => `${no}팀`;
