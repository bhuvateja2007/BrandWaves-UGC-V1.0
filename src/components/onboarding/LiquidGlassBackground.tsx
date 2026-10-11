import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Full-viewport atmospheric liquid glass background.
 * Uses CSS animations + a lightweight canvas for floating orbs.
 * GPU-friendly: only animates opacity and transform.
 */
export const LiquidGlassBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const orbs = [
      { x: 0.15, y: 0.2, r: 0.32, speedX: 0.00012, speedY: 0.00008, color: '63,114,175' },
      { x: 0.75, y: 0.6, r: 0.28, speedX: -0.00009, speedY: 0.00011, color: '17,45,78' },
      { x: 0.45, y: 0.85, r: 0.22, speedX: 0.00007, speedY: -0.00006, color: '100,140,200' },
      { x: 0.88, y: 0.15, r: 0.18, speedX: -0.00011, speedY: 0.00009, color: '63,114,175' },
    ];

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      t += 0.005;

      for (const orb of orbs) {
        orb.x += orb.speedX * Math.sin(t * 0.7 + orb.r);
        orb.y += orb.speedY * Math.cos(t * 0.5 + orb.r);
        // Soft bounce
        if (orb.x < 0.05 || orb.x > 0.95) orb.speedX *= -1;
        if (orb.y < 0.05 || orb.y > 0.95) orb.speedY *= -1;

        const grd = ctx.createRadialGradient(
          orb.x * w, orb.y * h, 0,
          orb.x * w, orb.y * h, orb.r * Math.min(w, h)
        );
        grd.addColorStop(0, `rgba(${orb.color}, 0.13)`);
        grd.addColorStop(1, `rgba(${orb.color}, 0)`);

        ctx.beginPath();
        ctx.arc(orb.x * w, orb.y * h, orb.r * Math.min(w, h), 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 glass-bg-gradient" />
      {/* Animated orb canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 glass-noise-overlay" aria-hidden="true" />
    </div>
  );
};
