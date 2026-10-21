import type { Exercise, Lesson } from '../../../types/content';
import { PLATAFORMA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-13',
  trackId: 'sql',
  moduleId: 'sql-m4',
  title: 'HAVING, subconsultas e WITH',
  durationMin: 30,
  objectives: [
    'Filtrar grupos com HAVING.',
    'Usar subconsultas no WHERE com comparação, IN e EXISTS.',
    'Organizar consultas longas com WITH (CTE).',
  ],
  prerequisites: ['banco-12'],
  concepts: ['bd-subconsultas'],
  explanation: [
    { type: 'h', text: 'HAVING: o WHERE dos grupos' },
    {
      type: 'p',
      text: 'O WHERE filtra **linhas** antes do agrupamento. O **HAVING** filtra **grupos** depois dele, e por isso pode usar agregações: `GROUP BY p.nome HAVING count(*) > 2` mantém só os projetos com mais de duas tarefas.',
    },
    { type: 'h', text: 'Subconsultas' },
    {
      type: 'p',
      text: 'Uma **subconsulta** é um SELECT dentro de outro, entre parênteses. Ela permite perguntas em duas etapas:',
    },
    {
      type: 'list',
      items: [
        'Valor único: `WHERE horas_estimadas > (SELECT avg(horas_estimadas) FROM tarefas)` — tarefas acima da média.',
        'Lista: `WHERE id IN (SELECT autor_id FROM comentarios)` — usuários que já comentaram.',
        'Existência: `WHERE NOT EXISTS (SELECT 1 FROM tarefas t WHERE t.projeto_id = p.id)` — projetos sem tarefas. A subconsulta usa `p.id` da consulta de fora: é uma subconsulta **correlacionada**, avaliada para cada projeto.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'NOT IN e NULL',
      text: 'Se a subconsulta de um `NOT IN` devolver algum NULL, o resultado inteiro fica vazio (a comparação com NULL é desconhecida). Para "não existe", prefira `NOT EXISTS`.',
    },
    { type: 'h', text: 'WITH: dando nome a etapas' },
    {
      type: 'code',
      language: 'sql',
      code: `WITH abertas AS (
  SELECT * FROM tarefas WHERE status <> 'concluída'
)
SELECT projeto_id, count(*) FROM abertas GROUP BY projeto_id;`,
    },
    {
      type: 'p',
      text: 'Uma **CTE** (*common table expression*) é uma subconsulta com nome, escrita antes da consulta principal. Ela deixa consultas longas legíveis, de cima para baixo.',
    },
  ],
  analogy:
    'A subconsulta é como pedir a um colega um número antes de fazer sua conta: "me diga a média de horas" e, com a resposta, você separa as tarefas acima dela. O HAVING é a conferência no fim: "dos totais que você montou, só me mostre os maiores que 2".',
  example: {
    language: 'sql',
    setup: PLATAFORMA,
    code: `-- Projetos com mais de 2 tarefas
SELECT p.nome, count(*) AS tarefas
FROM projetos p
JOIN tarefas t ON t.projeto_id = p.id
GROUP BY p.nome
HAVING count(*) > 2
ORDER BY p.nome;

-- Tarefas acima da média de horas
SELECT titulo, horas_estimadas
FROM tarefas
WHERE horas_estimadas > (SELECT avg(horas_estimadas) FROM tarefas)
ORDER BY horas_estimadas DESC;`,
    lineByLine: [
      { line: 6, text: 'O HAVING mantém só os grupos com mais de 2 tarefas: a migração (2) sai.' },
      { line: 13, text: 'A subconsulta calcula a média (≈ 9,79 horas) e o WHERE compara cada tarefa com ela.' },
    ],
    output: ` nome               | tarefas
--------------------+---------
 App de entregas    | 3
 Site institucional | 3
(2 linhas)

 titulo                 | horas_estimadas
------------------------+-----------------
 Rastreamento do pedido | 20.0
 Script de migração     | 16.0
 Tela de login          | 12.0
(3 linhas)`,
  },
  commonErrors: [
    {
      title: 'HAVING sem necessidade',
      wrong: "SELECT status, count(*) FROM tarefas GROUP BY status HAVING status <> 'concluída';",
      why: 'Funciona, mas agrupa linhas que serão descartadas. Condições sobre colunas comuns pertencem ao WHERE.',
      fix: "`WHERE status <> 'concluída' GROUP BY status`",
    },
    {
      title: 'Subconsulta que devolve várias linhas com =',
      wrong: 'WHERE projeto_id = (SELECT id FROM projetos WHERE dono_id = 1)',
      why: 'A Ana é dona de dois projetos; com `=`, o banco reclama que a subconsulta devolveu mais de uma linha.',
      fix: 'Use `IN (SELECT ...)`.',
    },
    {
      title: 'NOT IN com NULL na lista',
      wrong: 'WHERE id NOT IN (SELECT responsavel_id FROM tarefas)',
      why: 'responsavel_id tem um NULL; o NOT IN fica desconhecido para todos e volta vazio.',
      fix: 'Use `NOT EXISTS (SELECT 1 FROM tarefas t WHERE t.responsavel_id = u.id)`.',
    },
  ],
  guidedExerciseId: 'ex-banco-13-guiado',
  independentExerciseId: 'ex-banco-13-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre WHERE e HAVING?', answer: 'WHERE filtra linhas antes do agrupamento; HAVING filtra grupos depois, e pode usar agregações.' },
    { question: 'O que é uma subconsulta correlacionada?', answer: 'Uma subconsulta que usa colunas da consulta de fora e, por isso, é avaliada para cada linha dela.' },
    { question: 'Por que preferir NOT EXISTS a NOT IN?', answer: 'Porque NOT IN dá resultado vazio se a lista tiver algum NULL; NOT EXISTS não tem esse problema.' },
  ],
  summary: [
    'HAVING filtra grupos e aceita agregações.',
    'Subconsultas: valor único (=, >), lista (IN) ou existência (EXISTS).',
    'Prefira NOT EXISTS a NOT IN.',
    'WITH dá nome a etapas e organiza consultas longas.',
  ],
  completionCriteria: ['Filtrar grupos com HAVING (exercício guiado).', 'Encontrar projetos sem tarefas concluídas (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-13-guiado',
    type: 'sql',
    task: 'write-query',
    title: 'Quem está sobrecarregado?',
    difficulty: 'basico',
    concepts: ['bd-subconsultas', 'bd-agregacao'],
    statement: 'Liste os responsáveis com **2 ou mais** tarefas (de qualquer status) e a quantidade de tarefas de cada um.',
    requirements: ['Colunas: `nome`, `tarefas`.'],
    setup: PLATAFORMA,
    starterCode: `SELECT u.nome, count(*) AS tarefas
FROM tarefas t
JOIN usuarios u ON u.id = t.responsavel_id
GROUP BY u.nome;`,
    tests: [
      { name: 'Responsáveis com 2+ tarefas', expected: { columns: ['nome', 'tarefas'], rows: [['Ana Souza', 3], ['Bruno Lima', 2]] } },
      {
        name: 'Com uma tarefa nova para a Carla',
        setup: "INSERT INTO tarefas VALUES (9, 4, 3, 'Roteiro de entrevistas', 'a fazer', 2, 3.0, '2026-03-08');",
        expected: { rows: [['Ana Souza', 3], ['Bruno Lima', 2], ['Carla Dias', 2]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: filtros sobre agregações (como count) vão no HAVING.',
      'Raciocínio: o HAVING vem depois do GROUP BY e usa a mesma agregação do SELECT.',
      'Estrutura: `GROUP BY u.nome HAVING count(*) >= 2`',
    ],
    solution: {
      code: `SELECT u.nome, count(*) AS tarefas
FROM tarefas t
JOIN usuarios u ON u.id = t.responsavel_id
GROUP BY u.nome
HAVING count(*) >= 2;`,
      explanation: 'O GROUP BY monta um grupo por pessoa e o HAVING descarta os grupos com menos de 2 linhas. Um WHERE não serviria, porque a contagem só existe depois do agrupamento.',
    },
  },
  {
    id: 'ex-banco-13-independente',
    type: 'sql',
    task: 'write-query',
    title: 'Projetos sem entregas',
    difficulty: 'intermediario',
    concepts: ['bd-subconsultas'],
    statement: 'Liste os projetos que **não têm nenhuma tarefa concluída** (inclusive os que não têm tarefa alguma).',
    requirements: ['Uma coluna: `nome` (do projeto).', "O status de tarefa concluída é exatamente 'concluída'."],
    setup: PLATAFORMA,
    starterCode: `SELECT p.nome
FROM projetos p;`,
    tests: [
      { name: 'Projetos sem tarefa concluída', expected: { columns: ['nome'], rows: [['Pesquisa de UX']] } },
      {
        name: 'Quando a migração reabre a única tarefa concluída',
        setup: "UPDATE tarefas SET status = 'em andamento' WHERE id = 7;",
        expected: { rows: [['Pesquisa de UX'], ['Migração do banco']] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: "não tem nenhuma" é um caso clássico de NOT EXISTS.',
      "Raciocínio: para cada projeto, a subconsulta procura uma tarefa daquele projeto com status 'concluída'.",
      "Estrutura: `WHERE NOT EXISTS (SELECT 1 FROM tarefas t WHERE t.projeto_id = p.id AND t.status = 'concluída')`",
    ],
    solution: {
      code: `SELECT p.nome
FROM projetos p
WHERE NOT EXISTS (
  SELECT 1
  FROM tarefas t
  WHERE t.projeto_id = p.id
    AND t.status = 'concluída'
);`,
      explanation:
        'A subconsulta é correlacionada: para cada projeto p, ela procura uma tarefa concluída dele. NOT EXISTS mantém os projetos para os quais nada foi encontrado — inclusive os que não têm tarefa nenhuma. Também dá para resolver com LEFT JOIN filtrando o status no ON.',
    },
  },
];
