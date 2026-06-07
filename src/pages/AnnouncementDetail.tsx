/**
 * AnnouncementDetail.tsx
 *
 * 역할:
 *   - URL 파라미터(:id)로 전달된 단일 공지사항(announcement)의 상세 내용을 조회/표시하는 페이지 컴포넌트.
 *
 * 핵심 책임:
 *   - 라우트 파라미터 id를 읽어 Supabase 공지 테이블에서 해당 레코드 1건을 비동기 조회.
 *   - 로딩/없음(notFound)/정상 표시 3가지 상태를 분기 렌더링.
 *   - SEOHead를 통한 페이지 메타데이터 설정(검색엔진 비노출 noindex).
 *
 * 주요 export:
 *   - default: AnnouncementDetail 컴포넌트.
 */
import { useState, useEffect, type ReactElement } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Announcement } from '../types';
import { CategoryBadge } from './Announcements';

// 조회 대상 테이블명. site.dbPrefix(프로젝트별 접두사) + 'announcements'로 동적 구성.
const TABLE = `${site.dbPrefix}announcements`;

/**
 * AnnouncementDetail
 *   - 단일 공지사항 상세 페이지 컴포넌트.
 *   - 매개변수: 없음(라우트 파라미터 id는 useParams로 획득).
 *   - 반환값: 공지 상세 화면 ReactElement.
 *   - 부수효과: 마운트/ id 변경 시 Supabase에서 공지 1건을 비동기 조회하여 상태 갱신.
 */
const AnnouncementDetail = (): ReactElement => {
  // 라우트의 :id 파라미터(조회할 공지의 PK). 존재하지 않으면 undefined.
  const { id } = useParams<{ id: string }>();
  // 조회된 공지 데이터. 초기/실패 시 null.
  const [item, setItem] = useState<Announcement | null>(null);
  // 비동기 조회 진행 여부. true 동안 스피너 노출.
  const [loading, setLoading] = useState(true);
  // 공지를 찾지 못했는지 여부(클라이언트 없음/ id 없음/ 데이터 없음).
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // 공지 1건을 비동기로 불러오는 내부 함수.
    const load = async () => {
      const client = getSupabase();
      // Supabase 클라이언트가 없거나 id가 비어있으면 조회 불가 → 로딩 종료 후 notFound 처리.
      if (!client || !id) { setLoading(false); setNotFound(true); return; }
      // id가 일치하는 단일 레코드 조회. maybeSingle은 0건일 때 에러 대신 null 반환(엣지케이스 안전).
      const { data } = await client.from(TABLE).select('*').eq('id', id).maybeSingle();
      // 데이터가 있으면 표시용 상태에 저장, 없으면 notFound로 분기.
      if (data) setItem(data as Announcement);
      else setNotFound(true);
      setLoading(false);
    };
    load();
    // id가 바뀌면(다른 공지로 이동) 다시 조회.
  }, [id]);

  return (
    <>
      {/* 공지 제목이 있으면 제목 포함 타이틀, 없으면 기본값. noindex로 검색엔진 색인 제외. */}
      <SEOHead title={item ? `공지 · ${item.title}` : '공지사항'} path={`/announcements/${id ?? ''}`} noindex />
      <section className="page-header">
        <div className="container">
          <h2>공지사항</h2>
          <p>AI Reboot Academy 전체 공지입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '820px' }}>
          {/* 공지 목록으로 돌아가는 링크 */}
          <Link to="/announcements" style={{ fontSize: '14px', color: 'var(--primary-blue, #0046C8)', textDecoration: 'none' }}>
            ← 공지사항 목록
          </Link>

          {/* 3분기 렌더링: 로딩 중 → 스피너 / 없음 → 안내 문구 / 정상 → 상세 article */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : notFound || !item ? (
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>존재하지 않는 공지입니다.</p>
          ) : (
            <article style={{
              marginTop: '16px', border: '1px solid var(--border-light, #e5e7eb)',
              borderRadius: '12px', padding: '28px 26px', background: 'var(--bg-white, #fff)',
            }}>
              {/* 상단 배지 영역: 고정 공지 핀 아이콘(조건부) + 카테고리 배지 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {item.is_pinned && <span style={{ fontSize: '14px' }}>📌</span>}
                <CategoryBadge category={item.category} />
              </div>
              <h2 style={{ margin: '12px 0 8px', fontSize: '24px', lineHeight: 1.35 }}>{item.title}</h2>
              {/* 메타 정보 영역: 작성자(있을 때만) + 작성일시(ko-KR 로컬 포맷) */}
              <div style={{
                display: 'flex', gap: '14px', flexWrap: 'wrap', paddingBottom: '18px',
                borderBottom: '1px solid var(--border-light, #e5e7eb)',
                fontSize: '13.5px', color: 'var(--text-secondary, #6b7280)',
              }}>
                {item.author_name && <span>작성자 {item.author_name}</span>}
                <span>{new Date(item.created_at).toLocaleString('ko-KR')}</span>
              </div>
              {/* 본문 영역: pre-wrap으로 줄바꿈 보존, break-word로 긴 단어 줄바꿈 처리 */}
              <div style={{
                marginTop: '20px', fontSize: '15.5px', lineHeight: 1.8,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {item.content}
              </div>
            </article>
          )}
        </div>
      </section>
    </>
  );
};

export default AnnouncementDetail;
