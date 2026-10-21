import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-04',
  trackId: 'logica-js',
  moduleId: 'logica-m1',
  title: 'Operadores aritméticos, relacionais e lógicos',
  durationMin: 20,
  objectives: [
    'Fazer contas com +, -, *, /, % e **.',
    'Comparar valores com >, <, >=, <=, === e !==.',
    'Combinar condições com && (e), || (ou) e ! (não).',
    'Entender por que preferir === a ==.',
  ],
  prerequisites: ['logica-03'],
  concepts: ['operadores'],
  explanation: [
    { type: 'h', text: 'Aritméticos' },
    {
      type: 'list',
      items: [
        '`+` soma, `-` subtrai, `*` multiplica, `/` divide.',
        '`%` (módulo) devolve o **resto** da divisão: `10 % 3` é `1`. Muito usado para saber se um número é par (`n % 2 === 0`).',
        '`**` é potência: `2 ** 3` é `8`.',
        'A precedência segue a matemática: `*` e `/` antes de `+` e `-`. Use parênteses para deixar a intenção clara.',
      ],
    },
    { type: 'h', text: 'Relacionais (comparação)' },
    {
      type: 'p',
      text: 'Comparações sempre resultam em um **boolean**: `5 > 3` é `true`. Os operadores são `>`, `<`, `>=`, `<=`, `===` (igual) e `!==` (diferente).',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: '=== e não ==',
      text: '`==` converte os tipos antes de comparar (`5 == "5"` é `true`), o que causa bugs difíceis de achar. `===` compara valor **e** tipo (`5 === "5"` é `false`). Use sempre `===` e `!==`.',
    },
    { type: 'h', text: 'Lógicos' },
    {
      type: 'list',
      items: [
        '`&&` (E): verdadeiro só se **os dois** lados forem verdadeiros.',
        '`||` (OU): verdadeiro se **pelo menos um** lado for verdadeiro.',
        '`!` (NÃO): inverte: `!true` é `false`.',
      ],
    },
    {
      type: 'p',
      text: 'Exemplo de regra de negócio: "ganha bônus quem bateu a meta **e** não teve devoluções" vira `bateuMeta && semDevolucoes`.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Sobre o exercício de código desta aula',
      text: 'O exercício independente usa uma estrutura `function ... return` já pronta. Você vai estudar funções na aula 7 — por enquanto, basta escrever a expressão depois de `return`. Os testes chamam a função com vários números para conferir sua expressão.',
    },
  ],
  analogy:
    'Os operadores lógicos funcionam como regras de entrada em um evento: "maior de idade E com ingresso" (&&) exige as duas coisas; "convidado OU com ingresso" (||) aceita qualquer uma.',
  example: {
    code: `const vendas = 4500;
const meta = 5000;

console.log(vendas + 500);
console.log(vendas % 1000);
console.log(vendas >= meta);
console.log(vendas < meta && vendas > 4000);
console.log(!(vendas >= meta));
console.log(10 === "10");`,
    lineByLine: [
      { line: 4, text: 'Soma: 4500 + 500 = 5000.' },
      { line: 5, text: 'Resto de 4500 ÷ 1000: cabem 4 vezes e sobram 500.' },
      { line: 6, text: '4500 é maior ou igual a 5000? Não: false.' },
      { line: 7, text: 'Os dois lados são verdadeiros (4500 < 5000 e 4500 > 4000), então && dá true.' },
      { line: 8, text: 'vendas >= meta é false; ! inverte para true.' },
      { line: 9, text: 'Mesmo "parecendo" iguais, um é number e outro é string: === dá false.' },
    ],
    output: `5000
500
false
true
true
false`,
  },
  commonErrors: [
    {
      title: 'Usar = para comparar',
      wrong: 'if (vendas = meta)',
      why: '= atribui (muda o valor de vendas!). Para comparar use ===.',
      fix: '`if (vendas === meta)`',
    },
    {
      title: 'Encadear comparações como na matemática',
      wrong: '1 < nota < 10',
      why: 'O JavaScript avalia 1 < nota (true/false) e depois compara esse boolean com 10. O resultado quase sempre é true.',
      fix: '`nota > 1 && nota < 10`',
    },
    {
      title: 'Esquecer a precedência',
      wrong: 'const media = 8 + 6 / 2; // 11, não 7',
      why: '/ é calculado antes de +.',
      fix: '`(8 + 6) / 2`',
    },
  ],
  guidedExerciseId: 'ex-logica-04-guiado',
  independentExerciseId: 'ex-logica-04-independente',
  reviewQuestions: [
    { question: 'Quanto é 17 % 5?', answer: '2, porque 17 ÷ 5 = 3 com resto 2.' },
    { question: 'Por que preferir === a ==?', answer: 'Porque === compara valor e tipo, sem conversões automáticas que causam resultados inesperados.' },
    { question: 'Quando `a || b` é false?', answer: 'Somente quando a e b são falsos.' },
  ],
  summary: [
    'Aritméticos: + - * / % **. % devolve o resto.',
    'Comparações resultam em boolean. Use === e !==.',
    '&& exige os dois lados verdadeiros; || exige pelo menos um; ! inverte.',
    'Parênteses deixam a precedência explícita.',
  ],
  completionCriteria: [
    'Prever o resultado de expressões com operadores (exercício guiado).',
    'Escrever uma expressão com % e === que passe nos testes (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-04-guiado',
    type: 'predict-output',
    title: 'Avalie as expressões',
    difficulty: 'iniciante',
    concepts: ['operadores'],
    statement: 'Escreva a saída do código, uma linha por console.log.',
    code: `console.log(10 % 3);
console.log(2 ** 3);
console.log(7 > 3 && 2 > 5);
console.log(7 > 3 || 2 > 5);
console.log(5 === "5");`,
    expectedOutput: `1
8
false
true
false`,
    hints: [
      'Conceito: % é resto, ** é potência, && exige os dois lados verdadeiros e || exige pelo menos um.',
      'Raciocínio: resolva cada lado das expressões lógicas separadamente antes de combiná-los.',
      'Estrutura: 7 > 3 é true e 2 > 5 é false. Então a linha 3 é true && false e a linha 4 é true || false.',
    ],
    solution: {
      explanation:
        '10 % 3 = 1 (resto). 2 ** 3 = 8. true && false = false. true || false = true. 5 === "5" é false porque os tipos são diferentes (number e string).',
    },
  },
  {
    id: 'ex-logica-04-independente',
    type: 'code',
    task: 'complete-code',
    title: 'O número é par?',
    difficulty: 'iniciante',
    concepts: ['operadores'],
    statement: 'Complete a função para que ela devolva true quando o número for par e false quando for ímpar.',
    context: 'A estrutura da função já está pronta. Substitua o comentário por uma expressão depois de return.',
    requirements: [
      'Use o operador % (resto da divisão).',
      'Use === para comparar.',
      'O resultado deve ser um boolean (true ou false), não um texto.',
    ],
    starterCode: `function ehPar(numero) {
  return /* sua expressão aqui */;
}

console.log(ehPar(4)); // esperado: true
console.log(ehPar(7)); // esperado: false`,
    tests: [
      { name: 'ehPar(4) devolve true', code: 'return ehPar(4);', expected: true },
      { name: 'ehPar(7) devolve false', code: 'return ehPar(7);', expected: false },
      { name: 'ehPar(0) devolve true', code: 'return ehPar(0);', expected: true },
      { name: 'Funciona com negativos', code: 'return ehPar(-2);', expected: true, hidden: true },
      { name: 'Funciona com 15', code: 'return ehPar(15);', expected: false, hidden: true },
    ],
    constraints: [{ kind: 'must-include', pattern: '%', message: 'Use o operador % para resolver.' }],
    hints: [
      'Conceito: um número é par quando o resto da divisão por 2 é zero.',
      'Raciocínio: calcule numero % 2 para alguns números (4 % 2, 7 % 2). Que valor aparece para os pares?',
      'Estrutura: return numero % 2 ___ 0; — qual operador de comparação entra no espaço?',
    ],
    solution: {
      code: `function ehPar(numero) {
  // O resto da divisão por 2 é 0 para todo número par.
  return numero % 2 === 0;
}`,
      explanation:
        'numero % 2 vale 0 para pares e 1 (ou -1, para negativos ímpares) para ímpares. Comparar com === 0 já produz o boolean desejado — não é preciso if.',
    },
  },
];
