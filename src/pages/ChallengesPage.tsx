import { Link } from 'react-router-dom';
import { challenges, getTrack } from '../content';
import { missingLessons } from '../domain/mastery';
import { Badge, PageHeader, SectionTitle } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';
import type { Challenge } from '../types/content';
import type { ProgressState } from '../types/progress';

const LEVELS: { id: Challenge['level']; label: string }[] = [
  { id: 'iniciante', label: 'Iniciante' },
  { id: 'basico', label: 'Básico' },
  { id: 'intermediario', label: 'Intermediário' },
  { id: 'avancado', label: 'Avançado' },
];

export function challengeState(state: ProgressState, c: Challenge) {
  if (c.status !== 'completo') return { label: 'Planejado', tone: 'neutral' as const };
  const p = state.challenges[c.id];
  if (p?.completedAt) return { label: 'Concluído', tone: 'success' as const };
  if (p) return { label: 'Em andamento', tone: 'accent' as const };
  if (missingLessons(state, c.requiredLessonIds).length > 0) return { label: 'Requer aulas', tone: 'warning' as const };
  return { label: 'Disponível', tone: 'info' as const };
}

export default function ChallengesPage() {
  const { state } = useProgress();
  return (
    <div className="space-y-10">
      <PageHeader
        title="Desafios práticos"
        description="Problemas maiores, com requisitos, restrições e testes ocultos. Cada desafio exige apenas conceitos já ensinados nas aulas indicadas."
      />
      {LEVELS.map((level) => {
        const items = challenges.filter((c) => c.level === level.id).sort((a, b) => a.order - b.order);
        if (items.length === 0) return null;
        return (
          <section key={level.id} aria-labelledby={`nivel-${level.id}`}>
            <SectionTitle id={`nivel-${level.id}`}>{level.label}</SectionTitle>
            <ul className="grid gap-3 md:grid-cols-2">
              {items.map((c) => {
                const s = challengeState(state, c);
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold text-faint tabular-nums">DESAFIO {c.order}</span>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </div>
                    <h3 className="mt-1 font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted">{c.objective}</p>
                    {c.status !== 'completo' && <p className="mt-2 text-xs text-faint">Será liberado com a trilha {getTrack(c.trackId)?.shortTitle}.</p>}
                  </>
                );
                return (
                  <li key={c.id}>
                    {c.status === 'completo' ? (
                      <Link to={`/desafios/${c.id}`} className="block h-full dp-spot rounded-2xl border border-line bg-surface p-5 hover:border-line-strong">
                        {content}
                      </Link>
                    ) : (
                      <div className="h-full rounded-xl border border-dashed border-line p-5 opacity-80">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
