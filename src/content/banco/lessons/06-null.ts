import type { Exercise, Lesson } from '../../../types/content';
import { CLIENTES } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-06',
  trackId: 'sql',
  moduleId: 'sql-m2',
  title: 'NULL: o valor ausente',
  durationMin: 20,
  objectives: [
    'Entender NULL como "valor desconhecido", e não como zero ou texto vazio.',
    'Filtrar com IS NULL e IS NOT NULL.',
    'Substituir NULL por um valor padrão com COALESCE.',
    'Prever o efeito de NULL em comparações e cálculos.',
  ],
  prerequisites: ['banco-05'],
  concepts: ['bd-null'],
  explanation: [
    {
      type: 'p',
      text: '`NULL` significa **ausência de valor**: o dado não foi informado ou não se aplica. Não é zero, não é texto vazio (`\'\'`) e não é falso. Um cliente sem e-mail tem `email` NULL; um cliente com e-mail `\'\'` informou um texto vazio — são coisas diferentes.',
    },
    { type: 'h', text: 'Comparar com NULL não dá verdadeiro' },
    {
      type: 'p',
      text: 'Como NULL é "desconhecido", qualquer comparação com ele também é desconhecida: `NULL = NULL`, `NULL <> \'Salvador\'` e `NULL > 3` resultam em **NULL**, e não em true. O WHERE só mantém linhas em que a condição é **true**, então essas linhas somem do resultado.',
    },
    {
      type: 'list',
      items: [
        '`WHERE email IS NULL`: linhas sem e-mail.',
        '`WHERE email IS NOT NULL`: linhas com e-mail.',
        '`WHERE email = NULL`: **nunca** encontra nada.',
        '`WHERE cidade <> \'Salvador\'`: **não** traz quem tem cidade NULL.',
      ],
    },
    { type: 'h', text: 'NULL em cálculos e COALESCE' },
    {
      type: 'p',
      text: 'Qualquer conta com NULL dá NULL: `10 + NULL` é NULL, e concatenar texto com NULL também. `COALESCE(a, b, c)` devolve o primeiro valor não nulo da lista — perfeito para valores padrão na exibição: `COALESCE(telefone, \'não informado\')`.',
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'Para evitar NULL onde ele não faz sentido, declare a coluna `NOT NULL` (aula 2). Deixe anuláveis só as colunas que podem, de verdade, ficar sem valor.',
    },
  ],
  analogy:
    'NULL é como uma resposta em branco em um questionário. Se alguém deixou a idade em branco, você não pode afirmar que ela tem mais de 30, nem que tem menos: a resposta é "não sei".',
  example: {
    language: 'sql',
    setup: CLIENTES,
    code: `SELECT nome,
       COALESCE(email, '(sem e-mail)') AS contato
FROM clientes
WHERE cidade IS NULL;`,
    lineByLine: [
      { line: 2, text: 'Se o e-mail for NULL, mostra o texto "(sem e-mail)" no lugar.' },
      { line: 4, text: '`IS NULL` encontra os clientes sem cidade. `cidade = NULL` não encontraria nenhum.' },
    ],
    output: ` nome          | contato
---------------+-------------------
 Paula Freitas | paula@exemplo.com
 Sofia Mendes  | (sem e-mail)
(2 linhas)`,
  },
  commonErrors: [
    {
      title: 'Comparar com = NULL',
      wrong: 'WHERE email = NULL',
      why: 'A comparação resulta em NULL (desconhecido), nunca em true. A consulta volta vazia.',
      fix: '`WHERE email IS NULL`',
    },
    {
      title: 'Esquecer os NULL em uma negação',
      wrong: "WHERE cidade <> 'Salvador'  -- esperava incluir quem não tem cidade",
      why: 'Para quem tem cidade NULL, a comparação é desconhecida e a linha é descartada.',
      fix: "`WHERE cidade <> 'Salvador' OR cidade IS NULL`",
    },
    {
      title: 'Usar texto vazio como "sem valor"',
      wrong: "INSERT INTO clientes (id, nome, email) VALUES (9, 'Lia', '');",
      why: 'Agora há dois jeitos de dizer "sem e-mail" (NULL e \'\'), e as consultas precisam tratar os dois.',
      fix: 'Use NULL para ausência de valor e seja consistente.',
    },
  ],
  guidedExerciseId: 'ex-banco-06-guiado',
  independentExerciseId: 'ex-banco-06-independente',
  reviewQuestions: [
    { question: 'Quanto vale `NULL = NULL`?', answer: 'NULL (desconhecido), e não true. Por isso usamos IS NULL.' },
    { question: 'O que COALESCE(telefone, email, \'sem contato\') devolve para um cliente sem telefone, mas com e-mail?', answer: 'O e-mail: COALESCE devolve o primeiro valor não nulo da lista.' },
    { question: 'Quanto é `preco + NULL`?', answer: 'NULL. Qualquer operação aritmética com NULL resulta em NULL.' },
  ],
  summary: [
    'NULL é ausência de valor: não é 0, nem \'\', nem false.',
    'Comparações com NULL resultam em NULL; o WHERE descarta essas linhas.',
    'Use IS NULL e IS NOT NULL para testar.',
    'COALESCE devolve o primeiro valor não nulo.',
  ],
  completionCriteria: ['Corrigir uma consulta que compara com = NULL (exercício guiado).', 'Prever o efeito de NULL em uma negação (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-06-guiado',
    type: 'sql',
    task: 'fix-query',
    title: 'Clientes sem e-mail',
    difficulty: 'iniciante',
    concepts: ['bd-null'],
    statement:
      'O marketing quer ligar para os clientes que **não têm e-mail** cadastrado. A consulta abaixo deveria listá-los, mas volta vazia. Corrija.',
    requirements: ['Uma coluna: `nome`.'],
    setup: CLIENTES,
    starterCode: `SELECT nome
FROM clientes
WHERE email = NULL;`,
    tests: [
      { name: 'Clientes sem e-mail', expected: { columns: ['nome'], rows: [['Otávio Nunes'], ['Sofia Mendes']] } },
      {
        name: 'Com outro cliente sem e-mail',
        setup: "INSERT INTO clientes VALUES (6, 'Tiago Ramos', NULL, 'Natal', NULL);",
        expected: { rows: [['Otávio Nunes'], ['Sofia Mendes'], ['Tiago Ramos']] },
        hidden: true,
      },
    ],
    constraints: [{ kind: 'must-not-include', pattern: '=\\s*NULL', message: 'Comparar com = NULL nunca é verdadeiro. Use o operador próprio para NULL.' }],
    hints: [
      'Conceito: NULL não é igual a nada — nem a outro NULL.',
      'Raciocínio: existe um operador específico para perguntar "este valor está ausente?".',
      'Estrutura: `WHERE email IS NULL;`',
    ],
    solution: {
      code: `SELECT nome
FROM clientes
WHERE email IS NULL;`,
      explanation: '`email = NULL` resulta em NULL para todas as linhas, então nenhuma passa no WHERE. `IS NULL` é o teste correto de ausência de valor.',
    },
  },
  {
    id: 'ex-banco-06-independente',
    type: 'true-false',
    title: 'Quem não é de Salvador?',
    difficulty: 'basico',
    concepts: ['bd-null'],
    language: 'sql',
    statement: 'Na tabela `clientes`, Paula e Sofia têm `cidade` NULL. Avalie a afirmação e escolha a justificativa.',
    code: `SELECT nome
FROM clientes
WHERE cidade <> 'Salvador';`,
    claim: 'O resultado inclui Paula e Sofia, já que elas não são de Salvador.',
    answer: false,
    justifications: [
      { id: 'a', text: 'Para cidade NULL, a comparação resulta em NULL (desconhecido), e o WHERE só mantém linhas em que a condição é true.' },
      { id: 'b', text: 'O operador <> não funciona com textos no PostgreSQL.' },
      { id: 'c', text: 'NULL é tratado como texto vazio, que é diferente de Salvador, então elas aparecem.' },
      { id: 'd', text: 'O PostgreSQL ordena os NULL por último, então eles aparecem no fim.' },
    ],
    correctJustificationId: 'a',
    hints: [
      'Conceito: comparações com NULL não resultam em true nem em false.',
      'Raciocínio: o WHERE mantém a linha só quando a condição é exatamente true.',
      "Estrutura: para incluí-las, seria preciso `OR cidade IS NULL`.",
    ],
    solution: {
      explanation:
        "Falso. `NULL <> 'Salvador'` é desconhecido, então Paula e Sofia são descartadas. O resultado traz apenas Otávio (Fortaleza). Para incluí-las: `WHERE cidade <> 'Salvador' OR cidade IS NULL`.",
    },
  },
];
