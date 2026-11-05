import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { lessonExercises, lessonOfExercise, tracks } from '../content';
import { DIFFICULTY_LABEL, EXERCISE_TYPE_LABEL } from '../components/exercise/labels';
import { Badge, EmptyState, PageHeader } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';
import type { Difficulty } from '../types/content';

type StatusFilter = 'todos' | 'pendentes' | 'resolvidos' | 'com-erros';

export default function ExercisesPage() {
  const { state } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty | 'todas'>('todas');
  const [type, setType] = useState('todos');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [trackId, setTrackId] = useState('todas');
  const readyTracks = tracks.filter((t) => t.status === 'completo');

  const types = useMemo(() => [...new Set(lessonExercises.map(EXERCISE_TYPE_LABEL))].sort(), []);

  const filtered = lessonExercises.filter((e) => {
    const p = state.exercises[e.id];
    if (trackId !== 'todas' && lessonOfExercise(e.id)?.trackId !== trackId) return false;
    if (difficulty !== 'todas' && e.difficulty !== difficulty) return false;
    if (type !== 'todos' && EXERCISE_TYPE_LABEL(e) !== type) return false;
    if (status === 'pendentes' && p?.solved) return false;
    if (status === 'resolvidos' && !p?.solved) return false;
    if (status === 'com-erros' && !(p && p.failedAttempts > 0)) return false;
    return true;
  });

  const select = 'h-9 rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-accent-strong/60';

  return (
    <div>
      <PageHeader
        title="Ambiente de exercícios"
        description="Todos os exercícios das aulas, para praticar quando quiser. Resolver aqui conta para o progresso da aula correspondente."
      />

      <div className="mb-6 flex flex-wrap gap-3" role="group" aria-label="Filtros">
        {readyTracks.length > 1 && (
          <label className="flex items-center gap-2 text-sm text-muted">
            Trilha
            <select className={select} value={trackId} onChange={(e) => setTrackId(e.target.value)}>
              <option value="todas">Todas</option>
              {readyTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.shortTitle}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center gap-2 text-sm text-muted">
          Dificuldade
          <select className={select} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty | 'todas')}>
            <option value="todas">Todas</option>
            {(['iniciante', 'basico', 'intermediario', 'avancado'] as const).map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABEL[d]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          Tipo
          <select className={select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="todos">Todos</option>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          Situação
          <select className={select} value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="todos">Todos</option>
            <option value="pendentes">Pendentes</option>
            <option value="resolvidos">Resolvidos</option>
            <option value="com-erros">Com tentativas erradas</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhum exercício com esses filtros">Ajuste os filtros acima.</EmptyState>
      ) : (
        <ul className="divide-y divide-line overflow-hidden dp-spot rounded-2xl border border-line bg-surface">
          {filtered.map((e) => {
            const p = state.exercises[e.id];
            const lesson = lessonOfExercise(e.id);
            return (
              <li key={e.id}>
                <Link to={`/exercicios/${e.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2">
                  {p?.solved ? (
                    <CheckCircle2 size={18} className="shrink-0 text-success" aria-label="Resolvido" />
                  ) : p && p.attempts > 0 ? (
                    <XCircle size={18} className="shrink-0 text-danger" aria-label="Tentado, ainda não resolvido" />
                  ) : (
                    <Circle size={18} className="shrink-0 text-faint" aria-label="Não iniciado" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{e.title}</div>
                    <div className="truncate text-xs text-muted">{lesson?.title}</div>
                  </div>
                  <div className="hidden shrink-0 gap-2 sm:flex">
                    <Badge tone="accent">{EXERCISE_TYPE_LABEL(e)}</Badge>
                    <Badge>{DIFFICULTY_LABEL[e.difficulty]}</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
