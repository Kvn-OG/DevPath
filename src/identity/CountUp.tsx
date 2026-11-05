import { useRef } from 'react';
import { gsap, motionOK, useGSAP } from './motion';

/** Número que conta do zero até o valor quando aparece. O texto final é sempre o real. */
export function CountUp({ to, suffix = '', duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const node = el.current;
      if (!node || !motionOK() || to === 0) return;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: to,
        duration,
        ease: 'expo.out',
        delay: 0.2,
        onUpdate: () => {
          node.textContent = `${Math.round(obj.v)}${suffix}`;
        },
      });
    },
    { dependencies: [to, suffix] },
  );

  return (
    <span ref={el} className="tabular-nums">
      {to}
      {suffix}
    </span>
  );
}
