import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { comparisons } from '../content/comparisons';
import { finalProject } from '../content/projects';
import { tracks } from '../content';
import { trackProgress } from '../domain/mastery';
import { Badge, Card, PageHeader, ProgressBar, SectionTitle } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';

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
          return (
            <li key={track.id}>
              <Link
                to={`/trilhas/${track.id}`}
                className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-faint tabular-nums">TRILHA {track.order}</span>
                  {ready ? <Badge tone="success">Disponível</Badge> : <Badge>Em planejamento</Badge>}
                </div>
                <h2 className="mt-2 font-semibold">{track.title}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{track.description}</p>
                {ready ? (
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs text-muted">
                      <span>
                        {p.completedLessons} de {p.totalLessons} aulas
                      </span>
                      <span className="tabular-nums">{Math.round(p.percent * 100)}%</span>
                    </div>
                    <ProgressBar value={p.percent} label={`Progresso na trilha ${track.title}`} />
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-faint">Pré-requisito: {track.prerequisites.join(' ')}</p>
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
