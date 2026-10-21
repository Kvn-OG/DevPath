// Revisão espaçada simples (caixas de Leitner).
// Cada conceito tem uma caixa; acertos aumentam o intervalo, erros o reiniciam.

import type { ProgressState, ReviewItem } from '../types/progress';
import { addDays, daysBetween } from './dates';

/** Intervalo em dias para cada caixa (0–5). */
export const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30];
export const MAX_BOX = REVIEW_INTERVALS.length - 1;

export function newReviewItem(conceptId: string, at: Date): ReviewItem {
  return { conceptId, box: 0, dueAt: addDays(at, REVIEW_INTERVALS[0]).toISOString(), lapses: 0 };
}

export function applyReviewResult(item: ReviewItem, success: boolean, at: Date): ReviewItem {
  if (success) {
    const box = Math.min(item.box + 1, MAX_BOX);
    return { ...item, box, dueAt: addDays(at, REVIEW_INTERVALS[box]).toISOString(), lastReviewedAt: at.toISOString() };
  }
  return {
    ...item,
    box: 0,
    lapses: item.lapses + 1,
    dueAt: addDays(at, REVIEW_INTERVALS[0]).toISOString(),
    lastReviewedAt: at.toISOString(),
  };
}

/** Antecipa a revisão de um conceito para agora (usado quando há erros recorrentes). */
export function markDueNow(item: ReviewItem | undefined, conceptId: string, at: Date): ReviewItem {
  const base = item ?? newReviewItem(conceptId, at);
  const dueAt = new Date(base.dueAt) < at ? base.dueAt : at.toISOString();
  return { ...base, dueAt };
}

export interface DueReview {
  item: ReviewItem;
  priority: number;
  overdueDays: number;
}

/** Revisões vencidas, das mais prioritárias para as menos. */
export function dueReviews(state: ProgressState, now: Date, failedByConcept: Record<string, number>): DueReview[] {
  return Object.values(state.reviews)
    .filter((item) => new Date(item.dueAt) <= now)
    .map((item) => {
      const overdueDays = Math.max(0, daysBetween(new Date(item.dueAt), now));
      // Erros recorrentes pesam mais; conceitos novos (caixas baixas) vêm antes dos consolidados.
      const priority = item.lapses * 3 + (failedByConcept[item.conceptId] ?? 0) + (MAX_BOX - item.box) + overdueDays * 0.5;
      return { item, priority, overdueDays };
    })
    .sort((a, b) => b.priority - a.priority);
}

export function upcomingReviews(state: ProgressState, now: Date): ReviewItem[] {
  return Object.values(state.reviews)
    .filter((item) => new Date(item.dueAt) > now)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}
