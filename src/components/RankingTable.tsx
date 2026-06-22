/**
 * RankingTable.tsx — 프로젝트 평가 전체 등수표(순위 테이블)
 *
 * [역할]
 *  - 사전평가/결과평가 집계표에서 공용으로 쓰는 "전체 팀 순위 표"를 그린다.
 *  - 한 행 = 한 팀. 컬럼: 순위 · 팀 · 프로젝트명 · (항목별 평균…) · 총점 평균 · 평가 건수.
 *  - 순위는 총점 평균 기준 표준 순위(동점은 같은 순위, 다음은 건너뜀: 1,2,2,4…).
 *
 * [왜 컴포넌트로 분리?]
 *  - 사전(5항목)·결과(10항목) 두 페이지가 표 구조는 동일하고 "항목 목록·만점"만 다르다.
 *    데이터 모양을 일반화한 props로 받아 한 곳에서 그려 중복을 없앤다.
 *
 * [입력 데이터 모양]
 *  - rows: 이미 총점 평균 내림차순으로 정렬된 팀 목록.
 *    각 행은 { project, avgBy(항목별 평균), avgTotal(총점 평균), count(평가 건수) }.
 *  - criteria: 표의 항목 컬럼 정의(key·짧은 라벨). avgBy의 key와 매칭해 값을 찾는다.
 *
 * [주요 export]
 *  - default RankingTable
 */
import { type ReactElement } from 'react';

// 한 팀의 한 항목 평균.
type AvgItem = { key: string; label: string; avg: number };

// 표에 들어갈 한 팀(행)의 데이터.
export interface RankingRow {
  project: { id: number; title: string; color: string; members?: string[] };
  avgBy: AvgItem[];
  avgTotal: number;
  count: number;
}

interface RankingTableProps {
  rows: RankingRow[];                              // 총점 평균 내림차순으로 정렬된 팀들
  criteria: { key: string; label: string }[];      // 항목 컬럼(짧은 라벨)
  maxPerCriterion: number;                         // 항목 만점(사전 20 / 결과 10)
  maxTotal: number;                                // 총점 만점(100)
  highlightId?: number | null;                     // 강조할 팀(선택 팀)
  onRowClick?: (id: number) => void;               // 행 클릭 시 콜백(상세로 이동 등)
  showMembers?: boolean;                           // 팀원 컬럼 표시 여부(관리자 화면)
}

// 1·2·3위 메달색, 그 외 회색.
const medalBg = (rank: number): string =>
  rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#c2812f' : 'var(--bg-light-gray)';
const medalFg = (rank: number): string => (rank <= 3 ? '#fff' : 'var(--text-secondary)');

// 표준 경쟁 순위: 자기보다 총점 평균이 "확실히 높은" 팀 수 + 1 (동점은 같은 순위).
const rankFor = (rows: RankingRow[], i: number): number =>
  1 + rows.filter((r) => r.avgTotal > rows[i].avgTotal + 1e-9).length;

const RankingTable = ({
  rows, criteria, maxPerCriterion, maxTotal, highlightId, onRowClick, showMembers = false,
}: RankingTableProps): ReactElement => {
  const th: React.CSSProperties = {
    padding: '11px 10px', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)',
    textAlign: 'center', whiteSpace: 'nowrap', borderBottom: '2px solid var(--border-light)', background: 'var(--bg-light-gray)',
  };
  const td: React.CSSProperties = {
    padding: '10px', fontSize: '13.5px', textAlign: 'center', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap', verticalAlign: 'top',
  };
  // 주제(프로젝트명)·팀원은 줄바꿈으로 전부 보이게(한글은 단어 단위로 끊기).
  const tdWrap: React.CSSProperties = {
    ...td, whiteSpace: 'normal', wordBreak: 'keep-all', overflowWrap: 'anywhere', textAlign: 'left', lineHeight: 1.45, verticalAlign: 'top',
  };

  // 프로젝트(주제) 컬럼은 가변폭이지만, 표가 가로로만 늘지 않게 항목 컬럼 최소폭만 합산.
  const minWidth = 200 + (showMembers ? 150 : 0) + criteria.length * 64 + 180;

  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '14px', background: 'var(--bg-white)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${minWidth}px`, tableLayout: 'auto' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: '60px' }}>순위</th>
            <th style={{ ...th, width: '56px' }}>팀</th>
            <th style={{ ...th, textAlign: 'left', minWidth: '220px' }}>{showMembers ? '주제' : '프로젝트'}</th>
            {showMembers && <th style={{ ...th, textAlign: 'left', minWidth: '130px' }}>팀원</th>}
            {criteria.map((c) => (
              <th key={c.key} style={th} title={`${c.label} (만점 ${maxPerCriterion})`}>{c.label}</th>
            ))}
            <th style={{ ...th, color: 'var(--primary-blue)' }}>총점평균</th>
            <th style={th}>평가</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const rank = rankFor(rows, i);
            const on = r.project.id === highlightId;
            return (
              <tr
                key={r.project.id}
                onClick={onRowClick ? () => onRowClick(r.project.id) : undefined}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  background: on ? 'var(--bg-light-gray)' : 'transparent',
                }}
              >
                {/* 순위 메달 */}
                <td style={td}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: medalBg(rank), color: medalFg(rank), fontWeight: 800, fontSize: '13px',
                  }}>{rank}</span>
                </td>
                {/* 팀 번호 */}
                <td style={{ ...td, fontWeight: 800, color: r.project.color, verticalAlign: 'top' }}>{r.project.id}팀</td>
                {/* 주제(프로젝트명) — 줄바꿈으로 전부 표시 */}
                <td style={tdWrap}>{r.project.title}</td>
                {/* 팀원(관리자 화면) */}
                {showMembers && (
                  <td style={{ ...tdWrap, fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {r.project.members && r.project.members.length > 0 ? r.project.members.join(', ') : '—'}
                  </td>
                )}
                {/* 항목별 평균 */}
                {criteria.map((c) => {
                  const avg = r.avgBy.find((a) => a.key === c.key)?.avg ?? 0;
                  return <td key={c.key} style={{ ...td, color: 'var(--text-secondary)' }}>{avg.toFixed(1)}</td>;
                })}
                {/* 총점 평균 */}
                <td style={{ ...td }}>
                  <strong style={{ fontSize: '16px', color: r.project.color }}>{r.avgTotal.toFixed(1)}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}> / {maxTotal}</span>
                </td>
                {/* 평가 건수 */}
                <td style={{ ...td, color: 'var(--text-secondary)' }}>{r.count}건</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;
