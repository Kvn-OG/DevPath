import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-10',
  trackId: 'golang',
  moduleId: 'golang-m4',
  title: 'Goroutines, WaitGroup e Mutex',
  durationMin: 30,
  objectives: [
    'Executar funções em paralelo com goroutines.',
    'Esperar várias goroutines com sync.WaitGroup.',
    'Reconhecer uma condição de corrida e evitá-la com sync.Mutex.',
    'Detectar corridas com go run -race.',
  ],
  prerequisites: ['go-09'],
  concepts: ['go-goroutines'],
  explanation: [
    {
      type: 'p',
      text: 'Uma **goroutine** é uma função rodando de forma concorrente, iniciada com a palavra `go`: `go enviarEmail(cliente)`. Elas são muito leves (alguns KB cada); um servidor Go roda dezenas de milhares ao mesmo tempo, e o próprio `net/http` atende cada requisição em uma goroutine.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'main não espera ninguém',
      text: 'Quando `main` termina, o programa termina — e as goroutines que ainda estavam rodando são interrompidas. É preciso esperar por elas explicitamente.',
    },
    { type: 'h', text: 'sync.WaitGroup' },
    {
      type: 'code',
      language: 'go',
      code: `var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1)              // mais uma para esperar
    go func() {
        defer wg.Done()    // esta terminou
        baixar(url)
    }()
}
wg.Wait()                  // bloqueia até todas chamarem Done`,
    },
    { type: 'h', text: 'Condição de corrida e Mutex' },
    {
      type: 'p',
      text: 'Se duas goroutines alteram a mesma variável ao mesmo tempo, o resultado é imprevisível: `contador++` é ler, somar e gravar, e duas goroutines podem ler o mesmo valor. Isso é uma **condição de corrida** (*data race*). Proteja o trecho com um `sync.Mutex`: só uma goroutine por vez passa entre `Lock()` e `Unlock()`.',
    },
    {
      type: 'list',
      items: [
        '`go run -race .` e `go test -race ./...` detectam corridas durante a execução. Use nos testes sempre.',
        'Para contadores simples, `sync/atomic` (`atomic.Int64`) é mais leve que um Mutex.',
        'Uma alternativa a compartilhar memória é **comunicar** por channels (próxima aula): "não comunique compartilhando memória; compartilhe memória comunicando".',
      ],
    },
  ],
  analogy:
    'Goroutines são cozinheiros extras que você chama para preparar pratos ao mesmo tempo. O WaitGroup é o quadro onde cada um marca "terminei", e você só serve quando todos marcaram. O Mutex é a única faca de chef: quem precisa dela espera a vez, para ninguém cortar o mesmo tomate ao mesmo tempo.',
  example: {
    language: 'go',
    code: `package main

import (
    "fmt"
    "sync"
)

func main() {
    numeros := []int{1, 2, 3, 4}
    quadrados := make([]int, len(numeros))

    var wg sync.WaitGroup
    for i, n := range numeros {
        wg.Add(1)
        go func() {
            defer wg.Done()
            quadrados[i] = n * n
        }()
    }
    wg.Wait()
    fmt.Println(quadrados)

    var mu sync.Mutex
    contador := 0
    for range 1000 {
        wg.Add(1)
        go func() {
            defer wg.Done()
            mu.Lock()
            contador++
            mu.Unlock()
        }()
    }
    wg.Wait()
    fmt.Println("contador:", contador)
}`,
    lineByLine: [
      { line: 10, text: 'Cada goroutine escreve em uma posição diferente: não há disputa.' },
      { line: 13, text: 'Desde o Go 1.22, cada iteração tem suas próprias variáveis i e n.' },
      { line: 20, text: 'Espera as quatro goroutines antes de imprimir.' },
      { line: 25, text: '`for range 1000` repete mil vezes (Go 1.22+).' },
      { line: 29, text: 'O Mutex garante que só uma goroutine incrementa por vez: o resultado é sempre 1000.' },
    ],
    output: `[1 4 9 16]
contador: 1000`,
  },
  commonErrors: [
    {
      title: 'Esquecer de esperar',
      wrong: 'go salvarLog(evento)\n// main termina aqui',
      why: 'O programa termina antes de a goroutine rodar; o log nunca é gravado.',
      fix: 'Use WaitGroup (ou um channel) e espere antes de sair.',
    },
    {
      title: 'wg.Add dentro da goroutine',
      wrong: 'go func() {\n    wg.Add(1)\n    defer wg.Done()\n    ...\n}()\nwg.Wait()',
      why: 'O Wait pode rodar antes de o Add acontecer, e retornar cedo demais.',
      fix: 'Chame `wg.Add(1)` antes do `go`.',
    },
    {
      title: 'Contador compartilhado sem proteção',
      wrong: 'go func() { total += valor }()',
      why: 'Condição de corrida: atualizações se perdem e o resultado muda a cada execução.',
      fix: 'Mutex, atomic, ou cada goroutine devolve seu valor por um channel e uma só soma.',
    },
  ],
  guidedExerciseId: 'ex-go-10-guiado',
  independentExerciseId: 'ex-go-10-independente',
  reviewQuestions: [
    { question: 'O que acontece com goroutines em andamento quando main termina?', answer: 'São interrompidas: o programa inteiro termina com main.' },
    { question: 'Para que servem Add, Done e Wait no WaitGroup?', answer: 'Add registra quantas goroutines esperar, Done marca uma como terminada e Wait bloqueia até todas terminarem.' },
    { question: 'Como detectar condições de corrida?', answer: 'Rodando com a flag -race (`go run -race .`, `go test -race ./...`).' },
  ],
  summary: [
    'go f() inicia uma goroutine; elas são leves.',
    'main não espera: use WaitGroup.',
    'Variáveis compartilhadas precisam de Mutex ou atomic.',
    'Rode testes com -race.',
  ],
  completionCriteria: ['Prever o resultado de uma goroutine sem espera (exercício guiado).', 'Diagnosticar uma condição de corrida (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-10-guiado',
    type: 'multiple-choice',
    title: 'A mensagem que não aparece',
    difficulty: 'basico',
    concepts: ['go-goroutines'],
    language: 'go',
    statement: 'O que, com quase toda certeza, este programa imprime?',
    code: `package main

import "fmt"

func main() {
    go fmt.Println("enviando e-mail")
    fmt.Println("fim")
}`,
    options: [
      { id: 'a', text: '"enviando e-mail" e depois "fim".', feedback: 'A goroutine nem sempre tem tempo de rodar: main não espera.' },
      { id: 'b', text: 'Só "fim".', feedback: 'Correto: main termina logo, e o programa acaba antes de a goroutine imprimir.' },
      { id: 'c', text: 'Nada: não compila.', feedback: 'Compila: go aceita qualquer chamada de função.' },
      { id: 'd', text: 'Um erro de deadlock.', feedback: 'Não há ninguém bloqueado esperando; main simplesmente termina.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: o programa termina quando main termina.', 'Raciocínio: alguém espera a goroutine terminar?', 'Estrutura: faltou um WaitGroup.'],
    solution: { explanation: 'A goroutine é agendada, mas main imprime "fim" e retorna imediatamente, encerrando o programa. Na prática, quase sempre só "fim" aparece. Com um WaitGroup, as duas mensagens apareceriam.' },
  },
  {
    id: 'ex-go-10-independente',
    type: 'true-false',
    title: 'O total que varia',
    difficulty: 'intermediario',
    concepts: ['go-goroutines'],
    language: 'go',
    statement: 'Avalie a afirmação sobre o trecho abaixo.',
    code: `total := 0
var wg sync.WaitGroup
for range 1000 {
    wg.Add(1)
    go func() {
        defer wg.Done()
        total++
    }()
}
wg.Wait()
fmt.Println(total)`,
    claim: 'O programa sempre imprime 1000, porque o WaitGroup espera todas as goroutines.',
    answer: false,
    justifications: [
      { id: 'a', text: 'O WaitGroup só espera; ele não impede que várias goroutines façam total++ ao mesmo tempo. Há uma condição de corrida, e o resultado pode ser menor que 1000.' },
      { id: 'b', text: 'O WaitGroup não funciona com mais de 100 goroutines.' },
      { id: 'c', text: 'total++ é atômico em Go, então é sempre 1000.' },
      { id: 'd', text: 'Goroutines não podem acessar variáveis de fora da função.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: esperar não é o mesmo que sincronizar o acesso.', 'Raciocínio: total++ é ler, somar e gravar. E se duas goroutines lerem o mesmo valor?', 'Estrutura: a correção é um Mutex em volta do total++ (ou atomic).'],
    solution: { explanation: 'Falso. Duas goroutines podem ler o mesmo valor e gravar o mesmo resultado, perdendo um incremento. `go run -race` acusa a corrida. Com `mu.Lock(); total++; mu.Unlock()` ou `atomic.Int64`, o resultado é sempre 1000.' },
  },
];
