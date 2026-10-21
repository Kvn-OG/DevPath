import { beforeEach, describe, expect, it } from 'vitest';
import { computeStats } from '../domain/stats';
import { createInitialState } from '../domain/progressReducer';
import { trackProgress } from '../domain/mastery';
import { tracks } from '../content';
import { buildDemoState, DEMO_PROFILE_NAME } from './demoSeed';
import { LOCAL_KEY, LocalStorageRepository } from './localRepository';
import { changedRows, rowsToState, stateToRows } from './supabaseMapping';

describe('LocalStorageRepository', () => {
  beforeEach(() => window.localStorage.clear());

  it('salva e restaura o progresso', async () => {
    const repo = new LocalStorageRepository('local', LOCAL_KEY);
    expect(await repo.load()).toBeNull();
    const state = buildDemoState(new Date('2026-05-10T12:00:00'));
    await repo.save(state);
    expect(await repo.load()).toEqual(state);
  });

  it('descarta dados corrompidos sem perdê-los', async () => {
    window.localStorage.setItem(LOCAL_KEY, '{"version": 99}');
    const repo = new LocalStorageRepository('local', LOCAL_KEY);
    expect(await repo.load()).toBeNull();
    const backups = Object.keys(window.localStorage).filter((k) => k.startsWith(`${LOCAL_KEY}:corrompido`));
    expect(backups).toHaveLength(1);
  });
});

describe('dados de demonstração', () => {
  it('são identificados e coerentes com as regras do sistema', () => {
    const now = new Date('2026-05-10T12:00:00');
    const demo = buildDemoState(now);
    expect(demo.profile.name).toBe(DEMO_PROFILE_NAME);
    expect(trackProgress(demo, tracks[0]).completedLessons).toBe(5);
    expect(demo.lessons['logica-06'].completedAt).toBeUndefined();
    expect(demo.challenges['desafio-calculadora'].completedAt).toBeDefined();
    expect(demo.projects['projeto-a-comissoes'].completedStepIds).toEqual(['a1']);
    const stats = computeStats(demo);
    expect(stats.accuracy).toBeGreaterThan(0);
    expect(stats.accuracy).toBeLessThan(1);
    expect(demo.attempts.every((a) => new Date(a.at) <= now)).toBe(true);
    const times = demo.attempts.map((a) => a.at);
    expect(times).toEqual([...times].sort());
  });
});

describe('mapeamento Supabase', () => {
  it('converte estado → linhas → estado sem perdas', () => {
    const state = buildDemoState(new Date('2026-05-10T12:00:00'));
    const back = rowsToState(stateToRows(state, 'user-1'));
    expect(back).toEqual(state);
  });

  it('todas as linhas pertencem ao usuário (RLS)', () => {
    const rows = stateToRows(buildDemoState(), 'user-1');
    for (const table of ['lesson_progress', 'exercise_progress', 'exercise_attempts', 'review_items', 'study_days'] as const) {
      expect(rows[table].every((r) => r.user_id === 'user-1')).toBe(true);
    }
    expect(rows.profile.id).toBe('user-1');
  });

  it('envia apenas linhas novas ou alteradas', () => {
    const before = stateToRows(createInitialState(), 'u');
    const state = createInitialState();
    state.lessons['logica-01'] = { lessonId: 'logica-01', startedAt: 'x', lastVisitedAt: 'x' };
    const after = stateToRows(state, 'u');
    expect(changedRows('lesson_progress', after.lesson_progress, before.lesson_progress)).toHaveLength(1);
    expect(changedRows('lesson_progress', after.lesson_progress, after.lesson_progress)).toHaveLength(0);
  });
});
