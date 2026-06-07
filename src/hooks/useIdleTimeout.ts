/**
 * useIdleTimeout.ts
 *
 * 역할:
 *   사용자의 무동작(idle) 상태를 감지하여 일정 시간이 지나면 자동 로그아웃을 트리거하는 커스텀 React 훅.
 *   로그아웃 직전에는 화면 우상단에 경고 토스트를, 로그아웃 시점에는 안내 토스트를 직접 DOM에 그린다.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * 초보자를 위한 배경/용어 정리 (이 파일을 처음 보는 사람도 이해할 수 있도록):
 *
 *   • "idle(아이들)" = 무동작 상태. 사용자가 한동안 마우스/키보드를 전혀 만지지 않은 상태를 말한다.
 *     은행 사이트에서 가만히 두면 "자동 로그아웃되었습니다"가 뜨는 그 기능이 바로 이것이다.
 *     (보안 목적: 자리를 비운 사이 남이 화면을 조작하는 것을 막기 위함)
 *
 *   • "커스텀 훅(custom hook)" = React에서 재사용 가능한 로직을 함수로 묶은 것.
 *     이름이 반드시 'use'로 시작해야 하며(use + IdleTimeout), 컴포넌트 안에서 호출해 사용한다.
 *     이 훅은 화면(JSX)을 반환하지 않고, 오직 "부수효과(side effect)"만 일으킨다.
 *     (부수효과 = 화면 그리기 외에 일어나는 일. 예: 타이머 설정, 이벤트 등록, DOM 직접 조작)
 *
 *   • "토스트(toast)" = 화면 구석에 잠깐 떴다 사라지는 알림 메시지. 여기서는 직접 <div>를
 *     만들어 document.body에 붙이는 방식으로 구현했다(별도 UI 라이브러리 없이 순수 DOM 조작).
 *
 *   • "타이머(setTimeout)" = "몇 ms 뒤에 이 함수를 실행해줘"라고 브라우저에 예약하는 함수.
 *     예약을 취소하려면 clearTimeout(예약번호)를 호출한다. (ms = 밀리초, 1000ms = 1초)
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

// React에서 필요한 3가지 훅을 가져온다. 각각의 역할은 아래와 같다.
//   • useEffect  : 컴포넌트가 화면에 나타난 뒤(=마운트 후) 실행할 부수효과를 등록한다.
//   • useRef     : 값을 "상자"에 담아 두는 도구. 값이 바뀌어도 화면을 다시 그리지(리렌더) 않는다.
//                  (반대로 useState는 값이 바뀌면 화면을 다시 그린다 — 여기서는 그게 필요 없어 useRef 사용)
//   • useCallback: 함수를 "기억(메모이즈)"해 두어 매 렌더마다 새 함수가 만들어지는 것을 막는다.
//                  (그래야 useEffect 의존성 배열에 넣어도 불필요하게 effect가 재실행되지 않는다)
import { useEffect, useRef, useCallback } from 'react'

// 훅 동작을 제어하는 옵션 정의
// interface(인터페이스) = TypeScript에서 "객체가 어떤 모양이어야 하는지"를 미리 약속하는 틀.
// 아래처럼 적어 두면, 이 훅을 쓰는 사람이 잘못된 값을 넘기면 편집기/컴파일러가 미리 잡아준다.
interface UseIdleTimeoutOptions {
  /** 자동 로그아웃 시간 (ms). 기본값 60분 */
  // 끝의 '?'는 "선택값(optional)"이라는 뜻 — 넘기지 않아도 되며, 그러면 아래 기본값이 쓰인다.
  timeout?: number
  /** 타임아웃 전 경고 시점 (ms). 기본값 2분 전 */
  // "타임아웃 2분 전"이라는 의미. timeout=60분, warningBefore=2분이면 58분째에 경고가 뜬다.
  warningBefore?: number
  /** 타임아웃 시 호출할 콜백 */
  // '?'가 없으므로 필수값. () => void 는 "인자 없이 받고 아무것도 반환하지 않는 함수" 타입.
  // 예: 실제 로그아웃 처리(세션 종료, 로그인 페이지로 이동 등)를 여기에 연결한다.
  onTimeout: () => void
  /** 훅 활성화 여부. false면 타이머 비활성 */
  // 예를 들어 로그인하지 않은 화면에서는 enabled=false로 꺼 두는 식으로 쓴다.
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
// 아래는 "구조 분해 할당(destructuring) + 기본값(default value)" 문법이다.
// 즉 인자로 받은 옵션 객체에서 timeout/warningBefore/onTimeout/enabled를 꺼내되,
// 값이 없으면 '=' 뒤의 기본값을 사용한다. (예: timeout이 안 들어오면 60분으로 설정)
export function useIdleTimeout({
  timeout = 60 * 60 * 1000,        // 60분 * 60초 * 1000ms = 3,600,000ms = 60분
  warningBefore = 2 * 60 * 1000,   // 2분 * 60초 * 1000ms = 120,000ms = 2분
  onTimeout,
  enabled = true,
}: UseIdleTimeoutOptions) {
  // 토스트 문구 표시용 분 단위 환산값(ms -> 분, 반올림)
  // 60000ms = 1분이므로, ms를 60000으로 나누면 분(minute) 단위가 된다. Math.round로 깔끔하게 반올림.
  const timeoutMinutes = Math.round(timeout / 60000)
  const warningMinutes = Math.round(warningBefore / 60000)

  // onTimeout 콜백을 ref에 보관: effect/타이머 클로저가 항상 최신 콜백을 참조하도록 하여
  // 콜백 변경으로 인한 불필요한 effect 재실행을 피한다.
  //
  // [왜 ref에 담는가? — 초보가 가장 헷갈리는 부분]
  //   setTimeout 안의 함수는 "예약될 당시의 onTimeout 값"을 기억(클로저)한다.
  //   만약 onTimeout을 직접 쓰면, 부모가 콜백을 새로 바꿔 넘길 때마다 effect를 다시 돌려야 한다.
  //   대신 onTimeoutRef.current 로 읽으면 항상 "지금 이 순간의 최신 콜백"을 가져올 수 있어,
  //   타이머를 다시 깔지 않고도 최신 함수를 호출할 수 있다.
  const onTimeoutRef = useRef(onTimeout)
  // 매 렌더마다 ref 상자 안의 값을 최신 콜백으로 갱신한다(이 줄은 화면을 다시 그리지 않는다).
  onTimeoutRef.current = onTimeout

  // setTimeout 핸들 보관용 ref들(렌더 간 유지, 재할당해도 리렌더 미발생)
  // setTimeout이 돌려주는 "예약 번호"를 담아 두었다가, 나중에 clearTimeout으로 취소할 때 쓴다.
  // ReturnType<typeof setTimeout> 은 "setTimeout이 반환하는 타입"을 가리키는 TS 표현
  // (브라우저/Node 환경에 따라 타입이 달라서 이렇게 안전하게 적는다). 초기값은 아직 없으므로 null.
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningId = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 마지막 활동 시각(ms). visibilitychange 시 경과 시간 계산에 사용
  // Date.now()는 1970년부터 지금까지의 밀리초를 돌려준다. "마지막으로 움직인 시각"을 기록해 둔다.
  const lastActivity = useRef(Date.now())
  // 활동 이벤트 throttle 플래그(고빈도 이벤트 폭주 방지)
  // throttle(스로틀) = "일정 시간 동안은 한 번만 실행"하는 기법. 마우스를 움직이면 mousemove 이벤트가
  // 초당 수십~수백 번 발생하는데, 매번 타이머를 다시 까는 것은 낭비라 1초에 1번만 처리하도록 막는 깃발.
  const throttled = useRef(false)

  /**
   * clearTimers
   * 등록된 경고/타임아웃 타이머를 모두 취소하고 ref를 초기화한다.
   * @returns 없음. 부수효과: 진행 중인 setTimeout 취소.
   */
  // useCallback(함수, [])의 빈 배열은 "이 함수를 한 번만 만들고 계속 재사용하라"는 뜻.
  // 의존하는 외부 값이 없으니 의존성 배열이 비어 있다.
  const clearTimers = useCallback(() => {
    // ref 상자에 예약 번호가 들어 있을 때만(=null이 아닐 때만) 취소한다.
    if (timeoutId.current) clearTimeout(timeoutId.current)
    if (warningId.current) clearTimeout(warningId.current)
    // 취소했으니 상자를 비워 둔다(다음에 if 검사로 중복 취소를 피하기 위함).
    timeoutId.current = null
    warningId.current = null
  }, [])

  /**
   * removeWarning
   * 현재 떠 있는 경고 토스트 엘리먼트(id=idle-timeout-warning)를 DOM에서 제거한다.
   * @returns 없음. 부수효과: DOM 노드 제거(없으면 무시).
   */
  const removeWarning = useCallback(() => {
    // 옵셔널 체이닝(?.)에 주목: getElementById가 null(=해당 요소 없음)을 돌려줘도
    // 에러 없이 그냥 아무 일도 안 하고 넘어간다. (.remove()를 null에서 부르면 에러가 나기 때문)
    document.getElementById('idle-timeout-warning')?.remove()
  }, [])

  /**
   * ensureStyle
   * 토스트 애니메이션용 <style> 태그(id=idle-timeout-style)를 head에 1회만 주입한다.
   * @returns 없음. 부수효과: 중복 주입 방지 후 keyframes 스타일 추가.
   */
  const ensureStyle = useCallback(() => {
    // 이미 주입돼 있으면 중복 생성하지 않고 종료
    // (토스트가 뜰 때마다 같은 <style>이 쌓이는 것을 막는 "한 번만 실행" 패턴)
    if (document.getElementById('idle-timeout-style')) return
    // 새 <style> 요소를 만들고 식별용 id를 붙인다(다음에 위 if 검사로 중복을 걸러내기 위함).
    const s = document.createElement('style')
    s.id = 'idle-timeout-style'
    // 슬라이드 인 / 페이드 아웃 키프레임 정의(배열 join으로 한 문자열 구성)
    // @keyframes = CSS 애니메이션의 "시작~끝 동작"을 정의하는 문법.
    //   idleSlideIn : 오른쪽 바깥(translateX(100%))에서 제자리로 미끄러져 들어오며 서서히 보임.
    //   idleFadeOut : 보이던 상태에서 투명(opacity:0)으로 서서히 사라짐.
    // 배열로 두 줄을 적은 뒤 .join('')으로 한 문자열로 이어 붙인다(가독성을 위한 작성 방식).
    s.textContent = [
      '@keyframes idleSlideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}',
      '@keyframes idleFadeOut{from{opacity:1}to{opacity:0}}',
    ].join('')
    // 완성한 <style>을 문서의 <head>에 붙이면 그때부터 위 애니메이션을 쓸 수 있다.
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
    ensureStyle() // 애니메이션 CSS가 아직 없으면 먼저 주입(있으면 내부에서 그냥 통과)
    const el = document.createElement('div')         // 토스트로 쓸 빈 <div> 생성
    el.id = 'idle-timeout-warning'                   // 위 중복 검사 및 removeWarning에서 찾을 수 있게 id 부여
    // 인라인 CSS를 한 번에 적용(별도 CSS 파일 없이 자바스크립트로 스타일 지정).
    //   position:fixed + top/right : 스크롤과 무관하게 화면 우상단에 고정.
    //   z-index:99999             : 다른 요소들 위로 항상 보이게(아주 큰 값).
    //   background:#f59e0b        : 주황색(경고 느낌).
    //   animation:idleSlideIn ... : 위에서 정의한 슬라이드 인 애니메이션 0.3초간 적용.
    el.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:99999;background:#f59e0b;color:#fff;' +
      'padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;' +
      'box-shadow:0 4px 12px rgba(0,0,0,.15);animation:idleSlideIn .3s ease;'
    // ⚠️ 는 경고 이모지(⚠️) 유니코드 이스케이프. 남은 경고 시간(분)을 안내한다.
    // 백틱(`)으로 감싼 "템플릿 리터럴" 문자열: ${...} 안의 값(warningMinutes)이 문자열에 끼워 넣어진다.
    // 주의: 백틱 문자열 안에는 절대 주석을 쓰면 안 된다(주석 글자까지 그대로 화면에 출력되기 때문).
    el.textContent = `⚠️ ${warningMinutes}분 후 자동 로그아웃됩니다. 활동을 계속하려면 화면을 클릭하거나 마우스를 움직여주세요.`
    document.body.appendChild(el)                    // 완성한 토스트를 화면(body)에 실제로 붙인다
  }, [ensureStyle, warningMinutes])
  // ↑ 의존성 배열: 이 함수가 ensureStyle 또는 warningMinutes를 사용하므로 둘을 적어 둔다.
  //   (둘 중 하나가 바뀌면 useCallback이 함수를 새로 만들어 최신 값을 쓰게 한다)

  /**
   * showLogoutNotice
   * 자동 로그아웃이 완료되었음을 알리는 빨간색 안내 토스트를 표시하고, 일정 시간 후 자동 제거한다.
   * @returns 없음. 부수효과: 경고 제거 후 안내 엘리먼트 추가, 약 5초 뒤 페이드아웃하여 제거.
   */
  const showLogoutNotice = useCallback(() => {
    removeWarning() // 경고 토스트가 떠 있으면 먼저 제거(경고와 안내가 동시에 겹쳐 뜨는 것 방지)
    ensureStyle()
    const el = document.createElement('div')
    // 위 경고 토스트와 거의 같은 스타일이지만 background:#ef4444(빨간색)로 "로그아웃됨"을 강조.
    el.style.cssText =
      'position:fixed;top:16px;right:16px;z-index:99999;background:#ef4444;color:#fff;' +
      'padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;' +
      'box-shadow:0 4px 12px rgba(0,0,0,.15);animation:idleSlideIn .3s ease;'
    // 🔒 는 자물쇠 이모지(🔒) 유니코드 이스케이프. 무동작 시간(분)을 안내한다.
    // (주의: 여기도 백틱 문자열 내부이므로 주석 금지)
    el.textContent = `🔒 ${timeoutMinutes}분 무동작으로 자동 로그아웃되었습니다.`
    document.body.appendChild(el)
    // 4.7초 노출 후 페이드아웃 애니메이션(0.3s) 적용, 애니메이션 종료 시점에 DOM 제거
    // [2단계 타이머 구조] 토스트를 잠깐 보여준 뒤 부드럽게 사라지게 하는 흔한 패턴이다.
    setTimeout(() => {
      // 1단계: 4.7초 뒤 페이드아웃 애니메이션을 시작(forwards = 끝 상태인 투명을 그대로 유지).
      el.style.animation = 'idleFadeOut .3s ease forwards'
      // 2단계: 애니메이션 길이(0.3초=300ms)만큼 더 기다린 뒤 실제 DOM에서 토스트를 제거.
      //         (사라지는 애니메이션이 끝나기 전에 지우면 뚝 끊겨 보이므로 시간을 맞춘 것)
      setTimeout(() => el.remove(), 300)
    }, 4700)
  }, [removeWarning, ensureStyle, timeoutMinutes])

  /**
   * resetTimers
   * 기존 타이머/경고를 정리하고, 마지막 활동 시각을 갱신한 뒤 경고/타임아웃 타이머를 새로 건다.
   * @returns 없음. 부수효과: lastActivity 갱신, 두 개의 setTimeout 재등록.
   */
  // 핵심 아이디어: 사용자가 활동할 때마다 "기존 카운트다운을 지우고 처음부터 다시 시작"한다.
  // 그래야 활동이 이어지는 동안에는 만료 타이머가 계속 미뤄져 로그아웃되지 않는다.
  const resetTimers = useCallback(() => {
    clearTimers()                  // 이전에 걸어 둔 경고/만료 타이머를 먼저 모두 취소
    removeWarning()                // 떠 있던 경고 토스트도 치운다(활동했으니 경고는 무의미)
    lastActivity.current = Date.now() // "지금" 활동했다고 기록(visibilitychange 계산에 쓰임)
    // 경고 타이머: 타임아웃까지 warningBefore 남은 시점에 경고 노출
    // 예) timeout 60분, warningBefore 2분이면 60-2=58분 뒤에 경고를 띄운다.
    warningId.current = setTimeout(() => showWarning(), timeout - warningBefore)
    // 만료 타이머: timeout 경과 시 로그아웃 안내 + onTimeout 콜백 실행
    timeoutId.current = setTimeout(() => {
      showLogoutNotice()           // 화면에 "로그아웃되었습니다" 안내 토스트 표시
      onTimeoutRef.current()       // ref에 담아 둔 "최신" 로그아웃 콜백을 실제로 호출
    }, timeout)
  }, [timeout, warningBefore, clearTimers, removeWarning, showWarning, showLogoutNotice])

  // 활동 이벤트 리스너 등록/해제 및 가시성 변화 처리를 담당하는 메인 effect
  // useEffect(함수, [의존성]) : 의존성 배열의 값이 바뀔 때마다 함수를 다시 실행한다.
  // return으로 돌려주는 "클린업 함수"는 다음 실행 직전 또는 컴포넌트가 사라질 때 호출되어 뒷정리를 한다.
  useEffect(() => {
    // 비활성화 상태면 타이머/경고를 모두 정리하고 리스너 등록 없이 종료
    // (enabled=false인데 타이머가 살아 있으면 안 되므로, 먼저 깨끗이 치우고 일찍 return)
    if (!enabled) {
      clearTimers()
      removeWarning()
      return
    }

    // 사용자 활동 핸들러: throttle로 1초에 1회만 실제 리셋을 수행해 고빈도 이벤트 부담 완화
    const handleActivity = () => {
      // throttle 적용 중(1초가 안 지남)이면 아무것도 하지 않고 즉시 빠져나간다.
      if (throttled.current) return
      throttled.current = true                         // 잠금 ON: 이후 1초 동안은 위 if에서 걸러진다
      setTimeout(() => { throttled.current = false }, 1000) // 1초 뒤 잠금 해제(다시 처리 허용)
      resetTimers()                                    // 1초에 최대 1번만 카운트다운을 리셋
    }

    // 탭 가시성 변화 핸들러
    // (사용자가 다른 탭/창으로 갔다가 돌아올 때 호출된다)
    const handleVisibility = () => {
      if (document.hidden) return // 탭이 숨겨질 때는 무시(다시 보일 때만 검사)
      // 백그라운드에 있던 동안 타이머는 throttle/브라우저 정책으로 부정확할 수 있으므로,
      // 다시 보일 때 실제 경과 시간을 직접 계산해 만료 여부를 판정한다.
      // [왜 필요한가?] 브라우저는 화면에 안 보이는 탭의 setTimeout을 느리게/늦게 실행할 수 있어,
      //   타이머만 믿으면 한참 자리를 비웠는데도 로그아웃이 안 되는 일이 생긴다. 그래서 직접 시간을 잰다.
      if (Date.now() - lastActivity.current >= timeout) {
        // 마지막 활동 이후 timeout 이상이 흘렀다면 → 이미 만료된 것이므로 즉시 로그아웃 처리.
        showLogoutNotice()
        onTimeoutRef.current()
      } else {
        resetTimers() // 아직 만료 전이면 타이머 재정렬(남은 시간 기준으로 다시 카운트다운 시작)
      }
    }

    // 감지할 활동 이벤트 목록(읽기 전용 튜플)
    // as const : 이 배열을 "값이 고정된 읽기 전용"으로 다루도록 TS에 알려주는 표현
    //            (요소 타입이 정확히 'mousemove' | 'keydown' ... 로 좁혀져 안전해진다)
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const
    // passive:true 로 스크롤 등 성능 영향 최소화하며 window에 리스너 등록
    // passive(패시브) = "이 핸들러는 스크롤을 막지 않겠다"는 약속 → 브라우저가 스크롤을 더 부드럽게 처리.
    // forEach로 위 5개 이벤트 각각에 같은 handleActivity 함수를 연결한다.
    events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }))
    document.addEventListener('visibilitychange', handleVisibility)
    resetTimers() // 마운트(또는 의존성 변경) 시 즉시 타이머 시작

    // 클린업: 등록한 리스너/타이머/경고를 모두 해제하여 누수 방지
    // 주의: addEventListener로 켠 것은 반드시 removeEventListener로 꺼야 메모리 누수/중복 등록을 막는다.
    //       이때 등록할 때와 "똑같은 함수 참조(handleActivity)"를 넘겨야 정상적으로 제거된다.
    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleActivity))
      document.removeEventListener('visibilitychange', handleVisibility)
      clearTimers()
      removeWarning()
    }
    // 의존성 배열: 이 값들 중 하나라도 바뀌면 effect를 다시 실행한다(먼저 위 클린업으로 정리 후 재등록).
    // useCallback으로 감싼 함수들이 들어 있어, 그 함수들이 바뀌지 않는 한 effect도 헛돌지 않는다.
  }, [enabled, timeout, resetTimers, clearTimers, removeWarning, showLogoutNotice])
}
