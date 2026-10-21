// Conversão entre o estado da aplicação e as linhas das tabelas do Supabase
// (supabase/migrations/001_progress.sql). Funções puras, cobertas por testes.

import type { AttemptSource, ProgressState } from '../types/progress';

export interface Rows {
  profile: { id: string; display_name: string; weekly_goal_exercises: number; weekly_goal_lessons: number; created_at: string };
  lesson_progress: { user_id: string; lesson_id: string; started_at: string; last_visited_at: string; completed_at: string | null }[];
  exercise_progress: {
    user_id: string;
    exercise_id: string;
    attempts: number;
    failed_attempts: number;
    solved: boolean;
    first_solved_at: string | null;
    hints_used: number;
    solution_viewed: boolean;
    last_code: string | null;
    solved_code: string | null;
  }[];
  exercise_attempts: { id: string; user_id: string; exercise_id: string; created_at: string; correct: boolean; hints_used: number; solution_viewed: boolean; source: AttemptSource }[];
  challenge_progress: { user_id: string; challenge_id: string; started_at: string; completed_at: string | null }[];
  project_progress: { user_id: string; project_id: string; started_at: string; completed_step_ids: string[]; reflections: Record<string, string>; completed_at: string | null }[];
  assessment_results: { id: string; user_id: string; assessment_id: string; created_at: string; correct: number; total: number; passed: boolean; missed_exercise_ids: string[] }[];
  review_items: { user_id: string; concept_id: string; box: number; due_at: string; lapses: number; last_reviewed_at: string | null }[];
  study_days: { user_id: string; day: string; activities: number }[];
}

export type TableName = Exclude<keyof Rows, 'profile'>;

/** Chave primária de cada tabela, usada em upserts e na comparação de mudanças. */
export const PRIMARY_KEYS: Record<TableName, string[]> = {
  lesson_progress: ['user_id', 'lesson_id'],
  exercise_progress: ['user_id', 'exercise_id'],
  exercise_attempts: ['id'],
  challenge_progress: ['user_id', 'challenge_id'],
  project_progress: ['user_id', 'project_id'],
  assessment_results: ['id'],
  review_items: ['user_id', 'concept_id'],
  study_days: ['user_id', 'day'],
};

export function stateToRows(state: ProgressState, userId: string): Rows {
  return {
    profile: {
      id: userId,
      display_name: state.profile.name,
      weekly_goal_exercises: state.profile.weeklyGoal.exercises,
      weekly_goal_lessons: state.profile.weeklyGoal.lessons,
      created_at: state.profile.createdAt,
    },
    lesson_progress: Object.values(state.lessons).map((l) => ({
      user_id: userId,
      lesson_id: l.lessonId,
      started_at: l.startedAt,
      last_visited_at: l.lastVisitedAt,
      completed_at: l.completedAt ?? null,
    })),
    exercise_progress: Object.values(state.exercises).map((e) => ({
      user_id: userId,
      exercise_id: e.exerciseId,
      attempts: e.attempts,
      failed_attempts: e.failedAttempts,
      solved: e.solved,
      first_solved_at: e.firstSolvedAt ?? null,
      hints_used: e.hintsUsed,
      solution_viewed: e.solutionViewed,
      last_code: e.lastCode ?? null,
      solved_code: e.solvedCode ?? null,
    })),
    exercise_attempts: state.attempts.map((a) => ({
      id: a.id,
      user_id: userId,
      exercise_id: a.exerciseId,
      created_at: a.at,
      correct: a.correct,
      hints_used: a.hintsUsed,
      solution_viewed: a.solutionViewed,
      source: a.source,
    })),
    challenge_progress: Object.values(state.challenges).map((c) => ({
      user_id: userId,
      challenge_id: c.challengeId,
      started_at: c.startedAt,
      completed_at: c.completedAt ?? null,
    })),
    project_progress: Object.values(state.projects).map((p) => ({
      user_id: userId,
      project_id: p.projectId,
      started_at: p.startedAt,
      completed_step_ids: p.completedStepIds,
      reflections: p.reflections,
      completed_at: p.completedAt ?? null,
    })),
    assessment_results: state.assessments.map((r) => ({
      id: r.id,
      user_id: userId,
      assessment_id: r.assessmentId,
      created_at: r.at,
      correct: r.correct,
      total: r.total,
      passed: r.passed,
      missed_exercise_ids: r.missedExerciseIds,
    })),
    review_items: Object.values(state.reviews).map((r) => ({
      user_id: userId,
      concept_id: r.conceptId,
      box: r.box,
      due_at: r.dueAt,
      lapses: r.lapses,
      last_reviewed_at: r.lastReviewedAt ?? null,
    })),
    study_days: Object.values(state.studyDays).map((d) => ({ user_id: userId, day: d.date, activities: d.activities })),
  };
}

const opt = (v: string | null) => v ?? undefined;
const iso = (v: string) => new Date(v).toISOString();

export function rowsToState(rows: Rows): ProgressState {
  return {
    version: 1,
    profile: {
      name: rows.profile.display_name,
      createdAt: iso(rows.profile.created_at),
      weeklyGoal: { exercises: rows.profile.weekly_goal_exercises, lessons: rows.profile.weekly_goal_lessons },
    },
    lessons: Object.fromEntries(
      rows.lesson_progress.map((r) => [
        r.lesson_id,
        { lessonId: r.lesson_id, startedAt: iso(r.started_at), lastVisitedAt: iso(r.last_visited_at), completedAt: r.completed_at ? iso(r.completed_at) : undefined },
      ]),
    ),
    exercises: Object.fromEntries(
      rows.exercise_progress.map((r) => [
        r.exercise_id,
        {
          exerciseId: r.exercise_id,
          attempts: r.attempts,
          failedAttempts: r.failed_attempts,
          solved: r.solved,
          firstSolvedAt: r.first_solved_at ? iso(r.first_solved_at) : undefined,
          hintsUsed: r.hints_used,
          solutionViewed: r.solution_viewed,
          lastCode: opt(r.last_code),
          solvedCode: opt(r.solved_code),
        },
      ]),
    ),
    attempts: rows.exercise_attempts
      .map((r) => ({ id: r.id, exerciseId: r.exercise_id, at: iso(r.created_at), correct: r.correct, hintsUsed: r.hints_used, solutionViewed: r.solution_viewed, source: r.source }))
      .sort((a, b) => a.at.localeCompare(b.at)),
    challenges: Object.fromEntries(
      rows.challenge_progress.map((r) => [r.challenge_id, { challengeId: r.challenge_id, startedAt: iso(r.started_at), completedAt: r.completed_at ? iso(r.completed_at) : undefined }]),
    ),
    projects: Object.fromEntries(
      rows.project_progress.map((r) => [
        r.project_id,
        {
          projectId: r.project_id,
          startedAt: iso(r.started_at),
          completedStepIds: r.completed_step_ids ?? [],
          reflections: r.reflections ?? {},
          completedAt: r.completed_at ? iso(r.completed_at) : undefined,
        },
      ]),
    ),
    assessments: rows.assessment_results
      .map((r) => ({ id: r.id, assessmentId: r.assessment_id, at: iso(r.created_at), correct: r.correct, total: r.total, passed: r.passed, missedExerciseIds: r.missed_exercise_ids ?? [] }))
      .sort((a, b) => a.at.localeCompare(b.at)),
    reviews: Object.fromEntries(
      rows.review_items.map((r) => [
        r.concept_id,
        { conceptId: r.concept_id, box: r.box, dueAt: iso(r.due_at), lapses: r.lapses, lastReviewedAt: r.last_reviewed_at ? iso(r.last_reviewed_at) : undefined },
      ]),
    ),
    studyDays: Object.fromEntries(rows.study_days.map((r) => [r.day, { date: r.day, activities: r.activities }])),
  };
}

/** Linhas novas ou alteradas desde o último snapshot salvo. */
export function changedRows<T extends Record<string, unknown>>(table: TableName, current: T[], previous: T[]): T[] {
  const keyOf = (row: T) => PRIMARY_KEYS[table].map((k) => String(row[k])).join('|');
  const before = new Map(previous.map((row) => [keyOf(row), JSON.stringify(row)]));
  return current.filter((row) => before.get(keyOf(row)) !== JSON.stringify(row));
}
