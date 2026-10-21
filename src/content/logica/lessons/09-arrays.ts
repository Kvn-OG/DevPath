import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-09',
  trackId: 'logica-js',
  moduleId: 'logica-m3',
  title: 'Arrays: listas de valores',
  durationMin: 25,
  objectives: [
    'Criar arrays e acessar itens pelo índice.',
    'Adicionar itens com push e consultar o tamanho com length.',
    'Percorrer arrays com for e for...of.',
    'Resolver problemas clássicos: soma, maior valor e contagem.',
  ],
  prerequisites: ['logica-08'],
  concepts: ['arrays'],
  explanation: [
    {
      type: 'p',
      text: 'Um **array** é uma lista ordenada de valores guardada em uma única variável: `const vendas = [1200, 850, 2300];`. Em vez de criar `venda1`, `venda2`, `venda3`, usamos uma estrutura que cresce conforme a necessidade.',
    },
    {
      type: 'list',
      items: [
        'Cada item tem um **índice** que começa em **0**: `vendas[0]` é 1200.',
        '`vendas.length` é a quantidade de itens. O último índice é sempre `length - 1`.',
        'Acessar um índice que não existe devolve `undefined` (não gera erro).',
        '`vendas.push(500)` adiciona um item no final.',
        '`vendas.includes(850)` devolve `true` se o valor existe no array.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'const com arrays',
      text: '`const vendas = [...]` impede trocar o array inteiro por outro (`vendas = []` dá erro), mas permite alterar o conteúdo (`vendas.push(10)` funciona).',
    },
    { type: 'h', text: 'Percorrendo arrays' },
    {
      type: 'code',
      code: `// for clássico: quando você precisa do índice
for (let i = 0; i < vendas.length; i++) {
  console.log(i, vendas[i]);
}

// for...of: quando só precisa do valor
for (const valor of vendas) {
  console.log(valor);
}`,
    },
    {
      type: 'p',
      text: 'Padrões que se repetem em todo tipo de sistema: **somar** (acumulador), **contar** (contador com if), **encontrar o maior** (comece com o primeiro item e troque quando achar um maior) e **filtrar** (criar um array novo e dar push só nos itens que interessam).',
    },
  ],
  analogy:
    'Um array é como uma fileira de armários numerados a partir do 0. O número do armário é o índice, e o que está guardado dentro é o valor.',
  example: {
    code: `const vendas = [1200, 850, 2300];

console.log(vendas[0]);
console.log(vendas.length);

vendas.push(500);

let total = 0;
for (const valor of vendas) {
  total = total + valor;
}

console.log(vendas);
console.log("Total:", total);`,
    lineByLine: [
      { line: 1, text: 'Array com três números.' },
      { line: 3, text: 'Índice 0 = primeiro item: 1200.' },
      { line: 4, text: 'São 3 itens.' },
      { line: 6, text: 'push adiciona 500 no final; agora são 4 itens.' },
      { line: 9, text: 'for...of entrega cada valor do array, um por volta.' },
      { line: 10, text: 'Acumulador: soma todos os valores.' },
      { line: 13, text: 'console.log de um array mostra os itens entre colchetes.' },
    ],
    output: `1200
3
[ 1200, 850, 2300, 500 ]
Total: 4850`,
  },
  commonErrors: [
    {
      title: 'Achar que o primeiro índice é 1',
      wrong: 'const primeiro = vendas[1];',
      why: 'vendas[1] é o segundo item.',
      fix: '`vendas[0]`',
    },
    {
      title: 'Acessar vendas[vendas.length]',
      wrong: 'const ultimo = vendas[vendas.length];',
      why: 'O último índice é length - 1; length aponta para fora do array e devolve undefined.',
      fix: '`vendas[vendas.length - 1]`',
    },
    {
      title: 'Começar o "maior valor" com 0',
      wrong: 'let maior = 0;',
      why: 'Se todos os números forem negativos, 0 nunca será substituído e o resultado fica errado.',
      fix: 'Comece com o primeiro item: `let maior = numeros[0];`',
    },
  ],
  guidedExerciseId: 'ex-logica-09-guiado',
  independentExerciseId: 'ex-logica-09-independente',
  reviewQuestions: [
    { question: 'Em um array de 6 itens, qual é o último índice?', answer: '5 (length - 1).' },
    { question: 'Quando usar for clássico e quando usar for...of?', answer: 'for clássico quando você precisa do índice; for...of quando só precisa dos valores.' },
    { question: 'O que vendas[10] devolve se o array tem 3 itens?', answer: 'undefined.' },
  ],
  summary: [
    'Arrays guardam listas ordenadas; índices começam em 0.',
    'length dá o tamanho; push adiciona no fim; includes verifica existência.',
    'Percorra com for (com índice) ou for...of (só valores).',
    'Padrões: somar, contar, encontrar o maior, filtrar.',
  ],
  completionCriteria: [
    'Encontrar o maior valor percorrendo o array (exercício guiado).',
    'Contar ocorrências em um array (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-09-guiado',
    type: 'code',
    task: 'write-function',
    title: 'Maior venda do mês',
    difficulty: 'intermediario',
    concepts: ['arrays', 'lacos'],
    statement: 'Escreva maiorValor(numeros), que devolve o maior número do array.',
    requirements: [
      'Não use Math.max nem sort — o objetivo é praticar o percurso do array.',
      'Se o array estiver vazio, devolva null.',
      'Deve funcionar com números negativos.',
    ],
    starterCode: `function maiorValor(numeros) {
  // trate o array vazio
  // percorra e guarde o maior encontrado até agora
}

console.log(maiorValor([1200, 850, 2300])); // esperado: 2300`,
    tests: [
      { name: '[3, 9, 2] → 9', code: 'return maiorValor([3, 9, 2]);', expected: 9 },
      { name: 'Somente negativos', code: 'return maiorValor([-5, -2, -8]);', expected: -2 },
      { name: 'Um único item', code: 'return maiorValor([7]);', expected: 7 },
      { name: 'Array vazio → null', code: 'return maiorValor([]);', expected: null },
      { name: 'Maior no fim', code: 'return maiorValor([1, 2, 3, 40]);', expected: 40, hidden: true },
      { name: 'Valores repetidos', code: 'return maiorValor([10, 50, 30, 50]);', expected: 50, hidden: true },
    ],
    constraints: [
      { kind: 'must-not-include', pattern: 'Math\\.max', message: 'Não use Math.max: percorra o array você mesmo.' },
      { kind: 'must-not-include', pattern: '\\.sort\\(', message: 'Não use sort: percorra o array você mesmo.' },
    ],
    hints: [
      'Conceito: percorrer o array guardando "o melhor até agora".',
      'Raciocínio: comece supondo que o primeiro item é o maior. Para cada item seguinte, se ele for maior que o guardado, troque.',
      'Estrutura: if (numeros.length === 0) return null; let maior = numeros[0]; for (...) { if (numeros[i] > maior) { maior = numeros[i]; } } return maior;',
    ],
    solution: {
      code: `function maiorValor(numeros) {
  if (numeros.length === 0) {
    return null;
  }
  let maior = numeros[0]; // começa com um valor que existe no array
  for (let i = 1; i < numeros.length; i++) {
    if (numeros[i] > maior) {
      maior = numeros[i];
    }
  }
  return maior;
}`,
      explanation:
        'Começar com numeros[0] (e não com 0) garante que o resultado seja sempre um item do array, inclusive quando todos são negativos. O laço começa em 1 porque o índice 0 já foi considerado.',
    },
  },
  {
    id: 'ex-logica-09-independente',
    type: 'code',
    task: 'write-function',
    title: 'Quantas vezes aparece?',
    difficulty: 'basico',
    concepts: ['arrays', 'lacos', 'condicionais'],
    statement: 'Escreva contarOcorrencias(lista, valor), que devolve quantas vezes valor aparece em lista.',
    requirements: ['Use === para comparar.', 'Lista vazia devolve 0.', 'Deve funcionar com números e textos.'],
    starterCode: `function contarOcorrencias(lista, valor) {
  // seu código aqui
}

console.log(contarOcorrencias([1, 2, 1, 3, 1], 1)); // esperado: 3`,
    tests: [
      { name: 'Conta números', code: 'return contarOcorrencias([1, 2, 1, 3, 1], 1);', expected: 3 },
      { name: 'Valor ausente → 0', code: 'return contarOcorrencias(["a", "b"], "c");', expected: 0 },
      { name: 'Lista vazia → 0', code: 'return contarOcorrencias([], 5);', expected: 0 },
      { name: 'Conta textos', code: 'return contarOcorrencias(["sim", "não", "sim"], "sim");', expected: 2, hidden: true },
      { name: 'Não confunde "1" com 1', code: 'return contarOcorrencias([1, "1", 1], 1);', expected: 2, hidden: true },
    ],
    hints: [
      'Conceito: contador + condição dentro de um laço.',
      'Raciocínio: percorra a lista; cada vez que o item for igual ao valor procurado, some 1.',
      'Estrutura: let quantidade = 0; for (const item of lista) { if (item === valor) { quantidade++; } } return quantidade;',
    ],
    solution: {
      code: `function contarOcorrencias(lista, valor) {
  let quantidade = 0;
  for (const item of lista) {
    if (item === valor) {
      quantidade++;
    }
  }
  return quantidade;
}`,
      explanation: 'for...of basta, porque o índice não importa. Usar === garante que "1" (texto) e 1 (número) sejam tratados como valores diferentes.',
    },
  },
];
