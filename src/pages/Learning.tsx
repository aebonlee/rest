import { useState, type ReactElement } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import {
  prerequisiteTopics,
  regularTopics,
  coachingTopics,
  type Topic,
} from '../data/learningData';

const phaseMap: Record<string, { topics: Topic[]; titleKey: string; subtitleKey: string }> = {
  prerequisite: {
    topics: prerequisiteTopics,
    titleKey: 'site.learning.prerequisite.title',
    subtitleKey: 'site.learning.prerequisite.subtitle',
  },
  regular: {
    topics: regularTopics,
    titleKey: 'site.learning.regular.title',
    subtitleKey: 'site.learning.regular.subtitle',
  },
  coaching: {
    topics: coachingTopics,
    titleKey: 'site.learning.coaching.title',
    subtitleKey: 'site.learning.coaching.subtitle',
  },
};

const Learning = (): ReactElement => {
  const { phase } = useParams<{ phase: string }>();
  const { t } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const config = phase ? phaseMap[phase] : undefined;
  if (!config) return <Navigate to="/" replace />;

  const { topics, titleKey, subtitleKey } = config;
  const topic = topics[selectedIndex];

  return (
    <>
      <SEOHead title={t(titleKey) as string} path={`/learning/${phase}`} />

      <section className="page-header">
        <div className="container">
          <h2>{t(titleKey)}</h2>
          <p>{t(subtitleKey)}</p>
        </div>
      </section>

      <div className="sidebar-layout">
        {/* 왼쪽 사이드바 */}
        <aside className="sidebar">
          <nav className="sidebar-menu">
            {topics.map((tp, i) => (
              <button
                key={tp.id}
                className={`sidebar-item${selectedIndex === i ? ' active' : ''}`}
                onClick={() => setSelectedIndex(i)}
              >
                <span className="sidebar-item-icon">{tp.icon}</span>
                {tp.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* 오른쪽 콘텐츠 */}
        <div className="sidebar-content">
          <div className="topic-card">
            <div className="topic-card-header">
              <div className="topic-card-icon">{topic.icon}</div>
              <div className="topic-card-title">{topic.title}</div>
            </div>
            <div className="topic-card-body">
              <p>{topic.description}</p>
              {topic.content.map((section, idx) => (
                <div key={idx}>
                  {section.subtitle && <h4>{section.subtitle}</h4>}
                  {section.text && <p>{section.text}</p>}
                  {section.items && (
                    <ul>
                      {section.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Learning;
