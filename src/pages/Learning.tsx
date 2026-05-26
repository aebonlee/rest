import { useState, type ReactElement } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';
import {
  prerequisiteTopics,
  regularTopics,
  coachingTopics,
  type Topic,
  type ContentSection,
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

const calloutColors: Record<string, { bg: string; border: string; emoji: string; label: string }> = {
  tip:  { bg: '#ecfdf5', border: '#10b981', emoji: '💡', label: 'TIP' },
  warn: { bg: '#fef2f2', border: '#ef4444', emoji: '⚠️', label: '주의' },
  info: { bg: '#eff6ff', border: '#3b82f6', emoji: 'ℹ️', label: '참고' },
};

const CodeBlock = ({ lang, content }: { lang?: string; content: string }): ReactElement => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 권한 부재 등 — execCommand 폴백
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
  };

  return (
    <div style={{ position: 'relative', margin: '8px 0 12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#1e293b',
        padding: '8px 14px',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid #334155',
      }}>
        <span style={{
          fontSize: '11px',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
        }}>{lang || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="코드 복사"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: copied ? '#10b981' : '#cbd5e1',
            background: copied ? '#064e3b' : '#334155',
            border: `1px solid ${copied ? '#10b981' : '#475569'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              복사됨
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              복사
            </>
          )}
        </button>
      </div>
      <pre style={{
        background: '#0f172a',
        color: '#e2e8f0',
        padding: '16px 18px',
        borderRadius: '0 0 8px 8px',
        overflowX: 'auto',
        fontSize: '13px',
        lineHeight: 1.6,
        fontFamily: "'JetBrains Mono', 'Consolas', 'Courier New', monospace",
        margin: 0,
      }}>
        <code>{content}</code>
      </pre>
    </div>
  );
};

const renderSection = (section: ContentSection, idx: number): ReactElement => (
  <div key={idx} style={{ marginBottom: '20px' }}>
    {section.subtitle && (
      <h4 style={{
        fontSize: '15px',
        fontWeight: 700,
        margin: '24px 0 10px',
        color: 'var(--text-primary, #1a1a1a)',
        borderLeft: '3px solid var(--primary-blue, #0046C8)',
        paddingLeft: '10px',
      }}>{section.subtitle}</h4>
    )}
    {section.text && (
      <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: 'var(--text-primary, #1a1a1a)' }}>
        {section.text}
      </p>
    )}
    {section.items && (
      <ul style={{ margin: '0 0 12px', paddingLeft: '20px', lineHeight: 1.85, color: 'var(--text-primary, #1a1a1a)' }}>
        {section.items.map((item, j) => <li key={j}>{item}</li>)}
      </ul>
    )}
    {section.code && (
      <CodeBlock lang={section.code.lang} content={section.code.content} />
    )}
    {section.table && (
      <div style={{ overflowX: 'auto', margin: '8px 0 16px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13.5px',
          border: '1px solid var(--border-color, #e5e7eb)',
        }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary, #f0f4ff)' }}>
              {section.table.headers.map((h, i) => (
                <th key={i} style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: 'var(--text-primary, #1a1a1a)',
                  borderBottom: '2px solid var(--primary-blue, #0046C8)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.table.rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 12px',
                    color: 'var(--text-primary, #1a1a1a)',
                    verticalAlign: 'top',
                    lineHeight: 1.6,
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    {section.callout && (
      <div style={{
        background: calloutColors[section.callout.type].bg,
        borderLeft: `4px solid ${calloutColors[section.callout.type].border}`,
        padding: '12px 16px',
        borderRadius: '0 8px 8px 0',
        margin: '8px 0 14px',
        fontSize: '13.5px',
        lineHeight: 1.7,
        color: '#1a1a1a',
      }}>
        <strong style={{ marginRight: '8px' }}>
          {calloutColors[section.callout.type].emoji} {calloutColors[section.callout.type].label}
        </strong>
        {section.callout.text}
      </div>
    )}
  </div>
);

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
        <aside className="sidebar">
          <nav className="sidebar-menu">
            {topics.map((tp, i) => (
              <button
                key={tp.id}
                className={`sidebar-item${selectedIndex === i ? ' active' : ''}`}
                onClick={() => setSelectedIndex(i)}
              >
                {tp.title}
              </button>
            ))}
          </nav>
        </aside>

        <div className="sidebar-content">
          <div className="topic-card">
            <div className="topic-card-header">
              <div className="topic-card-icon">{topic.icon}</div>
              <div className="topic-card-title">{topic.title}</div>
            </div>
            <div className="topic-card-body">
              <p style={{ fontSize: '15px', color: 'var(--text-secondary, #6b7280)', marginBottom: '24px', lineHeight: 1.7 }}>
                {topic.description}
              </p>
              {topic.content.map((section, idx) => renderSection(section, idx))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Learning;
