import type { DataMode, ProgressState } from '../types/progress';

/**
 * Abstração de persistência. A interface nunca fala com localStorage ou
 * Neon diretamente: ela usa o ProgressProvider, que usa um repositório.
 */
export interface ProgressRepository {
  readonly mode: DataMode;
  /** Devolve null quando ainda não há progresso salvo. */
  load(): Promise<ProgressState | null>;
  save(state: ProgressState): Promise<void>;
  clear(): Promise<void>;
}

export class PersistenceError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PersistenceError';
  }
}

/** Validação mínima de formato, para não carregar dados corrompidos. */
export function isProgressState(value: unknown): value is ProgressState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    typeof v.profile === 'object' &&
    typeof v.lessons === 'object' &&
    typeof v.exercises === 'object' &&
    Array.isArray(v.attempts) &&
    typeof v.challenges === 'object' &&
    typeof v.projects === 'object' &&
    Array.isArray(v.assessments) &&
    typeof v.reviews === 'object' &&
    typeof v.studyDays === 'object'
  );
}
