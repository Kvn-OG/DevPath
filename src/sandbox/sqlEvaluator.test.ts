// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import { createSqlDatabase } from './sqlDatabase';
import { evaluateSql, formatTable, runSqlProgram, stripSqlComments, type SqlDatabase } from './sqlEvaluator';

const SETUP = `CREATE TABLE produtos (id integer PRIMARY KEY, nome text NOT NULL, preco numeric(10,2));
INSERT INTO produtos VALUES (1, 'Café', 12.50), (2, 'Chá', 8.00), (3, 'Bolo', NULL);`;

let db: SqlDatabase;
beforeAll(async () => {
  db = await createSqlDatabase();
}, 60_000);

describe('formatTable', () => {
  it('formata como o psql', () => {
    expect(formatTable(['id', 'nome'], [['1', 'Café']])).toBe(' id | nome\n----+------\n 1  | Café\n(1 linha)');
    expect(formatTable(['n'], [])).toBe(' n\n---\n(0 linhas)');
  });
});

describe('stripSqlComments', () => {
  it('remove comentários de linha e de bloco', () => {
    expect(stripSqlComments('SELECT 1; -- WHERE\n/* JOIN */ SELECT 2;').includes('WHERE')).toBe(false);
  });
});

describe('runSqlProgram', () => {
  it('mostra tabelas e comandos', async () => {
    const r = await runSqlProgram(db, SETUP, "UPDATE produtos SET preco = 9 WHERE id = 2;\nSELECT nome, preco FROM produtos WHERE id = 2;");
    expect(r.error).toBeUndefined();
    expect(r.logs).toEqual(['UPDATE executado.', ' nome | preco\n------+-------\n Chá  | 9.00\n(1 linha)']);
  });

  it('cada execução começa com o banco limpo', async () => {
    await runSqlProgram(db, SETUP, 'CREATE TABLE extra (x int); CREATE SCHEMA outro; CREATE ROLE leitor; BEGIN;');
    const r = await runSqlProgram(db, SETUP, "SELECT count(*) FROM pg_tables WHERE tablename = 'extra'; CREATE ROLE leitor;");
    expect(r.error).toBeUndefined();
    expect(r.logs[0]).toContain(' 0');
  });

  it('traduz erros e aponta a linha', async () => {
    const r = await runSqlProgram(db, SETUP, 'SELECT nome\nFROM produtos\nWHERE precoo > 10;');
    expect(r.error?.name).toBe('Erro do PostgreSQL 42703');
    expect(r.error?.message).toContain('linha 3');
    expect(r.error?.explanation).toContain('"precoo"');
  });

  it('mostra NULL e datas como texto', async () => {
    const r = await runSqlProgram(db, SETUP, "SELECT preco, DATE '2026-03-15' AS dia FROM produtos WHERE id = 3;");
    expect(r.logs[0]).toContain('NULL');
    expect(r.logs[0]).toContain('2026-03-15');
  });
});

describe('evaluateSql', () => {
  const tests = [
    { name: 'visível', expected: { columns: ['nome'], rows: [['Café']] } },
    { name: 'outros dados', setup: "INSERT INTO produtos VALUES (4, 'Torta', 30);", expected: { rows: [['Café'], ['Torta']] }, hidden: true },
  ];

  it('aprova a consulta certa, sem depender da ordem', async () => {
    const r = await evaluateSql(db, SETUP, 'SELECT nome FROM produtos WHERE preco > 10 ORDER BY nome DESC;', tests);
    expect(r.tests.map((t) => t.passed)).toEqual([true, true]);
    expect(r.passed).toBe(true);
  });

  it('reprova resultados fixos que só valem para os dados visíveis', async () => {
    const r = await evaluateSql(db, SETUP, "SELECT nome FROM produtos WHERE id = 1;", tests);
    expect(r.tests.map((t) => t.passed)).toEqual([true, false]);
  });

  it('confere nomes de colunas e ordem quando pedido', async () => {
    const ordered = [{ name: 'ordem', ordered: true, expected: { columns: ['nome'], rows: [['Chá'], ['Café']] } }];
    expect((await evaluateSql(db, SETUP, 'SELECT nome FROM produtos WHERE preco IS NOT NULL ORDER BY preco;', ordered)).passed).toBe(true);
    expect((await evaluateSql(db, SETUP, 'SELECT nome FROM produtos WHERE preco IS NOT NULL ORDER BY preco DESC;', ordered)).passed).toBe(false);
    expect((await evaluateSql(db, SETUP, 'SELECT nome AS produto FROM produtos WHERE preco IS NOT NULL ORDER BY preco;', ordered)).passed).toBe(false);
  });

  it('usa a consulta de conferência para comandos que alteram dados', async () => {
    const check = [{ name: 'preço', query: 'SELECT preco FROM produtos WHERE id = 3', expected: { rows: [['5.00']] } }];
    expect((await evaluateSql(db, SETUP, 'UPDATE produtos SET preco = 5 WHERE id = 3;', check)).passed).toBe(true);
    expect((await evaluateSql(db, SETUP, 'UPDATE produtos SET preco = 5;', check)).passed).toBe(true);
  });

  it('aplica restrições sem diferenciar maiúsculas', async () => {
    const r = await evaluateSql(db, SETUP, 'select nome from produtos where preco > 10', tests, [
      { kind: 'must-include', pattern: '\\bWHERE\\b', message: 'Use WHERE.' },
      { kind: 'must-not-include', pattern: '\\bLIMIT\\b', message: 'Não use LIMIT.' },
    ]);
    expect(r.constraintViolations).toEqual([]);
  });

  it('relata erro do estudante em cada teste', async () => {
    const r = await evaluateSql(db, SETUP, 'SELEC nome FROM produtos;', tests);
    expect(r.passed).toBe(false);
    expect(r.error?.name).toBe('Erro do PostgreSQL 42601');
  });
});
