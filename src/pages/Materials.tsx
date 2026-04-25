import { useState, useEffect, type ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Material } from '../types';

const TABLES = { materials: `${site.dbPrefix}materials` };

const categoryLabels: Record<string, string> = {
  all: '전체', prerequisite: '선수과정', ai_basic: 'AI기본', llm_practice: 'LLM실습',
  automation: '자동화', planning: '기획', design: '설계', implementation: '구현',
  debugging: '디버깅', coaching: '코칭',
};

const Materials = (): ReactElement => {
  useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      if (!client) { setLoading(false); return; }
      const { data } = await client.from(TABLES.materials).select('*').order('day_number').order('created_at', { ascending: false });
      if (data) setMaterials(data as Material[]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = activeCategory === 'all' ? materials : materials.filter(m => m.category === activeCategory);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <>
      <SEOHead title="학습자료" path="/materials" noindex />
      <section className="page-header">
        <div className="container">
          <h2>학습자료</h2>
          <p>과정별 학습자료를 다운로드할 수 있습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="curriculum-filter">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button key={key} className={`filter-btn ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}>{label}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length > 0 ? (
            <div className="materials-list">
              {filtered.map((m) => (
                <div key={m.id} className="material-card">
                  <div className="material-icon">
                    {m.file_type === 'pdf' ? '📄' : m.file_type === 'zip' ? '📦' : m.file_type === 'pptx' ? '📊' : '📁'}
                  </div>
                  <div className="material-info">
                    <h4>{m.title}</h4>
                    <p>{m.description}</p>
                    <div className="material-meta">
                      <span>Day {m.day_number}</span>
                      <span>{categoryLabels[m.category] || m.category}</span>
                      <span>{formatFileSize(m.file_size)}</span>
                    </div>
                  </div>
                  {m.file_url && (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      다운로드
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>등록된 학습자료가 없습니다.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Materials;
