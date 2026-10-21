import type { Exercise, Lesson } from '../../../types/content';

const PEDIDOS_APP = `CREATE TABLE pedidos (
  id        uuid PRIMARY KEY,
  criado_em timestamptz NOT NULL,
  tags      text[] NOT NULL DEFAULT '{}',
  dados     jsonb NOT NULL
);

INSERT INTO pedidos (id, criado_em, tags, dados) VALUES
  ('a3f1c2d4-0000-4000-8000-000000000001', '2026-03-10 09:15:00-03', '{pix}',
   '{"cliente": {"nome": "Ana", "cidade": "Salvador"}, "total": 89.90, "canal": "app"}'),
  ('a3f1c2d4-0000-4000-8000-000000000002', '2026-03-10 23:40:00-03', '{cartao,primeira-compra}',
   '{"cliente": {"nome": "Bruno", "cidade": "Recife"}, "total": 159.00, "canal": "site"}'),
  ('a3f1c2d4-0000-4000-8000-000000000003', '2026-03-11 02:10:00+00', '{pix,cupom}',
   '{"cliente": {"nome": "Carla", "cidade": "Salvador"}, "total": 39.90, "canal": "app"}'),
  ('a3f1c2d4-0000-4000-8000-000000000004', '2026-03-11 14:05:00-03', '{boleto}',
   '{"cliente": {"nome": "Diego", "cidade": "Curitiba"}, "total": 24.90, "canal": "site"}');`;

export const lesson: Lesson = {
  id: 'banco-22',
  trackId: 'sql',
  moduleId: 'sql-m6',
  title: 'Tipos do PostgreSQL: UUID, timestamptz, JSONB e arrays',
  durationMin: 30,
  objectives: [
    'Usar UUID como chave e gerá-lo com gen_random_uuid().',
    'Guardar instantes com timestamptz e lidar com fusos horários.',
    'Ler e filtrar documentos JSONB com ->, ->> e @>.',
    'Usar arrays com ANY e @>, sabendo quando preferir uma tabela.',
  ],
  prerequisites: ['banco-21'],
  concepts: ['pg-tipos'],
  explanation: [
    { type: 'h', text: 'uuid' },
    {
      type: 'p',
      text: 'Um **UUID** é um identificador de 128 bits como `a3f1c2d4-...-000000000001`. Pode ser gerado em qualquer lugar sem consultar o banco e não revela quantos registros existem (ao contrário de ids sequenciais em URLs). `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` gera um automaticamente.',
    },
    { type: 'h', text: 'timestamptz' },
    {
      type: 'p',
      text: '`timestamptz` guarda um **instante** (internamente em UTC) e o exibe no fuso da sessão (`SET TimeZone`). `\'2026-03-11 02:10:00+00\'` e `\'2026-03-10 23:10:00-03\'` são o mesmo instante. Já `timestamp` (sem tz) guarda só "data e hora de relógio", sem saber de qual lugar — prefira `timestamptz` para eventos.',
    },
    {
      type: 'list',
      items: [
        '`now()`: o instante atual (do início da transação).',
        "`criado_em >= now() - interval '7 days'`: últimos 7 dias.",
        "`(criado_em AT TIME ZONE 'America/Sao_Paulo')::date`: a data no relógio de São Paulo.",
        "`date_trunc('month', criado_em)`: arredonda para o início do mês.",
      ],
    },
    { type: 'h', text: 'jsonb' },
    {
      type: 'p',
      text: '`jsonb` guarda documentos JSON em formato binário, com operadores e índices:',
    },
    {
      type: 'list',
      items: [
        "`dados->'cliente'`: o valor como JSON. `dados->>'canal'`: o valor como **texto**.",
        "`dados->'cliente'->>'nome'`: caminho aninhado.",
        "`(dados->>'total')::numeric`: converte para número antes de somar ou comparar.",
        '`dados @> \'{"canal": "app"}\'`: "o documento contém este pedaço?". Com um índice GIN, é rápido mesmo em tabelas grandes.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'JSONB não substitui colunas',
      text: 'Use JSONB para dados de forma variável (payloads de webhooks, configurações, atributos que mudam por categoria). Dados com estrutura conhecida e usados em filtros, JOINs e constraints merecem colunas próprias: só elas têm tipos, NOT NULL e chaves estrangeiras.',
    },
    { type: 'h', text: 'Arrays' },
    {
      type: 'p',
      text: "`tags text[]` guarda uma lista. `'pix' = ANY (tags)` testa se contém um valor; `tags @> '{pix,cupom}'` testa se contém todos. Arrays são práticos para etiquetas simples; quando os itens têm dados próprios ou precisam de chave estrangeira, use uma tabela (aula 9).",
    },
  ],
  analogy:
    'timestamptz é como anotar um horário com o fuso: "14h em Brasília" é inequívoco no mundo todo. JSONB é a pasta de "documentos diversos" do arquivo: ótima para o que não tem formulário próprio, péssima para guardar o que deveria estar nas fichas.',
  example: {
    language: 'sql',
    setup: PEDIDOS_APP,
    code: `SELECT criado_em,
       dados->'cliente'->>'nome' AS cliente,
       (dados->>'total')::numeric AS total,
       'pix' = ANY (tags) AS pagou_com_pix
FROM pedidos
WHERE dados @> '{"canal": "app"}'
ORDER BY criado_em;`,
    lineByLine: [
      { line: 1, text: 'O instante aparece no fuso da sessão (São Paulo). O terceiro pedido, gravado como 02:10 UTC, aparece como 23:10 do dia 10.' },
      { line: 2, text: 'Caminho no JSON: dados → cliente → nome, como texto.' },
      { line: 3, text: '->> devolve texto; a conversão para numeric permite somar e comparar.' },
      { line: 4, text: 'Testa se o array tags contém pix.' },
      { line: 6, text: '@> filtra os documentos que contêm canal = app.' },
    ],
    output: ` criado_em              | cliente | total | pagou_com_pix
------------------------+---------+-------+---------------
 2026-03-10 09:15:00-03 | Ana     | 89.90 | true
 2026-03-10 23:10:00-03 | Carla   | 39.90 | true
(2 linhas)`,
  },
  commonErrors: [
    {
      title: 'Comparar o valor JSON com texto',
      wrong: "WHERE dados->'canal' = 'app'",
      why: "-> devolve jsonb (o valor \"app\", com aspas); a comparação com o texto app falha.",
      fix: "Use ->> para texto: `WHERE dados->>'canal' = 'app'`, ou `dados @> '{\"canal\": \"app\"}'`.",
    },
    {
      title: 'Somar números de dentro do JSON sem converter',
      wrong: "SELECT sum(dados->>'total') FROM pedidos;",
      why: '->> devolve texto, e não existe soma de textos.',
      fix: "`sum((dados->>'total')::numeric)`",
    },
    {
      title: 'Usar timestamp sem fuso para eventos',
      wrong: 'criado_em timestamp DEFAULT now()',
      why: 'Servidores em fusos diferentes (ou o horário de verão) deixam os horários ambíguos.',
      fix: '`criado_em timestamptz NOT NULL DEFAULT now()`',
    },
  ],
  guidedExerciseId: 'ex-banco-22-guiado',
  independentExerciseId: 'ex-banco-22-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre -> e ->> no JSONB?', answer: '-> devolve o valor como jsonb; ->> devolve como texto.' },
    { question: 'O que timestamptz guarda?', answer: 'Um instante absoluto (internamente em UTC), exibido no fuso horário da sessão.' },
    { question: 'Quando preferir uma tabela a um array?', answer: 'Quando os itens têm dados próprios, precisam de chave estrangeira ou são consultados com frequência de forma independente.' },
  ],
  summary: [
    'uuid: identificador global; gen_random_uuid() gera um.',
    'timestamptz guarda instantes; exiba no fuso certo com AT TIME ZONE.',
    'jsonb: ->, ->> e @>; converta antes de calcular.',
    'Arrays: ANY e @>; tabelas para o que tem estrutura.',
  ],
  completionCriteria: ['Filtrar e extrair dados de documentos JSONB (exercício guiado).', 'Contar pedidos por dia no horário de Brasília (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-22-guiado',
    type: 'sql',
    task: 'write-query',
    title: 'Clientes de Salvador',
    difficulty: 'basico',
    concepts: ['pg-tipos'],
    statement: 'Os dados do cliente estão dentro do JSON `dados`. Liste o **nome** e o **total** dos pedidos de clientes da cidade **Salvador**.',
    requirements: ['Colunas: `cliente` (texto) e `total` (numeric).'],
    setup: PEDIDOS_APP,
    starterCode: `SELECT dados->'cliente' AS cliente, dados->'total' AS total
FROM pedidos;`,
    tests: [
      { name: 'Pedidos de Salvador', expected: { columns: ['cliente', 'total'], rows: [['Ana', '89.90'], ['Carla', '39.90']] } },
      {
        name: 'Com outro pedido de Salvador',
        setup: `INSERT INTO pedidos (id, criado_em, dados) VALUES
  ('a3f1c2d4-0000-4000-8000-000000000005', '2026-03-12 10:00:00-03', '{"cliente": {"nome": "Elisa", "cidade": "Salvador"}, "total": 12.50, "canal": "site"}');`,
        expected: { rows: [['Ana', '89.90'], ['Carla', '39.90'], ['Elisa', '12.50']] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: ->> devolve texto; para comparar ou exibir como número, converta com ::numeric.',
      "Raciocínio: a cidade está em dados → cliente → cidade. Filtre com ->> ou com @>.",
      "Estrutura: `SELECT dados->'cliente'->>'nome' AS cliente, (dados->>'total')::numeric AS total FROM pedidos WHERE dados->'cliente'->>'cidade' = 'Salvador';`",
    ],
    solution: {
      code: `SELECT dados->'cliente'->>'nome' AS cliente,
       (dados->>'total')::numeric AS total
FROM pedidos
WHERE dados @> '{"cliente": {"cidade": "Salvador"}}';`,
      explanation:
        "O caminho com ->> devolve o nome como texto, e o total é convertido para numeric (no JSON, 89.90 vira 89.90 como número exato). O @> com um JSON aninhado filtra por cidade; `dados->'cliente'->>'cidade' = 'Salvador'` também funciona.",
    },
  },
  {
    id: 'ex-banco-22-independente',
    type: 'sql',
    task: 'write-query',
    title: 'Pedidos por dia (horário de Brasília)',
    difficulty: 'intermediario',
    concepts: ['pg-tipos', 'bd-agregacao'],
    statement:
      'O financeiro fecha o caixa pelo horário de **Brasília** (`America/Sao_Paulo`). Conte os pedidos e some os totais **por dia**, nesse fuso. Atenção: um dos pedidos foi gravado em UTC, logo depois da meia-noite.',
    requirements: ['Colunas: `dia` (date), `pedidos` e `total`.', 'Ordenado por dia.', 'O resultado precisa ser o mesmo qualquer que seja o fuso da sessão.'],
    setup: PEDIDOS_APP,
    starterCode: `SELECT criado_em, (dados->>'total')::numeric AS total
FROM pedidos
ORDER BY criado_em;`,
    tests: [
      {
        name: 'Fechamento por dia',
        ordered: true,
        expected: { columns: ['dia', 'pedidos', 'total'], rows: [['2026-03-10', 3, '288.80'], ['2026-03-11', 1, '24.90']] },
      },
      {
        name: 'Com a sessão em UTC',
        setup: "SET TimeZone TO 'UTC';",
        ordered: true,
        expected: { rows: [['2026-03-10', 3, '288.80'], ['2026-03-11', 1, '24.90']] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: `AT TIME ZONE` converte um timestamptz para o relógio de um fuso específico.',
      "Raciocínio: converta para o horário de São Paulo e pegue só a data (::date). Depois agrupe por ela.",
      "Estrutura: `SELECT (criado_em AT TIME ZONE 'America/Sao_Paulo')::date AS dia, count(*) AS pedidos, sum((dados->>'total')::numeric) AS total FROM pedidos GROUP BY dia ORDER BY dia;`",
    ],
    solution: {
      code: `SELECT (criado_em AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
       count(*) AS pedidos,
       sum((dados->>'total')::numeric) AS total
FROM pedidos
GROUP BY dia
ORDER BY dia;`,
      explanation:
        'O pedido de 02:10 UTC do dia 11 é 23:10 do dia 10 em Brasília. `AT TIME ZONE` fixa o fuso, então o resultado não depende da configuração da sessão — o teste oculto troca o fuso para UTC, e um simples `criado_em::date` mudaria o fechamento.',
    },
  },
];
