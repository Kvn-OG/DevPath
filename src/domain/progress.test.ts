import { describe, expect, it } from 'vitest';
import { getLesson, tracks } from '../content';
import type { AttemptSource, ProgressState } from '../types/progress';
import { addDays } from './dates';
import { computeAchievements, computeXp, levelInfo } from './gamification';
import { conceptMastery, exerciseScore, lessonStatus, trackProgress } from './mastery';
import { createInitialState, progressReducer, type ProgressAction } from './progressReducer';
import { diagnosticSuggestion, nextActivity, recommendations } from './recommendations';
import { applyReviewResult, dueReviews, newReviewItem, REVIEW_INTERVALS } from './review';
import { computeStats, studyStreak, weeklyProgress } from './stats';

const T0 = new Date('2026-03-02T10:00:00'); // segunda-feira
let counter = 0;

function apply(state: ProgressState, ...actions: ProgressAction[]) {
  return actions.reduce(progressReducer, state);
}

function attempt(exerciseId: string, correct: boolean, at = T0, source: AttemptSource = 'aula'): ProgressAction {
  return { type: 'ATTEMPT_RECORDED', attempt: { id: `a${counter++}`, exerciseId, at: at.toISOString(), correct, source } };
}

describe('estado inicial', () => {
  it('não tem estatísticas inventadas', () => {
    const state = createInitialState(T0);
    const stats = computeStats(state);
    expect(stats.accuracy).toBeNull();
    expect(stats.totalAttempts).toBe(0);
    expect(computeXp(state)).toBe(0);
    expect(studyStreak(state, T0)).toBe(0);
    expect(computeAchievements(state, T0).every((a) => !a.unlocked)).toBe(true);
    expect(recommendations(state, T0)).toEqual([]);
  });

  it('sugere a avaliação diagnóstica para quem está começando', () => {
    expect(nextActivity(createInitialState(T0)).kind).toBe('diagnostico');
  });
});

describe('conclusão de aulas', () => {
  it('abrir a aula não a conclui', () => {
    const state = apply(createInitialState(T0), { type: 'LESSON_VISITED', lessonId: 'logica-01', at: T0.toISOString() });
    expect(state.lessons['logica-01'].completedAt).toBeUndefined();
    expect(lessonStatus(state, getLesson('logica-01')!)).toBe('em-andamento');
  });

  it('conclui quando os dois exercícios são resolvidos e agenda a revisão', () => {
    let state = apply(createInitialState(T0), attempt('ex-logica-01-guiado', true));
    expect(state.lessons['logica-01']?.completedAt).toBeUndefined();
    state = apply(state, attempt('ex-logica-01-independente', false), attempt('ex-logica-01-independente', true));
    expect(state.lessons['logica-01'].completedAt).toBe(T0.toISOString());
    expect(state.reviews['algoritmos']).toMatchObject({ box: 0, lapses: 0 });
    expect(new Date(state.reviews['algoritmos'].dueAt).getTime()).toBe(addDays(T0, REVIEW_INTERVALS[0]).getTime());
  });

  it('pré-requisitos bloqueiam a aula seguinte até a conclusão', () => {
    const empty = createInitialState(T0);
    expect(lessonStatus(empty, getLesson('logica-02')!)).toBe('bloqueada');
    const done = apply(empty, attempt('ex-logica-01-guiado', true), attempt('ex-logica-01-independente', true));
    expect(lessonStatus(done, getLesson('logica-02')!)).toBe('disponivel');
  });

  it('domínio considera dicas e solução consultada', () => {
    const clean = apply(createInitialState(T0), attempt('ex-logica-01-guiado', true), attempt('ex-logica-01-independente', true));
    expect(lessonStatus(clean, getLesson('logica-01')!)).toBe('dominada');

    const helped = apply(
      createInitialState(T0),
      attempt('ex-logica-01-guiado', true),
      attempt('ex-logica-01-independente', false),
      { type: 'SOLUTION_VIEWED', exerciseId: 'ex-logica-01-independente' },
      attempt('ex-logica-01-independente', true),
    );
    expect(lessonStatus(helped, getLesson('logica-01')!)).toBe('concluida');
    expect(exerciseScore(helped.exercises['ex-logica-01-independente'])).toBe(0.3);
  });

  it('registra dicas e solução vistas na tentativa', () => {
    const state = apply(createInitialState(T0), { type: 'HINT_REVEALED', exerciseId: 'ex-logica-04-guiado', level: 2 }, attempt('ex-logica-04-guiado', true));
    expect(state.attempts[0]).toMatchObject({ hintsUsed: 2, solutionViewed: false });
    expect(state.exercises['ex-logica-04-guiado'].hintsUsed).toBe(2);
  });
});

describe('revisão espaçada e recomendações', () => {
  it('erros repetidos antecipam a revisão do conceito', () => {
    const state = apply(createInitialState(T0), attempt('ex-logica-05-independente', false), attempt('ex-logica-05-independente', false));
    expect(state.reviews['condicionais']).toBeDefined();
    expect(dueReviews(state, T0, {}).map((d) => d.item.conceptId)).toContain('condicionais');
  });

  it('acertos aumentam o intervalo; erros reiniciam a caixa', () => {
    const item = newReviewItem('funcoes', T0);
    const ok = applyReviewResult(item, true, T0);
    expect(ok.box).toBe(1);
    expect(new Date(ok.dueAt).getTime()).toBe(addDays(T0, REVIEW_INTERVALS[1]).getTime());
    const fail = applyReviewResult(ok, false, T0);
    expect(fail).toMatchObject({ box: 0, lapses: 1 });
  });

  it('recomendação explica o motivo com base nos erros', () => {
    const state = apply(
      createInitialState(T0),
      attempt('ex-logica-05-guiado', false),
      attempt('ex-logica-05-guiado', false),
      attempt('ex-logica-05-independente', false),
      attempt('av-m2-2', false, T0, 'pratica'),
    );
    const rec = recommendations(state, T0).find((r) => r.conceptId === 'condicionais');
    expect(rec?.reason).toMatch(/Recomendamos revisar condicionais porque você teve dificuldade em 3 exercícios desse assunto \(4 tentativas sem sucesso\)/);
  });

  it('avaliação com erros envia os conceitos para revisão', () => {
    const state = apply(createInitialState(T0), {
      type: 'ASSESSMENT_COMPLETED',
      result: { id: 'r1', assessmentId: 'logica-m1-avaliacao', at: T0.toISOString(), correct: 3, total: 4, passed: true, missedExerciseIds: ['av-m1-3'] },
    });
    expect(state.reviews['tipos']).toBeDefined();
  });

  it('diagnóstico sugere a primeira aula com conceito errado e explica o motivo', () => {
    const s = diagnosticSuggestion(['av-diag-4']);
    expect(s.lessonId).toBe('logica-07');
    expect(s.reason).toMatch(/funções/);
  });

  it('domínio do conceito agrega exercícios de todas as origens', () => {
    const state = apply(createInitialState(T0), attempt('ex-logica-07-guiado', true), attempt('av-diag-4', false, T0, 'avaliacao'));
    const m = conceptMastery(state, 'funcoes');
    expect(m.attemptedExercises).toBe(2);
    expect(m.score).toBeCloseTo(0.5);
  });
});

describe('desafios, projetos e trilha', () => {
  it('conclui o desafio quando o exercício passa nos testes', () => {
    const state = apply(createInitialState(T0), { type: 'CHALLENGE_STARTED', challengeId: 'desafio-calculadora', at: T0.toISOString() }, attempt('desafio-calculadora-ex', true, T0, 'desafio'));
    expect(state.challenges['desafio-calculadora'].completedAt).toBeDefined();
  });

  it('conclui etapas do projeto e o projeto inteiro', () => {
    let state = apply(createInitialState(T0), { type: 'PROJECT_STARTED', projectId: 'projeto-a-comissoes', at: T0.toISOString() });
    for (let i = 1; i <= 5; i++) state = apply(state, attempt(`projeto-a-${i}`, true, T0, 'projeto'));
    expect(state.projects['projeto-a-comissoes'].completedStepIds).toHaveLength(5);
    expect(state.projects['projeto-a-comissoes'].completedAt).toBeDefined();
  });

  it('progresso da trilha só chega a 100% com aulas, avaliações e projeto', () => {
    const track = tracks[0];
    let state = createInitialState(T0);
    for (const module of track.modules) {
      for (const id of module.lessonIds) {
        const lesson = getLesson(id)!;
        state = apply(state, attempt(lesson.guidedExerciseId, true), attempt(lesson.independentExerciseId, true));
      }
    }
    expect(trackProgress(state, track).percent).toBeCloseTo(0.7);
    expect(trackProgress(state, track).completed).toBe(false);
  });
});

describe('estatísticas de tempo', () => {
  it('sequência conta dias consecutivos e não pune (só recomeça)', () => {
    const days = [0, 1, 2, 4].map((d) => addDays(T0, -d));
    const state = apply(createInitialState(T0), ...days.map((d) => attempt('ex-logica-01-guiado', true, d)));
    expect(studyStreak(state, T0)).toBe(3);
    expect(studyStreak(state, addDays(T0, 1))).toBe(3); // ontem conta
    expect(studyStreak(state, addDays(T0, 2))).toBe(0);
  });

  it('metas semanais contam apenas a semana atual', () => {
    const state = apply(createInitialState(T0), attempt('ex-logica-01-guiado', true, addDays(T0, -1)), attempt('ex-logica-02-guiado', true, T0));
    expect(weeklyProgress(state, T0).exercisesSolved).toBe(1); // domingo anterior fica fora
  });

  it('níveis crescem com XP', () => {
    expect(levelInfo(0).level).toBe(1);
    expect(levelInfo(100).level).toBe(2);
    expect(levelInfo(299).level).toBe(2);
    expect(levelInfo(300).level).toBe(3);
  });
});
