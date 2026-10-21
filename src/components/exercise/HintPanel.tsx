import { Lightbulb, Lock, ScrollText } from 'lucide-react';
import { useState } from 'react';
import type { Exercise } from '../../types/content';
import { CodeBlock } from '../code/CodeBlock';
import { Button } from '../ui/Button';
import { renderInline } from '../ui/RichText';

const HINT_LABELS = ['Dica 1 — conceito', 'Dica 2 — raciocínio', 'Dica 3 — estrutura'];

interface HintPanelProps {
  exercise: Exercise;
  revealed: number;
  onReveal(level: number): void;
  solutionVisible: boolean;
  solutionUnlocked: boolean;
  solutionLockReason: string;
  onShowSolution(): void;
}

/** Dicas progressivas (uma de cada vez) e solução comentada, liberada só depois de tentar. */
export function HintPanel({ exercise, revealed, onReveal, solutionVisible, solutionUnlocked, solutionLockReason, onShowSolution }: HintPanelProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <section aria-label="Dicas e solução" className="space-y-3">
      {exercise.hints.slice(0, revealed).map((hint, i) => (
        <div key={i} className="animate-fade-in rounded-lg border border-info/25 bg-info-soft px-4 py-3 text-sm">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide text-info uppercase">
            <Lightbulb size={14} aria-hidden /> {HINT_LABELS[i]}
          </div>
          <p className="text-fg">{renderInline(hint)}</p>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        {revealed < 3 && (
          <Button variant="secondary" size="sm" onClick={() => onReveal(revealed + 1)}>
            <Lightbulb size={14} aria-hidden /> Mostrar {HINT_LABELS[revealed].split(' — ')[0].toLowerCase()}
          </Button>
        )}
        {!solutionVisible &&
          (solutionUnlocked ? (
            confirming ? (
              <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
                Ver a solução reduz o XP deste exercício. Tentar mais uma vez costuma ensinar mais.
                <Button size="sm" variant="secondary" onClick={() => { setConfirming(false); onShowSolution(); }}>
                  Ver mesmo assim
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Voltar
                </Button>
              </span>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                <ScrollText size={14} aria-hidden /> Ver solução comentada
              </Button>
            )
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-faint">
              <Lock size={12} aria-hidden /> {solutionLockReason}
            </span>
          ))}
      </div>

      {solutionVisible && <SolutionView exercise={exercise} />}
    </section>
  );
}

export function SolutionView({ exercise }: { exercise: Exercise }) {
  return (
    <div className="animate-fade-in space-y-3 rounded-lg border border-accent-strong/25 bg-accent-soft p-4">
      <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-accent-strong uppercase">
        <ScrollText size={14} aria-hidden /> Uma solução possível
      </div>
      {exercise.solution.code && <CodeBlock code={exercise.solution.code} language={exercise.type === 'sql' ? 'sql' : exercise.language} />}
      <p className="text-sm text-fg">{renderInline(exercise.solution.explanation)}</p>
    </div>
  );
}
