import type { Exercise, Lesson } from '../../../types/content';
import { ACEITA, PLATAFORMA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-09',
  trackId: 'sql',
  moduleId: 'sql-m3',
  title: 'Relacionamentos 1:1, 1:N e N:N',
  durationMin: 25,
  objectives: [
    'Identificar a cardinalidade de um relacionamento a partir das regras do negócio.',
    'Modelar 1:N com uma chave estrangeira no lado "muitos".',
    'Modelar 1:1 com chave estrangeira UNIQUE.',
    'Modelar N:N com uma tabela associativa e chave primária composta.',
  ],
  prerequisites: ['banco-08'],
  concepts: ['bd-cardinalidade'],
  explanation: [
    {
      type: 'p',
      text: 'Antes de criar tabelas, pergunte para cada par de entidades: **um A tem quantos B? e um B tem quantos A?** A resposta é a **cardinalidade**, e ela decide onde ficam as chaves.',
    },
    { type: 'h', text: '1:N (um para muitos) — o mais comum' },
    {
      type: 'p',
      text: 'Um projeto tem muitas tarefas; uma tarefa pertence a um projeto. A chave estrangeira fica no lado **muitos**: `tarefas.projeto_id`. Nunca guarde uma lista de ids em uma coluna do projeto.',
    },
    { type: 'h', text: '1:1 (um para um)' },
    {
      type: 'p',
      text: 'Um usuário tem um perfil; um perfil é de um usuário. Use uma chave estrangeira com `UNIQUE` (ou faça a própria PK do perfil ser a FK): `usuario_id integer NOT NULL UNIQUE REFERENCES usuarios (id)`. O UNIQUE impede dois perfis para o mesmo usuário.',
    },
    { type: 'h', text: 'N:N (muitos para muitos)' },
    {
      type: 'p',
      text: 'Uma tarefa tem várias etiquetas, e uma etiqueta marca várias tarefas. Nenhuma das duas tabelas comporta a chave sozinha; cria-se uma **tabela associativa** com uma linha por par:',
    },
    {
      type: 'code',
      language: 'sql',
      code: `CREATE TABLE tarefa_etiquetas (
  tarefa_id   integer NOT NULL REFERENCES tarefas (id),
  etiqueta_id integer NOT NULL REFERENCES etiquetas (id),
  PRIMARY KEY (tarefa_id, etiqueta_id)
);`,
    },
    {
      type: 'p',
      text: 'A chave primária **composta** impede o mesmo par duas vezes. A tabela associativa também pode guardar dados do relacionamento: o `papel` de um membro em um projeto, a `quantidade` de um produto em um pedido.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Listas em uma coluna',
      text: 'Guardar `etiquetas = \'urgente,banco\'` em um texto parece prático, mas impede chaves estrangeiras, índices e consultas simples ("quais tarefas são urgentes?"). Uma linha por item, sempre.',
    },
  ],
  analogy:
    'Alunos e disciplinas: um aluno cursa várias disciplinas e uma disciplina tem vários alunos. A escola não escreve todos os alunos na ficha da disciplina nem todas as disciplinas na ficha do aluno: ela mantém a lista de matrículas, uma linha por par aluno–disciplina. Essa lista é a tabela associativa.',
  example: {
    language: 'sql',
    setup: PLATAFORMA,
    code: `CREATE TABLE etiquetas (
  id   integer PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

CREATE TABLE tarefa_etiquetas (
  tarefa_id   integer NOT NULL REFERENCES tarefas (id),
  etiqueta_id integer NOT NULL REFERENCES etiquetas (id),
  PRIMARY KEY (tarefa_id, etiqueta_id)
);

INSERT INTO etiquetas (id, nome) VALUES (1, 'urgente'), (2, 'front-end'), (3, 'banco');
INSERT INTO tarefa_etiquetas (tarefa_id, etiqueta_id) VALUES (1, 2), (2, 2), (5, 1), (8, 1), (8, 3);

-- A tarefa 8 tem duas etiquetas; a etiqueta 1 marca duas tarefas
SELECT tarefa_id, etiqueta_id FROM tarefa_etiquetas
WHERE tarefa_id = 8 OR etiqueta_id = 1
ORDER BY tarefa_id, etiqueta_id;`,
    lineByLine: [
      { line: 6, text: 'A tabela associativa liga tarefas e etiquetas.' },
      { line: 9, text: 'A PK composta impede repetir o mesmo par.' },
      { line: 13, text: 'Cada linha é um par tarefa–etiqueta.' },
      { line: 16, text: 'Para ver os nomes em vez dos ids, falta juntar as tabelas — o assunto da próxima aula.' },
    ],
    output: `CREATE executado.

CREATE executado.

INSERT executado.

INSERT executado.

 tarefa_id | etiqueta_id
-----------+-------------
 5         | 1
 8         | 1
 8         | 3
(3 linhas)`,
  },
  commonErrors: [
    {
      title: 'Chave estrangeira no lado errado',
      wrong: 'ALTER TABLE projetos ADD COLUMN tarefa_id integer;',
      why: 'Cada projeto teria espaço para uma única tarefa.',
      fix: 'Em 1:N, a FK fica no lado "muitos": `tarefas.projeto_id`.',
    },
    {
      title: 'N:N com colunas numeradas',
      wrong: 'etiqueta1_id integer, etiqueta2_id integer, etiqueta3_id integer',
      why: 'Limita a quantidade, deixa colunas vazias e complica as consultas.',
      fix: 'Use uma tabela associativa com uma linha por par.',
    },
    {
      title: 'Tabela associativa sem chave composta',
      why: 'Sem `PRIMARY KEY (tarefa_id, etiqueta_id)`, o mesmo par pode ser inserido várias vezes.',
      fix: 'Declare a chave primária composta (ou um UNIQUE no par).',
    },
  ],
  guidedExerciseId: 'ex-banco-09-guiado',
  independentExerciseId: 'ex-banco-09-independente',
  reviewQuestions: [
    { question: 'Como se modela um relacionamento 1:1?', answer: 'Com uma chave estrangeira que também é UNIQUE (ou a PK de uma tabela sendo a FK para a outra).' },
    { question: 'Por que um N:N precisa de uma terceira tabela?', answer: 'Porque nenhuma das duas tabelas consegue guardar vários ids em uma coluna de forma correta; a tabela associativa guarda uma linha por par.' },
    { question: 'Que tipo de dado pode morar na tabela associativa?', answer: 'Dados do relacionamento em si, como o papel de um membro em um projeto ou a quantidade de um item em um pedido.' },
  ],
  summary: [
    'Pergunte nos dois sentidos: um A tem quantos B, e um B tem quantos A.',
    '1:N: FK no lado muitos.',
    '1:1: FK com UNIQUE.',
    'N:N: tabela associativa com PK composta.',
  ],
  completionCriteria: ['Decidir onde fica a chave em um 1:N (exercício guiado).', 'Criar a tabela de membros de projetos, um N:N com dados próprios (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-09-guiado',
    type: 'multiple-choice',
    title: 'Clientes e pedidos',
    difficulty: 'iniciante',
    concepts: ['bd-cardinalidade'],
    statement: 'Em uma loja, um cliente pode fazer muitos pedidos, e cada pedido é de exatamente um cliente. Como modelar?',
    options: [
      { id: 'a', text: 'Coluna `pedidos_ids` (texto com os ids separados por vírgula) na tabela clientes.', feedback: 'Listas em uma coluna impedem chaves estrangeiras e consultas simples.' },
      { id: 'b', text: 'Coluna `cliente_id` em pedidos, com REFERENCES clientes (id).', feedback: 'Isso: é um 1:N, e a chave estrangeira fica no lado "muitos" (pedidos).' },
      { id: 'c', text: 'Coluna `pedido_id` em clientes, com REFERENCES pedidos (id).', feedback: 'Assim cada cliente só poderia ter um pedido.' },
      { id: 'd', text: 'Uma tabela associativa clientes_pedidos.', feedback: 'Tabela associativa é para N:N. Aqui cada pedido tem um único cliente.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: a cardinalidade aqui é 1:N.',
      'Raciocínio: qual lado tem "muitos"? A chave fica nele.',
      'Estrutura: em cada pedido, guarde o id do cliente.',
    ],
    solution: { explanation: 'Cliente 1 — N pedidos. Cada pedido guarda `cliente_id` apontando para clientes. Um cliente com 30 pedidos tem 30 linhas em pedidos apontando para ele.' },
  },
  {
    id: 'ex-banco-09-independente',
    type: 'sql',
    task: 'create-schema',
    title: 'Membros dos projetos',
    difficulty: 'intermediario',
    concepts: ['bd-cardinalidade', 'bd-chaves'],
    statement:
      'Um usuário pode participar de vários projetos, e um projeto tem vários usuários. Cada participação tem um **papel** (ex.: "dev", "design"). Crie a tabela `projeto_membros`.',
    requirements: [
      'Colunas: `projeto_id`, `usuario_id` (inteiros, obrigatórios, com chaves estrangeiras) e `papel` (texto obrigatório).',
      'O mesmo usuário não pode entrar duas vezes no mesmo projeto.',
    ],
    setup: PLATAFORMA,
    starterCode: `CREATE TABLE projeto_membros (
  projeto_id integer,
  usuario_id integer,
  papel      text
);`,
    tests: [
      {
        name: 'Aceita membros válidos e recusa repetidos',
        query: `${ACEITA}
SELECT pg_temp.aceita($$INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES (1, 2, 'dev')$$) AS novo_membro,
       pg_temp.aceita($$INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES (1, 2, 'qa')$$) AS repetido,
       pg_temp.aceita($$INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES (2, 2, 'design')$$) AS outro_projeto`,
        expected: { columns: ['novo_membro', 'repetido', 'outro_projeto'], rows: [[true, false, true]] },
      },
      {
        name: 'Recusa projeto ou usuário inexistentes',
        query: `${ACEITA}
SELECT pg_temp.aceita($$INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES (99, 1, 'dev')$$) AS projeto_99,
       pg_temp.aceita($$INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES (1, 99, 'dev')$$) AS usuario_99`,
        expected: { columns: ['projeto_99', 'usuario_99'], rows: [[false, false]] },
      },
      {
        name: 'Papel é obrigatório',
        query: `${ACEITA}
SELECT pg_temp.aceita($$INSERT INTO projeto_membros (projeto_id, usuario_id, papel) VALUES (3, 4, NULL)$$) AS sem_papel`,
        expected: { rows: [[false]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: N:N é uma tabela associativa com duas chaves estrangeiras.',
      'Raciocínio: "não pode entrar duas vezes" é uma chave primária composta pelo par (projeto_id, usuario_id).',
      'Estrutura: `projeto_id integer NOT NULL REFERENCES projetos (id), ... PRIMARY KEY (projeto_id, usuario_id)`',
    ],
    solution: {
      code: `CREATE TABLE projeto_membros (
  projeto_id integer NOT NULL REFERENCES projetos (id),
  usuario_id integer NOT NULL REFERENCES usuarios (id),
  papel      text NOT NULL,
  PRIMARY KEY (projeto_id, usuario_id)
);`,
      explanation:
        'Cada linha é uma participação. As chaves estrangeiras garantem que projeto e usuário existem; a PK composta impede o mesmo par duas vezes, mas permite o mesmo usuário em outro projeto. O papel é um dado do relacionamento e mora aqui.',
    },
  },
];
