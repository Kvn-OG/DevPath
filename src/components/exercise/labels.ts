import type { CodeTaskKind, Difficulty, Exercise } from '../../types/content';

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  iniciante: 'Iniciante',
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

const CODE_TASK_LABEL: Record<CodeTaskKind, string> = {
  'write-function': 'Escrever função',
  'fix-bug': 'Corrigir bug',
  'complete-code': 'Completar código',
  algorithm: 'Resolver algoritmo',
  refactor: 'Refatorar',
};

export function EXERCISE_TYPE_LABEL(exercise: Exercise): string {
  switch (exercise.type) {
    case 'multiple-choice':
      return 'Múltipla escolha';
    case 'true-false':
      return 'Verdadeiro ou falso';
    case 'fill-blanks':
      return 'Preencher lacunas';
    case 'order-steps':
      return 'Ordenar etapas';
    case 'predict-output':
      return 'Prever a saída';
    case 'code':
      return CODE_TASK_LABEL[exercise.task];
  }
}
