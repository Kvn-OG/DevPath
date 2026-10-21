import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-05',
  trackId: 'golang',
  moduleId: 'golang-m2',
  title: 'Maps e structs',
  durationMin: 30,
  objectives: [
    'Criar, ler, alterar e apagar entradas de um map.',
    'Diferenciar "chave ausente" de "valor zero" com o retorno duplo (comma ok).',
    'Definir structs, criar valores e acessar campos.',
    'Combinar slices de structs e maps em estruturas de dados reais.',
  ],
  prerequisites: ['go-04'],
  concepts: ['go-maps-structs'],
  explanation: [
    { type: 'h', text: 'Maps' },
    {
      type: 'p',
      text: 'Um **map** associa chaves a valores, como um objeto usado de dicionário no JavaScript — mas com tipos fixos: `map[string]int` tem chaves string e valores int.',
    },
    {
      type: 'code',
      language: 'go',
      code: `estoque := map[string]int{"café": 25}
estoque["caneca"] = 12        // insere ou altera
delete(estoque, "café")      // apaga
qtd, ok := estoque["chá"]    // qtd = 0, ok = false (chave ausente)`,
    },
    {
      type: 'list',
      items: [
        'Ler uma chave ausente devolve o **valor zero** (0, ""...). Para saber se ela existe, use a forma `valor, ok := m[chave]`.',
        'Isso permite contar sem inicializar: `contagem[palavra]++` funciona mesmo na primeira vez.',
        'A ordem de um `range` sobre map é **aleatória** de propósito. Se precisar de ordem, ordene as chaves.',
        'Um map declarado com `var m map[string]int` é `nil`: ler funciona, mas **escrever causa panic**. Crie com `make(map[string]int)` ou com um literal.',
      ],
    },
    { type: 'h', text: 'Structs' },
    {
      type: 'p',
      text: 'Uma **struct** agrupa campos com nome e tipo — é a forma de modelar entidades como tarefas, usuários e pedidos:',
    },
    {
      type: 'code',
      language: 'go',
      code: `type Tarefa struct {
    Titulo     string
    Prioridade int
    Concluida  bool
}

t := Tarefa{Titulo: "Criar layout", Prioridade: 2} // Concluida fica false
t.Concluida = true`,
    },
    {
      type: 'p',
      text: 'Campos não informados recebem o valor zero. Campos com inicial **maiúscula** são exportados (visíveis em outros pacotes e na conversão para JSON); com minúscula, são privados ao pacote.',
    },
  ],
  analogy:
    'Um map é uma agenda telefônica: você procura pelo nome (chave) e encontra o número (valor); procurar alguém que não está lá devolve uma linha em branco, e por isso é bom perguntar "ele está na agenda?". Uma struct é a ficha de cadastro com campos impressos: nome, prioridade, situação.',
  example: {
    language: 'go',
    code: `package main

import "fmt"

type Tarefa struct {
    Titulo     string
    Prioridade int
    Concluida  bool
}

func main() {
    estoque := map[string]int{"café": 25, "chá": 0}
    estoque["caneca"] = 12
    delete(estoque, "chá")

    qtd, ok := estoque["moedor"]
    fmt.Println(len(estoque), qtd, ok)

    t := Tarefa{Titulo: "Criar layout", Prioridade: 2}
    t.Concluida = true
    fmt.Printf("%+v\\n", t)

    tarefas := []Tarefa{t, {Titulo: "Escrever textos", Prioridade: 1}}
    for _, tarefa := range tarefas {
        fmt.Println(tarefa.Titulo, tarefa.Concluida)
    }
}`,
    lineByLine: [
      { line: 5, text: 'Define o tipo Tarefa com três campos.' },
      { line: 14, text: 'Remove a chave "chá"; sobram café e caneca.' },
      { line: 16, text: '"moedor" não existe: qtd recebe 0 e ok, false.' },
      { line: 19, text: 'Concluida não foi informada e começa como false.' },
      { line: 21, text: '%+v imprime a struct com os nomes dos campos.' },
      { line: 23, text: 'No literal de um slice de structs, o nome do tipo pode ser omitido nos elementos.' },
    ],
    output: `2 0 false
{Titulo:Criar layout Prioridade:2 Concluida:true}
Criar layout true
Escrever textos false`,
  },
  commonErrors: [
    {
      title: 'Escrever em um map nil',
      wrong: 'var precos map[string]float64\nprecos["café"] = 89.9',
      why: 'panic: assignment to entry in nil map. O map foi declarado, mas não criado.',
      fix: '`precos := make(map[string]float64)` ou `precos := map[string]float64{}`.',
    },
    {
      title: 'Confundir ausente com zero',
      wrong: 'if estoque["chá"] == 0 {\n    fmt.Println("produto não cadastrado")\n}',
      why: 'Um produto cadastrado com estoque 0 também cai nesse if.',
      fix: '`if _, ok := estoque["chá"]; !ok { ... }`',
    },
    {
      title: 'Depender da ordem do range em maps',
      why: 'A ordem muda a cada execução; testes e relatórios ficam instáveis.',
      fix: 'Pegue as chaves, ordene com `slices.Sort` e percorra o slice ordenado.',
    },
  ],
  guidedExerciseId: 'ex-go-05-guiado',
  independentExerciseId: 'ex-go-05-independente',
  reviewQuestions: [
    { question: 'O que devolve a leitura de uma chave ausente em um map[string]int?', answer: '0, o valor zero do tipo do valor. Com `v, ok := m[k]`, ok indica se a chave existe.' },
    { question: 'Por que contagem[palavra]++ funciona na primeira ocorrência?', answer: 'Porque a leitura de uma chave ausente devolve 0, e o ++ grava 1.' },
    { question: 'O que significa um campo de struct com inicial maiúscula?', answer: 'Que ele é exportado: visível fora do pacote e incluído na conversão para JSON.' },
  ],
  summary: [
    'map[chave]valor: inserir, ler, delete; ordem do range é aleatória.',
    'v, ok := m[k] diferencia ausente de valor zero.',
    'Map nil: leitura ok, escrita causa panic — use make.',
    'Structs modelam entidades; campos omitidos recebem o valor zero.',
  ],
  completionCriteria: ['Usar a forma comma ok para checar uma chave (exercício guiado).', 'Diagnosticar um panic em map (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-05-guiado',
    type: 'fill-blanks',
    title: 'O produto existe?',
    difficulty: 'basico',
    concepts: ['go-maps-structs'],
    language: 'go',
    statement: 'Complete o código para diferenciar um produto **sem estoque** de um produto **não cadastrado**.',
    template: `estoque := map[string]int{"café": 25, "chá": 0}

qtd, [[0]] := estoque[nome]
if ![[1]] {
    fmt.Println(nome, "não está cadastrado")
} else if qtd == 0 {
    fmt.Println(nome, "está esgotado")
}`,
    blanks: [
      { accept: ['ok', 'existe', 'encontrado'], width: 4 },
      { accept: ['ok', 'existe', 'encontrado'], width: 4 },
    ],
    hints: [
      'Conceito: a leitura de um map pode devolver dois valores.',
      'Raciocínio: o segundo valor é um bool que diz se a chave existe. Use o mesmo nome nas duas lacunas.',
      'Estrutura: `qtd, ok := estoque[nome]` e `if !ok`.',
    ],
    solution: {
      code: `qtd, ok := estoque[nome]
if !ok {
    fmt.Println(nome, "não está cadastrado")
} else if qtd == 0 {
    fmt.Println(nome, "está esgotado")
}`,
      explanation: 'Com a forma comma ok, "chá" devolve 0 e true (esgotado), enquanto "moedor" devolve 0 e false (não cadastrado). Só olhando para qtd, os dois casos seriam iguais.',
    },
  },
  {
    id: 'ex-go-05-independente',
    type: 'multiple-choice',
    title: 'O contador de palavras',
    difficulty: 'intermediario',
    concepts: ['go-maps-structs'],
    language: 'go',
    statement: 'O programa abaixo deveria contar as palavras, mas termina com erro. O que acontece e como corrigir?',
    code: `package main

import "fmt"

func main() {
    var contagem map[string]int
    for _, p := range []string{"go", "sql", "go"} {
        contagem[p]++
    }
    fmt.Println(contagem["go"])
}`,
    options: [
      { id: 'a', text: 'Não compila: não se pode usar ++ em valores de map.', feedback: 'Compila: `contagem[p]++` é válido.' },
      {
        id: 'b',
        text: 'panic: assignment to entry in nil map. Corrige-se com `contagem := make(map[string]int)`.',
        feedback: 'Correto: o map foi declarado, mas não criado; escrever nele causa panic.',
      },
      { id: 'c', text: 'Imprime 0, porque as chaves ainda não existiam.', feedback: 'Antes de imprimir, a primeira escrita já causa panic.' },
      { id: 'd', text: 'Imprime 2.', feedback: 'Seria o resultado com o map criado por make.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: `var m map[K]V` cria um map nil.', 'Raciocínio: ler de um map nil funciona; e escrever?', 'Estrutura: crie o map com make antes de escrever.'],
    solution: { explanation: '`var contagem map[string]int` é nil. A primeira escrita (`contagem[p]++`) causa panic. Com `contagem := make(map[string]int)`, o programa imprime 2.' },
  },
];
