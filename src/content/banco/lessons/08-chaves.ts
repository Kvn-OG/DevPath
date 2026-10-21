import type { Exercise, Lesson } from '../../../types/content';
import { ACEITA, PLATAFORMA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-08',
  trackId: 'sql',
  moduleId: 'sql-m3',
  title: 'Chaves primárias e estrangeiras',
  durationMin: 25,
  objectives: [
    'Ligar tabelas com chaves estrangeiras (REFERENCES).',
    'Explicar a integridade referencial e o que o banco recusa.',
    'Escolher o comportamento ao apagar: RESTRICT, CASCADE ou SET NULL.',
    'Gerar IDs automaticamente com GENERATED ALWAYS AS IDENTITY.',
  ],
  prerequisites: ['banco-07'],
  concepts: ['bd-chaves'],
  explanation: [
    {
      type: 'p',
      text: 'Dados relacionados vivem em tabelas separadas: projetos em uma, tarefas em outra. A ligação é feita guardando, em cada tarefa, o **id do projeto** dela (`projeto_id`). Essa coluna é uma **chave estrangeira** (*foreign key*): um valor que aponta para a chave primária de outra tabela.',
    },
    {
      type: 'code',
      language: 'sql',
      code: `CREATE TABLE tarefas (
  id         integer PRIMARY KEY,
  projeto_id integer NOT NULL REFERENCES projetos (id),
  titulo     text NOT NULL
);`,
    },
    { type: 'h', text: 'Integridade referencial' },
    {
      type: 'p',
      text: 'Com `REFERENCES`, o banco garante que toda tarefa aponta para um projeto que **existe**. Ele recusa (erro 23503):',
    },
    {
      type: 'list',
      items: [
        'inserir ou atualizar uma tarefa com um `projeto_id` inexistente;',
        'apagar um projeto que ainda tem tarefas — a menos que você diga o que fazer com elas.',
      ],
    },
    { type: 'h', text: 'O que fazer ao apagar o "pai"' },
    {
      type: 'list',
      items: [
        '`ON DELETE RESTRICT` (ou o padrão, `NO ACTION`): recusa apagar o projeto enquanto houver tarefas.',
        '`ON DELETE CASCADE`: apaga as tarefas junto com o projeto. Bom para dados que não fazem sentido sozinhos (anexos de uma tarefa).',
        '`ON DELETE SET NULL`: mantém a tarefa e esvazia a referência. A coluna precisa aceitar NULL (ex.: `responsavel_id` quando o usuário sai).',
      ],
    },
    { type: 'h', text: 'IDs automáticos' },
    {
      type: 'p',
      text: 'Em vez de escolher cada id à mão, deixe o banco gerar: `id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY`. No INSERT, omita o id e use `RETURNING id` para saber qual foi gerado. (Em códigos antigos você verá `serial`, que faz algo parecido.)',
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'Chaves naturais (CPF, e-mail) parecem boas chaves primárias, mas mudam e às vezes se repetem. Prefira um id sem significado como PK e garanta a unicidade do e-mail com `UNIQUE`.',
    },
  ],
  analogy:
    'A chave estrangeira é como o número do pedido escrito em uma nota fiscal: a nota não repete os dados do pedido, só aponta para ele. O banco funciona como o fiscal que não deixa emitir nota para um pedido que não existe.',
  example: {
    language: 'sql',
    code: `CREATE TABLE categorias (
  id   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

CREATE TABLE posts (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo       text NOT NULL,
  categoria_id integer NOT NULL REFERENCES categorias (id) ON DELETE CASCADE
);

INSERT INTO categorias (nome) VALUES ('SQL'), ('Go') RETURNING id, nome;

INSERT INTO posts (titulo, categoria_id) VALUES
  ('Primeiros SELECTs', 1),
  ('JOIN sem medo', 1),
  ('Goroutines', 2);

DELETE FROM categorias WHERE nome = 'Go';

SELECT id, titulo, categoria_id FROM posts ORDER BY id;`,
    lineByLine: [
      { line: 2, text: 'O banco gera o id sozinho (1, 2, 3...).' },
      { line: 9, text: 'Cada post aponta para uma categoria existente; apagar a categoria apaga seus posts.' },
      { line: 12, text: 'Os ids não são informados; RETURNING mostra quais foram gerados.' },
      { line: 19, text: 'Apaga a categoria Go. Pelo CASCADE, o post "Goroutines" vai junto.' },
      { line: 21, text: 'Restam os dois posts da categoria SQL.' },
    ],
    output: `CREATE executado.

CREATE executado.

 id | nome
----+------
 1  | SQL
 2  | Go
(2 linhas)

INSERT executado.

DELETE executado.

 id | titulo            | categoria_id
----+-------------------+--------------
 1  | Primeiros SELECTs | 1
 2  | JOIN sem medo     | 1
(2 linhas)`,
  },
  commonErrors: [
    {
      title: 'Referência para um registro que não existe',
      wrong: "INSERT INTO tarefas (id, projeto_id, titulo) VALUES (9, 99, 'X');",
      why: 'Não há projeto 99. O banco recusa com "violates foreign key constraint" (23503).',
      fix: 'Crie o projeto antes, ou use um id existente.',
    },
    {
      title: 'Tipos diferentes entre FK e PK',
      wrong: 'projeto_id text REFERENCES projetos (id)  -- id é integer',
      why: 'A chave estrangeira precisa ter tipo compatível com a coluna referenciada.',
      fix: 'Use o mesmo tipo: `projeto_id integer`.',
    },
    {
      title: 'CASCADE em tudo',
      why: 'Apagar um usuário poderia apagar em cascata projetos, tarefas e comentários de outras pessoas.',
      fix: 'Use CASCADE só para dados que pertencem ao pai (anexos de uma tarefa). Para o resto, RESTRICT ou SET NULL.',
    },
  ],
  guidedExerciseId: 'ex-banco-08-guiado',
  independentExerciseId: 'ex-banco-08-independente',
  reviewQuestions: [
    { question: 'Em uma relação projeto → tarefas, em qual tabela fica a chave estrangeira?', answer: 'Em tarefas (`projeto_id`), o lado "muitos" da relação.' },
    { question: 'Qual a diferença entre ON DELETE CASCADE e ON DELETE SET NULL?', answer: 'CASCADE apaga as linhas filhas junto com a pai; SET NULL mantém as filhas e esvazia a referência.' },
    { question: 'Por que preferir um id gerado a um e-mail como chave primária?', answer: 'Porque e-mails mudam e podem ser reaproveitados; a PK deve ser estável. A unicidade do e-mail fica garantida por UNIQUE.' },
  ],
  summary: [
    'Chave estrangeira guarda o id de uma linha de outra tabela (REFERENCES).',
    'O banco recusa referências para linhas inexistentes.',
    'ON DELETE define o que acontece com os filhos: RESTRICT, CASCADE ou SET NULL.',
    'GENERATED ALWAYS AS IDENTITY gera ids automaticamente.',
  ],
  completionCriteria: ['Prever a reação do banco a uma referência inválida (exercício guiado).', 'Criar a tabela de anexos com chave estrangeira em cascata (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-08-guiado',
    type: 'multiple-choice',
    title: 'O projeto que não existe',
    difficulty: 'iniciante',
    concepts: ['bd-chaves'],
    language: 'sql',
    statement: 'Na plataforma, `tarefas.projeto_id` é `REFERENCES projetos (id)` e existem apenas os projetos 1 a 4. O que acontece com o comando abaixo?',
    code: `INSERT INTO tarefas (id, projeto_id, titulo, status, prioridade, criada_em)
VALUES (9, 99, 'Revisar contrato', 'a fazer', 2, '2026-03-10');`,
    options: [
      { id: 'a', text: 'A tarefa é inserida e o projeto 99 é criado automaticamente.', feedback: 'O banco nunca cria a linha referenciada por conta própria.' },
      { id: 'b', text: 'A tarefa é inserida com projeto_id NULL.', feedback: 'O banco não troca seu valor por NULL; ele recusa o comando inteiro.' },
      { id: 'c', text: 'O banco recusa o INSERT com um erro de chave estrangeira, e nada é gravado.', feedback: 'Correto: a integridade referencial impede apontar para um projeto inexistente.' },
      { id: 'd', text: 'A tarefa é inserida, mas não aparece nas consultas.', feedback: 'Não existe linha "invisível": ou ela é gravada, ou o comando falha.' },
    ],
    correctOptionId: 'c',
    hints: [
      'Conceito: REFERENCES exige que o valor exista na tabela referenciada.',
      'Raciocínio: existe algum projeto com id 99?',
      'Estrutura: a violação gera o erro 23503 (foreign key violation).',
    ],
    solution: {
      explanation: 'Como não há projeto 99, o INSERT viola a chave estrangeira e é recusado por inteiro (erro 23503). É exatamente para isso que a constraint existe.',
    },
  },
  {
    id: 'ex-banco-08-independente',
    type: 'sql',
    task: 'create-schema',
    title: 'Anexos das tarefas',
    difficulty: 'basico',
    concepts: ['bd-chaves'],
    statement: 'A plataforma vai permitir anexar arquivos às tarefas. Crie a tabela `anexos`.',
    requirements: [
      '`id`: inteiro, chave primária.',
      '`tarefa_id`: inteiro, obrigatório, referenciando `tarefas (id)`.',
      '`arquivo`: texto, obrigatório.',
      'Ao apagar uma tarefa, os anexos dela devem ser apagados junto.',
    ],
    setup: PLATAFORMA,
    starterCode: `CREATE TABLE anexos (
  id        integer PRIMARY KEY,
  tarefa_id integer,
  arquivo   text
);`,
    tests: [
      {
        name: 'Aceita tarefa existente e recusa inexistente',
        query: `${ACEITA}
SELECT pg_temp.aceita($$INSERT INTO anexos (id, tarefa_id, arquivo) VALUES (1, 1, 'layout.png')$$) AS tarefa_existente,
       pg_temp.aceita($$INSERT INTO anexos (id, tarefa_id, arquivo) VALUES (2, 999, 'x.png')$$) AS tarefa_inexistente`,
        expected: { columns: ['tarefa_existente', 'tarefa_inexistente'], rows: [[true, false]] },
      },
      {
        name: 'Apagar a tarefa apaga seus anexos',
        query: "INSERT INTO anexos (id, tarefa_id, arquivo) VALUES (1, 3, 'dns.txt');\nDELETE FROM tarefas WHERE id = 3;\nSELECT count(*) AS anexos_restantes FROM anexos",
        expected: { columns: ['anexos_restantes'], rows: [[0]] },
      },
      {
        name: 'tarefa_id e arquivo são obrigatórios',
        query: `${ACEITA}
SELECT pg_temp.aceita($$INSERT INTO anexos (id, tarefa_id, arquivo) VALUES (3, NULL, 'a.png')$$) AS sem_tarefa,
       pg_temp.aceita($$INSERT INTO anexos (id, tarefa_id, arquivo) VALUES (4, 1, NULL)$$) AS sem_arquivo`,
        expected: { rows: [[false, false]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: a chave estrangeira é declarada com `REFERENCES tabela (coluna)` e o comportamento ao apagar com `ON DELETE`.',
      'Raciocínio: os anexos não fazem sentido sem a tarefa, então o comportamento é CASCADE. "Obrigatório" é NOT NULL.',
      'Estrutura: `tarefa_id integer NOT NULL REFERENCES tarefas (id) ON DELETE CASCADE,`',
    ],
    solution: {
      code: `CREATE TABLE anexos (
  id        integer PRIMARY KEY,
  tarefa_id integer NOT NULL REFERENCES tarefas (id) ON DELETE CASCADE,
  arquivo   text NOT NULL
);`,
      explanation:
        'REFERENCES impede anexos de tarefas inexistentes; ON DELETE CASCADE apaga os anexos junto com a tarefa; NOT NULL torna as duas colunas obrigatórias. Os testes tentam inserir dados válidos e inválidos e conferem o que o banco aceitou.',
    },
  },
];
