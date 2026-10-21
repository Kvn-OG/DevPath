import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-09',
  trackId: 'golang',
  moduleId: 'golang-m3',
  title: 'defer, panic, recover e pacotes',
  durationMin: 30,
  objectives: [
    'Liberar recursos com defer e prever a ordem de execução.',
    'Diferenciar erro (esperado) de panic (bug ou situação impossível).',
    'Recuperar de um panic com recover.',
    'Organizar código em pacotes e controlar a visibilidade com maiúsculas.',
  ],
  prerequisites: ['go-08'],
  concepts: ['go-defer-pacotes'],
  explanation: [
    { type: 'h', text: 'defer' },
    {
      type: 'p',
      text: '`defer f()` agenda a chamada para quando a função atual **terminar**, de qualquer jeito: return normal, erro ou panic. É o jeito de garantir que arquivos, conexões e locks sejam liberados. Vários defers rodam na ordem **inversa** (o último agendado roda primeiro).',
    },
    {
      type: 'code',
      language: 'go',
      code: `arq, err := os.Open("dados.csv")
if err != nil {
    return err
}
defer arq.Close() // logo depois de abrir, sem esquecer`,
    },
    { type: 'h', text: 'panic e recover' },
    {
      type: 'p',
      text: '`panic` interrompe a função, roda os defers e sobe pela pilha até derrubar o programa. Acontece em bugs (índice fora do intervalo, ponteiro nil) ou quando o código chama `panic` em uma situação impossível. **Não use panic para erros esperados** (arquivo inexistente, entrada inválida): para isso existe `error`.',
    },
    {
      type: 'p',
      text: '`recover()`, chamado dentro de um defer, captura o panic e devolve o valor dele. Servidores HTTP usam isso para que um bug em uma requisição não derrube o servidor inteiro (o net/http já faz isso por você).',
    },
    { type: 'h', text: 'Pacotes e visibilidade' },
    {
      type: 'list',
      items: [
        'Cada **pasta** é um pacote; todos os arquivos dela declaram o mesmo `package`.',
        'Nomes com inicial **maiúscula** são exportados (`vendas.CalcularComissao`); com minúscula, só existem dentro do pacote.',
        'Importe pelo caminho do módulo: `import "github.com/voce/loja/internal/vendas"`.',
        'Uma pasta `internal/` só pode ser importada pelo próprio módulo: ótimo para código que não é API pública.',
        'Organização comum: `cmd/api/main.go` (o executável), `internal/...` (regras, banco, HTTP).',
        '`go get github.com/jackc/pgx/v5` adiciona uma dependência ao go.mod; o go.sum guarda os hashes de verificação.',
      ],
    },
  ],
  analogy:
    'defer é o post-it "apagar a luz ao sair" colado na porta assim que você entra: não importa se você sai andando, correndo ou carregado (panic), a luz é apagada. E vários post-its são lidos de cima para baixo — o último colado é o primeiro lido.',
  example: {
    language: 'go',
    code: `package main

import "fmt"

func processar() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recuperado: %v", r)
        }
    }()
    defer fmt.Println("defer 1")
    defer fmt.Println("defer 2")

    var itens []string
    fmt.Println(itens[3])
    return nil
}

func main() {
    fmt.Println("início")
    err := processar()
    fmt.Println("erro:", err)
}`,
    lineByLine: [
      { line: 5, text: 'O retorno tem nome (err), para que o defer possa alterá-lo.' },
      { line: 6, text: 'Primeiro defer agendado: será o último a rodar. Ele captura o panic e o transforma em erro.' },
      { line: 12, text: 'Último defer agendado: o primeiro a rodar.' },
      { line: 15, text: 'Índice 3 em um slice vazio: panic. A função para aqui e os defers rodam em ordem inversa.' },
      { line: 21, text: 'O programa não caiu: processar devolveu o panic como erro.' },
    ],
    output: `início
defer 2
defer 1
erro: recuperado: runtime error: index out of range [3] with length 0`,
  },
  commonErrors: [
    {
      title: 'Usar panic para erros comuns',
      wrong: 'if err != nil {\n    panic(err)\n}',
      why: 'Uma falha previsível (rede, arquivo, entrada) derruba o programa inteiro.',
      fix: 'Devolva o erro com contexto. Reserve panic para situações impossíveis na inicialização.',
    },
    {
      title: 'defer dentro de um laço longo',
      wrong: 'for _, nome := range arquivos {\n    f, _ := os.Open(nome)\n    defer f.Close()\n}',
      why: 'Os defers só rodam quando a função termina: com milhares de arquivos, todos ficam abertos até o fim.',
      fix: 'Mova o corpo do laço para uma função própria, com o defer dentro dela.',
    },
    {
      title: 'Nome não exportado',
      wrong: 'vendas.calcularComissao(1000)  // de outro pacote',
      why: 'Inicial minúscula: o identificador não é visível fora do pacote vendas.',
      fix: 'Exporte com maiúscula (`CalcularComissao`) se for parte da API do pacote.',
    },
  ],
  guidedExerciseId: 'ex-go-09-guiado',
  independentExerciseId: 'ex-go-09-independente',
  reviewQuestions: [
    { question: 'Em que ordem rodam três defers agendados na mesma função?', answer: 'Na ordem inversa: o último agendado roda primeiro (pilha).' },
    { question: 'Quando usar panic em vez de error?', answer: 'Só para bugs e situações impossíveis; falhas esperadas devem ser devolvidas como error.' },
    { question: 'O que torna um identificador visível fora do pacote?', answer: 'Começar com letra maiúscula.' },
  ],
  summary: [
    'defer roda ao sair da função, em ordem inversa; use para liberar recursos.',
    'panic é para bugs; error, para falhas esperadas.',
    'recover dentro de um defer captura um panic.',
    'Pasta = pacote; maiúscula = exportado; internal/ é privado ao módulo.',
  ],
  completionCriteria: ['Prever a ordem dos defers (exercício guiado).', 'Identificar o que é visível de outro pacote (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-09-guiado',
    type: 'multiple-choice',
    title: 'A ordem dos defers',
    difficulty: 'basico',
    concepts: ['go-defer-pacotes'],
    language: 'go',
    statement: 'Três defers são agendados dentro de um laço. O que o programa imprime?',
    code: `package main

import "fmt"

func main() {
    for i := 1; i <= 3; i++ {
        defer fmt.Print(i, " ")
    }
    fmt.Print("fim ")
}`,
    options: [
      { id: 'a', text: '1 2 3 fim', feedback: 'Os defers só rodam quando main termina, depois de "fim".' },
      { id: 'b', text: 'fim 1 2 3', feedback: 'Os defers rodam em ordem inversa ao agendamento.' },
      { id: 'c', text: 'fim 3 2 1', feedback: 'Correto: "fim" primeiro; depois os defers, do último para o primeiro.' },
      { id: 'd', text: 'fim 3 3 3', feedback: 'Os argumentos do defer são avaliados na hora do agendamento (e, desde o Go 1.22, cada iteração tem seu próprio i).' },
    ],
    correctOptionId: 'c',
    hints: ['Conceito: defer roda ao fim da função, como uma pilha.', 'Raciocínio: o que roda antes de main terminar?', 'Estrutura: o último agendado é o primeiro executado.'],
    solution: { explanation: '"fim" é impresso durante a execução normal. Ao terminar main, os defers rodam do último (3) para o primeiro (1).' },
  },
  {
    id: 'ex-go-09-independente',
    type: 'multiple-choice',
    title: 'O que outro pacote enxerga?',
    difficulty: 'basico',
    concepts: ['go-defer-pacotes'],
    language: 'go',
    statement: 'O arquivo abaixo está no pacote `vendas`. A partir do pacote `main`, qual uso compila?',
    code: `package vendas

const taxaPadrao = 0.05

type Pedido struct {
    Total    float64
    desconto float64
}

func CalcularComissao(p Pedido) float64 { return p.Total * taxaPadrao }

func aplicarDesconto(p *Pedido) { p.Total -= p.desconto }`,
    options: [
      { id: 'a', text: '`vendas.aplicarDesconto(&p)`', feedback: 'aplicarDesconto começa com minúscula: não é exportada.' },
      { id: 'b', text: '`vendas.CalcularComissao(vendas.Pedido{Total: 1000})`', feedback: 'Correto: Pedido, Total e CalcularComissao são exportados.' },
      { id: 'c', text: '`fmt.Println(vendas.taxaPadrao)`', feedback: 'taxaPadrao começa com minúscula.' },
      { id: 'd', text: '`vendas.Pedido{Total: 1000, desconto: 50}`', feedback: 'O campo desconto não é exportado e não pode ser preenchido de fora.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: maiúscula = exportado.', 'Raciocínio: verifique a inicial de cada nome usado, inclusive campos.', 'Estrutura: só uma opção usa apenas nomes com maiúscula.'],
    solution: { explanation: 'De fora do pacote, só nomes com inicial maiúscula são acessíveis: Pedido, Total e CalcularComissao. taxaPadrao, desconto e aplicarDesconto são detalhes internos de vendas.' },
  },
];
