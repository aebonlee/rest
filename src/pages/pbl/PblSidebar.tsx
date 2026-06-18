import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import { PBL_STAGES, autoStagePoints } from '../../config/pblActivity';

interface Props {
  active: string; // 'info' | stage.key | 'rubric'
  auto?: Record<string, number>;
  scores?: Record<string, number>;
}

// 메뉴 한 줄: 메뉴명(왼쪽 정렬) · 점수(오른쪽 정렬). 이모지 없이 텍스트만.
const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
};
const nameStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'left',
  fontSize: '14px',
};
const scoreStyle: React.CSSProperties = {
  flexShrink: 0,
  textAlign: 'right',
  whiteSpace: 'nowrap',
  fontSize: '12px',
};

const PblSidebar = ({ active, auto, scores }: Props): ReactElement => (
  <aside className="sidebar">
    <nav className="sidebar-menu">
      <Link to="/pbl/info" className={`sidebar-item ${active === 'info' ? 'active' : ''}`} style={linkStyle}>
        <span style={nameStyle}>기본정보 &amp; 평가점수</span>
      </Link>

      {PBL_STAGES.map((s, i) => {
        const a = auto?.[s.key];
        const t = scores?.[s.key];
        const on = active === s.key;
        const hasScore = typeof a === 'number' || typeof t === 'number';
        return (
          <Link key={s.key} to={`/pbl/${s.key}`} className={`sidebar-item ${on ? 'active' : ''}`} style={linkStyle}>
            <span style={nameStyle}>{i + 1}. {s.label}</span>
            <span style={{ ...scoreStyle, opacity: on ? 0.95 : 0.7 }}>
              {hasScore ? (
                <>
                  {typeof a === 'number' && `${autoStagePoints(a, s.max)}/${s.max}`}
                  {typeof t === 'number' && `${typeof a === 'number' ? ' · ' : ''}강사 ${t}/${s.max}`}
                </>
              ) : `${s.max}점`}
            </span>
          </Link>
        );
      })}

      <Link to="/pbl/rubric" className={`sidebar-item ${active === 'rubric' ? 'active' : ''}`} style={linkStyle}>
        <span style={nameStyle}>평가 루브릭</span>
      </Link>
    </nav>
  </aside>
);

export default PblSidebar;
