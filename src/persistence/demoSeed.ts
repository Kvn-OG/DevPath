// Dados FICTÍCIOS do modo demonstração. São gerados pelo mesmo reducer usado no
// modo real, para que todos os números derivados sejam coerentes entre si.
// A interface exibe um aviso permanente sempre que este modo está ativo.

import { getAssessment, getExercise } from '../content';
import { addDays, newId } from '../domain/dates';
import { createInitialState, progressReducer, type ProgressAction } from '../domain/progressReducer';
import type { AttemptSource, ProgressState } from '../types/progress';

export const DEMO_PROFILE_NAME = 'Estudante de demonstração';

export function buildDemoState(now = new Date()): ProgressState {
  const at = (daysAgo: number, hour: number, minute = 0) => {
    const d = addDays(now, -daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  let state = createInitialState(new Date(at(15, 9)), DEMO_PROFILE_NAME);
  const dispatch = (action: ProgressAction) => {
    state = progressReducer(state, action);
  };

  const attempt = (exerciseId: string, correct: boolean, when: string, source: AttemptSource = 'aula') => {
    const exercise = getExercise(exerciseId);
    const code = exercise?.type === 'code' ? (correct ? exercise.solution.code : exercise.starterCode) : undefined;
    dispatch({ type: 'ATTEMPT_RECORDED', attempt: { id: newId(), exerciseId, at: when, correct, source }, code });
  };

  // Relógio por sessão (dia + hora): mantém as tentativas em ordem cronológica.
  const minuteBySession = new Map<string, number>();
  const nextMinute = (daysAgo: number, hour: number) => {
    const key = `${daysAgo}-${hour}`;
    const minute = (minuteBySession.get(key) ?? 0) + 4;
    minuteBySession.set(key, minute);
    return minute;
  };

  const solve = (exerciseId: string, daysAgo: number, hour: number, opts: { fails?: number; hints?: number; solution?: boolean } = {}) => {
    for (let level = 1; level <= (opts.hints ?? 0); level++) dispatch({ type: 'HINT_REVEALED', exerciseId, level });
    for (let i = 0; i < (opts.fails ?? 0); i++) attempt(exerciseId, false, at(daysAgo, hour, nextMinute(daysAgo, hour)));
    if (opts.solution) dispatch({ type: 'SOLUTION_VIEWED', exerciseId });
    attempt(exerciseId, true, at(daysAgo, hour, nextMinute(daysAgo, hour)));
  };

  const lesson = (n: number, daysAgo: number, hour: number) => {
    const id = `logica-${String(n).padStart(2, '0')}`;
    dispatch({ type: 'LESSON_VISITED', lessonId: id, at: at(daysAgo, hour) });
    return id;
  };

  const assessment = (assessmentId: string, daysAgo: number, missed: string[]) => {
    const def = getAssessment(assessmentId)!;
    const when = at(daysAgo, 20);
    for (const id of def.exerciseIds) attempt(id, !missed.includes(id), when, 'avaliacao');
    const correct = def.exerciseIds.length - missed.length;
    dispatch({
      type: 'ASSESSMENT_COMPLETED',
      result: {
        id: newId(),
        assessmentId,
        at: when,
        correct,
        total: def.exerciseIds.length,
        passed: correct / def.exerciseIds.length >= def.passingScore,
        missedExerciseIds: missed,
      },
    });
  };

  assessment('logica-diagnostica', 15, ['av-diag-2', 'av-diag-4']);

  lesson(1, 14, 19);
  solve('ex-logica-01-guiado', 14, 19);
  solve('ex-logica-01-independente', 14, 19);

  lesson(2, 13, 20);
  solve('ex-logica-02-guiado', 13, 20);
  solve('ex-logica-02-independente', 13, 20, { fails: 1 });

  lesson(3, 11, 18);
  solve('ex-logica-03-guiado', 11, 18);
  solve('ex-logica-03-independente', 11, 18, { fails: 2, hints: 2, solution: true });

  lesson(4, 9, 19);
  solve('ex-logica-04-guiado', 9, 19, { hints: 1 });
  solve('ex-logica-04-independente', 9, 20);

  assessment('logica-m1-avaliacao', 7, ['av-m1-3']);
  dispatch({ type: 'REVIEW_COMPLETED', conceptId: 'variaveis', success: true, at: at(6, 21) });

  lesson(5, 5, 19);
  solve('ex-logica-05-guiado', 5, 19);
  solve('ex-logica-05-independente', 5, 20, { fails: 3, hints: 3 });

  dispatch({ type: 'CHALLENGE_STARTED', challengeId: 'desafio-calculadora', at: at(3, 18) });
  solve('desafio-calculadora-ex', 3, 18, { fails: 1 });

  dispatch({ type: 'PROJECT_STARTED', projectId: 'projeto-a-comissoes', at: at(2, 19) });
  solve('projeto-a-1', 2, 19);
  dispatch({
    type: 'PROJECT_REFLECTION_SAVED',
    projectId: 'projeto-a-comissoes',
    stepId: 'a1',
    text: 'Validei dentro da função porque ela pode ser chamada de vários lugares. (texto fictício de demonstração)',
  });

  lesson(6, 1, 20);
  solve('ex-logica-06-guiado', 1, 20, { hints: 1 });
  attempt('ex-logica-06-independente', false, at(1, 21));

  return state;
}
