import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-12',
  trackId: 'logica-js',
  moduleId: 'logica-m3',
  title: 'Depuração e leitura de mensagens de erro',
  durationMin: 30,
  objectives: [
    'Ler uma mensagem de erro e identificar tipo, descrição e local.',
    'Diferenciar SyntaxError, ReferenceError e TypeError.',
    'Usar console.log de forma estratégica para investigar valores.',
    'Aplicar um processo de depuração: reproduzir, isolar, corrigir e testar.',
  ],
  prerequisites: ['logica-11'],
  concepts: ['depuracao'],
  explanation: [
    {
      type: 'p',
      text: '**Depurar** (*debug*) é encontrar e corrigir a causa de um comportamento errado. Programadores profissionais passam boa parte do tempo depurando — não é sinal de fracasso, é parte do trabalho. A diferença está em fazer isso com método, e não por tentativa e erro.',
    },
    { type: 'h', text: 'Anatomia de uma mensagem de erro' },
    {
      type: 'code',
      code: `TypeError: Cannot read properties of undefined (reading 'nome')
    at mostrarCliente (app.js:12:24)`,
    },
    {
      type: 'list',
      items: [
        '**Tipo** (antes dos dois-pontos): a categoria do problema.',
        '**Descrição**: o que exatamente aconteceu. Aqui: tentaram ler `.nome` de algo que é `undefined`.',
        '**Local**: arquivo, linha e coluna (`app.js:12:24`). Comece a investigação por ali — mas lembre que a causa pode estar antes.',
      ],
    },
    { type: 'h', text: 'Os três erros mais comuns' },
    {
      type: 'list',
      items: [
        '**SyntaxError**: o código não segue as regras da linguagem (faltou parêntese, chave, vírgula, aspas). Nada é executado.',
        '**ReferenceError**: um nome não existe naquele ponto (digitação errada, variável fora do escopo, usada antes de declarada).',
        '**TypeError**: a operação não faz sentido para aquele tipo de valor (chamar algo que não é função, ler propriedade de undefined/null, reatribuir const).',
      ],
    },
    {
      type: 'p',
      text: 'Nem todo bug gera erro. Muitas vezes o código roda e produz um **resultado errado** (como `NaN` ou um total diferente do esperado). Nesses casos, compare o resultado com o exemplo que você resolveu à mão.',
    },
    { type: 'h', text: 'Processo de depuração' },
    {
      type: 'list',
      ordered: true,
      items: [
        '**Reproduza**: encontre uma entrada que sempre causa o problema.',
        '**Isole**: descubra a menor parte do código onde o valor fica errado. Use `console.log` para ver os valores em pontos-chave (antes e depois da linha suspeita, a cada volta de um laço).',
        '**Formule uma hipótese**: "acho que o laço passa do último índice".',
        '**Corrija** uma coisa de cada vez.',
        '**Teste** de novo com o caso original e com casos-limite (lista vazia, zero, negativos).',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Ferramentas do navegador',
      text: 'No navegador, as DevTools (F12) têm a aba Console e a aba Sources, onde você pode pausar o código em uma linha (breakpoint) e inspecionar todas as variáveis. A palavra-chave `debugger;` também pausa ali quando as DevTools estão abertas. Explicar o código em voz alta, linha por linha, também funciona (a técnica do "pato de borracha").',
    },
  ],
  analogy:
    'Depurar é como o trabalho de um mecânico: ele não troca peças aleatoriamente. Primeiro reproduz o barulho, depois isola de onde ele vem, testa uma hipótese e confirma que o barulho sumiu.',
  example: {
    code: `function calcularMedia(notas) {
  let soma = 0;
  for (let i = 0; i <= notas.length; i++) {
    console.log("i =", i, "nota =", notas[i]);
    soma = soma + notas[i];
  }
  return soma / notas.length;
}

console.log(calcularMedia([8, 6, 10]));`,
    lineByLine: [
      { line: 3, text: 'O bug: <= faz o laço rodar uma vez a mais, com i = 3.' },
      { line: 4, text: 'console.log de investigação: mostra o índice e o valor em cada volta.' },
      { line: 5, text: 'Na última volta, notas[3] é undefined, e 24 + undefined é NaN.' },
      { line: 10, text: 'O resultado final é NaN. Os logs revelam exatamente onde o valor estragou. A correção é usar i < notas.length.' },
    ],
    output: `i = 0 nota = 8
i = 1 nota = 6
i = 2 nota = 10
i = 3 nota = undefined
NaN`,
  },
  commonErrors: [
    {
      title: 'Ler só a primeira palavra do erro',
      why: 'O tipo diz a categoria, mas a descrição diz o que aconteceu e a linha diz onde. Pular essas partes faz você procurar no lugar errado.',
      fix: 'Leia a mensagem inteira e vá até a linha indicada.',
    },
    {
      title: 'Mudar várias coisas ao mesmo tempo',
      why: 'Se funcionar, você não sabe o que resolveu; se piorar, não sabe o que estragou.',
      fix: 'Uma hipótese, uma mudança, um teste.',
    },
    {
      title: 'Esquecer os console.log de investigação no código final',
      why: 'Eles poluem a saída e podem expor dados.',
      fix: 'Remova-os depois de resolver o problema.',
    },
  ],
  guidedExerciseId: 'ex-logica-12-guiado',
  independentExerciseId: 'ex-logica-12-independente',
  reviewQuestions: [
    { question: 'Quais são as três partes de uma mensagem de erro?', answer: 'Tipo do erro, descrição do que aconteceu e local (arquivo, linha e coluna).' },
    { question: 'Um código que nem começa a executar provavelmente tem que tipo de erro?', answer: 'SyntaxError — o código não segue as regras da linguagem.' },
    { question: 'O que fazer quando o código não dá erro, mas o resultado está errado?', answer: 'Comparar com um exemplo resolvido à mão e usar console.log em pontos-chave para descobrir onde o valor deixa de ser o esperado.' },
  ],
  summary: [
    'Erros têm tipo, descrição e local — leia tudo.',
    'SyntaxError: regras da linguagem; ReferenceError: nome inexistente; TypeError: operação inválida para o tipo.',
    'Bugs sem erro aparecem como resultados errados: compare com o esperado.',
    'Processo: reproduzir, isolar, hipótese, corrigir uma coisa, testar de novo.',
  ],
  completionCriteria: [
    'Interpretar corretamente uma mensagem de TypeError (exercício guiado).',
    'Encontrar e corrigir vários bugs em uma função (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-12-guiado',
    type: 'multiple-choice',
    title: 'Interprete o TypeError',
    difficulty: 'basico',
    concepts: ['depuracao', 'arrays', 'objetos'],
    statement: 'Este código lança "TypeError: Cannot read properties of undefined (reading \'nome\')". Qual é a causa?',
    code: `const clientes = [{ nome: "Ana" }, { nome: "Bruno" }];
console.log(clientes[2].nome);`,
    options: [
      { id: 'a', text: 'A propriedade nome está escrita errado no objeto.', feedback: 'Os objetos têm a propriedade nome. A mensagem diz que o problema é o valor antes do ponto ser undefined.' },
      {
        id: 'b',
        text: 'clientes[2] não existe (os índices vão de 0 a 1), então é undefined — e não é possível ler .nome de undefined.',
        feedback: 'Isso. "reading \'nome\'" indica a propriedade que tentaram ler, e "of undefined" indica que o valor antes do ponto era undefined.',
      },
      { id: 'c', text: 'O array clientes não foi declarado.', feedback: 'Se clientes não existisse, o erro seria ReferenceError: clientes is not defined.' },
      { id: 'd', text: 'Não é possível guardar objetos dentro de arrays.', feedback: 'Arrays de objetos são muito comuns e totalmente válidos.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: "Cannot read properties of undefined" significa que o valor à esquerda do ponto é undefined.',
      'Raciocínio: quantos itens o array tem? Quais índices existem?',
      'Estrutura: o array tem 2 itens, com índices 0 e 1. O que clientes[2] devolve?',
    ],
    solution: {
      explanation:
        'O array tem dois itens (índices 0 e 1). clientes[2] devolve undefined, e tentar ler .nome de undefined gera o TypeError. A mensagem informa tanto a propriedade ("reading \'nome\'") quanto o valor problemático ("of undefined").',
    },
  },
  {
    id: 'ex-logica-12-independente',
    type: 'code',
    task: 'fix-bug',
    title: 'Três bugs no resumo de notas',
    difficulty: 'intermediario',
    concepts: ['depuracao', 'lacos', 'arrays'],
    statement:
      'A função resumoDeNotas deveria devolver { media, maior } de uma lista de notas, mas tem três bugs. Use console.log para investigar, encontre e corrija todos.',
    requirements: [
      'resumoDeNotas([8, 6, 10]) deve devolver { media: 8, maior: 10 }.',
      'Para uma lista vazia, devolva { media: 0, maior: null }.',
      'As notas vão de 0 a 10.',
    ],
    starterCode: `function resumoDeNotas(notas) {
  let soma = 0;
  let maior = 0;
  for (let i = 1; i <= notas.length; i++) {
    soma = soma + notas[i];
    if (notas[i] > maior) {
      maior = notas[i];
    }
  }
  const media = soma / notas.length;
  return { media: media, maior: maior };
}

console.log(resumoDeNotas([8, 6, 10])); // esperado: { media: 8, maior: 10 }
console.log(resumoDeNotas([]));         // esperado: { media: 0, maior: null }`,
    tests: [
      { name: '[8, 6, 10] → { media: 8, maior: 10 }', code: 'return resumoDeNotas([8, 6, 10]);', expected: { media: 8, maior: 10 } },
      { name: 'Uma nota', code: 'return resumoDeNotas([5]);', expected: { media: 5, maior: 5 } },
      { name: 'Maior no início', code: 'return resumoDeNotas([10, 2]);', expected: { media: 6, maior: 10 } },
      { name: 'Lista vazia', code: 'return resumoDeNotas([]);', expected: { media: 0, maior: null } },
      { name: 'Notas zeradas', code: 'return resumoDeNotas([0, 0]);', expected: { media: 0, maior: 0 }, hidden: true },
      { name: 'Notas iguais', code: 'return resumoDeNotas([7, 7, 7]);', expected: { media: 7, maior: 7 }, hidden: true },
    ],
    hints: [
      'Conceito: bugs de limite (off-by-one) em laços e casos especiais (lista vazia).',
      'Raciocínio: coloque console.log("i =", i, "nota =", notas[i]) dentro do laço e rode com [8, 6, 10]. Quais índices aparecem? Algum valor é undefined? Depois teste com [] e veja o que acontece com soma / 0.',
      'Estrutura: (1) o laço deve começar em 0; (2) a condição deve ser i < notas.length; (3) antes do laço, if (notas.length === 0) { return { media: 0, maior: null }; }',
    ],
    solution: {
      code: `function resumoDeNotas(notas) {
  // Bug 3: lista vazia geraria 0 / 0 = NaN
  if (notas.length === 0) {
    return { media: 0, maior: null };
  }
  let soma = 0;
  let maior = notas[0];
  // Bugs 1 e 2: começar em 0 e parar antes de notas.length
  for (let i = 0; i < notas.length; i++) {
    soma = soma + notas[i];
    if (notas[i] > maior) {
      maior = notas[i];
    }
  }
  const media = soma / notas.length;
  return { media: media, maior: maior };
}`,
      explanation:
        'Bug 1: o laço começava em 1 e ignorava a primeira nota. Bug 2: com <=, a última volta lia notas[notas.length], que é undefined, transformando a soma em NaN. Bug 3: a lista vazia não era tratada e 0 / 0 dá NaN. Começar maior com notas[0] também deixa o código correto mesmo que as regras mudem para aceitar notas negativas.',
    },
  },
];
