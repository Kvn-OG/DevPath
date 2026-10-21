import type { Exercise, Lesson } from '../../../types/content';
import { PLATAFORMA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-16',
  trackId: 'sql',
  moduleId: 'sql-m5',
  title: 'Como os dados ficam no disco e o que é um índice',
  durationMin: 30,
  objectives: [
    'Descrever como o PostgreSQL guarda tabelas em páginas de 8 KB.',
    'Explicar a diferença entre ler a tabela inteira e usar um índice B-tree.',
    'Criar índices com CREATE INDEX, inclusive compostos.',
    'Avaliar quando um índice ajuda e quando só custa.',
  ],
  prerequisites: ['banco-15'],
  concepts: ['bd-indices'],
  explanation: [
    { type: 'h', text: 'Tabelas são arquivos de páginas' },
    {
      type: 'p',
      text: 'No disco, cada tabela é um arquivo dividido em **páginas** de 8 KB. Cada página guarda várias linhas, na ordem em que couberam — não em ordem de id nem de nome. Essa estrutura se chama *heap* (monte). Para responder `WHERE usuario = 42` sem nenhuma ajuda, o banco precisa ler **todas** as páginas e testar cada linha: é a **leitura sequencial** (*Seq Scan*).',
    },
    {
      type: 'p',
      text: 'Ler a memória é muito mais rápido que ler o disco, por isso o PostgreSQL mantém as páginas mais usadas em um cache (*shared buffers*). Ainda assim, percorrer milhões de linhas para achar dez é desperdício.',
    },
    { type: 'h', text: 'O índice B-tree' },
    {
      type: 'p',
      text: 'Um **índice** é uma estrutura à parte, ordenada pela coluna indexada, em que cada entrada aponta para a localização da linha na tabela. O tipo padrão, **B-tree**, é uma árvore baixa e larga: com poucos saltos (em geral 3 ou 4 páginas) encontra qualquer valor entre milhões. Ela também mantém os valores em ordem, então ajuda em `=`, `<`, `>`, `BETWEEN`, `ORDER BY` e `LIKE \'abc%\'`.',
    },
    {
      type: 'code',
      language: 'sql',
      code: `CREATE INDEX tarefas_responsavel_idx ON tarefas (responsavel_id);

-- Composto: serve para filtros por projeto, ou por projeto e status
CREATE INDEX tarefas_projeto_status_idx ON tarefas (projeto_id, status);`,
    },
    { type: 'h', text: 'Índices têm custo' },
    {
      type: 'list',
      items: [
        'Ocupam espaço em disco e em memória.',
        'Todo INSERT, UPDATE e DELETE precisa atualizar também cada índice da tabela: mais índices, escritas mais lentas.',
        'Só ajudam quando o filtro é **seletivo** (traz poucas linhas). Um índice em uma coluna com 2 ou 3 valores (`ativo`, `status`) raramente é usado.',
        'Em um índice composto, a ordem das colunas importa: `(projeto_id, status)` ajuda `WHERE projeto_id = 1`, mas não `WHERE status = \'a fazer\'` sozinho.',
        'Aplicar função na coluna desliga o índice comum: `WHERE lower(email) = ...` precisa de um índice em `lower(email)`.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'PK e UNIQUE já têm índice; FK não',
      text: 'O PostgreSQL cria índices automaticamente para PRIMARY KEY e UNIQUE, mas **não** para chaves estrangeiras. Colunas como `tarefas.responsavel_id`, usadas em JOINs e em `ON DELETE`, quase sempre merecem um índice criado por você.',
    },
  ],
  analogy:
    'A tabela é um livro e o índice é o índice remissivo no fim dele: em vez de folhear as 500 páginas procurando "chave estrangeira", você vai ao índice, em ordem alfabética, e ele diz "páginas 212 e 340". Mas cada edição nova do livro exige atualizar o índice também.',
  example: {
    language: 'sql',
    setup: PLATAFORMA,
    code: `-- 50 mil eventos de 1.000 usuários
CREATE TABLE eventos (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario integer NOT NULL,
  tipo    text NOT NULL
);

INSERT INTO eventos (usuario, tipo)
SELECT (n % 1000) + 1, CASE WHEN n % 3 = 0 THEN 'compra' ELSE 'visita' END
FROM generate_series(1, 50000) AS n;

CREATE INDEX eventos_usuario_idx ON eventos (usuario);

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'eventos'
ORDER BY indexname;`,
    lineByLine: [
      { line: 9, text: '`generate_series` gera os números de 1 a 50.000; cada um vira um evento.' },
      { line: 12, text: 'Cria um índice B-tree na coluna usuario.' },
      { line: 14, text: 'O catálogo `pg_indexes` lista os índices: o da PK foi criado automaticamente.' },
    ],
    output: `CREATE executado.

INSERT executado.

CREATE executado.

 indexname           | indexdef
---------------------+--------------------------------------------------------------------------
 eventos_pkey        | CREATE UNIQUE INDEX eventos_pkey ON public.eventos USING btree (id)
 eventos_usuario_idx | CREATE INDEX eventos_usuario_idx ON public.eventos USING btree (usuario)
(2 linhas)`,
  },
  commonErrors: [
    {
      title: 'Indexar tudo "por garantia"',
      why: 'Cada índice deixa as escritas mais lentas e ocupa espaço; muitos nunca são usados.',
      fix: 'Crie índices para consultas reais e frequentes, e confirme com EXPLAIN (próxima aula).',
    },
    {
      title: 'Esquecer o índice da chave estrangeira',
      wrong: 'responsavel_id integer REFERENCES usuarios (id)  -- e nenhum índice',
      why: 'JOINs por responsável e o DELETE de um usuário precisam varrer a tabela de tarefas inteira.',
      fix: '`CREATE INDEX ON tarefas (responsavel_id);`',
    },
    {
      title: 'Índice composto na ordem errada',
      wrong: "CREATE INDEX ON tarefas (status, projeto_id);  -- consultas filtram só por projeto_id",
      why: 'O índice é ordenado primeiro por status; filtrar só por projeto_id não aproveita a ordem.',
      fix: 'Coloque primeiro a coluna usada sozinha nos filtros: `(projeto_id, status)`.',
    },
  ],
  guidedExerciseId: 'ex-banco-16-guiado',
  independentExerciseId: 'ex-banco-16-independente',
  reviewQuestions: [
    { question: 'O que é um Seq Scan?', answer: 'A leitura de todas as páginas da tabela, testando cada linha contra o filtro.' },
    { question: 'Por que um índice deixa os INSERTs mais lentos?', answer: 'Porque cada linha nova também precisa ser inserida, em ordem, em cada índice da tabela.' },
    { question: 'O PostgreSQL cria índice para chaves estrangeiras?', answer: 'Não. Só para PRIMARY KEY e UNIQUE. Índices em FKs precisam ser criados manualmente.' },
  ],
  summary: [
    'Tabelas são arquivos de páginas de 8 KB, sem ordem.',
    'Sem índice, o banco lê tudo (Seq Scan).',
    'B-tree: estrutura ordenada que encontra valores com poucos saltos.',
    'Índices custam espaço e escrita; FKs não ganham índice automático.',
  ],
  completionCriteria: ['Criar o índice da chave estrangeira das tarefas (exercício guiado).', 'Avaliar afirmações sobre índices (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-16-guiado',
    type: 'sql',
    task: 'create-schema',
    title: 'O índice que faltava',
    difficulty: 'basico',
    concepts: ['bd-indices', 'bd-chaves'],
    statement:
      'A tela "Minhas tarefas" filtra por `tarefas.responsavel_id`, que é chave estrangeira — e por isso não tem índice automático. Crie um índice B-tree nessa coluna, chamado `tarefas_responsavel_idx`.',
    setup: PLATAFORMA,
    starterCode: `-- Crie o índice aqui
`,
    tests: [
      {
        name: 'O índice existe na coluna certa',
        query: "SELECT indexname, indexdef LIKE '%(responsavel_id)' AS na_coluna_certa FROM pg_indexes WHERE tablename = 'tarefas' AND indexname <> 'tarefas_pkey'",
        expected: { columns: ['indexname', 'na_coluna_certa'], rows: [['tarefas_responsavel_idx', true]] },
      },
      {
        name: 'É um B-tree',
        query: "SELECT indexdef LIKE '%USING btree%' AS btree FROM pg_indexes WHERE indexname = 'tarefas_responsavel_idx'",
        expected: { rows: [[true]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: `CREATE INDEX nome ON tabela (coluna);` cria um B-tree (o tipo padrão).',
      'Raciocínio: a tabela é tarefas e a coluna, responsavel_id.',
      'Estrutura: `CREATE INDEX tarefas_responsavel_idx ON tarefas (responsavel_id);`',
    ],
    solution: {
      code: 'CREATE INDEX tarefas_responsavel_idx ON tarefas (responsavel_id);',
      explanation: 'Sem USING, o PostgreSQL cria um B-tree. Com ele, filtros e JOINs por responsável passam a encontrar as linhas sem ler a tabela inteira.',
    },
  },
  {
    id: 'ex-banco-16-independente',
    type: 'multiple-choice',
    title: 'Mitos e verdades sobre índices',
    difficulty: 'intermediario',
    concepts: ['bd-indices'],
    statement: 'A tabela `pedidos` tem 5 milhões de linhas e índices em `id` (PK) e em `(cliente_id, criado_em)`. Qual afirmação é verdadeira?',
    options: [
      { id: 'a', text: 'Um índice na coluna `pago` (true/false) vai acelerar muito `WHERE pago = false`, que traz metade da tabela.', feedback: 'Pouco seletivo: com metade das linhas, ler a tabela inteira costuma ser mais barato que pular pelo índice.' },
      { id: 'b', text: 'O índice `(cliente_id, criado_em)` ajuda `WHERE cliente_id = 7 ORDER BY criado_em DESC`.', feedback: 'Isso: ele encontra o cliente 7 e já entrega os pedidos dele ordenados por data.' },
      { id: 'c', text: 'O índice `(cliente_id, criado_em)` ajuda tanto quanto um índice próprio em `WHERE criado_em > \'2026-01-01\'`.', feedback: 'A primeira coluna do índice é cliente_id; filtrar só pela segunda não aproveita a ordem.' },
      { id: 'd', text: 'Mais índices sempre deixam o banco mais rápido.', feedback: 'Cada índice deixa INSERT, UPDATE e DELETE mais lentos e ocupa espaço.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: um índice só ajuda filtros seletivos e aproveita as colunas da esquerda para a direita.',
      'Raciocínio: qual consulta filtra pela primeira coluna do índice e ordena pela segunda?',
      'Estrutura: o índice composto está ordenado por cliente e, dentro de cada cliente, por data.',
    ],
    solution: {
      explanation:
        'O índice composto está ordenado por cliente_id e, dentro de cada cliente, por criado_em: serve perfeitamente para "os pedidos do cliente 7, do mais recente para o mais antigo". Colunas pouco seletivas e filtros só pela segunda coluna não se beneficiam.',
    },
  },
];
