import { Database, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { runCode } from '../../sandbox/runCode';
import { preloadSql, runSql } from '../../sandbox/runSql';
import type { RunResult } from '../../sandbox/evaluator';
import type { CodeExercise, SqlExercise } from '../../types/content';
import { CodeBlock } from '../code/CodeBlock';
import { CodeEditor } from '../code/CodeEditor';
import { Button } from '../ui/Button';
import { RunResultView } from './RunResultView';

interface CodeExercisePanelProps {
  exercise: CodeExercise | SqlExercise;
  initialCode: string;
  starterCode: string;
  locked: boolean;
  onCodeChange(code: string): void;
  /** Chamado após "Verificar", com o resultado real dos testes. */
  onVerified(result: RunResult, code: string): void;
}

export function CodeExercisePanel({ exercise, initialCode, starterCode, locked, onCodeChange, onVerified }: CodeExercisePanelProps) {
  const isSql = exercise.type === 'sql';
  const [code, setCode] = useState(initialCode);
  const [running, setRunning] = useState<'executar' | 'verificar' | null>(null);
  const [result, setResult] = useState<{ mode: 'executar' | 'verificar'; data: RunResult } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const saveTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);
  useEffect(() => {
    if (isSql) preloadSql();
  }, [isSql]);

  const change = (value: string) => {
    setCode(value);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => onCodeChange(value), 800);
  };

  const run = (mode: 'executar' | 'verificar'): Promise<RunResult> => {
    if (exercise.type === 'sql') {
      return mode === 'verificar' ? runSql(exercise.setup, code, exercise.tests, exercise.constraints) : runSql(exercise.setup, code);
    }
    return mode === 'verificar' ? runCode(code, exercise.tests, exercise.constraints) : runCode(code, []);
  };

  const execute = async (mode: 'executar' | 'verificar') => {
    setRunning(mode);
    const data = await run(mode);
    setRunning(null);
    setResult({ mode, data });
    if (mode === 'verificar') onVerified(data, code);
  };

  return (
    <div className="space-y-4">
      {exercise.type === 'sql' && exercise.setup.trim() !== '' && (
        <details className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <Database size={14} className="text-accent-strong" aria-hidden /> Tabelas e dados do exercício
          </summary>
          <p className="mt-2 mb-3 text-muted">Este SQL é executado antes do seu código, em um banco novo a cada execução.</p>
          <CodeBlock code={exercise.setup} language="sql" />
        </details>
      )}
      <CodeEditor value={code} onChange={change} label={`Editor de código: ${exercise.title}`} language={isSql ? 'sql' : 'javascript'} />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => execute('verificar')} disabled={running !== null || locked}>
          <ShieldCheck size={16} aria-hidden /> {running === 'verificar' ? 'Verificando…' : 'Verificar com testes'}
        </Button>
        <Button variant="secondary" onClick={() => execute('executar')} disabled={running !== null}>
          <Play size={16} aria-hidden /> {running === 'executar' ? 'Executando…' : 'Executar'}
        </Button>
        {confirmReset ? (
          <span className="flex items-center gap-2 text-sm text-muted">
            Descartar seu código e voltar ao inicial?
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                setConfirmReset(false);
                change(starterCode);
                setResult(null);
              }}
            >
              Restaurar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
          </span>
        ) : (
          <Button variant="ghost" onClick={() => setConfirmReset(true)} disabled={running !== null || locked}>
            <RotateCcw size={16} aria-hidden /> Restaurar código inicial
          </Button>
        )}
      </div>
      <p className="text-xs text-faint">
        {isSql
          ? '"Executar" roda o SQL e mostra o resultado. "Verificar" roda os testes automatizados e registra uma tentativa. O SQL roda em um PostgreSQL de verdade, isolado no seu navegador (a primeira execução leva alguns segundos para carregar o banco).'
          : '"Executar" roda o programa e mostra o console. "Verificar" roda os testes automatizados e registra uma tentativa. O código roda isolado no seu navegador, com limite de tempo.'}
      </p>
      {result && <RunResultView result={result.data} mode={result.mode} language={isSql ? 'sql' : 'javascript'} />}
    </div>
  );
}
