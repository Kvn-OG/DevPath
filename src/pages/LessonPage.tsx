import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Lock, PartyPopper } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getExercise, getLesson, getModule, getTrack, lessonsOfTrack } from '../content';
import { LESSON_STATUS_LABEL, lessonStatus, missingPrerequisites } from '../domain/mastery';
import { CodeBlock } from '../components/code/CodeBlock';
import { Playground } from '../components/code/Playground';
import { ExerciseRunner } from '../components/exercise/ExerciseRunner';
import { Blocks } from '../components/lesson/Blocks';
import { LessonList, LessonStatusIcon } from '../components/lesson/LessonList';
import { Button, ButtonLink } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/primitives';
import { renderInline } from '../components/ui/RichText';
import { useProgress } from '../state/ProgressProvider';
import type { Lesson } from '../types/content';
import { cn } from '../utils/cn';
import NotFoundPage from './NotFoundPage';

const SECTIONS = [
  ['objetivos', 'Objetivos'],
  ['conceito', 'Conceito'],
  ['exemplo', 'Exemplo'],
  ['erros', 'Erros comuns'],
  ['guiado', 'Exercício guiado'],
  ['independente', 'Exercício independente'],
  ['revisao', 'Revisão'],
  ['resumo', 'Resumo'],
] as const;

export default function LessonPage() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  if (!lesson) return <NotFoundPage />;
  return <LessonView key={lesson.id} lesson={lesson} />;
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const { state, actions } = useProgress();
  const track = getTrack(lesson.trackId)!;
  const module = getModule(lesson.moduleId)!;
  const ordered = lessonsOfTrack(track);
  const index = ordered.findIndex((l) => l.id === lesson.id);
  const prev = ordered[index - 1];
  const next = ordered[index + 1];

  const missing = missingPrerequisites(state, lesson);
  const alreadyStarted = !!state.lessons[lesson.id];
  const [consult, setConsult] = useState(false);
  const locked = missing.length > 0 && !alreadyStarted && !consult;

  useEffect(() => {
    if (!locked) actions.visitLesson(lesson.id);
  }, [locked, lesson.id, actions]);

  const status = lessonStatus(state, lesson);
  const exerciseIds = [lesson.guidedExerciseId, lesson.independentExerciseId];
  const solvedCount = exerciseIds.filter((id) => state.exercises[id]?.solved).length;
  const completed = !!state.lessons[lesson.id]?.completedAt;

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside aria-label="Índice de aulas" className="lg:sticky lg:top-10 lg:max-h-[calc(100dvh-5rem)] lg:self-start lg:overflow-y-auto">
        <details className="group rounded-xl border border-line bg-surface p-3 lg:border-0 lg:bg-transparent lg:p-0" open>
          <summary className="cursor-pointer text-sm font-medium lg:hidden">Índice das aulas</summary>
          <div className="mt-3 space-y-5 lg:mt-0">
            {track.modules.map((m, i) => (
              <div key={m.id}>
                <div className="mb-1 px-2.5 text-xs font-semibold tracking-wide text-faint uppercase">
                  Módulo {i + 1}
                </div>
                <LessonList lessonIds={m.lessonIds} compact currentId={lesson.id} />
              </div>
            ))}
          </div>
        </details>
      </aside>

      <article className="min-w-0 space-y-12">
        <header className="space-y-4">
          <div className="text-sm text-muted">
            <Link to={`/trilhas/${track.id}`} className="hover:text-fg">
              {track.shortTitle}
            </Link>{' '}
            /{' '}
            <Link to={`/trilhas/${track.id}/modulos/${module.id}`} className="hover:text-fg">
              {module.title}
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {index + 1}. {lesson.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone={completed ? 'success' : status === 'em-andamento' ? 'accent' : 'neutral'}>
              <LessonStatusIcon status={status} size={12} /> {LESSON_STATUS_LABEL[status]}
            </Badge>
            <span className="text-muted">{lesson.durationMin} min</span>
            <span className="text-muted">· {solvedCount}/2 exercícios resolvidos</span>
          </div>
          <nav aria-label="Seções da aula" className={cn('flex flex-wrap gap-x-4 gap-y-1 text-sm', locked && 'hidden')}>
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="text-muted hover:text-accent-strong">
                {label}
              </a>
            ))}
          </nav>
        </header>

        {locked ? (
          <Card className="space-y-4 border-warning/30">
            <div className="flex items-center gap-2 font-semibold">
              <Lock size={18} className="text-warning" aria-hidden /> Esta aula tem pré-requisitos pendentes
            </div>
            <p className="text-sm text-muted">Ela usa conceitos das aulas abaixo. Recomendamos concluí-las primeiro:</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {missing.map((m) => (
                <li key={m.id}>
                  <Link to={`/aulas/${m.id}`} className="text-accent-strong hover:underline">
                    {m.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Button variant="secondary" onClick={() => setConsult(true)}>
              Abrir mesmo assim
            </Button>
          </Card>
        ) : (
          <>
            <LessonContent lesson={lesson} />

            <Section id="guiado" title="Exercício guiado" subtitle="Siga as dicas se precisar. O objetivo é praticar o conceito com apoio.">
              <Card>
                <ExerciseRunner exercise={getExercise(lesson.guidedExerciseId)!} source="aula" />
              </Card>
            </Section>

            <Section id="independente" title="Exercício independente" subtitle="Agora sem roteiro: aplique o conceito sozinho. As dicas continuam disponíveis, mas tente antes.">
              <Card>
                <ExerciseRunner exercise={getExercise(lesson.independentExerciseId)!} source="aula" />
              </Card>
            </Section>

            <Section id="revisao" title="Perguntas de revisão" subtitle="Responda mentalmente (ou em voz alta) antes de abrir a resposta.">
              <div className="space-y-2">
                {lesson.reviewQuestions.map((q) => (
                  <details key={q.question} className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
                    <summary className="cursor-pointer font-medium">{renderInline(q.question)}</summary>
                    <p className="mt-2 text-muted">{renderInline(q.answer)}</p>
                  </details>
                ))}
              </div>
            </Section>

            <Section id="resumo" title="Resumo">
              <ul className="list-disc space-y-1.5 pl-5">
                {lesson.summary.map((s) => (
                  <li key={s}>{renderInline(s)}</li>
                ))}
              </ul>
            </Section>

            <section aria-labelledby="criterios" className="space-y-3">
              <h2 id="criterios" className="text-lg font-semibold">
                Critérios de conclusão
              </h2>
              <ul className="space-y-2 text-sm">
                {lesson.completionCriteria.map((c, i) => {
                  const done = !!state.exercises[exerciseIds[i]]?.solved;
                  return (
                    <li key={c} className="flex items-start gap-2">
                      {done ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" aria-label="Cumprido" /> : <Circle size={16} className="mt-0.5 shrink-0 text-faint" aria-label="Pendente" />}
                      <span className={cn(done && 'text-muted')}>{c}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-faint">A aula é concluída quando os dois exercícios são resolvidos. Abrir a página não conta como conclusão.</p>
            </section>

            {completed && (
              <Card className="animate-fade-in flex flex-col gap-4 border-success/30 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <PartyPopper size={22} className="mt-0.5 shrink-0 text-success" aria-hidden />
                  <div>
                    <div className="font-semibold">Aula concluída</div>
                    <p className="text-sm text-muted">
                      Os conceitos desta aula entraram na sua revisão espaçada: o DevPath vai sugerir revisá-los nos próximos dias.
                    </p>
                  </div>
                </div>
                {next && (
                  <ButtonLink to={`/aulas/${next.id}`} className="shrink-0">
                    Próxima aula <ArrowRight size={16} aria-hidden />
                  </ButtonLink>
                )}
              </Card>
            )}
          </>
        )}

        <nav aria-label="Navegação entre aulas" className="flex justify-between gap-4 border-t border-line pt-6 text-sm">
          {prev ? (
            <Link to={`/aulas/${prev.id}`} className="flex items-center gap-2 text-muted hover:text-fg">
              <ArrowLeft size={16} aria-hidden /> <span className="line-clamp-1">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/aulas/${next.id}`} className="flex items-center gap-2 text-right text-muted hover:text-fg">
              <span className="line-clamp-1">{next.title}</span> <ArrowRight size={16} aria-hidden />
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-titulo`} id={id} className="scroll-mt-24 space-y-4">
      <div>
        <h2 id={`${id}-titulo`} className="text-lg font-semibold">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function LessonContent({ lesson }: { lesson: Lesson }) {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  return (
    <>
      <Section id="objetivos" title="Objetivos de aprendizagem">
        <ul className="list-disc space-y-1.5 pl-5">
          {lesson.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
        {lesson.prerequisites.length > 0 && (
          <p className="text-sm text-muted">
            Pré-requisitos:{' '}
            {lesson.prerequisites.map((id, i) => (
              <span key={id}>
                {i > 0 && ', '}
                <Link to={`/aulas/${id}`} className="text-accent-strong hover:underline">
                  {getLesson(id)?.title}
                </Link>
              </span>
            ))}
          </p>
        )}
      </Section>

      <Section id="conceito" title="O conceito">
        <Blocks blocks={lesson.explanation} />
        {lesson.analogy && (
          <aside className="rounded-lg border-l-2 border-accent-strong bg-surface px-4 py-3 text-sm">
            <div className="mb-1 text-xs font-semibold tracking-wide text-accent-strong uppercase">Analogia</div>
            {renderInline(lesson.analogy)}
          </aside>
        )}
      </Section>

      <Section id="exemplo" title="Exemplo de código">
        <CodeBlock code={lesson.example.code} highlight={activeLine ? [activeLine] : []} />
        {lesson.example.lineByLine && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Linha por linha</h3>
            <ol className="space-y-1">
              {lesson.example.lineByLine.map((l) => (
                <li key={l.line}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveLine(l.line)}
                    onMouseLeave={() => setActiveLine(null)}
                    onFocus={() => setActiveLine(l.line)}
                    onBlur={() => setActiveLine(null)}
                    className="flex w-full gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                  >
                    <span className="w-14 shrink-0 font-mono text-xs leading-5 text-accent-strong">linha {l.line}</span>
                    <span className="text-fg/90">{renderInline(l.text)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Resultado esperado</h3>
          <pre className="rounded-lg border border-line bg-bg px-4 py-3 font-mono text-[13px] whitespace-pre-wrap">{lesson.example.output}</pre>
        </div>
        <Playground key={lesson.id} initialCode={lesson.example.code} />
      </Section>

      <Section id="erros" title="Erros comuns">
        <div className="grid gap-3 md:grid-cols-2">
          {lesson.commonErrors.map((e) => (
            <Card key={e.title} className="space-y-2 p-4 text-sm">
              <div className="font-semibold">{e.title}</div>
              {e.wrong && <CodeBlock code={e.wrong} lineNumbers={false} />}
              <p className="text-muted">
                <span className="font-medium text-fg">Por quê: </span>
                {renderInline(e.why)}
              </p>
              <p className="text-muted">
                <span className="font-medium text-success">Como corrigir: </span>
                {renderInline(e.fix)}
              </p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
