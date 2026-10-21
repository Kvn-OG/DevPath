import { describe, expect, it } from 'vitest';
import { checkConstraints, deepEqual, evaluate, stripComments } from './evaluator';
import { formatValue } from './format';

describe('evaluate', () => {
  it('aprova código correto e captura a saída do console', () => {
    const result = evaluate('function soma(a, b) { return a + b; }\nconsole.log("oi", soma(1, 2));', [
      { name: 'soma', code: 'return soma(2, 3);', expected: 5 },
    ]);
    expect(result.passed).toBe(true);
    expect(result.logs).toEqual(['oi 3']);
  });

  it('reprova quando o retorno é diferente e informa esperado/recebido', () => {
    const result = evaluate('function soma(a, b) { return a - b; }', [{ name: 'soma', code: 'return soma(2, 3);', expected: 5 }]);
    expect(result.passed).toBe(false);
    expect(result.tests[0]).toMatchObject({ passed: false, expected: '5', received: '-1' });
  });

  it('traduz erros de sintaxe sem executar os testes', () => {
    const result = evaluate('function f( {', [{ name: 't', code: 'return 1;', expected: 1 }]);
    expect(result.passed).toBe(false);
    expect(result.error?.name).toBe('SyntaxError');
    expect(result.error?.explanation.length).toBeGreaterThan(10);
  });

  it('explica ReferenceError em português', () => {
    const result = evaluate('console.log(totl);', []);
    expect(result.error?.name).toBe('ReferenceError');
    expect(result.error?.explanation).toContain('"totl"');
  });

  it('isola erros por teste', () => {
    const result = evaluate('function f(x) { return x.nome; }', [
      { name: 'ok', code: 'return f({ nome: "Ana" });', expected: 'Ana' },
      { name: 'erro', code: 'return f(undefined);', expected: null },
    ]);
    expect(result.tests[0].passed).toBe(true);
    expect(result.tests[1].passed).toBe(false);
    expect(result.tests[1].error?.name).toBe('TypeError');
  });

  it('bloqueia acesso à rede e ao escopo global', () => {
    const result = evaluate('console.log(typeof fetch, typeof globalThis, typeof localStorage, typeof document);', []);
    expect(result.logs).toEqual(['undefined undefined undefined undefined']);
  });

  it('usa modo estrito (variável sem declaração gera erro)', () => {
    const result = evaluate('total = 10;', []);
    expect(result.error?.name).toBe('ReferenceError');
  });

  it('compara saída esperada ignorando espaços nas pontas', () => {
    const result = evaluate('console.log(1);\nconsole.log("dois");', [{ name: 'saída', expectOutput: '1\n  dois  ' }]);
    expect(result.passed).toBe(true);
  });

  it('não mistura logs feitos dentro dos testes com a saída do programa', () => {
    const result = evaluate('function f() { console.log("dentro"); return 1; }\nconsole.log("programa");', [{ name: 't', code: 'return f();', expected: 1 }]);
    expect(result.logs).toEqual(['programa']);
  });

  it('aplica restrições de código ignorando comentários', () => {
    expect(checkConstraints('// Math.max\nconst x = 1;', [{ kind: 'must-not-include', pattern: 'Math\\.max', message: 'sem max' }])).toEqual([]);
    expect(checkConstraints('Math.max(1, 2)', [{ kind: 'must-not-include', pattern: 'Math\\.max', message: 'sem max' }])).toEqual(['sem max']);
    expect(stripComments('const url = "http://x"; // comentário')).toContain('http://x');
  });
});

describe('deepEqual', () => {
  it('compara objetos sem depender da ordem das chaves', () => {
    expect(deepEqual({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(deepEqual([1, 2], [2, 1])).toBe(false);
  });
  it('tolera imprecisão de ponto flutuante', () => {
    expect(deepEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(deepEqual(NaN, NaN)).toBe(true);
  });
});

describe('formatValue', () => {
  it('formata como o console do Node.js', () => {
    expect(formatValue([1, 'a', { nome: 'Ana' }])).toBe("[ 1, 'a', { nome: 'Ana' } ]");
    expect(formatValue({})).toBe('{}');
    expect(formatValue('texto')).toBe('texto');
  });
});
