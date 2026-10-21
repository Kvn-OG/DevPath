import { Link, useParams } from 'react-router-dom';
import { concepts, getAssessment, getModule, getTrack } from '../content';
import { conceptMastery, isLessonCompleted, MASTERY_LABEL, masteryLevel } from '../domain/mastery';
import { LessonList } from '../components/lesson/LessonList';
import { Badge, Card, PageHeader, SectionTitle } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';
import NotFoundPage from './NotFoundPage';
import { AssessmentLink } from './TrackPage';

export default function ModulePage() {
  const { trackId = '', moduleId = '' } = useParams();
  const { state } = useProgress();
  const track = getTrack(trackId);
  const module = getModule(moduleId);
  if (!track || !module || module.trackId !== track.id) return <NotFoundPage />;
  const index = track.modules.findIndex((m) => m.id === module.id);
  const moduleConcepts = concepts.filter((c) => module.lessonIds.includes(c.lessonId));
  const allDone = module.lessonIds.every((id) => isLessonCompleted(state, id));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <Link to={`/trilhas/${track.id}`} className="hover:text-fg">
            {track.title} / Módulo {index + 1}
          </Link>
        }
        title={module.title}
        description={module.description || undefined}
        actions={module.status !== 'completo' && <Badge>Planejado</Badge>}
      />

      {module.status === 'completo' ? (
        <>
          <section>
            <SectionTitle>Aulas</SectionTitle>
            <LessonList lessonIds={module.lessonIds} />
          </section>

          <section>
            <SectionTitle>Domínio dos conceitos</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-2">
              {moduleConcepts.map((c) => {
                const m = conceptMastery(state, c.id);
                const level = masteryLevel(m.score);
                return (
                  <Card key={c.id} className="flex items-center justify-between gap-3 p-4">
                    <span className="text-sm">{c.name}</span>
                    <Badge tone={level === 'dominado' ? 'success' : level === 'revisar' ? 'danger' : level === 'praticando' ? 'accent' : 'neutral'}>
                      {MASTERY_LABEL[level]}
                      {m.score !== null && ` · ${Math.round(m.score * 100)}%`}
                    </Badge>
                  </Card>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-faint">
              O domínio considera acertos, tentativas sem sucesso, dicas usadas e soluções consultadas — não apenas aulas abertas.
            </p>
          </section>

          {module.assessmentId && (
            <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">{getAssessment(module.assessmentId)?.title}</h2>
                <p className="text-sm text-muted">
                  {allDone ? 'Você concluiu as aulas deste módulo.' : 'Recomendada depois de concluir as aulas do módulo.'} Aprovação com 75% ou mais.
                </p>
              </div>
              <AssessmentLink assessmentId={module.assessmentId} />
            </Card>
          )}
        </>
      ) : (
        <Card>
          <p className="mb-3 text-sm text-muted">Este módulo ainda não foi produzido. Tópicos previstos:</p>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {module.plannedTopics?.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
