// Testes de integridade do conteúdo: garantem que as respostas oficiais
// realmente funcionam, que os códigos iniciais não passam sozinhos e que as
// saídas esperadas correspondem à execução real.

import { describe, expect, it } from 'vitest';
import { evaluate, normalizeOutput } from '../sandbox/evaluator';
import { stepStarterCode, referenceCodeBefore } from '../domain/projects';
import type { CodeExercise } from '../types/content';
import {
  allExercises,
  assessments,
  challenges,
  concepts,
  getExercise,
  getLesson,
  lessonExercises,
  lessons,
  projects,
  tracks,
} from './index';

const codeExercises = allExercises.filter((e): e is CodeExercise => e.type === 'code');
const projectExerciseIds = new Set(projects.flatMap((p) => p.steps.map((s) => s.exercise.id)));

describe('quantidade mínima de conteúdo', () => {
  it('tem pelo menos 12 aulas completas', () => {
    expect(lessons.length).toBeGreaterThanOrEqual(12);
  });
  it('tem pelo menos 20 exercícios de aula, sem repetição', () => {
    expect(lessonExercises.length).toBeGreaterThanOrEqual(20);
    const statements = new Set(lessonExercises.map((e) => e.statement));
    expect(statements.size).toBe(lessonExercises.length);
  });
  it('usa pelo menos 3 níveis de dificuldade', () => {
    expect(new Set(lessonExercises.map((e) => e.difficulty)).size).toBeGreaterThanOrEqual(3);
  });
  it('tem pelo menos 5 desafios completos', () => {
    expect(challenges.filter((c) => c.status === 'completo' && c.exercise).length).toBeGreaterThanOrEqual(5);
  });
  it('tem um projeto guiado e uma avaliação final', () => {
    expect(projects.filter((p) => p.status === 'completo' && p.steps.length > 0).length).toBeGreaterThanOrEqual(1);
    expect(assessments.some((a) => a.kind === 'final')).toBe(true);
  });
});

describe('integridade de referências', () => {
  it('IDs de exercícios são únicos', () => {
    const ids = allExercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('aulas referenciam exercícios, pré-requisitos e conceitos existentes', () => {
    const conceptIds = new Set(concepts.map((c) => c.id));
    for (const lesson of lessons) {
      expect(getExercise(lesson.guidedExerciseId), lesson.id).toBeDefined();
      expect(getExercise(lesson.independentExerciseId), lesson.id).toBeDefined();
      for (const p of lesson.prerequisites) expect(getLesson(p), `${lesson.id} -> ${p}`).toBeDefined();
      for (const c of lesson.concepts) expect(conceptIds.has(c), `${lesson.id} -> ${c}`).toBe(true);
    }
  });
  it('exercícios usam conceitos existentes', () => {
    const conceptIds = new Set(concepts.map((c) => c.id));
    for (const e of allExercises) for (const c of e.concepts) expect(conceptIds.has(c), `${e.id} -> ${c}`).toBe(true);
  });
  it('módulos e avaliações apontam para conteúdo existente', () => {
    for (const track of tracks) {
      for (const module of track.modules) for (const id of module.lessonIds) expect(getLesson(id), id).toBeDefined();
    }
    for (const a of assessments) for (const id of a.exerciseIds) expect(getExercise(id), id).toBeDefined();
  });
  it('cada exercício tem três dicas e uma solução explicada', () => {
    for (const e of allExercises) {
      expect(e.hints.every((h) => h.trim().length > 10), e.id).toBe(true);
      expect(e.solution.explanation.length, e.id).toBeGreaterThan(20);
    }
  });
});

describe('exemplos das aulas', () => {
  const jsLessons = lessons.filter((l) => (l.example.language ?? 'javascript') === 'javascript');
  it.each(jsLessons.map((l) => [l.id, l] as const))('%s: a saída do exemplo é a saída real', (_id, lesson) => {
    const result = evaluate(lesson.example.code, [{ name: 'saida', expectOutput: lesson.example.output }]);
    expect(result.error).toBeUndefined();
    expect(normalizeOutput(result.logs.join('\n'))).toBe(normalizeOutput(lesson.example.output));
  });
});

describe('exercícios de prever a saída', () => {
  const predicts = allExercises.filter((e) => e.type === 'predict-output');
  it.each(predicts.map((e) => [e.id, e] as const))('%s: a saída esperada é a saída real', (_id, exercise) => {
    if (exercise.type !== 'predict-output') return;
    const result = evaluate(exercise.code, []);
    expect(result.error).toBeUndefined();
    expect(normalizeOutput(result.logs.join('\n'))).toBe(normalizeOutput(exercise.expectedOutput));
  });
});

describe('exercícios de código', () => {
  const sourceFor = (exercise: CodeExercise, code: string) => {
    // Etapas de projeto dependem das soluções das etapas anteriores.
    const project = projects.find((p) => p.steps.some((s) => s.exercise.id === exercise.id));
    if (!project) return code;
    const index = project.steps.findIndex((s) => s.exercise.id === exercise.id);
    const before = referenceCodeBefore(project, index);
    return before ? `${before}\n\n${code}` : code;
  };

  it.each(codeExercises.map((e) => [e.id, e] as const))('%s: a solução oficial passa em todos os testes', (_id, exercise) => {
    const result = evaluate(sourceFor(exercise, exercise.solution.code!), exercise.tests, exercise.constraints);
    const failures = result.tests.filter((t) => !t.passed).map((t) => `${t.name}: esperado ${t.expected}, recebido ${t.received} ${t.error?.message ?? ''}`);
    expect(result.error).toBeUndefined();
    expect(result.constraintViolations).toEqual([]);
    expect(failures).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it.each(codeExercises.map((e) => [e.id, e] as const))('%s: o código inicial não passa sozinho', (_id, exercise) => {
    let starter = exercise.starterCode;
    if (projectExerciseIds.has(exercise.id)) {
      const project = projects.find((p) => p.steps.some((s) => s.exercise.id === exercise.id))!;
      starter = stepStarterCode(project, project.steps.findIndex((s) => s.exercise.id === exercise.id));
    }
    const result = evaluate(starter, exercise.tests, exercise.constraints);
    expect(result.passed).toBe(false);
  });

  it('todo exercício de código tem ao menos um teste oculto', () => {
    for (const e of codeExercises) expect(e.tests.some((t) => t.hidden), e.id).toBe(true);
  });
});
