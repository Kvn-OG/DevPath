import { Award, Lock } from 'lucide-react';
import { tracks } from '../content';
import { computeAchievements, computeXp, levelInfo } from '../domain/gamification';
import { trackProgress } from '../domain/mastery';
import { activityByDay, computeStats, recentHistory, studyStreak, weeklyProgress } from '../domain/stats';
import { formatRelative } from '../domain/dates';
import { Card, EmptyState, PageHeader, ProgressBar, SectionTitle, Stat } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';
import { cn } from '../utils/cn';

export default function ProgressPage() {
  const { state } = useProgress();
  const now = new Date();
  const stats = computeStats(state);
  const level = levelInfo(computeXp(state));
  const achievements = computeAchievements(state, now);
  const activity = activityByDay(state, now, 28);
  const maxActivity = Math.max(1, ...activity.map((d) => d.activities));
  const week = weeklyProgress(state, now);
  const history = recentHistory(state, 20);
  const ready = tracks.filter((t) => t.status === 'completo').map((t) => trackProgress(state, t));
  const lp = {
    completedLessons: ready.reduce((sum, p) => sum + p.completedLessons, 0),
    totalLessons: ready.reduce((sum, p) => sum + p.totalLessons, 0),
  };

  return (
    <div className="space-y-10">
      <PageHeader title="Progresso e estatísticas" description="Tudo aqui é calculado a partir das suas tentativas, aulas, avaliações e projetos registrados." />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Indicadores">
        <Stat label="Aulas concluídas" value={`${lp.completedLessons}/${lp.totalLessons}`} />
        <Stat label="Exercícios resolvidos" value={stats.exercisesSolved} hint="inclui avaliações, desafios e projetos" />
        <Stat
          label="Taxa de acertos"
          value={stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`}
          hint={stats.accuracy === null ? 'sem tentativas' : `${stats.totalAttempts} tentativas`}
        />
        <Stat label="Desafios" value={`${stats.challengesCompleted}/${stats.challengesAvailable}`} hint="concluídos / disponíveis" />
        <Stat label="Dicas usadas" value={stats.hintsUsedTotal} />
        <Stat label="Soluções consultadas" value={stats.solutionsViewed} />
        <Stat label="Dias com estudo" value={stats.studyDaysCount} hint={`sequência atual: ${studyStreak(state, now)}`} />
        <Stat label="Esta semana" value={`${week.exercisesSolved} ex.`} hint={`${week.lessonsCompleted} aula(s) concluída(s)`} />
      </section>

      <section aria-labelledby="nivel">
        <SectionTitle id="nivel">Nível e XP</SectionTitle>
        <Card className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">
              Nível {level.level} — {level.name}
            </span>
            <span className="text-sm text-muted tabular-nums">
              {level.xp} / {level.nextLevelXp} XP
            </span>
          </div>
          <ProgressBar value={level.progress} label="Progresso até o próximo nível" />
          <p className="text-xs text-faint">
            XP vem de exercícios resolvidos (menos quando há dicas ou solução consultada), aulas concluídas, desafios, etapas de projeto, avaliações
            aprovadas e revisões. Nada é perdido por ficar dias sem estudar.
          </p>
        </Card>
      </section>

      <section aria-labelledby="atividade">
        <SectionTitle id="atividade">Atividade nas últimas 4 semanas</SectionTitle>
        <Card>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="img" aria-label={`Atividades por dia nos últimos 28 dias. Total: ${activity.reduce((s, d) => s + d.activities, 0)}.`}>
            {activity.map((d) => (
              <div
                key={d.date}
                title={`${new Date(`${d.date}T12:00:00`).toLocaleDateString('pt-BR')}: ${d.activities} atividade(s)`}
                className={cn('aspect-square rounded-md border border-line', d.activities === 0 && 'bg-surface-2')}
                style={d.activities > 0 ? { backgroundColor: `color-mix(in srgb, var(--dp-accent-strong) ${20 + (d.activities / maxActivity) * 70}%, transparent)` } : undefined}
              />
            ))}
          </div>
          <p className="mt-3 text-xs text-faint">Cada quadrado é um dia (mais antigo à esquerda, hoje no fim). Mais intenso = mais tentativas e revisões.</p>
        </Card>
      </section>

      <section aria-labelledby="conquistas">
        <SectionTitle id="conquistas" aside={<span className="text-sm text-muted">{achievements.filter((a) => a.unlocked).length}/{achievements.length}</span>}>
          Conquistas
        </SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <li key={a.id} className={cn('flex items-start gap-3 rounded-xl border p-4', a.unlocked ? 'border-accent-strong/30 bg-accent-soft' : 'border-line bg-surface')}>
              {a.unlocked ? <Award size={20} className="mt-0.5 shrink-0 text-accent-strong" aria-hidden /> : <Lock size={18} className="mt-0.5 shrink-0 text-faint" aria-hidden />}
              <div>
                <div className={cn('text-sm font-medium', !a.unlocked && 'text-muted')}>{a.title}</div>
                <div className="text-xs text-muted">{a.description}</div>
                <span className="sr-only">{a.unlocked ? 'Desbloqueada' : 'Bloqueada'}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="historico">
        <SectionTitle id="historico">Histórico de sessões</SectionTitle>
        {history.length === 0 ? (
          <EmptyState title="Sem registros ainda" />
        ) : (
          <Card className="divide-y divide-line p-0">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-5 py-2.5 text-sm">
                <span className="min-w-0 truncate">
                  {h.title} <span className={h.positive ? 'text-success' : 'text-muted'}>· {h.detail}</span>
                </span>
                <span className="shrink-0 text-xs text-faint">{formatRelative(h.at, now)}</span>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
