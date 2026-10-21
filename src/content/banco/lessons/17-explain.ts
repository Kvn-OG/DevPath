import type { Exercise, Lesson } from '../../../types/content';

/** 50 mil eventos de 1.000 usuários, já com estatísticas atualizadas. */
const EVENTOS = `CREATE TABLE eventos (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario integer NOT NULL,
  tipo    text NOT NULL
);

INSERT INTO eventos (usuario, tipo)
SELECT (n % 1000) + 1, CASE WHEN n % 3 = 0 THEN 'compra' ELSE 'visita' END
FROM generate_series(1, 50000) AS n;

ANALYZE eventos;`;

/** Função de teste: devolve o plano de uma consulta como texto. */
const PLANO = `CREATE OR REPLACE FUNCTION pg_temp.plano(consulta text) RETURNS text LANGUAGE plpgsql AS $fn$
DECLARE
  linha text;
  saida text := '';
BEGIN
  FOR linha IN EXECUTE 'EXPLAIN (COSTS OFF) ' || consulta LOOP
    saida := saida || linha || E'\\n';
  END LOOP;
  RETURN saida;
END
$fn$;`;

export const lesson: Lesson = {
  id: 'banco-17',
  trackId: 'sql',
  moduleId: 'sql-m5',
  title: 'Lendo planos de execução com EXPLAIN',
  durationMin: 30,
  objectives: [
    'Ver o plano que o PostgreSQL escolheu para uma consulta com EXPLAIN.',
    'Reconhecer Seq Scan, Index Scan, Bitmap Scan e os principais tipos de junção.',
    'Medir o tempo real com EXPLAIN ANALYZE e comparar estimativas com a realidade.',
    'Usar o plano para decidir se um índice resolve o problema.',
  ],
  prerequisites: ['banco-16'],
  concepts: ['bd-explain'],
  explanation: [
    {
      type: 'p',
      text: 'Antes de executar, o **planejador** compara várias formas de responder à consulta e escolhe a de menor custo estimado. `EXPLAIN` mostra esse plano sem executar a consulta. É a ferramenta principal para descobrir por que algo está lento.',
    },
    {
      type: 'code',
      language: 'sql',
      code: `EXPLAIN SELECT * FROM eventos WHERE usuario = 42;
--  Seq Scan on eventos  (cost=0.00..917.00 rows=50 width=14)
--    Filter: (usuario = 42)`,
    },
    {
      type: 'list',
      items: [
        '**Nó**: cada linha com um tipo de operação. Leia de dentro para fora: os nós mais indentados (marcados com `->`) rodam primeiro e entregam linhas para o de cima.',
        '`cost=0.00..917.00`: custo estimado para a primeira linha e para todas, em uma unidade interna. Serve para comparar planos, não é tempo.',
        '`rows=50`: quantas linhas o planejador **espera**. Estimativas muito erradas levam a planos ruins.',
        '`EXPLAIN (COSTS OFF)` esconde os números; usamos nesta aula para os exemplos ficarem estáveis.',
      ],
    },
    { type: 'h', text: 'Os nós mais comuns' },
    {
      type: 'list',
      items: [
        '**Seq Scan**: lê a tabela inteira. Normal em tabelas pequenas ou quando o filtro traz muitas linhas.',
        '**Index Scan**: percorre o índice e busca cada linha na tabela. Ótimo para poucas linhas.',
        '**Bitmap Index Scan + Bitmap Heap Scan**: marca no índice as páginas com resultados e depois lê só essas páginas, em ordem. Meio-termo para dezenas ou centenas de linhas.',
        '**Index Only Scan**: responde só com o índice, sem ir à tabela.',
        'Junções: **Nested Loop** (para cada linha de um lado, busca no outro), **Hash Join** (monta uma tabela hash de um lado) e **Merge Join** (junta dois lados já ordenados).',
      ],
    },
    { type: 'h', text: 'EXPLAIN ANALYZE' },
    {
      type: 'p',
      text: '`EXPLAIN ANALYZE` **executa** a consulta e mostra, ao lado da estimativa, o que aconteceu: `actual time`, `rows` reais e `loops`. Se o plano esperava 10 linhas e vieram 100 mil, as estatísticas estão desatualizadas: rode `ANALYZE tabela`. Cuidado: com UPDATE e DELETE, o ANALYZE executa de verdade — use dentro de `BEGIN ... ROLLBACK`.',
    },
  ],
  analogy:
    'O EXPLAIN é o roteiro que o GPS propõe antes de você sair: por qual avenida, quanto tempo deve levar. O EXPLAIN ANALYZE é o relatório depois da viagem, com o tempo real de cada trecho — e é a diferença entre os dois que mostra onde estava o congestionamento.',
  example: {
    language: 'sql',
    setup: EVENTOS,
    code: `EXPLAIN (COSTS OFF)
SELECT * FROM eventos WHERE usuario = 42;

CREATE INDEX eventos_usuario_idx ON eventos (usuario);

EXPLAIN (COSTS OFF)
SELECT * FROM eventos WHERE usuario = 42;

EXPLAIN (COSTS OFF)
SELECT * FROM eventos WHERE id = 42;`,
    lineByLine: [
      { line: 1, text: 'Sem índice em usuario, a única opção é ler a tabela toda e filtrar.' },
      { line: 4, text: 'Cria o índice.' },
      { line: 6, text: 'Agora o banco usa o índice para achar as cerca de 50 linhas do usuário 42 (Bitmap).' },
      { line: 9, text: 'Busca pela PK: um único registro, Index Scan direto.' },
    ],
    output: ` QUERY PLAN
--------------------------
 Seq Scan on eventos
   Filter: (usuario = 42)
(2 linhas)

CREATE executado.

 QUERY PLAN
------------------------------------------------
 Bitmap Heap Scan on eventos
   Recheck Cond: (usuario = 42)
   ->  Bitmap Index Scan on eventos_usuario_idx
         Index Cond: (usuario = 42)
(4 linhas)

 QUERY PLAN
------------------------------------------
 Index Scan using eventos_pkey on eventos
   Index Cond: (id = 42)
(2 linhas)`,
  },
  commonErrors: [
    {
      title: 'Achar que cost é tempo',
      why: 'O custo é uma estimativa relativa do planejador. Só o EXPLAIN ANALYZE mostra tempo de verdade.',
      fix: 'Compare custos entre planos; para medir, use EXPLAIN ANALYZE.',
    },
    {
      title: 'Testar desempenho em uma tabela de 10 linhas',
      why: 'Com poucas linhas, o Seq Scan é o plano mais barato e o índice nunca aparece — mesmo que em produção ele seja essencial.',
      fix: 'Teste com volume parecido com o real (generate_series ajuda).',
    },
    {
      title: 'EXPLAIN ANALYZE em um DELETE de produção',
      wrong: 'EXPLAIN ANALYZE DELETE FROM pedidos WHERE criado_em < now() - interval \'1 year\';',
      why: 'O ANALYZE executa o comando: os pedidos são apagados.',
      fix: 'BEGIN; EXPLAIN ANALYZE DELETE ...; ROLLBACK;',
    },
  ],
  guidedExerciseId: 'ex-banco-17-guiado',
  independentExerciseId: 'ex-banco-17-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre EXPLAIN e EXPLAIN ANALYZE?', answer: 'EXPLAIN mostra o plano estimado sem executar; EXPLAIN ANALYZE executa e mostra tempos e quantidades reais.' },
    { question: 'Em que ordem os nós de um plano são executados?', answer: 'De dentro para fora: os mais indentados produzem linhas para os nós acima deles.' },
    { question: 'O que indica uma diferença grande entre rows estimado e rows real?', answer: 'Estatísticas desatualizadas ou distribuição difícil de estimar; rode ANALYZE e reavalie.' },
  ],
  summary: [
    'EXPLAIN mostra o plano escolhido; leia de dentro para fora.',
    'Seq Scan lê tudo; Index Scan e Bitmap usam índices.',
    'cost é estimativa relativa; EXPLAIN ANALYZE mede o real.',
    'Teste com volume realista e mantenha as estatísticas em dia (ANALYZE).',
  ],
  completionCriteria: ['Interpretar um plano com Seq Scan (exercício guiado).', 'Fazer uma consulta deixar de ler a tabela inteira (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-17-guiado',
    type: 'multiple-choice',
    title: 'O relatório lento',
    difficulty: 'basico',
    concepts: ['bd-explain'],
    language: 'sql',
    statement: 'A consulta do histórico de um cliente demora 2 segundos. O EXPLAIN ANALYZE mostrou o plano abaixo. O que ele indica?',
    code: `EXPLAIN ANALYZE SELECT * FROM pedidos WHERE cliente_id = 7;

 Seq Scan on pedidos  (cost=0.00..95840.00 rows=48 width=52)
                      (actual time=0.031..1987.402 rows=51 loops=1)
   Filter: (cliente_id = 7)
   Rows Removed by Filter: 4999949`,
    options: [
      { id: 'a', text: 'As estatísticas estão erradas: o banco esperava 48 linhas e vieram 51.', feedback: 'A estimativa está ótima (48 × 51). O problema é outro.' },
      { id: 'b', text: 'O banco leu as 5 milhões de linhas para devolver 51; um índice em cliente_id resolveria.', feedback: 'Correto: Seq Scan descartando quase 5 milhões de linhas é o sinal clássico de índice faltando.' },
      { id: 'c', text: 'A consulta está certa: Seq Scan é sempre o plano mais rápido.', feedback: 'Para 51 de 5 milhões de linhas, um índice faria a busca em milissegundos.' },
      { id: 'd', text: 'O problema é o SELECT *; trocar por colunas específicas resolve.', feedback: 'Ajuda pouco: o tempo vai para ler e descartar milhões de linhas.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: Seq Scan lê a tabela inteira; "Rows Removed by Filter" diz quantas linhas foram lidas à toa.',
      'Raciocínio: compare as linhas devolvidas (51) com as descartadas.',
      'Estrutura: o que permite achar as linhas do cliente 7 sem ler todas?',
    ],
    solution: {
      explanation: 'O banco percorreu 5 milhões de linhas e descartou quase todas. `CREATE INDEX ON pedidos (cliente_id)` troca o Seq Scan por um Index ou Bitmap Scan, e o tempo cai de segundos para milissegundos.',
    },
  },
  {
    id: 'ex-banco-17-independente',
    type: 'sql',
    task: 'create-schema',
    title: 'Fora do Seq Scan',
    difficulty: 'intermediario',
    concepts: ['bd-explain', 'bd-indices'],
    statement:
      'A tela de compras roda `SELECT * FROM eventos WHERE usuario = 42 AND tipo = \'compra\'` o tempo todo, e o plano atual é um Seq Scan nos 50 mil eventos. Crie o índice que faz essa consulta deixar de ler a tabela inteira. Use EXPLAIN para conferir.',
    setup: EVENTOS,
    starterCode: `EXPLAIN (COSTS OFF)
SELECT * FROM eventos WHERE usuario = 42 AND tipo = 'compra';`,
    tests: [
      {
        name: 'A consulta usa um índice',
        query: `${PLANO}
SELECT pg_temp.plano($$SELECT * FROM eventos WHERE usuario = 42 AND tipo = 'compra'$$) NOT LIKE '%Seq Scan%' AS sem_seq_scan`,
        expected: { columns: ['sem_seq_scan'], rows: [[true]] },
      },
      {
        name: 'Vale para outros usuários',
        query: `${PLANO}
SELECT pg_temp.plano($$SELECT * FROM eventos WHERE usuario = 777 AND tipo = 'compra'$$) NOT LIKE '%Seq Scan%' AS sem_seq_scan`,
        expected: { rows: [[true]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: o índice precisa começar por uma coluna seletiva usada no filtro.',
      'Raciocínio: tipo tem só dois valores; usuario tem mil. Qual delas o índice deve ter primeiro?',
      'Estrutura: `CREATE INDEX ON eventos (usuario);` (ou `(usuario, tipo)`), e depois rode o EXPLAIN.',
    ],
    solution: {
      code: `CREATE INDEX eventos_usuario_tipo_idx ON eventos (usuario, tipo);

EXPLAIN (COSTS OFF)
SELECT * FROM eventos WHERE usuario = 42 AND tipo = 'compra';`,
      explanation:
        'Um índice começando por usuario reduz as 50 mil linhas para cerca de 50 do usuário. Incluir tipo como segunda coluna deixa o índice ainda mais preciso. Um índice só em tipo não resolveria: com metade das linhas em cada valor, o Seq Scan continua mais barato.',
    },
  },
];
