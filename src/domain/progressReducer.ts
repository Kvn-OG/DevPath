// Todas as mudanças de progresso passam por este reducer puro.
// A persistência (local ou Neon) apenas salva o estado resultante.

import { challenges, getAssessment, getExercise, getLesson, lessonOfExercise, projects } from '../content';
import type { Attempt, AssessmentResult, ExerciseProgress, Profile, ProgressState } from '../types/progress';
import { dateKey } from './dates';
import { applyReviewResult, markDueNow, newReviewItem } from './review';

export function createInitialState(now = new Date(), name = ''): ProgressState {
  return {
    version: 1,
    profile: { name, createdAt: now.toISOString(), weeklyGoal: { exercises: 10, lessons: 3 } },
    lessons: {},
    exercises: {},
    attempts: [],
    challenges: {},
    projects: {},
    assessments: [],
    reviews: {},
    studyDays: {},
  };
}

/** Erros seguidos no mesmo exercício a partir dos quais o conceito entra em revisão. */
export const REPEATED_FAILURES_FOR_REVIEW = 2;

export type ProgressAction =
  | { type: 'LESSON_VISITED'; lessonId: string; at: string }
  | { type: 'ATTEMPT_RECORDED'; attempt: Omit<Attempt, 'hintsUsed' | 'solutionViewed'>; code?: string }
  | { type: 'HINT_REVEALED'; exerciseId: string; level: number }
  | { type: 'SOLUTION_VIEWED'; exerciseId: string }
  | { type: 'CODE_SAVED'; exerciseId: string; code: string }
  | { type: 'CHALLENGE_STARTED'; challengeId: string; at: string }
  | { type: 'PROJECT_STARTED'; projectId: string; at: string }
  | { type: 'PROJECT_REFLECTION_SAVED'; projectId: string; stepId: string; text: string }
  | { type: 'ASSESSMENT_COMPLETED'; result: AssessmentResult }
  | { type: 'REVIEW_COMPLETED'; conceptId: string; success: boolean; at: string }
  | { type: 'PROFILE_UPDATED'; patch: Partial<Profile> }
  | { type: 'STATE_REPLACED'; state: ProgressState };

function emptyExercise(exerciseId: string): ExerciseProgress {
  return { exerciseId, attempts: 0, failedAttempts: 0, solved: false, hintsUsed: 0, solutionViewed: false };
}

function touchStudyDay(state: ProgressState, at: string): ProgressState['studyDays'] {
  const key = dateKey(new Date(at));
  const day = state.studyDays[key] ?? { date: key, activities: 0 };
  return { ...state.studyDays, [key]: { ...day, activities: day.activities + 1 } };
}

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'LESSON_VISITED': {
      const current = state.lessons[action.lessonId];
      return {
        ...state,
        lessons: {
          ...state.lessons,
          [action.lessonId]: current
            ? { ...current, lastVisitedAt: action.at }
            : { lessonId: action.lessonId, startedAt: action.at, lastVisitedAt: action.at },
        },
      };
    }

    case 'HINT_REVEALED': {
      const ex = state.exercises[action.exerciseId] ?? emptyExercise(action.exerciseId);
      return {
        ...state,
        exercises: { ...state.exercises, [action.exerciseId]: { ...ex, hintsUsed: Math.max(ex.hintsUsed, action.level) } },
      };
    }

    case 'SOLUTION_VIEWED': {
      const ex = state.exercises[action.exerciseId] ?? emptyExercise(action.exerciseId);
      return { ...state, exercises: { ...state.exercises, [action.exerciseId]: { ...ex, solutionViewed: true } } };
    }

    case 'CODE_SAVED': {
      const ex = state.exercises[action.exerciseId] ?? emptyExercise(action.exerciseId);
      if (ex.lastCode === action.code) return state;
      return { ...state, exercises: { ...state.exercises, [action.exerciseId]: { ...ex, lastCode: action.code } } };
    }

    case 'ATTEMPT_RECORDED':
      return recordAttempt(state, action.attempt, action.code);

    case 'CHALLENGE_STARTED':
      if (state.challenges[action.challengeId]) return state;
      return {
        ...state,
        challenges: { ...state.challenges, [action.challengeId]: { challengeId: action.challengeId, startedAt: action.at } },
      };

    case 'PROJECT_STARTED':
      if (state.projects[action.projectId]) return state;
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: { projectId: action.projectId, startedAt: action.at, completedStepIds: [], reflections: {} },
        },
      };

    case 'PROJECT_REFLECTION_SAVED': {
      const project = state.projects[action.projectId];
      if (!project) return state;
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: { ...project, reflections: { ...project.reflections, [action.stepId]: action.text } },
        },
      };
    }

    case 'ASSESSMENT_COMPLETED': {
      // Conceitos das questões erradas entram (ou são antecipados) na revisão.
      // A diagnóstica fica de fora: ela só orienta o ponto de partida.
      const reviews = { ...state.reviews };
      if (getAssessment(action.result.assessmentId)?.kind !== 'diagnostica') {
        const at = new Date(action.result.at);
        for (const id of action.result.missedExerciseIds) {
          for (const conceptId of getExercise(id)?.concepts ?? []) reviews[conceptId] = markDueNow(reviews[conceptId], conceptId, at);
        }
      }
      return { ...state, reviews, assessments: [...state.assessments, action.result], studyDays: touchStudyDay(state, action.result.at) };
    }

    case 'REVIEW_COMPLETED': {
      const at = new Date(action.at);
      const item = state.reviews[action.conceptId] ?? newReviewItem(action.conceptId, at);
      return {
        ...state,
        reviews: { ...state.reviews, [action.conceptId]: applyReviewResult(item, action.success, at) },
        studyDays: touchStudyDay(state, action.at),
      };
    }

    case 'PROFILE_UPDATED':
      return { ...state, profile: { ...state.profile, ...action.patch } };

    case 'STATE_REPLACED':
      return action.state;
  }
}

function recordAttempt(state: ProgressState, partial: Omit<Attempt, 'hintsUsed' | 'solutionViewed'>, code?: string): ProgressState {
  const previous = state.exercises[partial.exerciseId] ?? emptyExercise(partial.exerciseId);
  const attempt: Attempt = { ...partial, hintsUsed: previous.hintsUsed, solutionViewed: previous.solutionViewed };
  const exercise: ExerciseProgress = {
    ...previous,
    attempts: previous.attempts + 1,
    failedAttempts: previous.failedAttempts + (attempt.correct ? 0 : 1),
    solved: previous.solved || attempt.correct,
    firstSolvedAt: previous.firstSolvedAt ?? (attempt.correct ? attempt.at : undefined),
    lastCode: code ?? previous.lastCode,
    solvedCode: previous.solvedCode ?? (attempt.correct ? code : undefined),
  };

  let next: ProgressState = {
    ...state,
    attempts: [...state.attempts, attempt],
    exercises: { ...state.exercises, [attempt.exerciseId]: exercise },
    studyDays: touchStudyDay(state, attempt.at),
  };

  const at = new Date(attempt.at);

  // Erros recorrentes antecipam a revisão dos conceitos do exercício.
  if (!attempt.correct && attempt.source !== 'avaliacao' && exercise.failedAttempts >= REPEATED_FAILURES_FOR_REVIEW) {
    const reviews = { ...next.reviews };
    for (const conceptId of getExercise(attempt.exerciseId)?.concepts ?? []) {
      reviews[conceptId] = markDueNow(reviews[conceptId], conceptId, at);
    }
    next = { ...next, reviews };
  }

  if (attempt.correct) {
    next = completeLessonIfDone(next, attempt.exerciseId, at);
    next = completeChallengeIfDone(next, attempt.exerciseId, attempt.at);
    next = completeProjectStepIfDone(next, attempt.exerciseId, attempt.at);
  }
  return next;
}

function completeLessonIfDone(state: ProgressState, exerciseId: string, at: Date): ProgressState {
  const lesson = lessonOfExercise(exerciseId);
  if (!lesson) return state;
  const current = state.lessons[lesson.id];
  if (current?.completedAt) return state;
  const done = [lesson.guidedExerciseId, lesson.independentExerciseId].every((id) => state.exercises[id]?.solved);
  if (!done) return state;

  const iso = at.toISOString();
  const reviews = { ...state.reviews };
  // Conceitos recém-aprendidos entram na revisão espaçada.
  for (const conceptId of getLesson(lesson.id)?.concepts ?? []) {
    reviews[conceptId] = reviews[conceptId] ?? newReviewItem(conceptId, at);
  }
  return {
    ...state,
    reviews,
    lessons: {
      ...state.lessons,
      [lesson.id]: { lessonId: lesson.id, startedAt: current?.startedAt ?? iso, lastVisitedAt: current?.lastVisitedAt ?? iso, completedAt: iso },
    },
  };
}

function completeChallengeIfDone(state: ProgressState, exerciseId: string, at: string): ProgressState {
  const challenge = challenges.find((c) => c.exercise?.id === exerciseId);
  if (!challenge) return state;
  const current = state.challenges[challenge.id];
  if (current?.completedAt) return state;
  return {
    ...state,
    challenges: { ...state.challenges, [challenge.id]: { challengeId: challenge.id, startedAt: current?.startedAt ?? at, completedAt: at } },
  };
}

function completeProjectStepIfDone(state: ProgressState, exerciseId: string, at: string): ProgressState {
  const project = projects.find((p) => p.steps.some((s) => s.exercise.id === exerciseId));
  if (!project) return state;
  const step = project.steps.find((s) => s.exercise.id === exerciseId)!;
  const current = state.projects[project.id] ?? { projectId: project.id, startedAt: at, completedStepIds: [], reflections: {} };
  if (current.completedStepIds.includes(step.id)) return state;
  const completedStepIds = [...current.completedStepIds, step.id];
  const completedAt = project.steps.every((s) => completedStepIds.includes(s.id)) ? at : undefined;
  return { ...state, projects: { ...state.projects, [project.id]: { ...current, completedStepIds, completedAt } } };
}
