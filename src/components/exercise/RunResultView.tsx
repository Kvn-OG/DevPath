import { AlertTriangle, CheckCircle2, EyeOff, XCircle } from 'lucide-react';
import type { RunResult } from '../../sandbox/evaluator';
import { cn } from '../../utils/cn';

export function RunResultView({ result, mode }: { result: RunResult; mode: 'executar' | 'verificar' }) {
  const visibleTests = result.tests;
  const passedCount = result.tests.filter((t) => t.passed).length;

  return (
    <div className="space-y-3" aria-live="polite">
      {mode === 'verificar' && result.tests.length > 0 && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium',
            result.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
          )}
        >
          {result.passed ? <CheckCircle2 size={18} aria-hidden /> : <XCircle size={18} aria-hidden />}
          {result.passed
            ? 'Todos os testes passaram.'
            : `${passedCount} de ${result.tests.length} testes passaram${result.constraintViolations.length ? ' e há requisitos não atendidos' : ''}.`}
        </div>
      )}

      {result.error && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm">
          <div className="flex items-center gap-2 font-mono font-medium text-danger">
            <AlertTriangle size={16} aria-hidden />
            {result.error.name}: {result.error.message}
          </div>
          <p className="mt-2 text-fg">{result.error.explanation}</p>
        </div>
      )}

      {result.constraintViolations.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-warning/30 bg-warning-soft p-4 text-sm text-fg">
          {result.constraintViolations.map((v) => (
            <li key={v} className="flex gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden />
              {v}
            </li>
          ))}
        </ul>
      )}

      {mode === 'verificar' && visibleTests.length > 0 && (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
          {visibleTests.map((test, i) => (
            <li key={i} className="px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2">
                {test.passed ? (
                  <CheckCircle2 size={16} className="shrink-0 text-success" aria-label="Passou" />
                ) : (
                  <XCircle size={16} className="shrink-0 text-danger" aria-label="Falhou" />
                )}
                {test.hidden ? (
                  <span className="flex items-center gap-1.5 text-muted">
                    <EyeOff size={14} aria-hidden /> Teste oculto {i + 1}
                  </span>
                ) : (
                  <span>{test.name}</span>
                )}
              </div>
              {!test.passed && !test.hidden && (test.received !== undefined || test.error) && (
                <div className="mt-1.5 ml-6 space-y-0.5 font-mono text-xs text-muted">
                  {test.expected !== undefined && <div>esperado: <span className="text-success">{test.expected}</span></div>}
                  {test.error ? (
                    <div className="text-danger">
                      {test.error.name}: {test.error.message}
                      <div className="mt-1 font-sans text-muted">{test.error.explanation}</div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">recebido: <span className="text-danger">{test.received}</span></div>
                  )}
                </div>
              )}
              {!test.passed && test.hidden && (
                <p className="mt-1 ml-6 text-xs text-faint">Testes ocultos verificam casos-limite. Pense em listas vazias, zero, negativos e valores repetidos.</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div>
        <div className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">Saída do console</div>
        <pre className="max-h-56 overflow-auto rounded-lg border border-line bg-bg px-4 py-3 font-mono text-[13px] whitespace-pre-wrap text-fg">
          {result.logs.length ? result.logs.join('\n') : <span className="text-faint">(nenhuma saída)</span>}
        </pre>
      </div>
    </div>
  );
}
