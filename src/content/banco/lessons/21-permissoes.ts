import type { Exercise, Lesson } from '../../../types/content';
import { PLATAFORMA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-21',
  trackId: 'sql',
  moduleId: 'sql-m6',
  title: 'Bancos, schemas, roles e permissões',
  durationMin: 30,
  objectives: [
    'Situar banco, schema e tabela na hierarquia do PostgreSQL.',
    'Criar roles de login e de grupo.',
    'Conceder e revogar privilégios com GRANT e REVOKE.',
    'Aplicar o princípio do menor privilégio ao usuário da aplicação.',
  ],
  prerequisites: ['banco-20'],
  concepts: ['pg-permissoes'],
  explanation: [
    { type: 'h', text: 'A hierarquia' },
    {
      type: 'p',
      text: 'Um **servidor** (cluster) tem vários **bancos** (`loja`, `blog`), isolados entre si: uma conexão vê um banco por vez. Cada banco tem **schemas**, que são pastas de tabelas (`public` é o padrão). `vendas.pedidos` é a tabela pedidos do schema vendas. O `search_path` define em quais schemas o banco procura nomes sem prefixo.',
    },
    { type: 'h', text: 'Roles: usuários e grupos' },
    {
      type: 'p',
      text: 'No PostgreSQL, usuários e grupos são a mesma coisa: **roles**. Um role com `LOGIN` pode se conectar; um sem LOGIN funciona como grupo, que outros roles herdam.',
    },
    {
      type: 'code',
      language: 'sql',
      code: `CREATE ROLE leitura NOLOGIN;                    -- grupo
CREATE ROLE ana LOGIN PASSWORD 'troque-me';     -- usuária
GRANT leitura TO ana;                           -- ana herda as permissões de leitura`,
    },
    { type: 'h', text: 'GRANT e REVOKE' },
    {
      type: 'list',
      items: [
        '`GRANT SELECT ON pedidos TO leitura;` — leitura de uma tabela.',
        '`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app;` — escrita nas tabelas atuais do schema.',
        '`GRANT USAGE ON SCHEMA vendas TO leitura;` — permite **acessar** o schema (sem isso, nem as tabelas com SELECT ficam visíveis).',
        '`REVOKE DELETE ON pedidos FROM app;` — remove um privilégio.',
        '`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO leitura;` — vale também para tabelas criadas no futuro.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Menor privilégio',
      text: 'A aplicação **não** deve se conectar como `postgres` (superusuário) nem como dona das tabelas. Use um role só com SELECT/INSERT/UPDATE/DELETE nas tabelas de que precisa; as migrações (CREATE, ALTER, DROP) rodam com outro role. Se a aplicação for invadida, o estrago fica limitado.',
    },
  ],
  analogy:
    'Um prédio comercial: o servidor é o prédio, cada banco é uma empresa em um andar, os schemas são as salas e as tabelas, os armários. Roles são crachás: o da faxina abre as salas, mas não os armários; o do contador abre só o armário de notas fiscais, e só para ler.',
  example: {
    language: 'sql',
    setup: PLATAFORMA,
    code: `CREATE SCHEMA relatorios;
CREATE TABLE relatorios.horas_por_projeto AS
  SELECT projeto_id, sum(horas_estimadas) AS horas FROM tarefas GROUP BY projeto_id;

CREATE ROLE analista NOLOGIN;
GRANT USAGE ON SCHEMA relatorios TO analista;
GRANT SELECT ON relatorios.horas_por_projeto TO analista;

SET ROLE analista;
SELECT current_user, count(*) AS linhas FROM relatorios.horas_por_projeto;
RESET ROLE;

SELECT has_table_privilege('analista', 'relatorios.horas_por_projeto', 'SELECT') AS le_relatorio,
       has_table_privilege('analista', 'tarefas', 'SELECT') AS le_tarefas,
       has_table_privilege('analista', 'relatorios.horas_por_projeto', 'DELETE') AS apaga_relatorio;`,
    lineByLine: [
      { line: 1, text: 'Um schema separado para os relatórios.' },
      { line: 2, text: 'CREATE TABLE ... AS cria uma tabela a partir de uma consulta.' },
      { line: 6, text: 'Sem USAGE no schema, o analista nem enxerga as tabelas de dentro dele.' },
      { line: 9, text: 'SET ROLE passa a agir como o analista, para testar as permissões.' },
      { line: 13, text: '`has_table_privilege` confere privilégios sem precisar trocar de role.' },
    ],
    output: `CREATE executado.

SELECT executado.

CREATE executado.

GRANT executado.

GRANT executado.

SET executado.

 current_user | linhas
--------------+--------
 analista     | 3
(1 linha)

RESET executado.

 le_relatorio | le_tarefas | apaga_relatorio
--------------+------------+-----------------
 true         | false      | false
(1 linha)`,
  },
  commonErrors: [
    {
      title: 'A aplicação conectando como postgres',
      wrong: 'DATABASE_URL=postgresql://postgres:senha@db:5432/loja',
      why: 'Uma injeção de SQL ou um bug pode apagar tabelas, criar roles ou ler outros bancos.',
      fix: 'Crie um role `app` só com os privilégios necessários e use-o na aplicação.',
    },
    {
      title: 'GRANT na tabela, mas não no schema',
      wrong: 'GRANT SELECT ON vendas.pedidos TO leitura;  -- e mais nada',
      why: 'Sem USAGE no schema vendas, a leitura falha com "permission denied for schema vendas".',
      fix: '`GRANT USAGE ON SCHEMA vendas TO leitura;`',
    },
    {
      title: 'Esquecer as tabelas futuras',
      why: '`GRANT ... ON ALL TABLES` vale só para as tabelas que já existem; a próxima migração cria uma tabela sem permissão.',
      fix: 'Use também `ALTER DEFAULT PRIVILEGES`.',
    },
  ],
  guidedExerciseId: 'ex-banco-21-guiado',
  independentExerciseId: 'ex-banco-21-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre um role com LOGIN e um sem LOGIN?', answer: 'O com LOGIN pode se conectar (é um usuário); o sem LOGIN serve como grupo de permissões.' },
    { question: 'O que GRANT USAGE ON SCHEMA permite?', answer: 'Acessar objetos dentro do schema; os privilégios em cada tabela ainda precisam ser concedidos.' },
    { question: 'Por que a aplicação não deve ser dona das tabelas?', answer: 'Porque o dono pode alterar e apagar as tabelas; um invasor que controle a aplicação herdaria esse poder.' },
  ],
  summary: [
    'Servidor → bancos → schemas → tabelas.',
    'Roles são usuários (LOGIN) e grupos.',
    'GRANT e REVOKE controlam privilégios; USAGE libera o schema.',
    'A aplicação usa um role com o mínimo necessário.',
  ],
  completionCriteria: ['Escolher as permissões do usuário da aplicação (exercício guiado).', 'Criar um role de leitura com acesso a tabelas específicas (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-21-guiado',
    type: 'multiple-choice',
    title: 'O usuário da API',
    difficulty: 'basico',
    concepts: ['pg-permissoes'],
    statement: 'A API da plataforma lê e grava tarefas, projetos e comentários. As tabelas são criadas por migrações, rodadas no deploy. Como configurar o role `api`, usado pela aplicação?',
    options: [
      { id: 'a', text: 'Usar o role postgres, para nunca ter problema de permissão.', feedback: 'Superusuário na aplicação transforma qualquer bug em risco total.' },
      { id: 'b', text: 'Tornar o role api dono de todas as tabelas.', feedback: 'O dono pode alterar e apagar as tabelas; a API não precisa disso.' },
      {
        id: 'c',
        text: 'Role com LOGIN e apenas SELECT, INSERT, UPDATE e DELETE nas tabelas usadas; as migrações rodam com outro role, dono das tabelas.',
        feedback: 'Correto: menor privilégio. A API manipula dados, mas não muda a estrutura.',
      },
      { id: 'd', text: 'GRANT ALL ON ALL TABLES para o role api.', feedback: 'ALL inclui privilégios desnecessários, como TRUNCATE e REFERENCES.' },
    ],
    correctOptionId: 'c',
    hints: [
      'Conceito: menor privilégio — cada role recebe só o que precisa.',
      'Raciocínio: a API cria tabelas? Ou só lê e grava dados?',
      'Estrutura: separe o role que manipula dados do role que muda a estrutura.',
    ],
    solution: {
      explanation:
        'A API só precisa de comandos de dados (DML). Criar e alterar tabelas é papel das migrações, com outro role. Assim, mesmo uma falha grave na aplicação não consegue apagar tabelas ou mexer em permissões.',
    },
  },
  {
    id: 'ex-banco-21-independente',
    type: 'sql',
    task: 'create-schema',
    title: 'Acesso para o BI',
    difficulty: 'intermediario',
    concepts: ['pg-permissoes'],
    statement:
      'A equipe de BI vai montar painéis com os dados de **projetos** e **tarefas**. Crie o role `bi_leitura` (sem login, funcionando como grupo) e conceda a ele **somente leitura** nessas duas tabelas.',
    requirements: ['O role não pode ler usuarios nem comentarios.', 'O role não pode alterar nenhuma tabela.'],
    setup: PLATAFORMA,
    starterCode: `CREATE ROLE bi_leitura NOLOGIN;
GRANT ALL ON ALL TABLES IN SCHEMA public TO bi_leitura;`,
    tests: [
      {
        name: 'Lê projetos e tarefas',
        query: "SELECT has_table_privilege('bi_leitura', 'projetos', 'SELECT') AS projetos, has_table_privilege('bi_leitura', 'tarefas', 'SELECT') AS tarefas",
        expected: { columns: ['projetos', 'tarefas'], rows: [[true, true]] },
      },
      {
        name: 'Não lê usuários nem comentários',
        query: "SELECT has_table_privilege('bi_leitura', 'usuarios', 'SELECT') AS usuarios, has_table_privilege('bi_leitura', 'comentarios', 'SELECT') AS comentarios",
        expected: { columns: ['usuarios', 'comentarios'], rows: [[false, false]] },
      },
      {
        name: 'Não escreve em nada',
        query: `SELECT bool_or(has_table_privilege('bi_leitura', t, p)) AS alguma_escrita
FROM unnest(ARRAY['projetos', 'tarefas', 'usuarios', 'comentarios']) AS t,
     unnest(ARRAY['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) AS p`,
        expected: { rows: [[false]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: GRANT concede exatamente os privilégios listados, nas tabelas listadas.',
      'Raciocínio: ALL inclui escrita e ALL TABLES inclui usuarios e comentarios. Seja específico nas duas coisas.',
      'Estrutura: `GRANT SELECT ON projetos, tarefas TO bi_leitura;`',
    ],
    solution: {
      code: `CREATE ROLE bi_leitura NOLOGIN;
GRANT SELECT ON projetos, tarefas TO bi_leitura;`,
      explanation:
        'Só SELECT, e só nas duas tabelas. Depois, cada pessoa do BI recebe um role com LOGIN e `GRANT bi_leitura TO pessoa`, herdando exatamente essas permissões. Os testes usam `has_table_privilege` para conferir cada combinação.',
    },
  },
];
