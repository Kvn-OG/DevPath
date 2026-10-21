import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-07',
  trackId: 'golang',
  moduleId: 'golang-m3',
  title: 'Interfaces implícitas',
  durationMin: 30,
  objectives: [
    'Definir interfaces como conjuntos de métodos.',
    'Entender que um tipo satisfaz uma interface sem declarar isso.',
    'Usar interfaces pequenas da biblioteca padrão, como fmt.Stringer e io.Writer.',
    'Descobrir o tipo concreto com type assertion e type switch.',
  ],
  prerequisites: ['go-06'],
  concepts: ['go-interfaces'],
  explanation: [
    {
      type: 'p',
      text: 'Uma **interface** descreve um comportamento: um conjunto de métodos. Qualquer tipo que tenha esses métodos **satisfaz** a interface automaticamente — não existe `implements`. Isso permite escrever funções que aceitam "qualquer coisa que saiba fazer X".',
    },
    {
      type: 'code',
      language: 'go',
      code: `type Notificador interface {
    Enviar(destino, mensagem string) error
}

type Email struct{ Servidor string }
func (e Email) Enviar(destino, mensagem string) error { /* ... */ return nil }

type SMS struct{}
func (SMS) Enviar(destino, mensagem string) error { /* ... */ return nil }

func avisarAtraso(n Notificador, cliente string) error {
    return n.Enviar(cliente, "Seu pedido atrasou")
}`,
    },
    {
      type: 'list',
      items: [
        '`avisarAtraso` funciona com Email, SMS ou um notificador falso nos testes.',
        'Interfaces pequenas (um ou dois métodos) são o estilo de Go: `io.Reader`, `io.Writer`, `fmt.Stringer` (método `String() string`), `error` (método `Error() string`).',
        'Defina a interface onde ela é **usada**, com só os métodos de que aquele código precisa.',
        '`any` (ou `interface{}`) aceita qualquer valor. Use com moderação: você perde a verificação de tipos.',
      ],
    },
    { type: 'h', text: 'Voltando ao tipo concreto' },
    {
      type: 'list',
      items: [
        '`e, ok := n.(Email)`: *type assertion*. ok é false se n não for um Email (sem o ok, um tipo errado causa panic).',
        '`switch v := n.(type) { case Email: ... case SMS: ... }`: *type switch*, para tratar vários tipos.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Receptor de ponteiro e interfaces',
      text: 'Se o método foi declarado com receptor `*T`, só `*T` satisfaz a interface. `var n Notificador = Email{}` falha se Enviar for `func (e *Email)`; use `&Email{}`.',
    },
  ],
  analogy:
    'Uma interface é como uma vaga de emprego que diz "precisamos de alguém que saiba dirigir caminhão". Ninguém precisa se declarar "motorista oficial": quem sabe dirigir caminhão serve — seja o João, a Maria ou um robô.',
  example: {
    language: 'go',
    code: `package main

import (
    "fmt"
    "math"
)

type Forma interface {
    Area() float64
}

type Retangulo struct{ L, A float64 }
type Circulo struct{ R float64 }

func (r Retangulo) Area() float64 { return r.L * r.A }
func (c Circulo) Area() float64   { return math.Pi * c.R * c.R }

func (r Retangulo) String() string { return fmt.Sprintf("retângulo %gx%g", r.L, r.A) }

func main() {
    formas := []Forma{Retangulo{3, 4}, Circulo{1}}
    total := 0.0
    for _, f := range formas {
        total += f.Area()
    }
    fmt.Printf("área total: %.2f\\n", total)
    fmt.Println(formas[0])

    for _, f := range formas {
        switch v := f.(type) {
        case Circulo:
            fmt.Println("círculo de raio", v.R)
        default:
            fmt.Println("outra forma:", v)
        }
    }
}`,
    lineByLine: [
      { line: 8, text: 'Forma é qualquer tipo com um método Area() float64.' },
      { line: 15, text: 'Retangulo e Circulo têm Area, então satisfazem Forma sem declarar nada.' },
      { line: 18, text: 'Com String(), Retangulo também satisfaz fmt.Stringer: o fmt passa a usá-lo ao imprimir.' },
      { line: 21, text: 'Um slice de Forma guarda valores de tipos diferentes.' },
      { line: 27, text: 'Imprime usando o método String do Retangulo.' },
      { line: 30, text: 'O type switch descobre o tipo concreto de cada forma.' },
    ],
    output: `área total: 15.14
retângulo 3x4
outra forma: retângulo 3x4
círculo de raio 1`,
  },
  commonErrors: [
    {
      title: 'Interfaces enormes',
      wrong: 'type Repositorio interface {\n    Criar(...); Buscar(...); Listar(...); Atualizar(...); Apagar(...); Contar(...)\n}',
      why: 'Quem só precisa buscar fica obrigado a implementar tudo (inclusive nos testes).',
      fix: 'Interfaces pequenas, definidas por quem as usa: `type BuscadorDeUsuario interface { Buscar(id int) (Usuario, error) }`.',
    },
    {
      title: 'Type assertion sem ok',
      wrong: 'email := n.(Email)',
      why: 'Se n for um SMS, o programa entra em panic.',
      fix: '`email, ok := n.(Email); if !ok { ... }`',
    },
    {
      title: 'any em todo lugar',
      wrong: 'func Processar(dados any) any',
      why: 'O compilador deixa de ajudar e cada uso exige asserções de tipo.',
      fix: 'Use tipos concretos, interfaces com métodos ou generics.',
    },
  ],
  guidedExerciseId: 'ex-go-07-guiado',
  independentExerciseId: 'ex-go-07-independente',
  reviewQuestions: [
    { question: 'Como um tipo passa a satisfazer uma interface em Go?', answer: 'Basta ter todos os métodos da interface; não há declaração explícita.' },
    { question: 'O que é fmt.Stringer?', answer: 'Uma interface com o método String() string; o fmt usa esse método ao imprimir o valor.' },
    { question: 'Para que serve o ok em `v, ok := x.(T)`?', answer: 'Para saber se x é do tipo T sem causar panic quando não for.' },
  ],
  summary: [
    'Interface = conjunto de métodos; satisfação é implícita.',
    'Interfaces pequenas, definidas onde são usadas.',
    'Stringer e error são interfaces de um método só.',
    'Type assertion com ok e type switch voltam ao tipo concreto.',
  ],
  completionCriteria: ['Identificar qual tipo satisfaz uma interface (exercício guiado).', 'Usar type assertion com segurança (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-07-guiado',
    type: 'multiple-choice',
    title: 'Quem é um Notificador?',
    difficulty: 'basico',
    concepts: ['go-interfaces'],
    language: 'go',
    statement: 'Considerando a interface abaixo, qual tipo a satisfaz?',
    code: `type Notificador interface {
    Enviar(destino, mensagem string) error
}`,
    options: [
      { id: 'a', text: '`type Push struct{}` com `func (Push) Enviar(destino string) error`', feedback: 'Faltou um parâmetro: a assinatura precisa ser idêntica.' },
      { id: 'b', text: '`type Slack struct{}` com `func (Slack) Enviar(destino, mensagem string) error`', feedback: 'Correto: o método tem exatamente o nome, os parâmetros e o retorno da interface.' },
      { id: 'c', text: '`type Fax struct{}` com `func (Fax) Enviar(destino, mensagem string)`', feedback: 'Falta o retorno error.' },
      { id: 'd', text: '`type Pombo struct{} // implements Notificador`', feedback: 'Comentários não fazem nada; o tipo precisa ter o método.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: satisfazer = ter todos os métodos, com a mesma assinatura.', 'Raciocínio: compare nome, parâmetros e retorno de cada opção.', 'Estrutura: Enviar(string, string) error.'],
    solution: { explanation: 'Só Slack tem `Enviar(destino, mensagem string) error`. Assinaturas diferentes (parâmetros ou retorno) não satisfazem a interface.' },
  },
  {
    id: 'ex-go-07-independente',
    type: 'multiple-choice',
    title: 'Asserção segura',
    difficulty: 'intermediario',
    concepts: ['go-interfaces'],
    language: 'go',
    statement: 'A função descrever recebe valores de tipos diferentes como any. O que o programa imprime?',
    code: `package main

import "fmt"

func descrever(v any) string {
    if n, ok := v.(int); ok {
        return fmt.Sprint("inteiro ", n*2)
    }
    if s, ok := v.(string); ok {
        return "texto " + s
    }
    return "outro"
}

func main() {
    fmt.Println(descrever(21))
    fmt.Println(descrever("go"))
    fmt.Println(descrever(1.5))
}`,
    options: [
      { id: 'a', text: 'inteiro 42 / texto go / outro', feedback: 'Correto: cada asserção com ok testa um tipo sem risco de panic.' },
      { id: 'b', text: 'inteiro 42 / texto go / inteiro 3', feedback: '1.5 é float64, e v.(int) não converte valores: só verifica o tipo.' },
      { id: 'c', text: 'panic na terceira chamada.', feedback: 'Com a forma `, ok`, um tipo diferente só devolve ok = false.' },
      { id: 'd', text: 'Não compila: any não aceita int.', feedback: 'any aceita qualquer valor.' },
    ],
    correctOptionId: 'a',
    hints: ['Conceito: v.(T) verifica o tipo, não converte.', 'Raciocínio: qual o tipo de 1.5?', 'Estrutura: com ok, a falha não causa panic.'],
    solution: { explanation: '21 é int (vira 42), "go" é string e 1.5 é float64, que não corresponde a nenhuma asserção: "outro". Uma asserção sem ok, como `v.(int)`, causaria panic no terceiro caso.' },
  },
];
