import type { Exercise, Lesson } from '../../../types/content';
import { ACEITA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-14',
  trackId: 'sql',
  moduleId: 'sql-m4',
  title: 'Constraints: o banco protegendo os dados',
  durationMin: 25,
  objectives: [
    'Usar NOT NULL, UNIQUE, CHECK, DEFAULT, PRIMARY KEY e FOREIGN KEY como regras do negócio.',
    'Criar UNIQUE e CHECK com várias colunas e com nome.',
    'Adicionar constraints a tabelas existentes com ALTER TABLE.',
  ],
  prerequisites: ['banco-13'],
  concepts: ['bd-constraints'],
  explanation: [
    {
      type: 'p',
      text: 'Validar dados só na aplicação não basta: existe mais de uma aplicação, existem scripts, existem bugs. As **constraints** são regras que o próprio banco aplica em todo INSERT e UPDATE, venha de onde vier. Se a regra é violada, o comando inteiro é recusado.',
    },
    {
      type: 'list',
      items: [
        '`NOT NULL`: valor obrigatório.',
        '`UNIQUE`: valor não se repete. `UNIQUE (produto, cliente_email)` vale para a **combinação**.',
        '`CHECK (expressão)`: a expressão precisa ser verdadeira. Ex.: `CHECK (preco > 0)`, `CHECK (nota BETWEEN 1 AND 5)`, `CHECK (fim >= inicio)`.',
        '`DEFAULT`: valor padrão (não é uma restrição, mas costuma andar junto).',
        '`PRIMARY KEY` = UNIQUE + NOT NULL. `REFERENCES` = chave estrangeira.',
      ],
    },
    { type: 'h', text: 'Nomes e ALTER TABLE' },
    {
      type: 'code',
      language: 'sql',
      code: `ALTER TABLE produtos
  ADD CONSTRAINT preco_positivo CHECK (preco > 0);

ALTER TABLE produtos
  ALTER COLUMN categoria SET NOT NULL;`,
    },
    {
      type: 'p',
      text: 'Dar nome à constraint (`CONSTRAINT preco_positivo`) deixa as mensagens de erro claras e facilita removê-la depois. Ao adicionar uma constraint em uma tabela com dados, o banco confere as linhas existentes e recusa se alguma violar a regra.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'CHECK e NULL',
      text: 'Um CHECK só recusa quando a expressão é **false**. Com NULL, ela é desconhecida e o valor passa. Se a coluna é obrigatória, combine com NOT NULL.',
    },
  ],
  analogy:
    'Constraints são as travas de um formulário de papel com campos pré-impressos: o campo "nota" só tem as caixinhas de 1 a 5, o CPF tem 11 quadrados e não há como entregar sem assinatura. Ninguém precisa lembrar das regras: o formulário não deixa errar.',
  example: {
    language: 'sql',
    code: `CREATE TABLE cupons (
  codigo     text PRIMARY KEY,
  desconto   integer NOT NULL CHECK (desconto BETWEEN 1 AND 90),
  usos       integer NOT NULL DEFAULT 0,
  limite     integer NOT NULL,
  valido_ate date NOT NULL,
  CONSTRAINT usos_dentro_do_limite CHECK (usos <= limite)
);

INSERT INTO cupons (codigo, desconto, limite, valido_ate)
VALUES ('BEMVINDO', 10, 100, '2026-12-31');

SELECT codigo, desconto, usos, limite FROM cupons;`,
    lineByLine: [
      { line: 3, text: 'O desconto precisa estar entre 1% e 90%.' },
      { line: 4, text: 'Começa em 0 se não for informado.' },
      { line: 7, text: 'Um CHECK de tabela pode comparar colunas. Com nome, o erro diz exatamente qual regra falhou.' },
      { line: 10, text: 'Um INSERT com desconto 95, ou um UPDATE que deixe usos maior que limite, seria recusado com erro 23514.' },
    ],
    output: `CREATE executado.

INSERT executado.

 codigo   | desconto | usos | limite
----------+----------+------+--------
 BEMVINDO | 10       | 0    | 100
(1 linha)`,
  },
  commonErrors: [
    {
      title: 'Validar só no front-end',
      why: 'Uma requisição feita direto na API, um script ou uma importação ignoram o formulário.',
      fix: 'Valide também no banco com constraints; a validação da interface é para dar uma boa mensagem ao usuário.',
    },
    {
      title: 'UNIQUE em cada coluna em vez do par',
      wrong: 'produto text UNIQUE,\ncliente_email text UNIQUE',
      why: 'Isso impede o mesmo cliente de avaliar dois produtos diferentes.',
      fix: 'A regra é sobre a combinação: `UNIQUE (produto, cliente_email)`.',
    },
    {
      title: 'CHECK achando que barra NULL',
      wrong: 'nota integer CHECK (nota BETWEEN 1 AND 5)',
      why: 'nota NULL passa no CHECK, porque a expressão fica desconhecida.',
      fix: '`nota integer NOT NULL CHECK (nota BETWEEN 1 AND 5)`',
    },
  ],
  guidedExerciseId: 'ex-banco-14-guiado',
  independentExerciseId: 'ex-banco-14-independente',
  reviewQuestions: [
    { question: 'Por que colocar regras no banco se a aplicação já valida?', answer: 'Porque o banco é o único ponto por onde todos os dados passam; aplicações, scripts e bugs não conseguem contorná-lo.' },
    { question: 'O que `UNIQUE (a, b)` garante?', answer: 'Que a combinação de a e b não se repete; valores repetidos de a sozinho continuam permitidos.' },
    { question: 'Um CHECK (preco > 0) recusa preco NULL?', answer: 'Não. Com NULL a expressão é desconhecida e passa; para recusar, use NOT NULL.' },
  ],
  summary: [
    'Constraints são regras aplicadas pelo banco em todo INSERT e UPDATE.',
    'NOT NULL, UNIQUE, CHECK, PRIMARY KEY e REFERENCES.',
    'UNIQUE e CHECK podem envolver várias colunas; dê nomes às constraints.',
    'CHECK deixa passar NULL; combine com NOT NULL.',
  ],
  completionCriteria: ['Completar as regras de uma tabela de funcionários (exercício guiado).', 'Criar a tabela de avaliações com todas as regras do negócio (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-14-guiado',
    type: 'fill-blanks',
    title: 'As regras dos funcionários',
    difficulty: 'basico',
    concepts: ['bd-constraints'],
    language: 'sql',
    statement: 'Complete a tabela. Regras: o e-mail não pode se repetir; o salário precisa ser maior que zero; o setor, quando não informado, é "geral".',
    template: `CREATE TABLE funcionarios (
  id      integer PRIMARY KEY,
  email   text NOT NULL [[0]],
  salario numeric(10,2) NOT NULL [[1]] (salario > 0),
  setor   text NOT NULL [[2]] 'geral'
);`,
    blanks: [
      { accept: ['UNIQUE'], width: 7 },
      { accept: ['CHECK'], width: 6 },
      { accept: ['DEFAULT'], width: 8 },
    ],
    hints: [
      'Conceito: cada regra do negócio corresponde a uma constraint.',
      'Raciocínio: "não pode se repetir", "precisa ser maior que zero" e "quando não informado".',
      'Estrutura: UNIQUE, CHECK e DEFAULT.',
    ],
    solution: {
      code: `CREATE TABLE funcionarios (
  id      integer PRIMARY KEY,
  email   text NOT NULL UNIQUE,
  salario numeric(10,2) NOT NULL CHECK (salario > 0),
  setor   text NOT NULL DEFAULT 'geral'
);`,
      explanation: 'UNIQUE impede e-mails repetidos, CHECK valida o salário e DEFAULT preenche o setor quando ele não vem no INSERT.',
    },
  },
  {
    id: 'ex-banco-14-independente',
    type: 'sql',
    task: 'create-schema',
    title: 'Avaliações de produtos',
    difficulty: 'intermediario',
    concepts: ['bd-constraints'],
    statement: 'Crie a tabela `avaliacoes`, em que clientes dão notas a produtos. Traduza cada regra do negócio em uma constraint.',
    requirements: [
      'Colunas: `id` (inteiro, PK), `produto` (texto, obrigatório), `cliente_email` (texto, obrigatório), `nota` (inteiro, obrigatório) e `comentario` (texto, opcional).',
      'A nota vai de 1 a 5.',
      'Cada cliente avalia cada produto **uma única vez** (mas pode avaliar vários produtos).',
    ],
    setup: '',
    starterCode: `CREATE TABLE avaliacoes (
  id            integer PRIMARY KEY,
  produto       text,
  cliente_email text,
  nota          integer,
  comentario    text
);`,
    tests: [
      {
        name: 'Faixa da nota',
        query: `${ACEITA}
SELECT pg_temp.aceita($$INSERT INTO avaliacoes VALUES (1, 'Caneca', 'ana@x.com', 5, 'Ótima')$$) AS nota_5,
       pg_temp.aceita($$INSERT INTO avaliacoes VALUES (2, 'Caneca', 'bia@x.com', 0, NULL)$$) AS nota_0,
       pg_temp.aceita($$INSERT INTO avaliacoes VALUES (3, 'Caneca', 'caio@x.com', 6, NULL)$$) AS nota_6`,
        expected: { columns: ['nota_5', 'nota_0', 'nota_6'], rows: [[true, false, false]] },
      },
      {
        name: 'Uma avaliação por cliente e produto',
        query: `${ACEITA}
SELECT pg_temp.aceita($$INSERT INTO avaliacoes VALUES (1, 'Caneca', 'ana@x.com', 4, NULL)$$) AS primeira,
       pg_temp.aceita($$INSERT INTO avaliacoes VALUES (2, 'Caneca', 'ana@x.com', 2, NULL)$$) AS repetida,
       pg_temp.aceita($$INSERT INTO avaliacoes VALUES (3, 'Moedor', 'ana@x.com', 5, NULL)$$) AS outro_produto,
       pg_temp.aceita($$INSERT INTO avaliacoes VALUES (4, 'Caneca', 'bia@x.com', 3, NULL)$$) AS outro_cliente`,
        expected: { columns: ['primeira', 'repetida', 'outro_produto', 'outro_cliente'], rows: [[true, false, true, true]] },
      },
      {
        name: 'Obrigatórios e opcionais',
        query: `${ACEITA}
SELECT pg_temp.aceita($$INSERT INTO avaliacoes VALUES (1, 'Caneca', 'ana@x.com', NULL, NULL)$$) AS sem_nota,
       pg_temp.aceita($$INSERT INTO avaliacoes VALUES (2, NULL, 'ana@x.com', 3, NULL)$$) AS sem_produto,
       pg_temp.aceita($$INSERT INTO avaliacoes VALUES (3, 'Caneca', NULL, 3, NULL)$$) AS sem_email,
       pg_temp.aceita($$INSERT INTO avaliacoes VALUES (4, 'Caneca', 'ana@x.com', 3, NULL)$$) AS sem_comentario`,
        expected: { rows: [[false, false, false, true]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: cada requisito vira uma constraint: NOT NULL, CHECK ou UNIQUE.',
      'Raciocínio: a unicidade não é do e-mail sozinho, e sim do par (produto, cliente_email). E o CHECK não barra NULL.',
      'Estrutura: `nota integer NOT NULL CHECK (nota BETWEEN 1 AND 5),` e, no fim, `UNIQUE (produto, cliente_email)`.',
    ],
    solution: {
      code: `CREATE TABLE avaliacoes (
  id            integer PRIMARY KEY,
  produto       text NOT NULL,
  cliente_email text NOT NULL,
  nota          integer NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario    text,
  UNIQUE (produto, cliente_email)
);`,
      explanation:
        'NOT NULL nas obrigatórias (inclusive nota, porque o CHECK sozinho deixaria passar NULL), CHECK para a faixa da nota e UNIQUE no par. O comentário fica sem restrição. Os testes tentam inserir dados válidos e inválidos e conferem o que o banco aceitou.',
    },
  },
];
