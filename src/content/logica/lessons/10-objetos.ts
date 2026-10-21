import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-10',
  trackId: 'logica-js',
  moduleId: 'logica-m3',
  title: 'Objetos: agrupando informações',
  durationMin: 25,
  objectives: [
    'Representar entidades do mundo real com objetos.',
    'Ler e alterar propriedades com ponto e colchetes.',
    'Criar novas propriedades e devolver objetos em funções.',
    'Combinar arrays e objetos (lista de objetos).',
  ],
  prerequisites: ['logica-09'],
  concepts: ['objetos'],
  explanation: [
    {
      type: 'p',
      text: 'Um **objeto** agrupa informações relacionadas em pares **chave: valor**, chamados **propriedades** (*properties*). Um vendedor tem nome, total de vendas e meta — em vez de três variáveis soltas, usamos um objeto.',
    },
    {
      type: 'code',
      code: `const vendedor = {
  nome: "Ana",
  vendas: 4800,
  meta: 5000,
};`,
    },
    {
      type: 'list',
      items: [
        '**Notação de ponto**: `vendedor.nome`. É a forma mais comum.',
        '**Notação de colchetes**: `vendedor["nome"]`. Necessária quando o nome da propriedade está numa variável (`vendedor[campo]`) ou tem caracteres especiais.',
        'Atribuir a uma propriedade existente a **altera**; atribuir a uma que não existe a **cria**.',
        'Ler uma propriedade inexistente devolve `undefined`.',
      ],
    },
    { type: 'h', text: 'Arrays de objetos' },
    {
      type: 'p',
      text: 'A estrutura mais comum em aplicações reais é uma lista de objetos: `[{ nome: "Ana", vendas: 4800 }, { nome: "Bruno", vendas: 3000 }]`. Respostas de APIs, linhas de banco de dados e itens de uma tela quase sempre chegam assim.',
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'Funções podem devolver objetos: `return { nome: v.nome, bonus: 500 };`. É assim que uma função entrega vários resultados de uma vez.',
    },
  ],
  analogy:
    'Um objeto é como uma ficha cadastral: cada campo da ficha (nome, telefone, e-mail) é uma propriedade, e o que está escrito no campo é o valor.',
  example: {
    code: `const vendedor = {
  nome: "Ana",
  vendas: 4800,
  meta: 5000,
};

console.log(vendedor.nome);
console.log(vendedor["meta"]);

vendedor.vendas = vendedor.vendas + 700;
vendedor.atingiuMeta = vendedor.vendas >= vendedor.meta;

console.log(vendedor);`,
    lineByLine: [
      { line: 1, text: 'Objeto com três propriedades entre chaves.' },
      { line: 7, text: 'Notação de ponto: "Ana".' },
      { line: 8, text: 'Notação de colchetes, com o nome da propriedade como texto: 5000.' },
      { line: 10, text: 'Altera uma propriedade existente: 4800 + 700 = 5500.' },
      { line: 11, text: 'atingiuMeta não existia: a atribuição cria a propriedade, com o resultado da comparação (true).' },
      { line: 13, text: 'Exibe o objeto completo, já com as mudanças.' },
    ],
    output: `Ana
5000
{ nome: 'Ana', vendas: 5500, meta: 5000, atingiuMeta: true }`,
  },
  commonErrors: [
    {
      title: 'Colchetes sem aspas',
      wrong: 'vendedor[nome]',
      why: 'Sem aspas, nome é interpretado como uma variável chamada nome — que provavelmente não existe.',
      fix: '`vendedor["nome"]` ou `vendedor.nome`.',
    },
    {
      title: 'Esquecer a vírgula entre propriedades',
      wrong: '{ nome: "Ana" vendas: 10 }',
      why: 'SyntaxError: as propriedades precisam ser separadas por vírgula.',
      fix: '`{ nome: "Ana", vendas: 10 }`',
    },
    {
      title: 'Ler propriedade de algo que não é objeto',
      wrong: 'const v = vendedores[5];\nconsole.log(v.nome);',
      why: 'Se vendedores[5] não existe, v é undefined e ler .nome gera TypeError.',
      fix: 'Verifique se o item existe antes de acessar suas propriedades.',
    },
  ],
  guidedExerciseId: 'ex-logica-10-guiado',
  independentExerciseId: 'ex-logica-10-independente',
  reviewQuestions: [
    { question: 'Quando a notação de colchetes é necessária?', answer: 'Quando o nome da propriedade está em uma variável ou contém caracteres que não são válidos em um nome (como espaço ou hífen).' },
    { question: 'O que acontece ao atribuir a uma propriedade que não existe?', answer: 'A propriedade é criada.' },
    { question: 'Como uma função pode devolver vários resultados?', answer: 'Devolvendo um objeto com uma propriedade para cada resultado.' },
  ],
  summary: [
    'Objetos agrupam propriedades chave: valor.',
    'Acesse com ponto (obj.chave) ou colchetes (obj["chave"]).',
    'Atribuir altera ou cria propriedades.',
    'Listas de objetos são a estrutura de dados mais comum em aplicações.',
  ],
  completionCriteria: [
    'Ler, alterar e criar propriedades (exercício guiado).',
    'Escrever uma função que recebe e devolve objetos (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-10-guiado',
    type: 'fill-blanks',
    title: 'Manipulando o produto',
    difficulty: 'basico',
    concepts: ['objetos'],
    statement: 'Complete as lacunas seguindo os comentários de cada linha. Inclua o ponto (ou os colchetes) na resposta.',
    template: `const produto = { nome: "Mouse", preco: 80 };
console.log(produto[[0]]);  // exibe: Mouse
produto[[1]] = 72;           // altera o preço
produto[[2]] = 10;           // cria a propriedade estoque`,
    blanks: [
      { accept: ['.nome', '["nome"]', "['nome']"], width: 9 },
      { accept: ['.preco', '["preco"]', "['preco']"], width: 10 },
      { accept: ['.estoque', '["estoque"]', "['estoque']"], width: 12 },
    ],
    hints: [
      'Conceito: notação de ponto para ler, alterar e criar propriedades.',
      'Raciocínio: as três lacunas seguem o mesmo formato: o nome do objeto, um ponto e o nome da propriedade.',
      'Estrutura: a primeira resposta é .nome. Siga o mesmo padrão para as outras.',
    ],
    solution: {
      code: `const produto = { nome: "Mouse", preco: 80 };
console.log(produto.nome);  // Mouse
produto.preco = 72;         // altera uma propriedade existente
produto.estoque = 10;       // cria uma propriedade nova`,
      explanation: 'A mesma sintaxe (objeto.propriedade = valor) altera quando a propriedade existe e cria quando não existe. Colchetes com aspas também são aceitos.',
    },
  },
  {
    id: 'ex-logica-10-independente',
    type: 'code',
    task: 'write-function',
    title: 'Bônus do vendedor',
    difficulty: 'intermediario',
    concepts: ['objetos', 'funcoes', 'condicionais'],
    statement:
      'Escreva calcularBonus(vendedor). O vendedor é um objeto { nome, vendas, meta }. A função devolve um novo objeto { nome, atingiuMeta, bonus }.',
    requirements: [
      'atingiuMeta é true quando vendas >= meta.',
      'bonus é 10% das vendas se a meta foi atingida; caso contrário, 0.',
      'O objeto devolvido deve ter exatamente as propriedades nome, atingiuMeta e bonus.',
    ],
    starterCode: `function calcularBonus(vendedor) {
  // seu código aqui
}

console.log(calcularBonus({ nome: "Ana", vendas: 6000, meta: 5000 }));
// esperado: { nome: 'Ana', atingiuMeta: true, bonus: 600 }`,
    tests: [
      {
        name: 'Ana atingiu a meta',
        code: 'return calcularBonus({ nome: "Ana", vendas: 6000, meta: 5000 });',
        expected: { nome: 'Ana', atingiuMeta: true, bonus: 600 },
      },
      {
        name: 'Bruno não atingiu',
        code: 'return calcularBonus({ nome: "Bruno", vendas: 3000, meta: 5000 });',
        expected: { nome: 'Bruno', atingiuMeta: false, bonus: 0 },
      },
      {
        name: 'Exatamente na meta conta como atingida',
        code: 'return calcularBonus({ nome: "Carla", vendas: 5000, meta: 5000 });',
        expected: { nome: 'Carla', atingiuMeta: true, bonus: 500 },
      },
      {
        name: 'Vendas zeradas',
        code: 'return calcularBonus({ nome: "Davi", vendas: 0, meta: 1000 });',
        expected: { nome: 'Davi', atingiuMeta: false, bonus: 0 },
        hidden: true,
      },
    ],
    hints: [
      'Conceito: ler propriedades do objeto recebido e montar um objeto novo no return.',
      'Raciocínio: primeiro calcule atingiuMeta (um boolean). Depois use-o para decidir o bonus.',
      'Estrutura: const atingiuMeta = vendedor.vendas >= vendedor.meta; const bonus = ...; return { nome: vendedor.nome, atingiuMeta: atingiuMeta, bonus: bonus };',
    ],
    solution: {
      code: `function calcularBonus(vendedor) {
  const atingiuMeta = vendedor.vendas >= vendedor.meta;
  let bonus = 0;
  if (atingiuMeta) {
    bonus = vendedor.vendas * 0.1;
  }
  return {
    nome: vendedor.nome,
    atingiuMeta: atingiuMeta,
    bonus: bonus,
  };
}`,
      explanation:
        'Guardar a comparação em atingiuMeta evita repetir a mesma condição e deixa o código legível. A função não altera o objeto recebido: ela cria e devolve um objeto novo — uma prática que evita efeitos colaterais.',
    },
  },
];
