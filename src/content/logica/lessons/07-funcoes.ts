import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-07',
  trackId: 'logica-js',
  moduleId: 'logica-m2',
  title: 'Funções: parâmetros e retorno',
  durationMin: 25,
  objectives: [
    'Criar funções para reaproveitar lógica.',
    'Diferenciar parâmetros de argumentos.',
    'Entender a diferença entre return e console.log.',
    'Reconhecer a sintaxe de arrow function.',
  ],
  prerequisites: ['logica-06'],
  concepts: ['funcoes'],
  explanation: [
    {
      type: 'p',
      text: 'Uma **função** (*function*) é um bloco de código com nome, que recebe dados, faz um trabalho e devolve um resultado. Você já usou funções prontas nos exercícios — agora vai entender cada parte.',
    },
    {
      type: 'code',
      code: `function nomeDaFuncao(parametro1, parametro2) {
  // corpo: o trabalho da função
  return resultado;
}

nomeDaFuncao(argumento1, argumento2); // chamada`,
    },
    {
      type: 'list',
      items: [
        '**Parâmetros** são os nomes na declaração (`valorVendido`, `percentual`). Funcionam como variáveis que só existem dentro da função.',
        '**Argumentos** são os valores passados na chamada (`2000`, `5`).',
        'Declarar a função não executa nada. Ela só roda quando é **chamada**, com parênteses.',
      ],
    },
    { type: 'h', text: 'return × console.log' },
    {
      type: 'p',
      text: '`return` **devolve** um valor para quem chamou a função — esse valor pode ser guardado em variável, somado, comparado. `console.log` apenas **mostra** algo na tela; o valor não volta para o código. Uma função sem `return` devolve `undefined`.',
    },
    {
      type: 'p',
      text: 'Quando o `return` é executado, a função **termina imediatamente**. Por isso, em um if/else com returns, só um deles roda.',
    },
    { type: 'h', text: 'Arrow functions' },
    {
      type: 'p',
      text: 'Existe uma sintaxe mais curta, muito usada em JavaScript moderno: `const dobro = (n) => n * 2;`. Quando o corpo é uma única expressão, o valor é devolvido automaticamente. Você vai vê-la bastante na aula 11.',
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'Uma boa função faz **uma** coisa e tem um nome que diz o que ela faz, de preferência um verbo: `calcularComissao`, `validarEmail`, `formatarPreco`.',
    },
  ],
  analogy:
    'Uma função é como uma máquina de suco: os parâmetros são o lugar onde entram as frutas, o corpo é o processo de espremer e o return é o copo de suco que sai. console.log seria apenas mostrar o suco pela janela — ninguém consegue bebê-lo.',
  example: {
    code: `function calcularComissao(valorVendido, percentual) {
  const comissao = valorVendido * percentual / 100;
  return comissao;
}

const comissaoAna = calcularComissao(2000, 5);
const comissaoBruno = calcularComissao(3500, 5);

console.log(comissaoAna);
console.log(comissaoBruno);
console.log(comissaoAna + comissaoBruno);`,
    lineByLine: [
      { line: 1, text: 'Declaração: a função se chama calcularComissao e tem dois parâmetros.' },
      { line: 2, text: 'O cálculo usa os parâmetros como variáveis.' },
      { line: 3, text: 'return devolve o valor calculado para quem chamou.' },
      { line: 6, text: 'Chamada com os argumentos 2000 e 5: o retorno (100) é guardado em comissaoAna.' },
      { line: 7, text: 'A mesma função, reaproveitada com outros argumentos: 175.' },
      { line: 11, text: 'Como os valores foram devolvidos com return, podemos somá-los: 275.' },
    ],
    output: `100
175
275`,
  },
  commonErrors: [
    {
      title: 'Usar console.log no lugar de return',
      wrong: 'function dobro(n) {\n  console.log(n * 2);\n}\nconst x = dobro(5); // x é undefined',
      why: 'A função mostra o valor, mas não o devolve.',
      fix: '`return n * 2;`',
    },
    {
      title: 'Esquecer os parênteses na chamada',
      wrong: 'const total = calcularTotal;',
      why: 'Sem parênteses você não executa a função; você pega a própria função.',
      fix: '`const total = calcularTotal(10, 2);`',
    },
    {
      title: 'Código depois do return',
      wrong: 'return total;\nconsole.log("fim"); // nunca roda',
      why: 'return encerra a função imediatamente.',
      fix: 'Coloque o que precisa rodar antes do return.',
    },
  ],
  guidedExerciseId: 'ex-logica-07-guiado',
  independentExerciseId: 'ex-logica-07-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre parâmetro e argumento?', answer: 'Parâmetro é o nome na declaração da função; argumento é o valor passado na chamada.' },
    { question: 'O que uma função sem return devolve?', answer: 'undefined.' },
    { question: 'Por que preferir return a console.log dentro de funções de cálculo?', answer: 'Porque o valor devolvido pode ser reutilizado (guardado, somado, testado); o que é só exibido não volta para o código.' },
  ],
  summary: [
    'Funções agrupam lógica reutilizável com um nome.',
    'Parâmetros na declaração, argumentos na chamada.',
    'return devolve um valor e encerra a função; console.log só exibe.',
    'Arrow function: const f = (x) => x * 2;',
  ],
  completionCriteria: [
    'Corrigir uma função que exibe em vez de devolver (exercício guiado).',
    'Escrever uma função com parâmetros, cálculo e caso especial (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-07-guiado',
    type: 'code',
    task: 'fix-bug',
    title: 'A comissão que some',
    difficulty: 'basico',
    concepts: ['funcoes'],
    statement:
      'O código abaixo mostra a comissão na tela, mas quando outro trecho tenta somar comissões o resultado é NaN. Corrija a função para que o valor possa ser reutilizado.',
    starterCode: `function calcularComissao(valorVendido, percentual) {
  const comissao = valorVendido * percentual / 100;
  console.log(comissao);
}

const total = calcularComissao(2000, 5) + calcularComissao(1000, 10);
console.log("Total:", total); // esperado: Total: 200`,
    tests: [
      { name: 'calcularComissao(2000, 5) devolve 100', code: 'return calcularComissao(2000, 5);', expected: 100 },
      { name: 'calcularComissao(1000, 10) devolve 100', code: 'return calcularComissao(1000, 10);', expected: 100 },
      { name: 'Venda zero devolve 0', code: 'return calcularComissao(0, 5);', expected: 0 },
      { name: 'calcularComissao(3500, 4) devolve 140', code: 'return calcularComissao(3500, 4);', expected: 140, hidden: true },
    ],
    constraints: [{ kind: 'must-include', pattern: '\\breturn\\b', message: 'A função precisa devolver o valor com return.' }],
    hints: [
      'Conceito: return devolve um valor; console.log só exibe.',
      'Raciocínio: o que calcularComissao(2000, 5) devolve hoje? Some undefined + undefined e veja o que acontece.',
      'Estrutura: troque a linha do console.log por return ___;',
    ],
    solution: {
      code: `function calcularComissao(valorVendido, percentual) {
  const comissao = valorVendido * percentual / 100;
  return comissao; // devolve para quem chamou
}`,
      explanation:
        'Sem return, a função devolvia undefined, e undefined + undefined é NaN. Com return, cada chamada devolve o número calculado e a soma funciona (100 + 100 = 200).',
    },
  },
  {
    id: 'ex-logica-07-independente',
    type: 'code',
    task: 'write-function',
    title: 'Percentual da meta',
    difficulty: 'basico',
    concepts: ['funcoes', 'operadores', 'condicionais'],
    statement: 'Escreva percentualDaMeta(vendido, meta), que devolve quanto da meta foi atingido, em porcentagem inteira.',
    requirements: [
      'Fórmula: vendido ÷ meta × 100, arredondado com Math.round(valor).',
      'Exemplos: (500, 1000) → 50; (1500, 1000) → 150; (333, 1000) → 33.',
      'Se a meta for 0 ou negativa, devolva 0 (não existe divisão por zero útil aqui).',
    ],
    starterCode: `function percentualDaMeta(vendido, meta) {
  // seu código aqui
}

console.log(percentualDaMeta(500, 1000)); // esperado: 50`,
    tests: [
      { name: '(500, 1000) → 50', code: 'return percentualDaMeta(500, 1000);', expected: 50 },
      { name: '(1000, 1000) → 100', code: 'return percentualDaMeta(1000, 1000);', expected: 100 },
      { name: '(1500, 1000) → 150', code: 'return percentualDaMeta(1500, 1000);', expected: 150 },
      { name: '(333, 1000) → 33', code: 'return percentualDaMeta(333, 1000);', expected: 33 },
      { name: 'Meta 0 → 0', code: 'return percentualDaMeta(100, 0);', expected: 0 },
      { name: 'Arredonda para cima quando necessário', code: 'return percentualDaMeta(2, 3);', expected: 67, hidden: true },
      { name: 'Meta negativa → 0', code: 'return percentualDaMeta(100, -5);', expected: 0, hidden: true },
    ],
    hints: [
      'Conceito: uma função com um caso especial tratado antes do cálculo principal.',
      'Raciocínio: primeiro trate a meta inválida (<= 0) com um if que já devolve 0. Depois calcule normalmente.',
      'Estrutura: if (meta <= 0) { return 0; } return Math.round(___ / ___ * 100);',
    ],
    solution: {
      code: `function percentualDaMeta(vendido, meta) {
  // Caso especial primeiro: evita divisão por zero
  if (meta <= 0) {
    return 0;
  }
  return Math.round(vendido / meta * 100);
}`,
      explanation:
        'Tratar o caso inválido no início com return (cláusula de guarda) deixa o resto da função simples. Math.round arredonda para o inteiro mais próximo: 66,67 vira 67.',
    },
  },
];
