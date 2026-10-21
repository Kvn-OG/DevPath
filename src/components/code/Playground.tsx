import { FlaskConical, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { runCode } from '../../sandbox/runCode';
import { preloadSql, runSql } from '../../sandbox/runSql';
import type { RunResult } from '../../sandbox/evaluator';
import { RunResultView } from '../exercise/RunResultView';
import { Button } from '../ui/Button';
import { CodeEditor } from './CodeEditor';

interface PlaygroundProps {
  initialCode: string;
  language?: 'javascript' | 'sql';
  /** SQL: tabelas e dados recriados antes de cada execução. */
  setup?: string;
}

/** Laboratório livre: o estudante altera o exemplo e vê o resultado real. Nada é registrado como tentativa. */
export function Playground({ initialCode, language = 'javascript', setup = '' }: PlaygroundProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  if (!open) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          if (language === 'sql') preloadSql();
          setOpen(true);
        }}
      >
        <FlaskConical size={14} aria-hidden /> Experimentar este código
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">
        {language === 'sql'
          ? 'Mude a consulta, quebre de propósito e veja o que o PostgreSQL responde. A cada execução o banco volta aos dados do exemplo. Experimentos não contam como tentativas.'
          : 'Mude valores, quebre o código de propósito e veja o que acontece. Experimentos não contam como tentativas.'}
      </p>
      <CodeEditor value={code} onChange={setCode} label="Laboratório de código" minHeight="160px" language={language} />
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={running}
          onClick={async () => {
            setRunning(true);
            setResult(language === 'sql' ? await runSql(setup, code) : await runCode(code, []));
            setRunning(false);
          }}
        >
          <Play size={14} aria-hidden /> {running ? 'Executando…' : 'Executar'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setCode(initialCode);
            setResult(null);
          }}
        >
          <RotateCcw size={14} aria-hidden /> Restaurar exemplo
        </Button>
      </div>
      {result && <RunResultView result={result} mode="executar" language={language} />}
    </div>
  );
}
