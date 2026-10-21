// Registro central do conteúdo. A interface consulta o conteúdo somente por aqui,
// então adicionar aulas/exercícios não exige mudar componentes.

import type { Assessment, Challenge, Concept, Exercise, Lesson, Module, Project, Track } from '../types/content';
import { challenges } from './challenges';
import { logicaAssessments, assessmentExercises } from './logica/assessments';
import { logicaConcepts } from './logica/concepts';
import * as l01 from './logica/lessons/01-o-que-e-programar';
import * as l02 from './logica/lessons/02-variaveis';
import * as l03 from './logica/lessons/03-tipos-de-dados';
import * as l04 from './logica/lessons/04-operadores';
import * as l05 from './logica/lessons/05-condicionais';
import * as l06 from './logica/lessons/06-lacos';
import * as l07 from './logica/lessons/07-funcoes';
import * as l08 from './logica/lessons/08-escopo';
import * as l09 from './logica/lessons/09-arrays';
import * as l10 from './logica/lessons/10-objetos';
import * as l11 from './logica/lessons/11-manipulacao-de-dados';
import * as l12 from './logica/lessons/12-depuracao';
import { projects } from './projects';
import { tracks } from './tracks';

const lessonModules = [l01, l02, l03, l04, l05, l06, l07, l08, l09, l10, l11, l12];

export const lessons: Lesson[] = lessonModules.map((m) => m.lesson);
export const lessonExercises: Exercise[] = lessonModules.flatMap((m) => m.exercises);
export const assessments: Assessment[] = logicaAssessments;
export const concepts: Concept[] = logicaConcepts;
export { challenges, projects, tracks };

const challengeExercises = challenges.flatMap((c) => (c.exercise ? [c.exercise] : []));
const projectExercises = projects.flatMap((p) => p.steps.map((s) => s.exercise));

/** Todos os exercícios, de qualquer origem, indexados por ID. */
export const allExercises: Exercise[] = [...lessonExercises, ...assessmentExercises, ...challengeExercises, ...projectExercises];

const byId = <T extends { id: string }>(items: T[]) => new Map(items.map((i) => [i.id, i]));
const lessonMap = byId(lessons);
const exerciseMap = byId(allExercises);
const trackMap = byId(tracks);
const assessmentMap = byId(assessments);
const challengeMap = byId(challenges);
const projectMap = byId(projects);
const conceptMap = byId(concepts);
const moduleMap = new Map<string, Module>(tracks.flatMap((t) => t.modules.map((m) => [m.id, m] as const)));

export const getLesson = (id: string) => lessonMap.get(id);
export const getExercise = (id: string) => exerciseMap.get(id);
export const getTrack = (id: string) => trackMap.get(id);
export const getModule = (id: string) => moduleMap.get(id);
export const getAssessment = (id: string) => assessmentMap.get(id);
export const getChallenge = (id: string): Challenge | undefined => challengeMap.get(id);
export const getProject = (id: string): Project | undefined => projectMap.get(id);
export const getConcept = (id: string) => conceptMap.get(id);

/** Aulas em ordem pedagógica (ordem dos módulos da trilha). */
export function lessonsOfTrack(track: Track): Lesson[] {
  return track.modules.flatMap((m) => m.lessonIds.map((id) => lessonMap.get(id)).filter((l): l is Lesson => !!l));
}

export function lessonExerciseIds(lesson: Lesson): string[] {
  return [lesson.guidedExerciseId, lesson.independentExerciseId];
}

/** Exercícios de aula que praticam um conceito (usados na revisão). */
export function exercisesForConcept(conceptId: string): Exercise[] {
  return lessonExercises.filter((e) => e.concepts.includes(conceptId));
}

export function lessonOfExercise(exerciseId: string): Lesson | undefined {
  return lessons.find((l) => l.guidedExerciseId === exerciseId || l.independentExerciseId === exerciseId);
}
