/**
 * useIdleTimeout.ts
 *
 * 역할:
 *   사용자의 무동작(idle) 상태를 감지하여 일정 시간이 지나면 자동 로그아웃을 트리거하는 커스텀 React 훅.
 *   로그아웃 직전에는 화면 우상단에 경고 토스트를, 로그아웃 시점에는 안내 토스트를 직접 DOM에 그린다.
 *
 * 핵심 책임:
 *   - 마우스/키보드/클릭/스크롤/터치 등 사용자 활동 이벤트를 감지해 idle 타이머를 리셋한다.
 *   - 타임아웃 전(warningBefore) 시점에 경고 UI를 노출한다.
 *   - 타임아웃 도달 시 로그아웃 콜백(onTimeout)을 호출하고 안내 UI를 노출한다.
 *   - 탭 가시성(visibilitychange) 변화 시, 백그라운드 동안 경과한 시간을 검사해 즉시 만료 처리한다.
 *   - 경고/안내 토스트에 필요한 CSS 키프레임을 1회만 주입한다.
 *
 * 주요 export:
 *   - useIdleTimeout(options): 위 동작을 수행하는 훅. 반환값 없음(부수효과 전용 훅).
 *   - UseIdleTimeoutOptions: 훅 옵션 타입(파일 내부 interface, default export 아님).
 */
import { useEffect, useRef, useCallback } from 'react'

// 훅 동작을 제어하는 옵션 정의
interface UseIdleTimeoutOptions {
  /** 자동 로그아웃 시간 (ms). 기본값 60분 */
  timeout?: number
  /** 타임아웃 전 경고 시점 (ms). 기본값 2분 전 */
  warningBefore?: number
  /** 타임아웃 시 호출할 콜백 */
  onTimeout: () => void
  /** 훅 활성화 여부. false면 타이머 비활성 */
  enabled?: boolean
}

/**
 * useIdleTimeout
 * 무동작 자동 로그아웃 로직을 설치하는 훅.
 *
 * @param timeout       무동작 허용 시간(ms). 이 시간 동안 활동이 없으면 onTimeout 호출. 기본 60분.
 * @param warningBefore 타임아웃 몇 ms 전에 경고 토스트를 띄울지. 기본 2분 전.
 * @param onTimeout     타임아웃 도달 시 실행할 콜백(예: 세션 종료/로그아웃 처리). 필수.
 * @param enabled       false면 모든 타이머/이벤트를 해제하고 아무 것도 하지 않음. 기본 true.
 * @returns 없음(void). 부수효과로 전역 이벤트 리스너 등록 및 DOM 토스트 생성/제거.
 */
export function useIdleTimeout({
  timeout = 60 * 60 * 1000,
  warningBefore = 2 * 60 * 1000,
  onTimeout,
  enabled = true,
}: UseIdleTimeoutOptions) {
  // 토스트 문구 표시용 분 단위 환산값(ms -> 분, 반올림)
  const timeoutMinutes = Math.round(timeout / 60000)
  const warningMinutes = Math.round(warningBefore / 60000)
  // onTimeout 콜백을 ref에 보관: effect/타이머 클로저가 항상 최신 콜백을 참조하도록 하여
  // 콜백 변경으로 인한 불필요한 effect 재실행을 피한다.
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  // setTimeout 핸들 보관용 ref들(렌더 간 유지, 재할당해도 리렌더 미발생)
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningId = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 마지막 활동 시각(ms). visibilitychange 시 경과 시간 계산에 사용
  const lastActivity = useRef(Date.now())
  // 활동 이벤트 throttle 플래그(고빈도 이벤트 폭주 방지)
  const throttled = useRef(false)

  /**
   * clearTimers
   * 등록된 경고/타임아웃 타이머를 모두 취소하고 ref를 초기화한다.
   * @returns 없음. 부수효과: 진행 중인 setTimeout 취소.
   */
  const clearTimers = useCallback(() => {
    if (timeoutId.current) clearTimeout(timeoutId.current)
    if (warningId.current) clearTimeout(warningId.current)
    timeoutId.current = null
    warningId.current = null
  }, [])

  /**
   * removeWarning
   * 현재 떠 있는 경고 토스트 엘리먼트(id=idle-timeout-warning)를 DOM에서 제거한다.
   * @returns 없음. 부수효과: DOM 노드 제거(없으면 무시).
   */
  const removeWarning = useCallback(() => {
    document.getElementById('idle-timeout-warning')?.remove()
  }, [])

  /**
   * ensureStyle
   * 토스트 애니메이션용 <style> 태그(id=idle-timeout-style)를 head에 1회만 주입한다.
   * @returns 없음. 부수효과: 중복 주입 방지 후 keyframes 스타일 추가.
   */
  const ensureStyle = useCallback(() => {
    // 이미 주입돼 있으면 중복 생성하지 않고 종료
    if (document.getElementById('idle-timeout-style')) return
    const s = document.createElement('style')
    s.id = 'idle-timeout-style'
    // 슬라이드 인 / 페이드 아웃 키프레임 정의(배열 join으로 한 문자열 구성)
    s.textContent = [
      '@keyframes idleSlideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}',
      '@keyframes idleFadeOut{from{opacity:1}to{opacity:0}}',
    ].join('')
    document.head.appendChild(s)
  }, [])

  /**
   * showWarning
   * 자동 로그아웃 임박을 알리는 주황색 경고 토스트를 우상단에 표시한다.
   * @returns 없음. 부수효과: DOM에 경고 엘리먼트 추가(이미 있으면 중복 표시 안 함).
   */
  const showWarning = useCallback(() => {
    // 이미 경고가 떠 있으면 중복 생성 방지
    if (document.getElementById('idle-timeout-warning')) return
    ensureStyle()
    const el = document.createElement('div')
    el.id = 'idle-timeout-warning'
    el.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:99999;background:#f59e0b;color:#fff;' +
      'padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;' +
      'box-shadow:0 4px 12px rgba(0,0,0,.15);animation:idleSlideIn .3s ease;'
    // ⚠️ 는 경고 이모지(⚠️) 유니코드 이스케이프. 남은 경고 시간(분)을 안내한다.
    el.textContent = `\u26a0\ufe0f ${warningMinutes}분 후 자동 로그아웃됩니다. 활동을 계속하려면 화면을 클릭하거나 마우스를 움직여주세요.`
    document.body.appendChild(el)
  }, [ensureStyle, warningMinutes])

  /**
   * showLogoutNotice
   * 자동 로그아웃이 완료되었음을 알리는 빨간색 안내 토스트를 표시하고, 일정 시간 후 자동 제거한다.
   * @returns 없음. 부수효과: 경고 제거 후 안내 엘리먼트 추가, 약 5초 뒤 페이드아웃하여 제거.
   */
  const showLogoutNotice = useCallback(() => {
    removeWarning() // 경고 토스트가 떠 있으면 먼저 제거
    ensureStyle()
    const el = document.createElement('div')
    el.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:99999;background:#ef4444;color:#fff;' +
      'padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;' +
      'box-shadow:0 4px 12px rgba(0,0,0,.15);animation:idleSlideIn .3s ease;'
    // 🔒 는 자물쇠 이모지(🔒) 유니코드 이스케이프. 무동작 시간(분)을 안내한다.
    el.textContent = `\ud83d\udd12 ${timeoutMinutes}분 무동작으로 자동 로그아웃되었습니다.`
    document.body.appendChild(el)
    // 4.7초 노출 후 페이드아웃 애니메이션(0.3s) 적용, 애니메이션 종료 시점에 DOM 제거
    setTimeout(() => {
      el.style.animation = 'idleFadeOut .3s ease forwards'
      setTimeout(() => el.remove(), 300)
    }, 4700)
  }, [removeWarning, ensureStyle, timeoutMinutes])

  /**
   * resetTimers
   * 기존 타이머/경고를 정리하고, 마지막 활동 시각을 갱신한 뒤 경고/타임아웃 타이머를 새로 건다.
   * @returns 없음. 부수효과: lastActivity 갱신, 두 개의 setTimeout 재등록.
   */
  const resetTimers = useCallback(() => {
    clearTimers()
    removeWarning()
    lastActivity.current = Date.now()
    // 경고 타이머: 타임아웃까지 warningBefore 남은 시점에 경고 노출
    warningId.current = setTimeout(() => showWarning(), timeout - warningBefore)
    // 만료 타이머: timeout 경과 시 로그아웃 안내 + onTimeout 콜백 실행
    timeoutId.current = setTimeout(() => {
      showLogoutNotice()
      onTimeoutRef.current()
    }, timeout)
  }, [timeout, warningBefore, clearTimers, removeWarning, showWarning, showLogoutNotice])

  // 활동 이벤트 리스너 등록/해제 및 가시성 변화 처리를 담당하는 메인 effect
  useEffect(() => {
    // 비활성화 상태면 타이머/경고를 모두 정리하고 리스너 등록 없이 종료
    if (!enabled) {
      clearTimers()
      removeWarning()
      return
    }

    // 사용자 활동 핸들러: throttle로 1초에 1회만 실제 리셋을 수행해 고빈도 이벤트 부담 완화
    const handleActivity = () => {
      if (throttled.current) return
      throttled.current = true
      setTimeout(() => { throttled.current = false }, 1000)
      resetTimers()
    }

    // 탭 가시성 변화 핸들러
    const handleVisibility = () => {
      if (document.hidden) return // 탭이 숨겨질 때는 무시(다시 보일 때만 검사)
      // 백그라운드에 있던 동안 타이머는 throttle/브라우저 정책으로 부정확할 수 있으므로,
      // 다시 보일 때 실제 경과 시간을 직접 계산해 만료 여부를 판정한다.
      if (Date.now() - lastActivity.current >= timeout) {
        showLogoutNotice()
        onTimeoutRef.current()
      } else {
        resetTimers() // 아직 만료 전이면 타이머 재정렬
      }
    }

    // 감지할 활동 이벤트 목록(읽기 전용 튜플)
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const
    // passive:true 로 스크롤 등 성능 영향 최소화하며 window에 리스너 등록
    events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }))
    document.addEventListener('visibilitychange', handleVisibility)
    resetTimers() // 마운트(또는 의존성 변경) 시 즉시 타이머 시작

    // 클린업: 등록한 리스너/타이머/경고를 모두 해제하여 누수 방지
    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleActivity))
      document.removeEventListener('visibilitychange', handleVisibility)
      clearTimers()
      removeWarning()
    }
  }, [enabled, timeout, resetTimers, clearTimers, removeWarning, showLogoutNotice])
}
