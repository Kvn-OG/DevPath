// Avalia o código do estudante contra testes automatizados.
// Esta função é pura e síncrona: no navegador ela roda dentro de um Web Worker
// (ver worker.ts), que fornece isolamento e limite de tempo.

import type { CodeConstraint, CodeTest } from '../types/content';
import { toFriendlyError, type FriendlyError } from './errors';
import { formatLogArgs, formatValue } from './format';

export interface TestResult {
  name: string;
  passed: boolean;
  hidden: boolean;
  expected?: string;
  received?: string;
  error?: FriendlyError;
}

export interface RunResult {
  /** true somente se todos os testes passaram e nenhuma restrição foi violada. */
  passed: boolean;
  logs: string[];
  error?: FriendlyError;
  tests: TestResult[];
  constraintViolations: string[];
  timedOut?: boolean;
}

/**
 * Nomes globais sombreados como parâmetros, para que o código do estudante
 * não alcance rede, armazenamento ou o próprio worker.
 */
const BLOCKED_GLOBALS = [
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'postMessage',
  'self', 'globalThis', 'window', 'document', 'localStorage', 'sessionStorage',
  'indexedDB', 'caches', 'navigator', 'location', 'Worker', 'BroadcastChannel',
];

export function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

export function normalizeOutput(text: string): string {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .join('\n');
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true;
    return a === b || Math.abs(a - b) < 1e-9;
  }
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  );
}

export function checkConstraints(source: string, constraints: CodeConstraint[] = []): string[] {
  const clean = stripComments(source);
  return constraints
    .filter((c) => {
      const found = new RegExp(c.pattern).test(clean);
      return c.kind === 'must-include' ? !found : found;
    })
    .map((c) => c.message);
}

function makeConsole(sink: string[]) {
  const write = (...args: unknown[]) => sink.push(formatLogArgs(args));
  return { log: write, info: write, warn: write, error: write, debug: write, table: write };
}

export function evaluate(source: string, tests: CodeTest[], constraints: CodeConstraint[] = []): RunResult {
  const logs: string[] = [];
  const constraintViolations = checkConstraints(source, constraints);
  const fail = (error: FriendlyError): RunResult => ({
    passed: false,
    logs,
    error,
    constraintViolations,
    tests: tests.map((t) => ({ name: t.name, passed: false, hidden: !!t.hidden })),
  });

  // 1) Verifica a sintaxe do código do estudante isoladamente, para que o
  //    erro aponte para o código dele e não para o código dos testes.
  try {
    new Function(...BLOCKED_GLOBALS, 'console', `"use strict";\n${source}`);
  } catch (error) {
    return fail(toFriendlyError(error));
  }

  const testFns = tests.map((t) => ('code' in t ? `function(){\n${t.code}\n}` : 'null')).join(',\n');
  const body = `"use strict";\n${source}\n;return [${testFns}];`;

  // 2) Executa o programa (nível superior) capturando o console.
  let fns: unknown;
  try {
    const compiled = new Function(...BLOCKED_GLOBALS, 'console', body);
    fns = compiled(...BLOCKED_GLOBALS.map(() => undefined), makeConsole(logs));
  } catch (error) {
    return fail(toFriendlyError(error));
  }
  if (!Array.isArray(fns)) {
    return fail({
      name: 'Erro de estrutura',
      message: 'O programa terminou antes de chegar aos testes.',
      explanation: 'Provavelmente existe um return fora de qualquer função. return só deve aparecer dentro de funções.',
    });
  }
  const programOutput = logs.join('\n');
  const programLogCount = logs.length;

  // 3) Roda cada teste.
  const results: TestResult[] = tests.map((test, i) => {
    const hidden = !!test.hidden;
    if ('expectOutput' in test) {
      const passed = normalizeOutput(programOutput) === normalizeOutput(test.expectOutput);
      return { name: test.name, passed, hidden, expected: test.expectOutput, received: programOutput || '(nenhuma saída)' };
    }
    try {
      const value = (fns as (() => unknown)[])[i]();
      if (value instanceof Promise) {
        return { name: test.name, passed: false, hidden, received: 'uma Promise', expected: formatValue(test.expected, false) };
      }
      return {
        name: test.name,
        passed: deepEqual(value, test.expected),
        hidden,
        expected: formatValue(test.expected, false),
        received: formatValue(value, false),
      };
    } catch (error) {
      return { name: test.name, passed: false, hidden, expected: formatValue(test.expected, false), error: toFriendlyError(error) };
    }
  });
  // Os testes chamam funções que podem usar console.log; o que for impresso
  // depois da execução do programa é descartado para não confundir a saída.
  logs.length = programLogCount;

  return {
    passed: constraintViolations.length === 0 && results.every((r) => r.passed),
    logs,
    tests: results,
    constraintViolations,
  };
}
