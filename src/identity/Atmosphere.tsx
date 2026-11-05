import { useEffect, useRef } from 'react';
import { finePointer, gsap, motionOK, useGSAP } from './motion';

/**
 * Fundo vivo de todas as páginas: três auroras que derivam devagar,
 * uma grade que some nas bordas e um granulado de filme.
 * Também cuida do holofote dos cartões (.dp-spot), com um único ouvinte.
 */
export function Atmosphere() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!motionOK()) return;
      gsap.utils.toArray<HTMLElement>('.dp-aurora').forEach((el, i) => {
        gsap.to(el, {
          xPercent: gsap.utils.random(-25, 25),
          yPercent: gsap.utils.random(-20, 20),
          scale: gsap.utils.random(0.85, 1.25),
          duration: gsap.utils.random(14, 22),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * -4,
        });
      });
    },
    { scope: root },
  );

  useEffect(() => {
    if (!finePointer()) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (!last) return;
      const el = (last.target as Element | null)?.closest?.('.dp-spot') as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${last.clientX - r.left}px`);
      el.style.setProperty('--my', `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className="dp-atmosphere" aria-hidden>
      <div className="dp-aurora" style={{ width: '46vw', height: '46vw', left: '-10vw', top: '-18vw', background: 'var(--dp-aurora-a)' }} />
      <div className="dp-aurora" style={{ width: '38vw', height: '38vw', right: '-12vw', top: '18vh', background: 'var(--dp-aurora-c)' }} />
      <div className="dp-aurora" style={{ width: '42vw', height: '30vw', left: '30vw', bottom: '-16vw', background: 'var(--dp-aurora-b)' }} />
      <div className="dp-grid" />
      <div className="dp-noise" />
    </div>
  );
}
