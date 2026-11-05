import { useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, motionOK, SplitText, useGSAP } from './motion';

/**
 * Entrada de página: os blocos sobem em cascata saindo de um leve desfoque,
 * e o título principal surge palavra por palavra, por trás de uma máscara.
 */
export function PageEnter({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !motionOK()) return;
      const page = el.firstElementChild as HTMLElement | null;
      if (!page) return;
      const blocks = Array.from(page.children) as HTMLElement[];
      gsap.fromTo(
        blocks,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'expo.out', clearProps: 'opacity,visibility,transform' },
      );

      // Só divide títulos com um único nó de texto: assim o React continua dono do DOM.
      const h1 = page.querySelector('h1');
      if (h1 && h1.childNodes.length === 1 && h1.firstChild?.nodeType === Node.TEXT_NODE) {
        const split = SplitText.create(h1, { type: 'words', mask: 'words', aria: 'auto' });
        gsap.from(split.words, {
          yPercent: 110,
          rotate: 4,
          duration: 1,
          stagger: 0.06,
          ease: 'expo.out',
          delay: 0.05,
          onComplete: () => split.revert(),
        });
      }
    },
    { dependencies: [pathname], scope: root },
  );

  return <div ref={root}>{children}</div>;
}
