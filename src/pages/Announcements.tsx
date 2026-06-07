/*
 * ============================================================================
 * Announcements.tsx — 공지사항 페이지
 * ----------------------------------------------------------------------------
 * 역할:
 *   AI Reboot Academy 전체 공지사항을 목록 형태로 보여주는 페이지 컴포넌트.
 *   Supabase에서 공지 데이터를 불러와 검색·카테고리 필터·아코디언 펼침 UI로 표시한다.
 *
 * 핵심 책임:
 *   - Supabase의 announcements 테이블 조회(고정글 우선, 최신순 정렬)
 *   - 제목/내용 텍스트 검색 및 카테고리(일반/중요/일정) 필터링
 *   - 카테고리별 개수 집계 및 필터 버튼 라벨 표시
 *   - 각 공지의 아코디언 펼침/접힘으로 상세 내용 노출
 *
 * 주요 export:
 *   - default Announcements : 공지사항 페이지 컴포넌트
 *   - CategoryBadge         : 카테고리 색상 배지 컴포넌트
 *   - CATEGORY_LABEL        : 카테고리 키 → 한글 라벨 매핑
 *   - CATEGORY_COLOR        : 카테고리 키 → 배경/글자 색상 매핑
 * ============================================================================
 */
import { useState, useEffect, useMemo, type ReactElement } from 'react';
import SEOHead from '../components/SEOHead';
import getSupabase from '../utils/supabase';
import site from '../config/site';
import type { Announcement } from '../types';

// 조회 대상 테이블명. site.dbPrefix(사이트별 접두사)를 붙여 멀티 사이트 환경에서 충돌을 방지한다.
const TABLE = `${site.dbPrefix}announcements`;

// 화면 상단 카테고리 필터 버튼 정의. 'all'은 전체 보기, 나머지는 개별 카테고리.
const CATEGORY_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'general', label: '일반' },
  { key: 'important', label: '중요' },
  { key: 'schedule', label: '일정' },
];

// 카테고리 키 → 사용자에게 보여줄 한글 라벨 매핑(배지/필터 공용).
export const CATEGORY_LABEL: Record<string, string> = {
  general: '일반',
  important: '중요',
  schedule: '일정',
};

// 카테고리 키 → 배지 배경(bg)/글자(fg) 색상 매핑. 알 수 없는 키는 general 색상으로 폴백한다.
export const CATEGORY_COLOR: Record<string, { bg: string; fg: string }> = {
  general: { bg: '#eef2ff', fg: '#3730a3' },
  important: { bg: '#fee2e2', fg: '#991b1b' },
  schedule: { bg: '#d1fae5', fg: '#065f46' },
};

/**
 * CategoryBadge — 공지 카테고리를 색상 알약(pill) 형태로 표시하는 배지.
 * @param category 카테고리 키(general/important/schedule 등)
 * @returns 카테고리 색상과 한글 라벨이 적용된 span 요소
 * 부수효과: 없음(순수 표시 컴포넌트).
 */
export const CategoryBadge = ({ category }: { category: string }): ReactElement => {
  // 알 수 없는 카테고리는 general 색상으로 폴백하여 항상 유효한 색을 보장.
  const c = CATEGORY_COLOR[category] || CATEGORY_COLOR.general;
  return (
    <span style={{
      fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px',
      background: c.bg, color: c.fg, whiteSpace: 'nowrap',
    }}>{CATEGORY_LABEL[category] || category}</span>
  );
};

/**
 * Announcements — 공지사항 목록 페이지(기본 export).
 * @returns 공지 목록 + 검색/필터 UI를 렌더링하는 React 요소
 * 부수효과: 마운트 시 Supabase에서 공지 목록을 비동기 조회하여 상태에 저장.
 */
const Announcements = (): ReactElement => {
  const [items, setItems] = useState<Announcement[]>([]); // 조회된 전체 공지 목록
  const [loading, setLoading] = useState(true);           // 초기 로딩 스피너 표시 여부
  const [query, setQuery] = useState('');                 // 검색어(제목·내용 대상)
  const [category, setCategory] = useState('all');        // 선택된 카테고리 필터 키
  const [openId, setOpenId] = useState<string | null>(null); // 현재 펼쳐진 공지 id(아코디언, 단일 오픈)

  // 마운트 시 1회 공지 목록을 조회한다. 의존성 배열이 비어 있어 재실행되지 않음.
  useEffect(() => {
    const load = async () => {
      const client = getSupabase();
      // Supabase 미설정(환경변수 부재 등)이면 클라이언트가 null → 조회 생략하고 로딩만 종료.
      if (!client) { setLoading(false); return; }
      // 고정 공지(is_pinned=true)를 먼저, 그 안에서 최신 작성순으로 정렬.
      const { data } = await client
        .from(TABLE)
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (data) setItems(data as Announcement[]); // RLS 정책상 데이터가 없으면 빈 목록 유지
      setLoading(false);
    };
    load();
  }, []);

  // 검색어/카테고리 변경 시에만 재계산되는 필터링된 목록.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase(); // 검색어 정규화(공백 제거 + 소문자화)
    return items.filter((a) => {
      // 'all'이 아니면서 카테고리가 다르면 제외.
      if (category !== 'all' && a.category !== category) return false;
      // 검색어가 있으면 제목+내용 합친 문자열에 포함되는지 대소문자 무시 검사.
      if (q && !`${a.title} ${a.content}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, category]);

  // 카테고리별 공지 개수 집계. 필터 버튼에 (n) 형태로 표시하는 데 사용.
  const counts = useMemo(() => {
    const m: Record<string, number> = { all: items.length }; // 'all'은 전체 개수로 초기화
    for (const a of items) m[a.category] = (m[a.category] || 0) + 1; // 각 카테고리 누적
    return m;
  }, [items]);

  return (
    <>
      {/* 공지 페이지는 검색엔진 비노출(noindex) 처리 */}
      <SEOHead title="공지사항" path="/announcements" noindex />
      <section className="page-header">
        <div className="container">
          <h2>공지사항</h2>
          <p>AI Reboot Academy 전체 공지입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* 검색 + 카테고리 필터 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '18px' }}>
            {/* 검색 입력 영역(돋보기 아이콘 + 텍스트 입력) */}
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #9ca3af)', fontSize: '14px' }}>🔍</span>
              <input
                type="text"
                value={query}
                // 입력값을 검색 상태로 즉시 반영
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제목·내용 검색"
                style={{
                  width: '100%', padding: '10px 14px 10px 36px', fontSize: '14px',
                  border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '10px',
                  background: 'var(--bg-white, #fff)', color: 'var(--text-primary)', boxSizing: 'border-box',
                }}
              />
            </div>
            {/* 카테고리 필터 버튼 묶음 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORY_FILTERS.map((c) => {
                const on = category === c.key; // 현재 선택된 필터인지 여부(활성 스타일 결정)
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    style={{
                      padding: '8px 14px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                      borderRadius: '999px', border: '1px solid',
                      // 활성 버튼은 파란 배경, 비활성은 흰 배경으로 시각 구분.
                      borderColor: on ? 'var(--primary-blue, #0046C8)' : 'var(--border-light, #e5e7eb)',
                      background: on ? 'var(--primary-blue, #0046C8)' : 'var(--bg-white, #fff)',
                      color: on ? '#fff' : 'var(--text-secondary, #6b7280)',
                    }}
                  >
                    {/* 라벨 옆에 개수 표시. 집계가 없으면 (0)으로 표기 */}
                    {c.label} {counts[c.key] ? `(${counts[c.key]})` : '(0)'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 로딩 중 → 스피너 / 결과 있음 → 목록 / 결과 없음 → 빈 메시지 (3분기) */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div></div>
          ) : filtered.length > 0 ? (
            <div style={{ border: '1px solid var(--border-light, #e5e7eb)', borderRadius: '12px', overflow: 'hidden' }}>
              {filtered.map((a, idx) => {
                const open = openId === a.id; // 이 행이 현재 펼쳐진 상태인지
                return (
                  <div key={a.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--border-light, #f1f3f5)' }}>
                    {/* 공지 제목 행(클릭 시 아코디언 토글) */}
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : a.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 18px',
                        background: a.is_pinned ? 'var(--bg-light-gray, #f8f9fa)' : 'transparent', // 고정 공지는 옅은 배경
                        border: 'none', cursor: 'pointer', textAlign: 'left', color: 'inherit', font: 'inherit',
                      }}
                    >
                      {/* 좌측 번호 영역: 고정 공지는 압정 아이콘, 일반은 순번 표시 */}
                      <span style={{ width: '36px', textAlign: 'center', color: 'var(--text-secondary, #9ca3af)', fontSize: '14px' }}>
                        {a.is_pinned ? '📌' : idx + 1}
                      </span>
                      <CategoryBadge category={a.category} />
                      {/* 제목: 길면 말줄임(...) 처리, 고정 공지는 굵게 강조 */}
                      <span style={{ flex: 1, fontWeight: a.is_pinned ? 700 : 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.title}
                      </span>
                      {/* 작성일(한국 로케일 날짜만) */}
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary, #9ca3af)', whiteSpace: 'nowrap' }}>
                        {new Date(a.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      {/* 펼침 화살표: 열려 있으면 180도 회전 애니메이션 */}
                      <span style={{
                        color: 'var(--text-secondary, #9ca3af)', fontSize: '12px', flexShrink: 0,
                        transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
                      }}>▼</span>
                    </button>
                    {/* 펼쳐진 경우에만 상세 내용 영역 렌더링 */}
                    {open && (
                      <div style={{
                        padding: '4px 18px 22px 66px', background: a.is_pinned ? 'var(--bg-light-gray, #f8f9fa)' : 'transparent',
                      }}>
                        {/* 메타 정보: 작성자(있을 때만) + 작성 일시(날짜+시각) */}
                        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary, #6b7280)', marginBottom: '10px' }}>
                          {a.author_name && <span>작성자 {a.author_name} · </span>}
                          {new Date(a.created_at).toLocaleString('ko-KR')}
                        </div>
                        {/* 본문: 줄바꿈/공백 보존(pre-wrap), 긴 단어 줄바꿈 허용 */}
                        <div style={{ fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {a.content}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // 데이터 자체가 없으면 "등록된 공지 없음", 필터로 걸러져 비면 "검색 결과 없음"으로 구분 안내.
            <p className="empty-message" style={{ textAlign: 'center', padding: '60px 0' }}>
              {items.length === 0 ? '등록된 공지사항이 없습니다.' : '검색 결과가 없습니다.'}
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default Announcements;
