import type { Assessment, Exercise } from '../../types/content';

// Questões exclusivas das avaliações (não repetem exercícios das aulas).

const diagnostic: Exercise[] = [
  {
    id: 'av-diag-1',
    type: 'multiple-choice',
    title: 'Declaração que pode mudar',
    difficulty: 'iniciante',
    concepts: ['variaveis'],
    statement: 'Você precisa de um contador que começa em 0 e aumenta a cada venda. Qual declaração usar?',
    options: [
      { id: 'a', text: 'const contador = 0;', feedback: 'const não pode ser reatribuída; o contador não conseguiria aumentar.' },
      { id: 'b', text: 'let contador = 0;', feedback: 'Correto: let permite reatribuir o valor.' },
      { id: 'c', text: 'contador == 0;', feedback: '== é comparação, não declaração.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: let × const.', 'Raciocínio: o valor vai mudar?', 'Estrutura: valores que mudam usam a mesma palavra-chave dos acumuladores.'],
    solution: { explanation: 'Valores que serão reatribuídos são declarados com let.' },
  },
  {
    id: 'av-diag-2',
    type: 'predict-output',
    title: 'Soma em laço',
    difficulty: 'iniciante',
    concepts: ['lacos'],
    statement: 'Qual é a saída?',
    code: `let total = 0;
for (let i = 1; i <= 3; i++) {
  total = total + i;
}
console.log(total);`,
    expectedOutput: '6',
    hints: ['Conceito: acumulador em laço.', 'Raciocínio: quais valores i assume?', 'Estrutura: 0 + 1 + 2 + 3.'],
    solution: { explanation: 'i vale 1, 2 e 3; o total acumula 1 + 2 + 3 = 6.' },
  },
  {
    id: 'av-diag-3',
    type: 'multiple-choice',
    title: 'Qual caminho?',
    difficulty: 'iniciante',
    concepts: ['condicionais'],
    statement: 'O que é exibido?',
    code: `const temperatura = 18;
if (temperatura > 25) {
  console.log("Calor");
} else if (temperatura > 15) {
  console.log("Agradável");
} else {
  console.log("Frio");
}`,
    options: [
      { id: 'a', text: 'Calor', feedback: '18 não é maior que 25.' },
      { id: 'b', text: 'Agradável', feedback: 'Correto: a primeira condição é falsa e a segunda é verdadeira.' },
      { id: 'c', text: 'Frio', feedback: 'O else só roda se nenhuma condição anterior for verdadeira; 18 > 15 é verdadeira.' },
      { id: 'd', text: 'Agradável e Frio', feedback: 'Em um if/else if/else, apenas um bloco é executado.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: if/else if/else.', 'Raciocínio: teste cada condição em ordem.', 'Estrutura: 18 > 25? 18 > 15?'],
    solution: { explanation: '18 > 25 é falso; 18 > 15 é verdadeiro: exibe "Agradável" e ignora o else.' },
  },
  {
    id: 'av-diag-4',
    type: 'predict-output',
    title: 'Retorno de função',
    difficulty: 'iniciante',
    concepts: ['funcoes'],
    statement: 'Qual é a saída?',
    code: `function dobro(n) {
  return n * 2;
}
console.log(dobro(3) + 1);`,
    expectedOutput: '7',
    hints: ['Conceito: return devolve um valor.', 'Raciocínio: quanto dobro(3) devolve?', 'Estrutura: 6 + 1.'],
    solution: { explanation: 'dobro(3) devolve 6, e 6 + 1 = 7.' },
  },
  {
    id: 'av-diag-5',
    type: 'multiple-choice',
    title: 'Último item',
    difficulty: 'iniciante',
    concepts: ['arrays'],
    statement: 'Qual o valor de precos[precos.length - 1]?',
    code: 'const precos = [10, 20, 30];',
    options: [
      { id: 'a', text: '10', feedback: 'Esse é o primeiro item (índice 0).' },
      { id: 'b', text: '30', feedback: 'Correto: length é 3, então o índice é 2, o último item.' },
      { id: 'c', text: 'undefined', feedback: 'Seria undefined com precos[precos.length], sem o - 1.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: índices começam em 0.', 'Raciocínio: quanto vale precos.length - 1?', 'Estrutura: precos[2].'],
    solution: { explanation: 'length é 3; 3 - 1 = 2; precos[2] é 30.' },
  },
  {
    id: 'av-diag-6',
    type: 'multiple-choice',
    title: 'Acessando propriedades',
    difficulty: 'iniciante',
    concepts: ['objetos'],
    statement: 'Como exibir o e-mail do usuário?',
    code: 'const usuario = { nome: "Carla", email: "carla@exemplo.com" };',
    options: [
      { id: 'a', text: 'console.log(usuario.email);', feedback: 'Correto: notação de ponto.' },
      { id: 'b', text: 'console.log(usuario[email]);', feedback: 'Sem aspas, email seria tratado como uma variável que não existe.' },
      { id: 'c', text: 'console.log(email.usuario);', feedback: 'A ordem é objeto.propriedade.' },
    ],
    correctOptionId: 'a',
    hints: ['Conceito: notação de ponto.', 'Raciocínio: objeto primeiro, propriedade depois.', 'Estrutura: objeto.propriedade.'],
    solution: { explanation: 'usuario.email lê a propriedade email do objeto usuario (equivale a usuario["email"]).' },
  },
];

const module1: Exercise[] = [
  {
    id: 'av-m1-1',
    type: 'multiple-choice',
    title: 'Passo ambíguo',
    difficulty: 'iniciante',
    concepts: ['algoritmos'],
    statement: 'Em um algoritmo para calcular o frete, qual passo é ambíguo e precisa ser reescrito?',
    options: [
      { id: 'a', text: 'Receber o peso do pacote em quilogramas.', feedback: 'Este passo é preciso: diz o que receber e em qual unidade.' },
      { id: 'b', text: 'Multiplicar o peso por 2,50.', feedback: 'Este passo é exato.' },
      { id: 'c', text: 'Se o pacote for pesado, cobrar um pouco mais.', feedback: 'Correto: "pesado" e "um pouco mais" não têm valores definidos.' },
      { id: 'd', text: 'Exibir o valor final do frete.', feedback: 'Este é um passo de saída claro.' },
    ],
    correctOptionId: 'c',
    hints: ['Conceito: passos de algoritmo não podem ser ambíguos.', 'Raciocínio: qual passo duas pessoas executariam de formas diferentes?', 'Estrutura: procure palavras sem valor exato.'],
    solution: { explanation: '"Pesado" e "um pouco mais" dependem de interpretação. Um passo preciso seria: "Se o peso for maior que 10 kg, somar R$ 15".' },
  },
  {
    id: 'av-m1-2',
    type: 'predict-output',
    title: 'Cópia de valor',
    difficulty: 'iniciante',
    concepts: ['variaveis'],
    statement: 'Qual é a saída?',
    code: `let a = 3;
let b = a;
a = 10;
console.log(a, b);`,
    expectedOutput: '10 3',
    hints: ['Conceito: atribuição copia o valor atual.', 'Raciocínio: no momento da linha 2, quanto vale a?', 'Estrutura: mudar a depois não muda b.'],
    solution: { explanation: 'b recebeu uma cópia do valor 3. Reatribuir a para 10 não afeta b.' },
  },
  {
    id: 'av-m1-3',
    type: 'multiple-choice',
    title: 'Conversão que falha',
    difficulty: 'basico',
    concepts: ['tipos'],
    statement: 'O que é exibido?',
    code: 'console.log(typeof Number("abc"));',
    options: [
      { id: 'a', text: 'string', feedback: 'Number() sempre devolve um valor do tipo number.' },
      { id: 'b', text: 'number', feedback: 'Correto: Number("abc") é NaN, e NaN é do tipo number.' },
      { id: 'c', text: 'undefined', feedback: 'A conversão devolve NaN, não undefined.' },
      { id: 'd', text: 'Um erro', feedback: 'Number() não lança erro com texto inválido; devolve NaN.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: NaN significa "Not a Number", mas...', 'Raciocínio: qual é o resultado de Number("abc")? E o tipo desse resultado?', 'Estrutura: typeof NaN.'],
    solution: { explanation: 'Number("abc") produz NaN. Curiosamente, NaN é um valor do tipo number, então typeof devolve "number".' },
  },
  {
    id: 'av-m1-4',
    type: 'fill-blanks',
    title: 'Regra de entrada',
    difficulty: 'iniciante',
    concepts: ['operadores'],
    statement: 'Pode entrar quem tem 18 anos ou mais E possui ingresso. Complete a expressão.',
    template: 'const podeEntrar = idade [[0]] 18 [[1]] temIngresso;',
    blanks: [{ accept: ['>='], width: 4 }, { accept: ['&&'], width: 4 }],
    hints: ['Conceito: operadores relacionais e lógicos.', 'Raciocínio: "18 anos ou mais" inclui 18. "E" exige as duas condições.', 'Estrutura: maior ou igual; operador E.'],
    solution: { code: 'const podeEntrar = idade >= 18 && temIngresso;', explanation: '>= inclui o 18; && exige que as duas condições sejam verdadeiras.' },
  },
];

const module2: Exercise[] = [
  {
    id: 'av-m2-1',
    type: 'predict-output',
    title: 'Pares no laço',
    difficulty: 'basico',
    concepts: ['lacos', 'condicionais', 'operadores'],
    statement: 'Qual é a saída?',
    code: `for (let i = 1; i <= 5; i++) {
  if (i % 2 === 0) {
    console.log(i);
  }
}`,
    expectedOutput: `2
4`,
    hints: ['Conceito: condicional dentro de laço.', 'Raciocínio: quais números de 1 a 5 têm resto 0 na divisão por 2?', 'Estrutura: um console.log por número par.'],
    solution: { explanation: 'O laço passa por 1 a 5, mas só exibe quando i % 2 === 0: 2 e 4.' },
  },
  {
    id: 'av-m2-2',
    type: 'code',
    task: 'write-function',
    title: 'Faixa etária',
    difficulty: 'basico',
    concepts: ['condicionais', 'funcoes'],
    statement: 'Escreva classificarIdade(idade): menos de 12 → "criança"; de 12 a 17 → "adolescente"; 18 ou mais → "adulto".',
    starterCode: `function classificarIdade(idade) {
  // seu código aqui
}`,
    tests: [
      { name: '5 → criança', code: 'return classificarIdade(5);', expected: 'criança' },
      { name: '12 → adolescente', code: 'return classificarIdade(12);', expected: 'adolescente' },
      { name: '17 → adolescente', code: 'return classificarIdade(17);', expected: 'adolescente' },
      { name: '18 → adulto', code: 'return classificarIdade(18);', expected: 'adulto' },
      { name: '11 → criança', code: 'return classificarIdade(11);', expected: 'criança', hidden: true },
    ],
    hints: ['Conceito: if/else if/else com return.', 'Raciocínio: comece pela faixa "menos de 12".', 'Estrutura: if (idade < 12) return "criança"; if (idade < 18) return "adolescente"; return "adulto";'],
    solution: {
      code: `function classificarIdade(idade) {
  if (idade < 12) {
    return "criança";
  } else if (idade < 18) {
    return "adolescente";
  }
  return "adulto";
}`,
      explanation: 'Como as condições são testadas em ordem, idade < 18 só é avaliada quando a idade já é pelo menos 12.',
    },
  },
  {
    id: 'av-m2-3',
    type: 'predict-output',
    title: 'Exibir não é devolver',
    difficulty: 'basico',
    concepts: ['funcoes'],
    statement: 'Qual é a saída?',
    code: `function mostrarCinco() {
  console.log(5);
}
const resultado = mostrarCinco();
console.log(resultado);`,
    expectedOutput: `5
undefined`,
    hints: ['Conceito: função sem return.', 'Raciocínio: a chamada exibe algo? O que ela devolve?', 'Estrutura: a primeira linha vem de dentro da função; a segunda é o valor devolvido.'],
    solution: { explanation: 'A chamada exibe 5. Como não há return, a função devolve undefined, que é guardado em resultado e exibido.' },
  },
  {
    id: 'av-m2-4',
    type: 'true-false',
    title: 'let depois do laço',
    difficulty: 'basico',
    concepts: ['escopo', 'lacos'],
    statement: 'Avalie a afirmação.',
    claim: 'Uma variável declarada com let dentro do corpo de um for pode ser usada depois que o laço termina.',
    answer: false,
    justifications: [
      { id: 'j1', text: 'let tem escopo de bloco: a variável só existe dentro das chaves do for.' },
      { id: 'j2', text: 'Toda variável declarada em um arquivo pode ser usada em qualquer lugar dele.' },
      { id: 'j3', text: 'A variável existe depois do laço, mas sempre vale undefined.' },
    ],
    correctJustificationId: 'j1',
    hints: ['Conceito: escopo de bloco.', 'Raciocínio: onde terminam as chaves do for?', 'Estrutura: let e const só existem dentro do bloco { } onde foram declarados.'],
    solution: { explanation: 'Falso. let respeita o bloco onde foi declarado; fora das chaves do for, o nome não existe (ReferenceError).' },
  },
];

const module3: Exercise[] = [
  {
    id: 'av-m3-1',
    type: 'predict-output',
    title: 'filter e map',
    difficulty: 'intermediario',
    concepts: ['manipulacao-dados'],
    statement: 'Qual é a saída?',
    code: `const nums = [1, 2, 3, 4];
console.log(nums.filter((n) => n > 2));
console.log(nums.map((n) => n * 10));`,
    expectedOutput: `[ 3, 4 ]
[ 10, 20, 30, 40 ]`,
    hints: ['Conceito: filter mantém, map transforma.', 'Raciocínio: quais números são maiores que 2? Quanto vale cada número × 10?', 'Estrutura: o resultado de filter tem 2 itens; o de map, 4.'],
    solution: { explanation: 'filter mantém 3 e 4. map multiplica cada item por 10 e mantém o tamanho do array.' },
  },
  {
    id: 'av-m3-2',
    type: 'code',
    task: 'write-function',
    title: 'Preço médio',
    difficulty: 'intermediario',
    concepts: ['arrays', 'objetos', 'manipulacao-dados'],
    statement: 'Escreva mediaDosPrecos(produtos), onde cada produto é { nome, preco }. Devolva a média dos preços. Lista vazia devolve 0.',
    starterCode: `function mediaDosPrecos(produtos) {
  // seu código aqui
}`,
    tests: [
      { name: 'Média de 3 produtos', code: 'return mediaDosPrecos([{ nome: "A", preco: 10 }, { nome: "B", preco: 20 }, { nome: "C", preco: 30 }]);', expected: 20 },
      { name: 'Um produto', code: 'return mediaDosPrecos([{ nome: "A", preco: 15 }]);', expected: 15 },
      { name: 'Lista vazia → 0', code: 'return mediaDosPrecos([]);', expected: 0 },
      { name: 'Decimais', code: 'return mediaDosPrecos([{ nome: "A", preco: 1 }, { nome: "B", preco: 2 }]);', expected: 1.5, hidden: true },
    ],
    hints: ['Conceito: agregação (soma) seguida de divisão.', 'Raciocínio: trate a lista vazia antes de dividir.', 'Estrutura: if (produtos.length === 0) return 0; const soma = produtos.reduce((s, p) => s + p.preco, 0); return soma / produtos.length;'],
    solution: {
      code: `function mediaDosPrecos(produtos) {
  if (produtos.length === 0) {
    return 0;
  }
  const soma = produtos.reduce((total, p) => total + p.preco, 0);
  return soma / produtos.length;
}`,
      explanation: 'reduce soma os preços; dividir pela quantidade dá a média. O caso vazio é tratado antes para evitar 0 / 0 = NaN.',
    },
  },
  {
    id: 'av-m3-3',
    type: 'multiple-choice',
    title: 'Que erro é esse?',
    difficulty: 'basico',
    concepts: ['depuracao', 'variaveis'],
    statement: 'Qual erro este código produz?',
    code: `const total = 10;
total = 20;`,
    options: [
      { id: 'a', text: 'SyntaxError: Unexpected token', feedback: 'A sintaxe está correta; o problema aparece na execução.' },
      { id: 'b', text: 'ReferenceError: total is not defined', feedback: 'total foi declarado na linha 1.' },
      { id: 'c', text: 'TypeError: Assignment to constant variable.', feedback: 'Correto: não é possível reatribuir uma const.' },
      { id: 'd', text: 'Nenhum erro; total passa a valer 20.', feedback: 'Isso aconteceria com let, não com const.' },
    ],
    correctOptionId: 'c',
    hints: ['Conceito: const não pode ser reatribuída.', 'Raciocínio: é um problema de sintaxe, de nome inexistente ou de operação inválida?', 'Estrutura: operações inválidas geram TypeError.'],
    solution: { explanation: 'Reatribuir uma constante é uma operação inválida: TypeError: Assignment to constant variable.' },
  },
  {
    id: 'av-m3-4',
    type: 'multiple-choice',
    title: 'Chave em variável',
    difficulty: 'intermediario',
    concepts: ['objetos'],
    statement: 'Qual linha exibe "ana@exemplo.com"?',
    code: `const usuario = { nome: "Ana", email: "ana@exemplo.com" };
const campo = "email";`,
    options: [
      { id: 'a', text: 'console.log(usuario.campo);', feedback: 'usuario.campo procura uma propriedade chamada literalmente "campo", que não existe: undefined.' },
      { id: 'b', text: 'console.log(usuario[campo]);', feedback: 'Correto: com colchetes, o valor da variável campo ("email") é usado como nome da propriedade.' },
      { id: 'c', text: 'console.log(usuario["campo"]);', feedback: 'Com aspas, o nome procurado é o texto "campo", não o valor da variável.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: notação de colchetes com variável.', 'Raciocínio: em qual opção o valor de campo é usado?', 'Estrutura: objeto[variavel].'],
    solution: { explanation: 'Só a notação de colchetes sem aspas avalia a variável. usuario[campo] equivale a usuario["email"].' },
  },
];

const finalExam: Exercise[] = [
  {
    id: 'av-final-1',
    type: 'predict-output',
    title: 'Concatenação em laço',
    difficulty: 'intermediario',
    concepts: ['lacos', 'tipos'],
    statement: 'Qual é a saída?',
    code: `let resultado = "";
for (let i = 0; i < 3; i++) {
  resultado = resultado + i;
}
console.log(resultado);`,
    expectedOutput: '012',
    hints: ['Conceito: + com string concatena.', 'Raciocínio: qual o tipo inicial de resultado?', 'Estrutura: "" + 0, depois "0" + 1...'],
    solution: { explanation: 'resultado começa como string vazia, então cada + concatena: "0", "01", "012".' },
  },
  {
    id: 'av-final-2',
    type: 'code',
    task: 'write-function',
    title: 'Produtos por categoria',
    difficulty: 'intermediario',
    concepts: ['manipulacao-dados', 'objetos'],
    statement: 'Escreva nomesPorCategoria(produtos, categoria), que devolve os nomes dos produtos daquela categoria, na ordem original.',
    starterCode: `function nomesPorCategoria(produtos, categoria) {
  // seu código aqui
}`,
    tests: [
      {
        name: 'Filtra por categoria',
        code: 'return nomesPorCategoria([{ nome: "Mouse", categoria: "periferico" }, { nome: "Mesa", categoria: "movel" }, { nome: "Teclado", categoria: "periferico" }], "periferico");',
        expected: ['Mouse', 'Teclado'],
      },
      { name: 'Categoria inexistente → []', code: 'return nomesPorCategoria([{ nome: "Mesa", categoria: "movel" }], "livro");', expected: [] },
      { name: 'Lista vazia → []', code: 'return nomesPorCategoria([], "movel");', expected: [], hidden: true },
    ],
    hints: ['Conceito: filter + map.', 'Raciocínio: primeiro selecione, depois extraia o nome.', 'Estrutura: produtos.filter((p) => p.categoria === categoria).map((p) => p.nome)'],
    solution: {
      code: `function nomesPorCategoria(produtos, categoria) {
  return produtos
    .filter((p) => p.categoria === categoria)
    .map((p) => p.nome);
}`,
      explanation: 'filter seleciona os produtos da categoria e map transforma cada um em seu nome. Um laço com push também seria correto.',
    },
  },
  {
    id: 'av-final-3',
    type: 'code',
    task: 'algorithm',
    title: 'FizzBuzz',
    difficulty: 'intermediario',
    concepts: ['condicionais', 'operadores', 'funcoes'],
    statement:
      'Escreva fizzBuzz(n): devolva "FizzBuzz" se n for divisível por 3 e por 5; "Fizz" se for divisível só por 3; "Buzz" se for divisível só por 5; caso contrário, o próprio número como texto (String(n)).',
    starterCode: `function fizzBuzz(n) {
  // seu código aqui
}`,
    tests: [
      { name: '3 → "Fizz"', code: 'return fizzBuzz(3);', expected: 'Fizz' },
      { name: '10 → "Buzz"', code: 'return fizzBuzz(10);', expected: 'Buzz' },
      { name: '15 → "FizzBuzz"', code: 'return fizzBuzz(15);', expected: 'FizzBuzz' },
      { name: '7 → "7"', code: 'return fizzBuzz(7);', expected: '7' },
      { name: '30 → "FizzBuzz"', code: 'return fizzBuzz(30);', expected: 'FizzBuzz', hidden: true },
    ],
    hints: ['Conceito: ordem das condições e operador %.', 'Raciocínio: qual condição é a mais restritiva? Ela precisa vir primeiro.', 'Estrutura: if (n % 3 === 0 && n % 5 === 0) return "FizzBuzz"; ...'],
    solution: {
      code: `function fizzBuzz(n) {
  if (n % 3 === 0 && n % 5 === 0) {
    return "FizzBuzz"; // mais restritiva primeiro
  }
  if (n % 3 === 0) {
    return "Fizz";
  }
  if (n % 5 === 0) {
    return "Buzz";
  }
  return String(n);
}`,
      explanation: 'Testar "divisível por 3 e 5" primeiro evita que 15 caia em "Fizz". String(n) converte o número em texto, como o enunciado exige.',
    },
  },
  {
    id: 'av-final-4',
    type: 'multiple-choice',
    title: 'Escolha o método',
    difficulty: 'basico',
    concepts: ['manipulacao-dados'],
    statement: 'Você tem um carrinho com vários itens { nome, preco } e precisa do valor total da compra. Qual método expressa melhor essa operação?',
    options: [
      { id: 'a', text: 'filter', feedback: 'filter seleciona itens; não combina valores.' },
      { id: 'b', text: 'map', feedback: 'map devolve um array do mesmo tamanho; queremos um único número.' },
      { id: 'c', text: 'reduce', feedback: 'Correto: reduce agrega todos os itens em um único valor.' },
    ],
    correctOptionId: 'c',
    hints: ['Conceito: filtrar, transformar, agregar.', 'Raciocínio: o resultado é uma lista ou um valor único?', 'Estrutura: muitos itens → um número.'],
    solution: { explanation: 'Somar todos os preços é uma agregação: carrinho.reduce((total, item) => total + item.preco, 0).' },
  },
  {
    id: 'av-final-5',
    type: 'true-false',
    title: 'map e o array original',
    difficulty: 'basico',
    concepts: ['manipulacao-dados'],
    statement: 'Avalie a afirmação.',
    claim: 'Depois de executar precos.map((p) => p * 2), o array precos passa a conter os valores dobrados.',
    answer: false,
    justifications: [
      { id: 'j1', text: 'map altera cada item no próprio array original.' },
      { id: 'j2', text: 'map devolve um array novo e não altera o original; é preciso guardar o resultado.' },
      { id: 'j3', text: 'map só funciona com arrays de objetos.' },
    ],
    correctJustificationId: 'j2',
    hints: ['Conceito: métodos que devolvem valores novos.', 'Raciocínio: onde o resultado do map foi guardado?', 'Estrutura: const dobrados = precos.map(...).'],
    solution: { explanation: 'Falso. map cria e devolve um novo array; precos continua igual. Sem guardar o resultado, ele é perdido.' },
  },
  {
    id: 'av-final-6',
    type: 'fill-blanks',
    title: 'Total com reduce',
    difficulty: 'intermediario',
    concepts: ['manipulacao-dados'],
    statement: 'Complete para calcular a soma dos preços.',
    template: 'const total = precos.[[0]]((soma, p) => soma + p, [[1]]);',
    blanks: [{ accept: ['reduce'], width: 8 }, { accept: ['0'], width: 3 }],
    hints: ['Conceito: agregação.', 'Raciocínio: qual método recebe acumulador e valor inicial?', 'Estrutura: o valor inicial de uma soma é zero.'],
    solution: { code: 'const total = precos.reduce((soma, p) => soma + p, 0);', explanation: 'reduce com valor inicial 0 soma todos os preços.' },
  },
  {
    id: 'av-final-7',
    type: 'order-steps',
    title: 'Processo de depuração',
    difficulty: 'basico',
    concepts: ['depuracao'],
    statement: 'Ordene as etapas de um processo de depuração bem feito.',
    steps: [
      { id: 'a', text: 'Reproduzir o problema com uma entrada conhecida.' },
      { id: 'b', text: 'Isolar a parte do código onde o valor fica errado (com console.log).' },
      { id: 'c', text: 'Formular uma hipótese sobre a causa.' },
      { id: 'd', text: 'Fazer uma única correção.' },
      { id: 'e', text: 'Testar novamente com o caso original e com casos-limite.' },
    ],
    hints: ['Conceito: depuração com método.', 'Raciocínio: não dá para isolar algo que você não consegue reproduzir.', 'Estrutura: reproduzir → isolar → hipótese → corrigir → testar.'],
    solution: { explanation: 'Primeiro garanta que o erro acontece de forma previsível, depois localize, explique, corrija uma coisa e confirme com testes.' },
  },
  {
    id: 'av-final-8',
    type: 'code',
    task: 'fix-bug',
    title: 'Aprovados que não somam',
    difficulty: 'intermediario',
    concepts: ['depuracao', 'lacos', 'condicionais'],
    statement: 'contarAprovados(notas) deveria contar as notas maiores ou iguais a 7, mas devolve valores errados. Corrija os dois bugs.',
    starterCode: `function contarAprovados(notas) {
  let aprovados = 0;
  for (const nota of notas) {
    if (nota > 7) {
      aprovados = 1;
    }
  }
  return aprovados;
}`,
    tests: [
      { name: '[8, 5, 9] → 2', code: 'return contarAprovados([8, 5, 9]);', expected: 2 },
      { name: 'Nota 7 conta', code: 'return contarAprovados([7, 6]);', expected: 1 },
      { name: 'Lista vazia → 0', code: 'return contarAprovados([]);', expected: 0 },
      { name: 'Todos aprovados', code: 'return contarAprovados([7, 8, 10, 9]);', expected: 4, hidden: true },
    ],
    hints: ['Conceito: contador e limite de comparação.', 'Raciocínio: teste com [8, 5, 9] e com [7]. O contador soma ou só recebe 1?', 'Estrutura: >= 7 e aprovados++.'],
    solution: {
      code: `function contarAprovados(notas) {
  let aprovados = 0;
  for (const nota of notas) {
    if (nota >= 7) {   // 7 também aprova
      aprovados++;     // soma 1, em vez de fixar em 1
    }
  }
  return aprovados;
}`,
      explanation: 'Bug 1: > 7 excluía a nota 7. Bug 2: aprovados = 1 sobrescrevia o contador em vez de somar.',
    },
  },
];

export const assessmentExercises: Exercise[] = [...diagnostic, ...module1, ...module2, ...module3, ...finalExam];

export const logicaAssessments: Assessment[] = [
  {
    id: 'logica-diagnostica',
    kind: 'diagnostica',
    title: 'Avaliação diagnóstica',
    description:
      'Seis perguntas rápidas para identificar o que você já sabe. O resultado não marca aulas como concluídas — ele apenas sugere por onde começar.',
    trackId: 'logica-js',
    passingScore: 0,
    exerciseIds: diagnostic.map((e) => e.id),
  },
  {
    id: 'logica-m1-avaliacao',
    kind: 'modulo',
    title: 'Avaliação do módulo 1: Primeiros passos',
    description: 'Algoritmos, variáveis, tipos e operadores.',
    trackId: 'logica-js',
    moduleId: 'logica-m1',
    passingScore: 0.75,
    exerciseIds: module1.map((e) => e.id),
  },
  {
    id: 'logica-m2-avaliacao',
    kind: 'modulo',
    title: 'Avaliação do módulo 2: Decisões, repetições e funções',
    description: 'Condicionais, laços, funções e escopo.',
    trackId: 'logica-js',
    moduleId: 'logica-m2',
    passingScore: 0.75,
    exerciseIds: module2.map((e) => e.id),
  },
  {
    id: 'logica-m3-avaliacao',
    kind: 'modulo',
    title: 'Avaliação do módulo 3: Dados e depuração',
    description: 'Arrays, objetos, manipulação de dados e depuração.',
    trackId: 'logica-js',
    moduleId: 'logica-m3',
    passingScore: 0.75,
    exerciseIds: module3.map((e) => e.id),
  },
  {
    id: 'logica-final',
    kind: 'final',
    title: 'Avaliação final da trilha',
    description: 'Oito questões que combinam todos os conceitos da trilha, incluindo três exercícios de código.',
    trackId: 'logica-js',
    passingScore: 0.7,
    exerciseIds: finalExam.map((e) => e.id),
  },
];
