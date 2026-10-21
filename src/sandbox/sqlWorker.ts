/// <reference lib="webworker" />
// Web Worker com um PostgreSQL (PGlite) em memória. Fica fora da thread da
// interface e é descartado se uma consulta passar do tempo limite.

import { createSqlDatabase } from './sqlDatabase';
import { evaluateSql, runSqlProgram } from './sqlEvaluator';
import type { SqlRequest } from './runSql';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const ready = createSqlDatabase();

ready.then(
  () => scope.postMessage({ type: 'ready' }),
  (error) => scope.postMessage({ type: 'init-error', message: String(error?.message ?? error) }),
);

scope.onmessage = async (event: MessageEvent<SqlRequest>) => {
  const { id, setup, source, tests, constraints } = event.data;
  const db = await ready;
  const result = tests ? await evaluateSql(db, setup, source, tests, constraints) : await runSqlProgram(db, setup, source);
  scope.postMessage({ type: 'result', id, result });
};
