import type { Exercise, Lesson } from '../../../types/content';
import { LOJA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-04',
  trackId: 'sql',
  moduleId: 'sql-m2',
  title: 'SELECT e WHERE: perguntando ao banco',
  durationMin: 25,
  objectives: [
    'Escolher colunas e criar colunas calculadas com SELECT e AS.',
    'Filtrar linhas com WHERE, operadores de comparação, AND, OR e NOT.',
    'Usar IN, BETWEEN e LIKE/ILIKE para filtros comuns.',
  ],
  prerequisites: ['banco-03'],
  concepts: ['bd-select'],
  explanation: [
    {
      type: 'p',
      text: 'Toda consulta de leitura segue o mesmo esqueleto. O banco primeiro pega as linhas da tabela (`FROM`), depois descarta as que não passam no filtro (`WHERE`) e por fim monta as colunas pedidas (`SELECT`).',
    },
    {
      type: 'code',
      language: 'sql',
      code: `SELECT coluna1, coluna2, expressao AS apelido
FROM tabela
WHERE condicao;`,
    },
    {
      type: 'list',
      items: [
        '`SELECT *` traz todas as colunas. É útil para explorar, mas em aplicações prefira listar as colunas que você usa.',
        'Colunas calculadas: `preco * estoque AS valor_em_estoque`. O `AS` dá nome à coluna do resultado.',
        'Textos ficam entre **aspas simples**: `\'Padaria\'`. Aspas duplas servem para *nomes* de colunas e tabelas.',
      ],
    },
    { type: 'h', text: 'Operadores do WHERE' },
    {
      type: 'list',
      items: [
        'Comparação: `=`, `<>` (diferente), `<`, `>`, `<=`, `>=`.',
        'Lógicos: `AND` (as duas), `OR` (pelo menos uma), `NOT` (inverte).',
        '`categoria IN (\'Padaria\', \'Mercearia\')`: igual a algum valor da lista.',
        '`preco BETWEEN 10 AND 50`: entre 10 e 50, **incluindo** os dois extremos.',
        '`nome LIKE \'Caf%\'`: `%` é qualquer sequência de caracteres e `_` é exatamente um. `ILIKE` ignora maiúsculas e minúsculas.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'AND vem antes de OR',
      text: 'Como na matemática, há precedência: `a OR b AND c` significa `a OR (b AND c)`. Quando misturar AND e OR, use parênteses sempre — ou use IN.',
    },
  ],
  analogy:
    'Consultar é como pedir a um atendente de arquivo: "da gaveta de produtos (FROM), separe só as fichas de utensílios abaixo de R$ 100 (WHERE) e me diga o nome e o preço de cada uma (SELECT)".',
  example: {
    language: 'sql',
    setup: LOJA,
    code: `SELECT nome, preco, estoque, preco * estoque AS valor_em_estoque
FROM produtos
WHERE categoria = 'Utensílios'
  AND preco < 100;`,
    lineByLine: [
      { line: 1, text: 'Três colunas da tabela e uma calculada, batizada com AS.' },
      { line: 2, text: 'Os dados vêm da tabela produtos.' },
      { line: 3, text: 'Só utensílios. O texto vai entre aspas simples e precisa ser igual, com acento.' },
      { line: 4, text: 'E (AND) com preço abaixo de 100. O moedor (159) e a garrafa (129,90) ficam de fora.' },
    ],
    output: ` nome               | preco | estoque | valor_em_estoque
--------------------+-------+---------+------------------
 Caneca de cerâmica | 39.90 | 12      | 478.80
 Filtro de papel    | 9.90  | 80      | 792.00
(2 linhas)`,
  },
  commonErrors: [
    {
      title: 'Aspas duplas em textos',
      wrong: 'WHERE categoria = "Padaria"',
      why: 'No PostgreSQL, aspas duplas indicam um nome de coluna. O banco procura uma coluna chamada Padaria e não encontra.',
      fix: "Use aspas simples para valores: `WHERE categoria = 'Padaria'`.",
    },
    {
      title: 'Misturar AND e OR sem parênteses',
      wrong: "WHERE categoria = 'Padaria' OR categoria = 'Mercearia' AND ativo = true",
      why: 'O AND é avaliado primeiro: a consulta traz toda a padaria (inclusive inativos) e só a mercearia ativa.',
      fix: "`WHERE (categoria = 'Padaria' OR categoria = 'Mercearia') AND ativo = true`, ou `categoria IN (...)`.",
    },
    {
      title: 'Usar apelido do SELECT no WHERE',
      wrong: 'SELECT preco * estoque AS total FROM produtos WHERE total > 100;',
      why: 'O WHERE é avaliado antes do SELECT, então o apelido ainda não existe.',
      fix: 'Repita a expressão: `WHERE preco * estoque > 100`.',
    },
  ],
  guidedExerciseId: 'ex-banco-04-guiado',
  independentExerciseId: 'ex-banco-04-independente',
  reviewQuestions: [
    { question: 'Em que ordem o banco processa FROM, WHERE e SELECT?', answer: 'Primeiro FROM (de onde vêm as linhas), depois WHERE (quais linhas ficam) e por último SELECT (quais colunas aparecem).' },
    { question: 'BETWEEN 10 AND 50 inclui o 10 e o 50?', answer: 'Sim. BETWEEN inclui os dois extremos; equivale a `>= 10 AND <= 50`.' },
    { question: 'Qual a diferença entre LIKE e ILIKE?', answer: 'ILIKE ignora a diferença entre maiúsculas e minúsculas; LIKE não.' },
  ],
  summary: [
    'SELECT escolhe colunas; FROM, a tabela; WHERE, as linhas.',
    'Textos em aspas simples; AS dá nome a colunas calculadas.',
    'IN, BETWEEN e LIKE simplificam filtros comuns.',
    'Parênteses sempre que misturar AND e OR.',
  ],
  completionCriteria: [
    'Listar os produtos sem estoque (exercício guiado).',
    'Combinar vários filtros em uma consulta (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-04-guiado',
    type: 'sql',
    task: 'write-query',
    title: 'Produtos esgotados',
    difficulty: 'iniciante',
    concepts: ['bd-select'],
    statement: 'O setor de compras quer saber quais produtos estão com estoque zerado. Liste o **nome** desses produtos.',
    requirements: ['Uma única coluna no resultado: `nome`.', 'Use a coluna `estoque` para filtrar.'],
    setup: LOJA,
    starterCode: `SELECT nome
FROM produtos
WHERE -- complete a condição
;`,
    tests: [
      { name: 'Produtos sem estoque', expected: { columns: ['nome'], rows: [['Chá verde'], ['Garrafa térmica']] } },
      {
        name: 'Com outro produto esgotado',
        setup: "INSERT INTO produtos VALUES (9, 'Açúcar demerara', 'Mercearia', 12.90, 0, true);",
        expected: { rows: [['Chá verde'], ['Garrafa térmica'], ['Açúcar demerara']] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: o WHERE mantém apenas as linhas em que a condição é verdadeira.',
      'Raciocínio: "estoque zerado" é a coluna estoque igual a 0. Em SQL, igualdade é um único `=`.',
      'Estrutura: `WHERE estoque = 0;`',
    ],
    solution: {
      code: `SELECT nome
FROM produtos
WHERE estoque = 0;`,
      explanation: 'Em SQL, `=` compara (não existe `==`). A condição `estoque = 0` mantém o chá verde e a garrafa térmica; o teste oculto confere que a consulta também pega novos produtos esgotados.',
    },
  },
  {
    id: 'ex-banco-04-independente',
    type: 'sql',
    task: 'write-query',
    title: 'Vitrine da semana',
    difficulty: 'basico',
    concepts: ['bd-select'],
    statement: 'Monte a vitrine da semana: produtos **ativos** das categorias **Mercearia** ou **Utensílios**, com preço **de R$ 10,00 a R$ 100,00** (inclusive).',
    requirements: ['Colunas, nesta ordem: `nome`, `preco`.', 'Os dois limites de preço entram na vitrine.'],
    setup: LOJA,
    starterCode: `SELECT nome, preco
FROM produtos
WHERE ativo = true;`,
    tests: [
      {
        name: 'Vitrine com os dados da loja',
        expected: { columns: ['nome', 'preco'], rows: [['Café em grãos 1kg', '89.90'], ['Chá verde', '18.50'], ['Caneca de cerâmica', '39.90']] },
      },
      {
        name: 'Limites, inativos e outras categorias',
        setup: `INSERT INTO produtos VALUES
  (9,  'Xícara',      'Utensílios', 10.00,  5, true),
  (10, 'Bule',        'Utensílios', 60.00,  3, false),
  (11, 'Pão francês', 'Padaria',    15.00, 10, true),
  (12, 'Mel',         'Mercearia', 100.00,  8, true);`,
        expected: { rows: [['Café em grãos 1kg', '89.90'], ['Chá verde', '18.50'], ['Caneca de cerâmica', '39.90'], ['Xícara', '10.00'], ['Mel', '100.00']] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: combine condições com AND; para "uma ou outra categoria", use IN (ou OR entre parênteses).',
      'Raciocínio: "de 10 a 100, inclusive" é exatamente o que BETWEEN faz.',
      "Estrutura: `WHERE ativo = true AND categoria IN ('Mercearia', 'Utensílios') AND preco BETWEEN 10 AND 100`",
    ],
    solution: {
      code: `SELECT nome, preco
FROM produtos
WHERE ativo = true
  AND categoria IN ('Mercearia', 'Utensílios')
  AND preco BETWEEN 10 AND 100;`,
      explanation:
        'IN evita o erro de precedência entre AND e OR, e BETWEEN inclui os extremos. Sem parênteses, `categoria = \'Mercearia\' OR categoria = \'Utensílios\' AND ...` deixaria passar mercearias inativas ou fora da faixa de preço — o teste oculto tem casos assim.',
    },
  },
];
