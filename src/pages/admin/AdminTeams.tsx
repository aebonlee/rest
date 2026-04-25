import { useState, useEffect, type ReactElement } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import SEOHead from '../../components/SEOHead';
import getSupabase from '../../utils/supabase';
import site from '../../config/site';
import type { Team } from '../../types';

const TABLES = { teams: `${site.dbPrefix}teams` };

const AdminTeams = (): ReactElement => {
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
      <SEOHead title="팀 편성 관리" path="/admin/teams" noindex />
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-content">
          <h2>팀 편성 관리</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : teams.length > 0 ? (
            <div className="teams-grid">
              {teams.map(team => (
                <div key={team.id} className="team-card">
                  <h3>{team.name}</h3>
                  <p>{team.project_topic || team.description}</p>
                  <div className="team-members"><h4>팀원 ({(Array.isArray(team.members) ? team.members : []).length}명)</h4>
                    <ul>{(Array.isArray(team.members) ? team.members : []).map((m, i) => <li key={i}>{m.name} {m.role && `(${m.role})`}</li>)}</ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">팀이 아직 편성되지 않았습니다.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminTeams;
