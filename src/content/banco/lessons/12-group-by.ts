import type { Exercise, Lesson } from '../../../types/content';
import { PLATAFORMA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-12',
  trackId: 'sql',
  moduleId: 'sql-m4',
  title: 'Funções de agregação e GROUP BY',
  durationMin: 30,
  objectives: [
    'Resumir dados com COUNT, SUM, AVG, MIN e MAX.',
    'Agrupar linhas com GROUP BY e entender a regra das colunas do SELECT.',
    'Prever o efeito de NULL nas agregações.',
    'Combinar JOIN e GROUP BY em relatórios.',
  ],
  prerequisites: ['banco-11'],
  concepts: ['bd-agregacao'],
  explanation: [
    {
      type: 'p',
      text: 'Funções de **agregação** transformam muitas linhas em um único valor: quantas tarefas existem, quantas horas somam, qual a maior prioridade. Sem GROUP BY, a tabela inteira vira uma linha só.',
    },
    {
      type: 'list',
      items: [
        '`count(*)`: quantidade de linhas.',
        '`count(coluna)`: quantidade de valores **não nulos** da coluna. `count(DISTINCT coluna)` conta valores diferentes.',
        '`sum`, `avg`, `min`, `max`: soma, média, menor e maior — todas **ignoram NULL**.',
        '`round(avg(x), 2)`: arredonda a média para 2 casas.',
      ],
    },
    { type: 'h', text: 'GROUP BY: um resumo por grupo' },
    {
      type: 'p',
      text: '`GROUP BY status` separa as linhas em grupos com o mesmo status e calcula as agregações **para cada grupo**. O resultado tem uma linha por grupo.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A regra do GROUP BY',
      text: 'Toda coluna do SELECT precisa estar no GROUP BY ou dentro de uma agregação. `SELECT status, titulo, count(*) ... GROUP BY status` é erro (42803): o grupo "a fazer" tem dois títulos, e o banco não tem como escolher um.',
    },
    { type: 'h', text: 'Agregando com JOIN' },
    {
      type: 'p',
      text: 'Primeiro junte, depois agrupe: `FROM tarefas t JOIN projetos p ON ... GROUP BY p.nome`. A ordem lógica agora é FROM/JOIN → WHERE → GROUP BY → agregações → SELECT → ORDER BY → LIMIT. O WHERE filtra linhas **antes** de agrupar.',
    },
  ],
  analogy:
    'É como fechar o caixa de uma loja por vendedor: você separa os recibos em pilhas (GROUP BY vendedor) e, para cada pilha, conta os recibos (count) e soma os valores (sum). Cada pilha vira uma linha do relatório.',
  example: {
    language: 'sql',
    setup: PLATAFORMA,
    code: `SELECT status,
       count(*)               AS tarefas,
       count(horas_estimadas) AS com_estimativa,
       sum(horas_estimadas)   AS horas
FROM tarefas
GROUP BY status
ORDER BY tarefas DESC, status;`,
    lineByLine: [
      { line: 1, text: '`status` está no GROUP BY, então pode aparecer no SELECT.' },
      { line: 2, text: 'Quantas linhas há em cada grupo.' },
      { line: 3, text: 'Quantas têm estimativa: "Notificações push" está sem horas, por isso "a fazer" tem 2 tarefas e 1 estimativa.' },
      { line: 4, text: 'A soma ignora o NULL.' },
      { line: 7, text: 'Ordena pela quantidade e desempata pelo nome do status.' },
    ],
    output: ` status       | tarefas | com_estimativa | horas
--------------+---------+----------------+-------
 concluída    | 3       | 3              | 26.0
 em andamento | 3       | 3              | 41.0
 a fazer      | 2       | 1              | 1.5
(3 linhas)`,
  },
  commonErrors: [
    {
      title: 'Coluna fora do GROUP BY',
      wrong: 'SELECT status, titulo, count(*) FROM tarefas GROUP BY status;',
      why: 'Cada grupo tem vários títulos; o banco não sabe qual mostrar (erro 42803).',
      fix: 'Inclua a coluna no GROUP BY ou agregue-a (ex.: `max(titulo)`), ou remova-a.',
    },
    {
      title: 'count(coluna) quando queria contar linhas',
      wrong: 'SELECT count(horas_estimadas) FROM tarefas;  -- "quantas tarefas?"',
      why: 'count(coluna) ignora os NULL: devolve 7, e não 8.',
      fix: 'Para contar linhas, `count(*)`.',
    },
    {
      title: 'Filtrar agregação no WHERE',
      wrong: 'SELECT status, count(*) FROM tarefas WHERE count(*) > 2 GROUP BY status;',
      why: 'O WHERE acontece antes do agrupamento; as contagens ainda não existem.',
      fix: 'Filtros sobre agregações vão no HAVING (próxima aula).',
    },
  ],
  guidedExerciseId: 'ex-banco-12-guiado',
  independentExerciseId: 'ex-banco-12-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre count(*) e count(email)?', answer: 'count(*) conta linhas; count(email) conta apenas as linhas em que email não é NULL.' },
    { question: 'A média de (10, NULL, 20) é quanto?', answer: '15: avg ignora o NULL e divide 30 por 2.' },
    { question: 'Em que momento o WHERE é aplicado em relação ao GROUP BY?', answer: 'Antes: o WHERE escolhe as linhas e só depois elas são agrupadas.' },
  ],
  summary: [
    'count, sum, avg, min e max resumem várias linhas.',
    'Agregações ignoram NULL; count(*) conta linhas.',
    'GROUP BY gera uma linha por grupo.',
    'Colunas do SELECT: no GROUP BY ou dentro de uma agregação.',
  ],
  completionCriteria: ['Contar tarefas por projeto (exercício guiado).', 'Montar o relatório de carga de trabalho por pessoa (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-12-guiado',
    type: 'sql',
    task: 'write-query',
    title: 'Tarefas por projeto',
    difficulty: 'basico',
    concepts: ['bd-agregacao', 'bd-join'],
    statement: 'Mostre quantas tarefas cada projeto tem. Projetos sem tarefas podem ficar de fora.',
    requirements: ['Colunas: `projeto` (nome do projeto) e `total_tarefas`.'],
    setup: PLATAFORMA,
    starterCode: `SELECT p.nome AS projeto, count(*) AS total_tarefas
FROM tarefas t
JOIN projetos p ON p.id = t.projeto_id;`,
    tests: [
      {
        name: 'Contagem por projeto',
        expected: { columns: ['projeto', 'total_tarefas'], rows: [['Site institucional', 3], ['App de entregas', 3], ['Migração do banco', 2]] },
      },
      {
        name: 'Com uma tarefa no projeto de UX',
        setup: "INSERT INTO tarefas VALUES (9, 4, 3, 'Roteiro de entrevistas', 'a fazer', 2, 3.0, '2026-03-08');",
        expected: { rows: [['Site institucional', 3], ['App de entregas', 3], ['Migração do banco', 2], ['Pesquisa de UX', 1]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: sem GROUP BY, count(*) junta todas as linhas em uma só — e o banco reclama de p.nome no SELECT.',
      'Raciocínio: você quer uma linha por projeto. Agrupe pela coluna que identifica o projeto no resultado.',
      'Estrutura: acrescente `GROUP BY p.nome` no fim.',
    ],
    solution: {
      code: `SELECT p.nome AS projeto, count(*) AS total_tarefas
FROM tarefas t
JOIN projetos p ON p.id = t.projeto_id
GROUP BY p.nome;`,
      explanation:
        'O JOIN traz o nome do projeto para cada tarefa; o GROUP BY separa as linhas por projeto e o count(*) conta cada grupo. Em sistemas reais, agrupe também por p.id (`GROUP BY p.id, p.nome`) para não juntar dois projetos com o mesmo nome.',
    },
  },
  {
    id: 'ex-banco-12-independente',
    type: 'sql',
    task: 'write-query',
    title: 'Carga de trabalho',
    difficulty: 'intermediario',
    concepts: ['bd-agregacao', 'bd-join', 'bd-null'],
    statement:
      'A gestora quer ver a carga de cada pessoa considerando apenas as tarefas **não concluídas**: quantas tarefas e quantas horas estimadas. Tarefas sem responsável ficam de fora.',
    requirements: [
      'Colunas: `responsavel` (nome), `tarefas` (quantidade) e `horas` (soma das horas estimadas).',
      'Ordene das mais horas para as menos; quem não tem nenhuma estimativa (horas NULL) vai **por último**.',
      'Em caso de empate nas horas, ordem alfabética do nome.',
    ],
    setup: PLATAFORMA,
    starterCode: `SELECT u.nome AS responsavel
FROM tarefas t
JOIN usuarios u ON u.id = t.responsavel_id;`,
    tests: [
      {
        name: 'Carga atual',
        ordered: true,
        expected: {
          columns: ['responsavel', 'tarefas', 'horas'],
          rows: [
            ['Bruno Lima', 1, '20.0'],
            ['Ana Souza', 1, '16.0'],
            ['Carla Dias', 1, '5.0'],
            ['Diego Rocha', 1, null],
          ],
        },
      },
      {
        name: 'Empate nas horas',
        setup: "INSERT INTO tarefas VALUES (9, 4, 1, 'Roteiro de entrevistas', 'a fazer', 2, 4.0, '2026-03-08');",
        ordered: true,
        expected: {
          rows: [
            ['Ana Souza', 2, '20.0'],
            ['Bruno Lima', 1, '20.0'],
            ['Carla Dias', 1, '5.0'],
            ['Diego Rocha', 1, null],
          ],
        },
        hidden: true,
      },
    ],
    hints: [
      "Conceito: o WHERE filtra as tarefas antes do agrupamento; o GROUP BY monta uma linha por pessoa.",
      'Raciocínio: em ordem decrescente, o PostgreSQL coloca NULL primeiro. Existe uma opção para mandar os NULL para o fim.',
      "Estrutura: `WHERE t.status <> 'concluída' GROUP BY u.nome ORDER BY horas DESC NULLS LAST, responsavel`",
    ],
    solution: {
      code: `SELECT u.nome AS responsavel,
       count(*) AS tarefas,
       sum(t.horas_estimadas) AS horas
FROM tarefas t
JOIN usuarios u ON u.id = t.responsavel_id
WHERE t.status <> 'concluída'
GROUP BY u.nome
ORDER BY horas DESC NULLS LAST, responsavel;`,
      explanation:
        'O WHERE tira as concluídas antes de agrupar. A soma de um grupo só com NULL é NULL (caso do Diego). `DESC NULLS LAST` coloca esse grupo no fim, e o segundo critério resolve o empate do teste oculto.',
    },
  },
];
