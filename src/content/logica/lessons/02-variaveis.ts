import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-02',
  trackId: 'logica-js',
  moduleId: 'logica-m1',
  title: 'Variáveis e constantes',
  durationMin: 15,
  objectives: [
    'Guardar valores com nomes usando let e const.',
    'Diferenciar valores que mudam (let) de valores fixos (const).',
    'Entender que = significa atribuição, não igualdade.',
    'Escolher nomes claros para variáveis.',
  ],
  prerequisites: ['logica-01'],
  concepts: ['variaveis'],
  explanation: [
    {
      type: 'p',
      text: 'Uma **variável** (*variable*) é um nome que aponta para um valor guardado na memória. Em vez de repetir `2000` pelo código, damos um nome a esse valor: `valorDaVenda`.',
    },
    {
      type: 'list',
      items: [
        '`const` cria uma **constante**: o nome não pode receber outro valor depois. Use por padrão.',
        '`let` cria uma variável que **pode ser reatribuída**. Use quando o valor realmente precisa mudar (um total que acumula, um contador).',
        '`var` é a forma antiga. Você vai encontrá-la em códigos antigos, mas não a usaremos: ela tem regras de escopo confusas.',
      ],
    },
    { type: 'h', text: 'O sinal = é atribuição' },
    {
      type: 'p',
      text: 'Em matemática, `x = x + 1` é impossível. Em programação, significa: **calcule o lado direito e guarde o resultado no nome da esquerda**. O JavaScript lê `x + 1` usando o valor atual de `x` e depois substitui o valor de `x`.',
    },
    { type: 'h', text: 'Nomes de variáveis' },
    {
      type: 'list',
      items: [
        'Use **camelCase**: primeira palavra minúscula e as seguintes com inicial maiúscula (`totalVendido`).',
        'Nomes não podem começar com número nem ter espaços ou hífens.',
        'Maiúsculas importam: `total` e `Total` são nomes diferentes.',
        'Prefira nomes que expliquem o conteúdo: `comissaoMensal` é melhor que `c` ou `x2`.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'Comece sempre com `const`. Se precisar reatribuir, troque para `let`. Isso deixa claro para quem lê quais valores mudam.',
    },
  ],
  analogy:
    'Pense em etiquetas coladas em caixas. A etiqueta é o nome; o conteúdo da caixa é o valor. Com `let`, você pode trocar o conteúdo da caixa; com `const`, a etiqueta fica presa àquele conteúdo.',
  example: {
    code: `const nome = "Ana";
let vendasDoMes = 0;

vendasDoMes = vendasDoMes + 1500;
vendasDoMes = vendasDoMes + 700;

console.log(nome, "vendeu", vendasDoMes);`,
    lineByLine: [
      { line: 1, text: 'Constante `nome` com o texto "Ana". Esse nome não vai mudar.' },
      { line: 2, text: 'Variável `vendasDoMes` começa em 0 — ela vai acumular valores, por isso usamos `let`.' },
      { line: 4, text: 'Lado direito: 0 + 1500 = 1500. O resultado é guardado em `vendasDoMes`.' },
      { line: 5, text: 'Agora o valor atual é 1500; 1500 + 700 = 2200 passa a ser o novo valor.' },
      { line: 7, text: '`console.log` com vários valores separados por vírgula os mostra separados por espaço.' },
    ],
    output: 'Ana vendeu 2200',
  },
  commonErrors: [
    {
      title: 'Reatribuir uma constante',
      wrong: 'const total = 0;\ntotal = 10;',
      why: 'Gera `TypeError: Assignment to constant variable.` — constantes não aceitam novo valor.',
      fix: 'Use `let total = 0;` se o valor precisa mudar.',
    },
    {
      title: 'Usar a variável antes de declarar',
      wrong: 'console.log(preco);\nconst preco = 10;',
      why: 'Gera `ReferenceError: Cannot access \'preco\' before initialization`. O código é lido de cima para baixo.',
      fix: 'Declare a variável antes de usá-la.',
    },
    {
      title: 'Declarar duas vezes',
      wrong: 'let total = 0;\nlet total = 5;',
      why: 'Gera `SyntaxError: Identifier \'total\' has already been declared`.',
      fix: 'Declare uma vez e depois apenas reatribua: `total = 5;`.',
    },
  ],
  guidedExerciseId: 'ex-logica-02-guiado',
  independentExerciseId: 'ex-logica-02-independente',
  reviewQuestions: [
    {
      question: 'Quando usar let e quando usar const?',
      answer: 'const por padrão, para valores que não serão reatribuídos; let quando o valor precisa mudar, como um contador ou um total acumulado.',
    },
    {
      question: 'O que acontece em `saldo = saldo - 50;`?',
      answer: 'O JavaScript calcula saldo - 50 com o valor atual de saldo e guarda o resultado de volta em saldo.',
    },
    {
      question: 'Por que `Total` e `total` são variáveis diferentes?',
      answer: 'Porque o JavaScript diferencia maiúsculas de minúsculas (é case-sensitive).',
    },
  ],
  summary: [
    'Variáveis dão nomes a valores.',
    'const não pode ser reatribuída; let pode.',
    '= é atribuição: calcula a direita e guarda na esquerda.',
    'Use nomes descritivos em camelCase.',
  ],
  completionCriteria: [
    'Escolher corretamente entre let e const (exercício guiado).',
    'Prever o valor de variáveis após várias atribuições (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-02-guiado',
    type: 'fill-blanks',
    title: 'let ou const?',
    difficulty: 'iniciante',
    concepts: ['variaveis'],
    statement: 'Complete as lacunas. A taxa de comissão nunca muda; o total vendido vai acumulando valores.',
    template: `[[0]] taxaDeComissao = 0.05;
[[1]] totalVendido = 0;
totalVendido [[2]] totalVendido + 300;
console.log(totalVendido);`,
    blanks: [{ accept: ['const'], width: 6 }, { accept: ['let'], width: 6 }, { accept: ['='], width: 3 }],
    hints: [
      'Conceito: const para valores fixos, let para valores que serão reatribuídos.',
      'Raciocínio: qual dos dois valores recebe um novo valor na linha 3?',
      'Estrutura: a linha 3 precisa do operador de atribuição — o mesmo usado nas declarações.',
    ],
    solution: {
      code: `const taxaDeComissao = 0.05;
let totalVendido = 0;
totalVendido = totalVendido + 300;
console.log(totalVendido); // 300`,
      explanation:
        'A taxa nunca muda, então const. O total recebe um novo valor na linha 3, então precisa ser let. Na linha 3, = atribui o resultado de totalVendido + 300.',
    },
  },
  {
    id: 'ex-logica-02-independente',
    type: 'predict-output',
    title: 'Acompanhe as atribuições',
    difficulty: 'iniciante',
    concepts: ['variaveis'],
    statement: 'Leia o código linha por linha e escreva exatamente o que será exibido.',
    code: `let pontos = 10;
pontos = pontos + 5;
const bonus = pontos * 2;
pontos = 0;
console.log(pontos, bonus);`,
    expectedOutput: '0 30',
    hints: [
      'Conceito: cada atribuição substitui o valor anterior da variável.',
      'Raciocínio: anote o valor de pontos e bonus depois de cada linha, como uma tabela.',
      'Estrutura: depois da linha 2, pontos vale 15. bonus é calculado com esse valor. O que a linha 4 muda — e o que ela não muda?',
    ],
    solution: {
      explanation:
        'pontos: 10 → 15. bonus = 15 × 2 = 30. Na linha 4, pontos passa a valer 0, mas bonus já foi calculado e continua 30. Mudar pontos depois não recalcula bonus.',
    },
  },
];
