/**
 * notifications.ts
 * 이메일 & SMS 발송 공용 유틸리티
 *
 * 공용 Supabase Edge Functions 호출 (모든 dreamitbiz.com 사이트에서 사용 가능)
 *   - send-email : Resend API (noreply@dreamitbiz.com 발신)
 *   - send-sms   : icode TCP SMS (등록된 발신번호)
 *
 * 사용 예시:
 *   import { sendEmail, sendSMS, sendBoth } from '../utils/notifications';
 *
 *   await sendEmail({ to: 'user@example.com', subject: '제목', html: '<p>내용</p>' });
 *   await sendSMS({ receiver: '01012345678', message: '안녕하세요' });
 *
 * [역할/책임]
 *   - 클라이언트에서 직접 외부 API(Resend, icode)를 호출하지 않고,
 *     Supabase Edge Function을 경유하여 발송 (API 키 보호 + RLS/인증 경계 유지).
 *   - 모든 함수는 예외를 throw 하지 않고 NotificationResult 형태로 결과를 반환하여
 *     호출부가 try/catch 없이도 성공/실패를 안전하게 판단할 수 있게 한다.
 *
 * [주요 export]
 *   - sendEmail      : 단일 이메일 발송
 *   - sendSMS        : 단일 SMS/LMS 발송
 *   - sendBoth       : 이메일 + SMS 동시 발송 (한쪽 실패 무관)
 *   - buildEmailHtml : 브랜드 일관성을 갖춘 기본 HTML 이메일 템플릿 생성
 *   - EmailParams / SMSParams / NotificationResult : 관련 타입
 */

// Supabase 클라이언트 팩토리 — 환경설정에 따라 초기화된 인스턴스(또는 null) 반환
import getSupabase from './supabase';

// ── 타입 정의 ────────────────────────────────────────────────

// 이메일 발송 파라미터 (send-email Edge Function 의 body 로 그대로 전달됨)
export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  type?: string; // 선택적 메시지 타입 (로깅용)
}

// SMS 발송 파라미터 (send-sms Edge Function 의 body 로 그대로 전달됨)
export interface SMSParams {
  receiver: string; // 수신번호 (하이픈 포함 가능 — 자동 제거됨)
  message: string;  // 메시지 내용 (90바이트 초과 시 LMS 자동 전환)
}

// 발송 결과 공통 반환 타입 — 성공 여부와 실패 시 에러 메시지를 담는다
export interface NotificationResult {
  success: boolean;
  error?: string;
}

// ── 이메일 발송 ──────────────────────────────────────────────

/**
 * Resend API를 통해 이메일 발송
 * 발신 주소: noreply@dreamitbiz.com
 *
 * 반환: 성공 시 { success: true }, 실패 시 { success: false, error }
 *       (예외를 외부로 던지지 않으므로 호출부에서 별도 try/catch 불필요)
 */
export async function sendEmail(params: EmailParams): Promise<NotificationResult> {
  // Supabase 클라이언트 확보 — 미초기화(예: env 누락) 시 즉시 실패 반환
  const sb = getSupabase();
  if (!sb) return { success: false, error: 'Supabase 초기화 실패' };

  try {
    // Edge Function 'send-email' 호출 — params 를 그대로 body 로 전달
    const { data, error } = await sb.functions.invoke('send-email', { body: params });
    // 네트워크/함수 호출 단계 오류 (Supabase invoke 레벨)
    if (error) throw error;
    // 함수는 정상 응답했으나 본문에 error 필드가 있는 경우 (Resend API 측 오류)
    if (data?.error) throw new Error(data.error);
    return { success: true };
  } catch (err: unknown) {
    // 알 수 없는 타입의 에러를 안전하게 문자열 메시지로 정규화
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[notifications] sendEmail 오류:', msg);
    return { success: false, error: msg };
  }
}

// ── SMS 발송 ─────────────────────────────────────────────────

/**
 * icode TCP를 통해 SMS/LMS 발송
 * 90바이트(EUC-KR 기준) 초과 시 자동으로 LMS 전환
 *
 * 반환: 성공 시 { success: true }, 실패 시 { success: false, error }
 */
export async function sendSMS(params: SMSParams): Promise<NotificationResult> {
  // Supabase 클라이언트 확보 — 미초기화 시 즉시 실패 반환
  const sb = getSupabase();
  if (!sb) return { success: false, error: 'Supabase 초기화 실패' };

  try {
    // Edge Function 'send-sms' 호출 — receiver/message 를 body 로 전달
    const { data, error } = await sb.functions.invoke('send-sms', { body: params });
    // invoke 레벨 오류
    if (error) throw error;
    // 함수 응답 본문에 error 필드가 있는 경우
    if (data?.error) throw new Error(data.error);
    // 엣지케이스: error 는 없지만 success 플래그가 falsy 인 경우(발송 게이트웨이 거부 등)
    // → data.message 가 있으면 우선 사용, 없으면 기본 실패 메시지
    if (!data?.success) throw new Error(data?.message || 'SMS 발송 실패');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[notifications] sendSMS 오류:', msg);
    return { success: false, error: msg };
  }
}

// ── 이메일 + SMS 동시 발송 ───────────────────────────────────

/**
 * 이메일과 SMS를 동시에 발송 (Promise.allSettled — 한쪽 실패해도 다른쪽 진행)
 *
 * Promise.all 대신 allSettled 를 쓰는 이유: 두 채널은 독립적이므로
 * 한 채널이 reject 되어도 다른 채널 결과를 폐기하지 않고 각각의 결과를 반환한다.
 */
export async function sendBoth(params: {
  email: EmailParams;
  sms: SMSParams;
}): Promise<{ email: NotificationResult; sms: NotificationResult }> {
  // 두 발송을 병렬 실행하고, 각각의 성공/실패를 개별적으로 수거
  const [emailResult, smsResult] = await Promise.allSettled([
    sendEmail(params.email),
    sendSMS(params.sms),
  ]);

  return {
    // fulfilled 면 실제 결과값 사용, rejected 면 reason 에서 메시지를 추출해 실패로 변환
    // (sendEmail/sendSMS 자체가 reject 하지 않도록 설계되어 있어 보통 fulfilled 분기를 탄다)
    email: emailResult.status === 'fulfilled'
      ? emailResult.value
      : { success: false, error: emailResult.reason?.message },
    sms: smsResult.status === 'fulfilled'
      ? smsResult.value
      : { success: false, error: smsResult.reason?.message },
  };
}

// ── 이메일 템플릿 헬퍼 ───────────────────────────────────────

/**
 * 기본 이메일 HTML 래퍼 (브랜드 일관성 유지)
 *
 * 헤더(로고)·본문(제목 + 전달된 body)·푸터(저작권/문의)로 구성된
 * 반응형 테이블 레이아웃 HTML 문자열을 생성한다.
 * body 파라미터는 이미 안전한 HTML 이라고 가정하고 그대로 삽입한다.
 */
export function buildEmailHtml(params: {
  title: string;
  body: string;
  siteName?: string;
  siteUrl?: string;
  primaryColor?: string;
}): string {
  // 구조분해 + 기본값 — siteName/siteUrl/primaryColor 미지정 시 DreamIT 기본 브랜딩 적용
  const {
    title,
    body,
    siteName = 'DreamIT',
    siteUrl = 'https://www.dreamitbiz.com',
    primaryColor = '#106bb5',
  } = params;

  // 이메일 클라이언트 호환을 위해 table 기반 레이아웃 + 인라인 스타일 사용
  // (백틱 템플릿 리터럴 내부에는 주석을 넣지 않음 — HTML 주석 <!-- --> 만 사용)
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Apple SD Gothic Neo',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <!-- 헤더 -->
        <tr>
          <td style="background:${primaryColor};padding:24px 32px;">
            <a href="${siteUrl}" style="color:#fff;font-size:20px;font-weight:700;text-decoration:none;">${siteName}</a>
          </td>
        </tr>
        <!-- 본문 -->
        <tr>
          <td style="padding:32px;color:#333;font-size:15px;line-height:1.7;">
            <h2 style="margin:0 0 20px;font-size:18px;color:#111;">${title}</h2>
            ${body}
          </td>
        </tr>
        <!-- 푸터 -->
        <tr>
          <td style="padding:20px 32px;background:#f9f9f9;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">
            본 메일은 발신 전용입니다. 문의: <a href="mailto:admin@dreamitbiz.com" style="color:${primaryColor};">admin@dreamitbiz.com</a><br>
            © ${new Date().getFullYear()} DreamIT. All rights reserved.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
