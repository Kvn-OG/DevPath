import { useRef, useState } from 'react';
import { gsap, motionOK, useGSAP } from './motion';

const KEY = 'devpath:intro';

function shouldPlay(): boolean {
  if (!motionOK()) return false;
  try {
    if (window.sessionStorage.getItem(KEY)) return false;
    window.sessionStorage.setItem(KEY, '1');
  } catch {
    // sem sessionStorage: toca mesmo assim
  }
  return true;
}

/**
 * Abertura (uma vez por sessão): o caminho se desenha, os nós acendem,
 * o nome sobe letra por letra e a cortina se abre de baixo para cima.
 * Um clique pula. É decorativa: leitores de tela não a veem.
 */
export function Intro() {
  const [play] = useState(shouldPlay);
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (!play) return;
      const t = gsap.timeline({ onComplete: () => setDone(true) });
      tl.current = t;
      t.from('.in-path', { drawSVG: '0%', duration: 1, ease: 'power3.inOut' })
        .from('.in-node', { scale: 0, transformOrigin: '50% 50%', stagger: 0.16, duration: 0.5, ease: 'back.out(3)' }, 0.1)
        .from('.in-halo', { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.7 }, 0.75)
        .from('.in-char', { yPercent: 120, duration: 0.8, stagger: 0.04, ease: 'expo.out' }, 0.55)
        .from('.in-tag', { opacity: 0, y: 8, duration: 0.6 }, 0.95)
        .to('.in-bar', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.4)
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' }, '+=0.15');
    },
    { scope: root },
  );

  if (!play || done) return null;

  return (
    <div
      ref={root}
      aria-hidden
      onClick={() => tl.current?.progress(1)}
      className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center gap-6 bg-bg"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
    >
      <svg width="120" height="120" viewBox="0 0 32 32" className="overflow-visible">
        <defs>
          <linearGradient id="in-grad" x1="6" y1="25" x2="26" y2="7" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--dp-uv)" />
            <stop offset="0.55" stopColor="var(--dp-plasma)" />
            <stop offset="1" stopColor="var(--dp-spark)" />
          </linearGradient>
          <radialGradient id="in-halo-g">
            <stop offset="0" stopColor="var(--dp-spark)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--dp-spark)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path className="in-path" d="M8 23.5C8 16.5 15.5 19.5 16 14S22 8.5 24.5 8.5" stroke="url(#in-grad)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle className="in-halo" cx="24.5" cy="8.5" r="8" fill="url(#in-halo-g)" />
        <circle className="in-node" cx="8" cy="23.5" r="1.8" fill="var(--dp-bg)" stroke="var(--dp-uv)" strokeWidth="1.2" />
        <circle className="in-node" cx="16" cy="14.2" r="1.4" fill="var(--dp-plasma)" />
        <circle className="in-node" cx="24.5" cy="8.5" r="2" fill="var(--dp-spark)" />
      </svg>
      <div className="font-display flex overflow-hidden text-5xl font-semibold tracking-tight sm:text-6xl">
        {'DevPath'.split('').map((c, i) => (
          <span key={i} className={`in-char inline-block ${i >= 3 ? 'text-accent-strong' : 'text-fg'}`}>
            {c}
          </span>
        ))}
      </div>
      <p className="in-tag font-mono text-xs tracking-[0.3em] text-muted uppercase">o caminho que acende</p>
      <div className="h-px w-40 overflow-hidden bg-line">
        <div className="in-bar h-full origin-left scale-x-0 bg-gradient-to-r from-uv via-plasma to-spark" />
      </div>
    </div>
  );
}
