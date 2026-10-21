import type { Exercise, Lesson } from '../../../types/content';
import { CONTAS } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-03',
  trackId: 'sql',
  moduleId: 'sql-m1',
  title: 'Transações e as garantias ACID',
  durationMin: 25,
  objectives: [
    'Explicar o que é uma transação e quando ela é necessária.',
    'Descrever atomicidade, consistência, isolamento e durabilidade.',
    'Agrupar comandos com BEGIN, COMMIT e ROLLBACK.',
  ],
  prerequisites: ['banco-02'],
  concepts: ['bd-acid'],
  explanation: [
    {
      type: 'p',
      text: 'Uma transferência bancária são **duas** alterações: tirar R$ 100 de uma conta e colocar R$ 100 em outra. Se o sistema cair entre as duas, o dinheiro some. Uma **transação** agrupa vários comandos em uma unidade: ou **todos** são aplicados, ou **nenhum** é.',
    },
    {
      type: 'code',
      language: 'sql',
      code: `BEGIN;                -- abre a transação
UPDATE ...;           -- comando 1
UPDATE ...;           -- comando 2
COMMIT;               -- confirma tudo de uma vez
-- ou ROLLBACK;       -- desfaz tudo desde o BEGIN`,
    },
    { type: 'h', text: 'ACID' },
    {
      type: 'p',
      text: 'Bancos relacionais prometem quatro garantias para as transações, conhecidas pela sigla **ACID**:',
    },
    {
      type: 'list',
      items: [
        '**Atomicidade**: tudo ou nada. Se um comando falha ou a energia cai antes do COMMIT, nada da transação fica gravado.',
        '**Consistência**: a transação leva o banco de um estado válido a outro estado válido. Regras como `CHECK (saldo >= 0)` nunca ficam violadas no fim.',
        '**Isolamento**: transações simultâneas não enxergam o trabalho pela metade umas das outras (aula 18).',
        '**Durabilidade**: depois do COMMIT, a alteração sobrevive a quedas e reinícios (aula 19).',
      ],
    },
    {
      type: 'p',
      text: 'Fora de um `BEGIN`, cada comando é uma transação sozinho (*autocommit*). Por isso um único `UPDATE` já é atômico: ele altera todas as linhas ou nenhuma.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Quando um comando falha dentro da transação',
      text: 'No PostgreSQL, depois de um erro dentro de `BEGIN`, a transação fica "abortada": todos os comandos seguintes são recusados até um `ROLLBACK`. Isso evita que você confirme uma transação que deu errado pela metade.',
    },
  ],
  analogy:
    'Uma transação é como assinar um contrato com várias cláusulas: até a assinatura final (COMMIT) nada vale; se uma cláusula não puder ser cumprida, o contrato inteiro é rasgado (ROLLBACK) — nunca fica meio contrato valendo.',
  example: {
    language: 'sql',
    setup: CONTAS,
    code: `BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;

SELECT titular, saldo FROM contas ORDER BY id;`,
    lineByLine: [
      { line: 1, text: 'Abre a transação.' },
      { line: 2, text: 'Tira 100 da conta 1 (Ana). Ninguém de fora vê essa mudança ainda.' },
      { line: 3, text: 'Coloca 100 na conta 2 (Bruno).' },
      { line: 4, text: 'Confirma as duas alterações juntas.' },
      { line: 6, text: 'Ana passou de 500 para 400; Bruno, de 120 para 220. O total continua 620.' },
    ],
    output: `BEGIN executado.

UPDATE executado.

UPDATE executado.

COMMIT executado.

 titular | saldo
---------+--------
 Ana     | 400.00
 Bruno   | 220.00
 Carla   | 0.00
(3 linhas)`,
  },
  commonErrors: [
    {
      title: 'Esquecer o COMMIT',
      wrong: 'BEGIN;\nUPDATE contas SET saldo = saldo - 100 WHERE id = 1;\n-- e a conexão fecha...',
      why: 'Sem COMMIT, a transação é desfeita quando a conexão termina. As alterações nunca chegam a valer.',
      fix: 'Sempre feche a transação com COMMIT (ou ROLLBACK, de propósito).',
    },
    {
      title: 'Fazer operações relacionadas em transações separadas',
      wrong: 'UPDATE contas SET saldo = saldo - 100 WHERE id = 1;\n-- (queda aqui)\nUPDATE contas SET saldo = saldo + 100 WHERE id = 2;',
      why: 'Cada UPDATE é confirmado sozinho. Uma falha entre eles deixa o banco inconsistente.',
      fix: 'Envolva as duas alterações em BEGIN ... COMMIT.',
    },
    {
      title: 'Continuar depois de um erro',
      why: 'Após um erro dentro da transação, o PostgreSQL recusa tudo com "current transaction is aborted".',
      fix: 'Faça ROLLBACK, corrija o problema e comece de novo.',
    },
  ],
  guidedExerciseId: 'ex-banco-03-guiado',
  independentExerciseId: 'ex-banco-03-independente',
  reviewQuestions: [
    { question: 'O que significa a atomicidade?', answer: 'Que a transação é tudo ou nada: ou todos os comandos são aplicados, ou nenhum.' },
    { question: 'Qual a diferença entre COMMIT e ROLLBACK?', answer: 'COMMIT confirma todas as alterações feitas desde o BEGIN; ROLLBACK desfaz todas elas.' },
    { question: 'Um UPDATE sozinho, fora de BEGIN, é uma transação?', answer: 'Sim. Em autocommit, cada comando é sua própria transação e é atômico.' },
  ],
  summary: [
    'Transações agrupam comandos que precisam valer juntos.',
    'BEGIN abre, COMMIT confirma, ROLLBACK desfaz.',
    'ACID: atomicidade, consistência, isolamento e durabilidade.',
    'Um erro dentro da transação exige ROLLBACK.',
  ],
  completionCriteria: [
    'Reconhecer a garantia ACID em um cenário de falha (exercício guiado).',
    'Fazer uma transferência entre contas dentro de uma transação (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-03-guiado',
    type: 'multiple-choice',
    title: 'Queda no meio da transferência',
    difficulty: 'iniciante',
    concepts: ['bd-acid'],
    language: 'sql',
    statement:
      'O servidor perdeu energia exatamente depois do primeiro UPDATE e antes do COMMIT. Quando o banco voltou, as duas contas estavam com os saldos de antes da transferência. Qual garantia ACID explica esse comportamento?',
    code: `BEGIN;
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
-- energia cai aqui
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;`,
    options: [
      { id: 'a', text: 'Atomicidade', feedback: 'Correto: a transação não terminou, então nada dela foi aplicado — tudo ou nada.' },
      { id: 'b', text: 'Durabilidade', feedback: 'Durabilidade garante que o que foi confirmado (COMMIT) sobrevive. Aqui não houve COMMIT.' },
      { id: 'c', text: 'Isolamento', feedback: 'Isolamento trata de transações simultâneas, e o caso não envolve outra transação.' },
      { id: 'd', text: 'Nenhuma: o banco teve sorte', feedback: 'Não é sorte: o banco é projetado para desfazer transações incompletas.' },
    ],
    correctOptionId: 'a',
    hints: [
      'Conceito: cada letra de ACID descreve uma garantia diferente.',
      'Raciocínio: a transação ficou pela metade. Qual garantia diz o que acontece com uma transação incompleta?',
      'Estrutura: "tudo ou nada" é a definição de uma das quatro.',
    ],
    solution: {
      explanation:
        'Atomicidade: como o COMMIT não aconteceu, o primeiro UPDATE é descartado na recuperação. A durabilidade só vale para o que já foi confirmado.',
    },
  },
  {
    id: 'ex-banco-03-independente',
    type: 'sql',
    task: 'modify-data',
    title: 'Transferência segura',
    difficulty: 'basico',
    concepts: ['bd-acid'],
    statement: 'Transfira R$ 200,00 da conta 1 (Ana) para a conta 3 (Carla) usando uma transação.',
    requirements: [
      'Use `BEGIN` e `COMMIT`.',
      'Calcule a partir do saldo atual (`saldo - 200` e `saldo + 200`), sem escrever o saldo final à mão.',
      'Altere somente as contas 1 e 3.',
    ],
    setup: CONTAS,
    starterCode: `-- Faça a transferência de 200 da conta 1 para a conta 3

SELECT id, titular, saldo FROM contas ORDER BY id;`,
    tests: [
      {
        name: 'Saldos depois da transferência',
        query: 'SELECT id, saldo FROM contas ORDER BY id',
        ordered: true,
        expected: { columns: ['id', 'saldo'], rows: [[1, '300.00'], [2, '120.00'], [3, '200.00']] },
      },
      {
        name: 'Funciona com outros saldos',
        setup: 'UPDATE contas SET saldo = 1000 WHERE id = 1; UPDATE contas SET saldo = 50 WHERE id = 3;',
        query: 'SELECT id, saldo FROM contas ORDER BY id',
        ordered: true,
        expected: { rows: [[1, '800.00'], [2, '120.00'], [3, '250.00']] },
        hidden: true,
      },
    ],
    constraints: [
      { kind: 'must-include', pattern: '\\bBEGIN\\b', message: 'Abra a transação com BEGIN.' },
      { kind: 'must-include', pattern: '\\bCOMMIT\\b', message: 'Confirme a transação com COMMIT.' },
    ],
    hints: [
      'Conceito: a transferência são dois UPDATEs que precisam valer juntos.',
      'Raciocínio: `SET saldo = saldo - 200` usa o valor atual da linha. Filtre cada UPDATE com `WHERE id = ...`.',
      'Estrutura: BEGIN; UPDATE contas SET saldo = saldo - 200 WHERE id = 1; UPDATE ... WHERE id = 3; COMMIT;',
    ],
    solution: {
      code: `BEGIN;
UPDATE contas SET saldo = saldo - 200 WHERE id = 1;
UPDATE contas SET saldo = saldo + 200 WHERE id = 3;
COMMIT;

SELECT id, titular, saldo FROM contas ORDER BY id;`,
      explanation:
        'Os dois UPDATEs ficam dentro da mesma transação, então ou ambos valem, ou nenhum. Usar `saldo - 200` em vez de `saldo = 300` faz a transferência funcionar com qualquer saldo — o teste oculto começa com valores diferentes.',
    },
  },
];
