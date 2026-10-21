// Recomendações explicáveis: cada uma diz o motivo, com base nos registros.

import { concepts, getAssessment, getConcept, getExercise, getLesson, getModule, lessonOfExercise, lessonsOfTrack, tracks } from '../content';
import type { ProgressState } from '../types/progress';
import { daysBetween } from './dates';
import { conceptMastery, isAssessmentPassed, isLessonCompleted, missingPrerequisites } from './mastery';
import { dueReviews } from './review';

export interface Recommendation {
  id: string;
  conceptId?: string;
  title: string;
  reason: string;
  href: string;
  priority: number;
}

export function failedAttemptsByConcept(state: ProgressState): Record<string, number> {
  const result: Record<string, number> = {};
  for (const c of concepts) result[c.id] = conceptMastery(state, c.id).failedAttempts;
  return result;
}

export function recommendations(state: ProgressState, now: Date, limit = 5): Recommendation[] {
  const recs: Recommendation[] = [];
  const seenConcepts = new Set<string>();

  // 1) Dificuldade recorrente em um conceito.
  for (const concept of concepts) {
    const m = conceptMastery(state, concept.id);
    if (m.strugglingExercises >= 2 && (m.score ?? 0) < 0.8 && m.failedAttempts >= 3) {
      seenConcepts.add(concept.id);
      recs.push({
        id: `dificuldade-${concept.id}`,
        conceptId: concept.id,
        title: `Revisar ${concept.name.toLowerCase()}`,
        reason: `Recomendamos revisar ${concept.name.toLowerCase()} porque você teve dificuldade em ${m.strugglingExercises} exercícios desse assunto (${m.failedAttempts} tentativas sem sucesso).`,
        href: `/revisao/${concept.id}`,
        priority: 10 + m.failedAttempts,
      });
    }
  }

  // 2) Questões erradas na última tentativa de cada avaliação.
  const latest = new Map<string, (typeof state.assessments)[number]>();
  for (const r of state.assessments) latest.set(r.assessmentId, r);
  for (const result of latest.values()) {
    const missedConcepts = new Set(result.missedExerciseIds.flatMap((id) => getExercise(id)?.concepts ?? []));
    for (const conceptId of missedConcepts) {
      if (seenConcepts.has(conceptId)) continue;
      const concept = getConcept(conceptId);
      if (!concept) continue;
      seenConcepts.add(conceptId);
      recs.push({
        id: `avaliacao-${result.assessmentId}-${conceptId}`,
        conceptId,
        title: `Revisar ${concept.name.toLowerCase()}`,
        reason: `Na ${getAssessment(result.assessmentId)?.title.toLowerCase() ?? 'avaliação'}, você errou questões sobre ${concept.name.toLowerCase()}.`,
        href: `/revisao/${conceptId}`,
        priority: 8,
      });
    }
  }

  // 3) Revisões espaçadas vencidas.
  for (const due of dueReviews(state, now, failedAttemptsByConcept(state))) {
    const conceptId = due.item.conceptId;
    if (seenConcepts.has(conceptId)) continue;
    const concept = getConcept(conceptId);
    if (!concept) continue;
    seenConcepts.add(conceptId);
    const lesson = state.lessons[concept.lessonId];
    const reason = due.item.lastReviewedAt
      ? `Sua última revisão de ${concept.name.toLowerCase()} foi ${formatDays(daysBetween(new Date(due.item.lastReviewedAt), now))}; revisar agora ajuda a fixar o conteúdo.`
      : lesson?.completedAt
        ? `Você concluiu a aula de ${concept.name.toLowerCase()} ${formatDays(daysBetween(new Date(lesson.completedAt), now))}. Revisar conteúdos recentes ajuda a fixá-los.`
        : `Você teve erros recorrentes em exercícios de ${concept.name.toLowerCase()}.`;
    recs.push({ id: `revisao-${conceptId}`, conceptId, title: `Revisão programada: ${concept.name}`, reason, href: `/revisao/${conceptId}`, priority: 5 + due.priority / 10 });
  }

  // 4) Soluções consultadas sem nova tentativa resolvida depois.
  for (const p of Object.values(state.exercises)) {
    if (!p.solutionViewed) continue;
    const lesson = lessonOfExercise(p.exerciseId);
    const exercise = getExercise(p.exerciseId);
    if (!lesson || !exercise) continue;
    recs.push({
      id: `solucao-${p.exerciseId}`,
      title: `Refazer: ${exercise.title}`,
      reason: `Você consultou a solução de "${exercise.title}". Tente resolver de novo, sem ajuda, para confirmar que entendeu.`,
      href: `/exercicios/${p.exerciseId}`,
      priority: 3,
    });
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, limit);
}

function formatDays(days: number): string {
  if (days <= 0) return 'hoje';
  if (days === 1) return 'ontem';
  return `há ${days} dias`;
}

export interface NextActivity {
  kind: 'aula' | 'avaliacao' | 'projeto' | 'diagnostico' | 'revisao' | 'concluido';
  title: string;
  description: string;
  href: string;
}

/** Próxima atividade sugerida na trilha principal, com o motivo. */
export function nextActivity(state: ProgressState): NextActivity {
  const track = tracks.find((t) => t.status === 'completo')!;
  const lessons = lessonsOfTrack(track);

  const inProgress = lessons.find((l) => state.lessons[l.id] && !isLessonCompleted(state, l.id));
  if (inProgress) {
    return { kind: 'aula', title: inProgress.title, description: 'Você começou esta aula e ainda não resolveu os dois exercícios.', href: `/aulas/${inProgress.id}` };
  }

  for (const module of track.modules) {
    const pending = module.lessonIds.map((id) => getLesson(id)!).find((l) => !isLessonCompleted(state, l.id));
    if (pending) {
      const fresh = Object.keys(state.lessons).length === 0 && state.assessments.length === 0;
      if (fresh && track.diagnosticId) {
        return { kind: 'diagnostico', title: 'Avaliação diagnóstica', description: 'Seis perguntas rápidas para sugerir por onde começar. Ou vá direto para a primeira aula.', href: `/avaliacoes/${track.diagnosticId}` };
      }
      const blocked = missingPrerequisites(state, pending).length > 0;
      return {
        kind: 'aula',
        title: pending.title,
        description: blocked ? 'Próxima aula da trilha (conclua os pré-requisitos antes).' : 'Próxima aula da trilha.',
        href: `/aulas/${pending.id}`,
      };
    }
    if (module.assessmentId && !isAssessmentPassed(state, module.assessmentId)) {
      return { kind: 'avaliacao', title: getAssessment(module.assessmentId)!.title, description: `Você concluiu as aulas de "${getModule(module.id)!.title}". Confirme o aprendizado na avaliação do módulo.`, href: `/avaliacoes/${module.assessmentId}` };
    }
  }

  for (const projectId of track.projectIds) {
    if (!state.projects[projectId]?.completedAt) {
      return { kind: 'projeto', title: 'Projeto A — Calculadora de comissões e metas', description: 'Aplique tudo o que aprendeu em um projeto guiado em etapas.', href: `/projetos/${projectId}` };
    }
  }

  if (track.finalAssessmentId && !isAssessmentPassed(state, track.finalAssessmentId)) {
    return { kind: 'avaliacao', title: getAssessment(track.finalAssessmentId)!.title, description: 'Última etapa para concluir a trilha.', href: `/avaliacoes/${track.finalAssessmentId}` };
  }

  return { kind: 'concluido', title: 'Trilha concluída', description: 'Continue praticando com desafios e revisões enquanto as próximas trilhas são produzidas.', href: '/desafios' };
}

/** Sugestão de ponto de partida a partir da avaliação diagnóstica. */
export function diagnosticSuggestion(missedExerciseIds: string[]): { lessonId: string; reason: string } {
  const track = tracks.find((t) => t.status === 'completo')!;
  const missedConcepts = new Set(missedExerciseIds.flatMap((id) => getExercise(id)?.concepts ?? []));
  const first = lessonsOfTrack(track).find((l) => l.concepts.some((c) => missedConcepts.has(c)));
  if (!first) {
    return {
      lessonId: lessonsOfTrack(track)[0].id,
      reason: 'Você acertou todas as perguntas. Mesmo assim, recomendamos fazer as aulas em ordem: os exercícios vão além do diagnóstico e as aulas só são concluídas com eles resolvidos.',
    };
  }
  const names = [...missedConcepts].map((c) => getConcept(c)?.name.toLowerCase()).filter(Boolean);
  return {
    lessonId: first.id,
    reason: `Você errou perguntas sobre ${names.join(', ')}. O primeiro desses assuntos é tratado em "${first.title}". As aulas anteriores continuam valendo como revisão rápida.`,
  };
}
