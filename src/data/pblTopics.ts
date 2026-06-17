/**
 * 프로젝트 주제(팀구성·투표·아이디어 예시) — 서울 7 + 제주 7 (총 14).
 * ESG·환경/사회 문제 해결형. 기술/인문 듀얼 트랙 + 생성형 AI 기반,
 * 공공데이터로 착수 가능하고 3분 피치덱·프로토타입으로 마무리 가능한 주제로 구성.
 */
export type Region = '서울' | '제주';
export type Difficulty = '입문' | '중급' | '심화';

export interface PresetTopic {
  key: string;
  region: Region;
  /** 메뉴/카드용 짧은 제목 */
  short: string;
  title: string;
  description: string;   // 문제 개요
  techTrack: string;     // 기술 트랙 역할
  humanTrack: string;    // 인문 트랙 역할
  difficulty: Difficulty;
  dataSets: string[];    // 추천 착수 데이터(구체)
  features: string[];    // 핵심 기능/산출 요소
  deliverable: string;   // 대표 산출물 예시
  expansion: string[];   // 확장·해커톤 발전 아이디어
}

export const PRESET_TOPICS: PresetTopic[] = [
  // ───────── 서울 지역문제 해결 ─────────
  {
    key: 'seoul-1', region: '서울', short: '폭염 사각지대',
    title: '폭염 사각지대 — 무더위쉼터 접근성 지도',
    description: '열섬과 폭염은 심해지는데 무더위쉼터가 정작 취약계층 동선과 어긋나 있는 문제.',
    techTrack: 'S-DoT 기온 데이터와 쉼터 위치·독거노인 분포를 겹쳐 "더운데 쉼터가 먼" 사각지대를 지도화.',
    humanTrack: '폭염 취약계층(독거노인·쪽방촌·야외노동자) 여정 분석과 쉼터 운영 정책 제안.',
    difficulty: '중급',
    dataSets: ['서울 S-DoT 도시기온 데이터', '무더위쉼터 위치(서울 열린데이터광장)', '독거노인·고령인구 분포(통계청 SGIS)'],
    features: ['기온×쉼터×취약계층 중첩 사각지대 지도', '자치구별 쉼터 접근성 점수', '폭염 경보 시 우선 안내 대상 추출'],
    deliverable: '무더위쉼터 접근성 사각지대 인터랙티브 지도 + 정책 제언 리포트',
    expansion: ['쪽방촌·야외노동자 동선 반영', '실시간 폭염특보 연동 알림'],
  },
  {
    key: 'seoul-2', region: '서울', short: '반지하 침수 위험',
    title: '반지하의 여름 — 상습침수·주거 취약 위험 지도',
    description: '반지하 거주와 상습침수구역이 겹치는 주거 안전 문제. 사회적 메시지가 강해 해커톤 서사가 묵직합니다.',
    techTrack: '침수 이력·강우·저지대·반지하 분포 데이터를 결합해 위험 우선순위 대시보드를 구현.',
    humanTrack: '주거 취약가구 이해관계자 정리와 대피·이주 지원 정책 시나리오 구성.',
    difficulty: '심화',
    dataSets: ['상습침수구역(서울 안전누리·열린데이터광장)', '강우·침수 이력', '저지대·반지하 분포(건축물대장·통계)'],
    features: ['침수 위험 우선순위 대시보드', '반지하×침수 중첩 위험지도', '인근 대피소 매칭'],
    deliverable: '주거 침수 위험 우선순위 대시보드 + 대피·이주 지원 시나리오',
    expansion: ['기후변화 강우 시나리오 반영', '취약가구 대상 위험 알림 서비스'],
  },
  {
    key: 'seoul-3', region: '서울', short: '무장애 환승',
    title: '모두의 환승 — 교통약자 무장애 이동 경로 서비스',
    description: '지하철 엘리베이터·경사로가 없는 역에서 휠체어·유모차·노인이 막히는 이동권 문제. 웹 풀스택 데모가 깔끔하게 나옵니다.',
    techTrack: '역사별 무장애 시설 데이터로 "환승 가능/불가" 경로 추천 프로토타입 구현.',
    humanTrack: '교통약자 사용자 여정과 이동권 정책 제안.',
    difficulty: '중급',
    dataSets: ['지하철역 엘리베이터·경사로(서울교통공사)', '환승역 시설 정보', '교통약자 이동 통계'],
    features: ['무장애 환승 경로 추천', '역별 가능/불가 표시', '대체 경로 안내'],
    deliverable: '교통약자 무장애 경로 추천 웹앱 프로토타입',
    expansion: ['실시간 엘리베이터 고장 정보 연동', '음성 안내·고대비 접근성 모드'],
  },
  {
    key: 'seoul-4', region: '서울', short: '1인가구 돌봄',
    title: '혼자 살아도 안전하게 — 1인가구·고독사 예방 돌봄 설계',
    description: '1인가구 급증과 고독사 위험 문제.',
    techTrack: '자치구별 1인가구·연령·위험지표 데이터를 결합한 모니터링 대시보드 구현.',
    humanTrack: '돌봄 서비스 흐름과 이웃·복지관·통신 데이터 기반 조기경보 시나리오, 행동변화 캠페인 설계.',
    difficulty: '중급',
    dataSets: ['자치구별 1인가구 통계(SGIS)', '연령·고립위험 지표', '복지시설 분포'],
    features: ['고독사 위험 모니터링 대시보드', '조기경보 지표 설계', '돌봄 자원 매칭'],
    deliverable: '1인가구 위험 모니터링 대시보드 + 돌봄 조기경보 시나리오',
    expansion: ['통신·전력 사용 이상 감지 연계', '이웃 돌봄 참여 캠페인'],
  },
  {
    key: 'seoul-5', region: '서울', short: '골목상권 쇠퇴',
    title: '사라지는 골목 — 골목상권 쇠퇴·젠트리피케이션 분석',
    description: '임대료 상승과 생활인구 변화로 골목상권이 밀려나는 문제.',
    techTrack: '상권·생활인구·매출/폐업 데이터를 분석해 위험 상권 시각화.',
    humanTrack: '소상공인·임대인·주민 이해관계자 갈등 정리와 상생 정책 제안.',
    difficulty: '중급',
    dataSets: ['서울 상권분석 데이터(우리마을가게)', '생활인구 데이터', '매출·폐업 통계'],
    features: ['쇠퇴 위험 상권 시각화', '생활인구×임대료 추이 분석', '상생 정책 시뮬레이션'],
    deliverable: '골목상권 쇠퇴 위험 지도 + 상생 정책 제안',
    expansion: ['젠트리피케이션 조기경보 지표', '소상공인 맞춤 지원 추천'],
  },
  {
    key: 'seoul-6', region: '서울', short: '노인 디지털 격차',
    title: '키오스크 앞에서 멈춘 사람들 — 노인 디지털 격차 해소',
    description: '무인주문기·디지털 행정에서 소외되는 고령층 문제. 인문 트랙 비중이 높아 비개발 학생 만족도가 좋습니다.',
    techTrack: '생성형 AI로 "쉬운 말·큰 글씨·음성 안내" 키오스크/안내 챗봇 프로토타입 구현.',
    humanTrack: '고령 사용자 여정과 세대 친화 콘텐츠·교육 프로그램 기획.',
    difficulty: '입문',
    dataSets: ['고령인구 분포(SGIS)', '디지털 정보화 실태조사(NIA)', '공공서비스 이용 데이터'],
    features: ['쉬운말·큰글씨 안내 챗봇', '음성 키오스크 시안', '세대친화 콘텐츠 가이드'],
    deliverable: '고령자용 생성형 AI 안내 챗봇/키오스크 프로토타입',
    expansion: ['실제 행정·주문 서비스 연동', '시니어 디지털 교육 프로그램 패키지'],
  },
  {
    key: 'seoul-7', region: '서울', short: '보행안전 제보',
    title: '우리 동네 안전 제보 — 보행위험·어린이보호구역 시민과학 앱',
    description: '파손 도로·불법주정차·어린이보호구역 위험 등 일상 보행 안전 문제. 참여형 데모라 모의 해커톤에서 즉시 시연 가능.',
    techTrack: '시민이 위치·사진을 제보하면 위험 우선순위 지도가 그려지는 크라우드소싱 웹앱 구현.',
    humanTrack: '참여 동기 설계와 보행 약자(어린이·노인) 관점 캠페인.',
    difficulty: '입문',
    dataSets: ['어린이보호구역(공공데이터포털)', '보행 교통사고 통계(TAAS)', '시민 제보(크라우드소싱)'],
    features: ['위치·사진 제보 기능', '위험 우선순위 지도', '구역별 위험 통계'],
    deliverable: '보행위험 시민과학 제보 웹앱 + 우선순위 지도',
    expansion: ['지자체 신고 시스템 연계', '어린이·노인 관점 안전 캠페인'],
  },

  // ───────── 제주 지역문제 해결 (제주국제 생태포럼 해커톤 연계) ─────────
  {
    key: 'jeju-1', region: '제주', short: '해녀 아카이브',
    title: '사라지는 물질(物質) — 해녀 어업영역 지도 & 구술 아카이브',
    description: '고령화·해양온난화로 해녀 수와 채취 가능 해역이 빠르게 줄고 있는 문제. UNESCO 무형유산이라 해커톤 서사가 강력합니다.',
    techTrack: '해녀 연령분포·어촌계별 데이터를 지도/대시보드로 시각화하고 채취 가능 해역 변화 추이 표시.',
    humanTrack: '해녀–어촌계–관광객 이해관계자 분석과 구술 스토리라인(AI로 인터뷰 정리).',
    difficulty: '중급',
    dataSets: ['어촌계·해녀 현황(제주데이터허브)', '해녀 연령분포', '해양 수온 변화(해양수산부)'],
    features: ['해녀 분포·고령화 시각화', '채취 가능 해역 변화 추이', 'AI 구술 스토리 아카이브'],
    deliverable: '해녀 어업영역 지도 + 구술 스토리 아카이브',
    expansion: ['UNESCO 무형유산 스토리텔링', '관광 연계 교육 콘텐츠'],
  },
  {
    key: 'jeju-2', region: '제주', short: '오버투어리즘',
    title: '관광객을 흩뿌리다 — 오버투어리즘 분산 추천 서비스',
    description: '특정 명소 과밀 vs 주민 생활권 충돌 문제. 웹 풀스택 관점에서 가장 데모가 화려하게 나오는 주제입니다.',
    techTrack: '관광 데이터로 혼잡 히트맵을 만들고 시간대·대안 코스 추천 로직을 프로토타입화.',
    humanTrack: '주민–관광객 갈등 구조와 "지속가능 관광" 정책 제안.',
    difficulty: '중급',
    dataSets: ['관광 방문·혼잡 데이터(제주관광공사)', '생활인구 데이터', '교통·대중교통 데이터'],
    features: ['명소 혼잡 히트맵', '시간대·대안 코스 추천', '주민 생활권 영향 분석'],
    deliverable: '오버투어리즘 분산 추천 서비스 프로토타입',
    expansion: ['실시간 혼잡 알림', '지속가능 관광 인증·캠페인'],
  },
  {
    key: 'jeju-3', region: '제주', short: '곶자왈·오름 생태',
    title: '곶자왈·오름 생태 위협 모니터링',
    description: '난개발·기후변화로 곶자왈과 오름 생태가 훼손되는 문제.',
    techTrack: '토지이용·식생·탐방객 데이터를 분석해 훼손 위험 지역을 지도화.',
    humanTrack: '보전 vs 개발 이해관계자 정리와 보호구역 정책 시나리오 작성.',
    difficulty: '심화',
    dataSets: ['토지이용·식생(환경공간정보 EGIS)', '탐방객 데이터', '보호지역 경계'],
    features: ['훼손 위험 지역 지도', '식생×개발압력 분석', '보호 우선순위 도출'],
    deliverable: '곶자왈·오름 생태 위협 모니터링 지도 + 보전 정책',
    expansion: ['위성·드론 영상 변화탐지', '탐방로 관리 제안'],
  },
  {
    key: 'jeju-4', region: '제주', short: '지하수 대시보드',
    title: '생명수 — 제주 지하수 사용 대시보드',
    description: '지하수가 사실상 유일한 수자원인데 관광·농업 수요로 압박받는 문제.',
    techTrack: '지역별 취수량·강수량 데이터를 결합한 모니터링 대시보드와 간단한 수요 예측 구현.',
    humanTrack: '물 절약 행동변화 캠페인과 정책 제안 설계.',
    difficulty: '심화',
    dataSets: ['지하수 취수량(제주 수자원본부)', '강수량(기상청)', '관광·농업 용수 수요'],
    features: ['지역별 취수×강수 대시보드', '간단 수요 예측 모델', '취수 부담 경보'],
    deliverable: '제주 지하수 사용 모니터링 대시보드 + 절약 캠페인',
    expansion: ['가뭄 시나리오 예측', '농업 물 사용 최적화 제안'],
  },
  {
    key: 'jeju-5', region: '제주', short: '카본프리 아일랜드',
    title: '카본프리 아일랜드 2030 — 전기차·재생에너지 격차 분석',
    description: 'EV 보급 선두지만 충전 인프라 불균형과 풍력·태양광 출력제한(curtailment) 문제가 큽니다.',
    techTrack: '충전소 분포·재생에너지 발전 데이터로 "사각지대" 지도와 시각화 구현.',
    humanTrack: '정의로운 전환(주민 수용성) 관점의 정책 메시지 구성.',
    difficulty: '심화',
    dataSets: ['전기차 충전소(공공데이터포털)', '재생에너지 발전·출력제한', '읍면동 인프라 통계'],
    features: ['충전 인프라 사각지대 지도', '재생에너지 출력제한(curtailment) 분석', '정의로운 전환 지표'],
    deliverable: '전기차·재생에너지 격차 분석 지도 + 정책 메시지',
    expansion: ['수요예측 기반 충전소 입지 제안', '주민 수용성 조사 설계'],
  },
  {
    key: 'jeju-6', region: '제주', short: '해안 플라스틱',
    title: '우리 바다 지킴이 — 해안 플라스틱 시민과학 앱',
    description: '해류로 밀려오는 해안 쓰레기 문제. 참여형 데모라 모의 해커톤에서 즉시 시연 가능.',
    techTrack: '시민이 위치·사진을 제보하면 정화 우선순위 지도가 그려지는 크라우드소싱 웹앱 프로토타입.',
    humanTrack: '참여 동기 설계와 행동변화 콘텐츠.',
    difficulty: '입문',
    dataSets: ['해안 쓰레기 모니터링(해양환경정보 MEIS)', '해류·기상 데이터', '시민 제보'],
    features: ['시민 제보 정화 우선순위 지도', '해안별 누적 통계', '정화 활동 매칭'],
    deliverable: '해안 플라스틱 시민과학 제보 웹앱',
    expansion: ['해류 예측 기반 유입 예보', '정화 캠페인 게이미피케이션'],
  },
  {
    key: 'jeju-7', region: '제주', short: '제주어 아카이브',
    title: '제주어가 사라지기 전에 — 마을 이야기 AI 아카이브',
    description: '소멸위기 언어인 제주어와 마을 설화·당 문화 보존 문제. 인문 트랙 비중이 가장 높아 비개발 학생 만족도가 높습니다.',
    techTrack: '생성형 AI로 제주어 학습/번역 챗봇 또는 마을 스토리 지도를 구현.',
    humanTrack: '채록·맥락 정리와 세대 전승 콘텐츠 기획.',
    difficulty: '입문',
    dataSets: ['제주어 사전·말뭉치', '마을 설화·당 문화 자료', '구술 채록 자료'],
    features: ['제주어 학습/번역 챗봇', '마을 스토리 지도', '세대 전승 콘텐츠'],
    deliverable: '제주어 학습 챗봇 또는 마을 이야기 AI 아카이브',
    expansion: ['음성 합성 제주어', '관광·교육 연계 콘텐츠'],
  },
];

export const PRESET_KEYS = new Set(PRESET_TOPICS.map((t) => t.key));
export const REGIONS: Region[] = ['서울', '제주'];

/** 난이도 색상 */
export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  입문: '#10B981', 중급: '#D97706', 심화: '#DC2626',
};

/** 지역별 착수 데이터 가이드 (3주차 데이터 탐색 워크숍에서 우선 확보) */
export const REGION_DATA_GUIDE: Record<Region, { name: string; url: string }[]> = {
  서울: [
    { name: '서울 열린데이터광장', url: 'https://data.seoul.go.kr' },
    { name: 'S-DoT 도시데이터(서울 열린데이터광장)', url: 'https://data.seoul.go.kr' },
    { name: '공공데이터포털', url: 'https://www.data.go.kr' },
  ],
  제주: [
    { name: '제주데이터허브', url: 'https://www.jejudatahub.net' },
    { name: '공공데이터포털', url: 'https://www.data.go.kr' },
    { name: '환경부·해양수산부 공공데이터', url: 'https://www.data.go.kr' },
  ],
};

/** 모든 팀 공통 산출물 (3분 피치덱·프로토타입으로 마무리) */
export const STANDARD_DELIVERABLES: string[] = [
  '문제정의서 — “왜 중요한 문제인가” 정리',
  '데이터 분석·시각화 (지도/대시보드 등)',
  '프로토타입 — 웹앱/대시보드/챗봇 등 기술 산출물',
  '3분 피치덱 + 발표 스크립트 (해커톤 제출형)',
];

/** key 로 주제 찾기 */
export const getTopic = (key: string): PresetTopic | undefined =>
  PRESET_TOPICS.find((t) => t.key === key);

/** 지역별 주제 목록 */
export const topicsByRegion = (region: Region): PresetTopic[] =>
  PRESET_TOPICS.filter((t) => t.region === region);
