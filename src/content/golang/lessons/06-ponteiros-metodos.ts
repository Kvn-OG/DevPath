import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-06',
  trackId: 'golang',
  moduleId: 'golang-m2',
  title: 'Ponteiros e métodos',
  durationMin: 30,
  objectives: [
    'Entender que Go passa tudo por valor (cópia).',
    'Usar & e * para trabalhar com ponteiros.',
    'Definir métodos com receptor de valor e com receptor de ponteiro.',
    'Escolher entre os dois tipos de receptor.',
  ],
  prerequisites: ['go-05'],
  concepts: ['go-ponteiros'],
  explanation: [
    {
      type: 'p',
      text: 'Em Go, passar um valor para uma função **copia** o valor. Se a função altera uma struct recebida, altera a cópia. Para alterar o original, passe o **endereço** dele: um **ponteiro**.',
    },
    {
      type: 'list',
      items: [
        '`&conta`: o endereço de conta (um valor do tipo `*Conta`).',
        '`*p`: o valor que está no endereço p.',
        'Com structs, `p.Saldo` já acessa o campo pelo ponteiro (Go faz o `(*p).Saldo` por você).',
        'O valor zero de um ponteiro é `nil`; acessar um campo por um ponteiro nil causa panic.',
      ],
    },
    { type: 'h', text: 'Métodos' },
    {
      type: 'p',
      text: 'Um **método** é uma função com um **receptor**, declarado antes do nome: `func (c Conta) Resumo() string`. Go não tem classes: tipos + métodos fazem esse papel.',
    },
    {
      type: 'code',
      language: 'go',
      code: `func (c Conta) Resumo() string { ... }        // receptor de valor: recebe uma cópia
func (c *Conta) Depositar(valor float64) { ... } // receptor de ponteiro: altera o original`,
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Quando usar receptor de ponteiro',
      text: 'Use `*T` quando o método altera o receptor, quando a struct é grande (evita cópias) ou por consistência: se um método do tipo usa ponteiro, use em todos. Receptores de valor ficam para tipos pequenos e imutáveis.',
    },
  ],
  analogy:
    'Passar por valor é entregar uma fotocópia do formulário: o que a pessoa rabiscar fica na cópia. Passar um ponteiro é entregar o endereço da gaveta onde está o original: quem recebe pode ir lá e alterar o documento de verdade.',
  example: {
    language: 'go',
    code: `package main

import "fmt"

type Conta struct {
    Titular string
    Saldo   float64
}

func (c Conta) Resumo() string {
    return fmt.Sprintf("%s: R$ %.2f", c.Titular, c.Saldo)
}

func (c *Conta) Depositar(valor float64) {
    c.Saldo += valor
}

func zerarCopia(c Conta) {
    c.Saldo = 0
}

func main() {
    conta := Conta{Titular: "Ana", Saldo: 100}
    conta.Depositar(50)
    zerarCopia(conta)
    fmt.Println(conta.Resumo())

    p := &conta
    p.Saldo = 10
    fmt.Println(conta.Saldo, *p == conta)
}`,
    lineByLine: [
      { line: 10, text: 'Receptor de valor: só lê, então a cópia não é problema.' },
      { line: 14, text: 'Receptor de ponteiro: altera o saldo da conta original.' },
      { line: 18, text: 'Função comum que recebe uma cópia da struct.' },
      { line: 24, text: 'Go converte `conta.Depositar` para `(&conta).Depositar` automaticamente. Saldo: 150.' },
      { line: 25, text: 'Zera apenas a cópia; a conta continua com 150.' },
      { line: 28, text: 'p guarda o endereço de conta; mudar p.Saldo muda conta.Saldo.' },
    ],
    output: `Ana: R$ 150.00
10 true`,
  },
  commonErrors: [
    {
      title: 'Método que "não salva"',
      wrong: 'func (c Carrinho) Adicionar(item string) {\n    c.Itens = append(c.Itens, item)\n}',
      why: 'O receptor de valor é uma cópia; o carrinho original não muda.',
      fix: '`func (c *Carrinho) Adicionar(item string)`',
    },
    {
      title: 'Ponteiro nil',
      wrong: 'var conta *Conta\nconta.Depositar(10)',
      why: 'panic: invalid memory address or nil pointer dereference. Não há conta no endereço.',
      fix: 'Crie o valor: `conta := &Conta{}`, e verifique `if conta == nil` quando o ponteiro puder vir vazio.',
    },
    {
      title: 'Ponteiro para tudo',
      why: 'Ponteiros para valores pequenos (int, structs de 2 campos) só dificultam a leitura e obrigam a tratar nil.',
      fix: 'Use ponteiros quando precisa alterar o original, evitar cópias grandes ou representar "ausência" com nil.',
    },
  ],
  guidedExerciseId: 'ex-go-06-guiado',
  independentExerciseId: 'ex-go-06-independente',
  reviewQuestions: [
    { question: 'O que & e * fazem?', answer: '&x obtém o endereço de x (um ponteiro); *p acessa o valor no endereço p.' },
    { question: 'Por que um método com receptor de valor não consegue alterar a struct?', answer: 'Porque ele recebe uma cópia da struct; as alterações ficam na cópia.' },
    { question: 'Qual o valor zero de um ponteiro?', answer: 'nil. Acessar campos por um ponteiro nil causa panic.' },
  ],
  summary: [
    'Go passa por valor: funções recebem cópias.',
    '&x é o endereço; *p é o valor apontado.',
    'Receptor de valor lê; receptor de ponteiro altera.',
    'Ponteiro nil causa panic ao ser usado.',
  ],
  completionCriteria: ['Prever o resultado de um método com receptor de valor (exercício guiado).', 'Completar um contador com ponteiros (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-06-guiado',
    type: 'multiple-choice',
    title: 'O contador que não conta',
    difficulty: 'basico',
    concepts: ['go-ponteiros'],
    language: 'go',
    statement: 'O método Incrementar é chamado duas vezes. O que o programa imprime?',
    code: `package main

import "fmt"

type Contador struct{ valor int }

func (c Contador) Incrementar() {
    c.valor++
}

func main() {
    c := Contador{}
    c.Incrementar()
    c.Incrementar()
    fmt.Println(c.valor)
}`,
    options: [
      { id: 'a', text: '2', feedback: 'Seria 2 com receptor de ponteiro (*Contador).' },
      { id: 'b', text: '0', feedback: 'Correto: cada chamada incrementa uma cópia.' },
      { id: 'c', text: '1', feedback: 'Nenhuma das duas chamadas altera o original.' },
      { id: 'd', text: 'Não compila.', feedback: 'Compila: métodos com receptor de valor são válidos.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: receptor de valor = cópia.', 'Raciocínio: o ++ acontece em qual Contador?', 'Estrutura: para alterar, o receptor precisa ser *Contador.'],
    solution: { explanation: 'Incrementar recebe uma cópia de c e incrementa a cópia. O c de main continua com valor 0. Com `func (c *Contador) Incrementar()`, imprimiria 2.' },
  },
  {
    id: 'ex-go-06-independente',
    type: 'fill-blanks',
    title: 'Contador de verdade',
    difficulty: 'intermediario',
    concepts: ['go-ponteiros'],
    language: 'go',
    statement: 'Complete para que `Incrementar` e `reset` alterem o contador original e o programa imprima 2 e depois 0.',
    template: `func (c [[0]]Contador) Incrementar() {
    c.valor++
}

func reset(c [[1]]Contador) {
    c.valor = 0
}

func main() {
    contador := Contador{}
    contador.Incrementar()
    contador.Incrementar()
    fmt.Println(contador.valor) // 2
    reset([[2]]contador)
    fmt.Println(contador.valor) // 0
}`,
    blanks: [
      { accept: ['*'], width: 2 },
      { accept: ['*'], width: 2 },
      { accept: ['&'], width: 2 },
    ],
    hints: [
      'Conceito: para alterar o original, o método e a função precisam receber um ponteiro.',
      'Raciocínio: o tipo ponteiro se escreve com *; o endereço de uma variável, com &.',
      'Estrutura: *Contador, *Contador e &contador.',
    ],
    solution: {
      code: `func (c *Contador) Incrementar() { c.valor++ }
func reset(c *Contador) { c.valor = 0 }
// ...
reset(&contador)`,
      explanation: 'Com receptor *Contador, `contador.Incrementar()` passa o endereço automaticamente. A função comum reset também recebe *Contador, mas aí é preciso passar o endereço explicitamente com &.',
    },
  },
];
