// Gamificação moderada: XP, níveis e conquistas derivados de atividades concluídas.
// Nada é perdido por ficar dias sem estudar.

import { allExercises, assessments, challenges, lessonExercises, tracks } from '../content';
import type { Difficulty } from '../types/content';
import type { ProgressState } from '../types/progress';
import { addDays, dateKey, startOfWeek } from './dates';
import { trackProgress } from './mastery';

const EXERCISE_XP: Record<Difficulty, number> = { iniciante: 10, basico: 15, intermediario: 25, avancado: 40 };
const CHALLENGE_XP: Record<string, number> = { iniciante: 80, basico: 120, intermediario: 180, avancado: 250 };

export function computeXp(state: ProgressState): number {
  let xp = 0;
  for (const exercise of allExercises) {
    const p = state.exercises[exercise.id];
    if (!p?.solved) continue;
    // Ajuda reduz o XP, mas nunca zera: tentar e aprender com a solução também conta.
    const factor = p.solutionViewed ? 0.3 : Math.max(0.4, 1 - 0.15 * p.hintsUsed);
    xp += Math.round(EXERCISE_XP[exercise.difficulty] * factor);
  }
  xp += Object.values(state.lessons).filter((l) => l.completedAt).length * 30;
  for (const c of Object.values(state.challenges)) {
    const challenge = challenges.find((ch) => ch.id === c.challengeId);
    if (c.completedAt && challenge) xp += CHALLENGE_XP[challenge.level] ?? 100;
  }
  for (const p of Object.values(state.projects)) xp += p.completedStepIds.length * 50;
  const passed = new Set(state.assessments.filter((r) => r.passed).map((r) => r.assessmentId));
  for (const id of passed) {
    const kind = assessments.find((a) => a.id === id)?.kind;
    xp += kind === 'final' ? 150 : kind === 'modulo' ? 80 : 20;
  }
  xp += state.attempts.filter((a) => a.source === 'revisao' && a.correct).length * 5;
  return xp;
}

const LEVEL_NAMES = ['Iniciante', 'Aprendiz', 'Explorador', 'Construtor', 'Solucionador', 'Desenvolvedor', 'Arquiteto', 'Mentor'];

/** XP acumulado necessário para atingir o nível n (n >= 1). */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level; // 0, 100, 300, 600, 1000...
}

export interface LevelInfo {
  level: number;
  name: string;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    name: LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1],
    xp,
    currentLevelXp: current,
    nextLevelXp: next,
    progress: (xp - current) / (next - current),
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export function computeAchievements(state: ProgressState, now: Date): Achievement[] {
  const solvedClean = Object.values(state.exercises).filter((p) => p.solved && p.hintsUsed === 0 && !p.solutionViewed).length;
  const persistent = Object.values(state.exercises).some((p) => p.solved && p.failedAttempts >= 3);
  const bugFixes = lessonExercises.filter((e) => e.type === 'code' && e.task === 'fix-bug');
  const passed = (id: string) => state.assessments.some((r) => r.assessmentId === id && r.passed);
  const reviewsDone = state.attempts.filter((a) => a.source === 'revisao' && a.correct).length;
  const logica = tracks.find((t) => t.id === 'logica-js');

  const weekStart = startOfWeek(now);
  let daysThisWeek = 0;
  for (let i = 0; i < 7; i++) if (state.studyDays[dateKey(addDays(weekStart, i))]) daysThisWeek++;

  return [
    { id: 'primeira-aula', title: 'Primeiro passo', description: 'Concluir a primeira aula.', unlocked: Object.values(state.lessons).some((l) => l.completedAt) },
    { id: 'sem-ajuda', title: 'Por conta própria', description: 'Resolver 5 exercícios sem dicas nem solução.', unlocked: solvedClean >= 5 },
    { id: 'persistente', title: 'Persistência', description: 'Resolver um exercício depois de 3 ou mais tentativas sem sucesso.', unlocked: persistent },
    { id: 'cacador-bugs', title: 'Caçador de bugs', description: 'Corrigir todos os bugs dos exercícios de depuração das aulas.', unlocked: bugFixes.every((e) => state.exercises[e.id]?.solved) },
    { id: 'modulo-1', title: 'Primeiros passos', description: 'Ser aprovado na avaliação do módulo 1.', unlocked: passed('logica-m1-avaliacao') },
    { id: 'modulo-2', title: 'Fluxo sob controle', description: 'Ser aprovado na avaliação do módulo 2.', unlocked: passed('logica-m2-avaliacao') },
    { id: 'modulo-3', title: 'Dados na mão', description: 'Ser aprovado na avaliação do módulo 3.', unlocked: passed('logica-m3-avaliacao') },
    { id: 'primeiro-desafio', title: 'Desafiante', description: 'Concluir um desafio prático.', unlocked: Object.values(state.challenges).some((c) => c.completedAt) },
    { id: 'projeto-a', title: 'Primeiro projeto', description: 'Concluir o Projeto A.', unlocked: !!state.projects['projeto-a-comissoes']?.completedAt },
    { id: 'revisor', title: 'Memória em dia', description: 'Concluir 5 revisões com sucesso.', unlocked: reviewsDone >= 5 },
    { id: 'semana-ativa', title: 'Semana ativa', description: 'Estudar em 3 dias diferentes da mesma semana.', unlocked: daysThisWeek >= 3 },
    { id: 'trilha-logica', title: 'Lógica concluída', description: 'Concluir a trilha de lógica de programação.', unlocked: !!logica && trackProgress(state, logica).completed },
  ];
}

/** Marcos de 25/50/75/100% das aulas de uma trilha. */
export function trackMilestones(completedLessons: number, totalLessons: number) {
  return [0.25, 0.5, 0.75, 1].map((fraction) => ({
    fraction,
    label: `${Math.round(fraction * 100)}%`,
    reached: totalLessons > 0 && completedLessons / totalLessons >= fraction,
  }));
}
