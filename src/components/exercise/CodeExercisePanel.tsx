import { Play, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { runCode } from '../../sandbox/runCode';
import type { RunResult } from '../../sandbox/evaluator';
import type { CodeExercise } from '../../types/content';
import { CodeEditor } from '../code/CodeEditor';
import { Button } from '../ui/Button';
import { RunResultView } from './RunResultView';

interface CodeExercisePanelProps {
  exercise: CodeExercise;
  initialCode: string;
  starterCode: string;
  locked: boolean;
  onCodeChange(code: string): void;
  /** Chamado após "Verificar", com o resultado real dos testes. */
  onVerified(result: RunResult, code: string): void;
}

export function CodeExercisePanel({ exercise, initialCode, starterCode, locked, onCodeChange, onVerified }: CodeExercisePanelProps) {
  const [code, setCode] = useState(initialCode);
  const [running, setRunning] = useState<'executar' | 'verificar' | null>(null);
  const [result, setResult] = useState<{ mode: 'executar' | 'verificar'; data: RunResult } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const saveTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const change = (value: string) => {
    setCode(value);
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => onCodeChange(value), 800);
  };

  const execute = async (mode: 'executar' | 'verificar') => {
    setRunning(mode);
    const data = mode === 'verificar' ? await runCode(code, exercise.tests, exercise.constraints) : await runCode(code, []);
    setRunning(null);
    setResult({ mode, data });
    if (mode === 'verificar') onVerified(data, code);
  };

  return (
    <div className="space-y-4">
      <CodeEditor value={code} onChange={change} label={`Editor de código: ${exercise.title}`} />
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
        "Executar" roda o programa e mostra o console. "Verificar" roda os testes automatizados e registra uma tentativa. O código roda isolado no
        seu navegador, com limite de tempo.
      </p>
      {result && <RunResultView result={result.data} mode={result.mode} />}
    </div>
  );
}
