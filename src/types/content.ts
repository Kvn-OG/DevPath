// Tipos do conteúdo educacional. O conteúdo vive em src/content e é
// independente da interface: novas aulas e exercícios só precisam seguir estes tipos.

export type Difficulty = 'iniciante' | 'basico' | 'intermediario' | 'avancado';

/** Estado editorial: só "completo" pode ser estudado. */
export type ContentStatus = 'completo' | 'em-producao' | 'planejado';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'code'; code: string; caption?: string }
  | { type: 'callout'; tone: 'info' | 'tip' | 'warning'; title?: string; text: string };

export interface Concept {
  id: string;
  name: string;
  lessonId: string;
}

export interface LineExplanation {
  /** Número da linha no exemplo (começa em 1). */
  line: number;
  text: string;
}

export interface CommonError {
  title: string;
  wrong?: string;
  why: string;
  fix: string;
}

export interface ReviewQuestion {
  question: string;
  answer: string;
}

export interface Lesson {
  id: string;
  trackId: string;
  moduleId: string;
  title: string;
  durationMin: number;
  objectives: string[];
  /** IDs de aulas que precisam estar concluídas antes. */
  prerequisites: string[];
  concepts: string[];
  explanation: Block[];
  analogy?: string;
  example: {
    code: string;
    lineByLine?: LineExplanation[];
    output: string;
  };
  commonErrors: CommonError[];
  guidedExerciseId: string;
  independentExerciseId: string;
  reviewQuestions: ReviewQuestion[];
  summary: string[];
  completionCriteria: string[];
}

// ---------------------------------------------------------------------------
// Exercícios

export type ExerciseType =
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blanks'
  | 'order-steps'
  | 'predict-output'
  | 'code';

/** Subtipo pedagógico dos exercícios de código. */
export type CodeTaskKind = 'write-function' | 'fix-bug' | 'complete-code' | 'algorithm' | 'refactor';

export interface ExerciseBase {
  id: string;
  title: string;
  difficulty: Difficulty;
  concepts: string[];
  statement: string;
  context?: string;
  requirements?: string[];
  /** Dica 1: conceito; Dica 2: raciocínio; Dica 3: estrutura parcial. */
  hints: [string, string, string];
  solution: { code?: string; explanation: string };
}

export interface MultipleChoiceExercise extends ExerciseBase {
  type: 'multiple-choice';
  code?: string;
  options: { id: string; text: string; feedback: string }[];
  correctOptionId: string;
}

export interface TrueFalseExercise extends ExerciseBase {
  type: 'true-false';
  claim: string;
  code?: string;
  answer: boolean;
  justifications: { id: string; text: string }[];
  correctJustificationId: string;
}

export interface FillBlanksExercise extends ExerciseBase {
  type: 'fill-blanks';
  /** Texto/código com marcadores [[0]], [[1]]... */
  template: string;
  blanks: { accept: string[]; caseSensitive?: boolean; width?: number }[];
}

export interface OrderStepsExercise extends ExerciseBase {
  type: 'order-steps';
  /** Etapas na ordem correta; a interface embaralha de forma determinística. */
  steps: { id: string; text: string }[];
}

export interface PredictOutputExercise extends ExerciseBase {
  type: 'predict-output';
  code: string;
  /** Saída esperada; validada nos testes de conteúdo executando o código. */
  expectedOutput: string;
}

export type CodeTest =
  /** Executa `code` (corpo de função) depois do código do estudante e compara o retorno. */
  | { name: string; code: string; expected: unknown; hidden?: boolean }
  /** Compara a saída do console do programa inteiro. */
  | { name: string; expectOutput: string; hidden?: boolean };

export interface CodeConstraint {
  kind: 'must-include' | 'must-not-include';
  /** Expressão regular aplicada ao código sem comentários. */
  pattern: string;
  message: string;
}

export interface CodeExercise extends ExerciseBase {
  type: 'code';
  task: CodeTaskKind;
  starterCode: string;
  tests: CodeTest[];
  constraints?: CodeConstraint[];
}

export type Exercise =
  | MultipleChoiceExercise
  | TrueFalseExercise
  | FillBlanksExercise
  | OrderStepsExercise
  | PredictOutputExercise
  | CodeExercise;

// ---------------------------------------------------------------------------
// Estrutura de trilhas

export interface Module {
  id: string;
  trackId: string;
  title: string;
  description: string;
  lessonIds: string[];
  assessmentId?: string;
  status: ContentStatus;
  /** Para módulos planejados: tópicos previstos. */
  plannedTopics?: string[];
}

export interface Track {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  completionCriteria: string[];
  status: ContentStatus;
  modules: Module[];
  projectIds: string[];
  diagnosticId?: string;
  finalAssessmentId?: string;
}

export interface Assessment {
  id: string;
  kind: 'diagnostica' | 'modulo' | 'final';
  title: string;
  description: string;
  trackId: string;
  moduleId?: string;
  /** Percentual mínimo (0–1) para aprovação. */
  passingScore: number;
  exerciseIds: string[];
}

export interface Challenge {
  id: string;
  order: number;
  title: string;
  level: 'iniciante' | 'basico' | 'intermediario' | 'avancado';
  status: ContentStatus;
  trackId: string;
  /** Aulas que ensinam o que o desafio exige. */
  requiredLessonIds: string[];
  context: string;
  objective: string;
  requirements: string[];
  restrictions: string[];
  evaluationCriteria: string[];
  exercise?: CodeExercise;
}

export interface ProjectStep {
  id: string;
  title: string;
  explanation: Block[];
  acceptanceCriteria: string[];
  reflectionPrompt: string;
  exercise: CodeExercise;
}

export interface Project {
  id: string;
  letter: string;
  title: string;
  description: string;
  trackId: string;
  status: ContentStatus;
  topics: string[];
  requiredLessonIds: string[];
  steps: ProjectStep[];
  /** Etapas planejadas para projetos ainda não produzidos. */
  plannedStages?: { title: string; description: string }[];
}

export interface GlossaryTerm {
  term: string;
  english?: string;
  definition: string;
  example?: string;
  trackId?: string;
}
