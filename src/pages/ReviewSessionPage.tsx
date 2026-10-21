import { CheckCircle2, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { exercisesForConcept, getConcept, getLesson } from '../content';
import { ExerciseRunner } from '../components/exercise/ExerciseRunner';
import { Button, ButtonLink } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/primitives';
import { renderInline } from '../components/ui/RichText';
import { useProgress } from '../state/ProgressProvider';
import NotFoundPage from './NotFoundPage';

/** Uma revisão = resolver um exercício do conceito com no máximo uma tentativa errada. */
export const MAX_FAILS_FOR_SUCCESS = 1;

export default function ReviewSessionPage() {
  const { conceptId = '' } = useParams();
  const concept = getConcept(conceptId);
  if (!concept) return <NotFoundPage />;
  return <ReviewSession key={concept.id} conceptId={concept.id} />;
}

function ReviewSession({ conceptId }: { conceptId: string }) {
  const { state, actions } = useProgress();
  const concept = getConcept(conceptId)!;
  const lesson = getLesson(concept.lessonId)!;

  // Prioriza exercícios com mais erros; depois os ainda não resolvidos.
  const candidates = useMemo(() => {
    return [...exercisesForConcept(conceptId)].sort((a, b) => {
      const pa = state.exercises[a.id];
      const pb = state.exercises[b.id];
      const score = (p: typeof pa) => (p?.failedAttempts ?? 0) * 2 + (p?.solved ? 0 : 1);
      return score(pb) - score(pa);
    });
    // A ordem é definida uma vez por sessão (não muda a cada tentativa).
  }, [conceptId]); // eslint-disable-line react-hooks/exhaustive-deps

  const [index, setIndex] = useState(0);
  const [fails, setFails] = useState(0);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState<boolean | null>(null);
  const exercise = candidates[index % candidates.length];

  const complete = (success: boolean) => {
    actions.completeReview(conceptId, success);
    setFinished(success);
  };

  const review = state.reviews[conceptId];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <Link to="/revisao" className="hover:text-fg">
            Revisão
          </Link>
        }
        title={`Revisar: ${concept.name}`}
        description={
          <>
            Conceito da aula{' '}
            <Link to={`/aulas/${lesson.id}`} className="text-accent-strong hover:underline">
              {lesson.title}
            </Link>
            .
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Relembre</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {lesson.summary.map((s) => (
              <li key={s}>{renderInline(s)}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Pergunte-se</h2>
          <div className="space-y-2">
            {lesson.reviewQuestions.map((q) => (
              <details key={q.question} className="text-sm">
                <summary className="cursor-pointer">{renderInline(q.question)}</summary>
                <p className="mt-1 pl-4 text-muted">{renderInline(q.answer)}</p>
              </details>
            ))}
          </div>
        </Card>
      </div>

      {finished !== null ? (
        <Card className={finished ? 'border-success/30' : 'border-warning/30'}>
          <div className="flex items-center gap-2 font-semibold">
            {finished && <CheckCircle2 size={18} className="text-success" aria-hidden />}
            {finished ? 'Revisão concluída' : 'Revisão registrada como difícil'}
          </div>
          <p className="mt-1 text-sm text-muted">
            {finished
              ? 'O próximo intervalo de revisão deste conceito aumentou.'
              : 'Sem problema: o conceito volta amanhã para mais uma rodada. Se quiser, releia a aula antes.'}
            {review && ` Próxima revisão: ${new Date(review.dueAt).toLocaleDateString('pt-BR')}.`}
          </p>
          <div className="mt-4 flex gap-2">
            <ButtonLink to="/revisao" size="sm">
              Voltar à revisão
            </ButtonLink>
            {!finished && (
              <ButtonLink to={`/aulas/${lesson.id}`} size="sm" variant="secondary">
                Reler a aula
              </ButtonLink>
            )}
          </div>
        </Card>
      ) : (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Pratique</h2>
            {candidates.length > 1 && !solved && fails === 0 && (
              <Button variant="ghost" size="sm" onClick={() => setIndex((i) => i + 1)}>
                <Shuffle size={14} aria-hidden /> Outro exercício
              </Button>
            )}
          </div>
          <ExerciseRunner
            key={exercise.id}
            exercise={exercise}
            source="revisao"
            fresh
            onResult={(ok) => {
              if (solved) return;
              if (ok) setSolved(true);
              else setFails((f) => f + 1);
            }}
          />
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <Button onClick={() => complete(solved && fails <= MAX_FAILS_FOR_SUCCESS)} disabled={!solved && fails === 0}>
              Concluir revisão
            </Button>
            <span className="text-xs text-muted">
              {solved
                ? fails <= MAX_FAILS_FOR_SUCCESS
                  ? 'Você resolveu com até uma tentativa errada: a revisão conta como bem-sucedida.'
                  : 'Você resolveu, mas com várias tentativas: o conceito voltará mais cedo.'
                : fails > 0
                  ? 'Você pode tentar de novo ou concluir agora (o conceito voltará amanhã).'
                  : 'Resolva o exercício para concluir.'}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
