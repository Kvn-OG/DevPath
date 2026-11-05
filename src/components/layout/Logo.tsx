import { useRef } from 'react';
import { gsap, motionOK, useGSAP } from '../../identity/motion';

/**
 * A marca do DevPath: um caminho sinuoso com três nós — de onde você saiu,
 * onde está e a faísca para onde vai. O traço se desenha ao carregar.
 */
export function LogoMark({ size = 26, animate = false }: { size?: number; animate?: boolean }) {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      if (!animate || !motionOK()) return;
      const tl = gsap.timeline({ delay: 0.2 });
      tl.from('.lm-path', { drawSVG: '0%', duration: 1.1, ease: 'power3.inOut' })
        .from('.lm-node', { scale: 0, transformOrigin: '50% 50%', stagger: 0.18, duration: 0.6, ease: 'back.out(3)' }, 0.1)
        .from('.lm-glow', { opacity: 0, scale: 0.2, transformOrigin: '50% 50%', duration: 0.8 }, 0.7);
    },
    { scope: root },
  );

  return (
    <svg ref={root} width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id="lm-grad" x1="6" y1="25" x2="26" y2="7" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--dp-uv)" />
          <stop offset="0.55" stopColor="var(--dp-plasma)" />
          <stop offset="1" stopColor="var(--dp-spark)" />
        </linearGradient>
        <radialGradient id="lm-halo">
          <stop offset="0" stopColor="var(--dp-spark)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--dp-spark)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="var(--dp-surface-2)" stroke="var(--dp-line-strong)" />
      <path className="lm-path" d="M8 23.5C8 16.5 15.5 19.5 16 14S22 8.5 24.5 8.5" stroke="url(#lm-grad)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle className="lm-glow" cx="24.5" cy="8.5" r="7" fill="url(#lm-halo)" />
      <circle className="lm-node" cx="8" cy="23.5" r="2.4" fill="var(--dp-surface-2)" stroke="var(--dp-uv)" strokeWidth="1.8" />
      <circle className="lm-node" cx="16" cy="14.2" r="1.9" fill="var(--dp-plasma)" />
      <circle className="lm-node" cx="24.5" cy="8.5" r="2.7" fill="var(--dp-spark)" />
    </svg>
  );
}

export function Logo({ animate = false }: { animate?: boolean }) {
  return (
    <span className="font-display flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-fg">
      <LogoMark animate={animate} />
      <span>
        Dev<span className="text-accent-strong">Path</span>
      </span>
    </span>
  );
}
