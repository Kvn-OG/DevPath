import { CheckCircle2, Lock, Play } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProject } from '../content';
import { missingLessons } from '../domain/mastery';
import { isStepUnlocked, stepStarterCode } from '../domain/projects';
import { ExerciseRunner } from '../components/exercise/ExerciseRunner';
import { Blocks } from '../components/lesson/Blocks';
import { Button } from '../components/ui/Button';
import { Badge, Card, PageHeader, ProgressBar } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';
import type { Project, ProjectStep } from '../types/content';
import { cn } from '../utils/cn';
import NotFoundPage from './NotFoundPage';

export default function ProjectPage() {
  const { projectId = '' } = useParams();
  const { state, actions } = useProgress();
  const project = getProject(projectId);
  if (!project || project.status !== 'completo') return <NotFoundPage />;
  const progress = state.projects[project.id];
  const done = progress?.completedStepIds ?? [];
  const missing = missingLessons(state, project.requiredLessonIds);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <Link to="/projetos" className="hover:text-fg">
            Projetos / Projeto {project.letter}
          </Link>
        }
        title={project.title}
        description={project.description}
        actions={progress?.completedAt ? <Badge tone="success">Concluído</Badge> : undefined}
      />

      {progress ? (
        <Card className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Etapas concluídas</span>
            <span className="tabular-nums">
              {done.length}/{project.steps.length}
            </span>
          </div>
          <ProgressBar value={done.length / project.steps.length} label="Etapas concluídas" />
        </Card>
      ) : (
        <Card className="space-y-3">
          {missing.length > 0 && (
            <p className="text-sm text-warning">
              Recomendado depois de: {missing.map((l) => l.title).join(', ')}.
            </p>
          )}
          <p className="text-sm text-muted">
            Em cada etapa você recebe o código que escreveu na etapa anterior e acrescenta uma nova função. Os testes verificam a etapa atual e,
            às vezes, se as anteriores continuam funcionando.
          </p>
          <Button onClick={() => actions.startProject(project.id)}>
            <Play size={16} aria-hidden /> Iniciar projeto
          </Button>
        </Card>
      )}

      {progress && (
        <ol className="space-y-4">
          {project.steps.map((step, i) => (
            <StepItem key={step.id} project={project} step={step} index={i} />
          ))}
        </ol>
      )}
    </div>
  );
}

function StepItem({ project, step, index }: { project: Project; step: ProjectStep; index: number }) {
  const { state, actions } = useProgress();
  const progress = state.projects[project.id]!;
  const completed = progress.completedStepIds.includes(step.id);
  const unlocked = isStepUnlocked(project, index, state);
  const firstPending = project.steps.findIndex((s) => !progress.completedStepIds.includes(s.id));
  const [open, setOpen] = useState(index === firstPending);
  const [reflection, setReflection] = useState(progress.reflections[step.id] ?? '');

  return (
    <li className={cn('rounded-xl border bg-surface', completed ? 'border-success/25' : 'border-line')}>
      <button
        type="button"
        onClick={() => unlocked && setOpen((v) => !v)}
        aria-expanded={open}
        disabled={!unlocked}
        className="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-not-allowed"
      >
        {completed ? (
          <CheckCircle2 size={18} className="shrink-0 text-success" aria-label="Concluída" />
        ) : unlocked ? (
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-accent-strong text-[10px] text-accent-strong">{index + 1}</span>
        ) : (
          <Lock size={18} className="shrink-0 text-faint" aria-label="Bloqueada" />
        )}
        <span className={cn('flex-1 font-medium', !unlocked && 'text-faint')}>{step.title}</span>
        {!unlocked && <span className="text-xs text-faint">Conclua a etapa anterior</span>}
      </button>

      {open && unlocked && (
        <div className="space-y-6 border-t border-line px-5 py-5">
          <Blocks blocks={step.explanation} />
          <div>
            <h3 className="mb-2 text-sm font-semibold">Critérios de aceitação</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
              {step.acceptanceCriteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <ExerciseRunner
            exercise={step.exercise}
            source="projeto"
            starterCode={stepStarterCode(project, index, state)}
            header={<h3 className="text-sm font-semibold">Implementação</h3>}
          />
          <div>
            <label htmlFor={`reflexao-${step.id}`} className="mb-1.5 block text-sm font-semibold">
              Explique sua decisão
            </label>
            <p className="mb-2 text-sm text-muted">{step.reflectionPrompt}</p>
            <textarea
              id={`reflexao-${step.id}`}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              onBlur={() => actions.saveReflection(project.id, step.id, reflection)}
              rows={3}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent-strong/60"
              placeholder="Escreva com suas palavras. Explicar o raciocínio é uma das melhores formas de consolidar o aprendizado."
            />
            <p className="mt-1 text-xs text-faint">A reflexão é salva ao sair do campo. Ela não é corrigida automaticamente — é um registro para você.</p>
          </div>
        </div>
      )}
    </li>
  );
}
