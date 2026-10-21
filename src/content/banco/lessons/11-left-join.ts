import type { Exercise, Lesson } from '../../../types/content';
import { PLATAFORMA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-11',
  trackId: 'sql',
  moduleId: 'sql-m3',
  title: 'LEFT JOIN e as outras junções',
  durationMin: 25,
  objectives: [
    'Manter linhas sem par com LEFT JOIN.',
    'Encontrar registros "órfãos" com LEFT JOIN + IS NULL.',
    'Conhecer RIGHT JOIN, FULL JOIN e CROSS JOIN.',
    'Evitar o erro de filtrar a tabela da direita no WHERE.',
  ],
  prerequisites: ['banco-10'],
  concepts: ['bd-left-join'],
  explanation: [
    {
      type: 'p',
      text: 'O `LEFT JOIN` (ou `LEFT OUTER JOIN`) mantém **todas** as linhas da tabela da esquerda (a do FROM). Quando não há par na tabela da direita, as colunas dela aparecem como **NULL**.',
    },
    {
      type: 'code',
      language: 'sql',
      code: `SELECT p.nome, t.titulo
FROM projetos p
LEFT JOIN tarefas t ON t.projeto_id = p.id;
-- "Pesquisa de UX" aparece, com titulo NULL`,
    },
    { type: 'h', text: 'Quem não tem nenhum?' },
    {
      type: 'p',
      text: 'Para achar projetos sem tarefas, usuários sem pedidos e afins, faça o LEFT JOIN e mantenha só as linhas sem par: `WHERE t.id IS NULL`. Use uma coluna que nunca é nula quando o par existe — a PK é a escolha certa.',
    },
    { type: 'h', text: 'Cuidado com o WHERE na tabela da direita' },
    {
      type: 'p',
      text: '`LEFT JOIN tarefas t ON ... WHERE t.status = \'a fazer\'` descarta as linhas em que `t.status` é NULL, e o LEFT vira, na prática, um INNER. Se o filtro é sobre quais pares trazer, coloque-o no **ON**: `LEFT JOIN tarefas t ON t.projeto_id = p.id AND t.status = \'a fazer\'`.',
    },
    { type: 'h', text: 'Outras junções' },
    {
      type: 'list',
      items: [
        '`RIGHT JOIN`: o espelho do LEFT; mantém tudo da direita. Quase sempre é mais claro inverter as tabelas e usar LEFT.',
        '`FULL JOIN`: mantém tudo dos dois lados, com NULL onde faltar par. Útil para comparar listas.',
        '`CROSS JOIN`: todas as combinações possíveis (produto cartesiano), sem ON. Ex.: tamanhos × cores.',
      ],
    },
  ],
  analogy:
    'Uma lista de chamada (a tabela da esquerda) ao lado das provas entregues. O LEFT JOIN escreve a nota ao lado de cada nome; quem não entregou continua na lista, com a nota em branco. Filtrar quem está em branco mostra exatamente quem faltou.',
  example: {
    language: 'sql',
    setup: PLATAFORMA,
    code: `SELECT p.nome AS projeto, t.titulo
FROM projetos p
LEFT JOIN tarefas t ON t.projeto_id = p.id
WHERE p.id IN (3, 4)
ORDER BY p.id, t.id;`,
    lineByLine: [
      { line: 2, text: 'A tabela da esquerda: todos os projetos serão mantidos.' },
      { line: 3, text: 'Traz as tarefas de cada projeto, quando existirem.' },
      { line: 4, text: 'O filtro é sobre a tabela da esquerda, então não atrapalha o LEFT.' },
      { line: 5, text: 'O projeto 4 não tem tarefas: aparece uma vez, com titulo NULL.' },
    ],
    output: ` projeto           | titulo
-------------------+------------------------
 Migração do banco | Mapear tabelas antigas
 Migração do banco | Script de migração
 Pesquisa de UX    | NULL
(3 linhas)`,
  },
  commonErrors: [
    {
      title: 'Filtrar a tabela da direita no WHERE',
      wrong: "FROM projetos p\nLEFT JOIN tarefas t ON t.projeto_id = p.id\nWHERE t.status = 'a fazer'",
      why: 'Projetos sem tarefas têm t.status NULL e são descartados; o LEFT JOIN perde o efeito.',
      fix: "Mova a condição para o ON: `ON t.projeto_id = p.id AND t.status = 'a fazer'`.",
    },
    {
      title: 'Testar IS NULL em uma coluna que pode ser nula',
      wrong: 'LEFT JOIN tarefas t ON ... WHERE t.horas_estimadas IS NULL',
      why: 'Mistura projetos sem tarefa com tarefas que existem, mas não têm estimativa.',
      fix: 'Teste a chave primária da tabela da direita: `WHERE t.id IS NULL`.',
    },
    {
      title: 'Usar INNER quando faltam dados',
      why: 'Relatórios com INNER JOIN escondem silenciosamente tudo o que não tem par (tarefas sem responsável, clientes sem pedido).',
      fix: 'Pergunte: "posso perder linhas da tabela principal?". Se não, LEFT JOIN.',
    },
  ],
  guidedExerciseId: 'ex-banco-11-guiado',
  independentExerciseId: 'ex-banco-11-independente',
  reviewQuestions: [
    { question: 'O que aparece nas colunas da tabela da direita quando não há par em um LEFT JOIN?', answer: 'NULL.' },
    { question: 'Como encontrar usuários que nunca comentaram?', answer: '`FROM usuarios u LEFT JOIN comentarios c ON c.autor_id = u.id WHERE c.id IS NULL`.' },
    { question: 'Por que um filtro no WHERE pode transformar um LEFT JOIN em INNER?', answer: 'Porque, nas linhas sem par, as colunas da direita são NULL e a comparação não é verdadeira, então elas são descartadas.' },
  ],
  summary: [
    'LEFT JOIN mantém todas as linhas da esquerda; a direita vira NULL sem par.',
    'LEFT JOIN + WHERE pk_da_direita IS NULL encontra quem não tem par.',
    'Filtros sobre a tabela da direita vão no ON.',
    'RIGHT, FULL e CROSS existem; LEFT resolve a maioria dos casos.',
  ],
  completionCriteria: ['Encontrar usuários sem tarefas (exercício guiado).', 'Listar todas as tarefas, inclusive as sem responsável (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-11-guiado',
    type: 'sql',
    task: 'write-query',
    title: 'Quem está livre?',
    difficulty: 'basico',
    concepts: ['bd-left-join'],
    statement: 'Liste o **nome** dos usuários que não são responsáveis por **nenhuma** tarefa.',
    requirements: ['Uma coluna: `nome`.', 'Use LEFT JOIN.'],
    setup: PLATAFORMA,
    starterCode: `SELECT u.nome
FROM usuarios u
JOIN tarefas t ON t.responsavel_id = u.id;`,
    tests: [
      { name: 'Usuários sem tarefas', expected: { columns: ['nome'], rows: [['Elisa Prado']] } },
      {
        name: 'Com outro usuário novo',
        setup: "INSERT INTO usuarios VALUES (6, 'Fábio Reis', 'fabio@exemplo.com', 'Natal'); UPDATE tarefas SET responsavel_id = 1 WHERE id = 2;",
        expected: { rows: [['Elisa Prado'], ['Fábio Reis'], ['Carla Dias']] },
        hidden: true,
      },
    ],
    constraints: [{ kind: 'must-include', pattern: '\\bLEFT\\s+(OUTER\\s+)?JOIN\\b', message: 'Use LEFT JOIN para manter os usuários sem par.' }],
    hints: [
      'Conceito: o LEFT JOIN mantém todos os usuários, com as colunas de tarefas em NULL para quem não tem nenhuma.',
      'Raciocínio: depois do LEFT JOIN, quais linhas representam "sem tarefa"? Aquelas em que a PK da tarefa é NULL.',
      'Estrutura: `LEFT JOIN tarefas t ON t.responsavel_id = u.id WHERE t.id IS NULL`',
    ],
    solution: {
      code: `SELECT u.nome
FROM usuarios u
LEFT JOIN tarefas t ON t.responsavel_id = u.id
WHERE t.id IS NULL;`,
      explanation: 'Usuários com tarefas geram uma linha por tarefa, com t.id preenchido. Quem não tem nenhuma aparece uma vez, com t.id NULL — e é o que o WHERE mantém.',
    },
  },
  {
    id: 'ex-banco-11-independente',
    type: 'sql',
    task: 'fix-query',
    title: 'A tarefa que sumiu do relatório',
    difficulty: 'intermediario',
    concepts: ['bd-left-join', 'bd-null'],
    statement:
      'O relatório de tarefas deveria listar **todas** as tarefas com o nome do responsável, mas "Configurar domínio" não aparece. Corrija a consulta para mostrar todas, com o texto **sem responsável** quando não houver.',
    requirements: ['Colunas: `titulo`, `responsavel`.', 'Todas as tarefas, ordenadas pelo id.'],
    setup: PLATAFORMA,
    starterCode: `SELECT t.titulo, u.nome AS responsavel
FROM tarefas t
JOIN usuarios u ON u.id = t.responsavel_id
ORDER BY t.id;`,
    tests: [
      {
        name: 'Todas as tarefas',
        ordered: true,
        expected: {
          columns: ['titulo', 'responsavel'],
          rows: [
            ['Criar layout da home', 'Ana Souza'],
            ['Escrever textos da home', 'Carla Dias'],
            ['Configurar domínio', 'sem responsável'],
            ['Tela de login', 'Bruno Lima'],
            ['Rastreamento do pedido', 'Bruno Lima'],
            ['Notificações push', 'Diego Rocha'],
            ['Mapear tabelas antigas', 'Ana Souza'],
            ['Script de migração', 'Ana Souza'],
          ],
        },
      },
      {
        name: 'Outra tarefa sem responsável',
        setup: "INSERT INTO tarefas VALUES (9, 4, NULL, 'Recrutar participantes', 'a fazer', 2, 4.0, '2026-03-09');",
        ordered: true,
        expected: {
          rows: [
            ['Criar layout da home', 'Ana Souza'],
            ['Escrever textos da home', 'Carla Dias'],
            ['Configurar domínio', 'sem responsável'],
            ['Tela de login', 'Bruno Lima'],
            ['Rastreamento do pedido', 'Bruno Lima'],
            ['Notificações push', 'Diego Rocha'],
            ['Mapear tabelas antigas', 'Ana Souza'],
            ['Script de migração', 'Ana Souza'],
            ['Recrutar participantes', 'sem responsável'],
          ],
        },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: o INNER JOIN descarta a tarefa cujo responsavel_id é NULL.',
      'Raciocínio: troque para um JOIN que mantém todas as tarefas e trate o NULL na exibição.',
      "Estrutura: `LEFT JOIN usuarios u ...` e `COALESCE(u.nome, 'sem responsável') AS responsavel`.",
    ],
    solution: {
      code: `SELECT t.titulo, COALESCE(u.nome, 'sem responsável') AS responsavel
FROM tarefas t
LEFT JOIN usuarios u ON u.id = t.responsavel_id
ORDER BY t.id;`,
      explanation: 'Com LEFT JOIN, toda tarefa aparece; as sem responsável ficam com u.nome NULL, que o COALESCE troca pelo texto pedido.',
    },
  },
];
