import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { comparisons } from '../content/comparisons';
import { finalProject } from '../content/projects';
import { tracks } from '../content';
import { trackProgress } from '../domain/mastery';
import { Badge, Card, PageHeader, ProgressBar, SectionTitle } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';
import { trackHue } from '../identity/trackTheme';
import type { CSSProperties } from 'react';

export default function TracksPage() {
  const { state } = useProgress();
  return (
    <div className="space-y-12">
      <PageHeader
        title="Trilhas de aprendizagem"
        description="Dez trilhas em sequência pedagógica, do zero ao nível profissional. Cada uma tem pré-requisitos, objetivos e critérios de conclusão. Só a primeira está completa nesta versão; as demais mostram o planejamento."
      />

      <ol className="grid gap-3 md:grid-cols-2">
        {tracks.map((track) => {
          const p = trackProgress(state, track);
          const ready = track.status === 'completo';
          const hue = trackHue(track.id);
          return (
            <li key={track.id}>
              <Link
                to={`/trilhas/${track.id}`}
                style={{ '--dp-spot': hue } as CSSProperties}
                className={`dp-spot group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong ${ready ? '' : 'opacity-75 hover:opacity-100'}`}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${hue}, transparent)`, opacity: ready ? 0.9 : 0.3 }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: hue, opacity: ready ? 0.16 : 0.05 }}
                />
                <span aria-hidden className="dp-outline-text font-display pointer-events-none absolute -right-1 -bottom-6 text-[7.5rem] leading-none font-bold tabular-nums select-none">
                  {String(track.order).padStart(2, '0')}
                </span>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-faint tabular-nums">
                    <span className="h-2 w-2 rounded-full" style={{ background: hue, boxShadow: ready ? `0 0 10px ${hue}` : undefined }} />
                    TRILHA {track.order}
                  </span>
                  {ready ? <Badge tone="success">Disponível</Badge> : <Badge>Em planejamento</Badge>}
                </div>
                <h2 className="mt-3 text-xl font-semibold">{track.title}</h2>
                <p className="relative mt-1 flex-1 pr-16 text-sm text-muted">{track.description}</p>
                {ready ? (
                  <div className="relative mt-5 pr-20">
                    <div className="mb-1.5 flex justify-between text-xs text-muted">
                      <span>
                        {p.completedLessons} de {p.totalLessons} aulas
                      </span>
                      <span className="tabular-nums">{Math.round(p.percent * 100)}%</span>
                    </div>
                    <ProgressBar value={p.percent} label={`Progresso na trilha ${track.title}`} hue={hue} />
                  </div>
                ) : (
                  <p className="relative mt-4 pr-20 text-xs text-faint">Pré-requisito: {track.prerequisites.join(' ')}</p>
                )}
              </Link>
            </li>
          );
        })}
      </ol>

      <section aria-labelledby="comparacoes">
        <SectionTitle id="comparacoes">Diferenças que confundem quem está começando</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {comparisons.map((c) => (
            <Card key={c.title}>
              <h3 className="font-semibold">{c.title}</h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                {[c.left, c.right].map((side) => (
                  <div key={side.name} className="rounded-lg bg-surface-2 p-3">
                    <dt className="font-medium text-accent-strong">{side.name}</dt>
                    <dd className="mt-1 text-muted">{side.text}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-sm">{c.takeaway}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="projeto-final">
        <SectionTitle id="projeto-final" aside={<Badge>Planejado por etapas</Badge>}>
          Projeto final: {finalProject.title}
        </SectionTitle>
        <Card className="space-y-4">
          <p className="text-sm text-muted">{finalProject.description}</p>
          <Link to="/projetos#projeto-final" className="inline-flex items-center gap-1 text-sm text-accent-strong hover:underline">
            Ver etapas e funcionalidades <ArrowRight size={14} aria-hidden />
          </Link>
        </Card>
      </section>
    </div>
  );
}
