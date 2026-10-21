import { Link } from 'react-router-dom';
import { getTrack, projects } from '../content';
import { finalProject } from '../content/projects';
import { Badge, Card, PageHeader, ProgressBar, SectionTitle } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';

export default function ProjectsPage() {
  const { state } = useProgress();
  return (
    <div className="space-y-12">
      <PageHeader
        title="Projetos"
        description="Projetos que acompanham sua evolução. Cada um é construído em etapas, com requisitos, critérios de aceitação e testes — você escreve o código, o DevPath verifica."
      />

      <ul className="grid gap-3 md:grid-cols-2">
        {projects.map((project) => {
          const p = state.projects[project.id];
          const ready = project.status === 'completo';
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold text-faint">PROJETO {project.letter}</span>
                {ready ? (
                  p?.completedAt ? <Badge tone="success">Concluído</Badge> : p ? <Badge tone="accent">Em andamento</Badge> : <Badge tone="info">Disponível</Badge>
                ) : (
                  <Badge>Planejado</Badge>
                )}
              </div>
              <h2 className="mt-1 font-semibold">{project.title}</h2>
              <p className="mt-1 text-sm text-muted">{project.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.topics.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
              {ready ? (
                <div className="mt-4">
                  <div className="mb-1.5 text-xs text-muted">
                    {p?.completedStepIds.length ?? 0} de {project.steps.length} etapas
                  </div>
                  <ProgressBar value={(p?.completedStepIds.length ?? 0) / project.steps.length} label={`Etapas de ${project.title}`} />
                </div>
              ) : (
                <div className="mt-4 text-xs text-faint">
                  Trilha: {getTrack(project.trackId)?.title}. Etapas previstas: {project.plannedStages?.map((s) => s.title).join(' → ')}.
                </div>
              )}
            </>
          );
          return (
            <li key={project.id}>
              {ready ? (
                <Link to={`/projetos/${project.id}`} className="block h-full rounded-xl border border-line bg-surface p-5 hover:border-line-strong">
                  {body}
                </Link>
              ) : (
                <div className="h-full rounded-xl border border-dashed border-line p-5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <section id="projeto-final" aria-labelledby="final-titulo" className="scroll-mt-24 space-y-4">
        <SectionTitle id="final-titulo" aside={<Badge>Planejado por etapas</Badge>}>
          Projeto final — {finalProject.title}
        </SectionTitle>
        <p className="max-w-3xl text-sm text-muted">{finalProject.description}</p>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <h3 className="mb-2 text-sm font-semibold">Funcionalidades</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
              {finalProject.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold">Etapas (liberadas junto com as trilhas)</h3>
            <ol className="space-y-3">
              {finalProject.stages.map((stage) => (
                <li key={stage.title} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    {stage.title} <Badge>trilha {getTrack(stage.trackId)?.shortTitle}</Badge>
                  </div>
                  <p className="text-muted">{stage.description}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
        <Card>
          <h3 className="mb-2 text-sm font-semibold">Como o projeto final é conduzido</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {finalProject.pedagogy.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
