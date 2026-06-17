import type { ReactElement } from 'react';
import SEOHead from '../../components/SEOHead';

/* 컴퓨팅 사고 7단계 (발표 포함) — 합계 100점 */
const CT_STEPS = [
  { id: 'recognition', label: '문제 인식', color: '#DC2626', score: 15 },
  { id: 'definition', label: '문제 정의', color: '#EA580C', score: 10 },
  { id: 'decomposition', label: '문제 분해', color: '#F59E0B', score: 10 },
  { id: 'abstraction', label: '추상화', color: '#059669', score: 20 },
  { id: 'algorithm', label: '알고리즘 설계', color: '#2563EB', score: 20 },
  { id: 'implementation', label: '구현', color: '#7C3AED', score: 15 },
  { id: 'presentation', label: '결과 시연/발표', color: '#0891B2', score: 10 },
];

/* 평가 루브릭 (총 100점) */
const RUBRIC = [
  { step: '문제 인식', a: '실제 상황의 불편함을 명확하고 구체적으로 설명함', b: '문제 상황은 제시되나 맥락 설명이 다소 부족함', c: '문제 상황이 모호하거나 불명확함', score: 15 },
  { step: '문제 정의', a: '해결 목표가 구체적이며 달성 가능하게 정의됨', b: '목표는 있으나 다소 포괄적임', c: '목표가 불분명하거나 문제와 연결되지 않음', score: 10 },
  { step: '문제 분해', a: '문제를 논리적으로 2개 이상 명확히 분해함', b: '문제 분해는 있으나 논리 연결이 약함', c: '문제 분해가 거의 없거나 형식적임', score: 10 },
  { step: '추상화', a: '불필요한 요소를 제거하고 핵심 데이터/패턴을 잘 도출함', b: '핵심 요소는 있으나 추상화 수준이 낮음', c: '핵심 요소 도출이 되지 않음', score: 20 },
  { step: '알고리즘 설계', a: '단계별 절차가 명확하며 흐름이 논리적임', b: '전반적 흐름은 있으나 일부 단계가 불명확함', c: '절차가 혼란스럽거나 논리성이 부족함', score: 20 },
  { step: '구현', a: '결과물이 목표에 맞게 정상적으로 동작함', b: '일부 오류 또는 누락이 있으나 의도 파악 가능함', c: '코드가 불완전하거나 동작하지 않음', score: 15 },
  { step: '결과 시연/발표', a: '주요 핵심을 조리있게 발표', b: '일부 기능만 동작하거나 설명에 의존함', c: '동작불가로 결과 시연 못함', score: 10 },
];

const TOTAL = RUBRIC.reduce((s, r) => s + r.score, 0);

const ProcessDiagram = (): ReactElement => (
  <svg viewBox="0 0 868 110" style={{ width: '100%', maxWidth: 868, display: 'block', margin: '0 auto' }}>
    {CT_STEPS.map((step, i) => {
      const x = i * 124;
      const w = 112;
      return (
        <g key={step.id}>
          <rect x={x} y={10} width={w} height={88} rx={14} fill={step.color} opacity={0.1} stroke={step.color} strokeWidth={2} />
          <circle cx={x + w / 2} cy={36} r={14} fill={step.color} />
          <text x={x + w / 2} y={41} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">{i + 1}</text>
          <text x={x + w / 2} y={68} textAnchor="middle" fontSize={12} fontWeight={700} fill={step.color}>{step.label}</text>
          <text x={x + w / 2} y={86} textAnchor="middle" fontSize={11} fill="#999">{step.score}점</text>
          {i < CT_STEPS.length - 1 && (
            <path d={`M${x + w + 2},54 L${x + w + 11},54 L${x + w + 8},48 L${x + w + 16},54 L${x + w + 8},60 L${x + w + 11},54`} fill={step.color} opacity={0.6} />
          )}
        </g>
      );
    })}
  </svg>
);

const th: React.CSSProperties = { padding: '12px 14px', textAlign: 'left', fontSize: '13.5px', fontWeight: 800, borderBottom: '2px solid var(--border-light)', background: 'var(--bg-light-gray)' };
const td: React.CSSProperties = { padding: '12px 14px', fontSize: '14px', borderBottom: '1px solid var(--border-light)', verticalAlign: 'top', lineHeight: 1.6 };

const PblRubric = (): ReactElement => {
  return (
    <>
      <SEOHead title="PBL 활동 · 평가 루브릭" path="/pbl/rubric" />

      <section className="page-header">
        <div className="container">
          <h2>평가 루브릭</h2>
          <p>컴퓨팅 사고 7단계 프로세스 기반 평가 기준 (총 {TOTAL}점)</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* 7단계 프로세스 */}
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>컴퓨팅 사고 7단계 프로세스 ({TOTAL}점)</h3>
          <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border-light)', borderRadius: '14px', padding: '20px', marginBottom: '32px', overflowX: 'auto' }}>
            <ProcessDiagram />
          </div>

          {/* 루브릭 표 */}
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>평가 루브릭 (총 {TOTAL}점)</h3>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px', background: 'var(--bg-white)' }}>
              <thead>
                <tr>
                  <th style={{ ...th, width: '130px' }}>평가 영역</th>
                  <th style={th}>A (우수)</th>
                  <th style={th}>B (보통)</th>
                  <th style={th}>C (미흡)</th>
                  <th style={{ ...th, width: '70px', textAlign: 'center' }}>배점</th>
                </tr>
              </thead>
              <tbody>
                {RUBRIC.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700, color: CT_STEPS[i].color }}>{r.step}</td>
                    <td style={td}>{r.a}</td>
                    <td style={td}>{r.b}</td>
                    <td style={td}>{r.c}</td>
                    <td style={{ ...td, textAlign: 'center', fontWeight: 800 }}>{r.score}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...td, fontWeight: 800, background: 'var(--bg-light-gray)' }} colSpan={4}>합계</td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 900, background: 'var(--bg-light-gray)' }}>{TOTAL}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};

export default PblRubric;
