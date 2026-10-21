// Traduz erros do PostgreSQL para explicações em português, mantendo a
// mensagem original (que o estudante precisa aprender a ler).

import type { FriendlyError } from './errors';

interface PgErrorLike {
  message?: string;
  code?: string;
  position?: string | number;
  detail?: string;
  hint?: string;
}

const BY_CODE: Record<string, (e: PgErrorLike) => string> = {
  '42601': () =>
    'Erro de sintaxe: o PostgreSQL não entendeu o comando a partir do trecho indicado. Confira palavras-chave escritas errado, vírgulas sobrando ou faltando entre colunas, aspas e parênteses sem par e o ponto e vírgula entre comandos.',
  '42703': (e) =>
    `A coluna ${quoted(e.message)} não existe na tabela consultada. Confira a grafia, de qual tabela ela vem e, em consultas com JOIN, se o prefixo (ex.: t.titulo) está certo. Lembre-se: aspas simples são textos ('Ana'); nomes de colunas não levam aspas simples.`,
  '42P01': (e) =>
    `A tabela ${quoted(e.message)} não existe. Confira o nome (o PostgreSQL converte nomes sem aspas para minúsculas) e se ela foi criada antes de ser usada.`,
  '42P07': (e) => `Já existe uma tabela (ou outro objeto) chamada ${quoted(e.message)}. Use outro nome ou CREATE TABLE IF NOT EXISTS.`,
  '42702': (e) =>
    `A coluna ${quoted(e.message)} existe em mais de uma tabela da consulta e o banco não sabe qual usar. Prefixe com o nome ou apelido da tabela, como u.id.`,
  '42803': () =>
    'Erro de agrupamento: em uma consulta com GROUP BY (ou com funções como COUNT e SUM), toda coluna do SELECT precisa estar no GROUP BY ou dentro de uma função de agregação.',
  '42883': () =>
    'Essa função ou operador não existe para esses tipos. Confira o nome da função e os tipos dos valores (por exemplo, comparar texto com número exige conversão).',
  '42804': () => 'Os tipos não combinam: o valor tem um tipo diferente do que a coluna ou a expressão espera.',
  '42P10': () => 'Uma referência no ORDER BY, GROUP BY ou em uma constraint não aponta para uma coluna válida.',
  '42701': (e) => `A coluna ${quoted(e.message)} aparece duas vezes na definição.`,
  '42710': (e) => `O objeto ${quoted(e.message)} já existe.`,
  '42704': (e) => `O objeto ${quoted(e.message)} não existe.`,
  '42501': () => 'Permissão negada: o usuário (role) atual não tem privilégio para essa operação.',
  '42830': () => 'A chave estrangeira precisa apontar para uma coluna com PRIMARY KEY ou UNIQUE na tabela referenciada.',
  '22P02': () =>
    'O texto não pôde ser convertido para o tipo da coluna (por exemplo, "abc" em uma coluna integer). Confira o valor e se números estão sem aspas.',
  '22001': () => 'O texto é maior do que o tamanho máximo da coluna (por exemplo, varchar(20)).',
  '22003': () => 'O número está fora do intervalo permitido pelo tipo da coluna.',
  '22007': () => "A data ou hora está em um formato inválido. Use o formato 'AAAA-MM-DD' (ex.: '2026-03-15').",
  '22008': () => 'A data ou hora está fora do intervalo válido (por exemplo, 30 de fevereiro).',
  '22012': () => 'Divisão por zero.',
  '23502': (e) =>
    `Violação de NOT NULL: a coluna ${quoted(e.message)} é obrigatória e ficou sem valor. Informe um valor para ela no INSERT ou no UPDATE.`,
  '23505': () =>
    'Violação de unicidade: já existe uma linha com esse valor em uma coluna marcada como PRIMARY KEY ou UNIQUE. Valores repetidos não são aceitos nela.',
  '23503': () =>
    'Violação de chave estrangeira: o valor aponta para uma linha que não existe na outra tabela (ou você tentou apagar uma linha que ainda é referenciada).',
  '23514': () => 'Violação de CHECK: o valor não cumpre a regra definida na tabela (por exemplo, preço maior que zero).',
  '25P02': () =>
    'A transação atual falhou em um comando anterior; até um ROLLBACK, o banco recusa os próximos comandos. Corrija o erro anterior.',
  '25001': () => 'Já existe uma transação em andamento.',
  '57014': () => 'O comando foi cancelado por demorar demais.',
  '54001': () => 'A consulta ficou complexa demais (recursão profunda).',
};

function quoted(message?: string): string {
  const match = message?.match(/"([^"]+)"/);
  return match ? `"${match[1]}"` : 'indicada';
}

function lineOf(source: string, position: number): number {
  return source.slice(0, Math.max(0, position - 1)).split('\n').length;
}

export function toFriendlySqlError(error: unknown, source?: string): FriendlyError {
  const e = (error ?? {}) as PgErrorLike;
  const message = e.message ?? String(error);
  const position = Number(e.position);
  const where = source && position > 0 ? ` (linha ${lineOf(source, position)})` : '';
  const explain = e.code ? BY_CODE[e.code] : undefined;
  const extra = [e.detail, e.hint].filter(Boolean).join(' ');
  return {
    name: e.code ? `Erro do PostgreSQL ${e.code}` : 'Erro',
    message: `${message}${where}`,
    explanation: `${explain ? explain(e) : 'Leia a mensagem original: ela diz o que o banco recusou e, muitas vezes, onde.'}${extra ? ` Detalhe do banco: ${extra}` : ''}`,
  };
}

export const SQL_TIMEOUT_ERROR: FriendlyError = {
  name: 'Tempo esgotado',
  message: 'A execução passou do tempo limite e foi interrompida.',
  explanation:
    'Consultas que geram linhas demais (como generate_series enorme ou um JOIN sem condição entre tabelas grandes) ou uma recursão sem fim travam o banco. Confira as condições de junção e os limites.',
};
