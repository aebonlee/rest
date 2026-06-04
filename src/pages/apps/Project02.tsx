import { useState, useMemo, type ReactElement } from 'react';
import AppScaffold from '../../components/AppScaffold';
import { getTeamProject } from '../../data/teamProjects';

const PROJECT = getTeamProject(2)!;

type Cat = '취업' | '주거' | '창업' | '금융' | '교육';

interface Policy {
  name: string; cat: Cat; ageMin: number; ageMax: number; region: string; // '전국' or 시도
  summary: string; link: string;
}

const POLICIES: Policy[] = [
  { name: '청년내일채움공제', cat: '취업', ageMin: 15, ageMax: 34, region: '전국', summary: '중소기업 취업 청년의 목돈 마련을 지원(2년형 만기 지원금).', link: 'https://www.work24.go.kr' },
  { name: '국민취업지원제도', cat: '취업', ageMin: 15, ageMax: 34, region: '전국', summary: '취업활동비용·취업지원서비스 제공(구직촉진수당).', link: 'https://www.kua.go.kr' },
  { name: '청년월세 특별지원', cat: '주거', ageMin: 19, ageMax: 34, region: '전국', summary: '무주택 청년에게 월 최대 20만원, 최대 12개월 월세 지원.', link: 'https://www.bokjiro.go.kr' },
  { name: '중소기업 취업청년 전월세보증금 대출', cat: '주거', ageMin: 19, ageMax: 34, region: '전국', summary: '연 1%대 저금리로 전월세 보증금 대출 지원.', link: 'https://nhuf.molit.go.kr' },
  { name: '청년창업사관학교', cat: '창업', ageMin: 19, ageMax: 39, region: '전국', summary: '예비·초기 창업자에게 사업화 자금과 보육 공간 지원.', link: 'https://start.kosmes.or.kr' },
  { name: '청년 창업중심대학', cat: '창업', ageMin: 19, ageMax: 39, region: '전국', summary: '대학 중심 창업 인프라·사업화 자금·멘토링 제공.', link: 'https://www.k-startup.go.kr' },
  { name: '청년도약계좌', cat: '금융', ageMin: 19, ageMax: 34, region: '전국', summary: '5년 납입 시 정부기여금+비과세로 목돈 마련 지원.', link: 'https://www.fsc.go.kr' },
  { name: '청년 희망적금 연계 지원', cat: '금융', ageMin: 19, ageMax: 34, region: '전국', summary: '저축 장려금과 우대금리로 자산 형성을 돕는 적금.', link: 'https://www.fsc.go.kr' },
  { name: 'K-디지털 트레이닝', cat: '교육', ageMin: 15, ageMax: 34, region: '전국', summary: 'AI·SW 등 신기술 분야 무료 부트캠프 훈련 지원.', link: 'https://www.hrd.go.kr' },
  { name: '내일배움카드', cat: '교육', ageMin: 15, ageMax: 99, region: '전국', summary: '직업훈련비를 카드 형태로 지원(1인 최대 300~500만원).', link: 'https://www.hrd.go.kr' },
  { name: '서울 청년수당', cat: '취업', ageMin: 19, ageMax: 34, region: '서울', summary: '서울 거주 미취업 청년에게 월 50만원, 최대 6개월 활동지원금.', link: 'https://youth.seoul.go.kr' },
  { name: '경기 청년기본소득', cat: '금융', ageMin: 24, ageMax: 24, region: '경기', summary: '경기 거주 만 24세 청년에게 분기별 지역화폐 지급.', link: 'https://apply.jobaba.net' },
];

const CATS: Cat[] = ['취업', '주거', '창업', '금융', '교육'];
const REGIONS = ['전국', '서울', '경기', '인천', '부산', '대구', '기타'];

const Project02 = (): ReactElement => {
  const [age, setAge] = useState(25);
  const [region, setRegion] = useState('서울');
  const [cats, setCats] = useState<Set<Cat>>(new Set(CATS));
  const [searched, setSearched] = useState(false);

  const toggleCat = (c: Cat) => setCats((prev) => {
    const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n;
  });

  const results = useMemo(() => POLICIES.filter((p) =>
    age >= p.ageMin && age <= p.ageMax &&
    cats.has(p.cat) &&
    (p.region === '전국' || p.region === region)
  ), [age, region, cats]);

  const chip = (active: boolean) => ({
    padding: '8px 14px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', borderRadius: '999px',
    border: '1px solid', borderColor: active ? PROJECT.color : 'var(--border-light, #e5e7eb)',
    background: active ? PROJECT.color : 'var(--bg-white, #fff)', color: active ? '#fff' : 'var(--text-secondary, #6b7280)',
  });

  return (
    <AppScaffold project={PROJECT}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700 }}>나이 <span style={{ color: PROJECT.color }}>{age}세</span></label>
            <input type="range" min={15} max={45} value={age} onChange={(e) => setAge(Number(e.target.value))} style={{ width: '100%', marginTop: '10px', accentColor: PROJECT.color }} />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontSize: '14px', fontWeight: 700 }}>거주 지역</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%', marginTop: '8px', padding: '10px 12px', fontSize: '14px', borderRadius: '10px', border: '1px solid var(--border-light, #e5e7eb)' }}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: 700 }}>관심 분야</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {CATS.map((c) => <button key={c} type="button" onClick={() => toggleCat(c)} style={chip(cats.has(c))}>{c}</button>)}
          </div>
        </div>

        <button type="button" onClick={() => setSearched(true)} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 22px', fontSize: '15px' }}>
          🔎 맞춤 정책 찾기
        </button>

        {searched && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              {age}세 · {region} 기준 — <span style={{ color: PROJECT.color }}>{results.length}건</span>의 정책을 찾았어요
            </div>
            {results.length === 0 ? (
              <p className="empty-message">조건에 맞는 정책이 없습니다. 분야를 더 선택해 보세요.</p>
            ) : results.map((p) => (
              <div key={p.name} style={{ padding: '16px 18px', borderRadius: '12px', background: 'var(--bg-light-gray, #f8f9fa)', border: '1px solid var(--border-light, #eef0f2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', background: PROJECT.color, padding: '2px 9px', borderRadius: '999px' }}>{p.cat}</span>
                  <strong style={{ fontSize: '15.5px' }}>{p.name}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary, #9ca3af)' }}>{p.region} · {p.ageMin}~{p.ageMax}세</span>
                </div>
                <p style={{ margin: '8px 0 6px', fontSize: '14px', lineHeight: 1.7 }}>{p.summary}</p>
                <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', fontWeight: 600, color: PROJECT.color, textDecoration: 'none' }}>자세히 보기 →</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppScaffold>
  );
};

export default Project02;
