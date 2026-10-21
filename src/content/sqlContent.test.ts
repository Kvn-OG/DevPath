// @vitest-environment node
// Integridade do conteúdo de SQL em um PostgreSQL real (PGlite): saídas dos
// exemplos, soluções oficiais aprovadas e códigos iniciais reprovados.

import { beforeAll, describe, expect, it } from 'vitest';
import { normalizeOutput } from '../sandbox/evaluator';
import { createSqlDatabase } from '../sandbox/sqlDatabase';
import { evaluateSql, runSqlProgram, type SqlDatabase } from '../sandbox/sqlEvaluator';
import type { SqlExercise } from '../types/content';
import { allExercises, lessons } from './index';

const sqlLessons = lessons.filter((l) => l.example.language === 'sql');
const sqlExercises = allExercises.filter((e): e is SqlExercise => e.type === 'sql');

let db: SqlDatabase;
beforeAll(async () => {
  db = await createSqlDatabase();
}, 60_000);

describe('exemplos de SQL', () => {
  it.each(sqlLessons.map((l) => [l.id, l] as const))('%s: a saída do exemplo é a saída real', async (_id, lesson) => {
    const result = await runSqlProgram(db, lesson.example.setup ?? '', lesson.example.code);
    expect(result.error).toBeUndefined();
    const actual = result.logs.join('\n\n');
    if (normalizeOutput(actual) !== normalizeOutput(lesson.example.output)) console.log(`--- ${lesson.id} ---\n${actual}`);
    expect(normalizeOutput(actual)).toBe(normalizeOutput(lesson.example.output));
  });
});

describe('exercícios de SQL', () => {
  it.each(sqlExercises.map((e) => [e.id, e] as const))('%s: os dados do exercício são válidos', async (_id, exercise) => {
    const result = await runSqlProgram(db, exercise.setup, '');
    expect(result.error).toBeUndefined();
  });

  it.each(sqlExercises.map((e) => [e.id, e] as const))('%s: a solução oficial passa em todos os testes', async (_id, exercise) => {
    const result = await evaluateSql(db, exercise.setup, exercise.solution.code!, exercise.tests, exercise.constraints);
    const failures = result.tests
      .filter((t) => !t.passed)
      .map((t) => `${t.name}:\nesperado\n${t.expected}\nrecebido\n${t.received} ${t.error ? `${t.error.message}` : ''}`);
    expect(result.error).toBeUndefined();
    expect(result.constraintViolations).toEqual([]);
    expect(failures).toEqual([]);
  });

  it.each(sqlExercises.map((e) => [e.id, e] as const))('%s: o código inicial não passa sozinho', async (_id, exercise) => {
    const result = await evaluateSql(db, exercise.setup, exercise.starterCode, exercise.tests, exercise.constraints);
    expect(result.passed).toBe(false);
  });

  it('todo exercício de SQL tem ao menos um teste oculto e colunas nos testes visíveis', () => {
    for (const e of sqlExercises) {
      expect(e.tests.some((t) => t.hidden), e.id).toBe(true);
      expect(e.tests.filter((t) => !t.hidden).every((t) => t.expected.columns), e.id).toBe(true);
    }
  });
});
