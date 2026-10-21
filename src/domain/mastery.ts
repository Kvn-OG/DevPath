// Domínio de conceitos e status de aulas, sempre derivados de desempenho real
// (tentativas, dicas e soluções vistas) — nunca de simples navegação.

import { allExercises, assessments, getLesson, lessonsOfTrack } from '../content';
import type { Lesson, Track } from '../types/content';
import type { ExerciseProgress, ProgressState } from '../types/progress';

/** Pontuação de 0 a 1 de um exercício, ou null se nunca foi tentado. */
export function exerciseScore(p: ExerciseProgress | undefined): number | null {
  if (!p || p.attempts === 0) return null;
  if (!p.solved) return 0;
  if (p.solutionViewed) return 0.3;
  const penalty = 0.1 * p.hintsUsed + Math.min(0.3, 0.1 * p.failedAttempts);
  return Math.max(0.4, 1 - penalty);
}

export interface ConceptMastery {
  conceptId: string;
  score: number | null;
  attemptedExercises: number;
  solvedExercises: number;
  /** Exercícios do conceito com pelo menos uma tentativa errada. */
  strugglingExercises: number;
  failedAttempts: number;
}

export function conceptMastery(state: ProgressState, conceptId: string): ConceptMastery {
  const related = allExercises.filter((e) => e.concepts.includes(conceptId));
  let total = 0;
  let attempted = 0;
  let solved = 0;
  let struggling = 0;
  let failed = 0;
  for (const exercise of related) {
    const p = state.exercises[exercise.id];
    const score = exerciseScore(p);
    if (score === null || !p) continue;
    attempted++;
    total += score;
    if (p.solved) solved++;
    if (p.failedAttempts > 0) struggling++;
    failed += p.failedAttempts;
  }
  return {
    conceptId,
    score: attempted === 0 ? null : total / attempted,
    attemptedExercises: attempted,
    solvedExercises: solved,
    strugglingExercises: struggling,
    failedAttempts: failed,
  };
}

export type MasteryLevel = 'nao-praticado' | 'revisar' | 'praticando' | 'dominado';

export function masteryLevel(score: number | null): MasteryLevel {
  if (score === null) return 'nao-praticado';
  if (score >= 0.8) return 'dominado';
  if (score >= 0.55) return 'praticando';
  return 'revisar';
}

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  'nao-praticado': 'Não praticado',
  revisar: 'Precisa revisar',
  praticando: 'Praticando',
  dominado: 'Dominado',
};

export type LessonStatus = 'bloqueada' | 'disponivel' | 'em-andamento' | 'concluida' | 'dominada';

export const LESSON_STATUS_LABEL: Record<LessonStatus, string> = {
  bloqueada: 'Bloqueada',
  disponivel: 'Disponível',
  'em-andamento': 'Em andamento',
  concluida: 'Concluída',
  dominada: 'Dominada',
};

export function isLessonCompleted(state: ProgressState, lessonId: string): boolean {
  return !!state.lessons[lessonId]?.completedAt;
}

/** Aulas da lista que ainda não foram concluídas. */
export function missingLessons(state: ProgressState, lessonIds: string[]): Lesson[] {
  return lessonIds
    .filter((id) => !isLessonCompleted(state, id))
    .map((id) => getLesson(id))
    .filter((l): l is Lesson => !!l);
}

export function missingPrerequisites(state: ProgressState, lesson: Lesson): Lesson[] {
  return missingLessons(state, lesson.prerequisites);
}

/**
 * concluída: exercício guiado e independente resolvidos.
 * dominada: além disso, o independente foi resolvido sem ver a solução e
 * todos os conceitos da aula têm domínio >= 80%.
 */
export function lessonStatus(state: ProgressState, lesson: Lesson): LessonStatus {
  const progress = state.lessons[lesson.id];
  if (progress?.completedAt) {
    const independent = state.exercises[lesson.independentExerciseId];
    const conceptsOk = lesson.concepts.every((c) => (conceptMastery(state, c).score ?? 0) >= 0.8);
    return independent && !independent.solutionViewed && conceptsOk ? 'dominada' : 'concluida';
  }
  if (progress) return 'em-andamento';
  return missingPrerequisites(state, lesson).length > 0 ? 'bloqueada' : 'disponivel';
}

export function bestAssessmentResult(state: ProgressState, assessmentId: string) {
  const results = state.assessments.filter((r) => r.assessmentId === assessmentId);
  if (results.length === 0) return undefined;
  return results.reduce((best, r) => (r.correct / r.total > best.correct / best.total ? r : best));
}

export function isAssessmentPassed(state: ProgressState, assessmentId: string): boolean {
  return state.assessments.some((r) => r.assessmentId === assessmentId && r.passed);
}

export interface TrackProgress {
  totalLessons: number;
  completedLessons: number;
  modulesPassed: number;
  totalModules: number;
  finalPassed: boolean;
  projectsCompleted: number;
  totalProjects: number;
  /** 0–1, combinando aulas (70%), avaliações (20%) e projeto (10%), quando existem. */
  percent: number;
  completed: boolean;
}

export function trackProgress(state: ProgressState, track: Track): TrackProgress {
  const lessons = lessonsOfTrack(track);
  const completedLessons = lessons.filter((l) => isLessonCompleted(state, l.id)).length;
  const moduleAssessments = track.modules.map((m) => m.assessmentId).filter((id): id is string => !!id);
  const modulesPassed = moduleAssessments.filter((id) => isAssessmentPassed(state, id)).length;
  const finalPassed = track.finalAssessmentId ? isAssessmentPassed(state, track.finalAssessmentId) : false;
  const projectsCompleted = track.projectIds.filter((id) => !!state.projects[id]?.completedAt).length;

  const lessonPart = lessons.length ? completedLessons / lessons.length : 0;
  const assessmentCount = moduleAssessments.length + (track.finalAssessmentId ? 1 : 0);
  const assessmentPart = assessmentCount ? (modulesPassed + (finalPassed ? 1 : 0)) / assessmentCount : 0;
  const projectPart = track.projectIds.length ? projectsCompleted / track.projectIds.length : 0;
  // Pesos de aulas (70%), avaliações (20%) e projeto (10%), redistribuídos
  // quando a trilha não tem avaliações ou projeto.
  const parts = [
    { weight: 0.7, value: lessonPart, present: true },
    { weight: 0.2, value: assessmentPart, present: assessmentCount > 0 },
    { weight: 0.1, value: projectPart, present: track.projectIds.length > 0 },
  ].filter((p) => p.present);
  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  const percent = lessons.length === 0 ? 0 : parts.reduce((sum, p) => sum + p.weight * p.value, 0) / totalWeight;

  return {
    totalLessons: lessons.length,
    completedLessons,
    modulesPassed,
    totalModules: moduleAssessments.length,
    finalPassed,
    projectsCompleted,
    totalProjects: track.projectIds.length,
    percent,
    completed: lessons.length > 0 && percent >= 0.999,
  };
}

export function assessmentsOfTrack(trackId: string) {
  return assessments.filter((a) => a.trackId === trackId);
}
