import type { Project } from '../types/content';
import type { ProgressState } from '../types/progress';

/** Código das soluções de referência das etapas anteriores a `stepIndex`. */
export function referenceCodeBefore(project: Project, stepIndex: number): string {
  return project.steps
    .slice(0, stepIndex)
    .map((s) => s.exercise.solution.code ?? '')
    .join('\n\n');
}

/**
 * Código inicial de uma etapa: o código com que o estudante passou na etapa
 * anterior (ou, se ainda não houver, a referência) + o esqueleto da etapa atual.
 */
export function stepStarterCode(project: Project, stepIndex: number, state?: ProgressState): string {
  const step = project.steps[stepIndex];
  if (stepIndex === 0) return step.exercise.starterCode;
  const previous = project.steps[stepIndex - 1];
  const own = state?.exercises[previous.exercise.id]?.solvedCode;
  const base = own ?? referenceCodeBefore(project, stepIndex);
  return `${base.trimEnd()}\n\n${step.exercise.starterCode}`;
}

export function isStepUnlocked(project: Project, stepIndex: number, state: ProgressState): boolean {
  if (stepIndex === 0) return true;
  const done = state.projects[project.id]?.completedStepIds ?? [];
  return done.includes(project.steps[stepIndex - 1].id);
}
