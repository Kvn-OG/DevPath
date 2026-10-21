import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-03',
  trackId: 'golang',
  moduleId: 'golang-m1',
  title: 'if, for, switch e funções com vários retornos',
  durationMin: 30,
  objectives: [
    'Usar if com declaração curta.',
    'Escrever as três formas do for (o único laço de Go).',
    'Usar switch sem break e switch sem expressão.',
    'Escrever funções com vários valores de retorno.',
  ],
  prerequisites: ['go-02'],
  concepts: ['go-funcoes'],
  explanation: [
    { type: 'h', text: 'if' },
    {
      type: 'p',
      text: 'Sem parênteses na condição e com chaves obrigatórias. O if aceita uma declaração antes da condição, e a variável só existe dentro dele: `if n, err := strconv.Atoi(s); err == nil { ... }`.',
    },
    { type: 'h', text: 'for: o único laço' },
    {
      type: 'code',
      language: 'go',
      code: `for i := 0; i < 3; i++ { }      // clássico
for saldo > 0 { }               // como um while
for { }                         // infinito (sai com break ou return)
for i, v := range lista { }     // percorre slices, maps, strings e channels`,
    },
    { type: 'h', text: 'switch' },
    {
      type: 'p',
      text: 'Cada `case` termina sozinho (não precisa de `break`) e pode ter vários valores: `case "sábado", "domingo":`. Sem expressão, `switch { case nota >= 7: ... }` é uma cadeia de if/else mais legível.',
    },
    { type: 'h', text: 'Funções' },
    {
      type: 'code',
      language: 'go',
      code: `func dividir(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("divisão por zero")
    }
    return a / b, nil
}`,
    },
    {
      type: 'list',
      items: [
        'O tipo vem **depois** do nome: `a, b float64`. O retorno vem depois dos parênteses.',
        'Funções podem devolver **vários valores**. O padrão de Go é devolver o resultado e um `error` por último; `nil` significa "sem erro".',
        'Quem chama recebe os dois: `r, err := dividir(10, 4)`. Para ignorar um valor, use `_`.',
        'Funções são valores: podem ser guardadas em variáveis e passadas como argumento, como no JavaScript.',
      ],
    },
  ],
  analogy:
    'Uma função de Go é como um guichê que sempre entrega duas coisas: o documento pedido e um bilhete dizendo se deu algum problema. Antes de usar o documento, você lê o bilhete.',
  example: {
    language: 'go',
    code: `package main

import (
    "errors"
    "fmt"
)

func dividir(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("divisão por zero")
    }
    return a / b, nil
}

func classificar(nota float64) string {
    switch {
    case nota >= 7:
        return "aprovado"
    case nota >= 5:
        return "recuperação"
    default:
        return "reprovado"
    }
}

func main() {
    for i := 1; i <= 3; i++ {
        fmt.Print(i, " ")
    }
    fmt.Println()

    if r, err := dividir(10, 4); err == nil {
        fmt.Println("resultado:", r)
    }
    if _, err := dividir(1, 0); err != nil {
        fmt.Println("erro:", err)
    }
    fmt.Println(classificar(6.5))
}`,
    lineByLine: [
      { line: 8, text: 'Dois parâmetros float64 e dois retornos: o resultado e um erro.' },
      { line: 12, text: 'Sem problemas: devolve o resultado e nil no lugar do erro.' },
      { line: 16, text: 'switch sem expressão: o primeiro case verdadeiro vence, sem break.' },
      { line: 27, text: 'O for clássico, sem parênteses.' },
      { line: 32, text: 'if com declaração curta: r e err só existem dentro deste if.' },
      { line: 35, text: '`_` descarta o resultado; aqui só interessa o erro.' },
    ],
    output: `1 2 3
resultado: 2.5
erro: divisão por zero
recuperação`,
  },
  commonErrors: [
    {
      title: 'Ignorar o erro devolvido',
      wrong: 'n, _ := strconv.Atoi(entrada)\nfmt.Println(n * 2)',
      why: 'Se a entrada não for número, n vale 0 e o programa segue com um valor errado, em silêncio.',
      fix: 'Verifique sempre: `if err != nil { ... }`.',
    },
    {
      title: 'Parênteses e chaves como em JavaScript',
      wrong: 'if (x > 0) fmt.Println(x)',
      why: 'As chaves são obrigatórias em Go (os parênteses são aceitos, mas o gofmt os remove).',
      fix: '`if x > 0 { fmt.Println(x) }`',
    },
    {
      title: 'Procurar o while',
      wrong: 'while tentativas < 3 { }',
      why: 'Go não tem while; o for faz esse papel.',
      fix: '`for tentativas < 3 { }`',
    },
  ],
  guidedExerciseId: 'ex-go-03-guiado',
  independentExerciseId: 'ex-go-03-independente',
  reviewQuestions: [
    { question: 'Qual é o único laço de repetição de Go?', answer: 'O for, que cobre o laço clássico, o "while" (só com condição), o infinito e o range.' },
    { question: 'Por que um case de switch não precisa de break?', answer: 'Em Go, cada case termina automaticamente; para continuar no próximo, seria preciso fallthrough (raro).' },
    { question: 'Qual a convenção para funções que podem falhar?', answer: 'Devolver o resultado e um error como último valor; nil significa sucesso.' },
  ],
  summary: [
    'if sem parênteses, com chaves e com declaração curta opcional.',
    'for é o único laço: clássico, condição, infinito e range.',
    'switch sem break; switch sem expressão substitui cadeias de if.',
    'Funções devolvem vários valores; o erro vem por último.',
  ],
  completionCriteria: ['Reconhecer o "while" de Go (exercício guiado).', 'Completar uma função com dois retornos (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-03-guiado',
    type: 'multiple-choice',
    title: 'O while que não existe',
    difficulty: 'iniciante',
    concepts: ['go-funcoes'],
    statement: 'Você quer repetir um bloco enquanto `tentativas < 3`. Qual é a forma correta em Go?',
    options: [
      { id: 'a', text: '`while tentativas < 3 { ... }`', feedback: 'Go não tem a palavra while.' },
      { id: 'b', text: '`for tentativas < 3 { ... }`', feedback: 'Correto: um for só com a condição é o "while" de Go.' },
      { id: 'c', text: '`do { ... } while (tentativas < 3)`', feedback: 'Go não tem do-while.' },
      { id: 'd', text: '`loop (tentativas < 3) { ... }`', feedback: 'loop não é uma palavra-chave de Go.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: Go tem um único laço.', 'Raciocínio: o for aceita só a condição, sem inicialização nem incremento.', 'Estrutura: for condição { }.'],
    solution: { explanation: '`for tentativas < 3 { }` repete enquanto a condição for verdadeira — exatamente o papel do while em outras linguagens.' },
  },
  {
    id: 'ex-go-03-independente',
    type: 'fill-blanks',
    title: 'Quociente e resto',
    difficulty: 'basico',
    concepts: ['go-funcoes', 'go-tipos'],
    language: 'go',
    statement: 'Complete a função que devolve o quociente e o resto da divisão inteira, de modo que `dividirInteiros(17, 5)` devolva 3 e 2.',
    template: `func dividirInteiros(a, b int) ([[0]], [[1]]) {
    return a [[2]] b, a [[3]] b
}

q, r := dividirInteiros(17, 5)`,
    blanks: [
      { accept: ['int'], width: 4 },
      { accept: ['int'], width: 4 },
      { accept: ['/'], width: 2 },
      { accept: ['%'], width: 2 },
    ],
    hints: [
      'Conceito: os tipos dos retornos ficam entre parênteses, depois dos parâmetros.',
      'Raciocínio: divisão entre inteiros em Go já é inteira (17 / 5 = 3). O resto usa outro operador.',
      'Estrutura: (int, int) e return a / b, a % b.',
    ],
    solution: {
      code: `func dividirInteiros(a, b int) (int, int) {
    return a / b, a % b
}`,
      explanation: 'Os dois retornos são int. Com operandos inteiros, `/` faz divisão inteira e `%` dá o resto: 17 / 5 = 3 e 17 % 5 = 2.',
    },
  },
];
