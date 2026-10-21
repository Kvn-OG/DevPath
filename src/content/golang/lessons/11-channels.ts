import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-11',
  trackId: 'golang',
  moduleId: 'golang-m4',
  title: 'Channels e select',
  durationMin: 30,
  objectives: [
    'Enviar e receber valores entre goroutines com channels.',
    'Diferenciar channels com e sem buffer.',
    'Fechar channels e percorrê-los com range.',
    'Esperar o primeiro de vários eventos com select, inclusive timeouts.',
  ],
  prerequisites: ['go-10'],
  concepts: ['go-channels'],
  explanation: [
    {
      type: 'p',
      text: 'Um **channel** é um cano tipado por onde goroutines passam valores: `ch := make(chan int)`. `ch <- 5` envia; `v := <-ch` recebe. A comunicação também sincroniza: quem recebe espera até chegar um valor.',
    },
    {
      type: 'list',
      items: [
        '**Sem buffer** (`make(chan int)`): o envio espera alguém receber, e vice-versa. É um encontro marcado.',
        '**Com buffer** (`make(chan int, 10)`): o envio só espera quando o buffer está cheio.',
        '`close(ch)`: quem envia avisa que não haverá mais valores. `for v := range ch` lê até o channel ser fechado.',
        '`v, ok := <-ch`: ok é false quando o channel está fechado e vazio.',
        'Tipos direcionais documentam a intenção: `<-chan int` só recebe, `chan<- int` só envia.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Deadlock',
      text: 'Se todas as goroutines estão esperando (um envio sem ninguém para receber, por exemplo), o Go encerra com "fatal error: all goroutines are asleep - deadlock!". Só quem envia fecha o channel, e enviar em um channel fechado causa panic.',
    },
    { type: 'h', text: 'select' },
    {
      type: 'p',
      text: '`select` espera em vários channels ao mesmo tempo e executa o primeiro `case` que ficar pronto. Combinado com `time.After`, implementa **timeouts**: se a resposta não chegar em 500 ms, siga em frente.',
    },
  ],
  analogy:
    'Um channel sem buffer é entregar algo em mãos: você só solta o pacote quando alguém o pega. Com buffer, é uma caixa de correio com espaço para alguns pacotes. O select é ficar olhando várias caixas de correio e o relógio ao mesmo tempo, atendendo o que chegar primeiro.',
  example: {
    language: 'go',
    code: `package main

import (
    "fmt"
    "time"
)

func produzir(n int) <-chan int {
    ch := make(chan int)
    go func() {
        defer close(ch)
        for i := 1; i <= n; i++ {
            ch <- i
        }
    }()
    return ch
}

func main() {
    soma := 0
    for v := range produzir(4) {
        soma += v
    }
    fmt.Println("soma:", soma)

    resultado := make(chan string, 1)
    go func() {
        time.Sleep(2 * time.Second)
        resultado <- "resposta lenta"
    }()

    select {
    case r := <-resultado:
        fmt.Println(r)
    case <-time.After(500 * time.Millisecond):
        fmt.Println("tempo esgotado")
    }
}`,
    lineByLine: [
      { line: 8, text: 'Devolve um channel só de leitura: quem chama apenas recebe.' },
      { line: 11, text: 'A goroutine produtora fecha o channel quando termina de enviar.' },
      { line: 21, text: 'range recebe 1, 2, 3 e 4 e para quando o channel é fechado.' },
      { line: 26, text: 'Buffer de 1: a goroutine lenta consegue enviar mesmo que ninguém esteja mais esperando.' },
      { line: 32, text: 'select espera o que acontecer primeiro: a resposta (2 s) ou o timeout (500 ms).' },
    ],
    output: `soma: 10
tempo esgotado`,
  },
  commonErrors: [
    {
      title: 'Envio sem receptor',
      wrong: 'ch := make(chan int)\nch <- 1\nfmt.Println(<-ch)',
      why: 'O envio em um channel sem buffer espera um receptor que nunca chega: deadlock.',
      fix: 'Receba em outra goroutine, ou use um buffer: `make(chan int, 1)`.',
    },
    {
      title: 'Esquecer o close',
      wrong: 'for v := range ch { ... }  // o produtor nunca fecha ch',
      why: 'O range espera para sempre por mais valores.',
      fix: 'O produtor chama `close(ch)` (de preferência com defer) quando termina.',
    },
    {
      title: 'Goroutine presa depois do timeout',
      wrong: 'resultado := make(chan string)  // sem buffer\n// ... select com time.After',
      why: 'Se o timeout vencer, a goroutine lenta fica bloqueada para sempre tentando enviar (vazamento de goroutine).',
      fix: 'Use buffer de 1 ou, melhor, um context para cancelar a operação (próxima aula).',
    },
  ],
  guidedExerciseId: 'ex-go-11-guiado',
  independentExerciseId: 'ex-go-11-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre um channel com e sem buffer?', answer: 'Sem buffer, o envio espera o receptor; com buffer, o envio só espera quando o buffer está cheio.' },
    { question: 'Quem deve fechar um channel?', answer: 'Quem envia, quando não houver mais valores. Fechar não é obrigatório, mas é necessário para encerrar um range.' },
    { question: 'Como implementar um timeout com select?', answer: 'Com um case `<-time.After(duração)` ao lado do case que espera a resposta.' },
  ],
  summary: [
    'Channels passam valores e sincronizam goroutines.',
    'Sem buffer = encontro; com buffer = caixa de correio.',
    'Quem envia fecha; range lê até o fechamento.',
    'select espera vários eventos; time.After faz timeouts.',
  ],
  completionCriteria: ['Diagnosticar um deadlock (exercício guiado).', 'Completar um produtor e um consumidor com channels (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-11-guiado',
    type: 'multiple-choice',
    title: 'Todos dormindo',
    difficulty: 'basico',
    concepts: ['go-channels'],
    language: 'go',
    statement: 'O que acontece ao rodar este programa?',
    code: `package main

import "fmt"

func main() {
    pedidos := make(chan string)
    pedidos <- "pedido 1"
    fmt.Println(<-pedidos)
}`,
    options: [
      { id: 'a', text: 'Imprime "pedido 1".', feedback: 'O envio em um channel sem buffer espera um receptor, e o receptor só viria na linha seguinte.' },
      { id: 'b', text: 'fatal error: all goroutines are asleep - deadlock!', feedback: 'Correto: main fica bloqueada no envio e não há outra goroutine para receber.' },
      { id: 'c', text: 'Não compila.', feedback: 'Compila; o problema aparece na execução.' },
      { id: 'd', text: 'Imprime uma linha vazia.', feedback: 'Nada chega a ser impresso.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: sem buffer, envio e recebimento acontecem juntos.', 'Raciocínio: quando main envia, quem está pronto para receber?', 'Estrutura: um buffer de 1 resolveria este caso.'],
    solution: { explanation: 'main bloqueia em `pedidos <- "pedido 1"` esperando um receptor. Como não existe outra goroutine, o Go detecta o deadlock e encerra. Com `make(chan string, 1)`, o envio cabe no buffer e o programa imprime "pedido 1".' },
  },
  {
    id: 'ex-go-11-independente',
    type: 'fill-blanks',
    title: 'Produtor e consumidor',
    difficulty: 'intermediario',
    concepts: ['go-channels'],
    language: 'go',
    statement: 'Complete o código para que a goroutine envie 10, 20 e 30, avise que terminou, e main imprima os três valores.',
    template: `resultados := [[0]](chan int, 3)

go func() {
    for i := 1; i <= 3; i++ {
        resultados [[1]] i * 10
    }
    [[2]](resultados)
}()

for v := [[3]] resultados {
    fmt.Println(v)
}`,
    blanks: [
      { accept: ['make'], width: 5 },
      { accept: ['<-'], width: 3 },
      { accept: ['close'], width: 6 },
      { accept: ['range'], width: 6 },
    ],
    hints: [
      'Conceito: channels são criados com make, recebem valores com <- e são fechados por quem envia.',
      'Raciocínio: o for de main só termina se o channel for fechado.',
      'Estrutura: make, <-, close e range.',
    ],
    solution: {
      code: `resultados := make(chan int, 3)

go func() {
    for i := 1; i <= 3; i++ {
        resultados <- i * 10
    }
    close(resultados)
}()

for v := range resultados {
    fmt.Println(v)
}`,
      explanation: 'make cria o channel, `<-` envia cada valor, close avisa que não haverá mais e o range recebe até o fechamento. Sem o close, o for esperaria para sempre e terminaria em deadlock.',
    },
  },
];
