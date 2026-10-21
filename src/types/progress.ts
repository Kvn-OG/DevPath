// Tipos do progresso do estudante. Tudo o que aparece no dashboard é derivado
// destes registros — nada de estatísticas inventadas.

export type AttemptSource = 'aula' | 'pratica' | 'revisao' | 'avaliacao' | 'desafio' | 'projeto';

export interface Attempt {
  id: string;
  exerciseId: string;
  at: string;
  correct: boolean;
  /** Maior nível de dica visto antes desta tentativa (0–3). */
  hintsUsed: number;
  solutionViewed: boolean;
  source: AttemptSource;
}

export interface ExerciseProgress {
  exerciseId: string;
  attempts: number;
  failedAttempts: number;
  solved: boolean;
  firstSolvedAt?: string;
  /** Maior nível de dica revelado (0–3). */
  hintsUsed: number;
  solutionViewed: boolean;
  /** Último código escrito (apenas exercícios de código). */
  lastCode?: string;
  /** Código da primeira solução aprovada pelos testes. */
  solvedCode?: string;
}

export interface LessonProgress {
  lessonId: string;
  startedAt: string;
  lastVisitedAt: string;
  completedAt?: string;
}

export interface ChallengeProgress {
  challengeId: string;
  startedAt: string;
  completedAt?: string;
}

export interface ProjectProgress {
  projectId: string;
  startedAt: string;
  completedStepIds: string[];
  /** Reflexões do estudante por etapa ("explique sua decisão"). */
  reflections: Record<string, string>;
  completedAt?: string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  at: string;
  correct: number;
  total: number;
  passed: boolean;
  /** IDs das questões erradas, para orientar a revisão. */
  missedExerciseIds: string[];
}

export interface ReviewItem {
  conceptId: string;
  /** Caixa de Leitner (0–5). Quanto maior, mais espaçada a revisão. */
  box: number;
  dueAt: string;
  lapses: number;
  lastReviewedAt?: string;
}

export interface StudyDay {
  date: string; // AAAA-MM-DD (data local)
  activities: number;
}

export interface Profile {
  name: string;
  createdAt: string;
  weeklyGoal: { exercises: number; lessons: number };
}

export interface ProgressState {
  version: 1;
  profile: Profile;
  lessons: Record<string, LessonProgress>;
  exercises: Record<string, ExerciseProgress>;
  attempts: Attempt[];
  challenges: Record<string, ChallengeProgress>;
  projects: Record<string, ProjectProgress>;
  assessments: AssessmentResult[];
  reviews: Record<string, ReviewItem>;
  studyDays: Record<string, StudyDay>;
}

export type DataMode = 'local' | 'demo' | 'supabase';
