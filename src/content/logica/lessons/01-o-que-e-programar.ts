import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-01',
  trackId: 'logica-js',
  moduleId: 'logica-m1',
  title: 'O que é programar: algoritmos, entradas e saídas',
  durationMin: 15,
  objectives: [
    'Entender o que significa programar.',
    'Reconhecer um algoritmo como uma sequência finita de passos.',
    'Identificar entradas, processamento e saídas de um problema.',
    'Decompor um problema maior em etapas menores antes de escrever código.',
  ],
  prerequisites: [],
  concepts: ['algoritmos'],
  explanation: [
    {
      type: 'p',
      text: 'Programar é **descrever, com precisão, os passos que um computador deve seguir** para resolver um problema. O computador não "entende" a intenção: ele executa exatamente o que foi escrito, na ordem em que foi escrito.',
    },
    {
      type: 'p',
      text: 'Essa sequência de passos se chama **algoritmo** (*algorithm*). Um algoritmo precisa ser finito (termina em algum momento), não ambíguo (cada passo tem um único significado) e ter uma ordem definida.',
    },
    { type: 'h', text: 'Entrada, processamento e saída' },
    {
      type: 'p',
      text: 'Quase todo problema pode ser descrito em três partes. Pense nelas **antes** de escrever qualquer linha de código:',
    },
    {
      type: 'list',
      items: [
        '**Entrada** (*input*): os dados que o programa recebe. Ex.: o valor de uma venda.',
        '**Processamento**: o que é feito com esses dados. Ex.: multiplicar pelo percentual de comissão.',
        '**Saída** (*output*): o resultado entregue. Ex.: o valor da comissão exibido na tela.',
      ],
    },
    { type: 'h', text: 'Decomposição de problemas' },
    {
      type: 'p',
      text: 'Problemas grandes assustam porque tentamos resolvê-los de uma vez. **Decompor** é quebrar o problema em partes pequenas, cada uma simples de resolver e de testar. Programadores experientes fazem isso o tempo todo — é a habilidade mais importante deste curso.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Método para todo exercício',
      text: '1) Leia o problema e reescreva com suas palavras. 2) Liste entradas e saídas. 3) Resolva um exemplo à mão. 4) Escreva os passos em português. 5) Só então traduza para código e teste com o exemplo que você resolveu à mão.',
    },
    {
      type: 'p',
      text: 'Neste curso, usamos **JavaScript** para escrever os algoritmos. O comando `console.log(...)` mostra um valor na área de resultado — é a forma mais simples de ver uma saída.',
    },
  ],
  analogy:
    'Uma receita de bolo é um algoritmo: os ingredientes são a entrada, o modo de preparo é o processamento e o bolo pronto é a saída. Se a receita disser "asse até ficar bom", ela é ambígua — um computador precisaria de "asse por 40 minutos a 180 °C".',
  example: {
    code: `// Problema: calcular a comissão de uma venda
// Entrada: valor da venda e percentual
const valorDaVenda = 2000;
const percentual = 5;

// Processamento
const comissao = valorDaVenda * percentual / 100;

// Saída
console.log("Comissão:", comissao);`,
    lineByLine: [
      { line: 1, text: 'Comentários começam com `//`. O computador os ignora; eles servem para pessoas.' },
      { line: 3, text: 'Guardamos o valor da venda (2000) com o nome `valorDaVenda`. Esta é uma entrada.' },
      { line: 4, text: 'Guardamos o percentual de comissão (5). Outra entrada.' },
      { line: 7, text: 'Processamento: 2000 × 5 ÷ 100 = 100. O resultado fica guardado em `comissao`.' },
      { line: 10, text: 'Saída: `console.log` exibe o texto "Comissão:" seguido do valor calculado.' },
    ],
    output: 'Comissão: 100',
  },
  commonErrors: [
    {
      title: 'Começar pelo código',
      why: 'Sem entender entradas e saídas, você escreve código que resolve o problema errado — e não sabe disso porque não tem um exemplo para comparar.',
      fix: 'Antes de digitar, resolva um caso à mão (ex.: venda de 2000 com 5% → 100) e use-o para testar.',
    },
    {
      title: 'Passos ambíguos',
      wrong: '"Calcule a comissão direitinho"',
      why: 'O computador não interpreta intenções. Cada passo precisa ser exato.',
      fix: '"Multiplique o valor da venda pelo percentual e divida por 100."',
    },
    {
      title: 'Ordem errada',
      why: 'Usar um resultado antes de calculá-lo é como colocar o bolo no forno antes de misturar a massa.',
      fix: 'Leia seus passos de cima para baixo e confira se cada um só usa informações já disponíveis.',
    },
  ],
  guidedExerciseId: 'ex-logica-01-guiado',
  independentExerciseId: 'ex-logica-01-independente',
  reviewQuestions: [
    {
      question: 'Quais são as três características de um bom algoritmo?',
      answer: 'Ser finito (termina), não ambíguo (cada passo tem um único significado) e ter uma ordem definida.',
    },
    {
      question: 'No cálculo de frete de uma loja (frete = peso × R$ 2), qual é a entrada e qual é a saída?',
      answer: 'Entrada: o peso do pacote. Saída: o valor do frete.',
    },
    {
      question: 'Por que resolver um exemplo à mão antes de programar?',
      answer: 'Porque ele mostra se você entendeu o problema e vira um caso de teste: o programa deve produzir o mesmo resultado.',
    },
  ],
  summary: [
    'Programar é descrever passos precisos para o computador executar.',
    'Algoritmo: sequência finita, ordenada e não ambígua de passos.',
    'Todo problema tem entrada, processamento e saída.',
    'Decompor problemas grandes em partes pequenas é a habilidade central do programador.',
  ],
  completionCriteria: [
    'Ordenar corretamente as etapas de um algoritmo (exercício guiado).',
    'Identificar entradas e saídas de um problema (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-01-guiado',
    type: 'order-steps',
    title: 'Ordene o algoritmo da média escolar',
    difficulty: 'iniciante',
    concepts: ['algoritmos'],
    statement:
      'Uma escola aprova alunos com média maior ou igual a 7 em três provas. Coloque as etapas do algoritmo na ordem correta.',
    context: 'Use os botões "subir" e "descer" para mover cada etapa. Pense: qual informação cada passo precisa que já exista?',
    steps: [
      { id: 'a', text: 'Receber as três notas do aluno.' },
      { id: 'b', text: 'Somar as três notas.' },
      { id: 'c', text: 'Dividir a soma por 3 para obter a média.' },
      { id: 'd', text: 'Comparar a média com 7.' },
      { id: 'e', text: 'Mostrar "Aprovado" se a média for maior ou igual a 7; caso contrário, "Reprovado".' },
    ],
    hints: [
      'Conceito: um algoritmo segue a ordem entrada → processamento → saída.',
      'Raciocínio: não dá para calcular a média sem a soma, e não dá para somar sem ter as notas.',
      'Estrutura: o primeiro passo é a entrada (receber notas) e o último é a saída (mostrar o resultado). Os três do meio são o processamento.',
    ],
    solution: {
      explanation:
        'Primeiro obtemos as entradas (notas). Depois processamos: somamos, dividimos por 3 e comparamos com 7. Por fim, a saída: mostramos o resultado. Cada passo usa apenas o que os anteriores produziram.',
    },
  },
  {
    id: 'ex-logica-01-independente',
    type: 'multiple-choice',
    title: 'Entradas e saídas da comissão',
    difficulty: 'iniciante',
    concepts: ['algoritmos'],
    statement:
      'Uma loja paga a cada vendedor 5% do total vendido no mês. Você vai escrever um programa que calcula quanto cada vendedor recebe de comissão. Quais são as entradas e a saída?',
    options: [
      {
        id: 'a',
        text: 'Entradas: total vendido no mês e percentual de comissão. Saída: valor da comissão.',
        feedback: 'Isso mesmo: o programa recebe o que vendeu e o percentual, e entrega a comissão.',
      },
      {
        id: 'b',
        text: 'Entrada: valor da comissão. Saída: total vendido no mês.',
        feedback: 'Está invertido: a comissão é o que queremos descobrir, então ela é a saída.',
      },
      {
        id: 'c',
        text: 'Entradas: nome e endereço da loja. Saída: percentual de comissão.',
        feedback: 'O nome e o endereço não participam do cálculo, e o percentual já é conhecido (é uma entrada).',
      },
      {
        id: 'd',
        text: 'Não há entradas: o programa já sabe a comissão de cada vendedor.',
        feedback: 'O programa só sabe o que recebe. Sem o total vendido não há como calcular nada.',
      },
    ],
    correctOptionId: 'a',
    hints: [
      'Conceito: entrada é o que o programa recebe; saída é o que ele entrega.',
      'Raciocínio: o que você precisaria saber para calcular a comissão com papel e caneta?',
      'Estrutura: "comissão = total vendido × percentual". Os valores à direita do = são entradas; o da esquerda é a saída.',
    ],
    solution: {
      explanation:
        'Para calcular comissão = total × 5%, precisamos conhecer o total vendido e o percentual (entradas). O valor calculado, a comissão, é a saída.',
    },
  },
];
