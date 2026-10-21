import type { CodeTaskKind, Difficulty, Exercise, SqlTaskKind } from '../../types/content';

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

const SQL_TASK_LABEL: Record<SqlTaskKind, string> = {
  'write-query': 'Escrever consulta SQL',
  'fix-query': 'Corrigir consulta SQL',
  'modify-data': 'Alterar dados com SQL',
  'create-schema': 'Criar tabelas com SQL',
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
    case 'sql':
      return SQL_TASK_LABEL[exercise.task];
  }
}
