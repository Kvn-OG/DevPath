import { gsap, motionOK } from './motion';

const COLORS = ['var(--dp-spark)', 'var(--dp-uv)', 'var(--dp-plasma)', '#ffffff'];

/**
 * Explosão de faíscas a partir de um elemento: quadradinhos, traços e anéis
 * com física simples (lançamento, gravidade e giro). Some sozinha.
 */
export function celebrate(target: Element, amount = 34) {
  if (!motionOK()) return;
  const r = target.getBoundingClientRect();
  const ox = r.left + Math.min(r.width, 220) / 2;
  const oy = r.top + r.height / 2;

  const ring = document.createElement('div');
  ring.className = 'dp-confetti';
  Object.assign(ring.style, { left: `${ox - 20}px`, top: `${oy - 20}px`, width: '40px', height: '40px', borderRadius: '9999px', border: '2px solid var(--dp-spark)' });
  document.body.appendChild(ring);
  gsap.fromTo(ring, { scale: 0.2, opacity: 1 }, { scale: 4, opacity: 0, duration: 0.9, ease: 'expo.out', onComplete: () => ring.remove() });

  for (let i = 0; i < amount; i++) {
    const p = document.createElement('div');
    p.className = 'dp-confetti';
    const shape = i % 3;
    const size = gsap.utils.random(4, 9);
    Object.assign(p.style, {
      left: `${ox}px`,
      top: `${oy}px`,
      width: `${shape === 1 ? size * 2.4 : size}px`,
      height: `${shape === 1 ? 2.5 : size}px`,
      borderRadius: shape === 2 ? '9999px' : '2px',
      background: COLORS[i % COLORS.length],
      boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}`,
    });
    document.body.appendChild(p);
    const angle = gsap.utils.random(-Math.PI, 0);
    const speed = gsap.utils.random(120, 320);
    gsap
      .timeline({ onComplete: () => p.remove() })
      .to(p, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed, rotate: gsap.utils.random(-540, 540), duration: 0.7, ease: 'power3.out' })
      .to(p, { y: `+=${gsap.utils.random(120, 260)}`, opacity: 0, duration: 0.9, ease: 'power2.in' }, '>-0.15');
  }
}

/** Tremida curta para respostas erradas: diz "quase" sem punir. */
export function shake(target: Element) {
  if (!motionOK()) return;
  gsap.fromTo(target, { x: 0 }, { keyframes: { x: [-8, 7, -5, 3, 0] }, duration: 0.45, ease: 'power2.out' });
}
