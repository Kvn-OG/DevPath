import type { Exercise, Lesson } from '../../../types/content';
import { PLATAFORMA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-10',
  trackId: 'sql',
  moduleId: 'sql-m3',
  title: 'JOIN: combinando tabelas',
  durationMin: 30,
  objectives: [
    'Combinar linhas de tabelas relacionadas com JOIN ... ON.',
    'Usar apelidos de tabela e qualificar colunas ambíguas.',
    'Encadear vários JOINs em uma consulta.',
    'Prever quais linhas um INNER JOIN descarta.',
  ],
  prerequisites: ['banco-09'],
  concepts: ['bd-join'],
  explanation: [
    {
      type: 'p',
      text: 'As chaves estrangeiras separam os dados em tabelas; o **JOIN** os junta de volta na consulta. Para cada tarefa, o banco procura o projeto cujo `id` é igual ao `projeto_id` da tarefa e monta uma linha com colunas das duas.',
    },
    {
      type: 'code',
      language: 'sql',
      code: `SELECT t.titulo, p.nome
FROM tarefas t
JOIN projetos p ON p.id = t.projeto_id;`,
    },
    {
      type: 'list',
      items: [
        '`tarefas t` dá o apelido `t` à tabela; daí em diante, `t.titulo` é a coluna titulo de tarefas.',
        '`ON` é a condição de junção: quase sempre "a FK de um lado é igual à PK do outro".',
        'Quando duas tabelas têm colunas com o mesmo nome (`id`, `nome`), qualifique: `p.nome`, `u.nome`. Sem prefixo, o banco reclama que a coluna é ambígua.',
        'Para usar a mesma coluna com nomes diferentes no resultado, use AS: `p.nome AS projeto`.',
      ],
    },
    { type: 'h', text: 'Vários JOINs' },
    {
      type: 'p',
      text: 'Cada JOIN acrescenta uma tabela. Para mostrar o comentário, a tarefa e o autor: `FROM comentarios c JOIN tarefas t ON t.id = c.tarefa_id JOIN usuarios u ON u.id = c.autor_id`. WHERE e ORDER BY vêm depois de todos os JOINs.',
    },
    { type: 'h', text: 'INNER JOIN descarta quem não tem par' },
    {
      type: 'p',
      text: '`JOIN` é abreviação de `INNER JOIN`: só ficam as combinações em que o ON é verdadeiro. A tarefa "Configurar domínio" não tem responsável (`responsavel_id` NULL), então some de um JOIN com usuários. Para mantê-la, você vai usar LEFT JOIN na próxima aula.',
    },
  ],
  analogy:
    'É como juntar duas pilhas de fichas por um número em comum: para cada ficha de tarefa, você procura na pilha de projetos a ficha com o número anotado e grampeia as duas. Fichas sem par ficam de fora do resultado.',
  example: {
    language: 'sql',
    setup: PLATAFORMA,
    code: `SELECT t.titulo, p.nome AS projeto, u.nome AS responsavel
FROM tarefas t
JOIN projetos p ON p.id = t.projeto_id
JOIN usuarios u ON u.id = t.responsavel_id
WHERE t.status <> 'concluída'
ORDER BY projeto, t.titulo;`,
    lineByLine: [
      { line: 1, text: 'Colunas de três tabelas; os apelidos com AS evitam duas colunas chamadas "nome".' },
      { line: 3, text: 'Cada tarefa encontra o seu projeto.' },
      { line: 4, text: 'E o seu responsável. A tarefa sem responsável não tem par e sai do resultado.' },
      { line: 5, text: 'Só as tarefas não concluídas.' },
      { line: 6, text: 'ORDER BY pode usar o apelido `projeto` do SELECT.' },
    ],
    output: ` titulo                  | projeto            | responsavel
-------------------------+--------------------+-------------
 Notificações push       | App de entregas    | Diego Rocha
 Rastreamento do pedido  | App de entregas    | Bruno Lima
 Script de migração      | Migração do banco  | Ana Souza
 Escrever textos da home | Site institucional | Carla Dias
(4 linhas)`,
  },
  commonErrors: [
    {
      title: 'Coluna ambígua',
      wrong: 'SELECT nome FROM tarefas t JOIN usuarios u ON u.id = t.responsavel_id JOIN projetos p ON p.id = t.projeto_id;',
      why: 'Tanto usuarios quanto projetos têm coluna nome: "column reference is ambiguous" (42702).',
      fix: 'Qualifique: `u.nome` ou `p.nome`.',
    },
    {
      title: 'ON com as colunas erradas',
      wrong: 'JOIN projetos p ON p.id = t.id',
      why: 'Liga a tarefa 1 ao projeto 1 só porque os ids coincidem — o resultado parece certo e está errado.',
      fix: 'Ligue a FK à PK: `ON p.id = t.projeto_id`.',
    },
    {
      title: 'Esquecer o ON',
      wrong: 'SELECT * FROM tarefas, projetos;',
      why: 'Sem condição, cada tarefa é combinada com cada projeto (8 × 4 = 32 linhas): um produto cartesiano.',
      fix: 'Use `JOIN ... ON` com a condição da relação.',
    },
  ],
  guidedExerciseId: 'ex-banco-10-guiado',
  independentExerciseId: 'ex-banco-10-independente',
  reviewQuestions: [
    { question: 'O que o INNER JOIN faz com uma tarefa cujo responsavel_id é NULL?', answer: 'Descarta: NULL não é igual a nenhum id, então a tarefa não tem par em usuarios.' },
    { question: 'Por que usar apelidos de tabela?', answer: 'Para escrever menos e, principalmente, para qualificar colunas que existem em mais de uma tabela.' },
    { question: 'O que acontece se o JOIN não tiver condição?', answer: 'Cada linha de uma tabela é combinada com cada linha da outra (produto cartesiano).' },
  ],
  summary: [
    'JOIN ... ON combina linhas relacionadas, normalmente FK = PK.',
    'Apelidos (t, p, u) e prefixos evitam ambiguidade.',
    'Vários JOINs podem ser encadeados.',
    'INNER JOIN descarta linhas sem par.',
  ],
  completionCriteria: ['Listar as tarefas de uma pessoa pelo nome (exercício guiado).', 'Montar o feed de comentários com três tabelas (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-10-guiado',
    type: 'sql',
    task: 'write-query',
    title: 'As tarefas da Ana',
    difficulty: 'basico',
    concepts: ['bd-join'],
    statement: 'Liste as tarefas cuja responsável é a usuária **Ana Souza**, mostrando o título da tarefa e o nome da responsável.',
    requirements: ['Colunas: `titulo` e `responsavel` (o nome do usuário).', 'Filtre pelo nome "Ana Souza", não pelo id.'],
    setup: PLATAFORMA,
    starterCode: `SELECT t.titulo, u.nome AS responsavel
FROM tarefas t
-- junte com usuarios aqui
WHERE u.nome = 'Ana Souza';`,
    tests: [
      {
        name: 'Tarefas da Ana',
        expected: {
          columns: ['titulo', 'responsavel'],
          rows: [['Criar layout da home', 'Ana Souza'], ['Mapear tabelas antigas', 'Ana Souza'], ['Script de migração', 'Ana Souza']],
        },
      },
      {
        name: 'Com uma tarefa nova para a Ana',
        setup: "INSERT INTO tarefas VALUES (9, 4, 1, 'Roteiro de entrevistas', 'a fazer', 2, 3.0, '2026-03-08');",
        expected: {
          rows: [['Criar layout da home', 'Ana Souza'], ['Mapear tabelas antigas', 'Ana Souza'], ['Script de migração', 'Ana Souza'], ['Roteiro de entrevistas', 'Ana Souza']],
        },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: o nome do responsável está em usuarios; a tarefa guarda só o responsavel_id.',
      'Raciocínio: a condição de junção liga o id do usuário ao responsavel_id da tarefa.',
      'Estrutura: `JOIN usuarios u ON u.id = t.responsavel_id`',
    ],
    solution: {
      code: `SELECT t.titulo, u.nome AS responsavel
FROM tarefas t
JOIN usuarios u ON u.id = t.responsavel_id
WHERE u.nome = 'Ana Souza';`,
      explanation: 'O JOIN traz, para cada tarefa, a linha do usuário responsável. Depois, o WHERE filtra pelo nome. Sem o JOIN, a coluna `u.nome` não existiria na consulta.',
    },
  },
  {
    id: 'ex-banco-10-independente',
    type: 'sql',
    task: 'write-query',
    title: 'Feed de comentários',
    difficulty: 'intermediario',
    concepts: ['bd-join'],
    statement: 'Monte o feed de comentários da plataforma: para cada comentário, o **título da tarefa**, o **nome do autor** e o **texto**, na ordem em que foram feitos (pelo id do comentário).',
    requirements: ['Colunas, nesta ordem: `tarefa`, `autor`, `texto`.', 'Ordenado pelo id do comentário.'],
    setup: PLATAFORMA,
    starterCode: `SELECT c.texto
FROM comentarios c
ORDER BY c.id;`,
    tests: [
      {
        name: 'Feed completo',
        ordered: true,
        expected: {
          columns: ['tarefa', 'autor', 'texto'],
          rows: [
            ['Criar layout da home', 'Carla Dias', 'Layout aprovado pelo cliente.'],
            ['Escrever textos da home', 'Ana Souza', 'Falta a seção de depoimentos.'],
            ['Rastreamento do pedido', 'Diego Rocha', 'API de mapas definida.'],
            ['Rastreamento do pedido', 'Bruno Lima', 'Começando a integração.'],
            ['Script de migração', 'Carla Dias', 'Revisar tipos de data.'],
          ],
        },
      },
      {
        name: 'Com um comentário novo',
        setup: "INSERT INTO comentarios VALUES (6, 3, 5, 'Domínio comprado.');",
        ordered: true,
        expected: {
          rows: [
            ['Criar layout da home', 'Carla Dias', 'Layout aprovado pelo cliente.'],
            ['Escrever textos da home', 'Ana Souza', 'Falta a seção de depoimentos.'],
            ['Rastreamento do pedido', 'Diego Rocha', 'API de mapas definida.'],
            ['Rastreamento do pedido', 'Bruno Lima', 'Começando a integração.'],
            ['Script de migração', 'Carla Dias', 'Revisar tipos de data.'],
            ['Configurar domínio', 'Elisa Prado', 'Domínio comprado.'],
          ],
        },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: cada JOIN acrescenta uma tabela; aqui são três (comentarios, tarefas e usuarios).',
      'Raciocínio: o comentário guarda tarefa_id e autor_id. Cada um liga a uma tabela diferente.',
      'Estrutura: `JOIN tarefas t ON t.id = c.tarefa_id JOIN usuarios u ON u.id = c.autor_id`, com `t.titulo AS tarefa, u.nome AS autor`.',
    ],
    solution: {
      code: `SELECT t.titulo AS tarefa, u.nome AS autor, c.texto
FROM comentarios c
JOIN tarefas t ON t.id = c.tarefa_id
JOIN usuarios u ON u.id = c.autor_id
ORDER BY c.id;`,
      explanation:
        'Partimos dos comentários e trazemos a tarefa (pela FK tarefa_id) e o autor (pela FK autor_id). Os apelidos AS dão os nomes pedidos às colunas, e o ORDER BY usa o id do comentário mesmo sem exibi-lo.',
    },
  },
];
