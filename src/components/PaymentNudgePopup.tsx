/**
 * PaymentNudgePopup — 가입 7일 경과 + 미결제 사용자에게 부드러운 결제 유도 팝업
 * [2026-04-23] 콘텐츠 제한 해제 후 대체 수익화 수단
 *
 * 조건: 로그인 && created_at > 7일 && user_licenses에 유효 라이선스 없음
 * 세션당 1회만 표시, Superadmin 자동 바이패스, 조회 실패 시 미표시 (fail-safe)
 *
 * [역할/책임]
 *  - 표시 조건(가입 경과일·라이선스 보유 여부·세션 닫힘 여부)을 클라이언트에서 판정
 *  - 조건 충족 시 결제 유도 모달을 화면 최상단(z-index 99999)에 오버레이로 렌더
 *  - 닫기 시 sessionStorage에 플래그를 저장하여 같은 세션 내 재노출 방지
 *
 * [주요 export]
 *  - default: PaymentNudgePopup (React 컴포넌트)
 */
// React 상태/사이드이펙트 훅
import { useState, useEffect } from 'react';
// Supabase 사용자 객체 및 클라이언트 타입 (타입 전용 import — 런타임 번들 영향 없음)
import type { User, SupabaseClient } from '@supabase/supabase-js';

/** 사이트별 supabase export 패턴 차이를 자동 감지 */
// 사이트마다 supabase 인스턴스를 export 하는 위치/방식이 달라 동적으로 탐색해 클라이언트를 반환.
// 어떤 경로/패턴도 맞지 않으면 null 반환 → 호출부에서 미표시(fail-safe) 처리.
async function resolveSupabase(): Promise<SupabaseClient | null> {
  // @vite-ignore prevents Rollup from statically resolving these dynamic imports
  // 후보 모듈 경로 목록 — 사이트별로 utils 또는 config 아래에 supabase 모듈이 존재할 수 있음
  const paths = ['../utils/supabase', '../config/supabase'];
  for (const p of paths) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // @vite-ignore: Vite/Rollup이 이 동적 import를 정적 분석하지 않도록 하여 빌드 에러 방지
      const mod: any = await import(/* @vite-ignore */ p);
      // export 패턴별 분기: default가 팩토리 함수면 호출, 인스턴스면 그대로, named supabase, getSupabase 함수 순으로 시도
      if (typeof mod.default === 'function') return mod.default();
      if (mod.default) return mod.default;
      if (mod.supabase) return mod.supabase;
      if (typeof mod.getSupabase === 'function') return mod.getSupabase();
    } catch { /* try next path */ } // 해당 경로 모듈이 없거나 로드 실패 시 다음 후보 경로로 진행
  }
  return null; // 모든 후보 경로 실패 → 클라이언트 확보 불가
}

// 결제 유도 팝업을 표시하지 않는 슈퍼관리자 이메일 화이트리스트 (운영자 본인 계정)
const SUPERADMIN_EMAILS = [
  'aebon@kakao.com',
  'aebon@kyonggi.ac.kr',
  'radical8566@gmail.com',
];

// 7일을 밀리초로 환산한 상수 (가입 경과일 판정 기준)
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// 컴포넌트 props 타입 정의
interface PaymentNudgePopupProps {
  user: User;          // 현재 로그인 사용자 (필수)
  siteSlug: string;    // 현재 사이트 식별 슬러그 — 라이선스 매칭 및 세션 키 구분에 사용
  shopUrl?: string;    // 이용권 구매 페이지 URL (미지정 시 기본 biz-hub shop)
}

/**
 * PaymentNudgePopup 컴포넌트
 * props로 받은 사용자/사이트 정보를 바탕으로 결제 유도 모달 노출 여부를 판정하고 렌더한다.
 */
export default function PaymentNudgePopup({
  user,
  siteSlug,
  shopUrl = 'https://biz-hub.dreamitbiz.com/shop', // 기본 구매 페이지 URL
}: PaymentNudgePopupProps) {
  // 모달 표시 여부 상태 (초기값 false → 조건 충족 시에만 true)
  const [visible, setVisible] = useState(false);

  // user/siteSlug 변경 시 표시 조건을 재평가하는 사이드이펙트
  useEffect(() => {
    // 사이트별로 독립적인 "이번 세션에서 닫음" 플래그 키
    const SESSION_KEY = `nudge_dismissed_${siteSlug}`;

    // 이미 이번 세션에서 닫았으면 스킵
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Superadmin 바이패스
    // 이메일을 소문자로 정규화하여 대소문자 차이로 인한 매칭 누락 방지
    const email = (user.email || '').toLowerCase();
    if (SUPERADMIN_EMAILS.includes(email)) return;

    // 가입일 7일 미만이면 스킵
    // created_at이 없으면 현재 시각으로 간주 → 경과 0이 되어 자동 스킵(신규 취급)
    const createdAt = user.created_at ? new Date(user.created_at).getTime() : Date.now();
    if (Date.now() - createdAt < SEVEN_DAYS_MS) return;

    // user_licenses 조회
    // 비동기 함수로 분리: useEffect 콜백 자체는 동기여야 하므로 내부 정의 후 호출
    const checkLicense = async () => {
      try {
        const supabase = await resolveSupabase();
        if (!supabase) return; // Supabase 없으면 미표시

        // 현재 사용자가 보유한 라이선스 행 조회.
        // RLS 정책상 본인(user_id = auth.uid()) 행만 반환되도록 구성되어 있음을 전제로 함.
        const { data, error } = await supabase
          .from('user_licenses')
          .select('id, license_type, site_slug, expires_at')
          .eq('user_id', user.id);

        if (error) return; // 조회 실패 시 미표시 (fail-safe) — 권한/네트워크 오류로 사용자를 오인 차단하지 않음

        if (data && data.length > 0) {
          const now = new Date();
          // 보유 라이선스 중 "현재 유효한" 것이 하나라도 있는지 판정
          const hasValid = data.some((lic: { license_type: string; site_slug: string | null; expires_at: string | null }) => {
            // 만료일이 있고 이미 지났으면 무효 처리 (expires_at이 null이면 무기한으로 간주)
            if (lic.expires_at && new Date(lic.expires_at) < now) return false;
            // 전체 사이트 번들(bundle)이거나 현재 사이트 슬러그와 일치하면 유효
            return lic.license_type === 'bundle' || lic.site_slug === siteSlug;
          });
          if (hasValid) return; // 유효 라이선스 있으면 미표시
        }

        // 위 모든 스킵 조건을 통과 → 미결제 사용자이므로 팝업 노출
        setVisible(true);
      } catch {
        // 에러 시 미표시 (fail-safe)
      }
    };

    checkLicense(); // 비동기 조건 검사 실행 (반환 Promise는 의도적으로 대기하지 않음)
  }, [user, siteSlug]); // 사용자 또는 사이트가 바뀌면 조건 재평가

  // 닫기 처리: 세션 플래그 저장 후 모달 숨김 → 같은 세션 동안 재노출 차단
  const handleDismiss = () => {
    sessionStorage.setItem(`nudge_dismissed_${siteSlug}`, '1');
    setVisible(false);
  };

  // 비표시 상태면 아무것도 렌더하지 않음 (DOM에 마운트하지 않음)
  if (!visible) return null;

  return (
    // 화면 전체를 덮는 반투명 오버레이 — 배경 클릭 시 닫힘(handleDismiss)
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
      }}
    >
      {/* 모달 본체 — stopPropagation으로 내부 클릭이 오버레이의 닫기로 전파되는 것을 차단 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-white, #fff)', color: 'var(--text-primary, #111827)', borderRadius: '16px', padding: '36px 32px 28px',
          width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          margin: '16px', position: 'relative', textAlign: 'center',
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'none', border: 'none', color: '#9CA3AF',
            cursor: 'pointer', fontSize: '20px', lineHeight: 1,
            padding: '4px 8px', borderRadius: '6px',
          }}
          title="닫기"
        >
          ✕
        </button>

        {/* 아이콘 */}
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>

        {/* 제목 */}
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#111' }}>
          더 나은 학습 경험을 위해
        </h2>
        {/* 본문 설명 */}
        <p style={{ margin: '0 0 20px', fontSize: '16px', color: '#666', lineHeight: 1.6 }}>
          이용권을 구매하시면 모든 콘텐츠를<br />
          제한 없이 평생 이용하실 수 있습니다.
        </p>

        {/* 가격 정보 */}
        <div style={{
          background: '#F0F7FF', borderRadius: '12px', padding: '16px',
          marginBottom: '20px', textAlign: 'left',
        }}>
          {/* 개별 사이트 이용권 가격 행 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px', color: '#333' }}>개별 사이트 이용권</span>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#2563EB' }}>30,000원</span>
          </div>
          {/* 전체 사이트 이용권 가격 행 (할인 배지 포함) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', color: '#333' }}>
              전체 사이트 이용권
              {/* 할인율 강조 배지 */}
              <span style={{
                background: '#DC2626', color: '#fff', fontSize: '13px', fontWeight: 600,
                padding: '2px 6px', borderRadius: '4px', marginLeft: '6px',
              }}>~55% 할인</span>
            </span>
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#DC2626' }}>150,000원</span>
          </div>
        </div>

        {/* 이용권 보기 버튼 */}
        {/* 새 탭으로 구매 페이지 이동 — rel=noopener noreferrer로 탭내빙(tabnabbing) 보안 위험 차단 */}
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block', width: '100%', padding: '13px', fontSize: '16px', fontWeight: 600,
            color: '#fff', background: '#2563EB', border: 'none', borderRadius: '8px',
            cursor: 'pointer', textDecoration: 'none', textAlign: 'center',
            marginBottom: '10px', boxSizing: 'border-box',
          }}
        >
          이용권 보기
        </a>

        {/* 다음에 버튼 */}
        {/* 클릭 시 닫기와 동일 처리 (세션 내 재노출 방지) */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%', padding: '11px', fontSize: '16px', fontWeight: 500,
            color: '#6B7280', background: 'none',
            border: '1px solid #E5E7EB', borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          다음에 할게요
        </button>

        {/* 하단 안내 문구 */}
        <p style={{ margin: '14px 0 0', fontSize: '14px', color: '#9CA3AF' }}>
          1회 결제로 평생 무제한 이용
        </p>
      </div>
    </div>
  );
}
