import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-08',
  trackId: 'logica-js',
  moduleId: 'logica-m2',
  title: 'Escopo: onde cada variável existe',
  durationMin: 15,
  objectives: [
    'Entender escopo global, de função e de bloco.',
    'Prever quando uma variável está acessível.',
    'Reconhecer sombreamento (shadowing) de variáveis.',
    'Explicar por que evitar variáveis globais.',
  ],
  prerequisites: ['logica-07'],
  concepts: ['escopo'],
  explanation: [
    {
      type: 'p',
      text: '**Escopo** (*scope*) é a região do código onde um nome existe. Uma variável criada dentro de uma função não é visível fora dela — e isso é bom: cada função cuida das suas próprias variáveis.',
    },
    {
      type: 'list',
      items: [
        '**Escopo global**: declarada fora de qualquer função ou bloco. Visível em todo o arquivo.',
        '**Escopo de função**: declarada dentro de uma função (incluindo os parâmetros). Só existe enquanto a função roda.',
        '**Escopo de bloco**: `let` e `const` declarados dentro de `{ }` (if, for, while) só existem dentro daquelas chaves.',
      ],
    },
    {
      type: 'p',
      text: 'A regra de busca é **de dentro para fora**: o JavaScript procura o nome no bloco atual; se não encontrar, sobe para o bloco de fora, e assim por diante até o global. Ele nunca procura "para dentro".',
    },
    { type: 'h', text: 'Sombreamento' },
    {
      type: 'p',
      text: 'Se uma variável interna tem o mesmo nome de uma externa, a interna "faz sombra" (*shadowing*): dentro do bloco, o nome se refere à interna. A externa continua intacta.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Por que evitar globais',
      text: 'Qualquer parte do código pode alterar uma variável global, o que torna bugs difíceis de rastrear. Prefira passar valores por parâmetros e receber resultados por return.',
    },
  ],
  analogy:
    'Escopo é como os cômodos de uma casa com janelas espelhadas: de dentro do quarto você enxerga a sala (o escopo de fora), mas quem está na sala não enxerga o que há dentro do quarto.',
  example: {
    code: `const empresa = "DevPath Store";

function apresentar(vendedor) {
  const saudacao = "Olá, " + vendedor;
  console.log(saudacao + " da " + empresa);
}

apresentar("Ana");

if (true) {
  const mensagem = "Dentro do bloco";
  console.log(mensagem);
}

console.log(typeof saudacao);`,
    lineByLine: [
      { line: 1, text: 'empresa é global: visível em todo o arquivo.' },
      { line: 3, text: 'O parâmetro vendedor só existe dentro de apresentar.' },
      { line: 4, text: 'saudacao também é local à função.' },
      { line: 5, text: 'Dentro da função dá para ler empresa: a busca sobe para o escopo global.' },
      { line: 11, text: 'mensagem só existe dentro das chaves do if.' },
      { line: 15, text: 'Fora da função, saudacao não existe. typeof de um nome inexistente devolve "undefined" (sem lançar erro).' },
    ],
    output: `Olá, Ana da DevPath Store
Dentro do bloco
undefined`,
  },
  commonErrors: [
    {
      title: 'Usar fora do bloco uma variável criada dentro',
      wrong: 'if (vendas > meta) {\n  const bonus = 100;\n}\nconsole.log(bonus);',
      why: 'ReferenceError: bonus is not defined — bonus só existe dentro do if.',
      fix: 'Declare antes do bloco (`let bonus = 0;`) e atribua dentro dele.',
    },
    {
      title: 'Esperar que a função altere a variável de fora pelo parâmetro',
      wrong: 'let total = 0;\nfunction somar(total) { total = total + 10; }\nsomar(total); // total continua 0',
      why: 'O parâmetro total é uma variável nova, local, que sombreia a global.',
      fix: 'Devolva o novo valor: `total = somar(total);` com `return total + 10;` na função.',
    },
  ],
  guidedExerciseId: 'ex-logica-08-guiado',
  independentExerciseId: 'ex-logica-08-independente',
  reviewQuestions: [
    { question: 'Uma variável declarada com let dentro de um for existe depois do laço?', answer: 'Não. let e const têm escopo de bloco: só existem dentro das chaves do for.' },
    { question: 'Em que direção o JavaScript procura um nome?', answer: 'De dentro para fora: do bloco atual até o escopo global.' },
    { question: 'O que é sombreamento?', answer: 'Quando uma variável interna tem o mesmo nome de uma externa; dentro do bloco, o nome passa a se referir à interna.' },
  ],
  summary: [
    'Escopo é onde um nome existe.',
    'let e const respeitam blocos { }; parâmetros e variáveis de função são locais.',
    'A busca vai de dentro para fora, nunca de fora para dentro.',
    'Prefira parâmetros e return a variáveis globais.',
  ],
  completionCriteria: [
    'Prever a saída de um caso de sombreamento (exercício guiado).',
    'Identificar um ReferenceError causado por escopo de bloco (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-08-guiado',
    type: 'predict-output',
    title: 'Global ou local?',
    difficulty: 'basico',
    concepts: ['escopo'],
    statement: 'Qual é a saída do programa?',
    code: `let mensagem = "global";

function teste() {
  let mensagem = "local";
  console.log(mensagem);
}

teste();
console.log(mensagem);`,
    expectedOutput: `local
global`,
    hints: [
      'Conceito: sombreamento — uma variável interna com o mesmo nome de uma externa.',
      'Raciocínio: dentro de teste, existem duas variáveis chamadas mensagem. Qual delas é encontrada primeiro na busca de dentro para fora?',
      'Estrutura: a primeira linha exibida vem de dentro da função; a segunda, de fora. A função alterou a variável global?',
    ],
    solution: {
      explanation:
        'Dentro de teste, let mensagem cria uma nova variável local que sombreia a global: o console.log interno mostra "local". A variável global nunca foi alterada, então o console.log de fora mostra "global".',
    },
  },
  {
    id: 'ex-logica-08-independente',
    type: 'multiple-choice',
    title: 'Onde está o desconto?',
    difficulty: 'basico',
    concepts: ['escopo', 'depuracao'],
    statement: 'O que acontece ao executar este código?',
    code: `function calcularTotal(preco, quantidade) {
  const total = preco * quantidade;
  if (total > 100) {
    const desconto = total * 0.1;
    return total - desconto;
  }
  console.log(desconto);
  return total;
}

calcularTotal(10, 5);`,
    options: [
      { id: 'a', text: 'Exibe 0, porque não houve desconto.', feedback: 'Nenhuma linha atribui 0 a desconto. Pense em onde desconto foi declarado.' },
      { id: 'b', text: 'Exibe undefined, porque o if não foi executado.', feedback: 'undefined seria o caso de uma variável declarada sem valor. Aqui, fora do if, o nome nem existe.' },
      {
        id: 'c',
        text: 'Lança ReferenceError: desconto is not defined, porque desconto só existe dentro do bloco do if.',
        feedback: 'Exatamente. const tem escopo de bloco, e o console.log está fora do bloco onde desconto foi criado.',
      },
      { id: 'd', text: 'Exibe 50, que é o total.', feedback: 'O total é 50, mas o console.log tenta exibir desconto, não total.' },
    ],
    correctOptionId: 'c',
    hints: [
      'Conceito: let e const só existem dentro das chaves onde foram declarados.',
      'Raciocínio: com preco 10 e quantidade 5, o total é 50. O if é executado? E onde desconto foi declarado?',
      'Estrutura: localize as chaves do if. A linha console.log(desconto) está dentro ou fora delas?',
    ],
    solution: {
      explanation:
        'desconto é declarado com const dentro do bloco do if, então só existe ali. O console.log está fora do bloco; para ele, o nome desconto não existe e o JavaScript lança ReferenceError. A correção seria declarar let desconto = 0; antes do if.',
    },
  },
];
