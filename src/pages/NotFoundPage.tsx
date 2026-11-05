import { useRef } from 'react';
import { ButtonLink } from '../components/ui/Button';
import { gsap, motionOK, useGSAP } from '../identity/motion';

/** 404: o caminho se desenha, falha no meio e a faísca fica piscando no vazio. */
export default function NotFoundPage() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!motionOK()) return;
      gsap
        .timeline({ delay: 0.3 })
        .from('.nf-a', { drawSVG: '0%', duration: 1, ease: 'power2.inOut' })
        .from('.nf-b', { drawSVG: '0%', duration: 0.6, ease: 'power2.out' }, '+=0.25')
        .from('.nf-spark', { scale: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(3)' })
        .to('.nf-spark', { opacity: 0.25, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(2)' });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden py-12 text-center">
      <span aria-hidden className="dp-outline-text font-display pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[38vw] leading-none font-bold select-none lg:text-[22rem]">
        404
      </span>
      <svg viewBox="0 0 400 120" className="relative w-full max-w-md" aria-hidden>
        <defs>
          <linearGradient id="nf-g" x1="0" x2="1">
            <stop offset="0" stopColor="var(--dp-uv)" />
            <stop offset="1" stopColor="var(--dp-plasma)" />
          </linearGradient>
        </defs>
        <path className="nf-a" d="M10 90 C 70 90, 90 30, 160 40 S 200 70, 205 64" stroke="url(#nf-g)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path className="nf-b" d="M250 52 C 290 30, 330 80, 390 30" stroke="var(--dp-line-strong)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="2 10" />
        <circle cx="10" cy="90" r="6" fill="var(--dp-bg)" stroke="var(--dp-uv)" strokeWidth="3" />
        <circle className="nf-spark" cx="228" cy="58" r="7" fill="var(--dp-spark)" style={{ filter: 'drop-shadow(0 0 8px var(--dp-spark))' }} />
      </svg>
      <h1 className="relative mt-6 text-3xl sm:text-5xl">Página não encontrada</h1>
      <p className="relative mt-3 max-w-md text-muted">O endereço pode estar errado ou o conteúdo ainda não foi produzido. Este trecho do caminho ainda não existe.</p>
      <div className="relative mt-6">
        <ButtonLink to="/" variant="secondary">
          Voltar ao dashboard
        </ButtonLink>
      </div>
    </div>
  );
}
