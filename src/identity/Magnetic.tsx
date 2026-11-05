import { useRef, type ReactNode } from 'react';
import { finePointer, gsap, motionOK, useGSAP } from './motion';

/** Envolve um botão de destaque: ele é atraído de leve pelo ponteiro. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const node = el.current;
    if (!node || !motionOK() || !finePointer()) return;
    const xTo = gsap.quickTo(node, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(node, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerleave', leave);
    return () => {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', leave);
    };
  });

  return (
    <span ref={el} className="inline-block">
      {children}
    </span>
  );
}
