import { useState, useEffect, type ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Team } from '../types';

const TABLES = { teams: `${site.dbPrefix}teams` };

const Teams = (): ReactElement => {
  useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client) { setLoading(false); return; }
      const { data } = await client.from(TABLES.teams).select('*').order('created_at');
      if (data) setTeams(data as Team[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <SEOHead title="팀" path="/teams" noindex />
      <section className="page-header">
        <div className="container">
          <h2>팀 구성</h2>
          <p>프로젝트 팀 정보입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : teams.length > 0 ? (
            <div className="teams-grid">
              {teams.map(team => (
                <div key={team.id} className="team-card">
                  <h3 className="team-name">{team.name}</h3>
                  <p className="team-topic">{team.project_topic || team.description}</p>
                  <div className="team-members">
                    <h4>팀원</h4>
                    <ul>
                      {(Array.isArray(team.members) ? team.members : []).map((m, i) => (
                        <li key={i}>
                          <span className="member-name">{m.name}</span>
                          {m.role && <span className="member-role">{m.role}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>팀이 아직 편성되지 않았습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Teams;
