import { Play, Trophy } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getChallenge } from '../content';
import { missingLessons } from '../domain/mastery';
import { ExerciseRunner } from '../components/exercise/ExerciseRunner';
import { Button } from '../components/ui/Button';
import { Badge, Card, PageHeader } from '../components/ui/primitives';
import { renderInline } from '../components/ui/RichText';
import { useProgress } from '../state/ProgressProvider';
import { challengeState } from './ChallengesPage';
import NotFoundPage from './NotFoundPage';

export default function ChallengePage() {
  const { challengeId = '' } = useParams();
  const { state, actions } = useProgress();
  const challenge = getChallenge(challengeId);
  if (!challenge || challenge.status !== 'completo' || !challenge.exercise) return <NotFoundPage />;
  const progress = state.challenges[challenge.id];
  const missing = missingLessons(state, challenge.requiredLessonIds);
  const s = challengeState(state, challenge);
  const visibleTests = challenge.exercise.tests.filter((t) => !t.hidden);
  const hiddenCount = challenge.exercise.tests.length - visibleTests.length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <Link to="/desafios" className="hover:text-fg">
            Desafios / Desafio {challenge.order}
          </Link>
        }
        title={challenge.title}
        description={challenge.context}
        actions={<Badge tone={s.tone}>{s.label}</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Objetivo</h2>
          <p className="text-sm text-muted">{renderInline(challenge.objective)}</p>
          <h2 className="mt-4 mb-2 text-sm font-semibold">Requisitos</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {challenge.requirements.map((r) => (
              <li key={r}>{renderInline(r)}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Restrições</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {challenge.restrictions.map((r) => (
              <li key={r}>{renderInline(r)}</li>
            ))}
          </ul>
          <h2 className="mt-4 mb-2 text-sm font-semibold">Critérios de avaliação</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {challenge.evaluationCriteria.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-semibold">Casos de teste</h2>
        <ul className="space-y-1 font-mono text-xs text-muted">
          {visibleTests.map((t) => (
            <li key={t.name}>
              <span className="text-fg">{t.name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-faint">+ {hiddenCount} teste(s) oculto(s) com casos-limite.</p>
      </Card>

      {missing.length > 0 && !progress && (
        <Card className="border-warning/30 text-sm">
          Este desafio usa conceitos de:{' '}
          {missing.map((l, i) => (
            <span key={l.id}>
              {i > 0 && ', '}
              <Link to={`/aulas/${l.id}`} className="text-accent-strong hover:underline">
                {l.title}
              </Link>
            </span>
          ))}
          . Recomendamos concluir essas aulas antes, mas você pode começar se quiser.
        </Card>
      )}

      {progress ? (
        <Card>
          {progress.completedAt && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-success-soft px-4 py-3 text-sm font-medium text-success">
              <Trophy size={16} aria-hidden /> Desafio concluído. Você pode continuar refinando a solução.
            </div>
          )}
          <ExerciseRunner exercise={challenge.exercise} source="desafio" header={<span className="sr-only">{challenge.title}</span>} />
        </Card>
      ) : (
        <Button onClick={() => actions.startChallenge(challenge.id)}>
          <Play size={16} aria-hidden /> Iniciar desafio
        </Button>
      )}
    </div>
  );
}
