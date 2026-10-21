import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'banco-02',
  trackId: 'sql',
  moduleId: 'sql-m1',
  title: 'O modelo relacional: tabelas, colunas, tipos e chaves',
  durationMin: 25,
  objectives: [
    'Descrever uma tabela em termos de linhas, colunas, tipos e chave primária.',
    'Escolher o tipo adequado para cada dado (integer, numeric, text, boolean, date).',
    'Criar uma tabela com CREATE TABLE, NOT NULL e DEFAULT.',
  ],
  prerequisites: ['banco-01'],
  concepts: ['bd-modelo-relacional'],
  explanation: [
    {
      type: 'p',
      text: 'No modelo relacional, os dados vivem em **tabelas** (o nome formal é *relação*). Cada **coluna** representa um atributo, com nome e **tipo** fixos. Cada **linha** é um registro: um produto, um cliente, um pedido. A ordem das linhas não tem significado; se você quer uma ordem, pede na consulta.',
    },
    { type: 'h', text: 'Tipos: o banco confere cada valor' },
    {
      type: 'p',
      text: 'Ao contrário de uma planilha, uma coluna só aceita valores do seu tipo. Isso impede, por exemplo, guardar "abc" em uma coluna de quantidade. Os tipos mais usados no PostgreSQL:',
    },
    {
      type: 'list',
      items: [
        '`integer` (ou `int`): números inteiros, como quantidades e IDs. Para valores muito grandes, `bigint`.',
        '`numeric(p, s)`: números decimais **exatos**. `numeric(10,2)` guarda até 10 dígitos, 2 deles depois da vírgula. É o tipo certo para dinheiro.',
        '`text`: textos de qualquer tamanho. `varchar(n)` limita o tamanho a n caracteres.',
        '`boolean`: `true` ou `false`.',
        '`date` (só a data), `timestamptz` (data, hora e fuso) — aula 22.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Dinheiro não é float',
      text: 'Tipos como `real` e `double precision` são aproximados: `0.1 + 0.2` vira `0.30000000000000004`. Para valores monetários, use `numeric`.',
    },
    { type: 'h', text: 'Chave primária' },
    {
      type: 'p',
      text: 'Toda tabela precisa de um jeito de identificar cada linha sem ambiguidade. A **chave primária** (`PRIMARY KEY`) é a coluna (ou conjunto de colunas) com valor **único e obrigatório** em cada linha. Nomes se repetem e mudam; por isso usamos um `id` que não tem significado fora do banco.',
    },
    { type: 'h', text: 'Criando uma tabela' },
    {
      type: 'code',
      language: 'sql',
      code: `CREATE TABLE nome_da_tabela (
  coluna1 tipo restricoes,
  coluna2 tipo restricoes
);`,
    },
    {
      type: 'list',
      items: [
        '`NOT NULL`: a coluna é obrigatória.',
        '`DEFAULT valor`: o valor usado quando o INSERT não informa a coluna.',
        'As colunas são separadas por vírgula; **a última não leva vírgula**.',
        'Nomes de tabelas e colunas: minúsculas, sem acento, com `_` entre palavras (`criado_em`).',
      ],
    },
  ],
  analogy:
    'Uma tabela é como um formulário impresso com campos definidos: o campo "data de nascimento" só aceita datas, alguns campos são obrigatórios e cada formulário recebe um número de protocolo único — a chave primária.',
  example: {
    language: 'sql',
    code: `CREATE TABLE livros (
  id         integer PRIMARY KEY,
  titulo     text NOT NULL,
  preco      numeric(8,2) NOT NULL,
  disponivel boolean NOT NULL DEFAULT true,
  lancado_em date
);

INSERT INTO livros (id, titulo, preco, lancado_em)
VALUES (1, 'Dom Casmurro', 34.90, '1899-01-01');

SELECT * FROM livros;`,
    lineByLine: [
      { line: 1, text: 'Cria a tabela `livros`.' },
      { line: 2, text: '`id` é inteiro e chave primária: único e obrigatório.' },
      { line: 4, text: '`numeric(8,2)`: valor exato com duas casas decimais.' },
      { line: 5, text: 'Se o INSERT não informar `disponivel`, o banco usa `true`.' },
      { line: 6, text: '`lancado_em` não tem NOT NULL: pode ficar vazia. Última coluna, sem vírgula.' },
      { line: 9, text: 'Insere uma linha informando quatro colunas; `disponivel` fica com o valor padrão.' },
      { line: 12, text: '`SELECT *` traz todas as colunas. O preço aparece com duas casas: 34.90.' },
    ],
    output: `CREATE executado.

INSERT executado.

 id | titulo       | preco | disponivel | lancado_em
----+--------------+-------+------------+------------
 1  | Dom Casmurro | 34.90 | true       | 1899-01-01
(1 linha)`,
  },
  commonErrors: [
    {
      title: 'Vírgula depois da última coluna',
      wrong: 'CREATE TABLE t (\n  id integer PRIMARY KEY,\n  nome text,\n);',
      why: 'O PostgreSQL espera outra coluna depois da vírgula e encontra o `)`: erro de sintaxe.',
      fix: 'Remova a vírgula da última linha da definição.',
    },
    {
      title: 'Guardar números como texto',
      wrong: "preco text  -- '19,90'",
      why: 'Texto não soma, não ordena como número ("100" vem antes de "20") e aceita qualquer coisa.',
      fix: 'Use `numeric(10,2)` para valores e `integer` para quantidades.',
    },
    {
      title: 'Tabela sem chave primária',
      why: 'Sem PK, duas linhas idênticas são indistinguíveis: fica impossível atualizar ou apagar exatamente uma delas.',
      fix: 'Sempre declare uma `PRIMARY KEY`, normalmente uma coluna `id`.',
    },
  ],
  guidedExerciseId: 'ex-banco-02-guiado',
  independentExerciseId: 'ex-banco-02-independente',
  reviewQuestions: [
    { question: 'Qual tipo usar para o preço de um produto? Por quê?', answer: '`numeric` (ex.: `numeric(10,2)`), porque é exato. Tipos de ponto flutuante acumulam erros de arredondamento.' },
    { question: 'O que garante uma PRIMARY KEY?', answer: 'Que cada linha tem um valor único e não nulo naquela coluna (ou conjunto de colunas), identificando-a sem ambiguidade.' },
    { question: 'O que acontece com uma coluna com DEFAULT quando o INSERT não a menciona?', answer: 'Ela recebe o valor padrão definido na tabela.' },
  ],
  summary: [
    'Tabelas têm colunas com nome e tipo fixos; cada linha é um registro.',
    'Use integer para inteiros, numeric para dinheiro, text para textos, boolean e date.',
    'PRIMARY KEY identifica cada linha: única e obrigatória.',
    'NOT NULL torna a coluna obrigatória; DEFAULT define o valor padrão.',
  ],
  completionCriteria: [
    'Escolher os tipos certos para uma tabela de alunos (exercício guiado).',
    'Criar a tabela de pedidos com tipos, PRIMARY KEY, NOT NULL e DEFAULT (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-02-guiado',
    type: 'fill-blanks',
    title: 'Os tipos da tabela de alunos',
    difficulty: 'iniciante',
    concepts: ['bd-modelo-relacional'],
    language: 'sql',
    statement:
      'Complete a criação da tabela de uma escola de idiomas. Regras: `id` inteiro e identificador; `nome` obrigatório; `nascimento` guarda uma data; `mensalidade` é um valor em reais com centavos; `ativo` é verdadeiro ou falso e começa como verdadeiro.',
    template: `CREATE TABLE alunos (
  id          [[0]] PRIMARY KEY,
  nome        text [[1]] NULL,
  nascimento  [[2]],
  mensalidade [[3]](8,2),
  ativo       [[4]] DEFAULT true
);`,
    blanks: [
      { accept: ['integer', 'int', 'int4', 'bigint', 'serial'], width: 8 },
      { accept: ['NOT'], width: 4 },
      { accept: ['date'], width: 6 },
      { accept: ['numeric', 'decimal'], width: 8 },
      { accept: ['boolean', 'bool'], width: 8 },
    ],
    hints: [
      'Conceito: cada coluna tem um tipo, e o banco só aceita valores daquele tipo.',
      'Raciocínio: o que é um id? E o tipo exato para dinheiro, que aceita (8,2) logo depois do nome?',
      'Estrutura: integer, NOT (de NOT NULL), date, numeric, boolean.',
    ],
    solution: {
      code: `CREATE TABLE alunos (
  id          integer PRIMARY KEY,
  nome        text NOT NULL,
  nascimento  date,
  mensalidade numeric(8,2),
  ativo       boolean DEFAULT true
);`,
      explanation:
        'IDs são inteiros. `NOT NULL` torna o nome obrigatório. `date` guarda apenas a data. `numeric(8,2)` é exato e tem duas casas decimais, ideal para dinheiro. `boolean` guarda verdadeiro/falso, com `true` como padrão.',
    },
  },
  {
    id: 'ex-banco-02-independente',
    type: 'sql',
    task: 'create-schema',
    title: 'Crie a tabela de pedidos',
    difficulty: 'basico',
    concepts: ['bd-modelo-relacional'],
    statement: 'Crie a tabela `pedidos` de uma loja virtual, com as colunas abaixo, nesta ordem.',
    requirements: [
      '`id`: inteiro, chave primária.',
      '`cliente`: texto, obrigatório.',
      '`total`: valor em reais com duas casas decimais (`numeric(10,2)`), obrigatório.',
      '`pago`: verdadeiro ou falso, obrigatório, com padrão `false`.',
      '`criado_em`: data, obrigatória.',
    ],
    setup: '',
    starterCode: `CREATE TABLE pedidos (
  id integer PRIMARY KEY
);`,
    tests: [
      {
        name: 'Colunas, tipos e obrigatoriedade',
        query: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'pedidos' ORDER BY ordinal_position",
        ordered: true,
        expected: {
          columns: ['column_name', 'data_type', 'is_nullable'],
          rows: [
            ['id', 'integer', 'NO'],
            ['cliente', 'text', 'NO'],
            ['total', 'numeric', 'NO'],
            ['pago', 'boolean', 'NO'],
            ['criado_em', 'date', 'NO'],
          ],
        },
      },
      {
        name: 'id é a chave primária',
        query:
          "SELECT a.attname AS coluna FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey) WHERE i.indrelid = 'pedidos'::regclass AND i.indisprimary",
        expected: { columns: ['coluna'], rows: [['id']] },
      },
      {
        name: 'pago começa como false',
        query: "INSERT INTO pedidos (id, cliente, total, criado_em) VALUES (1, 'Ana', 50, '2026-03-01');\nSELECT pago, total FROM pedidos",
        expected: { columns: ['pago', 'total'], rows: [[false, '50.00']] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: cada coluna é `nome tipo restrições`, separadas por vírgula.',
      'Raciocínio: obrigatório = `NOT NULL`. A coluna `pago` precisa de `NOT NULL` e também de `DEFAULT false`.',
      'Estrutura: `cliente text NOT NULL,` … `pago boolean NOT NULL DEFAULT false,` … `criado_em date NOT NULL` (sem vírgula no fim).',
    ],
    solution: {
      code: `CREATE TABLE pedidos (
  id        integer PRIMARY KEY,
  cliente   text NOT NULL,
  total     numeric(10,2) NOT NULL,
  pago      boolean NOT NULL DEFAULT false,
  criado_em date NOT NULL
);`,
      explanation:
        'Cada requisito vira uma restrição: PRIMARY KEY no id, NOT NULL nas obrigatórias e DEFAULT false em pago. Os testes leem o catálogo do banco (`information_schema`) para conferir nomes, tipos e obrigatoriedade, e um teste oculto insere um pedido sem informar `pago`.',
    },
  },
];
