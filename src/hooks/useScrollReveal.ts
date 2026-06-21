/**
 * useScrollReveal — 스크롤 등장 애니메이션 훅
 *
 * [무엇을 하나]
 *  화면(document) 안의 `.reveal` 요소들을 IntersectionObserver로 관찰하다가,
 *  뷰포트에 들어오는 순간 `is-visible` 클래스를 붙여 CSS 트랜지션(페이드+상승)을 켠다.
 *  한 번 보이면 더는 관찰하지 않는다(unobserve) — 깜빡임/재실행 방지.
 *
 * [접근성]
 *  prefers-reduced-motion이면 관찰 없이 즉시 모두 보이게 처리(애니메이션 생략).
 *
 * [사용법]
 *  페이지 컴포넌트 최상단에서 useScrollReveal()를 호출하고,
 *  등장시키고 싶은 요소에 className="reveal"(+선택적 --reveal-delay 인라인 스타일)을 준다.
 *
 * @param deps 관찰 대상이 렌더된 뒤 다시 스캔해야 할 때 넣는 의존성(기본 []: 마운트 1회).
 */
import { useEffect } from 'react';

export function useScrollReveal(deps: unknown[] = []): void {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'));
    if (els.length === 0) return;

    // 모션 최소화 선호 시: 애니메이션 없이 즉시 노출.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target); // 한 번 등장하면 관찰 종료
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useScrollReveal;
