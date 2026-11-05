import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

gsap.defaults({ ease: 'expo.out', duration: 0.8 });

/**
 * Animações só rodam no navegador real, fora dos testes e quando a pessoa
 * não pediu movimento reduzido. Todo efeito decorativo passa por aqui.
 */
export function motionOK(): boolean {
  if (import.meta.env.MODE === 'test') return false;
  if (typeof window === 'undefined') return false;
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Ponteiro fino (mouse/trackpad): efeitos de hover e magnetismo só fazem sentido aqui. */
export function finePointer(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: fine)').matches;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Facilita inspecionar animações no console durante o desenvolvimento.
  (window as unknown as { __gsap: typeof gsap }).__gsap = gsap;
}
