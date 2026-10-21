import type { Exercise, Lesson } from '../../../types/content';
import { CONTAS } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-18',
  trackId: 'sql',
  moduleId: 'sql-m5',
  title: 'Concorrência: isolamento, MVCC e locks',
  durationMin: 35,
  objectives: [
    'Descrever as anomalias de concorrência: leitura não repetível, fantasma e atualização perdida.',
    'Comparar os níveis Read Committed, Repeatable Read e Serializable.',
    'Explicar como o MVCC permite que leituras não bloqueiem escritas.',
    'Evitar atualizações perdidas com UPDATE atômico e SELECT ... FOR UPDATE.',
  ],
  prerequisites: ['banco-17'],
  concepts: ['bd-isolamento'],
  explanation: [
    {
      type: 'p',
      text: 'Em produção, centenas de transações rodam ao mesmo tempo. O **isolamento** (o I de ACID) define o quanto uma transação enxerga das outras enquanto elas ainda estão em andamento.',
    },
    { type: 'h', text: 'O que pode dar errado' },
    {
      type: 'list',
      items: [
        '**Leitura não repetível**: você lê o saldo, outra transação altera e confirma, você lê de novo na mesma transação e vê outro valor.',
        '**Fantasma**: você conta os pedidos de hoje, outra transação insere um, e a mesma contagem muda dentro da sua transação.',
        '**Atualização perdida**: duas transações leem saldo 100, uma grava 70 e a outra grava 50 — o débito de 30 some.',
        '**Anomalia de serialização**: o resultado final não corresponde a nenhuma ordem em que as transações poderiam ter rodado uma de cada vez.',
      ],
    },
    { type: 'h', text: 'Níveis de isolamento no PostgreSQL' },
    {
      type: 'list',
      items: [
        '**Read Committed** (padrão): cada comando vê o que estava confirmado quando **ele** começou. Nunca há leitura suja (dados não confirmados).',
        '**Repeatable Read**: a transação inteira vê uma "foto" tirada no primeiro comando. Se outra transação alterar uma linha que você também tenta alterar, você recebe um erro de serialização e deve repetir.',
        '**Serializable**: garante que o resultado é igual a alguma execução em fila. É o mais seguro e o que mais gera erros de serialização para a aplicação repetir.',
      ],
    },
    {
      type: 'code',
      language: 'sql',
      code: 'BEGIN ISOLATION LEVEL REPEATABLE READ;\n-- ...\nCOMMIT;',
    },
    { type: 'h', text: 'MVCC e locks' },
    {
      type: 'p',
      text: 'O PostgreSQL usa **MVCC** (controle de concorrência multiversão): um UPDATE não sobrescreve a linha, cria uma **nova versão** dela. Quem já estava lendo continua vendo a versão antiga. Por isso **leituras não bloqueiam escritas e escritas não bloqueiam leituras**. Versões velhas são limpas depois pelo *VACUUM* (automático).',
    },
    {
      type: 'p',
      text: 'Duas escritas na **mesma linha**, porém, se bloqueiam: o segundo UPDATE espera o primeiro terminar. `SELECT ... FOR UPDATE` trava as linhas lidas até o fim da transação, para que ninguém as altere entre a sua leitura e a sua escrita. Se duas transações esperam uma pela outra, o banco detecta o **deadlock** e cancela uma delas.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Regras práticas',
      text: 'Prefira operações atômicas (`SET saldo = saldo - 30 WHERE id = 1 AND saldo >= 30`) a "ler na aplicação e gravar o resultado". Mantenha transações curtas: nada de esperar resposta do usuário ou de outra API com uma transação aberta. Em Repeatable Read/Serializable, trate o erro 40001 repetindo a transação.',
    },
  ],
  analogy:
    'MVCC é como um documento compartilhado que guarda versões: quem abriu a versão das 10h continua lendo-a em paz enquanto alguém edita a das 10h05. Mas, se duas pessoas tentam editar o mesmo parágrafo ao mesmo tempo, uma precisa esperar a outra terminar.',
  example: {
    language: 'sql',
    setup: CONTAS,
    code: `BEGIN ISOLATION LEVEL REPEATABLE READ;
SHOW transaction_isolation;

-- Trava a linha da Ana até o fim da transação
SELECT saldo FROM contas WHERE id = 1 FOR UPDATE;
UPDATE contas SET saldo = saldo - 50 WHERE id = 1;
COMMIT;

-- Débito atômico: só acontece se houver saldo
UPDATE contas SET saldo = saldo - 500 WHERE id = 2 AND saldo >= 500
RETURNING id, saldo;

SELECT id, titular, saldo FROM contas ORDER BY id;`,
    lineByLine: [
      { line: 1, text: 'Abre a transação no nível Repeatable Read.' },
      { line: 5, text: 'FOR UPDATE: outra transação que tente alterar a conta 1 vai esperar o COMMIT.' },
      { line: 10, text: 'O Bruno tem 120: a condição falha, nenhuma linha é alterada e não há erro.' },
      { line: 11, text: 'RETURNING devolve 0 linhas — a aplicação sabe que o débito foi recusado.' },
    ],
    output: `BEGIN executado.

 transaction_isolation
-----------------------
 repeatable read
(1 linha)

 saldo
--------
 500.00
(1 linha)

UPDATE executado.

COMMIT executado.

 id | saldo
----+-------
(0 linhas)

 id | titular | saldo
----+---------+--------
 1  | Ana     | 450.00
 2  | Bruno   | 120.00
 3  | Carla   | 0.00
(3 linhas)`,
  },
  commonErrors: [
    {
      title: 'Ler, calcular na aplicação e gravar',
      wrong: "saldo = SELECT saldo ... -- 100\nnovo = saldo - 30       -- na aplicação\nUPDATE contas SET saldo = 70 WHERE id = 1;",
      why: 'Outra transação pode ter alterado o saldo entre a leitura e a escrita: atualização perdida.',
      fix: 'UPDATE atômico (`saldo = saldo - 30`) ou SELECT ... FOR UPDATE dentro da transação.',
    },
    {
      title: 'Transação aberta esperando algo externo',
      why: 'Enquanto ela espera uma API ou o usuário, as linhas travadas bloqueiam outras transações e as versões antigas não podem ser limpas.',
      fix: 'Faça as chamadas externas antes ou depois; a transação só envolve comandos no banco.',
    },
    {
      title: 'Ignorar o erro de serialização',
      why: 'Em Repeatable Read e Serializable, o erro 40001 é parte do protocolo: a transação precisa ser repetida.',
      fix: 'Trate o 40001 na aplicação com uma nova tentativa (com limite).',
    },
  ],
  guidedExerciseId: 'ex-banco-18-guiado',
  independentExerciseId: 'ex-banco-18-independente',
  reviewQuestions: [
    { question: 'Qual é o nível de isolamento padrão do PostgreSQL?', answer: 'Read Committed: cada comando vê os dados confirmados no momento em que começou.' },
    { question: 'O que é MVCC?', answer: 'Controle de concorrência multiversão: atualizações criam novas versões das linhas, e cada transação lê a versão adequada à sua foto dos dados. Leituras e escritas não se bloqueiam.' },
    { question: 'Para que serve SELECT ... FOR UPDATE?', answer: 'Para travar as linhas lidas até o fim da transação, impedindo que outra transação as altere entre a leitura e a escrita.' },
  ],
  summary: [
    'Anomalias: leitura não repetível, fantasma, atualização perdida, serialização.',
    'Read Committed (padrão), Repeatable Read e Serializable.',
    'MVCC: leituras não bloqueiam escritas; escritas na mesma linha se esperam.',
    'UPDATE atômico e FOR UPDATE evitam atualizações perdidas; transações curtas.',
  ],
  completionCriteria: ['Escolher como evitar uma atualização perdida (exercício guiado).', 'Escrever um débito que nunca deixa saldo negativo nem gera erro (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-18-guiado',
    type: 'multiple-choice',
    title: 'O estoque que ficou errado',
    difficulty: 'intermediario',
    concepts: ['bd-isolamento'],
    statement:
      'Na Black Friday, dois clientes compraram a última unidade de um produto ao mesmo tempo. O código da API faz: (1) `SELECT estoque FROM produtos WHERE id = 7` → 1; (2) se for maior que 0, calcula `novo = estoque - 1` e executa `UPDATE produtos SET estoque = novo WHERE id = 7`. As duas compras foram aprovadas. Qual correção resolve o problema?',
    options: [
      { id: 'a', text: 'Rodar as duas etapas mais rápido, em um servidor maior.', feedback: 'Diminui a chance, mas o intervalo entre ler e gravar continua existindo.' },
      {
        id: 'b',
        text: 'Fazer a baixa em um único comando atômico: `UPDATE produtos SET estoque = estoque - 1 WHERE id = 7 AND estoque > 0 RETURNING estoque`, e só aprovar a compra se uma linha voltar.',
        feedback: 'Correto: a verificação e a baixa acontecem no mesmo comando, e o segundo UPDATE espera o primeiro e não encontra mais estoque.',
      },
      { id: 'c', text: 'Adicionar um índice em produtos.id.', feedback: 'O id já é PK (com índice). Velocidade não resolve corrida.' },
      { id: 'd', text: 'Ler o estoque duas vezes antes do UPDATE para confirmar.', feedback: 'Cada leitura pode estar desatualizada no instante seguinte.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: é uma atualização perdida, causada pelo intervalo entre ler e gravar.',
      'Raciocínio: e se a condição "estoque > 0" fosse conferida pelo próprio banco, no momento da escrita?',
      'Estrutura: UPDATE com a condição no WHERE e RETURNING para saber se deu certo.',
    ],
    solution: {
      explanation:
        'O UPDATE atômico confere e altera no mesmo instante, com a linha travada. O segundo comando espera o primeiro, relê a linha já com estoque 0 e não altera nada; o RETURNING vazio diz à API que a compra deve ser recusada. Outra opção válida é SELECT ... FOR UPDATE dentro de uma transação.',
    },
  },
  {
    id: 'ex-banco-18-independente',
    type: 'sql',
    task: 'modify-data',
    title: 'Débito sem saldo negativo',
    difficulty: 'intermediario',
    concepts: ['bd-isolamento', 'bd-dml'],
    statement:
      'Escreva o débito de **R$ 150,00** na conta **2** em um único comando que **só debita se houver saldo suficiente**. Se não houver, nada deve mudar — e o comando **não pode dar erro** (a tabela tem `CHECK (saldo >= 0)`).',
    requirements: ['Um único UPDATE.', 'Use RETURNING id, saldo para a aplicação saber se o débito aconteceu.'],
    setup: CONTAS,
    starterCode: 'UPDATE contas SET saldo = saldo - 150 WHERE id = 2;',
    tests: [
      {
        name: 'Saldo insuficiente: nada muda e não há erro',
        query: 'SELECT id, saldo FROM contas ORDER BY id',
        ordered: true,
        expected: { columns: ['id', 'saldo'], rows: [[1, '500.00'], [2, '120.00'], [3, '0.00']] },
      },
      {
        name: 'Saldo suficiente: debita',
        setup: 'UPDATE contas SET saldo = 200 WHERE id = 2;',
        query: 'SELECT id, saldo FROM contas ORDER BY id',
        ordered: true,
        expected: { rows: [[1, '500.00'], [2, '50.00'], [3, '0.00']] },
        hidden: true,
      },
    ],
    constraints: [{ kind: 'must-include', pattern: '\\bRETURNING\\b', message: 'Use RETURNING para devolver o resultado do débito.' }],
    hints: [
      'Conceito: um UPDATE cujo WHERE não encontra nenhuma linha não altera nada e não gera erro.',
      'Raciocínio: inclua no WHERE a condição de que o saldo é suficiente.',
      'Estrutura: `UPDATE contas SET saldo = saldo - 150 WHERE id = 2 AND saldo >= 150 RETURNING id, saldo;`',
    ],
    solution: {
      code: `UPDATE contas
SET saldo = saldo - 150
WHERE id = 2 AND saldo >= 150
RETURNING id, saldo;`,
      explanation:
        'Com saldo 120, o WHERE não encontra a linha: nada muda e o RETURNING volta vazio. Com saldo 200, o débito acontece. Sem a condição, o CHECK recusaria o comando com erro. Como verificação e escrita são o mesmo comando, não há corrida entre transações.',
    },
  },
];
