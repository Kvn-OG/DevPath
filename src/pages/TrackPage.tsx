import { ArrowRight, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getAssessment, getProject, getTrack } from '../content';
import { trackMilestones } from '../domain/gamification';
import { bestAssessmentResult, isAssessmentPassed, trackProgress } from '../domain/mastery';
import { LessonList } from '../components/lesson/LessonList';
import { Badge, Card, PageHeader, ProgressBar, SectionTitle } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';
import NotFoundPage from './NotFoundPage';

export default function TrackPage() {
  const { trackId = '' } = useParams();
  const { state } = useProgress();
  const track = getTrack(trackId);
  if (!track) return <NotFoundPage />;
  const ready = track.status === 'completo';
  const p = trackProgress(state, track);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={
          <Link to="/trilhas" className="hover:text-fg">
            Trilhas / Trilha {track.order}
          </Link>
        }
        title={track.title}
        description={track.description}
        actions={!ready && <Badge>Em planejamento — conteúdo ainda não produzido</Badge>}
      />

      {ready && (
        <Card className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span>
              {p.completedLessons} de {p.totalLessons} aulas
              {p.totalModules > 0 && ` · ${p.modulesPassed} de ${p.totalModules} avaliações de módulo`}
              {track.finalAssessmentId && ` · avaliação final ${p.finalPassed ? 'aprovada' : 'pendente'}`}
            </span>
            <span className="font-semibold tabular-nums">{Math.round(p.percent * 100)}%</span>
          </div>
          <ProgressBar value={p.percent} label="Progresso na trilha" />
          <div className="flex flex-wrap gap-2 pt-1">
            {trackMilestones(p.completedLessons, p.totalLessons).map((m) => (
              <Badge key={m.label} tone={m.reached ? 'accent' : 'neutral'}>
                {m.reached && <CheckCircle2 size={12} aria-hidden />} Marco {m.label}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <InfoList title="Objetivos" items={track.objectives} />
        <InfoList title="Pré-requisitos" items={track.prerequisites} />
        <InfoList title="Critérios de conclusão" items={track.completionCriteria} />
      </div>

      {ready && track.diagnosticId && (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Avaliação diagnóstica</h2>
            <p className="text-sm text-muted">{getAssessment(track.diagnosticId)?.description}</p>
          </div>
          <Link to={`/avaliacoes/${track.diagnosticId}`} className="inline-flex shrink-0 items-center gap-1 text-sm text-accent-strong hover:underline">
            {state.assessments.some((a) => a.assessmentId === track.diagnosticId) ? 'Refazer' : 'Fazer agora'} <ArrowRight size={14} aria-hidden />
          </Link>
        </Card>
      )}

      <section aria-labelledby="modulos" className="space-y-8">
        <SectionTitle id="modulos">Módulos</SectionTitle>
        {track.modules.map((module, i) => (
          <div key={module.id} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold">
                <Link to={`/trilhas/${track.id}/modulos/${module.id}`} className="hover:text-accent-strong">
                  Módulo {i + 1}: {module.title}
                </Link>
              </h3>
              {module.status === 'completo' ? (
                module.assessmentId && <AssessmentLink assessmentId={module.assessmentId} />
              ) : (
                <Badge>Planejado</Badge>
              )}
            </div>
            {module.status === 'completo' ? (
              <LessonList lessonIds={module.lessonIds} />
            ) : (
              <Card className="text-sm">
                <p className="mb-2 text-muted">Tópicos previstos (aulas ainda não produzidas):</p>
                <ul className="flex flex-wrap gap-2">
                  {module.plannedTopics?.map((t) => (
                    <li key={t}>
                      <Badge>{t}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        ))}
      </section>

      {(track.finalAssessmentId || track.projectIds.length > 0) && (
        <section aria-labelledby="fechamento" className="grid gap-4 md:grid-cols-2">
          <h2 id="fechamento" className="sr-only">
            Projeto e avaliação final
          </h2>
          {track.projectIds.map((id) => {
            const project = getProject(id);
            if (!project) return null;
            return (
              <Link key={id} to={`/projetos/${id}`} className="dp-spot rounded-2xl border border-line bg-surface p-5 hover:border-line-strong">
                <div className="text-xs font-semibold text-faint">PROJETO {project.letter}</div>
                <div className="mt-1 font-semibold">{project.title}</div>
                <div className="mt-1 text-sm text-muted">{project.status === 'completo' ? `${project.steps.length} etapas guiadas` : 'Planejado'}</div>
              </Link>
            );
          })}
          {track.finalAssessmentId && ready && (
            <Link to={`/avaliacoes/${track.finalAssessmentId}`} className="dp-spot rounded-2xl border border-line bg-surface p-5 hover:border-line-strong">
              <div className="text-xs font-semibold text-faint">AVALIAÇÃO FINAL</div>
              <div className="mt-1 font-semibold">{getAssessment(track.finalAssessmentId)?.title}</div>
              <div className="mt-1 text-sm text-muted">
                {isAssessmentPassed(state, track.finalAssessmentId) ? 'Aprovado' : 'Mínimo de 70% para aprovação'}
              </div>
            </Link>
          )}
        </section>
      )}
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </Card>
  );
}

export function AssessmentLink({ assessmentId }: { assessmentId: string }) {
  const { state } = useProgress();
  const best = bestAssessmentResult(state, assessmentId);
  const passed = isAssessmentPassed(state, assessmentId);
  return (
    <Link to={`/avaliacoes/${assessmentId}`} className="inline-flex items-center gap-1.5 text-sm text-accent-strong hover:underline">
      <ClipboardCheck size={14} aria-hidden />
      {passed ? `Avaliação aprovada (${best?.correct}/${best?.total})` : best ? `Avaliação: ${best.correct}/${best.total} — refazer` : 'Avaliação do módulo'}
    </Link>
  );
}
