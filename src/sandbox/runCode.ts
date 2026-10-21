// API usada pela interface para executar código com isolamento e limite de tempo.

import type { CodeConstraint, CodeTest } from '../types/content';
import { TIMEOUT_ERROR } from './errors';
import type { RunResult } from './evaluator';

export const DEFAULT_TIMEOUT_MS = 2500;

export function isSandboxAvailable(): boolean {
  return typeof Worker !== 'undefined';
}

export function runCode(
  source: string,
  tests: CodeTest[],
  constraints: CodeConstraint[] = [],
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<RunResult> {
  if (!isSandboxAvailable()) {
    // Sem Worker não há isolamento: não executamos nem simulamos resultados.
    return Promise.resolve({
      passed: false,
      logs: [],
      tests: [],
      constraintViolations: [],
      error: {
        name: 'Execução indisponível',
        message: 'Este navegador não oferece Web Workers.',
        explanation:
          'O DevPath só executa código em um ambiente isolado. Use um navegador moderno (Chrome, Edge, Firefox ou Safari atualizados).',
      },
    });
  }

  return new Promise((resolve) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    const finish = (result: RunResult) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };
    const timer = window.setTimeout(() => {
      finish({
        passed: false,
        logs: [],
        tests: tests.map((t) => ({ name: t.name, passed: false, hidden: !!t.hidden })),
        constraintViolations: [],
        error: TIMEOUT_ERROR,
        timedOut: true,
      });
    }, timeoutMs);

    worker.onmessage = (event: MessageEvent<RunResult>) => finish(event.data);
    worker.onerror = (event) =>
      finish({
        passed: false,
        logs: [],
        tests: [],
        constraintViolations: [],
        error: { name: 'Erro no ambiente', message: event.message, explanation: 'O ambiente de execução falhou. Tente novamente.' },
      });
    worker.postMessage({ source, tests, constraints });
  });
}
