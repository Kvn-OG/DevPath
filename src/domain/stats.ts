// Estatísticas exibidas no dashboard e na página de progresso.
// Tudo é calculado a partir dos registros do estado.

import { challenges, getAssessment, getChallenge, getExercise, getLesson, getProject, lessonExercises } from '../content';
import type { ProgressState } from '../types/progress';
import { addDays, dateKey, startOfWeek } from './dates';

export interface Stats {
  totalAttempts: number;
  correctAttempts: number;
  /** null quando ainda não há tentativas: não exibimos uma taxa inventada. */
  accuracy: number | null;
  lessonExercisesSolved: number;
  lessonExercisesTotal: number;
  exercisesSolved: number;
  hintsUsedTotal: number;
  solutionsViewed: number;
  challengesCompleted: number;
  challengesAvailable: number;
  studyDaysCount: number;
}

export function computeStats(state: ProgressState): Stats {
  const correct = state.attempts.filter((a) => a.correct).length;
  const progress = Object.values(state.exercises);
  return {
    totalAttempts: state.attempts.length,
    correctAttempts: correct,
    accuracy: state.attempts.length ? correct / state.attempts.length : null,
    lessonExercisesSolved: lessonExercises.filter((e) => state.exercises[e.id]?.solved).length,
    lessonExercisesTotal: lessonExercises.length,
    exercisesSolved: progress.filter((p) => p.solved).length,
    hintsUsedTotal: progress.reduce((sum, p) => sum + p.hintsUsed, 0),
    solutionsViewed: progress.filter((p) => p.solutionViewed).length,
    challengesCompleted: Object.values(state.challenges).filter((c) => c.completedAt).length,
    challengesAvailable: challenges.filter((c) => c.status === 'completo').length,
    studyDaysCount: Object.keys(state.studyDays).length,
  };
}

export interface WeeklyProgress {
  exercisesSolved: number;
  lessonsCompleted: number;
  goal: { exercises: number; lessons: number };
  studyDays: number;
}

export function weeklyProgress(state: ProgressState, now: Date): WeeklyProgress {
  const start = startOfWeek(now);
  const inWeek = (iso?: string) => !!iso && new Date(iso) >= start && new Date(iso) <= now;
  let studyDays = 0;
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i);
    if (day > now) break;
    if (state.studyDays[dateKey(day)]) studyDays++;
  }
  return {
    exercisesSolved: Object.values(state.exercises).filter((p) => inWeek(p.firstSolvedAt)).length,
    lessonsCompleted: Object.values(state.lessons).filter((l) => inWeek(l.completedAt)).length,
    goal: state.profile.weeklyGoal,
    studyDays,
  };
}

/**
 * Dias consecutivos com atividade registrada, terminando hoje ou ontem.
 * Não há punição: se a sequência zera, ela simplesmente recomeça.
 */
export function studyStreak(state: ProgressState, now: Date): number {
  let cursor = state.studyDays[dateKey(now)] ? now : addDays(now, -1);
  let streak = 0;
  while (state.studyDays[dateKey(cursor)]) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export interface HistoryEntry {
  at: string;
  kind: 'exercicio' | 'aula' | 'avaliacao' | 'desafio' | 'projeto';
  title: string;
  detail: string;
  positive: boolean;
}

export function recentHistory(state: ProgressState, limit = 10): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (const a of state.attempts) {
    if (a.source === 'avaliacao') continue; // avaliações aparecem como resultado consolidado
    const exercise = getExercise(a.exerciseId);
    entries.push({
      at: a.at,
      kind: 'exercicio',
      title: exercise?.title ?? a.exerciseId,
      detail: a.correct ? 'Resposta correta' : 'Tentativa sem sucesso',
      positive: a.correct,
    });
  }
  for (const l of Object.values(state.lessons)) {
    if (l.completedAt) entries.push({ at: l.completedAt, kind: 'aula', title: getLesson(l.lessonId)?.title ?? l.lessonId, detail: 'Aula concluída', positive: true });
  }
  for (const r of state.assessments) {
    entries.push({
      at: r.at,
      kind: 'avaliacao',
      title: getAssessment(r.assessmentId)?.title ?? r.assessmentId,
      detail: `${r.correct} de ${r.total} acertos${r.passed ? ' — aprovado' : ''}`,
      positive: r.passed,
    });
  }
  for (const c of Object.values(state.challenges)) {
    if (c.completedAt) entries.push({ at: c.completedAt, kind: 'desafio', title: getChallenge(c.challengeId)?.title ?? c.challengeId, detail: 'Desafio concluído', positive: true });
  }
  for (const p of Object.values(state.projects)) {
    if (p.completedAt) entries.push({ at: p.completedAt, kind: 'projeto', title: getProject(p.projectId)?.title ?? p.projectId, detail: 'Projeto concluído', positive: true });
  }
  return entries.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/** Atividade por dia nas últimas `days` datas (para o gráfico de progresso). */
export function activityByDay(state: ProgressState, now: Date, days = 28): { date: string; activities: number }[] {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = dateKey(addDays(now, -i));
    result.push({ date: key, activities: state.studyDays[key]?.activities ?? 0 });
  }
  return result;
}
