import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-11',
  trackId: 'logica-js',
  moduleId: 'logica-m3',
  title: 'Manipulação de dados: filter, map e reduce',
  durationMin: 30,
  objectives: [
    'Reconhecer três operações básicas sobre listas: filtrar, transformar e agregar.',
    'Usar filter, map e reduce com arrow functions.',
    'Comparar a versão com laço e a versão com métodos de array.',
    'Agrupar dados em um objeto.',
  ],
  prerequisites: ['logica-10'],
  concepts: ['manipulacao-dados'],
  explanation: [
    {
      type: 'p',
      text: 'Quase todo processamento de dados em uma aplicação é uma combinação de três operações sobre listas. Você já sabe fazer as três com laços — os métodos de array só dão nome e forma a esses padrões.',
    },
    {
      type: 'list',
      items: [
        '**Filtrar** (`filter`): manter só os itens que passam em um teste. Devolve um array **menor ou igual**.',
        '**Transformar** (`map`): converter cada item em outro valor. Devolve um array **do mesmo tamanho**.',
        '**Agregar** (`reduce`): combinar todos os itens em **um único valor** (soma, total, objeto).',
      ],
    },
    {
      type: 'p',
      text: 'Esses métodos recebem uma **função** como argumento (chamada de *callback*). O array chama essa função para cada item. Arrow functions deixam isso curto: `(v) => v.vendas >= 5000` é "dado v, devolva se v vendeu 5000 ou mais".',
    },
    {
      type: 'code',
      code: `// Com laço
const nomes = [];
for (const v of vendedores) {
  nomes.push(v.nome);
}

// Com map: mesma coisa
const nomes2 = vendedores.map((v) => v.nome);`,
    },
    { type: 'h', text: 'reduce passo a passo' },
    {
      type: 'p',
      text: '`lista.reduce((acumulador, item) => novoAcumulador, valorInicial)`. É o padrão do acumulador em uma linha: o valor inicial faz o papel de `let total = 0`, e a função diz como o acumulador muda a cada item.',
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'filter, map e reduce **não alteram** o array original: devolvem um valor novo. Isso evita efeitos colaterais e é a base do jeito como o React trabalha com dados.',
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'Use o laço quando a lógica ficar mais clara com ele. Métodos de array não são "melhores"; são mais expressivos quando o problema é exatamente filtrar, transformar ou agregar.',
    },
  ],
  analogy:
    'Numa linha de produção de sucos: filter é o funcionário que descarta frutas estragadas, map é a máquina que transforma cada fruta em suco, e reduce é o tanque que junta todo o suco em um único volume.',
  example: {
    code: `const vendedores = [
  { nome: "Ana", vendas: 6000 },
  { nome: "Bruno", vendas: 3000 },
  { nome: "Carla", vendas: 5200 },
];

const acimaDaMeta = vendedores.filter((v) => v.vendas >= 5000);
const nomes = acimaDaMeta.map((v) => v.nome);
const totalVendido = vendedores.reduce((soma, v) => soma + v.vendas, 0);

console.log(nomes);
console.log(totalVendido);`,
    lineByLine: [
      { line: 1, text: 'Uma lista de objetos — o formato típico de dados reais.' },
      { line: 7, text: 'filter mantém só quem vendeu 5000 ou mais: Ana e Carla.' },
      { line: 8, text: 'map transforma cada objeto no seu nome: ["Ana", "Carla"].' },
      { line: 9, text: 'reduce começa com 0 e soma as vendas de cada um: 6000 + 3000 + 5200.' },
    ],
    output: `[ 'Ana', 'Carla' ]
14200`,
  },
  commonErrors: [
    {
      title: 'Esquecer o return em arrow functions com chaves',
      wrong: 'lista.map((v) => { v.nome });',
      why: 'Com chaves, o corpo é um bloco e precisa de return. O resultado vira um array de undefined.',
      fix: '`lista.map((v) => v.nome)` ou `lista.map((v) => { return v.nome; })`.',
    },
    {
      title: 'Esquecer o valor inicial do reduce',
      wrong: 'vendedores.reduce((soma, v) => soma + v.vendas);',
      why: 'Sem valor inicial, o primeiro acumulador é o primeiro objeto inteiro, e a soma vira texto estranho como "[object Object]3000".',
      fix: 'Sempre informe o valor inicial: `, 0)`.',
    },
    {
      title: 'Esperar que map altere o array original',
      wrong: 'precos.map((p) => p * 2);\nconsole.log(precos); // inalterado',
      why: 'map devolve um array novo.',
      fix: 'Guarde o resultado: `const dobrados = precos.map(...)`.',
    },
  ],
  guidedExerciseId: 'ex-logica-11-guiado',
  independentExerciseId: 'ex-logica-11-independente',
  reviewQuestions: [
    { question: 'Qual método usar para obter só os pedidos acima de R$ 100?', answer: 'filter, porque queremos manter parte dos itens.' },
    { question: 'Se um array tem 8 itens, quantos itens tem o resultado de map?', answer: '8. map sempre devolve um array do mesmo tamanho.' },
    { question: 'Qual o papel do segundo argumento do reduce?', answer: 'É o valor inicial do acumulador, como o let total = 0 antes de um laço.' },
  ],
  summary: [
    'filter mantém itens, map transforma itens, reduce agrega em um valor.',
    'Os três recebem uma função (callback) e não alteram o array original.',
    'Arrow functions de uma linha devolvem o valor automaticamente.',
    'Escolha a forma (laço ou método) que deixa a intenção mais clara.',
  ],
  completionCriteria: [
    'Refatorar um laço para filter + map mantendo o comportamento (exercício guiado).',
    'Agrupar dados por chave em um objeto (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-11-guiado',
    type: 'code',
    task: 'refactor',
    title: 'Refatore com filter e map',
    difficulty: 'intermediario',
    concepts: ['manipulacao-dados', 'arrays'],
    statement:
      'A função abaixo funciona, mas usa um laço manual. Refatore-a usando filter e map, sem for nem while. O comportamento deve continuar exatamente o mesmo.',
    context: 'Refatorar é mudar a estrutura do código sem mudar o que ele faz. Os testes garantem que o comportamento foi preservado.',
    starterCode: `function nomesQueBateramMeta(vendedores, meta) {
  const resultado = [];
  for (let i = 0; i < vendedores.length; i++) {
    if (vendedores[i].vendas >= meta) {
      resultado.push(vendedores[i].nome);
    }
  }
  return resultado;
}

const equipe = [
  { nome: "Ana", vendas: 6000 },
  { nome: "Bruno", vendas: 3000 },
  { nome: "Carla", vendas: 5200 },
];
console.log(nomesQueBateramMeta(equipe, 5000)); // [ 'Ana', 'Carla' ]`,
    tests: [
      {
        name: 'Mantém a ordem e filtra corretamente',
        code: 'return nomesQueBateramMeta([{ nome: "Ana", vendas: 6000 }, { nome: "Bruno", vendas: 3000 }, { nome: "Carla", vendas: 5200 }], 5000);',
        expected: ['Ana', 'Carla'],
      },
      { name: 'Lista vazia → []', code: 'return nomesQueBateramMeta([], 5000);', expected: [] },
      {
        name: 'Ninguém bateu a meta → []',
        code: 'return nomesQueBateramMeta([{ nome: "Bruno", vendas: 3000 }], 5000);',
        expected: [],
      },
      {
        name: 'Valor igual à meta conta',
        code: 'return nomesQueBateramMeta([{ nome: "Eva", vendas: 100 }, { nome: "Fábio", vendas: 99 }], 100);',
        expected: ['Eva'],
        hidden: true,
      },
    ],
    constraints: [
      { kind: 'must-include', pattern: '\\.filter\\(', message: 'Use filter para selecionar os vendedores.' },
      { kind: 'must-include', pattern: '\\.map\\(', message: 'Use map para extrair os nomes.' },
      { kind: 'must-not-include', pattern: '\\b(for|while)\\b', message: 'Remova o laço for/while — a ideia é substituí-lo por filter e map.' },
    ],
    hints: [
      'Conceito: o if dentro do laço é um filtro; o push de vendedores[i].nome é uma transformação.',
      'Raciocínio: primeiro filtre os objetos que batem a meta; depois transforme cada objeto em seu nome. Dá para encadear: lista.filter(...).map(...).',
      'Estrutura: return vendedores.filter((v) => v.vendas >= ___).map((v) => ___);',
    ],
    solution: {
      code: `function nomesQueBateramMeta(vendedores, meta) {
  return vendedores
    .filter((v) => v.vendas >= meta) // mantém quem bateu a meta
    .map((v) => v.nome);             // transforma cada objeto no nome
}`,
      explanation:
        'O if do laço vira o critério do filter, e o push do nome vira o map. A versão final descreve o que se quer ("filtre e pegue os nomes") em vez de como fazer passo a passo. Note que meta, o parâmetro da função, continua acessível dentro das arrow functions (escopo de fora para dentro).',
    },
  },
  {
    id: 'ex-logica-11-independente',
    type: 'code',
    task: 'algorithm',
    title: 'Total por vendedor',
    difficulty: 'intermediario',
    concepts: ['manipulacao-dados', 'objetos'],
    statement:
      'Escreva totalPorVendedor(vendas). Cada venda é { vendedor, valor }. Devolva um objeto em que cada chave é o nome do vendedor e o valor é a soma das suas vendas.',
    requirements: [
      'Exemplo: [{ vendedor: "Ana", valor: 100 }, { vendedor: "Bruno", valor: 50 }, { vendedor: "Ana", valor: 200 }] → { Ana: 300, Bruno: 50 }.',
      'Lista vazia devolve {}.',
      'Você pode usar laço ou reduce.',
    ],
    starterCode: `function totalPorVendedor(vendas) {
  const totais = {};
  // para cada venda, some o valor no total do vendedor
  return totais;
}

console.log(totalPorVendedor([
  { vendedor: "Ana", valor: 100 },
  { vendedor: "Bruno", valor: 50 },
  { vendedor: "Ana", valor: 200 },
]));`,
    tests: [
      {
        name: 'Agrupa e soma',
        code: 'return totalPorVendedor([{ vendedor: "Ana", valor: 100 }, { vendedor: "Bruno", valor: 50 }, { vendedor: "Ana", valor: 200 }]);',
        expected: { Ana: 300, Bruno: 50 },
      },
      { name: 'Lista vazia → {}', code: 'return totalPorVendedor([]);', expected: {} },
      { name: 'Uma única venda', code: 'return totalPorVendedor([{ vendedor: "Carla", valor: 70 }]);', expected: { Carla: 70 } },
      {
        name: 'Vários vendedores, várias vendas',
        code: 'return totalPorVendedor([{ vendedor: "A", valor: 1 }, { vendedor: "B", valor: 2 }, { vendedor: "A", valor: 3 }, { vendedor: "B", valor: 4 }, { vendedor: "C", valor: 5 }]);',
        expected: { A: 4, B: 6, C: 5 },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: um objeto pode ser usado como "acumulador com várias gavetas" — uma chave por vendedor. Use colchetes porque o nome da chave está numa variável.',
      'Raciocínio: para cada venda, existem dois casos: o vendedor ainda não está em totais (comece com o valor) ou já está (some o valor ao que já existe).',
      'Estrutura: for (const venda of vendas) { if (totais[venda.vendedor] === undefined) { totais[venda.vendedor] = 0; } totais[venda.vendedor] = totais[venda.vendedor] + venda.valor; }',
    ],
    solution: {
      code: `function totalPorVendedor(vendas) {
  const totais = {};
  for (const venda of vendas) {
    const nome = venda.vendedor;
    if (totais[nome] === undefined) {
      totais[nome] = 0; // primeira venda deste vendedor
    }
    totais[nome] = totais[nome] + venda.valor;
  }
  return totais;
}

// Alternativa com reduce:
// return vendas.reduce((totais, venda) => {
//   totais[venda.vendedor] = (totais[venda.vendedor] || 0) + venda.valor;
//   return totais;
// }, {});`,
      explanation:
        'Como o nome do vendedor está em uma variável, a chave precisa ser acessada com colchetes: totais[nome]. Na primeira venda de alguém, a chave ainda não existe (undefined), então começamos em 0. A versão com reduce faz o mesmo, usando {} como valor inicial.',
    },
  },
];
