import { ArrowRight, Clock, Flame, FolderKanban, History, Lightbulb, Swords, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { challenges, getLesson, getProject, tracks } from '../content';
import { formatRelative } from '../domain/dates';
import { computeXp, levelInfo } from '../domain/gamification';
import { missingLessons, trackProgress } from '../domain/mastery';
import { nextActivity, recommendations } from '../domain/recommendations';
import { computeStats, recentHistory, studyStreak, weeklyProgress } from '../domain/stats';
import { ButtonLink } from '../components/ui/Button';
import { Badge, Card, EmptyState, ProgressBar, SectionTitle, Stat } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';

export function DashboardPage() {
  const { state } = useProgress();
  const now = new Date();
  const stats = computeStats(state);
  const next = nextActivity(state);
  const recs = recommendations(state, now, 4);
  const week = weeklyProgress(state, now);
  const streak = studyStreak(state, now);
  const level = levelInfo(computeXp(state));
  const history = recentHistory(state, 6);
  const fresh = state.attempts.length === 0 && Object.keys(state.lessons).length === 0;

  const currentLesson = Object.values(state.lessons)
    .filter((l) => !l.completedAt)
    .sort((a, b) => b.lastVisitedAt.localeCompare(a.lastVisitedAt))[0];

  const availableChallenges = challenges.filter(
    (c) => c.status === 'completo' && !state.challenges[c.id]?.completedAt && missingLessons(state, c.requiredLessonIds).length === 0,
  );
  const projectsInProgress = Object.values(state.projects).filter((p) => !p.completedAt);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm text-muted">{state.profile.name ? `Olá, ${state.profile.name}` : 'Olá!'}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{fresh ? 'Bem-vindo ao DevPath' : 'Continue de onde parou'}</h1>
      </header>

      <section aria-labelledby="continuar" className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col justify-between gap-6 border-accent-strong/25 lg:col-span-2">
          <div>
            <div id="continuar" className="mb-2 text-xs font-semibold tracking-wide text-accent-strong uppercase">
              {fresh ? 'Comece por aqui' : 'Próxima atividade'}
            </div>
            <h2 className="text-xl font-semibold">{next.title}</h2>
            <p className="mt-1 text-muted">{next.description}</p>
            {currentLesson && next.href !== `/aulas/${currentLesson.lessonId}` && (
              <p className="mt-3 text-sm text-muted">
                Aula aberta recentemente:{' '}
                <Link className="text-accent-strong hover:underline" to={`/aulas/${currentLesson.lessonId}`}>
                  {getLesson(currentLesson.lessonId)?.title}
                </Link>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink to={next.href}>
              {fresh ? 'Começar' : 'Continuar'} <ArrowRight size={16} aria-hidden />
            </ButtonLink>
            {next.kind === 'diagnostico' && (
              <ButtonLink to="/aulas/logica-01" variant="secondary">
                Ir direto para a aula 1
              </ButtonLink>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle aside={<Target size={16} className="text-faint" aria-hidden />}>Metas da semana</SectionTitle>
          <div className="space-y-4 text-sm">
            <Goal label="Exercícios resolvidos" value={week.exercisesSolved} goal={week.goal.exercises} />
            <Goal label="Aulas concluídas" value={week.lessonsCompleted} goal={week.goal.lessons} />
            <p className="text-xs text-faint">
              Dias com estudo nesta semana: {week.studyDays}.{' '}
              <Link to="/configuracoes" className="underline-offset-2 hover:underline">
                Ajustar metas
              </Link>
            </p>
          </div>
        </Card>
      </section>

      <section aria-label="Resumo" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Exercícios das aulas" value={`${stats.lessonExercisesSolved}/${stats.lessonExercisesTotal}`} hint="resolvidos" />
        <Stat
          label="Taxa de acertos"
          value={stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`}
          hint={stats.accuracy === null ? 'sem tentativas ainda' : `${stats.correctAttempts} de ${stats.totalAttempts} tentativas`}
        />
        <Stat
          label="Sequência"
          value={
            <span className="flex items-center gap-1.5">
              <Flame size={20} className={streak > 0 ? 'text-warning' : 'text-faint'} aria-hidden /> {streak}
            </span>
          }
          hint={streak > 0 ? 'dias seguidos com atividade' : 'resolva um exercício para começar'}
        />
        <Stat label={`Nível ${level.level}`} value={`${level.xp} XP`} hint={`${level.name} · faltam ${level.nextLevelXp - level.xp} XP`} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="trilhas-titulo">
          <SectionTitle id="trilhas-titulo" aside={<Link to="/trilhas" className="text-sm text-accent-strong hover:underline">Ver todas</Link>}>
            Progresso por trilha
          </SectionTitle>
          <Card className="space-y-4">
            {tracks.slice(0, 5).map((track) => {
              const p = trackProgress(state, track);
              return (
                <div key={track.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <Link to={`/trilhas/${track.id}`} className="truncate hover:text-accent-strong">
                      {track.order}. {track.title}
                    </Link>
                    {track.status === 'completo' ? (
                      <span className="shrink-0 text-xs text-muted tabular-nums">{Math.round(p.percent * 100)}%</span>
                    ) : (
                      <Badge>Em planejamento</Badge>
                    )}
                  </div>
                  {track.status === 'completo' && <ProgressBar value={p.percent} label={`Progresso em ${track.title}`} />}
                </div>
              );
            })}
          </Card>
        </section>

        <section aria-labelledby="revisar-titulo">
          <SectionTitle id="revisar-titulo" aside={<Link to="/revisao" className="text-sm text-accent-strong hover:underline">Revisão</Link>}>
            Conceitos para revisar
          </SectionTitle>
          {recs.length === 0 ? (
            <EmptyState icon={<Lightbulb size={22} />} title="Nenhuma revisão pendente">
              As recomendações aparecem com base nos seus erros, nas avaliações e no tempo desde que você estudou cada assunto.
            </EmptyState>
          ) : (
            <ul className="space-y-2">
              {recs.map((r) => (
                <li key={r.id}>
                  <Link to={r.href} className="block rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
                    <div className="font-medium">{r.title}</div>
                    <p className="mt-0.5 text-sm text-muted">{r.reason}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="desafios-titulo">
          <SectionTitle id="desafios-titulo" aside={<Swords size={16} className="text-faint" aria-hidden />}>
            Desafios disponíveis
          </SectionTitle>
          {availableChallenges.length === 0 ? (
            <EmptyState title="Nenhum desafio liberado ainda">Os desafios são liberados quando você conclui as aulas que ensinam o que eles exigem.</EmptyState>
          ) : (
            <ul className="space-y-2">
              {availableChallenges.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link to={`/desafios/${c.id}`} className="flex items-center justify-between rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
                    <span className="font-medium">{c.title}</span>
                    <Badge tone="accent">{c.level}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="projetos-titulo">
          <SectionTitle id="projetos-titulo" aside={<FolderKanban size={16} className="text-faint" aria-hidden />}>
            Projetos em andamento
          </SectionTitle>
          {projectsInProgress.length === 0 ? (
            <EmptyState title="Nenhum projeto em andamento">
              O Projeto A é liberado depois da aula de funções. <Link to="/projetos" className="text-accent-strong hover:underline">Ver projetos</Link>
            </EmptyState>
          ) : (
            <ul className="space-y-2">
              {projectsInProgress.map((p) => {
                const project = getProject(p.projectId);
                if (!project) return null;
                return (
                  <li key={p.projectId}>
                    <Link to={`/projetos/${p.projectId}`} className="block rounded-xl border border-line bg-surface p-4 hover:border-line-strong">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-medium">
                          Projeto {project.letter} — {project.title}
                        </span>
                        <span className="text-muted tabular-nums">
                          {p.completedStepIds.length}/{project.steps.length}
                        </span>
                      </div>
                      <ProgressBar value={p.completedStepIds.length / project.steps.length} label={`Etapas do projeto ${project.title}`} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="historico-titulo">
        <SectionTitle id="historico-titulo" aside={<History size={16} className="text-faint" aria-hidden />}>
          Histórico recente
        </SectionTitle>
        {history.length === 0 ? (
          <EmptyState icon={<Clock size={22} />} title="Nada por aqui ainda">
            Cada exercício resolvido, aula concluída e avaliação feita aparece aqui.
          </EmptyState>
        ) : (
          <Card className="divide-y divide-line p-0">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate">{h.title}</div>
                  <div className={h.positive ? 'text-xs text-success' : 'text-xs text-muted'}>{h.detail}</div>
                </div>
                <span className="shrink-0 text-xs text-faint">{formatRelative(h.at, now)}</span>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

function Goal({ label, value, goal }: { label: string; value: number; goal: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between">
        <span className="text-muted">{label}</span>
        <span className="tabular-nums">
          {value}/{goal}
        </span>
      </div>
      <ProgressBar value={value / goal} label={label} />
    </div>
  );
}
