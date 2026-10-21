import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-03',
  trackId: 'logica-js',
  moduleId: 'logica-m1',
  title: 'Tipos de dados',
  durationMin: 15,
  objectives: [
    'Reconhecer os tipos string, number, boolean, undefined e null.',
    'Descobrir o tipo de um valor com typeof.',
    'Entender por que "10" + 5 resulta em "105".',
    'Converter texto em número com Number().',
  ],
  prerequisites: ['logica-02'],
  concepts: ['tipos'],
  explanation: [
    {
      type: 'p',
      text: 'Todo valor em JavaScript tem um **tipo** (*type*). O tipo define o que você pode fazer com o valor: números podem ser multiplicados, textos podem ser juntados, booleanos podem ser usados em decisões.',
    },
    {
      type: 'list',
      items: [
        '**string**: texto, entre aspas. `"Ana"`, `\'Teclado\'`, `"42"` (sim, entre aspas é texto!).',
        '**number**: números inteiros ou decimais. `150`, `0.05`, `-3`. O separador decimal é o ponto.',
        '**boolean**: verdadeiro ou falso. Só existem dois valores: `true` e `false`.',
        '**undefined**: "ainda não tem valor". Uma variável declarada sem valor é `undefined`.',
        '**null**: "sem valor de propósito". O programador escolhe dizer que algo está vazio.',
      ],
    },
    { type: 'h', text: 'typeof' },
    {
      type: 'p',
      text: 'O operador `typeof` devolve o nome do tipo como texto: `typeof 10` é `"number"`. É muito útil para investigar valores estranhos durante a depuração.',
    },
    { type: 'h', text: 'Cuidado com o +' },
    {
      type: 'p',
      text: 'O `+` faz duas coisas diferentes: **soma** números e **concatena** (junta) textos. Se um dos lados for string, o JavaScript converte o outro em string e concatena: `"10" + 5` vira `"105"`. Os outros operadores (`-`, `*`, `/`) tentam converter para número: `"10" - 5` é `5`.',
    },
    {
      type: 'p',
      text: 'Dados vindos de formulários e do teclado chegam como **texto**. Para fazer contas, converta com `Number("10")`. Se o texto não for um número, o resultado é `NaN` (*Not a Number*), que também é do tipo number.',
    },
    {
      type: 'callout',
      tone: 'warning',
      text: '`typeof null` devolve `"object"`. É um erro histórico da linguagem que nunca foi corrigido para não quebrar sites antigos. Apenas memorize.',
    },
  ],
  analogy:
    'Tipos são como unidades de medida: somar 2 metros com 3 metros faz sentido; "somar" a palavra "dois" com o número 3 só pode resultar em juntar os símbolos.',
  example: {
    code: `const produto = "Teclado";
const preco = 150.5;
const emEstoque = true;
let desconto;

console.log(typeof produto);
console.log(typeof preco);
console.log(typeof emEstoque);
console.log(typeof desconto);
console.log("10" + 5);
console.log(Number("10") + 5);`,
    lineByLine: [
      { line: 1, text: 'Texto entre aspas: string.' },
      { line: 2, text: 'Número decimal, com ponto: number.' },
      { line: 3, text: 'true é um boolean.' },
      { line: 4, text: 'Declarada sem valor: o valor é undefined.' },
      { line: 6, text: '`typeof` devolve o tipo como texto: "string".' },
      { line: 10, text: 'Um lado é string, então + concatena: "105".' },
      { line: 11, text: '`Number("10")` converte para 10; agora 10 + 5 = 15.' },
    ],
    output: `string
number
boolean
undefined
105
15`,
  },
  commonErrors: [
    {
      title: 'Somar textos achando que são números',
      wrong: 'const quantidade = "3";\nconsole.log(quantidade + 2); // "32"',
      why: 'quantidade é string, então + concatena.',
      fix: 'Converta antes: `Number(quantidade) + 2`.',
    },
    {
      title: 'Vírgula como separador decimal',
      wrong: 'const preco = 10,50;',
      why: 'Em JavaScript a vírgula separa itens; o decimal usa ponto. O código vira um erro de sintaxe.',
      fix: '`const preco = 10.5;`',
    },
    {
      title: 'Confundir "true" com true',
      wrong: 'const ativo = "true";',
      why: 'Com aspas, é um texto, não um boolean.',
      fix: '`const ativo = true;`',
    },
  ],
  guidedExerciseId: 'ex-logica-03-guiado',
  independentExerciseId: 'ex-logica-03-independente',
  reviewQuestions: [
    { question: 'Qual o tipo de "123"? E de 123?', answer: '"123" é string (está entre aspas); 123 é number.' },
    { question: 'Qual a diferença entre undefined e null?', answer: 'undefined significa que ainda não foi atribuído valor; null é um "vazio" escolhido de propósito pelo programador.' },
    { question: 'Como transformar o texto "42" no número 42?', answer: 'Com Number("42").' },
  ],
  summary: [
    'Tipos básicos: string, number, boolean, undefined e null.',
    'typeof mostra o tipo de um valor.',
    'O + concatena quando um dos lados é string.',
    'Dados de formulários são texto: converta com Number() antes de calcular.',
  ],
  completionCriteria: [
    'Identificar o tipo de um valor (exercício guiado).',
    'Explicar o comportamento do + com strings (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-03-guiado',
    type: 'multiple-choice',
    title: 'Qual é o tipo?',
    difficulty: 'iniciante',
    concepts: ['tipos'],
    statement: 'O que o código abaixo exibe?',
    code: 'console.log(typeof "42");',
    options: [
      { id: 'a', text: 'number', feedback: 'Parece um número, mas está entre aspas. Aspas sempre indicam texto.' },
      { id: 'b', text: 'string', feedback: 'Correto: qualquer valor entre aspas é uma string, mesmo que contenha dígitos.' },
      { id: 'c', text: 'boolean', feedback: 'boolean só tem dois valores: true e false.' },
      { id: 'd', text: '42', feedback: 'typeof não devolve o valor, e sim o nome do tipo.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: typeof devolve o nome do tipo do valor.',
      'Raciocínio: o que as aspas ao redor de 42 indicam?',
      'Estrutura: typeof 42 seria "number". Compare com typeof "42".',
    ],
    solution: {
      explanation: '"42" está entre aspas, portanto é texto (string). typeof devolve o nome do tipo: "string".',
    },
  },
  {
    id: 'ex-logica-03-independente',
    type: 'true-false',
    title: 'Somando texto com número',
    difficulty: 'iniciante',
    concepts: ['tipos', 'operadores'],
    statement: 'Avalie a afirmação e escolha a justificativa correta.',
    claim: 'O código abaixo exibe 8.',
    code: 'console.log("5" + 3);',
    answer: false,
    justifications: [
      { id: 'j1', text: 'Quando um dos lados do + é string, o JavaScript concatena: o resultado é "53".' },
      { id: 'j2', text: 'O JavaScript converte o texto em número sempre que possível, então 5 + 3 = 8.' },
      { id: 'j3', text: 'O código gera um erro, porque não é possível usar + entre texto e número.' },
    ],
    correctJustificationId: 'j1',
    hints: [
      'Conceito: o operador + tem dois comportamentos: soma e concatenação.',
      'Raciocínio: qual é o tipo de "5"? O que o + faz quando um lado é texto?',
      'Estrutura: "Ana" + 1 resulta em "Ana1". Aplique a mesma regra a "5" + 3.',
    ],
    solution: {
      explanation:
        'A afirmação é falsa. "5" é string, então o + converte 3 em "3" e junta os textos: "53". Para somar, seria preciso converter: Number("5") + 3.',
    },
  },
];
