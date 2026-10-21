// Avalia código SQL do estudante contra testes automatizados em um PostgreSQL
// real (PGlite). As funções recebem o banco por parâmetro: no navegador ele vive
// em um Web Worker (sqlWorker.ts); nos testes de conteúdo, direto no Node.

import type { CodeConstraint, SqlCell, SqlTest } from '../types/content';
import type { RunResult, TestResult } from './evaluator';
import { toFriendlySqlError } from './sqlErrors';

export interface SqlField {
  name: string;
  dataTypeID: number;
}

export interface SqlStatementResult {
  command?: string;
  fields: SqlField[];
  rows: unknown[][];
}

/** O mínimo do PGlite que o avaliador usa. */
export interface SqlDatabase {
  exec(sql: string, options?: { rowMode?: 'array' }): Promise<SqlStatementResult[]>;
}

/** Tipos devolvidos como texto, exatamente como o PostgreSQL (e o psql) os mostra. */
export const RAW_TEXT_TYPES = [
  1082, // date
  1083, // time
  1114, // timestamp
  1184, // timestamptz
  1186, // interval
  114, // json
  3802, // jsonb
];

export function stripSqlComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '');
}

export function checkSqlConstraints(source: string, constraints: CodeConstraint[] = []): string[] {
  const clean = stripSqlComments(source);
  return constraints
    .filter((c) => {
      const found = new RegExp(c.pattern, 'i').test(clean);
      return c.kind === 'must-include' ? !found : found;
    })
    .map((c) => c.message);
}

export function cellText(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (Array.isArray(value)) return `{${value.map((v) => (v === null ? 'NULL' : String(v))).join(',')}}`;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

const expectedText = (cell: SqlCell) => (cell === null ? 'NULL' : String(cell));

/** Tabela no estilo do psql, com a contagem de linhas no fim. */
export function formatTable(columns: string[], rows: string[][]): string {
  const widths = columns.map((c, i) => Math.max(c.length, ...rows.map((r) => (r[i] ?? '').length)));
  const line = (cells: string[]) => ` ${cells.map((c, i) => c.padEnd(widths[i])).join(' | ')} `.trimEnd();
  const out = [line(columns), widths.map((w) => '-'.repeat(w + 2)).join('+')];
  for (const row of rows) out.push(line(row));
  out.push(`(${rows.length} ${rows.length === 1 ? 'linha' : 'linhas'})`);
  return out.join('\n');
}

function resultText(result: SqlStatementResult): string {
  return formatTable(
    result.fields.map((f) => f.name),
    result.rows.map((r) => r.map(cellText)),
  );
}

/** Saída de um programa: tabelas para quem devolve linhas, o comando para os demais. */
export function describeResults(results: SqlStatementResult[]): string[] {
  return results.map((r) => (r.fields.length > 0 ? resultText(r) : `${r.command ?? 'Comando'} executado.`));
}

/**
 * Banco limpo a cada execução: desfaz transações abertas, apaga schemas criados
 * pelo estudante e recria o schema public. Assim nenhuma tentativa interfere na próxima.
 */
async function resetDatabase(db: SqlDatabase) {
  await db.exec('ROLLBACK').catch(() => undefined);
  await db.exec('RESET ROLE; RESET SESSION AUTHORIZATION;');
  const schemas = await db.exec(
    "SELECT nspname FROM pg_namespace WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast') AND nspname NOT LIKE 'pg_temp%' AND nspname NOT LIKE 'pg_toast_temp%'",
    { rowMode: 'array' },
  );
  const drops = schemas[0].rows.map((r) => `DROP SCHEMA IF EXISTS "${String(r[0])}" CASCADE;`).join('\n');
  await db.exec(`RESET ALL;\n${drops}\n${DROP_ROLES}\nCREATE SCHEMA public;\nGRANT ALL ON SCHEMA public TO PUBLIC;\nSET TimeZone TO 'America/Sao_Paulo';\nSET DateStyle TO 'ISO, YMD';`);
}

/** Roles criadas pelo estudante (CREATE ROLE) existem fora dos schemas e também são apagadas. */
const DROP_ROLES = `DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT rolname FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%' AND rolname <> current_user LOOP
    EXECUTE format('DROP OWNED BY %I', r.rolname);
    EXECUTE format('DROP ROLE %I', r.rolname);
  END LOOP;
END $$;`;

/** Executa setup + código e devolve os resultados de cada instrução do código. */
export async function runSqlProgram(db: SqlDatabase, setup: string, source: string): Promise<RunResult> {
  try {
    await resetDatabase(db);
    if (setup.trim()) await db.exec(setup);
  } catch (error) {
    return { passed: false, logs: [], tests: [], constraintViolations: [], error: { ...toFriendlySqlError(error), name: 'Erro nos dados do exercício' } };
  }
  try {
    const results = source.trim() ? await db.exec(source, { rowMode: 'array' }) : [];
    return { passed: false, logs: describeResults(results), tests: [], constraintViolations: [] };
  } catch (error) {
    return { passed: false, logs: [], tests: [], constraintViolations: [], error: toFriendlySqlError(error, source) };
  }
}

function sameRows(actual: string[][], expected: string[][], ordered: boolean): boolean {
  if (actual.length !== expected.length) return false;
  const key = (r: string[]) => JSON.stringify(r);
  const a = actual.map(key);
  const b = expected.map(key);
  if (!ordered) {
    a.sort();
    b.sort();
  }
  return a.every((row, i) => row === b[i]);
}

async function runTest(db: SqlDatabase, setup: string, source: string, test: SqlTest): Promise<TestResult & { logs?: string[] }> {
  const hidden = !!test.hidden;
  const expectedColumns = test.expected.columns;
  const expectedRows = test.expected.rows.map((r) => r.map(expectedText));
  const expected = formatTable(expectedColumns ?? expectedRows[0]?.map((_, i) => `coluna ${i + 1}`) ?? [], expectedRows);

  await resetDatabase(db);
  if (setup.trim()) await db.exec(setup);
  if (test.setup) await db.exec(test.setup);

  let results: SqlStatementResult[];
  try {
    results = source.trim() ? await db.exec(source, { rowMode: 'array' }) : [];
  } catch (error) {
    return { name: test.name, passed: false, hidden, expected, error: toFriendlySqlError(error, source) };
  }
  const logs = describeResults(results);

  let target: SqlStatementResult | undefined;
  if (test.query) {
    try {
      target = (await db.exec(test.query, { rowMode: 'array' })).at(-1);
    } catch (error) {
      return { name: test.name, passed: false, hidden, expected, logs, error: toFriendlySqlError(error) };
    }
  } else {
    target = [...results].reverse().find((r) => r.fields.length > 0);
  }
  if (!target || target.fields.length === 0) {
    return { name: test.name, passed: false, hidden, expected, logs, received: '(nenhuma consulta devolveu linhas)' };
  }

  const columns = target.fields.map((f) => f.name);
  const rows = target.rows.map((r) => r.map(cellText));
  const columnsOk = !expectedColumns || JSON.stringify(columns) === JSON.stringify(expectedColumns);
  return {
    name: test.name,
    passed: columnsOk && sameRows(rows, expectedRows, !!test.ordered),
    hidden,
    expected,
    received: formatTable(columns, rows),
    logs,
  };
}

export async function evaluateSql(
  db: SqlDatabase,
  setup: string,
  source: string,
  tests: SqlTest[],
  constraints: CodeConstraint[] = [],
): Promise<RunResult> {
  const constraintViolations = checkSqlConstraints(source, constraints);
  const results: TestResult[] = [];
  let logs: string[] = [];
  for (const test of tests) {
    try {
      const { logs: testLogs, ...result } = await runTest(db, setup, source, test);
      // A saída mostrada é a do primeiro teste (os dados visíveis do exercício).
      if (results.length === 0 && testLogs) logs = testLogs;
      results.push(result);
    } catch (error) {
      return {
        passed: false,
        logs,
        tests: [],
        constraintViolations,
        error: { ...toFriendlySqlError(error), name: 'Erro nos dados do exercício' },
      };
    }
  }
  const firstError = results.find((r) => r.error)?.error;
  return {
    passed: constraintViolations.length === 0 && results.every((r) => r.passed),
    logs,
    error: firstError,
    tests: results,
    constraintViolations,
  };
}
