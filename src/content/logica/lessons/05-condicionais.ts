import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'logica-05',
  trackId: 'logica-js',
  moduleId: 'logica-m2',
  title: 'Condicionais: if, else if e else',
  durationMin: 20,
  objectives: [
    'Executar trechos de código somente quando uma condição é verdadeira.',
    'Encadear várias condições com else if.',
    'Ordenar as condições corretamente quando faixas se sobrepõem.',
  ],
  prerequisites: ['logica-04'],
  concepts: ['condicionais'],
  explanation: [
    {
      type: 'p',
      text: 'Até agora, todo código rodava de cima para baixo, linha por linha. **Condicionais** permitem escolher caminhos: "se isto for verdadeiro, faça aquilo; senão, faça outra coisa".',
    },
    {
      type: 'code',
      code: `if (condicao) {
  // roda quando condicao é true
} else if (outraCondicao) {
  // roda quando a primeira é false e esta é true
} else {
  // roda quando nenhuma das anteriores foi true
}`,
    },
    {
      type: 'list',
      items: [
        'A condição fica entre parênteses e precisa resultar em `true` ou `false`.',
        'O bloco entre chaves `{ }` é o que será executado.',
        'As condições são testadas **em ordem**. A primeira verdadeira vence e as demais são ignoradas.',
        '`else if` e `else` são opcionais.',
      ],
    },
    { type: 'h', text: 'A ordem importa' },
    {
      type: 'p',
      text: 'Em regras por faixa (descontos, notas, comissões), teste da faixa **mais restritiva** para a menos restritiva. Se você testar `valor >= 100` antes de `valor >= 500`, um valor de 600 entra no primeiro bloco e nunca chega ao segundo.',
    },
    {
      type: 'callout',
      tone: 'info',
      text: 'Os exercícios desta aula usam funções prontas com `return`. Quando o código encontra um `return`, a função termina e devolve aquele valor. Você entenderá os detalhes na aula 7.',
    },
  ],
  analogy:
    'Um GPS decide: "se a rua principal estiver livre, siga por ela; senão, se a avenida estiver livre, vá pela avenida; senão, pegue o desvio". Ele avalia as opções em ordem e escolhe a primeira que serve.',
  example: {
    code: `const nota = 6.5;

if (nota >= 7) {
  console.log("Aprovado");
} else if (nota >= 5) {
  console.log("Recuperação");
} else {
  console.log("Reprovado");
}`,
    lineByLine: [
      { line: 1, text: 'A nota analisada é 6.5.' },
      { line: 3, text: '6.5 >= 7 é false: o bloco das linhas 3–4 é pulado.' },
      { line: 5, text: '6.5 >= 5 é true: este bloco é executado.' },
      { line: 6, text: 'Exibe "Recuperação". O else da linha 7 é ignorado, pois uma condição já foi atendida.' },
    ],
    output: 'Recuperação',
  },
  commonErrors: [
    {
      title: 'Ponto e vírgula depois do if',
      wrong: 'if (nota >= 7); {\n  console.log("Aprovado");\n}',
      why: 'O ; encerra o if vazio. O bloco seguinte roda sempre.',
      fix: 'Nunca coloque ; entre o ) e o {.',
    },
    {
      title: 'Faixas na ordem errada',
      wrong: 'if (valor >= 100) {...} else if (valor >= 500) {...}',
      why: 'Todo valor >= 500 também é >= 100, então o segundo bloco nunca roda.',
      fix: 'Teste primeiro a condição mais restritiva (>= 500).',
    },
    {
      title: 'Usar = em vez de ===',
      wrong: 'if (status = "ativo")',
      why: 'Atribui em vez de comparar, e a condição fica sempre verdadeira.',
      fix: '`if (status === "ativo")`',
    },
  ],
  guidedExerciseId: 'ex-logica-05-guiado',
  independentExerciseId: 'ex-logica-05-independente',
  reviewQuestions: [
    { question: 'Se a primeira condição de um if/else if for verdadeira, as outras são testadas?', answer: 'Não. A primeira condição verdadeira executa seu bloco e as demais são ignoradas.' },
    { question: 'Quando o bloco else é executado?', answer: 'Quando nenhuma das condições anteriores foi verdadeira.' },
    { question: 'Por que testar faixas da mais restritiva para a menos restritiva?', answer: 'Porque valores que atendem à condição mais restritiva também atendem às menos restritivas; se a menos restritiva vier primeiro, ela "captura" esses valores.' },
  ],
  summary: [
    'if executa um bloco quando a condição é true.',
    'else if encadeia alternativas; else trata o "caso contrário".',
    'A primeira condição verdadeira vence.',
    'Ordene faixas da mais restritiva para a menos restritiva.',
  ],
  completionCriteria: [
    'Completar uma classificação com else if/else (exercício guiado).',
    'Encontrar e corrigir um bug de ordem de condições (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-logica-05-guiado',
    type: 'code',
    task: 'complete-code',
    title: 'Classifique a nota',
    difficulty: 'iniciante',
    concepts: ['condicionais'],
    statement: 'Complete a função classificarNota para devolver a situação do aluno.',
    requirements: [
      'Nota maior ou igual a 7: "Aprovado".',
      'Nota maior ou igual a 5 (e menor que 7): "Recuperação".',
      'Abaixo de 5: "Reprovado".',
      'Os textos devem ser exatamente esses, com acento e inicial maiúscula.',
    ],
    starterCode: `function classificarNota(nota) {
  if (nota >= 7) {
    return "Aprovado";
  }
  // complete com else if e else
}

console.log(classificarNota(8));
console.log(classificarNota(6));
console.log(classificarNota(3));`,
    tests: [
      { name: 'Nota 8 → Aprovado', code: 'return classificarNota(8);', expected: 'Aprovado' },
      { name: 'Nota 7 (limite) → Aprovado', code: 'return classificarNota(7);', expected: 'Aprovado' },
      { name: 'Nota 6 → Recuperação', code: 'return classificarNota(6);', expected: 'Recuperação' },
      { name: 'Nota 5 (limite) → Recuperação', code: 'return classificarNota(5);', expected: 'Recuperação' },
      { name: 'Nota 4.9 → Reprovado', code: 'return classificarNota(4.9);', expected: 'Reprovado' },
      { name: 'Nota 0 → Reprovado', code: 'return classificarNota(0);', expected: 'Reprovado', hidden: true },
    ],
    hints: [
      'Conceito: else if testa uma nova condição quando a anterior foi falsa; else cobre o resto.',
      'Raciocínio: se o código chegou ao else if, a nota já é menor que 7. Então basta testar se ela é >= 5.',
      'Estrutura: } else if (nota >= 5) { return "Recuperação"; } else { return ... }',
    ],
    solution: {
      code: `function classificarNota(nota) {
  if (nota >= 7) {
    return "Aprovado";
  } else if (nota >= 5) {
    // aqui já sabemos que nota < 7
    return "Recuperação";
  } else {
    return "Reprovado";
  }
}`,
      explanation:
        'Como as condições são testadas em ordem, o else if só é avaliado quando nota < 7, então não é preciso escrever nota >= 5 && nota < 7. O else cobre todas as notas abaixo de 5.',
    },
  },
  {
    id: 'ex-logica-05-independente',
    type: 'code',
    task: 'fix-bug',
    title: 'O desconto que nunca chega',
    difficulty: 'basico',
    concepts: ['condicionais'],
    statement:
      'A loja dá 10% de desconto para compras a partir de R$ 500 e 5% para compras a partir de R$ 100. Abaixo de R$ 100, não há desconto. Os clientes reclamam que nunca recebem 10%. Encontre e corrija o bug.',
    context: 'A função deve devolver o valor do desconto (não o valor final da compra).',
    requirements: ['calcularDesconto(600) deve devolver 60.', 'calcularDesconto(200) deve devolver 10.', 'calcularDesconto(50) deve devolver 0.'],
    starterCode: `function calcularDesconto(valorDaCompra) {
  if (valorDaCompra >= 100) {
    return valorDaCompra * 0.05;
  } else if (valorDaCompra >= 500) {
    return valorDaCompra * 0.1;
  } else {
    return 0;
  }
}

console.log(calcularDesconto(600)); // esperado: 60`,
    tests: [
      { name: 'Compra de 50 → 0', code: 'return calcularDesconto(50);', expected: 0 },
      { name: 'Compra de 100 → 5', code: 'return calcularDesconto(100);', expected: 5 },
      { name: 'Compra de 200 → 10', code: 'return calcularDesconto(200);', expected: 10 },
      { name: 'Compra de 500 → 50', code: 'return calcularDesconto(500);', expected: 50 },
      { name: 'Compra de 600 → 60', code: 'return calcularDesconto(600);', expected: 60 },
      { name: 'Compra de 1000 → 100', code: 'return calcularDesconto(1000);', expected: 100, hidden: true },
    ],
    hints: [
      'Conceito: em if/else if, a primeira condição verdadeira vence.',
      'Raciocínio: siga o código com 600. Qual condição é testada primeiro? Ela é verdadeira para 600?',
      'Estrutura: a condição >= 500 precisa ser testada antes da condição >= 100.',
    ],
    solution: {
      code: `function calcularDesconto(valorDaCompra) {
  // Faixa mais restritiva primeiro
  if (valorDaCompra >= 500) {
    return valorDaCompra * 0.1;
  } else if (valorDaCompra >= 100) {
    return valorDaCompra * 0.05;
  } else {
    return 0;
  }
}`,
      explanation:
        'Com a ordem original, 600 satisfaz valorDaCompra >= 100 e recebe 5%; o bloco de 10% nunca é alcançado. Invertendo a ordem, valores >= 500 são tratados primeiro.',
    },
  },
];
