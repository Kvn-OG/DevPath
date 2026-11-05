import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { gradeAnswer, isAnswerComplete, shuffledStepIds, type Answer, type GradeResult } from '../../domain/grading';
import type { RunResult } from '../../sandbox/evaluator';
import { useProgress } from '../../state/ProgressProvider';
import type { Exercise } from '../../types/content';
import type { AttemptSource } from '../../types/progress';
import { cn } from '../../utils/cn';
import { celebrate, shake } from '../../identity/celebrate';
import { Button } from '../ui/Button';
import { Badge } from '../ui/primitives';
import { renderInline } from '../ui/RichText';
import { FillBlanksInput, MultipleChoiceInput, OrderStepsInput, PredictOutputInput, TrueFalseInput } from './AnswerInputs';
import { CodeExercisePanel } from './CodeExercisePanel';
import { HintPanel, SolutionView } from './HintPanel';
import { DIFFICULTY_LABEL, EXERCISE_TYPE_LABEL } from './labels';

function emptyAnswer(exercise: Exercise): Answer | null {
  switch (exercise.type) {
    case 'multiple-choice':
      return { type: 'multiple-choice', optionId: null };
    case 'true-false':
      return { type: 'true-false', value: null, justificationId: null };
    case 'fill-blanks':
      return { type: 'fill-blanks', values: exercise.blanks.map(() => '') };
    case 'order-steps':
      return { type: 'order-steps', order: shuffledStepIds(exercise) };
    case 'predict-output':
      return { type: 'predict-output', text: '' };
    case 'code':
    case 'sql':
      return null;
  }
}

interface ExerciseRunnerProps {
  exercise: Exercise;
  source: AttemptSource;
  /** Avaliação: uma resposta por questão, sem dicas nem solução. */
  assessment?: boolean;
  starterCode?: string;
  onResult?(correct: boolean): void;
  header?: ReactNode;
  /** Começa do zero (código inicial, dicas e solução ocultas), como na revisão. */
  fresh?: boolean;
}

export function ExerciseRunner({ exercise, source, assessment = false, starterCode, onResult, header, fresh = false }: ExerciseRunnerProps) {
  const { state, actions } = useProgress();
  const progress = state.exercises[exercise.id];
  const [answer, setAnswer] = useState<Answer | null>(() => emptyAnswer(exercise));
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [codePassed, setCodePassed] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(fresh ? 0 : (progress?.hintsUsed ?? 0));
  const [solutionVisible, setSolutionVisible] = useState(!assessment && !fresh && !!progress?.solutionViewed);
  const [submitted, setSubmitted] = useState(false);

  const attempts = progress?.attempts ?? 0;
  const solved = !!progress?.solved;
  const solutionUnlocked = solved || (attempts >= 1 && revealed >= 3);
  const lockReason = attempts === 0 ? 'A solução é liberada depois de uma tentativa e das três dicas.' : 'Veja as três dicas antes da solução.';
  const lockedAfterSubmit = assessment && submitted;
  const isCode = exercise.type === 'code' || exercise.type === 'sql';
  const starter = starterCode ?? (isCode ? exercise.starterCode : '');

  const reveal = (level: number) => {
    setRevealed(level);
    actions.revealHint(exercise.id, level);
  };
  // Em sessões "fresh", a solução exige dicas vistas nesta sessão, não em visitas anteriores.
  const solutionUnlockedNow = fresh ? revealed >= 3 && (grade !== null || codePassed !== null) : solutionUnlocked;

  const showSolution = () => {
    setSolutionVisible(true);
    actions.viewSolution(exercise.id);
  };

  const check = () => {
    if (!answer || !isAnswerComplete(answer)) return;
    const result = gradeAnswer(exercise, answer);
    setGrade(result);
    setSubmitted(true);
    actions.recordAttempt(exercise.id, result.correct, source);
    onResult?.(result.correct);
  };

  const retry = () => {
    setGrade(null);
    setSubmitted(false);
    setAnswer(emptyAnswer(exercise));
  };

  const onVerified = (result: RunResult, code: string) => {
    // Sem ambiente de execução não há tentativa válida para registrar.
    if (result.error?.name === 'Execução indisponível') return;
    setCodePassed(result.passed);
    setSubmitted(true);
    actions.recordAttempt(exercise.id, result.passed, source, code);
    onResult?.(result.passed);
  };

  const inputDisabled = grade !== null;

  return (
    <article className="space-y-5" aria-label={`Exercício: ${exercise.title}`}>
      {header ?? (
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{EXERCISE_TYPE_LABEL(exercise)}</Badge>
            <Badge>{DIFFICULTY_LABEL[exercise.difficulty]}</Badge>
            {!assessment && solved && (
              <Badge tone="success">
                <CheckCircle2 size={12} aria-hidden /> Resolvido
              </Badge>
            )}
            {!assessment && attempts > 0 && <span className="text-xs text-faint">{attempts} tentativa(s)</span>}
          </div>
          <h3 className="text-lg font-semibold">{exercise.title}</h3>
        </header>
      )}

      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-fg">{renderInline(exercise.statement)}</p>
        {exercise.context && <p className="text-muted">{renderInline(exercise.context)}</p>}
        {exercise.requirements && exercise.requirements.length > 0 && (
          <div>
            <div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Requisitos</div>
            <ul className="list-disc space-y-1 pl-5 text-fg">
              {exercise.requirements.map((r) => (
                <li key={r}>{renderInline(r)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {exercise.type === 'code' || exercise.type === 'sql' ? (
        <CodeExercisePanel
          key={exercise.id}
          exercise={exercise}
          initialCode={assessment || fresh ? starter : (progress?.lastCode ?? starter)}
          starterCode={starter}
          locked={lockedAfterSubmit}
          onCodeChange={(code) => !assessment && actions.saveCode(exercise.id, code)}
          onVerified={onVerified}
        />
      ) : (
        answer && (
          <>
            {answer.type === 'multiple-choice' && exercise.type === 'multiple-choice' && (
              <MultipleChoiceInput exercise={exercise} answer={answer} onChange={setAnswer} disabled={inputDisabled} />
            )}
            {answer.type === 'true-false' && exercise.type === 'true-false' && (
              <TrueFalseInput exercise={exercise} answer={answer} onChange={setAnswer} disabled={inputDisabled} />
            )}
            {answer.type === 'fill-blanks' && exercise.type === 'fill-blanks' && (
              <FillBlanksInput exercise={exercise} answer={answer} onChange={setAnswer} disabled={inputDisabled} />
            )}
            {answer.type === 'order-steps' && exercise.type === 'order-steps' && (
              <OrderStepsInput exercise={exercise} answer={answer} onChange={setAnswer} disabled={inputDisabled} />
            )}
            {answer.type === 'predict-output' && exercise.type === 'predict-output' && (
              <PredictOutputInput exercise={exercise} answer={answer} onChange={setAnswer} disabled={inputDisabled} />
            )}
            <div className="flex flex-wrap gap-2">
              {grade === null ? (
                <Button onClick={check} disabled={!isAnswerComplete(answer)}>
                  Verificar resposta
                </Button>
              ) : (
                !assessment && (
                  <Button variant="secondary" onClick={retry}>
                    <RotateCcw size={16} aria-hidden /> Tentar novamente
                  </Button>
                )
              )}
            </div>
          </>
        )
      )}

      {grade && <FeedbackBox correct={grade.correct} message={assessment ? undefined : grade.feedback} details={assessment ? undefined : grade.details} />}
      {assessment && isCode && codePassed !== null && <FeedbackBox correct={codePassed} />}

      {!assessment && (grade?.correct || (isCode && codePassed)) && !solutionVisible && (
        <details className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium text-accent-strong">Compare com a explicação comentada</summary>
          <div className="mt-3">
            <SolutionView exercise={exercise} />
          </div>
        </details>
      )}

      {!assessment && (
        <HintPanel
          exercise={exercise}
          revealed={revealed}
          onReveal={reveal}
          solutionVisible={solutionVisible}
          solutionUnlocked={solutionUnlockedNow}
          solutionLockReason={lockReason}
          onShowSolution={showSolution}
        />
      )}
    </article>
  );
}

function FeedbackBox({ correct, message, details }: { correct: boolean; message?: string; details?: string[] }) {
  const box = useRef<HTMLDivElement>(null);
  // Cada resposta verificada monta uma nova caixa: acerto solta faíscas, erro dá uma tremidinha.
  useEffect(() => {
    if (!box.current) return;
    if (correct) celebrate(box.current);
    else shake(box.current);
  }, [correct, message]);
  return (
    <div
      ref={box}
      role="status"
      className={cn(
        'animate-fade-in rounded-lg border px-4 py-3 text-sm',
        correct ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft',
      )}
    >
      <div className={cn('flex items-center gap-2 font-medium', correct ? 'text-success' : 'text-danger')}>
        {correct ? <CheckCircle2 size={16} aria-hidden /> : <XCircle size={16} aria-hidden />}
        {correct ? 'Resposta correta' : 'Ainda não está certo'}
      </div>
      {message && <p className="mt-1 text-fg">{renderInline(message)}</p>}
      {details && details.length > 0 && !correct && (
        <ul className="mt-2 space-y-0.5 text-xs text-muted">
          {details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
