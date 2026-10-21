import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-06',
  trackId: 'logica-js',
  moduleId: 'logica-m2',
  title: 'Laços de repetição: for e while',
  durationMin: 25,
  objectives: [
    'Repetir instruções com for e while.',
    'Usar variáveis acumuladoras e contadoras.',
    'Percorrer os caracteres de um texto.',
    'Reconhecer e evitar laços infinitos.',
  ],
  prerequisites: ['logica-05'],
  concepts: ['lacos'],
  explanation: [
    {
      type: 'p',
      text: 'Um **laço** (*loop*) repete um bloco de código enquanto uma condição for verdadeira. Em vez de escrever 100 linhas iguais, escrevemos o bloco uma vez e deixamos o laço repetir.',
    },
    { type: 'h', text: 'for: quando você sabe quantas vezes repetir' },
    {
      type: 'code',
      code: `for (let i = 1; i <= 3; i++) {
  console.log("Volta", i);
}`,
    },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Inicialização** `let i = 1`: roda uma única vez, no início.',
        '**Condição** `i <= 3`: testada antes de cada volta. Se for false, o laço termina.',
        '**Atualização** `i++` (o mesmo que `i = i + 1`): roda no fim de cada volta.',
      ],
    },
    { type: 'h', text: 'while: quando você repete até algo acontecer' },
    {
      type: 'code',
      code: `let saldo = 100;
while (saldo > 0) {
  saldo = saldo - 30;
}`,
    },
    {
      type: 'p',
      text: 'O `while` só tem condição. Você é responsável por fazer algo **dentro** do bloco que, em algum momento, torne a condição falsa. Senão, o laço nunca termina (**laço infinito**) — o DevPath interrompe o código depois de alguns segundos.',
    },
    { type: 'h', text: 'Acumuladores e contadores' },
    {
      type: 'list',
      items: [
        '**Acumulador**: começa em 0 e soma algo a cada volta (`total = total + valor`).',
        '**Contador**: começa em 0 e soma 1 quando algo acontece (`quantidade = quantidade + 1`).',
        'Ambos são declarados **antes** do laço, com `let`.',
      ],
    },
    { type: 'h', text: 'Percorrendo um texto' },
    {
      type: 'p',
      text: 'Strings têm tamanho (`texto.length`) e posições numeradas a partir de **0**: em `"Ana"`, `texto[0]` é `"A"` e `texto[2]` é `"a"`. Para visitar cada letra: `for (let i = 0; i < texto.length; i++)`. Para comparar sem se preocupar com maiúsculas, use `texto.toLowerCase()`, que devolve o texto todo em minúsculas.',
    },
  ],
  analogy:
    'Dar voltas numa pista de corrida: o for é "dê 10 voltas" (você sabe quantas); o while é "corra até cansar" (repete até uma condição mudar).',
  example: {
    code: `let total = 0;

for (let dia = 1; dia <= 5; dia++) {
  total = total + 100;
  console.log("Dia", dia, "- total:", total);
}

console.log("Total da semana:", total);`,
    lineByLine: [
      { line: 1, text: 'Acumulador declarado antes do laço, começando em 0.' },
      { line: 3, text: 'dia começa em 1; o laço roda enquanto dia <= 5; a cada volta dia aumenta 1.' },
      { line: 4, text: 'A cada volta, o total recebe mais 100.' },
      { line: 5, text: 'Mostra o andamento — uma forma simples de acompanhar o que o laço faz.' },
      { line: 8, text: 'Depois que o laço termina, o código segue normalmente.' },
    ],
    output: `Dia 1 - total: 100
Dia 2 - total: 200
Dia 3 - total: 300
Dia 4 - total: 400
Dia 5 - total: 500
Total da semana: 500`,
  },
  commonErrors: [
    {
      title: 'Laço infinito',
      wrong: 'let i = 0;\nwhile (i < 5) {\n  console.log(i);\n}',
      why: 'i nunca muda, então i < 5 é sempre true.',
      fix: 'Atualize a variável de controle dentro do laço: `i++`.',
    },
    {
      title: 'Declarar o acumulador dentro do laço',
      wrong: 'for (let i = 0; i < 3; i++) {\n  let total = 0;\n  total = total + 10;\n}',
      why: 'O total é recriado com 0 a cada volta e nunca acumula.',
      fix: 'Declare `let total = 0;` antes do for.',
    },
    {
      title: 'Errar o limite (off-by-one)',
      wrong: 'for (let i = 0; i <= texto.length; i++)',
      why: 'As posições vão de 0 até length - 1. Com <=, a última volta acessa uma posição que não existe (undefined).',
      fix: 'Use `i < texto.length`.',
    },
  ],
  guidedExerciseId: 'ex-logica-06-guiado',
  independentExerciseId: 'ex-logica-06-independente',
  reviewQuestions: [
    { question: 'Quais são as três partes do for?', answer: 'Inicialização (roda uma vez), condição (testada antes de cada volta) e atualização (roda no fim de cada volta).' },
    { question: 'Qual a diferença entre um acumulador e um contador?', answer: 'O acumulador soma valores variados (ex.: preços); o contador soma 1 sempre que algo acontece.' },
    { question: 'Quais índices existem em um texto de 5 letras?', answer: 'De 0 a 4. O índice 5 não existe.' },
  ],
  summary: [
    'Laços repetem um bloco enquanto a condição for verdadeira.',
    'for: inicialização; condição; atualização.',
    'while: repete até a condição ficar falsa — garanta que ela fique.',
    'Acumuladores e contadores são declarados antes do laço.',
    'Posições de strings começam em 0 e vão até length - 1.',
  ],
  completionCriteria: [
    'Somar uma sequência com um acumulador (exercício guiado).',
    'Percorrer um texto e contar caracteres (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-06-guiado',
    type: 'code',
    task: 'write-function',
    title: 'Soma de 1 até n',
    difficulty: 'basico',
    concepts: ['lacos'],
    statement: 'Escreva a função somarAte(n), que devolve a soma de todos os inteiros de 1 até n. Exemplo: somarAte(4) = 1 + 2 + 3 + 4 = 10.',
    requirements: ['Use um laço (for ou while).', 'Para n igual a 0, devolva 0.'],
    starterCode: `function somarAte(n) {
  let soma = 0;
  // use um laço para somar de 1 até n
  return soma;
}

console.log(somarAte(4)); // esperado: 10`,
    tests: [
      { name: 'somarAte(1) → 1', code: 'return somarAte(1);', expected: 1 },
      { name: 'somarAte(4) → 10', code: 'return somarAte(4);', expected: 10 },
      { name: 'somarAte(10) → 55', code: 'return somarAte(10);', expected: 55 },
      { name: 'somarAte(0) → 0', code: 'return somarAte(0);', expected: 0 },
      { name: 'somarAte(100) → 5050', code: 'return somarAte(100);', expected: 5050, hidden: true },
    ],
    constraints: [{ kind: 'must-include', pattern: '\\b(for|while)\\b', message: 'Use um laço for ou while — praticar laços é o objetivo deste exercício.' }],
    hints: [
      'Conceito: um acumulador que recebe um valor diferente a cada volta do laço.',
      'Raciocínio: a variável do laço deve assumir os valores 1, 2, 3, ..., n. Em cada volta, some essa variável a soma.',
      'Estrutura: for (let i = 1; i <= n; i++) { soma = soma + ___; }',
    ],
    solution: {
      code: `function somarAte(n) {
  let soma = 0;
  for (let i = 1; i <= n; i++) {
    soma = soma + i; // acumula 1, depois 2, depois 3...
  }
  return soma;
}`,
      explanation:
        'i percorre de 1 até n (inclusive, por isso <=). A cada volta, i é somado ao acumulador. Com n = 0, a condição 1 <= 0 já é falsa e o laço não roda: a função devolve 0.',
    },
  },
  {
    id: 'ex-logica-06-independente',
    type: 'code',
    task: 'algorithm',
    title: 'Conte as vogais',
    difficulty: 'basico',
    concepts: ['lacos', 'condicionais'],
    statement: 'Escreva a função contarVogais(texto), que devolve quantas vogais (a, e, i, o, u) existem no texto.',
    requirements: [
      'Considere maiúsculas e minúsculas (A e a contam).',
      'Letras acentuadas (á, ã, é...) não contam.',
      'Texto vazio devolve 0.',
    ],
    starterCode: `function contarVogais(texto) {
  // percorra o texto letra por letra
}

console.log(contarVogais("banana")); // esperado: 3`,
    tests: [
      { name: '"banana" → 3', code: 'return contarVogais("banana");', expected: 3 },
      { name: '"JavaScript" → 3', code: 'return contarVogais("JavaScript");', expected: 3 },
      { name: '"xyz" → 0', code: 'return contarVogais("xyz");', expected: 0 },
      { name: 'Texto vazio → 0', code: 'return contarVogais("");', expected: 0 },
      { name: 'Maiúsculas contam', code: 'return contarVogais("AEIOU");', expected: 5, hidden: true },
      { name: 'Acentuadas não contam', code: 'return contarVogais("Olá mundo");', expected: 3, hidden: true },
    ],
    hints: [
      'Conceito: laço com contador + condição dentro do laço.',
      'Raciocínio: decomponha: (1) visitar cada letra; (2) decidir se é vogal; (3) se for, somar 1 ao contador. Para ignorar maiúsculas, converta a letra com toLowerCase().',
      'Estrutura: let quantidade = 0; for (let i = 0; i < texto.length; i++) { const letra = texto[i].toLowerCase(); if (letra === "a" || ...) { quantidade++; } } return quantidade;',
    ],
    solution: {
      code: `function contarVogais(texto) {
  let quantidade = 0;
  for (let i = 0; i < texto.length; i++) {
    const letra = texto[i].toLowerCase();
    if (letra === "a" || letra === "e" || letra === "i" || letra === "o" || letra === "u") {
      quantidade++;
    }
  }
  return quantidade;
}`,
      explanation:
        'O for visita as posições 0 até length - 1. Cada letra é convertida para minúscula, assim "A" e "a" são tratadas igualmente. O contador só aumenta quando a letra é uma das cinco vogais. Alternativa mais curta (que você verá depois): "aeiou".includes(letra).',
    },
  },
];
