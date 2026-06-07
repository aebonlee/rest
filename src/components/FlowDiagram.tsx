/**
 * FlowDiagram.tsx
 * ------------------------------------------------------------------
 * [이 파일이 무엇인가? — 초보자용 큰 그림]
 *   화면에 "네모 상자(노드)들을 화살표로 이어 보여주는 흐름도(다이어그램)"를
 *   그려주는 React 컴포넌트입니다. 프로젝트마다(projectId 1~7) 미리 정해 둔
 *   "AI 파이프라인(데이터가 거쳐가는 단계들)"을 그림으로 표현합니다.
 *
 * [왜 SVG를 쓰나?]
 *   SVG(Scalable Vector Graphics)는 "선·도형을 좌표로 그리는 그림 포맷"입니다.
 *   HTML 안에 <svg> 태그로 직접 쓸 수 있고, 확대해도 깨지지 않으며,
 *   사각형(<rect>)·선(<path>)·글자(<text>)를 좌표로 자유롭게 배치할 수 있어
 *   "흐름도처럼 위치를 정밀하게 잡아야 하는 그림"에 잘 맞습니다.
 *
 * [용어 미리보기]
 *   - 노드(Node)  : 흐름도의 네모 상자 하나(예: "사용자 입력").
 *   - 화살표(Arrow): 노드 A에서 노드 B로 향하는 연결선.
 *   - 격자 좌표(row/col): "몇 번째 행, 몇 번째 열"처럼 칸 단위 위치(0부터 시작).
 *                         실제 화면 픽셀이 아니라 "논리적 칸 번호"입니다.
 *   - 픽셀 좌표(x/y): 화면에서의 실제 위치(점 단위). 격자 좌표를 계산해 얻습니다.
 *
 * [중요 특징]
 *   - "프레젠테이션 전용" 컴포넌트입니다. 즉 화면에 보여주기만 할 뿐
 *     서버 통신·상태(useState)·부수효과(useEffect)가 전혀 없습니다.
 *     같은 입력(props)이면 항상 같은 그림을 그리는 "순수 함수형" 컴포넌트라
 *     이해하기 쉽고 버그가 적습니다.
 *
 * 주요 export:
 *   - default export: FlowDiagram 컴포넌트 (다른 파일에서 import FlowDiagram from ...)
 *
 * 동작 개요(읽는 순서):
 *   1) DIAGRAMS 사전에서 projectId에 해당하는 노드/화살표 설정을 찾는다.
 *   2) 격자 좌표(row/col)를 픽셀 좌표로 변환(np 함수)한다.
 *   3) 두 노드의 위치 관계(행/열 차이)에 따라
 *      직선 또는 2차 베지어(곡선) 경로를 만든다(arrowPath 함수).
 *   4) 일치하는 projectId가 없으면 null을 반환해 아무것도 그리지 않는다.
 * ------------------------------------------------------------------
 */
// React에서 "JSX로 만든 화면 요소"의 타입이 ReactElement 입니다.
// 'type' 키워드를 붙인 import는 "타입 정보만 가져온다"는 뜻으로,
// 빌드 결과(실제 JS)에는 포함되지 않아 번들이 약간 가벼워집니다(타입 전용 import).
import { type ReactElement } from 'react';

// [TypeScript 개념] interface = "객체가 어떤 모양(속성)이어야 하는지"를 정의하는 설계도.
//   실제 동작 코드가 아니라 "타입 검사용 규칙"이며, 빌드 후 JS에는 남지 않습니다.
//   이렇게 모양을 미리 정해두면, 오타나 빠진 속성을 코드 작성 중에 바로 잡아줍니다.

// 단일 노드(흐름도 상자) 정의:
//   id    : 노드 고유 식별자(키). 화살표가 이 id로 출발/도착 노드를 찾습니다.
//   label : 상자 안에 크게 표시되는 주 텍스트.
//   sub?  : 보조 텍스트(작은 설명). 물음표(?)는 "있어도 되고 없어도 됨(선택 속성)"을 뜻합니다.
//   row   : 격자 행 위치(위→아래, 0부터). col : 격자 열 위치(왼→오른, 0부터).
interface Node { id: string; label: string; sub?: string; row: number; col: number }
// 노드 간 연결(화살표) 정의: from→to. from/to에는 위 Node의 id 문자열이 들어갑니다.
//   즉 "from 노드에서 to 노드로 화살표를 그려라"는 의미입니다.
interface Arrow { from: string; to: string }
// 하나의 다이어그램(하나의 흐름도) 구성: 노드 목록 + 화살표 목록을 묶은 형태.
interface Config { nodes: Node[]; arrows: Arrow[] }

// [레이아웃 상수 — 모두 픽셀(px) 단위] 한 번 정해두고 어디서나 재사용하는 고정값들.
//  상수를 한곳에 모아두면 나중에 크기/간격을 바꿀 때 여기만 고치면 됩니다(유지보수 편의).
//  W : 노드(상자) 너비(width)
//  H : 노드(상자) 높이(height)
//  GX: 열과 열 사이 가로 간격(Gap on X축)
//  GY: 행과 행 사이 세로 간격(Gap on Y축)
//  P : 캔버스 가장자리 안쪽 여백(Padding) — 상자가 화면 끝에 딱 붙지 않게 띄워줌
const W = 148, H = 52, GX = 38, GY = 30, P = 16;

// 프로젝트 ID(1~7)별 흐름도 정의 "사전(데이터 테이블)".
//   여기에 그릴 내용(노드 위치 + 연결)을 미리 적어두고, 컴포넌트는 이 표를 보고 그립니다.
//   "코드(그리는 로직)와 데이터(무엇을 그릴지)를 분리"해 두면, 새 흐름도를 추가할 때
//   아래에 숫자 키 하나만 더 적으면 되어 확장이 쉽습니다.
// [TypeScript 개념] Record<number, Config> = "키는 숫자, 값은 Config 모양인 객체" 라는 타입.
//   예: DIAGRAMS[1] 의 결과는 Config(=nodes/arrows를 가진 객체)임이 보장됩니다.
const DIAGRAMS: Record<number, Config> = {
  1: {
    nodes: [
      { id: 'a', label: '사용자 입력', sub: '나이·주제', row: 0, col: 0 },
      { id: 'b', label: 'Solar Chat', sub: '스토리 생성', row: 0, col: 1 },
      { id: 'c', label: '장면 분할기', sub: '5~8 장면', row: 0, col: 2 },
      { id: 'd', label: '삽화 프롬프트', sub: '생성기', row: 1, col: 2 },
      { id: 'e', label: '독후활동 생성', sub: '질문·교훈', row: 1, col: 1 },
      { id: 'f', label: '동화 뷰어', sub: '최종 출력', row: 2, col: 1 },
    ],
    arrows: [
      { from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'd' },
      { from: 'd', to: 'e' }, { from: 'e', to: 'f' },
    ],
  },
  2: {
    nodes: [
      { id: 'a', label: '문화재청 API', sub: '공공데이터', row: 0, col: 0 },
      { id: 'b', label: '전처리·청킹', sub: '텍스트 분할', row: 0, col: 1 },
      { id: 'c', label: 'Solar Embed', sub: '벡터화', row: 0, col: 2 },
      { id: 'd', label: '수준별 해설', sub: '+ 퀴즈 출력', row: 1, col: 0 },
      { id: 'e', label: 'Solar Chat', sub: 'RAG 생성', row: 1, col: 1 },
      { id: 'f', label: 'pgvector', sub: '벡터 검색', row: 1, col: 2 },
      { id: 'g', label: '사용자 질의', sub: '문화재·수준', row: 2, col: 1 },
    ],
    arrows: [
      { from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'f' },
      { from: 'f', to: 'e' }, { from: 'e', to: 'd' },
      { from: 'g', to: 'f' }, { from: 'g', to: 'd' },
    ],
  },
  3: {
    nodes: [
      { id: 'a', label: '한국사 DB', sub: '시대별 구조', row: 0, col: 0 },
      { id: 'b', label: '수준별 설명', sub: 'Solar 생성', row: 0, col: 1 },
      { id: 'c', label: '학습 뷰어', sub: '읽기·듣기', row: 0, col: 2 },
      { id: 'd', label: '문제 생성', sub: '유형별', row: 1, col: 0 },
      { id: 'e', label: '풀이 & 채점', row: 1, col: 1 },
      { id: 'f', label: '오답 분석', sub: '+ 리포트', row: 1, col: 2 },
      { id: 'g', label: '적응형 복습', sub: '취약 시대', row: 2, col: 2 },
    ],
    arrows: [
      { from: 'a', to: 'b' }, { from: 'b', to: 'c' },
      { from: 'a', to: 'd' }, { from: 'c', to: 'f' },
      { from: 'd', to: 'e' }, { from: 'e', to: 'f' }, { from: 'f', to: 'g' },
    ],
  },
  4: {
    nodes: [
      { id: 'a', label: '문제 은행', sub: '자격증별', row: 0, col: 0 },
      { id: 'b', label: '문제 풀기', sub: '사용자', row: 0, col: 1 },
      { id: 'c', label: '자동 채점', sub: '+ 단원 태깅', row: 0, col: 2 },
      { id: 'd', label: '유사문제 생성', sub: 'Solar Chat', row: 1, col: 0 },
      { id: 'e', label: '보충학습', sub: '계획 생성', row: 1, col: 1 },
      { id: 'f', label: '취약점 분석', sub: '단원별 통계', row: 1, col: 2 },
    ],
    arrows: [
      { from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'f' },
      { from: 'f', to: 'e' }, { from: 'e', to: 'd' }, { from: 'd', to: 'a' },
    ],
  },
  5: {
    nodes: [
      { id: 'a', label: '정책 데이터', sub: '브리핑·온통', row: 0, col: 0 },
      { id: 'b', label: 'Solar Embed', sub: '벡터화', row: 0, col: 1 },
      { id: 'c', label: 'pgvector', sub: '정책 DB', row: 0, col: 2 },
      { id: 'd', label: '사용자 대화', sub: '"나 25살..."', row: 1, col: 0 },
      { id: 'e', label: '프로파일 파악', sub: '나이·지역', row: 1, col: 1 },
      { id: 'f', label: '정책 매칭', sub: 'RAG 검색', row: 1, col: 2 },
      { id: 'g', label: '쉬운말 안내', sub: 'Solar Chat', row: 2, col: 2 },
    ],
    arrows: [
      { from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'c', to: 'f' },
      { from: 'd', to: 'e' }, { from: 'e', to: 'f' }, { from: 'f', to: 'g' },
    ],
  },
  6: {
    nodes: [
      { id: 'a', label: '경험 입력', sub: '자유 기술', row: 0, col: 0 },
      { id: 'b', label: 'STAR 변환', sub: '구조화', row: 0, col: 1 },
      { id: 'c', label: '자소서 생성', sub: '문항별', row: 0, col: 2 },
      { id: 'd', label: '면접 코칭', sub: 'Q&A 생성', row: 1, col: 1 },
      { id: 'e', label: '문장 피드백', sub: '개선 제안', row: 1, col: 2 },
    ],
    arrows: [
      { from: 'a', to: 'b' }, { from: 'b', to: 'c' },
      { from: 'c', to: 'e' }, { from: 'e', to: 'd' },
    ],
  },
  7: {
    nodes: [
      { id: 'a', label: '감정 체크인', sub: '"오늘 기분?"', row: 0, col: 0 },
      { id: 'b', label: '상태 분석', sub: '수준·키워드', row: 0, col: 1 },
      { id: 'c', label: '루틴 추천', sub: '맞춤 1가지', row: 0, col: 2 },
      { id: 'd', label: '회복 트래커', sub: '추이 그래프', row: 1, col: 1 },
      { id: 'e', label: '격려 메시지', sub: '+ 성찰 질문', row: 1, col: 2 },
      { id: 'f', label: '루틴 수행', sub: '확인 (체크)', row: 2, col: 1 },
    ],
    arrows: [
      { from: 'a', to: 'b' }, { from: 'b', to: 'c' },
      { from: 'c', to: 'e' }, { from: 'e', to: 'd' }, { from: 'f', to: 'd' },
    ],
  },
};

// [React 개념] props = "부모 컴포넌트가 자식에게 건네주는 입력값" (함수 인자와 비슷).
//   아래 Props는 이 컴포넌트가 받기로 약속한 입력의 모양입니다.
//   projectId: 어떤 흐름도를 그릴지 고르는 번호(DIAGRAMS의 키, 1~7).
//   color    : 화살표·노드 테두리·화살촉에 공통으로 쓸 색상 문자열(예: '#2563eb').
interface Props { projectId: number; color: string }

/**
 * FlowDiagram
 * projectId에 매핑된 흐름도를 SVG로 렌더링한다.
 * @param projectId 렌더링할 다이어그램 키(DIAGRAMS의 키, 1~7)
 * @param color     화살표/노드 테두리/마커에 사용할 색상
 * @returns SVG 엘리먼트, 또는 매칭 설정이 없으면 null
 */
// [React 개념] 컴포넌트는 "props를 받아 화면(JSX)을 돌려주는 함수"입니다.
//   ({ projectId, color }: Props) 부분은 "구조 분해 할당": props 객체에서
//   projectId와 color 값을 바로 꺼내 쓰는 문법입니다.
//   반환 타입 ReactElement | null = "화면 요소를 돌려주거나, 아무것도 안 그리면 null".
const FlowDiagram = ({ projectId, color }: Props): ReactElement | null => {
  // projectId에 해당하는 다이어그램 설정을 사전에서 꺼냅니다.
  // 해당 키가 없으면 cfg는 undefined가 됩니다(다음 줄에서 처리).
  const cfg = DIAGRAMS[projectId];
  // [엣지케이스 처리] 정의되지 않은 projectId라면 cfg가 undefined → !cfg가 true.
  //   이때 null을 반환하면 React는 "이 컴포넌트는 아무것도 그리지 않음"으로 처리합니다.
  //   주의: 이 early return(조기 반환)이 없으면 아래에서 undefined를 다루다 오류가 납니다.
  if (!cfg) return null;

  // cfg 안의 nodes/arrows를 각각 변수로 꺼냅니다(구조 분해 할당).
  const { nodes, arrows } = cfg;
  // 노드 id → 노드 객체로 빠르게 찾기 위한 "조회용 맵(객체)"을 만듭니다.
  //  - nodes.map(n => [n.id, n]) : 각 노드를 [id, 노드] 형태의 쌍으로 변환.
  //  - Object.fromEntries(...)   : 그 쌍들의 배열을 { id: 노드, ... } 객체로 합칩니다.
  //  왜? 화살표는 노드를 id 문자열로만 가리키므로, 매번 배열을 뒤지는 대신
  //      map[id]로 즉시 노드를 찾기 위함입니다(검색 효율 + 코드 간결).
  const map = Object.fromEntries(nodes.map(n => [n.id, n]));
  // 모든 노드 중 가장 큰 열/행 번호를 구합니다 → 흐름도가 차지하는 칸 수를 알아내기 위함.
  //  [JS 문법] Math.max(...배열) 의 점 세 개(...)는 "전개 연산자":
  //   배열 [0,1,2] 를 Math.max(0,1,2) 처럼 개별 인자로 펼쳐 넣어줍니다.
  const maxCol = Math.max(...nodes.map(n => n.col));
  const maxRow = Math.max(...nodes.map(n => n.row));
  // SVG 전체(뷰박스) 크기 계산.
  //  열 개수는 (maxCol + 1) 개. 각 열은 (노드폭 W + 간격 GX)를 차지하지만,
  //  마지막 열 뒤에는 간격이 필요 없으므로 GX를 한 번 빼고, 좌우 여백 P*2를 더합니다.
  const svgW = (maxCol + 1) * (W + GX) - GX + P * 2;
  // 높이도 같은 원리(행 기준).
  const svgH = (maxRow + 1) * (H + GY) - GY + P * 2;

  // np = "node position(노드 위치)" 계산 함수.
  //  격자 좌표(row/col, 칸 번호)를 실제 화면 픽셀 좌표로 바꿔 돌려줍니다.
  //  매개변수: n(노드 하나). 반환: { x, y, cx, cy } 4가지 좌표를 담은 객체. 부수효과 없음.
  //   - x, y   : 노드(상자) "왼쪽 위 모서리"의 픽셀 좌표.
  //              (P=여백) + (몇 번째 열/행) × (노드 크기 + 간격) 으로 누적 위치를 구합니다.
  //   - cx, cy : 노드의 "중심점" 픽셀 좌표(center x/y). 좌상단에서 폭/높이의 절반만큼 이동.
  //  왜 중심점이 필요? 글자를 가운데 정렬하거나, 화살표를 변의 가운데에서 출발/도착시키려고.
  const np = (n: Node) => ({
    x: P + n.col * (W + GX),
    y: P + n.row * (H + GY),
    cx: P + n.col * (W + GX) + W / 2,
    cy: P + n.row * (H + GY) + H / 2,
  });

  // arrowPath: 두 노드 사이를 잇는 화살표 선의 "그리기 명령 문자열"을 만들어 돌려줍니다.
  //  [SVG 개념] path 요소의 'd' 속성에 적힌 명령 글자대로 선이 그려집니다.
  //    대문자 M = 펜을 그 좌표로 옮기기(이동, move).
  //    대문자 L = 그 좌표까지 직선 긋기(line).
  //    대문자 Q = "제어점"을 향해 한 번 휘는 2차 베지어 곡선 긋기.
  //               (제어점은 선이 끌려가는 가상의 점으로, 실제로 지나가지는 않음)
  //  매개변수: a(화살표 하나). 반환: 그리기 명령 문자열, 또는 그릴 수 없으면 null. 부수효과 없음.
  const arrowPath = (a: Arrow): string | null => {
    // 화살표가 가리키는 출발(f=from)·도착(t=to) 노드를 위에서 만든 조회용 맵에서 찾습니다.
    const f = map[a.from], t = map[a.to];
    // [엣지케이스] 오타 등으로 존재하지 않는 id를 가리키면 f나 t가 undefined → 그리지 않음(null).
    if (!f || !t) return null;
    // 두 노드의 픽셀 좌표(모서리·중심)를 계산합니다. fp=from의 위치, tp=to의 위치.
    const fp = np(f), tp = np(t);
    // 두 노드의 "상대 위치"를 칸 단위로 구합니다(방향 판단용).
    //  dx>0: 도착이 더 오른쪽 / dx<0: 더 왼쪽,  dy>0: 더 아래 / dy<0: 더 위.
    const dx = t.col - f.col, dy = t.row - f.row;

    // [템플릿 리터럴 주의] 아래 반환값들은 백틱(`) 문자열입니다.
    //   ${...} 안의 값이 계산되어 "M148,42 L186,42" 같은 좌표 명령 문자열이 만들어집니다.
    //   주의: 백틱 문자열 안에는 절대 주석을 넣으면 안 됩니다(그대로 출력에 섞여 그림이 깨짐).

    // 같은 행(dy===0)에서 오른쪽으로 이동(dx>0): 출발 노드 오른쪽 변 중앙 → 도착 노드 왼쪽 변 중앙.
    //   fp.x + W = 출발 상자 오른쪽 끝, tp.x = 도착 상자 왼쪽 끝. 높이는 둘 다 중앙(cy)으로 맞춤.
    if (dy === 0 && dx > 0) return `M${fp.x + W},${fp.cy} L${tp.x},${tp.cy}`;
    // 같은 행에서 왼쪽으로 이동(dx<0): 출발 노드 왼쪽 변 → 도착 노드 오른쪽 변.
    if (dy === 0 && dx < 0) return `M${fp.x},${fp.cy} L${tp.x + W},${tp.cy}`;
    // 같은 열(dx===0)에서 아래로 이동(dy>0): 출발 노드 하단 중앙 → 도착 노드 상단 중앙.
    //   fp.y + H = 출발 상자 아래쪽 끝, tp.y = 도착 상자 위쪽 끝. 가로는 둘 다 중앙(cx)으로 맞춤.
    if (dx === 0 && dy > 0) return `M${fp.cx},${fp.y + H} L${tp.cx},${tp.y}`;
    // 같은 열에서 위로 이동(dy<0): 출발 노드 상단 → 도착 노드 하단.
    if (dx === 0 && dy < 0) return `M${fp.cx},${fp.y} L${tp.cx},${tp.y + H}`;

    // 여기까지 안 걸렸다면 행·열이 모두 다른 "대각선 이동" → 직선 대신 부드러운 곡선(Q)으로 연결.
    if (dy > 0) {
      // 아래쪽 행으로 갈 때: 출발 노드 "하단 중앙"에서 시작.
      const sx = fp.cx, sy = fp.y + H; // sx,sy = 곡선 시작점(start)
      // 도착 노드로 옆에서 진입: dx>0(오른쪽으로 가면) 도착의 왼쪽 변, dx<0이면 오른쪽 변으로 들어감.
      //  [삼항 연산자] 조건 ? 참일때값 : 거짓일때값  — if를 한 줄로 줄여 쓰는 문법.
      const ex = dx > 0 ? tp.x : tp.x + W, ey = tp.cy; // ex,ey = 곡선 끝점(end)
      // 제어점을 (sx, ey)로 두면 "아래로 내려갔다가 옆으로 꺾이는" ㄴ자 느낌의 곡선이 됩니다.
      return `M${sx},${sy} Q${sx},${ey} ${ex},${ey}`;
    }
    // 위쪽 행으로 갈 때(dy<0): 출발 노드의 옆변 중앙에서 시작.
    //  dx>0이면 출발의 오른쪽 변, 아니면 왼쪽 변에서 출발.
    const sx = dx > 0 ? fp.x + W : fp.x, sy = fp.cy;
    // 도착 노드의 "하단 중앙"으로 들어갑니다(위 칸이므로 아래쪽에서 위로 꽂힘).
    const ex = tp.cx, ey = tp.y + H;
    // 제어점을 (ex, sy)로 두어 "옆으로 갔다가 위로 올라가는" 곡선을 만듭니다.
    return `M${sx},${sy} Q${ex},${sy} ${ex},${ey}`;
  };

  // 화살표 머리(화살촉) 마커의 고유 id를 만듭니다.
  //  [중요/주의] 한 페이지에 여러 FlowDiagram이 동시에 그려질 수 있으므로,
  //   projectId를 붙여 id를 서로 다르게 합니다(예: "arr-1", "arr-2").
  //   같은 id를 여러 곳에서 쓰면 SVG 마커가 충돌해 색·모양이 엉킬 수 있습니다.
  const mid = `arr-${projectId}`;

  // [React 개념] 아래 return 안의 < > 문법이 JSX입니다.
  //   JSX는 "자바스크립트 안에 HTML/SVG처럼 보이는 화면 구조"를 적는 문법으로,
  //   빌드 시 실제 화면 요소로 변환됩니다. 중괄호 { } 안에는 JS 값/식을 넣을 수 있습니다.
  return (
    // viewBox = "이 SVG의 내부 좌표계 크기". 위에서 계산한 svgW/svgH로 그림 영역을 잡습니다.
    //  className은 CSS 클래스 지정(스타일은 별도 CSS 파일에서). HTML의 class와 같은 역할인데
    //  JSX에서는 'class'가 예약어라 'className'으로 씁니다(초보가 자주 헷갈리는 지점).
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="flow-diagram-svg">
      {/* defs = "재사용할 정의를 모아두는 곳". 여기 둔 marker를 아래 path들이 가져다 씁니다. */}
      <defs>
        {/* 화살표 끝에 붙는 삼각형 화살촉 정의.
            refX/refY는 화살촉의 "기준점"(선 끝에 맞춰 붙는 위치),
            orient="auto"는 선이 향하는 방향에 맞춰 화살촉을 자동 회전시킵니다. */}
        <marker id={mid} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          {/* polygon = 점들을 이어 만든 다각형. 세 점으로 작은 삼각형(화살촉)을 그립니다. */}
          <polygon points="0,0 8,3 0,6" fill={color} fillOpacity="0.7" />
        </marker>
      </defs>
      {/* [화살표 그리기] arrows 배열을 .map으로 돌며 각 화살표를 <path>로 변환합니다.
          [React 개념] 배열을 화면 요소 목록으로 바꿀 때는 .map을 씁니다.
          두 번째 인자 i는 인덱스(순번)로, 아래 key에 사용합니다. */}
      {arrows.map((a, i) => {
        // 이 화살표의 그리기 명령 문자열을 계산합니다(없으면 null).
        const d = arrowPath(a);
        // [삼항 연산자] d가 있을 때만 <path>를 그리고, null이면 아무것도 안 그립니다(렌더 생략).
        //  key는 React가 목록의 각 항목을 구분하기 위해 꼭 필요한 고유 식별자입니다.
        //  markerEnd로 선의 "끝"에 위에서 정의한 화살촉(mid)을 붙입니다. url(#id) 형식 주의.
        return d ? <path key={i} d={d} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.45" markerEnd={`url(#${mid})`} /> : null;
      })}
      {/* [노드 그리기] nodes 배열을 돌며 각 노드를 "상자 + 글자" 묶음으로 그립니다. */}
      {nodes.map(n => {
        // 이 노드의 픽셀 좌표(모서리·중심)를 계산합니다.
        const p = np(n);
        return (
          // <g>는 SVG의 "그룹" 태그. 상자와 글자들을 하나로 묶어 관리합니다.
          //  여기서는 노드 id가 고유하므로 key로 사용합니다.
          <g key={n.id}>
            {/* 노드 배경 사각형. rx={10}은 모서리를 둥글게(반지름 10px) 만듭니다. */}
            <rect x={p.x} y={p.y} width={W} height={H} rx={10} fill="#fff" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
            {/* 주 라벨(큰 글씨).
                [삼항 연산자] sub(보조 글씨)가 있으면 y를 살짝 위로(cy-7) 올려 두 줄 공간을 확보하고,
                없으면 거의 중앙(cy+1)에 둡니다.
                textAnchor="middle" + dominantBaseline="middle" = 글자를 (x,y) 기준 가로·세로 중앙 정렬. */}
            <text x={p.cx} y={n.sub ? p.cy - 7 : p.cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11.5" fontWeight="600" fill="#1f2937">{n.label}</text>
            {/* 보조 라벨(작은 회색 글씨).
                [조건부 렌더링] {n.sub && <text .../>} 는 "sub가 있을 때만 <text>를 그린다"는 뜻.
                && 앞이 거짓(빈 값)이면 뒤를 그리지 않습니다(React에서 흔한 조건 표시 패턴). */}
            {n.sub && <text x={p.cx} y={p.cy + 9} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill="#9ca3af">{n.sub}</text>}
          </g>
        );
      })}
    </svg>
  );
};

// [모듈 개념] default export = 이 파일의 "대표 내보내기".
//   다른 파일에서 import FlowDiagram from './FlowDiagram' 처럼 원하는 이름으로 가져올 수 있습니다.
export default FlowDiagram;
