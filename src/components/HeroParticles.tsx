/**
 * HeroParticles.tsx — 메인 히어로 배경의 인터랙티브 JS 효과
 *
 * [무엇을 하나]
 *  - <canvas>에 떠다니는 입자(파티클)들을 그리고, 가까운 입자끼리 선으로 잇는
 *    "파티클 네트워크(별자리)" 애니메이션을 requestAnimationFrame으로 돌린다.
 *  - 마우스(포인터)를 따라 입자가 살짝 밀려나고(repel), 커서 주변 입자와 선이 이어지며,
 *    커서 위치에 부드러운 스포트라이트(빛 번짐)가 따라다닌다.
 *
 * [신경 쓴 점]
 *  - 성능: 화면 크기에 비례해 입자 수 제한, devicePixelRatio는 2로 상한, 링크 계산은 O(n²)이라
 *          입자 수를 작게 유지.
 *  - 접근성: prefers-reduced-motion이면 애니메이션 루프를 돌리지 않고 정지 프레임 1장만 그린다.
 *  - 정리: 언마운트 시 rAF 취소 + 모든 이벤트 리스너 해제(메모리 누수 방지).
 *
 * [배치]
 *  - .hero > .hero-bg-effect (pointer-events:none) 안에 두어 버튼/링크 클릭을 가리지 않는다.
 *  - 포인터 이벤트는 부모 .hero 섹션에서 받는다(.hero-bg-effect는 pointer-events:none이라 직접 못 받음).
 */
import { useEffect, useRef, type ReactElement } from 'react';

// 입자 한 개의 상태(위치/속도/반지름).
interface Particle { x: number; y: number; vx: number; vy: number; r: number }

const HeroParticles = (): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const spot = spotRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 모션 최소화 선호 여부(접근성). true면 루프 없이 한 장만 그린다.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 좌표 기준이 되는 부모 히어로 섹션(없으면 캔버스 자신).
    const hero = (canvas.closest('.hero') as HTMLElement) ?? canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    const LINK_DIST = 130;       // 입자끼리 선을 잇는 최대 거리(px)
    const REPEL_DIST = 120;      // 커서가 입자를 밀어내는 반경(px)

    // 캔버스 크기를 부모에 맞추고 입자를 (재)생성.
    const resize = (): void => {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 면적 비례 입자 수(상한 90) — 넓은 화면일수록 더 촘촘하되 과하지 않게.
      const count = Math.max(24, Math.min(90, Math.round((width * height) / 15000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.8,
      }));
    };

    // 한 프레임 그리기(입자 이동 + 점 + 선).
    const render = (): void => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // 커서 근처면 살짝 밀어낸다(부드러운 인터랙션).
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_DIST && dist > 0.01) {
            const force = ((REPEL_DIST - dist) / REPEL_DIST) * 0.25;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985; // 마찰: 밀린 뒤 서서히 평온한 속도로
        p.vy *= 0.985;
        // 기본 표류 속도가 0이 되지 않게 최소치 보정.
        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.04;
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.04;
        // 가장자리를 벗어나면 반대편으로 감싸기(wrap).
        if (p.x < -5) p.x = width + 5; else if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5; else if (p.y > height + 5) p.y = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();
      }

      // 가까운 입자끼리 선 잇기 + 커서와도 선 잇기.
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / LINK_DIST) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (mouse.active) {
          const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (dm < LINK_DIST + 50) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dm / (LINK_DIST + 50)) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    // 애니메이션 루프(모션 최소화면 실행하지 않음).
    const loop = (): void => {
      render();
      raf = window.requestAnimationFrame(loop);
    };

    // 포인터 이동: 캔버스 좌표로 환산 + 스포트라이트 위치 갱신.
    const onMove = (e: PointerEvent): void => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      if (spot) {
        spot.style.setProperty('--mx', `${mouse.x}px`);
        spot.style.setProperty('--my', `${mouse.y}px`);
        spot.style.opacity = '1';
      }
    };
    const onLeave = (): void => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
      if (spot) spot.style.opacity = '0';
    };

    resize();
    window.addEventListener('resize', resize);
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);

    if (reduceMotion) render();   // 정지 프레임 1장
    else raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
      <div ref={spotRef} className="hero-spotlight" aria-hidden="true" />
    </>
  );
};

export default HeroParticles;
