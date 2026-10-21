// Campos de resposta para cada tipo de exercício que não executa código.

import { ArrowDown, ArrowUp } from 'lucide-react';
import { Fragment } from 'react';
import type { Answer } from '../../domain/grading';
import type {
  FillBlanksExercise,
  MultipleChoiceExercise,
  OrderStepsExercise,
  PredictOutputExercise,
  TrueFalseExercise,
} from '../../types/content';
import { cn } from '../../utils/cn';
import { CodeBlock } from '../code/CodeBlock';
import { renderInline } from '../ui/RichText';

interface InputProps<E, A> {
  exercise: E;
  answer: A;
  onChange(answer: A): void;
  disabled: boolean;
}

const optionClass = (selected: boolean, disabled: boolean) =>
  cn(
    'flex w-full cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors',
    selected ? 'border-accent-strong/70 bg-accent-soft text-fg' : 'border-line bg-surface hover:border-line-strong',
    disabled && 'cursor-default opacity-80',
  );

export function MultipleChoiceInput({ exercise, answer, onChange, disabled }: InputProps<MultipleChoiceExercise, Extract<Answer, { type: 'multiple-choice' }>>) {
  const name = `mc-${exercise.id}`;
  return (
    <div className="space-y-3">
      {exercise.code && <CodeBlock code={exercise.code} />}
      <fieldset className="space-y-2">
        <legend className="sr-only">Alternativas</legend>
        {exercise.options.map((option) => (
          <label key={option.id} className={optionClass(answer.optionId === option.id, disabled)}>
            <input
              type="radio"
              name={name}
              className="mt-0.5 accent-[var(--dp-accent)]"
              checked={answer.optionId === option.id}
              disabled={disabled}
              onChange={() => onChange({ type: 'multiple-choice', optionId: option.id })}
            />
            <span>{renderInline(option.text)}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

export function TrueFalseInput({ exercise, answer, onChange, disabled }: InputProps<TrueFalseExercise, Extract<Answer, { type: 'true-false' }>>) {
  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm">
        <span className="text-muted">Afirmação: </span>
        {renderInline(exercise.claim)}
      </p>
      {exercise.code && <CodeBlock code={exercise.code} />}
      <fieldset className="flex gap-2">
        <legend className="mb-2 text-sm font-medium">A afirmação é:</legend>
        {[true, false].map((value) => (
          <label key={String(value)} className={cn(optionClass(answer.value === value, disabled), 'w-auto')}>
            <input
              type="radio"
              name={`tf-${exercise.id}`}
              className="accent-[var(--dp-accent)]"
              checked={answer.value === value}
              disabled={disabled}
              onChange={() => onChange({ ...answer, value })}
            />
            {value ? 'Verdadeira' : 'Falsa'}
          </label>
        ))}
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Justificativa:</legend>
        {exercise.justifications.map((j) => (
          <label key={j.id} className={optionClass(answer.justificationId === j.id, disabled)}>
            <input
              type="radio"
              name={`tfj-${exercise.id}`}
              className="mt-0.5 accent-[var(--dp-accent)]"
              checked={answer.justificationId === j.id}
              disabled={disabled}
              onChange={() => onChange({ ...answer, justificationId: j.id })}
            />
            <span>{renderInline(j.text)}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

export function FillBlanksInput({ exercise, answer, onChange, disabled }: InputProps<FillBlanksExercise, Extract<Answer, { type: 'fill-blanks' }>>) {
  const parts = exercise.template.split(/\[\[(\d+)\]\]/);
  return (
    <pre className="overflow-x-auto rounded-lg border border-line bg-bg p-4 font-mono text-[13px] leading-8 whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const index = Number(part);
        const blank = exercise.blanks[index];
        return (
          <input
            key={i}
            aria-label={`Lacuna ${index + 1}`}
            value={answer.values[index] ?? ''}
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            onChange={(e) => {
              const values = [...answer.values];
              values[index] = e.target.value;
              onChange({ type: 'fill-blanks', values });
            }}
            style={{ width: `${Math.max(blank?.width ?? 6, (answer.values[index] ?? '').length + 1)}ch` }}
            className="mx-0.5 rounded border border-accent-strong/40 bg-surface-2 px-1 text-center text-accent-strong outline-none focus:border-accent-strong"
          />
        );
      })}
    </pre>
  );
}

export function OrderStepsInput({ exercise, answer, onChange, disabled }: InputProps<OrderStepsExercise, Extract<Answer, { type: 'order-steps' }>>) {
  const textOf = (id: string) => exercise.steps.find((s) => s.id === id)?.text ?? id;
  const move = (index: number, delta: number) => {
    const order = [...answer.order];
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    onChange({ type: 'order-steps', order });
  };
  return (
    <ol className="space-y-2" aria-label="Etapas na ordem atual">
      {answer.order.map((id, index) => (
        <li key={id} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-muted tabular-nums">{index + 1}</span>
          <span className="flex-1">{renderInline(textOf(id))}</span>
          <span className="flex gap-1">
            <button
              type="button"
              disabled={disabled || index === 0}
              onClick={() => move(index, -1)}
              aria-label={`Subir etapa: ${textOf(id)}`}
              className="rounded-md border border-line p-1 text-muted hover:text-fg disabled:opacity-30"
            >
              <ArrowUp size={14} aria-hidden />
            </button>
            <button
              type="button"
              disabled={disabled || index === answer.order.length - 1}
              onClick={() => move(index, 1)}
              aria-label={`Descer etapa: ${textOf(id)}`}
              className="rounded-md border border-line p-1 text-muted hover:text-fg disabled:opacity-30"
            >
              <ArrowDown size={14} aria-hidden />
            </button>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function PredictOutputInput({ exercise, answer, onChange, disabled }: InputProps<PredictOutputExercise, Extract<Answer, { type: 'predict-output' }>>) {
  const id = `predict-${exercise.id}`;
  return (
    <div className="space-y-3">
      <CodeBlock code={exercise.code} />
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          Sua previsão da saída
        </label>
        <textarea
          id={id}
          value={answer.text}
          disabled={disabled}
          onChange={(e) => onChange({ type: 'predict-output', text: e.target.value })}
          rows={Math.max(3, exercise.expectedOutput.split('\n').length + 1)}
          spellCheck={false}
          placeholder="Uma linha para cada console.log executado"
          className="w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-[13px] outline-none focus:border-accent-strong/60"
        />
        <p className="mt-1 text-xs text-faint">Espaços extras e o tipo de aspas não importam; a ordem e o conteúdo das linhas, sim.</p>
      </div>
    </div>
  );
}
