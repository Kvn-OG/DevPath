import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-04',
  trackId: 'golang',
  moduleId: 'golang-m2',
  title: 'Arrays e slices',
  durationMin: 30,
  objectives: [
    'Diferenciar arrays (tamanho fixo) de slices (tamanho variável).',
    'Criar slices, acrescentar com append e percorrer com range.',
    'Entender que fatias compartilham a mesma memória e usar copy quando precisar de uma cópia.',
  ],
  prerequisites: ['go-03'],
  concepts: ['go-slices'],
  explanation: [
    {
      type: 'p',
      text: 'Um **array** tem tamanho fixo, que faz parte do tipo: `[3]int` e `[4]int` são tipos diferentes. Na prática, quase sempre se usa **slice**: uma "janela" sobre um array, com tamanho variável. É o equivalente ao array do JavaScript.',
    },
    {
      type: 'code',
      language: 'go',
      code: `notas := []int{7, 9, 5}          // slice literal
notas = append(notas, 10)         // append devolve o slice atualizado
vazio := make([]string, 0, 100)   // tamanho 0, capacidade reservada 100
fmt.Println(len(notas), notas[0]) // 4 7`,
    },
    {
      type: 'list',
      items: [
        '`len(s)`: quantos elementos. `cap(s)`: quantos cabem antes de precisar realocar.',
        '`append` pode criar um array novo quando a capacidade acaba. Por isso **sempre** guarde o retorno: `s = append(s, x)`.',
        '`s[1:3]`: fatia do índice 1 até antes do 3. `s[:2]` do começo; `s[2:]` até o fim.',
        'Acessar um índice inexistente causa **panic** (o programa para), e não `undefined`.',
        '`for i, v := range s` percorre índice e valor; `for _, v := range s` ignora o índice.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Fatias compartilham memória',
      text: '`primeiras := notas[:2]` não copia nada: as duas variáveis enxergam o mesmo array. Alterar `primeiras[0]` altera `notas[0]`. Para uma cópia independente, use `copy` ou `slices.Clone(notas)`.',
    },
    {
      type: 'p',
      text: 'O pacote `slices` da biblioteca padrão traz funções prontas: `slices.Sort(s)`, `slices.Contains(s, x)`, `slices.Index(s, x)` e `slices.Max(s)`.',
    },
  ],
  analogy:
    'O array é uma fileira de armários parafusada na parede. O slice é uma etiqueta que diz "do armário 2 ao 5": duas etiquetas podem apontar para os mesmos armários, e mexer em um armário por uma etiqueta muda o que a outra vê.',
  example: {
    language: 'go',
    code: `package main

import "fmt"

func main() {
    notas := []int{7, 9, 5}
    notas = append(notas, 10)
    fmt.Println(notas, len(notas))

    primeiras := notas[:2]
    primeiras[0] = 0
    fmt.Println(notas)

    copia := make([]int, len(notas))
    copy(copia, notas)
    copia[1] = 1
    fmt.Println(notas, copia)

    soma := 0
    for _, n := range notas {
        soma += n
    }
    fmt.Println("soma:", soma)
}`,
    lineByLine: [
      { line: 7, text: 'append devolve o slice com o novo elemento; guardamos de volta em notas.' },
      { line: 10, text: 'primeiras é uma janela sobre os dois primeiros elementos de notas — sem cópia.' },
      { line: 11, text: 'Por isso, mudar primeiras[0] muda notas[0].' },
      { line: 14, text: 'make cria um slice novo, com o mesmo tamanho; copy copia os elementos.' },
      { line: 16, text: 'Alterar a cópia não afeta o original.' },
      { line: 20, text: 'range entrega índice e valor; o índice é descartado com _.' },
    ],
    output: `[7 9 5 10] 4
[0 9 5 10]
[0 9 5 10] [0 1 5 10]
soma: 24`,
  },
  commonErrors: [
    {
      title: 'Descartar o retorno do append',
      wrong: 'append(itens, novo)',
      why: 'O append não altera a variável original; sem guardar o retorno, o item se perde (e o compilador reclama).',
      fix: '`itens = append(itens, novo)`',
    },
    {
      title: 'Achar que a fatia é uma cópia',
      wrong: 'ordenados := precos[:]\nslices.Sort(ordenados)  // precos também fica ordenado',
      why: 'precos[:] aponta para o mesmo array.',
      fix: '`ordenados := slices.Clone(precos)` antes de ordenar.',
    },
    {
      title: 'Índice fora do intervalo',
      wrong: 'itens := []string{}\nfmt.Println(itens[0])',
      why: 'panic: runtime error: index out of range [0] with length 0.',
      fix: 'Confira `len(itens)` antes de acessar um índice.',
    },
  ],
  guidedExerciseId: 'ex-go-04-guiado',
  independentExerciseId: 'ex-go-04-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre [3]int e []int?', answer: '[3]int é um array de tamanho fixo 3 (o tamanho faz parte do tipo); []int é um slice, de tamanho variável.' },
    { question: 'Por que escrever s = append(s, x)?', answer: 'Porque o append pode criar um novo array por baixo e devolve o slice atualizado; o original não muda.' },
    { question: 'Como obter uma cópia independente de um slice?', answer: 'Com make + copy, ou com slices.Clone.' },
  ],
  summary: [
    'Use slices: tamanho variável, len e cap.',
    's = append(s, x) — sempre guarde o retorno.',
    'Fatias compartilham memória; copy e slices.Clone copiam.',
    'Índices fora do intervalo causam panic.',
  ],
  completionCriteria: ['Prever o efeito de alterar uma fatia (exercício guiado).', 'Prever o efeito de um append dentro de uma função (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-04-guiado',
    type: 'multiple-choice',
    title: 'A janela que altera',
    difficulty: 'basico',
    concepts: ['go-slices'],
    language: 'go',
    statement: 'Uma promoção é criada como fatia da lista de preços e tem o primeiro item alterado. O que o programa imprime?',
    code: `package main

import "fmt"

func main() {
    precos := []int{10, 20, 30, 40}
    promocao := precos[1:3]
    promocao[0] = 15
    fmt.Println(precos, promocao)
}`,
    options: [
      { id: 'a', text: '[10 20 30 40] [15 30]', feedback: 'promocao não é uma cópia: altera o mesmo array de precos.' },
      { id: 'b', text: '[10 15 30 40] [15 30]', feedback: 'Correto: promocao[0] é o mesmo elemento que precos[1].' },
      { id: 'c', text: '[15 20 30 40] [15 30]', feedback: 'promocao começa no índice 1 de precos, não no 0.' },
      { id: 'd', text: '[10 15 30 40] [15 30 40]', feedback: 'precos[1:3] vai até antes do índice 3: dois elementos.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: uma fatia é uma janela sobre o mesmo array.', 'Raciocínio: promocao[0] corresponde a qual índice de precos?', 'Estrutura: precos[1:3] = índices 1 e 2.'],
    solution: { explanation: 'precos[1:3] enxerga os índices 1 e 2 de precos. Mudar promocao[0] muda precos[1]: [10 15 30 40] [15 30].' },
  },
  {
    id: 'ex-go-04-independente',
    type: 'multiple-choice',
    title: 'O append que sumiu',
    difficulty: 'intermediario',
    concepts: ['go-slices'],
    language: 'go',
    statement: 'A função adicionar tenta acrescentar um número ao slice recebido. O que o programa imprime?',
    code: `package main

import "fmt"

func adicionar(s []int) {
    s = append(s, 4)
}

func main() {
    nums := []int{1, 2, 3}
    adicionar(nums)
    fmt.Println(nums, len(nums))
}`,
    options: [
      { id: 'a', text: '[1 2 3 4] 4', feedback: 'A função recebe uma cópia do slice (do "cabeçalho"); reatribuir s lá dentro não muda nums.' },
      { id: 'b', text: '[1 2 3] 3', feedback: 'Correto: o append atualiza só a variável s, local da função.' },
      { id: 'c', text: 'Não compila: append dentro de função.', feedback: 'Compila normalmente.' },
      { id: 'd', text: 'panic: índice fora do intervalo.', feedback: 'Nenhum índice inválido é acessado.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: argumentos em Go são passados por valor — inclusive o slice (ponteiro, tamanho e capacidade).',
      'Raciocínio: o que a função faz com o resultado do append? Ele volta para main?',
      'Estrutura: a forma idiomática é devolver o slice: `func adicionar(s []int) []int { return append(s, 4) }`.',
    ],
    solution: {
      explanation:
        'nums e s são cópias do mesmo cabeçalho de slice. O append cria um array maior e reatribui só s; nums continua com tamanho 3. Para alterar, devolva o resultado e reatribua: `nums = adicionar(nums)`.',
    },
  },
];
