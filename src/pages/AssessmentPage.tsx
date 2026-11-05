import { CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAssessment, getExercise, getLesson } from '../content';
import { bestAssessmentResult } from '../domain/mastery';
import { diagnosticSuggestion } from '../domain/recommendations';
import { ExerciseRunner } from '../components/exercise/ExerciseRunner';
import { SolutionView } from '../components/exercise/HintPanel';
import { Button, ButtonLink } from '../components/ui/Button';
import { Badge, Card, PageHeader } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';
import type { Assessment } from '../types/content';
import NotFoundPage from './NotFoundPage';

export default function AssessmentPage() {
  const { assessmentId = '' } = useParams();
  const assessment = getAssessment(assessmentId);
  const [round, setRound] = useState(0);
  if (!assessment) return <NotFoundPage />;
  return <AssessmentRun key={`${assessment.id}-${round}`} assessment={assessment} onRestart={() => setRound((r) => r + 1)} />;
}

function AssessmentRun({ assessment, onRestart }: { assessment: Assessment; onRestart(): void }) {
  const { state, actions } = useProgress();
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const best = bestAssessmentResult(state, assessment.id);
  const total = assessment.exerciseIds.length;
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter(Boolean).length;
  const passed = correct / total >= assessment.passingScore;
  const missed = assessment.exerciseIds.filter((id) => answers[id] === false);

  const finish = () => {
    actions.completeAssessment({ assessmentId: assessment.id, correct, total, passed, missedExerciseIds: missed });
    setFinished(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const kindLabel = assessment.kind === 'diagnostica' ? 'Diagnóstica' : assessment.kind === 'modulo' ? 'Avaliação de módulo' : 'Avaliação final';

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <Link to={`/trilhas/${assessment.trackId}`} className="hover:text-fg">
            Trilha / {kindLabel}
          </Link>
        }
        title={assessment.title}
        description={assessment.description}
        actions={best && <Badge tone={best.passed ? 'success' : 'neutral'}>Melhor resultado: {best.correct}/{best.total}</Badge>}
      />

      {!started ? (
        <Card className="space-y-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            <li>{total} questões. Cada uma aceita uma única resposta.</li>
            <li>Sem dicas durante a avaliação. As explicações aparecem no final.</li>
            {assessment.kind !== 'diagnostica' ? (
              <li>Aprovação com {Math.round(assessment.passingScore * 100)}% ou mais. Você pode refazer quantas vezes quiser.</li>
            ) : (
              <li>Não há nota mínima: o resultado só sugere por onde começar.</li>
            )}
          </ul>
          <Button onClick={() => setStarted(true)}>
            <ClipboardCheck size={16} aria-hidden /> Começar
          </Button>
        </Card>
      ) : finished ? (
        <Results assessment={assessment} answers={answers} correct={correct} passed={passed} missed={missed} onRestart={onRestart} />
      ) : (
        <>
          <ol className="space-y-6">
            {assessment.exerciseIds.map((id, i) => {
              const exercise = getExercise(id)!;
              return (
                <li key={id}>
                  <Card>
                    <ExerciseRunner
                      exercise={exercise}
                      source="avaliacao"
                      assessment
                      onResult={(ok) => setAnswers((a) => (id in a ? a : { ...a, [id]: ok }))}
                      header={
                        <div className="text-xs font-semibold tracking-wide text-faint uppercase">
                          Questão {i + 1} de {total}
                        </div>
                      }
                    />
                  </Card>
                </li>
              );
            })}
          </ol>
          <div className="sticky bottom-4 flex items-center justify-between gap-4 dp-spot rounded-2xl border border-line bg-surface/95 px-5 py-3 backdrop-blur">
            <span className="text-sm text-muted tabular-nums">
              {answered} de {total} respondidas
            </span>
            <Button onClick={finish} disabled={answered < total}>
              Finalizar avaliação
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function Results({
  assessment,
  answers,
  correct,
  passed,
  missed,
  onRestart,
}: {
  assessment: Assessment;
  answers: Record<string, boolean>;
  correct: number;
  passed: boolean;
  missed: string[];
  onRestart(): void;
}) {
  const total = assessment.exerciseIds.length;
  const suggestion = assessment.kind === 'diagnostica' ? diagnosticSuggestion(missed) : null;

  return (
    <div className="space-y-6">
      <Card className={passed || suggestion ? 'border-success/30' : 'border-warning/30'}>
        <div className="text-3xl font-semibold tabular-nums">
          {correct}/{total}
        </div>
        <p className="mt-1 text-muted">
          {suggestion
            ? 'Diagnóstico concluído.'
            : passed
              ? 'Aprovado! Seu resultado foi registrado no progresso.'
              : `Ainda não foi desta vez: o mínimo é ${Math.round(assessment.passingScore * 100)}%. Os conceitos das questões erradas foram enviados para a revisão.`}
        </p>
        {suggestion && (
          <div className="mt-4 rounded-lg bg-surface-2 p-4 text-sm">
            <p>{suggestion.reason}</p>
            <ButtonLink to={`/aulas/${suggestion.lessonId}`} className="mt-3" size="sm">
              Ir para {getLesson(suggestion.lessonId)?.title}
            </ButtonLink>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onRestart}>
            Refazer avaliação
          </Button>
          {!suggestion && missed.length > 0 && (
            <ButtonLink to="/revisao" variant="ghost">
              Ir para a revisão
            </ButtonLink>
          )}
        </div>
      </Card>

      <h2 className="text-lg font-semibold">Correção comentada</h2>
      <ol className="space-y-3">
        {assessment.exerciseIds.map((id, i) => {
          const exercise = getExercise(id)!;
          const ok = answers[id];
          return (
            <li key={id}>
              <details className="dp-spot rounded-2xl border border-line bg-surface px-5 py-4">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                  {ok ? <CheckCircle2 size={16} className="text-success" aria-label="Acertou" /> : <XCircle size={16} className="text-danger" aria-label="Errou" />}
                  Questão {i + 1}: {exercise.title}
                </summary>
                <div className="mt-4">
                  <SolutionView exercise={exercise} />
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
