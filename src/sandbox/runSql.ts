// API usada pela interface para executar SQL em um PostgreSQL isolado no navegador.
// O worker é reaproveitado entre execuções (o banco leva alguns segundos para
// carregar na primeira vez) e recriado se uma execução estourar o tempo.

import type { CodeConstraint, SqlTest } from '../types/content';
import type { RunResult } from './evaluator';
import { SQL_TIMEOUT_ERROR } from './sqlErrors';

export interface SqlRequest {
  id: number;
  setup: string;
  source: string;
  /** Sem testes, apenas executa e devolve a saída. */
  tests?: SqlTest[];
  constraints?: CodeConstraint[];
}

type WorkerMessage =
  | { type: 'ready' }
  | { type: 'init-error'; message: string }
  | { type: 'result'; id: number; result: RunResult };

/** Tempo para baixar e iniciar o banco (só na primeira execução). */
const LOAD_TIMEOUT_MS = 60_000;
export const SQL_TIMEOUT_MS = 6_000;

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let queue: Promise<unknown> = Promise.resolve();
let nextId = 1;

const failure = (error: RunResult['error'], tests: SqlTest[] = [], timedOut = false): RunResult => ({
  passed: false,
  logs: [],
  tests: tests.map((t) => ({ name: t.name, passed: false, hidden: !!t.hidden })),
  constraintViolations: [],
  error,
  timedOut,
});

function discardWorker() {
  worker?.terminate();
  worker = null;
  ready = null;
}

function startWorker(): Promise<void> {
  if (worker && ready) return ready;
  const w = new Worker(new URL('./sqlWorker.ts', import.meta.url), { type: 'module' });
  worker = w;
  ready = new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('O banco de dados demorou demais para carregar.')), LOAD_TIMEOUT_MS);
    const onMessage = (event: MessageEvent<WorkerMessage>) => {
      if (event.data.type === 'ready') resolve();
      else if (event.data.type === 'init-error') reject(new Error(event.data.message));
      else return;
      window.clearTimeout(timer);
      w.removeEventListener('message', onMessage);
    };
    w.addEventListener('message', onMessage);
    w.onerror = (event) => {
      window.clearTimeout(timer);
      reject(new Error(event.message || 'Falha ao iniciar o banco de dados.'));
    };
  });
  ready.catch(discardWorker);
  return ready;
}

/** Inicia o carregamento do banco antes da primeira execução (ex.: ao abrir a aula). */
export function preloadSql() {
  if (typeof Worker !== 'undefined') startWorker().catch(() => undefined);
}

async function execute(request: Omit<SqlRequest, 'id'>): Promise<RunResult> {
  if (typeof Worker === 'undefined') {
    return failure({
      name: 'Execução indisponível',
      message: 'Este navegador não oferece Web Workers.',
      explanation: 'O DevPath só executa SQL em um ambiente isolado. Use um navegador moderno (Chrome, Edge, Firefox ou Safari atualizados).',
    });
  }
  try {
    await startWorker();
  } catch (error) {
    return failure({
      name: 'Banco indisponível',
      message: error instanceof Error ? error.message : String(error),
      explanation: 'Não foi possível carregar o PostgreSQL no navegador. Verifique a conexão e recarregue a página.',
    });
  }
  const w = worker!;
  const id = nextId++;
  return new Promise<RunResult>((resolve) => {
    const finish = (result: RunResult) => {
      window.clearTimeout(timer);
      w.removeEventListener('message', onMessage);
      resolve(result);
    };
    const timer = window.setTimeout(() => {
      discardWorker();
      finish(failure(SQL_TIMEOUT_ERROR, request.tests, true));
    }, SQL_TIMEOUT_MS);
    const onMessage = (event: MessageEvent<WorkerMessage>) => {
      if (event.data.type === 'result' && event.data.id === id) finish(event.data.result);
    };
    w.addEventListener('message', onMessage);
    w.postMessage({ ...request, id });
  });
}

/** Executa um pedido por vez: o banco é um só e cada execução começa do zero. */
export function runSql(setup: string, source: string, tests?: SqlTest[], constraints?: CodeConstraint[]): Promise<RunResult> {
  const run = queue.then(() => execute({ setup, source, tests, constraints }));
  queue = run.catch(() => undefined);
  return run;
}
