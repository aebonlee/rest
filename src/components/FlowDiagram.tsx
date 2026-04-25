import { type ReactElement } from 'react';

interface Node { id: string; label: string; sub?: string; row: number; col: number }
interface Arrow { from: string; to: string }
interface Config { nodes: Node[]; arrows: Arrow[] }

const W = 148, H = 52, GX = 38, GY = 30, P = 16;

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

interface Props { projectId: number; color: string }

const FlowDiagram = ({ projectId, color }: Props): ReactElement | null => {
  const cfg = DIAGRAMS[projectId];
  if (!cfg) return null;

  const { nodes, arrows } = cfg;
  const map = Object.fromEntries(nodes.map(n => [n.id, n]));
  const maxCol = Math.max(...nodes.map(n => n.col));
  const maxRow = Math.max(...nodes.map(n => n.row));
  const svgW = (maxCol + 1) * (W + GX) - GX + P * 2;
  const svgH = (maxRow + 1) * (H + GY) - GY + P * 2;

  const np = (n: Node) => ({
    x: P + n.col * (W + GX),
    y: P + n.row * (H + GY),
    cx: P + n.col * (W + GX) + W / 2,
    cy: P + n.row * (H + GY) + H / 2,
  });

  const arrowPath = (a: Arrow): string | null => {
    const f = map[a.from], t = map[a.to];
    if (!f || !t) return null;
    const fp = np(f), tp = np(t);
    const dx = t.col - f.col, dy = t.row - f.row;

    if (dy === 0 && dx > 0) return `M${fp.x + W},${fp.cy} L${tp.x},${tp.cy}`;
    if (dy === 0 && dx < 0) return `M${fp.x},${fp.cy} L${tp.x + W},${tp.cy}`;
    if (dx === 0 && dy > 0) return `M${fp.cx},${fp.y + H} L${tp.cx},${tp.y}`;
    if (dx === 0 && dy < 0) return `M${fp.cx},${fp.y} L${tp.cx},${tp.y + H}`;

    if (dy > 0) {
      const sx = fp.cx, sy = fp.y + H;
      const ex = dx > 0 ? tp.x : tp.x + W, ey = tp.cy;
      return `M${sx},${sy} Q${sx},${ey} ${ex},${ey}`;
    }
    const sx = dx > 0 ? fp.x + W : fp.x, sy = fp.cy;
    const ex = tp.cx, ey = tp.y + H;
    return `M${sx},${sy} Q${ex},${sy} ${ex},${ey}`;
  };

  const mid = `arr-${projectId}`;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="flow-diagram-svg">
      <defs>
        <marker id={mid} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0,0 8,3 0,6" fill={color} fillOpacity="0.7" />
        </marker>
      </defs>
      {arrows.map((a, i) => {
        const d = arrowPath(a);
        return d ? <path key={i} d={d} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.45" markerEnd={`url(#${mid})`} /> : null;
      })}
      {nodes.map(n => {
        const p = np(n);
        return (
          <g key={n.id}>
            <rect x={p.x} y={p.y} width={W} height={H} rx={10} fill="#fff" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
            <text x={p.cx} y={n.sub ? p.cy - 7 : p.cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="11.5" fontWeight="600" fill="#1f2937">{n.label}</text>
            {n.sub && <text x={p.cx} y={p.cy + 9} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill="#9ca3af">{n.sub}</text>}
          </g>
        );
      })}
    </svg>
  );
};

export default FlowDiagram;
