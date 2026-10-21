import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-02',
  trackId: 'golang',
  moduleId: 'golang-m1',
  title: 'Variáveis, tipos e constantes',
  durationMin: 25,
  objectives: [
    'Declarar variáveis com var e com :=.',
    'Conhecer os tipos básicos e os valores zero.',
    'Converter tipos explicitamente.',
    'Usar constantes.',
  ],
  prerequisites: ['go-01'],
  concepts: ['go-tipos'],
  explanation: [
    { type: 'h', text: 'Duas formas de declarar' },
    {
      type: 'code',
      language: 'go',
      code: `var idade int = 30     // tipo explícito
var nome = "Ana"       // tipo deduzido (string)
var total float64      // sem valor: recebe o valor zero (0)
cidade := "Recife"     // declaração curta, só dentro de funções`,
    },
    {
      type: 'list',
      items: [
        '`:=` declara **e** atribui; para mudar o valor depois, use `=`.',
        'Toda variável tem um **valor zero**: `0` para números, `""` para strings, `false` para bool e `nil` para ponteiros, slices, maps e interfaces. Não existe `undefined`.',
        'Uma variável declarada e não usada é **erro de compilação**.',
      ],
    },
    { type: 'h', text: 'Tipos básicos' },
    {
      type: 'list',
      items: [
        '`int` (inteiro do tamanho da máquina, 64 bits nos servidores atuais), `int64`, `uint8`/`byte`...',
        '`float64`: decimal de ponto flutuante (como o number do JavaScript). Para dinheiro, guarde centavos em `int64` ou use uma biblioteca decimal.',
        '`string`: texto em UTF-8, imutável. `len(s)` conta **bytes**, não letras: `len("ção")` é 5.',
        '`bool`: `true` ou `false`.',
        '`rune`: um caractere Unicode (um `int32`).',
      ],
    },
    { type: 'h', text: 'Conversão sempre explícita' },
    {
      type: 'p',
      text: 'Go nunca converte tipos sozinho. `int * float64` não compila: você escreve `float64(quantidade) * preco`. Para texto e números, use o pacote `strconv`: `strconv.Itoa(42)` gera `"42"` e `strconv.Atoi("42")` devolve o número e um erro (o texto pode não ser um número).',
    },
    { type: 'h', text: 'Constantes' },
    {
      type: 'p',
      text: '`const taxa = 0.05` define um valor fixo, calculado na compilação. Constantes numéricas sem tipo se adaptam ao contexto, por isso `const limite = 10` pode ser usada tanto com int quanto com float64.',
    },
  ],
  analogy:
    'Em Go, cada variável é uma caixa com etiqueta de tipo colada na fábrica: a caixa "int" só aceita inteiros e já vem com um 0 dentro. Para passar o conteúdo de uma caixa para outra de tipo diferente, você precisa transferir à mão — float64(x) — e nunca por acidente.',
  example: {
    language: 'go',
    code: `package main

import "fmt"

const taxa = 0.05

func main() {
    var vendas int = 3
    total := 2500.0
    var cliente string
    ativo := true

    comissao := total * taxa
    fmt.Println(vendas, total, ativo)
    fmt.Printf("cliente=%q comissão=%.2f\\n", cliente, comissao)
    fmt.Println(float64(vendas) * 1.5)
}`,
    lineByLine: [
      { line: 5, text: 'Constante do pacote, visível em todo o arquivo.' },
      { line: 8, text: 'Declaração com tipo explícito.' },
      { line: 9, text: '`2500.0` faz o tipo deduzido ser float64.' },
      { line: 10, text: 'Sem valor inicial: cliente recebe o valor zero, "".' },
      { line: 15, text: '%q mostra a string entre aspas, deixando visível que está vazia; %.2f usa duas casas.' },
      { line: 16, text: 'vendas é int: converter para float64 antes de multiplicar por 1.5.' },
    ],
    output: `3 2500 true
cliente="" comissão=125.00
4.5`,
  },
  commonErrors: [
    {
      title: 'Misturar int e float64',
      wrong: 'quantidade := 3\npreco := 9.90\ntotal := quantidade * preco',
      why: '"invalid operation: mismatched types int and float64". Go não converte sozinho.',
      fix: '`total := float64(quantidade) * preco`',
    },
    {
      title: ':= fora de função',
      wrong: 'package main\n\nlimite := 10\n\nfunc main() {}',
      why: 'A declaração curta só existe dentro de funções.',
      fix: 'No nível do pacote, use `var limite = 10` ou `const limite = 10`.',
    },
    {
      title: 'Usar := para alterar uma variável existente',
      wrong: 'total := 0\nfor _, v := range valores {\n    total := total + v\n}',
      why: 'O := dentro do laço cria uma variável nova que esconde a de fora; o total de fora continua 0 (e o compilador reclama da variável sem uso).',
      fix: 'Dentro do laço, `total += v`.',
    },
  ],
  guidedExerciseId: 'ex-go-02-guiado',
  independentExerciseId: 'ex-go-02-independente',
  reviewQuestions: [
    { question: 'Qual o valor de uma variável `var ok bool` sem atribuição?', answer: 'false, o valor zero do tipo bool.' },
    { question: 'Quando usar := e quando usar =?', answer: ':= declara uma variável nova (dentro de funções); = altera uma variável que já existe.' },
    { question: 'Como converter o texto "42" em número?', answer: 'Com `strconv.Atoi("42")`, que devolve o número e um erro a ser verificado.' },
  ],
  summary: [
    'var com tipo, var com dedução ou := dentro de funções.',
    'Toda variável começa com o valor zero do tipo.',
    'Conversões são sempre explícitas: float64(x), strconv.',
    'Variáveis sem uso são erro de compilação.',
  ],
  completionCriteria: ['Completar declarações com os tipos certos (exercício guiado).', 'Diagnosticar um erro de tipos misturados (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-02-guiado',
    type: 'fill-blanks',
    title: 'Declarações do pedido',
    difficulty: 'iniciante',
    concepts: ['go-tipos'],
    language: 'go',
    statement: 'Complete as declarações. A quantidade é inteira, o preço tem casas decimais, o cupom começa vazio e o subtotal é calculado convertendo a quantidade.',
    template: `quantidade [[0]] 3
var preco [[1]] = 19.90
var cupom [[2]]
subtotal := [[3]](quantidade) * preco`,
    blanks: [
      { accept: [':='], width: 3 },
      { accept: ['float64'], width: 8 },
      { accept: ['string'], width: 7 },
      { accept: ['float64'], width: 8 },
    ],
    hints: [
      'Conceito: := declara e atribui; var exige tipo ou valor.',
      'Raciocínio: o tipo decimal padrão é float64; o texto é string; a quantidade precisa ser convertida antes de multiplicar.',
      'Estrutura: :=, float64, string, float64.',
    ],
    solution: {
      code: `quantidade := 3
var preco float64 = 19.90
var cupom string
subtotal := float64(quantidade) * preco`,
      explanation: 'quantidade é deduzida como int; preco é float64; cupom começa com o valor zero ""; e a conversão float64(quantidade) permite multiplicar pelo preço.',
    },
  },
  {
    id: 'ex-go-02-independente',
    type: 'multiple-choice',
    title: 'Média que não compila',
    difficulty: 'basico',
    concepts: ['go-tipos'],
    language: 'go',
    statement: 'O que acontece com este programa?',
    code: `package main

import "fmt"

func main() {
    soma := 17
    quantidade := 4
    media := soma / quantidade
    var arredondada float64 = media
    fmt.Println(arredondada)
}`,
    options: [
      { id: 'a', text: 'Imprime 4.25.', feedback: 'Antes disso: soma / quantidade é divisão de inteiros, e a atribuição a float64 nem compila.' },
      { id: 'b', text: 'Imprime 4.', feedback: 'A divisão inteira daria 4, mas a linha seguinte impede a compilação.' },
      { id: 'c', text: 'Não compila: não é possível atribuir um int (media) a uma variável float64.', feedback: 'Correto: seria preciso `float64(media)` — e, para obter 4.25, converter antes de dividir.' },
      { id: 'd', text: 'Entra em pânico ao dividir.', feedback: 'Não há divisão por zero; o problema é de tipo, detectado na compilação.' },
    ],
    correctOptionId: 'c',
    hints: [
      'Conceito: Go não converte tipos automaticamente, nem de int para float64.',
      'Raciocínio: qual o tipo de media? E o de arredondada?',
      'Estrutura: a correção seria float64(soma) / float64(quantidade).',
    ],
    solution: {
      explanation:
        'media é int (divisão inteira: 17 / 4 = 4), e atribuir int a float64 é erro de compilação. Para obter 4.25: `media := float64(soma) / float64(quantidade)`.',
    },
  },
];
