/**
 * FlowDiagram.tsx
 * ------------------------------------------------------------------
 * 역할/책임:
 *   - 프로젝트(projectId)별로 사전에 정의된 "AI 파이프라인 흐름도"를
 *     SVG로 렌더링하는 프레젠테이션 전용 컴포넌트.
 *   - 노드(상자) 배치와 노드 간 연결(화살표 경로)을 격자 좌표(row/col)
 *     기반으로 자동 계산하여 그린다. (외부 데이터/네트워크/상태 없음)
 *
 * 주요 export:
 *   - default export: FlowDiagram 컴포넌트
 *
 * 동작 개요:
 *   - DIAGRAMS 사전에서 projectId에 해당하는 노드/화살표 설정을 찾는다.
 *   - 격자 좌표를 픽셀 좌표로 변환(np)하고, 두 노드 관계(상대 row/col 차)에
 *     따라 직선 또는 2차 베지어(Q) 곡선 경로를 만든다(arrowPath).
 *   - 일치하는 projectId가 없으면 null을 반환(렌더링하지 않음).
 * ------------------------------------------------------------------
 */
import { type ReactElement } from 'react';

// 단일 노드(흐름도 상자) 정의: id(고유키), label(주 텍스트), sub(보조 텍스트, 선택),
// row/col(격자 위치 인덱스, 0부터 시작)
interface Node { id: string; label: string; sub?: string; row: number; col: number }
// 노드 간 연결(화살표): from→to 는 노드 id를 가리킨다.
interface Arrow { from: string; to: string }
// 하나의 다이어그램 구성: 노드 목록 + 화살표 목록
interface Config { nodes: Node[]; arrows: Arrow[] }

// 레이아웃 상수(픽셀 단위):
//  W: 노드 너비, H: 노드 높이, GX: 열 간격(가로 갭), GY: 행 간격(세로 갭), P: 캔버스 안쪽 여백(padding)
const W = 148, H = 52, GX = 38, GY = 30, P = 16;

// 프로젝트 ID(1~7)별 흐름도 정의 사전.
// 각 정의는 노드의 격자 좌표(row/col)와 노드 간 연결(arrows)로 구성된다.
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

// 컴포넌트 props: 그릴 다이어그램의 projectId와 노드/화살표에 적용할 색상(color)
interface Props { projectId: number; color: string }

/**
 * FlowDiagram
 * projectId에 매핑된 흐름도를 SVG로 렌더링한다.
 * @param projectId 렌더링할 다이어그램 키(DIAGRAMS의 키, 1~7)
 * @param color     화살표/노드 테두리/마커에 사용할 색상
 * @returns SVG 엘리먼트, 또는 매칭 설정이 없으면 null
 */
const FlowDiagram = ({ projectId, color }: Props): ReactElement | null => {
  // projectId에 해당하는 다이어그램 설정 조회
  const cfg = DIAGRAMS[projectId];
  // 엣지케이스: 정의되지 않은 projectId면 아무것도 렌더링하지 않음
  if (!cfg) return null;

  const { nodes, arrows } = cfg;
  // 노드 id → 노드 객체 빠른 조회용 맵 (화살표 경로 계산 시 from/to를 id로 찾기 위함)
  const map = Object.fromEntries(nodes.map(n => [n.id, n]));
  // 격자의 최대 열/행 인덱스 → SVG 전체 크기 계산에 사용
  const maxCol = Math.max(...nodes.map(n => n.col));
  const maxRow = Math.max(...nodes.map(n => n.row));
  // SVG 뷰박스 크기: (열 개수 × (노드폭+갭)) - 마지막 불필요한 갭 + 양쪽 여백
  const svgW = (maxCol + 1) * (W + GX) - GX + P * 2;
  const svgH = (maxRow + 1) * (H + GY) - GY + P * 2;

  // np: 노드의 격자 좌표(row/col)를 픽셀 좌표로 변환.
  //  x/y = 좌상단 모서리, cx/cy = 중심점 (텍스트 정렬·화살표 시작/끝 계산에 사용)
  const np = (n: Node) => ({
    x: P + n.col * (W + GX),
    y: P + n.row * (H + GY),
    cx: P + n.col * (W + GX) + W / 2,
    cy: P + n.row * (H + GY) + H / 2,
  });

  // arrowPath: 두 노드 사이를 잇는 SVG path의 'd' 문자열을 생성.
  // 노드의 상대 위치(dx: 열 차, dy: 행 차)에 따라 직선 또는 곡선 경로를 만든다.
  const arrowPath = (a: Arrow): string | null => {
    const f = map[a.from], t = map[a.to];
    // 엣지케이스: from/to 중 존재하지 않는 노드를 참조하면 경로 없음
    if (!f || !t) return null;
    const fp = np(f), tp = np(t);
    // dx>0: 오른쪽으로, dx<0: 왼쪽으로 / dy>0: 아래로, dy<0: 위로
    const dx = t.col - f.col, dy = t.row - f.row;

    // 같은 행(dy===0)에서의 수평 직선: 오른쪽으로 이동 시 출발 노드 오른쪽 변→도착 노드 왼쪽 변
    if (dy === 0 && dx > 0) return `M${fp.x + W},${fp.cy} L${tp.x},${tp.cy}`;
    // 같은 행에서 왼쪽으로 이동: 출발 노드 왼쪽 변→도착 노드 오른쪽 변
    if (dy === 0 && dx < 0) return `M${fp.x},${fp.cy} L${tp.x + W},${tp.cy}`;
    // 같은 열(dx===0)에서의 수직 직선: 아래로 이동 시 출발 노드 하단→도착 노드 상단
    if (dx === 0 && dy > 0) return `M${fp.cx},${fp.y + H} L${tp.cx},${tp.y}`;
    // 같은 열에서 위로 이동: 출발 노드 상단→도착 노드 하단
    if (dx === 0 && dy < 0) return `M${fp.cx},${fp.y} L${tp.cx},${tp.y + H}`;

    // 대각선 이동(행·열이 모두 다른 경우): 직각에 가까운 2차 베지어(Q) 곡선으로 연결
    if (dy > 0) {
      // 아래쪽 행으로 갈 때: 출발 노드 하단 중앙에서 시작하여 도착 노드의 좌/우 변으로 꺾여 들어감
      const sx = fp.cx, sy = fp.y + H;
      // dx>0이면 도착 노드 왼쪽 변, dx<0이면 오른쪽 변으로 진입
      const ex = dx > 0 ? tp.x : tp.x + W, ey = tp.cy;
      // 제어점(sx,ey)으로 ㄴ자 형태의 부드러운 곡선 형성
      return `M${sx},${sy} Q${sx},${ey} ${ex},${ey}`;
    }
    // 위쪽 행으로 갈 때(dy<0): 출발 노드 좌/우 변 중앙에서 시작하여 도착 노드 하단으로 진입
    const sx = dx > 0 ? fp.x + W : fp.x, sy = fp.cy;
    const ex = tp.cx, ey = tp.y + H;
    // 제어점(ex,sy)으로 곡선 형성
    return `M${sx},${sy} Q${ex},${sy} ${ex},${ey}`;
  };

  // 화살표 머리(marker) 고유 id. projectId별로 다르게 하여 같은 페이지 내 marker 충돌 방지
  const mid = `arr-${projectId}`;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="flow-diagram-svg">
      <defs>
        {/* 화살표 끝에 붙는 삼각형 마커 정의 (orient="auto"로 경로 방향에 맞춰 회전) */}
        <marker id={mid} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0,0 8,3 0,6" fill={color} fillOpacity="0.7" />
        </marker>
      </defs>
      {/* 화살표(연결선) 렌더링: 각 arrow를 경로 문자열로 변환 후 path로 그림 */}
      {arrows.map((a, i) => {
        const d = arrowPath(a);
        // 경로가 계산된 경우에만 path 출력, markerEnd로 화살표 머리 부착
        return d ? <path key={i} d={d} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.45" markerEnd={`url(#${mid})`} /> : null;
      })}
      {/* 노드(상자 + 텍스트) 렌더링 */}
      {nodes.map(n => {
        const p = np(n);
        return (
          <g key={n.id}>
            {/* 노드 배경 사각형(둥근 모서리) */}
            <rect x={p.x} y={p.y} width={W} height={H} rx={10} fill="#fff" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
            {/* 주 라벨: sub가 있으면 위쪽으로 살짝 올려 두 줄 공간 확보, 없으면 중앙 정렬 */}
            <text x={p.cx} y={n.sub ? p.cy - 7 : p.cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11.5" fontWeight="600" fill="#1f2937">{n.label}</text>
            {/* 보조 라벨(sub): 존재할 때만 주 라벨 아래에 작은 회색 텍스트로 표시 */}
            {n.sub && <text x={p.cx} y={p.cy + 9} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill="#9ca3af">{n.sub}</text>}
          </g>
        );
      })}
    </svg>
  );
};

export default FlowDiagram;
