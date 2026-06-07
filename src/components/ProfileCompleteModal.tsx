/**
 * ProfileCompleteModal.tsx — 프로필(이름·전화) 필수 입력 모달
 *
 * 역할:
 *  - 로그인했으나 실명/전화번호가 비어 있는 사용자에게 강제로 입력받는 모달.
 *
 * 핵심 책임:
 *  - 이름·전화 유효성 검사(전화는 한국 휴대폰 정규식) 후 updateProfile로 저장.
 *  - 전화번호 입력 시 자동 하이픈 포맷(formatPhone).
 *  - 저장 성공 시 onComplete 콜백으로 상위에 알림.
 *
 * 주요 export:
 *  - default: ProfileCompleteModal (모달 컴포넌트)
 */
import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { updateProfile } from '../utils/auth';

interface Props {
  user: User;                       // 현재 로그인 사용자(Supabase)
  onComplete: () => Promise<void>;  // 저장 완료 후 상위에서 프로필 재조회 등 처리
}

/** 전화번호 자동 포맷: 01012345678 → 010-1234-5678 (숫자만 추출 후 최대 11자리에서 하이픈 삽입) */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// ProfileCompleteModal — 이름/전화 입력 폼 모달.
const ProfileCompleteModal = ({ user, onComplete }: Props) => {
  // OAuth 메타데이터에 이름이 있으면 초기값으로 활용.
  const meta = user.user_metadata || {};
  const [name, setName] = useState(meta.full_name || meta.name || '');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);   // 저장 중 버튼 비활성화
  const [error, setError] = useState('');

  // handleSubmit — 입력 검증 후 프로필 저장. 성공 시 onComplete 호출.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();   // 폼 기본 제출(새로고침) 방지
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('이름을 입력해주세요.');
      return;
    }

    const rawDigits = phone.replace(/\D/g, '');   // 검증·저장은 숫자만으로
    if (!rawDigits) {
      setError('전화번호를 입력해주세요. (필수)');
      return;
    }
    // 한국 휴대폰 형식: 01X + 7~8자리.
    if (!/^01[0-9]\d{7,8}$/.test(rawDigits)) {
      setError('올바른 전화번호를 입력해주세요. (예: 010-1234-5678)');
      return;
    }

    setSaving(true);
    try {
      // 이름은 name/display_name 둘 다, 전화는 하이픈 포맷으로 저장.
      await updateProfile(user.id, {
        name: trimmedName,
        display_name: trimmedName,
        phone: formatPhone(rawDigits),
      });
      await onComplete();
    } catch (err) {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
      console.error('ProfileCompleteModal save error:', err);
    } finally {
      setSaving(false);   // 성공/실패 무관 버튼 복구
    }
  };

  return (
    // 화면 전체를 덮는 반투명 오버레이(모달 배경)
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--bg-white, #fff)', color: 'var(--text-primary, #111827)', borderRadius: '16px', padding: '36px 32px 28px',
          width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          margin: '16px', position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}   // 폼 내부 클릭이 오버레이로 전파되지 않게 차단
      >
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#111' }}>
          프로필 정보 입력
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#666', lineHeight: 1.5 }}>
          원활한 수업 운영을 위해 <strong>이름(실명)과 전화번호</strong>를 입력해주세요.<br />
          <span style={{ color: '#dc2626', fontSize: '14px' }}>두 항목 모두 필수입니다.</span>
        </p>

        {/* 이름 입력 — autoFocus로 진입 시 바로 입력 가능. 포커스 시 테두리 강조 */}
        <label style={{ display: 'block', marginBottom: '16px' }}>
          <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
            이름 <span style={{ color: '#dc2626' }}>*</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="실명을 입력해주세요"
            autoFocus
            style={{
              width: '100%', padding: '10px 12px', fontSize: '16px',
              border: '1.5px solid #d1d5db', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
        </label>

        {/* 전화 입력 — onChange에서 formatPhone으로 즉시 하이픈 포맷 적용 */}
        <label style={{ display: 'block', marginBottom: '20px' }}>
          <span style={{ display: 'block', fontSize: '15px', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
            전화번호 <span style={{ color: '#dc2626' }}>*</span>
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="010-0000-0000"
            style={{
              width: '100%', padding: '10px 12px', fontSize: '16px',
              border: '1.5px solid #d1d5db', borderRadius: '8px',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
        </label>

        {/* 검증 실패 메시지 */}
        {error && (
          <p style={{ margin: '0 0 14px', fontSize: '15px', color: '#dc2626', fontWeight: 500 }}>
            {error}
          </p>
        )}

        {/* 제출 버튼 — saving 중에는 비활성화 + 라벨 변경 */}
        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%', padding: '12px', fontSize: '16px', fontWeight: 600,
            color: '#fff', background: saving ? '#93c5fd' : '#2563eb',
            border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', marginBottom: '10px',
          }}
        >
          {saving ? '저장 중...' : '저장하고 시작하기'}
        </button>
      </form>
    </div>
  );
};

export default ProfileCompleteModal;
