import type { Exercise, Lesson } from '../../../types/content';
import { LOJA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-07',
  trackId: 'sql',
  moduleId: 'sql-m2',
  title: 'INSERT, UPDATE e DELETE: alterando dados',
  durationMin: 25,
  objectives: [
    'Inserir linhas com INSERT, informando as colunas.',
    'Atualizar linhas com UPDATE e expressões baseadas no valor atual.',
    'Apagar linhas com DELETE sem causar estragos.',
    'Usar RETURNING para ver o que foi alterado.',
  ],
  prerequisites: ['banco-06'],
  concepts: ['bd-dml'],
  explanation: [
    {
      type: 'p',
      text: 'Até aqui você só leu dados. Os comandos de escrita — **INSERT**, **UPDATE** e **DELETE** — alteram a tabela, e o WHERE deles tem consequências permanentes.',
    },
    {
      type: 'code',
      language: 'sql',
      code: `INSERT INTO produtos (id, nome, categoria, preco, estoque)
VALUES (9, 'Mel', 'Mercearia', 30.00, 10),
       (10, 'Geleia', 'Mercearia', 22.00, 15);

UPDATE produtos
SET preco = preco * 1.10, estoque = estoque - 1
WHERE id = 9;

DELETE FROM produtos
WHERE id = 10;`,
    },
    {
      type: 'list',
      items: [
        '**INSERT**: liste as colunas explicitamente. Colunas omitidas recebem o DEFAULT (ou NULL). Vários VALUES de uma vez inserem várias linhas.',
        '**UPDATE**: `SET coluna = expressao`. A expressão pode usar o valor atual (`preco * 1.10`). Várias colunas são separadas por vírgula.',
        '**DELETE FROM**: apaga as linhas que passam no WHERE.',
        '`RETURNING`: no fim de qualquer um dos três, mostra as linhas afetadas: `UPDATE ... RETURNING id, preco;`.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'UPDATE e DELETE sem WHERE afetam a tabela inteira',
      text: '`DELETE FROM produtos;` apaga **todos** os produtos, sem pedir confirmação. Antes de alterar, rode um `SELECT` com o mesmo WHERE para ver quais linhas serão afetadas. Em produção, faça dentro de `BEGIN`, confira e só então `COMMIT`.',
    },
  ],
  analogy:
    'INSERT é preencher uma ficha nova; UPDATE é corrigir campos com caneta em fichas existentes; DELETE é jogar fichas fora. O WHERE é a lista de quais fichas — sem a lista, você corrige ou joga fora a gaveta inteira.',
  example: {
    language: 'sql',
    setup: LOJA,
    code: `INSERT INTO produtos (id, nome, categoria, preco, estoque)
VALUES (9, 'Açúcar demerara', 'Mercearia', 12.90, 40);

UPDATE produtos
SET preco = preco * 1.10
WHERE categoria = 'Padaria'
RETURNING nome, preco;

DELETE FROM produtos
WHERE ativo = false AND estoque = 0;

SELECT count(*) AS total_de_produtos FROM produtos;`,
    lineByLine: [
      { line: 1, text: 'Insere um produto. `ativo` não foi informado e recebe o DEFAULT true.' },
      { line: 5, text: 'Reajuste de 10% sobre o preço atual de cada produto da padaria.' },
      { line: 7, text: 'RETURNING mostra as linhas alteradas, com os novos preços (arredondados para 2 casas pelo numeric(10,2)).' },
      { line: 9, text: 'Apaga os produtos inativos e sem estoque: só a garrafa térmica.' },
      { line: 12, text: 'Eram 8, entrou 1 e saiu 1: continuam 8.' },
    ],
    output: `INSERT executado.

 nome               | preco
--------------------+-------
 Bolo de cenoura    | 35.20
 Pão de queijo 500g | 27.39
(2 linhas)

DELETE executado.

 total_de_produtos
-------------------
 8
(1 linha)`,
  },
  commonErrors: [
    {
      title: 'UPDATE sem WHERE',
      wrong: "UPDATE produtos SET preco = 10;  -- queria só o id 3",
      why: 'Sem WHERE, todas as linhas recebem preço 10.',
      fix: 'Sempre escreva o WHERE e confira antes com um SELECT. Use transações para poder voltar atrás.',
    },
    {
      title: 'INSERT sem lista de colunas',
      wrong: "INSERT INTO produtos VALUES (9, 'Mel', 30.00, 'Mercearia', 10, true);",
      why: 'Os valores são associados pela ordem das colunas da tabela. Uma ordem trocada grava dados errados ou dá erro de tipo.',
      fix: 'Liste as colunas: `INSERT INTO produtos (id, nome, categoria, preco, estoque) VALUES (...)`.',
    },
    {
      title: 'Escrever o valor final à mão',
      wrong: 'UPDATE produtos SET estoque = 24 WHERE id = 1;  -- "tirei 1 do 25"',
      why: 'Se outra pessoa alterou o estoque nesse meio-tempo, você sobrescreve a alteração dela.',
      fix: 'Calcule a partir do valor atual: `SET estoque = estoque - 1`.',
    },
  ],
  guidedExerciseId: 'ex-banco-07-guiado',
  independentExerciseId: 'ex-banco-07-independente',
  reviewQuestions: [
    { question: 'O que acontece com uma coluna não listada no INSERT?', answer: 'Ela recebe o valor DEFAULT da coluna; se não houver DEFAULT, fica NULL (ou dá erro, se for NOT NULL).' },
    { question: 'Como ver quais linhas um UPDATE alterou?', answer: 'Com `RETURNING` no fim do comando, ou rodando antes um SELECT com o mesmo WHERE.' },
    { question: 'Por que `SET estoque = estoque - 1` é melhor que escrever o novo valor?', answer: 'Porque usa o valor atual no momento da alteração, sem depender de uma leitura anterior que pode estar desatualizada.' },
  ],
  summary: [
    'INSERT INTO tabela (colunas) VALUES (...) insere linhas.',
    'UPDATE tabela SET coluna = expressão WHERE ... altera linhas.',
    'DELETE FROM tabela WHERE ... apaga linhas.',
    'Sem WHERE, UPDATE e DELETE afetam a tabela toda. RETURNING mostra o que mudou.',
  ],
  completionCriteria: ['Cadastrar um produto (exercício guiado).', 'Corrigir uma liquidação que alterava os produtos errados (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-07-guiado',
    type: 'sql',
    task: 'modify-data',
    title: 'Cadastre o coador',
    difficulty: 'iniciante',
    concepts: ['bd-dml'],
    statement: 'Cadastre um produto novo: id **9**, nome **Coador de pano**, categoria **Utensílios**, preço **14.90** e estoque **15**. Ele deve ficar ativo.',
    requirements: ['Liste as colunas no INSERT.', 'Não é preciso informar `ativo`: o padrão da tabela é true.'],
    setup: LOJA,
    starterCode: `INSERT INTO produtos (id, nome, categoria, preco, estoque)
VALUES ();`,
    tests: [
      {
        name: 'O produto foi cadastrado',
        query: 'SELECT id, nome, categoria, preco, estoque, ativo FROM produtos WHERE id = 9',
        expected: { columns: ['id', 'nome', 'categoria', 'preco', 'estoque', 'ativo'], rows: [[9, 'Coador de pano', 'Utensílios', '14.90', 15, true]] },
      },
      { name: 'Somente um produto novo', query: 'SELECT count(*) AS total FROM produtos', expected: { rows: [[9]] }, hidden: true },
    ],
    hints: [
      'Conceito: os valores do VALUES seguem a mesma ordem da lista de colunas.',
      "Raciocínio: textos entre aspas simples, números sem aspas, decimal com ponto (14.90).",
      "Estrutura: `VALUES (9, 'Coador de pano', 'Utensílios', 14.90, 15);`",
    ],
    solution: {
      code: `INSERT INTO produtos (id, nome, categoria, preco, estoque)
VALUES (9, 'Coador de pano', 'Utensílios', 14.90, 15);`,
      explanation: 'Os cinco valores correspondem, na ordem, às cinco colunas listadas. Como `ativo` não foi informado, recebe o DEFAULT true.',
    },
  },
  {
    id: 'ex-banco-07-independente',
    type: 'sql',
    task: 'fix-query',
    title: 'A liquidação que deu errado',
    difficulty: 'intermediario',
    concepts: ['bd-dml'],
    statement:
      'A regra da liquidação é: **20% de desconto** nos produtos da categoria **Utensílios** que estão **ativos**, e os produtos **sem estoque** devem ser **desativados**. O script abaixo foi escrito às pressas e altera as linhas erradas. Corrija os dois comandos.',
    context: 'Um desconto de 20% significa pagar 80% do preço.',
    setup: LOJA,
    starterCode: `UPDATE produtos
SET preco = preco * 0.2
WHERE categoria = 'Utensílios';

UPDATE produtos
SET ativo = false;`,
    tests: [
      {
        name: 'Preços e situação de todos os produtos',
        query: 'SELECT id, preco, ativo FROM produtos ORDER BY id',
        ordered: true,
        expected: {
          columns: ['id', 'preco', 'ativo'],
          rows: [
            [1, '89.90', true],
            [2, '18.50', false],
            [3, '31.92', true],
            [4, '127.20', true],
            [5, '7.92', true],
            [6, '32.00', false],
            [7, '24.90', true],
            [8, '129.90', false],
          ],
        },
      },
      {
        name: 'Com outros produtos',
        setup: "INSERT INTO produtos VALUES (9, 'Peneira', 'Utensílios', 50.00, 7, true), (10, 'Mel', 'Mercearia', 30.00, 0, true);",
        query: 'SELECT id, preco, ativo FROM produtos WHERE id >= 9 ORDER BY id',
        ordered: true,
        expected: { rows: [[9, '40.00', true], [10, '30.00', false]] },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: cada UPDATE precisa de um WHERE que descreva exatamente as linhas da regra.',
      'Raciocínio: 20% de desconto é `preco * 0.8`. O desconto vale só para utensílios ativos. A desativação vale só para estoque igual a zero.',
      "Estrutura: `SET preco = preco * 0.8 WHERE categoria = 'Utensílios' AND ativo = true;` e `SET ativo = false WHERE estoque = 0;`",
    ],
    solution: {
      code: `UPDATE produtos
SET preco = preco * 0.8
WHERE categoria = 'Utensílios' AND ativo = true;

UPDATE produtos
SET ativo = false
WHERE estoque = 0;`,
      explanation:
        'O primeiro comando cobrava só 20% do preço (desconto de 80%) e incluía a garrafa térmica inativa. O segundo, sem WHERE, desativava a loja inteira. Com os filtros certos, só as linhas da regra são alteradas.',
    },
  },
];
