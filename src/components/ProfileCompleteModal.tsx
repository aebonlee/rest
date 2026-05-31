import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { updateProfile } from '../utils/auth';

interface Props {
  user: User;
  onComplete: () => Promise<void>;
}

/** 전화번호 자동 포맷: 01012345678 → 010-1234-5678 */
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const ProfileCompleteModal = ({ user, onComplete }: Props) => {
  const meta = user.user_metadata || {};
  const [name, setName] = useState(meta.full_name || meta.name || '');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('이름을 입력해주세요.');
      return;
    }

    const rawDigits = phone.replace(/\D/g, '');
    if (!rawDigits) {
      setError('전화번호를 입력해주세요. (필수)');
      return;
    }
    if (!/^01[0-9]\d{7,8}$/.test(rawDigits)) {
      setError('올바른 전화번호를 입력해주세요. (예: 010-1234-5678)');
      return;
    }

    setSaving(true);
    try {
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
      setSaving(false);
    }
  };

  return (
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
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: '#111' }}>
          프로필 정보 입력
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#666', lineHeight: 1.5 }}>
          원활한 수업 운영을 위해 <strong>이름(실명)과 전화번호</strong>를 입력해주세요.<br />
          <span style={{ color: '#dc2626', fontSize: '14px' }}>두 항목 모두 필수입니다.</span>
        </p>

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

        {error && (
          <p style={{ margin: '0 0 14px', fontSize: '15px', color: '#dc2626', fontWeight: 500 }}>
            {error}
          </p>
        )}

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
