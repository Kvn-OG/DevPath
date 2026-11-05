import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lessonsOfTrack, tracks } from '../../content';
import type { ProgressState } from '../../types/progress';
import { motionOK } from '../motion';
import { trackHue } from '../trackTheme';
import type { PathHover, PathNode } from './types';

/** Monta os nós do caminho: todas as aulas das trilhas prontas, em ordem. */
export function buildPathNodes(state: ProgressState, currentHref: string): PathNode[] {
  const nodes: PathNode[] = [];
  for (const track of tracks.filter((t) => t.status === 'completo')) {
    for (const lesson of lessonsOfTrack(track)) {
      const href = `/aulas/${lesson.id}`;
      nodes.push({
        id: lesson.id,
        title: lesson.title,
        trackTitle: track.shortTitle,
        hue: trackHue(track.id),
        status: state.lessons[lesson.id]?.completedAt ? 'done' : href === currentHref ? 'current' : 'todo',
        href,
      });
    }
  }
  // Sem aula atual explícita, a primeira não concluída é a próxima parada.
  if (!nodes.some((n) => n.status === 'current')) {
    const next = nodes.find((n) => n.status === 'todo');
    if (next) next.status = 'current';
  }
  return nodes;
}

function webglAvailable(): boolean {
  if (import.meta.env.MODE === 'test') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

const STATUS_LABEL: Record<PathNode['status'], string> = { done: 'Concluída', current: 'Próxima parada', todo: 'A percorrer' };

/**
 * Palco 3D do dashboard. O Three.js é carregado sob demanda; sem WebGL
 * (ou nos testes) nada é desenhado e o conteúdo continua igual.
 * Os nós são clicáveis com o mouse; os mesmos destinos existem como links na página.
 */
export function PathScene({ state, currentHref, offsetRight = true }: { state: ProgressState; currentHref: string; offsetRight?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [hover, setHover] = useState<PathHover | null>(null);
  const [ready, setReady] = useState(false);
  const nodes = useMemo(() => buildPathNodes(state, currentHref), [state, currentHref]);
  const signature = nodes.map((n) => n.status[0]).join('');

  useEffect(() => {
    const el = canvas.current;
    if (!el || !webglAvailable() || nodes.length === 0) return;
    let disposed = false;
    let dispose: (() => void) | undefined;
    import('./renderer').then(({ createPathRenderer }) => {
      if (disposed) return;
      const r = createPathRenderer({
        canvas: el,
        labelLayer: labels.current ?? undefined,
        nodes,
        animate: motionOK(),
        offsetRight,
        onHover: setHover,
        onSelect: (n) => navigate(n.href),
      });
      dispose = r.dispose;
      setReady(true);
    });
    return () => {
      disposed = true;
      dispose?.();
    };
    // Recria a cena só quando o status de algum nó muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, offsetRight]);

  return (
    <div className="absolute inset-0" aria-hidden>
      <canvas ref={canvas} className={`h-full w-full transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`} />
      <div ref={labels} className="pointer-events-none absolute inset-0 overflow-hidden" />
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-xs whitespace-nowrap text-white shadow-2xl backdrop-blur-md"
          style={{ left: hover.x, top: hover.y }}
        >
          <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-white/60 uppercase">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: hover.node.hue, boxShadow: `0 0 8px ${hover.node.hue}` }} />
            {hover.node.trackTitle} · {STATUS_LABEL[hover.node.status]}
          </div>
          <div className="mt-0.5 font-medium">{hover.node.title}</div>
        </div>
      )}
    </div>
  );
}
