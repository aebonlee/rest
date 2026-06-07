/**
 * Materials.tsx — 학습자료(Materials) 페이지 컴포넌트
 *
 * 역할/책임:
 *  - Supabase의 materials 테이블에서 강의 학습자료 목록을 조회하여 카드 형태로 렌더링한다.
 *  - 카테고리(선수과정/AI기본/LLM실습 등) 필터 버튼을 제공하여 자료를 분류·표시한다.
 *  - 각 자료의 파일 타입에 따라 아이콘을 보여주고, 파일 크기를 사람이 읽기 쉬운 단위로 변환한다.
 *  - file_url이 존재하는 자료에 대해 새 탭으로 열리는 다운로드 링크를 노출한다.
 *
 * 주요 export:
 *  - default: Materials (페이지 컴포넌트)
 */
import { useState, useEffect, type ReactElement } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Material } from '../types';

// 사이트별 DB 접두사(dbPrefix)를 붙여 실제 Supabase 테이블명을 구성한다.
// (여러 사이트가 동일 DB를 공유할 때 테이블 충돌을 방지하기 위한 네이밍 규칙)
const TABLES = { materials: `${site.dbPrefix}materials` };

// 카테고리 키 -> 화면 표시용 한글 라벨 매핑 테이블.
// 필터 버튼 렌더링과 카드 메타 정보의 카테고리 표기에 함께 사용된다.
const categoryLabels: Record<string, string> = {
  all: '전체', prerequisite: '선수과정', ai_basic: 'AI기본', llm_practice: 'LLM실습',
  automation: '자동화', planning: '기획', design: '설계', implementation: '구현',
  debugging: '디버깅', coaching: '코칭',
};

// 학습자료 페이지 컴포넌트 본체.
const Materials = (): ReactElement => {
  // 인증 컨텍스트 초기화/유지를 위해 호출(반환값은 사용하지 않음).
  // RLS가 적용된 테이블 접근 시 로그인 세션이 필요하므로 페이지 진입 시 컨텍스트를 활성화한다.
  useAuth();
  // materials: 서버에서 조회한 전체 학습자료 목록.
  const [materials, setMaterials] = useState<Material[]>([]);
  // activeCategory: 현재 선택된 필터 카테고리 키('all'이면 전체 표시).
  const [activeCategory, setActiveCategory] = useState('all');
  // loading: 데이터 로딩 중 여부(스피너 표시 제어).
  const [loading, setLoading] = useState(true);

  // 마운트 시 1회 학습자료 목록을 비동기로 로드한다.
  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      // Supabase 클라이언트가 초기화되지 않았으면(환경변수 미설정 등) 로딩만 종료한다.
      if (!client) { setLoading(false); return; }
      // day_number 오름차순 정렬 후, 동일 day 내에서는 created_at 내림차순(최신 먼저)으로 정렬.
      const { data } = await client.from(TABLES.materials).select('*').order('day_number').order('created_at', { ascending: false });
      // data가 null이 아닐 때만 상태 갱신(에러/빈 응답 시 기존 상태 유지).
      if (data) setMaterials(data as Material[]);
      setLoading(false);
    };
    load();
  }, []);

  // 선택된 카테고리에 따라 표시할 목록을 계산.
  // 'all'이면 전체, 아니면 category가 일치하는 자료만 필터링한다.
  const filtered = activeCategory === 'all' ? materials : materials.filter(m => m.category === activeCategory);

  // 바이트 수를 사람이 읽기 쉬운 단위(B/KB/MB)로 변환한다.
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;                              // 1KB 미만: 바이트 그대로
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`; // 1MB 미만: KB 단위(소수 첫째자리)
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;                 // 그 이상: MB 단위(소수 첫째자리)
  };

  return (
    <>
      {/* SEO 메타 설정. 학습자료는 비공개 페이지이므로 noindex로 검색 노출 차단 */}
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
            {/* categoryLabels의 각 항목을 필터 버튼으로 렌더링. 현재 활성 카테고리에는 active 클래스 부여 */}
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button key={key} className={`filter-btn ${activeCategory === key ? 'active' : ''}`}
                onClick={() => setActiveCategory(key)}>{label}</button>
            ))}
          </div>

          {/* 로딩 중이면 스피너, 데이터가 있으면 카드 목록, 없으면 빈 메시지를 조건부 렌더링 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length > 0 ? (
            <div className="materials-list">
              {filtered.map((m) => (
                <div key={m.id} className="material-card">
                  <div className="material-icon">
                    {/* 파일 타입별 이모지 아이콘 매핑: pdf=문서, zip=압축, pptx=발표, 그 외=일반 파일 */}
                    {m.file_type === 'pdf' ? '📄' : m.file_type === 'zip' ? '📦' : m.file_type === 'pptx' ? '📊' : '📁'}
                  </div>
                  <div className="material-info">
                    <h4>{m.title}</h4>
                    <p>{m.description}</p>
                    <div className="material-meta">
                      <span>Day {m.day_number}</span>
                      {/* 라벨 매핑에 없는 카테고리면 원본 키를 그대로 표시(fallback) */}
                      <span>{categoryLabels[m.category] || m.category}</span>
                      <span>{formatFileSize(m.file_size)}</span>
                    </div>
                  </div>
                  {/* file_url이 있을 때만 다운로드 버튼 노출. 새 탭 + rel=noopener로 안전하게 외부 링크 열기 */}
                  {m.file_url && (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '16px' }}>
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
