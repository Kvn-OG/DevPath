import type { Exercise, Lesson } from '../../../types/content';
import { LOJA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-05',
  trackId: 'sql',
  moduleId: 'sql-m2',
  title: 'ORDER BY, LIMIT, OFFSET e DISTINCT',
  durationMin: 20,
  objectives: [
    'Ordenar resultados por uma ou mais colunas, em ordem crescente ou decrescente.',
    'Limitar e paginar resultados com LIMIT e OFFSET.',
    'Remover linhas repetidas do resultado com DISTINCT.',
  ],
  prerequisites: ['banco-04'],
  concepts: ['bd-ordenacao'],
  explanation: [
    {
      type: 'p',
      text: 'Uma tabela não tem ordem garantida: sem `ORDER BY`, o banco devolve as linhas na ordem que for mais conveniente para ele, e essa ordem pode mudar de uma execução para outra. **Se a ordem importa, peça.**',
    },
    {
      type: 'code',
      language: 'sql',
      code: `SELECT nome, categoria, preco
FROM produtos
ORDER BY categoria ASC, preco DESC;`,
    },
    {
      type: 'list',
      items: [
        '`ASC` (crescente) é o padrão; `DESC` é decrescente.',
        'Com várias colunas, a segunda só desempata a primeira: acima, dentro de cada categoria, do mais caro para o mais barato.',
        'Valores NULL vão para o fim no ASC e para o começo no DESC (`NULLS FIRST`/`NULLS LAST` mudam isso).',
      ],
    },
    { type: 'h', text: 'LIMIT e OFFSET: os N primeiros e paginação' },
    {
      type: 'p',
      text: '`LIMIT 3` devolve no máximo 3 linhas. `OFFSET 6` pula as 6 primeiras. Juntos, fazem paginação: com 3 itens por página, a página *p* é `LIMIT 3 OFFSET (p - 1) * 3`. LIMIT sem ORDER BY é sorteio: use sempre os dois juntos.',
    },
    { type: 'h', text: 'DISTINCT' },
    {
      type: 'p',
      text: '`SELECT DISTINCT categoria FROM produtos` devolve cada categoria uma única vez. O DISTINCT vale para a combinação de todas as colunas do SELECT.',
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'A ordem de execução agora é: FROM → WHERE → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET. Por isso o ORDER BY pode usar apelidos criados no SELECT, e o WHERE não.',
    },
  ],
  analogy:
    'ORDER BY é arrumar as fichas em uma pilha; LIMIT é pegar só as de cima; OFFSET é descartar algumas do topo antes de pegar. Sem arrumar a pilha primeiro, "as de cima" são quaisquer umas.',
  example: {
    language: 'sql',
    setup: LOJA,
    code: `-- Os 3 produtos ativos mais caros
SELECT nome, preco
FROM produtos
WHERE ativo = true
ORDER BY preco DESC
LIMIT 3;`,
    lineByLine: [
      { line: 4, text: 'Primeiro filtra: a garrafa térmica (129,90) está inativa e sai.' },
      { line: 5, text: 'Ordena do maior preço para o menor.' },
      { line: 6, text: 'Mantém só as 3 primeiras linhas da ordenação.' },
    ],
    output: ` nome               | preco
--------------------+--------
 Moedor manual      | 159.00
 Café em grãos 1kg  | 89.90
 Caneca de cerâmica | 39.90
(3 linhas)`,
  },
  commonErrors: [
    {
      title: 'LIMIT sem ORDER BY',
      wrong: 'SELECT nome FROM produtos LIMIT 5;',
      why: 'Sem ordem definida, "os 5 primeiros" são quaisquer 5 — o resultado pode mudar sem aviso.',
      fix: 'Sempre combine LIMIT com ORDER BY.',
    },
    {
      title: 'Paginação com OFFSET errado',
      wrong: '-- página 2, 10 por página\nLIMIT 10 OFFSET 2',
      why: 'OFFSET conta linhas, não páginas.',
      fix: 'OFFSET = (página − 1) × itens por página: `LIMIT 10 OFFSET 10`.',
    },
    {
      title: 'Achar que DISTINCT vale para uma coluna só',
      wrong: 'SELECT DISTINCT categoria, nome FROM produtos;',
      why: 'O DISTINCT considera a linha inteira; como os nomes são diferentes, nada é removido.',
      fix: 'Selecione apenas as colunas que devem ser únicas.',
    },
  ],
  guidedExerciseId: 'ex-banco-05-guiado',
  independentExerciseId: 'ex-banco-05-independente',
  reviewQuestions: [
    { question: 'Uma consulta sem ORDER BY devolve as linhas em que ordem?', answer: 'Em ordem nenhuma garantida. Pode parecer estável, mas pode mudar a qualquer momento.' },
    { question: 'Como buscar a página 4 com 20 itens por página?', answer: '`ORDER BY ... LIMIT 20 OFFSET 60`, pois (4 − 1) × 20 = 60.' },
    { question: 'O ORDER BY pode usar um apelido definido no SELECT?', answer: 'Pode, porque o ORDER BY é processado depois do SELECT.' },
  ],
  summary: [
    'ORDER BY define a ordem; sem ele, não há ordem garantida.',
    'ASC é o padrão; DESC inverte; colunas extras desempatam.',
    'LIMIT corta, OFFSET pula; juntos paginam.',
    'DISTINCT remove linhas repetidas considerando todas as colunas selecionadas.',
  ],
  completionCriteria: ['Listar as categorias sem repetição (exercício guiado).', 'Implementar a página 2 de um catálogo (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-05-guiado',
    type: 'sql',
    task: 'write-query',
    title: 'Menu de categorias',
    difficulty: 'iniciante',
    concepts: ['bd-ordenacao'],
    statement: 'O site precisa de um menu com as categorias de produtos: cada categoria **uma única vez**, em **ordem alfabética**.',
    requirements: ['Uma coluna: `categoria`.', 'Sem repetições.', 'Em ordem alfabética crescente.'],
    setup: LOJA,
    starterCode: `SELECT categoria
FROM produtos;`,
    tests: [
      { name: 'Categorias únicas e em ordem', ordered: true, expected: { columns: ['categoria'], rows: [['Mercearia'], ['Padaria'], ['Utensílios']] } },
      {
        name: 'Com uma categoria nova',
        setup: "INSERT INTO produtos VALUES (9, 'Kit presente', 'Kits', 120.00, 3, true);",
        ordered: true,
        expected: { rows: [['Kits'], ['Mercearia'], ['Padaria'], ['Utensílios']] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: DISTINCT remove linhas repetidas do resultado; ORDER BY ordena.',
      'Raciocínio: o DISTINCT vem logo depois do SELECT; o ORDER BY, no fim da consulta.',
      'Estrutura: `SELECT DISTINCT categoria FROM produtos ORDER BY categoria;`',
    ],
    solution: {
      code: `SELECT DISTINCT categoria
FROM produtos
ORDER BY categoria;`,
      explanation: 'DISTINCT deixa uma linha por categoria e ORDER BY (crescente por padrão) coloca em ordem alfabética.',
    },
  },
  {
    id: 'ex-banco-05-independente',
    type: 'sql',
    task: 'write-query',
    title: 'Página 2 do catálogo',
    difficulty: 'basico',
    concepts: ['bd-ordenacao'],
    statement: 'O catálogo mostra **3 produtos por página**, em **ordem alfabética de nome**, incluindo os inativos. Escreva a consulta da **página 2**.',
    requirements: ['Colunas: `nome`, `preco`.', 'Ordem alfabética pelo nome.', 'Use LIMIT e OFFSET.'],
    setup: LOJA,
    starterCode: `SELECT nome, preco
FROM produtos
LIMIT 3;`,
    tests: [
      {
        name: 'Página 2',
        ordered: true,
        expected: { columns: ['nome', 'preco'], rows: [['Chá verde', '18.50'], ['Filtro de papel', '9.90'], ['Garrafa térmica', '129.90']] },
      },
      {
        name: 'Página 2 depois de cadastrar um produto que vem antes',
        setup: "INSERT INTO produtos VALUES (9, 'Açúcar demerara', 'Mercearia', 12.90, 40, true);",
        ordered: true,
        expected: { rows: [['Caneca de cerâmica', '39.90'], ['Chá verde', '18.50'], ['Filtro de papel', '9.90']] },
        hidden: true,
      },
    ],
    constraints: [{ kind: 'must-include', pattern: '\\bOFFSET\\b', message: 'Use OFFSET para pular a primeira página.' }],
    hints: [
      'Conceito: a página é definida pela ordenação, pelo tamanho (LIMIT) e por quantas linhas pular (OFFSET).',
      'Raciocínio: a página 2 começa depois dos 3 itens da página 1.',
      'Estrutura: `ORDER BY nome LIMIT 3 OFFSET 3`',
    ],
    solution: {
      code: `SELECT nome, preco
FROM produtos
ORDER BY nome
LIMIT 3 OFFSET 3;`,
      explanation:
        'OFFSET = (2 − 1) × 3 = 3. O ORDER BY é indispensável: sem ele, a página 2 poderia repetir ou pular produtos. O teste oculto cadastra um produto que entra antes na ordem alfabética, então a página muda — e a consulta precisa acompanhar.',
    },
  },
];
