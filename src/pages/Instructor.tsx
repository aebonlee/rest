/**
 * Instructor.tsx — 강사 소개 페이지
 *
 * 역할:
 *  - 과정 강사진의 이름·역할·소속·전문분야·이메일을 카드로 소개.
 *
 * 핵심 책임:
 *  - 정적 강사 데이터(instructors)를 카드 그리드로 렌더(메일 링크 포함).
 *
 * 주요 export:
 *  - default: Instructor (React 페이지 컴포넌트)
 */
import type { ReactElement } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOHead from '../components/SEOHead';

// 강사 한 명의 정보 형태.
interface InstructorInfo {
  name: string;
  role: string;
  affiliation: string;
  specialties: string[];   // 전문분야 태그 목록
  email: string;
  icon: string;            // 카드 상단 이모지
}

// 강사진 정적 데이터(표시 순서 = 배열 순서).
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

// Instructor — 강사 카드 목록을 렌더하는 표시용 컴포넌트(상태/부수효과 없음).
const Instructor = (): ReactElement => {
  const { t } = useLanguage();   // i18n 번역 함수

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
          {/* 강사 카드 그리드 */}
          <div className="instructor-grid">
            {instructors.map((inst) => (
              <div key={inst.name} className="instructor-card">
                <div className="instructor-icon">{inst.icon}</div>
                <div className="instructor-info">
                  <h3 className="instructor-name">{inst.name}</h3>
                  <p className="instructor-role">{inst.role}</p>
                  <p className="instructor-affiliation">{inst.affiliation}</p>
                  {/* 전문분야 태그 나열 */}
                  <div className="instructor-specialties">
                    {inst.specialties.map((s) => (
                      <span key={s} className="specialty-tag">{s}</span>
                    ))}
                  </div>
                  {/* 클릭 시 메일 작성 — mailto 링크 */}
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
