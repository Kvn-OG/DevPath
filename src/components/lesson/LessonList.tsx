import { CheckCircle2, Circle, CircleDot, Lock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLesson } from '../../content';
import { LESSON_STATUS_LABEL, lessonStatus, type LessonStatus } from '../../domain/mastery';
import { useProgress } from '../../state/ProgressProvider';
import { cn } from '../../utils/cn';

export function LessonStatusIcon({ status, size = 16 }: { status: LessonStatus; size?: number }) {
  const label = LESSON_STATUS_LABEL[status];
  switch (status) {
    case 'dominada':
      return <Star size={size} className="shrink-0 fill-accent-strong text-accent-strong" aria-label={label} />;
    case 'concluida':
      return <CheckCircle2 size={size} className="shrink-0 text-success" aria-label={label} />;
    case 'em-andamento':
      return <CircleDot size={size} className="shrink-0 text-accent-strong" aria-label={label} />;
    case 'bloqueada':
      return <Lock size={size} className="shrink-0 text-faint" aria-label={label} />;
    default:
      return <Circle size={size} className="shrink-0 text-faint" aria-label={label} />;
  }
}

export function LessonList({ lessonIds, compact = false, currentId }: { lessonIds: string[]; compact?: boolean; currentId?: string }) {
  const { state } = useProgress();
  return (
    <ol className={cn(compact ? 'space-y-0.5' : 'divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface')}>
      {lessonIds.map((id) => {
        const lesson = getLesson(id);
        if (!lesson) return null;
        const status = lessonStatus(state, lesson);
        const number = Number(id.split('-').pop());
        const current = id === currentId;
        return (
          <li key={id}>
            <Link
              to={`/aulas/${id}`}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 transition-colors',
                compact ? 'rounded-lg px-2.5 py-2 text-sm' : 'px-5 py-3.5 hover:bg-surface-2',
                compact && (current ? 'bg-accent-soft text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg'),
              )}
            >
              <LessonStatusIcon status={status} />
              <span className="min-w-0 flex-1">
                <span className={cn('block', compact ? 'leading-snug' : 'truncate font-medium')}>
                  {number}. {lesson.title}
                </span>
                {!compact && (
                  <span className="text-xs text-muted">
                    {LESSON_STATUS_LABEL[status]} · {lesson.durationMin} min
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
