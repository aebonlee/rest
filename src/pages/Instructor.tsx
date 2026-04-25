import type { ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';

interface InstructorInfo {
  name: string;
  role: string;
  affiliation: string;
  specialties: string[];
  email: string;
  icon: string;
}

const instructors: InstructorInfo[] = [
  {
    name: '이애본',
    role: '총괄 책임교수',
    affiliation: '한신대학교 AI·SW대학 겸임교수 / 드림아이티비즈(DreamIT Biz) 대표',
    specialties: ['AI·SW 교육', '바이브코딩', '경영정보학', '인적자원관리'],
    email: 'aebon@dreamitbiz.com',
    icon: '👩‍🏫',
  },
  {
    name: '정동엽',
    role: '기술코칭 강사',
    affiliation: '드림아이티비즈',
    specialties: ['풀스택 개발', 'React/Vite', 'Supabase', 'AI 서비스 개발'],
    email: 'radical8566@gmail.com',
    icon: '👨‍💻',
  },
];

const Instructor = (): ReactElement => {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead title={t('site.instructor.title') as string} path="/instructor" />

      <section className="page-header">
        <div className="container">
          <h2>{t('site.instructor.title')}</h2>
          <p>{t('site.instructor.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="instructor-grid">
            {instructors.map((inst) => (
              <div key={inst.name} className="instructor-card">
                <div className="instructor-icon">{inst.icon}</div>
                <div className="instructor-info">
                  <h3 className="instructor-name">{inst.name}</h3>
                  <p className="instructor-role">{inst.role}</p>
                  <p className="instructor-affiliation">{inst.affiliation}</p>
                  <div className="instructor-specialties">
                    {inst.specialties.map((s) => (
                      <span key={s} className="specialty-tag">{s}</span>
                    ))}
                  </div>
                  <a href={`mailto:${inst.email}`} className="instructor-email">
                    {inst.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Instructor;
