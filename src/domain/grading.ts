// Correção dos exercícios que não exigem execução de código.
// Exercícios de código são corrigidos por testes em sandbox (src/sandbox).

import type {
  Exercise,
  FillBlanksExercise,
  OrderStepsExercise,
  PredictOutputExercise,
  TrueFalseExercise,
} from '../types/content';

export type Answer =
  | { type: 'multiple-choice'; optionId: string | null }
  | { type: 'true-false'; value: boolean | null; justificationId: string | null }
  | { type: 'fill-blanks'; values: string[] }
  | { type: 'order-steps'; order: string[] }
  | { type: 'predict-output'; text: string };

export interface GradeResult {
  correct: boolean;
  /** Mensagem principal, explicando o erro sem entregar a resposta. */
  feedback: string;
  /** Feedback por parte (lacunas, etapas, linhas). */
  details?: string[];
}

export function isAnswerComplete(answer: Answer): boolean {
  switch (answer.type) {
    case 'multiple-choice':
      return answer.optionId !== null;
    case 'true-false':
      return answer.value !== null && answer.justificationId !== null;
    case 'fill-blanks':
      return answer.values.every((v) => v.trim() !== '');
    case 'order-steps':
      return answer.order.length > 0;
    case 'predict-output':
      return answer.text.trim() !== '';
  }
}

export function gradeAnswer(exercise: Exercise, answer: Answer): GradeResult {
  if (exercise.type === 'code') {
    throw new Error('Exercícios de código são corrigidos por testes no sandbox.');
  }
  if (exercise.type !== answer.type) {
    throw new Error(`Resposta do tipo ${answer.type} para exercício do tipo ${exercise.type}.`);
  }
  switch (exercise.type) {
    case 'multiple-choice': {
      const a = answer as Extract<Answer, { type: 'multiple-choice' }>;
      const option = exercise.options.find((o) => o.id === a.optionId);
      return { correct: a.optionId === exercise.correctOptionId, feedback: option?.feedback ?? 'Escolha uma alternativa.' };
    }
    case 'true-false':
      return gradeTrueFalse(exercise, answer as Extract<Answer, { type: 'true-false' }>);
    case 'fill-blanks':
      return gradeFillBlanks(exercise, (answer as Extract<Answer, { type: 'fill-blanks' }>).values);
    case 'order-steps':
      return gradeOrder(exercise, (answer as Extract<Answer, { type: 'order-steps' }>).order);
    case 'predict-output':
      return gradePrediction(exercise, (answer as Extract<Answer, { type: 'predict-output' }>).text);
  }
}

function gradeTrueFalse(exercise: TrueFalseExercise, answer: Extract<Answer, { type: 'true-false' }>): GradeResult {
  const valueOk = answer.value === exercise.answer;
  const justificationOk = answer.justificationId === exercise.correctJustificationId;
  if (valueOk && justificationOk) {
    return { correct: true, feedback: 'Correto, e com a justificativa certa.' };
  }
  if (valueOk) {
    return {
      correct: false,
      feedback: 'Você acertou o valor da afirmação, mas a justificativa escolhida não explica o motivo. Releia as opções: qual delas descreve o que realmente acontece?',
    };
  }
  if (justificationOk) {
    return {
      correct: false,
      feedback: 'A justificativa escolhida está certa, mas ela contradiz o valor que você marcou. Se a justificativa é verdadeira, a afirmação é verdadeira ou falsa?',
    };
  }
  return { correct: false, feedback: 'O valor e a justificativa não estão corretos. Volte ao conceito e teste o código mentalmente, passo a passo.' };
}

export function normalizeBlank(value: string, caseSensitive = true): string {
  const compact = value.replace(/\s+/g, '').replace(/"/g, "'");
  return caseSensitive ? compact : compact.toLowerCase();
}

function gradeFillBlanks(exercise: FillBlanksExercise, values: string[]): GradeResult {
  const results = exercise.blanks.map((blank, i) => {
    const given = normalizeBlank(values[i] ?? '', blank.caseSensitive ?? true);
    return blank.accept.some((acc) => normalizeBlank(acc, blank.caseSensitive ?? true) === given);
  });
  const right = results.filter(Boolean).length;
  const correct = right === results.length;
  return {
    correct,
    feedback: correct
      ? 'Todas as lacunas estão corretas.'
      : `${right} de ${results.length} lacunas corretas. Revise as marcadas como incorretas.`,
    details: results.map((ok, i) => `Lacuna ${i + 1}: ${ok ? 'correta' : 'incorreta'}`),
  };
}

function gradeOrder(exercise: OrderStepsExercise, order: string[]): GradeResult {
  const expected = exercise.steps.map((s) => s.id);
  const inPlace = expected.filter((id, i) => order[i] === id).length;
  const correct = inPlace === expected.length && order.length === expected.length;
  return {
    correct,
    feedback: correct
      ? 'Ordem correta: cada etapa usa apenas o que as anteriores produziram.'
      : `${inPlace} de ${expected.length} etapas estão na posição correta. Para cada etapa, pergunte: a informação de que ela precisa já existe neste ponto?`,
  };
}

/** Normaliza a previsão do estudante: espaços extras, linhas vazias e tipo de aspas não importam. */
export function normalizePrediction(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' ').replace(/"/g, "'"))
    .filter((line) => line !== '');
}

function gradePrediction(exercise: PredictOutputExercise, text: string): GradeResult {
  const given = normalizePrediction(text);
  const expected = normalizePrediction(exercise.expectedOutput);
  if (given.length !== expected.length) {
    return {
      correct: false,
      feedback: `Sua resposta tem ${given.length} linha(s), mas o programa exibe ${expected.length}. Cada console.log executado gera uma linha.`,
    };
  }
  const wrongLines = expected.map((line, i) => (line === given[i] ? null : i + 1)).filter((n): n is number => n !== null);
  if (wrongLines.length === 0) return { correct: true, feedback: 'Exatamente a saída do programa.' };
  return {
    correct: false,
    feedback: `A quantidade de linhas está certa, mas ${wrongLines.length === 1 ? 'a linha' : 'as linhas'} ${wrongLines.join(', ')} ${wrongLines.length === 1 ? 'está diferente' : 'estão diferentes'} da saída real. Execute o código mentalmente de novo a partir dali.`,
  };
}

/** Embaralhamento determinístico (mesma ordem a cada visita), nunca igual à ordem correta. */
export function shuffledStepIds(exercise: OrderStepsExercise): string[] {
  const ids = exercise.steps.map((s) => s.id);
  let seed = [...exercise.id].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 2 ** 32;
  };
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  if (result.every((id, i) => id === ids[i]) && result.length > 1) {
    [result[0], result[1]] = [result[1], result[0]];
  }
  return result;
}
