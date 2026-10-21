import { describe, expect, it } from 'vitest';
import { getExercise } from '../content';
import type { OrderStepsExercise } from '../types/content';
import { gradeAnswer, isAnswerComplete, normalizePrediction, shuffledStepIds } from './grading';

describe('gradeAnswer', () => {
  it('múltipla escolha devolve o feedback da alternativa escolhida', () => {
    const exercise = getExercise('ex-logica-03-guiado')!;
    const wrong = gradeAnswer(exercise, { type: 'multiple-choice', optionId: 'a' });
    expect(wrong.correct).toBe(false);
    expect(wrong.feedback).toMatch(/aspas/);
    expect(gradeAnswer(exercise, { type: 'multiple-choice', optionId: 'b' }).correct).toBe(true);
  });

  it('verdadeiro/falso exige valor e justificativa corretos e explica qual parte errou', () => {
    const exercise = getExercise('ex-logica-03-independente')!;
    expect(gradeAnswer(exercise, { type: 'true-false', value: false, justificationId: 'j1' }).correct).toBe(true);
    const onlyValue = gradeAnswer(exercise, { type: 'true-false', value: false, justificationId: 'j2' });
    expect(onlyValue.correct).toBe(false);
    expect(onlyValue.feedback).toMatch(/justificativa/);
  });

  it('lacunas aceitam variações equivalentes (aspas e espaços)', () => {
    const exercise = getExercise('ex-logica-10-guiado')!;
    expect(gradeAnswer(exercise, { type: 'fill-blanks', values: ['.nome', '[ "preco" ]', ".estoque"] }).correct).toBe(true);
    const partial = gradeAnswer(exercise, { type: 'fill-blanks', values: ['.nome', '.valor', '.estoque'] });
    expect(partial.correct).toBe(false);
    expect(partial.details).toContain('Lacuna 2: incorreta');
  });

  it('lacunas diferenciam maiúsculas quando o código exige', () => {
    const exercise = getExercise('ex-logica-02-guiado')!;
    expect(gradeAnswer(exercise, { type: 'fill-blanks', values: ['Const', 'let', '='] }).correct).toBe(false);
  });

  it('ordenação conta etapas na posição correta', () => {
    const exercise = getExercise('ex-logica-01-guiado') as OrderStepsExercise;
    const right = exercise.steps.map((s) => s.id);
    expect(gradeAnswer(exercise, { type: 'order-steps', order: right }).correct).toBe(true);
    const swapped = [right[1], right[0], ...right.slice(2)];
    expect(gradeAnswer(exercise, { type: 'order-steps', order: swapped }).feedback).toMatch(/3 de 5/);
  });

  it('previsão de saída ignora espaços extras e tipo de aspas, mas não a ordem', () => {
    const exercise = getExercise('ex-logica-08-guiado')!;
    expect(gradeAnswer(exercise, { type: 'predict-output', text: '  local\n\nglobal ' }).correct).toBe(true);
    const swapped = gradeAnswer(exercise, { type: 'predict-output', text: 'global\nlocal' });
    expect(swapped.correct).toBe(false);
    expect(swapped.feedback).toMatch(/linhas 1, 2/);
    expect(gradeAnswer(exercise, { type: 'predict-output', text: 'local' }).feedback).toMatch(/1 linha/);
    expect(normalizePrediction('[ "a" ]')).toEqual(["[ 'a' ]"]);
  });

  it('respostas incompletas não podem ser enviadas', () => {
    expect(isAnswerComplete({ type: 'true-false', value: true, justificationId: null })).toBe(false);
    expect(isAnswerComplete({ type: 'fill-blanks', values: ['a', ' '] })).toBe(false);
  });
});

describe('shuffledStepIds', () => {
  it('é determinístico e nunca começa na ordem correta', () => {
    const exercise = getExercise('ex-logica-01-guiado') as OrderStepsExercise;
    const a = shuffledStepIds(exercise);
    expect(shuffledStepIds(exercise)).toEqual(a);
    expect(a).not.toEqual(exercise.steps.map((s) => s.id));
    expect([...a].sort()).toEqual(exercise.steps.map((s) => s.id).sort());
  });
});
