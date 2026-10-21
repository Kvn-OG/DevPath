import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { newId } from '../domain/dates';
import { createInitialState, progressReducer } from '../domain/progressReducer';
import { buildDemoState } from '../persistence/demoSeed';
import { DEMO_KEY, LOCAL_KEY, LocalStorageRepository } from '../persistence/localRepository';
import type { ProgressRepository } from '../persistence/repository';
import { getSupabase } from '../persistence/supabaseClient';
import { SupabaseRepository } from '../persistence/supabaseRepository';
import type { AssessmentResult, AttemptSource, DataMode, Profile, ProgressState } from '../types/progress';
import { useAuth } from './AuthProvider';

export const MODE_KEY = 'devpath:mode';
const SAVE_DEBOUNCE_MS = 400;
const RETRY_MS = 15000;

export type SyncStatus = 'carregando' | 'salvo' | 'salvando' | 'erro';

export interface ProgressActions {
  visitLesson(lessonId: string): void;
  recordAttempt(exerciseId: string, correct: boolean, source: AttemptSource, code?: string): void;
  revealHint(exerciseId: string, level: number): void;
  viewSolution(exerciseId: string): void;
  saveCode(exerciseId: string, code: string): void;
  startChallenge(challengeId: string): void;
  startProject(projectId: string): void;
  saveReflection(projectId: string, stepId: string, text: string): void;
  completeAssessment(result: Omit<AssessmentResult, 'id' | 'at'>): void;
  completeReview(conceptId: string, success: boolean): void;
  updateProfile(patch: Partial<Profile>): void;
  replaceState(state: ProgressState): void;
  resetProgress(): Promise<void>;
}

interface ProgressContextValue {
  state: ProgressState;
  actions: ProgressActions;
  /** Modo escolhido pelo estudante: o próprio progresso ou a demonstração. */
  mode: DataMode;
  /** Modo efetivamente em uso: com login, o próprio progresso é sincronizado com a conta. */
  activeMode: DataMode;
  setMode(mode: DataMode): void;
  status: SyncStatus;
  error: string | null;
  /** Aviso informativo (ex.: progresso deste navegador enviado para a conta). */
  notice: string | null;
  ready: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readStoredMode(): DataMode {
  try {
    const value = window.localStorage.getItem(MODE_KEY);
    // 'supabase' (versões antigas) virou o padrão: sincroniza sempre que houver login.
    return value === 'demo' ? 'demo' : 'local';
  } catch {
    return 'local';
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [mode, setModeState] = useState<DataMode>(readStoredMode);
  const [state, dispatch] = useReducer(progressReducer, undefined, () => createInitialState());
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SyncStatus>('carregando');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const loadedState = useRef<ProgressState | null>(null);

  const supabase = getSupabase();
  const activeMode: DataMode = mode === 'demo' ? 'demo' : supabase && auth.user ? 'supabase' : 'local';

  const repository = useMemo<ProgressRepository>(() => {
    if (activeMode === 'supabase') return new SupabaseRepository(supabase!, auth.user!.id);
    if (activeMode === 'demo') return new LocalStorageRepository('demo', DEMO_KEY);
    return new LocalStorageRepository('local', LOCAL_KEY);
  }, [activeMode, supabase, auth.user]);

  // Carrega o estado sempre que o repositório muda (troca de modo, login, logout).
  useEffect(() => {
    if (mode !== 'demo' && auth.loading) return;
    let cancelled = false;
    setReady(false);
    setStatus('carregando');
    setError(null);
    setNotice(null);
    repository
      .load()
      .then(async (loaded) => {
        if (cancelled) return;
        let initial = loaded ?? (repository.mode === 'demo' ? buildDemoState() : createInitialState());
        let adopted = false;
        // Primeiro login: a conta ainda está vazia, então leva junto o progresso feito neste navegador.
        if (repository.mode === 'supabase' && !hasActivity(initial)) {
          const local = await new LocalStorageRepository('local', LOCAL_KEY).load().catch(() => null);
          if (cancelled) return;
          if (local && hasActivity(local)) {
            initial = { ...local, profile: { ...local.profile, name: local.profile.name || initial.profile.name } };
            adopted = true;
            setNotice('O progresso deste navegador foi enviado para a sua conta.');
          }
        }
        loadedState.current = loaded && !adopted ? initial : null; // estado novo precisa ser salvo
        dispatch({ type: 'STATE_REPLACED', state: initial });
        if (repository instanceof SupabaseRepository && repository.loadedFromCache) {
          setError('Sem conexão com o Supabase: usando a cópia salva neste navegador. As alterações serão enviadas quando a conexão voltar.');
          setStatus('erro');
        } else {
          setStatus('salvo');
        }
        setReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus('erro');
        dispatch({ type: 'STATE_REPLACED', state: createInitialState() });
        loadedState.current = null;
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [repository, mode, auth.loading]);

  // Salva automaticamente (com debounce) e tenta de novo após falhas.
  const [retryTick, setRetryTick] = useState(0);
  useEffect(() => {
    if (!ready || state === loadedState.current) return;
    const timer = window.setTimeout(() => {
      setStatus('salvando');
      repository
        .save(state)
        .then(() => {
          loadedState.current = state;
          setStatus('salvo');
          setError(null);
        })
        .catch((err: unknown) => {
          setStatus('erro');
          setError(err instanceof Error ? err.message : String(err));
          window.setTimeout(() => setRetryTick((n) => n + 1), RETRY_MS);
        });
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [state, ready, repository, retryTick]);

  const setMode = useCallback((next: DataMode) => {
    try {
      window.localStorage.setItem(MODE_KEY, next);
    } catch {
      // segue apenas em memória
    }
    setModeState(next);
  }, []);

  const actions = useMemo<ProgressActions>(() => {
    const now = () => new Date().toISOString();
    return {
      visitLesson: (lessonId) => dispatch({ type: 'LESSON_VISITED', lessonId, at: now() }),
      recordAttempt: (exerciseId, correct, source, code) =>
        dispatch({ type: 'ATTEMPT_RECORDED', attempt: { id: newId(), exerciseId, at: now(), correct, source }, code }),
      revealHint: (exerciseId, level) => dispatch({ type: 'HINT_REVEALED', exerciseId, level }),
      viewSolution: (exerciseId) => dispatch({ type: 'SOLUTION_VIEWED', exerciseId }),
      saveCode: (exerciseId, code) => dispatch({ type: 'CODE_SAVED', exerciseId, code }),
      startChallenge: (challengeId) => dispatch({ type: 'CHALLENGE_STARTED', challengeId, at: now() }),
      startProject: (projectId) => dispatch({ type: 'PROJECT_STARTED', projectId, at: now() }),
      saveReflection: (projectId, stepId, text) => dispatch({ type: 'PROJECT_REFLECTION_SAVED', projectId, stepId, text }),
      completeAssessment: (result) => dispatch({ type: 'ASSESSMENT_COMPLETED', result: { ...result, id: newId(), at: now() } }),
      completeReview: (conceptId, success) => dispatch({ type: 'REVIEW_COMPLETED', conceptId, success, at: now() }),
      updateProfile: (patch) => dispatch({ type: 'PROFILE_UPDATED', patch }),
      replaceState: (next) => dispatch({ type: 'STATE_REPLACED', state: next }),
      resetProgress: async () => {
        await repository.clear();
        const fresh = repository.mode === 'demo' ? buildDemoState() : createInitialState();
        loadedState.current = null;
        dispatch({ type: 'STATE_REPLACED', state: fresh });
      },
    };
  }, [repository]);

  const value = useMemo(
    () => ({ state, actions, mode, activeMode, setMode, status, error, notice, ready }),
    [state, actions, mode, activeMode, setMode, status, error, notice, ready],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

/** true quando há algum progresso real (não só o perfil criado no cadastro). */
export function hasActivity(state: ProgressState): boolean {
  return (
    state.attempts.length > 0 ||
    state.assessments.length > 0 ||
    Object.keys(state.lessons).length > 0 ||
    Object.keys(state.exercises).length > 0 ||
    Object.keys(state.challenges).length > 0 ||
    Object.keys(state.projects).length > 0
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress precisa estar dentro de <ProgressProvider>.');
  return ctx;
}
