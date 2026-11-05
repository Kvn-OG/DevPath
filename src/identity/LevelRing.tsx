import { useRef } from 'react';
import { gsap, motionOK, useGSAP } from './motion';

/** Anel de progresso do nível: um arco que acende com a faísca na ponta. */
export function LevelRing({ progress, level, size = 46 }: { progress: number; level: number; size?: number }) {
  const arc = useRef<SVGCircleElement>(null);
  const r = 19;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, progress)));

  useGSAP(
    () => {
      if (!arc.current || !motionOK()) return;
      gsap.fromTo(arc.current, { strokeDashoffset: c }, { strokeDashoffset: offset, duration: 1.6, ease: 'expo.out', delay: 0.3 });
    },
    { dependencies: [offset] },
  );

  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 46 46" width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--dp-uv)" />
            <stop offset="1" stopColor="var(--dp-spark)" />
          </linearGradient>
        </defs>
        <circle cx="23" cy="23" r={r} fill="none" stroke="var(--dp-line)" strokeWidth="3" />
        <circle
          ref={arc}
          cx="23"
          cy="23"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 4px var(--dp-glow))' }}
        />
      </svg>
      <span className="font-display absolute text-sm font-semibold tabular-nums">{level}</span>
    </div>
  );
}
