import { Link } from 'react-router-dom';
import type { ReactElement } from 'react';
import { PBL_STAGES, autoStagePoints } from '../../config/pblActivity';

interface Props {
  active: string; // 'info' | stage.key | 'rubric'
  auto?: Record<string, number>;
  scores?: Record<string, number>;
}

const linkStyle: React.CSSProperties = { textDecoration: 'none' };

const PblSidebar = ({ active, auto, scores }: Props): ReactElement => (
  <aside className="sidebar">
    <nav className="sidebar-menu">
      <Link to="/pbl/info" className={`sidebar-item ${active === 'info' ? 'active' : ''}`} style={linkStyle}>
        <span className="sidebar-item-icon">📋</span>
        <span className="sidebar-item-text">기본정보 &amp; 평가점수</span>
      </Link>

      {PBL_STAGES.map((s, i) => {
        const a = auto?.[s.key];
        const t = scores?.[s.key];
        const on = active === s.key;
        const hasScore = typeof a === 'number' || typeof t === 'number';
        return (
          <Link key={s.key} to={`/pbl/${s.key}`} className={`sidebar-item ${on ? 'active' : ''}`} style={linkStyle}>
            <span className="sidebar-item-icon">{s.icon}</span>
            <span className="sidebar-item-text" style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: '14.5px' }}>{i + 1}. {s.label}</span>
              <span style={{ fontSize: '11.5px', opacity: on ? 0.9 : 0.7 }}>
                {hasScore ? (
                  <>
                    {typeof a === 'number' && `${autoStagePoints(a, s.max)}/${s.max}`}
                    {typeof t === 'number' && `${typeof a === 'number' ? ' · ' : ''}강사 ${t}/${s.max}`}
                  </>
                ) : `${s.max}점`}
              </span>
            </span>
          </Link>
        );
      })}

      <Link to="/pbl/rubric" className={`sidebar-item ${active === 'rubric' ? 'active' : ''}`} style={linkStyle}>
        <span className="sidebar-item-icon">📊</span>
        <span className="sidebar-item-text">평가 루브릭</span>
      </Link>
    </nav>
  </aside>
);

export default PblSidebar;
