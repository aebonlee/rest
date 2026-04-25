import { useState, useEffect, type ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Resource } from '../types';

const TABLES = { resources: `${site.dbPrefix}resources` };

const defaultResources: Resource[] = [
  { id: '1', title: 'Solar API', description: 'Upstage Solar LLM API 문서', url: 'https://developers.upstage.ai/', category: 'llm', icon: '☀️', sort_order: 1 },
  { id: '2', title: 'ChatGPT', description: 'OpenAI ChatGPT', url: 'https://chat.openai.com/', category: 'llm', icon: '🤖', sort_order: 2 },
  { id: '3', title: 'Gemini', description: 'Google Gemini AI', url: 'https://gemini.google.com/', category: 'llm', icon: '💎', sort_order: 3 },
  { id: '4', title: 'Claude', description: 'Anthropic Claude AI', url: 'https://claude.ai/', category: 'llm', icon: '🧠', sort_order: 4 },
  { id: '5', title: 'VS Code', description: '코드 에디터', url: 'https://code.visualstudio.com/', category: 'tool', icon: '💻', sort_order: 5 },
  { id: '6', title: 'Cursor', description: 'AI 기반 코드 에디터', url: 'https://cursor.sh/', category: 'tool', icon: '⚡', sort_order: 6 },
  { id: '7', title: 'GitHub', description: '소스코드 관리', url: 'https://github.com/', category: 'tool', icon: '🐙', sort_order: 7 },
  { id: '8', title: 'Supabase', description: 'Backend-as-a-Service', url: 'https://supabase.com/', category: 'tool', icon: '⚡', sort_order: 8 },
  { id: '9', title: 'React 공식 문서', description: 'React 프레임워크 문서', url: 'https://react.dev/', category: 'reference', icon: '⚛️', sort_order: 9 },
  { id: '10', title: 'Vite 공식 문서', description: 'Vite 빌드 도구 문서', url: 'https://vite.dev/', category: 'reference', icon: '⚡', sort_order: 10 },
];

const categoryLabels: Record<string, string> = {
  all: '전체',
  llm: 'LLM/AI',
  tool: '개발 도구',
  reference: '참고 문서',
  tutorial: '튜토리얼',
};

const Resources = (): ReactElement => {
  const { t } = useLanguage();
  const [resources, setResources] = useState<Resource[]>(defaultResources);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const loadResources = async () => {
      const client = getSupabase();
      if (!client) return;
      const { data } = await client.from(TABLES.resources).select('*').order('sort_order');
      if (data && data.length > 0) setResources(data as Resource[]);
    };
    loadResources();
  }, []);

  const filtered = activeCategory === 'all' ? resources : resources.filter(r => r.category === activeCategory);

  return (
    <>
      <SEOHead title="리소스" path="/resources" />

      <section className="page-header">
        <div className="container">
          <h2>{t('site.resources.title')}</h2>
          <p>{t('site.resources.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="curriculum-filter">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button key={key} className={`filter-btn ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}>
                {label}
              </button>
            ))}
          </div>

          <div className="resource-grid">
            {filtered.map((resource) => (
              <a key={resource.id} href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-card">
                <span className="resource-icon">{resource.icon}</span>
                <div className="resource-info">
                  <h4>{resource.title}</h4>
                  <p>{resource.description}</p>
                  <span className="resource-category">{categoryLabels[resource.category] || resource.category}</span>
                </div>
                <span className="resource-arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Resources;
