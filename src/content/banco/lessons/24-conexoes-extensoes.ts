import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'banco-24',
  trackId: 'sql',
  moduleId: 'sql-m6',
  title: 'Conexões, pooling e extensões',
  durationMin: 25,
  objectives: [
    'Explicar por que cada conexão custa caro no PostgreSQL.',
    'Usar um pool de conexões na aplicação e um pooler (PgBouncer) quando necessário.',
    'Monitorar conexões com pg_stat_activity.',
    'Instalar e usar extensões como pg_trgm e pgcrypto.',
  ],
  prerequisites: ['banco-23'],
  concepts: ['pg-conexoes'],
  explanation: [
    { type: 'h', text: 'Cada conexão é um processo' },
    {
      type: 'p',
      text: 'Para cada conexão, o PostgreSQL cria um **processo** no servidor, que consome memória. Abrir uma conexão também leva tempo (rede, TLS, autenticação). Por isso há um limite, `max_connections` (100 por padrão), e passar dele gera o erro "sorry, too many clients already".',
    },
    { type: 'h', text: 'Pool na aplicação' },
    {
      type: 'p',
      text: 'Em vez de abrir e fechar uma conexão a cada requisição, a aplicação mantém um **pool**: um pequeno conjunto de conexões abertas e reaproveitadas. Bibliotecas como `pg` (Node.js), `pgx` (Go) e HikariCP (Java) fazem isso. Um pool de 10 a 20 conexões por instância costuma bastar; mais conexões não deixam o banco mais rápido, só disputam CPU e disco.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Serverless e muitas instâncias',
      text: 'Funções serverless (Vercel, Lambda) podem subir centenas de instâncias, cada uma com seu pool, e esgotar o banco. Nesses casos, coloque um **pooler** entre a aplicação e o banco — PgBouncer em modo *transaction*, ou o pooler do seu provedor (como o do Supabase) — e use um pool pequeno em cada instância.',
    },
    { type: 'h', text: 'Vendo quem está conectado' },
    {
      type: 'code',
      language: 'sql',
      code: `SELECT pid, usename, application_name, state, now() - query_start AS duracao, query
FROM pg_stat_activity
WHERE datname = 'loja'
ORDER BY duracao DESC NULLS LAST;`,
    },
    {
      type: 'p',
      text: "Conexões `idle in transaction` por muito tempo são um alerta (transação esquecida aberta, aula 18). `SELECT pg_cancel_backend(pid)` cancela a consulta; `pg_terminate_backend(pid)` derruba a conexão. Defina `application_name` na string de conexão para saber de onde cada uma vem.",
    },
    { type: 'h', text: 'Extensões' },
    {
      type: 'p',
      text: 'Extensões acrescentam tipos, funções e índices ao banco. Ative uma por banco com `CREATE EXTENSION`:',
    },
    {
      type: 'list',
      items: [
        '`pg_trgm`: busca por semelhança de texto (`similarity`, `%`) e índices para `ILIKE \'%termo%\'`.',
        '`pgcrypto`: funções de criptografia e hash, como `crypt()` para senhas.',
        '`unaccent`: remove acentos ("São" → "Sao") para buscas.',
        '`postgis` (geografia) e `pgvector` (vetores para IA) são instaladas no servidor e ativadas do mesmo jeito.',
      ],
    },
    {
      type: 'code',
      language: 'sql',
      code: `CREATE EXTENSION IF NOT EXISTS pg_trgm;
SELECT similarity('PostgreSQL', 'Postgres');  -- 0.6666667 (8 trigramas em comum de 12)
CREATE INDEX produtos_nome_trgm ON produtos USING gin (nome gin_trgm_ops);`,
    },
  ],
  analogy:
    'Conexões são como linhas de caixa em um banco (o de dinheiro): abrir um caixa novo para cada cliente é lento e caro. Um pool é ter alguns caixas sempre abertos e uma fila; um pooler como o PgBouncer é o gerente que organiza a fila de várias agências para os mesmos poucos caixas.',
  example: {
    language: 'shell',
    code: `# String de conexão com nome da aplicação e TLS obrigatório
export DATABASE_URL="postgresql://api:s3nh4@db.exemplo.com:5432/loja?sslmode=require&application_name=api"

# Quantas conexões cada aplicação mantém, e em que estado?
psql "$DATABASE_URL" -c "SELECT application_name, state, count(*)
FROM pg_stat_activity WHERE datname = 'loja'
GROUP BY 1, 2 ORDER BY 3 DESC;"`,
    lineByLine: [
      { line: 2, text: '`sslmode=require` exige conexão criptografada; `application_name` identifica a origem.' },
      { line: 5, text: 'Agrupa as conexões por aplicação e estado.' },
    ],
    output: ` application_name |        state        | count
------------------+---------------------+-------
 api              | idle                |    18
 api              | active              |     2
 worker           | idle in transaction |     1
 psql             | active              |     1
(4 rows)`,
  },
  commonErrors: [
    {
      title: 'Uma conexão nova por requisição',
      why: 'Cada requisição paga o custo de conectar e, sob carga, o banco chega ao limite de conexões.',
      fix: 'Crie o pool uma vez, no início da aplicação, e reaproveite-o em todas as requisições.',
    },
    {
      title: 'Aumentar max_connections para 2.000',
      why: 'Cada conexão é um processo com memória própria; o servidor passa a trocar de contexto e paginar memória, e tudo fica mais lento.',
      fix: 'Mantenha o limite moderado e use pool/pooler.',
    },
    {
      title: '"idle in transaction" eterno',
      why: 'Uma transação aberta e esquecida segura locks e impede a limpeza de versões antigas (VACUUM).',
      fix: 'Garanta COMMIT/ROLLBACK em todos os caminhos (inclusive de erro) e configure `idle_in_transaction_session_timeout`.',
    },
  ],
  guidedExerciseId: 'ex-banco-24-guiado',
  independentExerciseId: 'ex-banco-24-independente',
  reviewQuestions: [
    { question: 'Por que conexões são caras no PostgreSQL?', answer: 'Cada uma é um processo no servidor, com memória própria, e abri-la exige rede, TLS e autenticação.' },
    { question: 'O que é um pooler como o PgBouncer?', answer: 'Um intermediário que recebe muitas conexões de clientes e as multiplexa sobre poucas conexões reais com o banco.' },
    { question: 'Como ativar a extensão pg_trgm em um banco?', answer: '`CREATE EXTENSION IF NOT EXISTS pg_trgm;` (a extensão precisa estar instalada no servidor).' },
  ],
  summary: [
    'Cada conexão é um processo: há limite e custo.',
    'Use um pool na aplicação; em serverless, um pooler.',
    'pg_stat_activity mostra quem está conectado e o que está fazendo.',
    'Extensões (pg_trgm, pgcrypto, unaccent) ampliam o banco com CREATE EXTENSION.',
  ],
  completionCriteria: ['Escolher a estratégia de conexão de uma API (exercício guiado).', 'Diagnosticar "too many clients" em uma aplicação serverless (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-24-guiado',
    type: 'multiple-choice',
    title: 'Onde abrir a conexão?',
    difficulty: 'basico',
    concepts: ['pg-conexoes'],
    statement: 'Uma API Node.js recebe 200 requisições por segundo, todas com uma ou duas consultas rápidas. Qual estratégia de conexão usar?',
    options: [
      { id: 'a', text: 'Abrir uma conexão no início de cada requisição e fechá-la no fim.', feedback: 'O custo de conectar a cada requisição domina o tempo e pressiona o limite do banco.' },
      { id: 'b', text: 'Criar um pool (ex.: 10 conexões) quando a aplicação sobe e pegar uma conexão emprestada a cada consulta.', feedback: 'Correto: as conexões são reaproveitadas e o número fica sob controle.' },
      { id: 'c', text: 'Abrir 200 conexões, uma por requisição simultânea possível.', feedback: 'Mais conexões que o necessário só disputam recursos; consultas rápidas cabem em um pool pequeno.' },
      { id: 'd', text: 'Usar uma única conexão global para todas as requisições, sem pool.', feedback: 'As consultas ficariam em fila em uma única conexão, e uma transação de uma requisição se misturaria com outras.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: conectar é caro; reaproveitar é barato.',
      'Raciocínio: consultas rápidas liberam a conexão em milissegundos — poucas conexões atendem muitas requisições.',
      'Estrutura: um conjunto fixo de conexões, criado uma vez.',
    ],
    solution: { explanation: 'Com um pool, cada consulta pega uma conexão já aberta e a devolve ao terminar. Dez conexões ocupadas por 5 ms atendem milhares de consultas por segundo.' },
  },
  {
    id: 'ex-banco-24-independente',
    type: 'multiple-choice',
    title: '"Too many clients" na Vercel',
    difficulty: 'intermediario',
    concepts: ['pg-conexoes'],
    statement:
      'Uma API em funções serverless usa um pool de 10 conexões por instância. Em um pico de acesso, a plataforma subiu 40 instâncias e o banco começou a recusar conexões com "sorry, too many clients already" (max_connections = 100). O que resolve de forma sustentável?',
    options: [
      { id: 'a', text: 'Subir max_connections para 1.000.', feedback: 'O banco aceitaria, mas centenas de processos disputando o servidor deixam tudo mais lento.' },
      {
        id: 'b',
        text: 'Colocar um pooler (PgBouncer em modo transaction, ou o pooler do provedor) entre as funções e o banco, e reduzir o pool de cada instância para 1 ou 2 conexões.',
        feedback: 'Correto: o pooler multiplexa muitas conexões de clientes em poucas conexões reais.',
      },
      { id: 'c', text: 'Desligar o pool e abrir uma conexão por requisição.', feedback: 'Aumenta o número de conexões abertas e o custo de cada requisição.' },
      { id: 'd', text: 'Criar um índice em todas as tabelas.', feedback: 'O problema é o número de conexões, não a velocidade das consultas.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: 40 instâncias × 10 conexões = 400 conexões, para um limite de 100.',
      'Raciocínio: o número de instâncias não é controlado por você; o que pode ficar fixo é o número de conexões reais com o banco.',
      'Estrutura: um intermediário que reaproveita poucas conexões para muitos clientes.',
    ],
    solution: {
      explanation:
        'Cada instância serverless cria seu próprio pool, e o total cresce com o número de instâncias. Um pooler em modo transaction mantém, por exemplo, 20 conexões reais com o banco e as empresta, transação a transação, às centenas de clientes.',
    },
  },
];
