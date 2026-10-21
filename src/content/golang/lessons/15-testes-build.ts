import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-15',
  trackId: 'golang',
  moduleId: 'golang-m5',
  title: 'Testes, configuração e build para produção',
  durationMin: 30,
  objectives: [
    'Escrever testes com o pacote testing, no formato de tabela.',
    'Rodar go test, go vet e o detector de corridas.',
    'Ler configuração de variáveis de ambiente.',
    'Gerar um binário para Linux e empacotá-lo em uma imagem Docker enxuta.',
  ],
  prerequisites: ['go-14'],
  concepts: ['go-testes'],
  explanation: [
    { type: 'h', text: 'Testes' },
    {
      type: 'list',
      items: [
        'Testes ficam em arquivos terminados em **`_test.go`**, no mesmo pacote do código.',
        'Cada teste é uma função `func TestNome(t *testing.T)`. `t.Errorf` registra a falha e continua; `t.Fatalf` para o teste.',
        '**Testes de tabela**: um slice de casos (entrada e resultado esperado) percorrido em um laço, cada um em `t.Run(nome, ...)`. Adicionar um caso é adicionar uma linha.',
        '`go test ./...` roda tudo; `-v` mostra cada teste; `-race` detecta corridas; `-cover` mostra a cobertura.',
        '`go vet ./...` aponta erros comuns que compilam (Printf com argumentos errados, cancel não chamado).',
      ],
    },
    { type: 'h', text: 'Configuração' },
    {
      type: 'p',
      text: 'Configuração vem do ambiente, não do código: `os.Getenv("DATABASE_URL")`, `os.Getenv("PORT")`. Valide na inicialização e encerre com uma mensagem clara se faltar algo obrigatório — é melhor falhar no deploy do que na primeira requisição.',
    },
    { type: 'h', text: 'Build para o servidor' },
    {
      type: 'code',
      language: 'shell',
      code: `# Binário estático para Linux, a partir de qualquer sistema
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o api ./cmd/api`,
    },
    {
      type: 'code',
      language: 'shell',
      code: `# Dockerfile em dois estágios: compila em uma imagem, roda em outra mínima
FROM golang:1.25 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /api ./cmd/api

FROM gcr.io/distroless/static-debian12
COPY --from=build /api /api
EXPOSE 8080
CMD ["/api"]`,
    },
    {
      type: 'p',
      text: 'A imagem final tem poucos MB e nenhuma ferramenta além do seu binário — menos coisa para atacar. É essa imagem que você vai publicar na sua VPS com o EasyPanel na Trilha 11.',
    },
  ],
  analogy:
    'Testes de tabela são como a planilha de conferência de uma balança: cada linha tem um peso conhecido e o valor que a balança deve mostrar. Para testar um caso novo, você acrescenta uma linha — não reescreve o procedimento.',
  example: {
    language: 'go',
    code: `// arquivo: vendas/comissao_test.go (Comissao paga 3% abaixo de 5.000 e 5% a partir disso)
package vendas

import "testing"

func TestComissao(t *testing.T) {
    casos := []struct {
        nome  string
        valor float64
        quero float64
    }{
        {"abaixo da meta", 1000, 30},
        {"na meta", 5000, 250},
        {"zero", 0, 0},
    }
    for _, c := range casos {
        t.Run(c.nome, func(t *testing.T) {
            if obtido := Comissao(c.valor); obtido != c.quero {
                t.Errorf("Comissao(%v) = %v, quero %v", c.valor, obtido, c.quero)
            }
        })
    }
}`,
    lineByLine: [
      { line: 1, text: 'O nome termina em _test.go: só é compilado pelo go test.' },
      { line: 6, text: 'Funções de teste começam com Test e recebem *testing.T.' },
      { line: 7, text: 'A tabela de casos: um slice de structs anônimas.' },
      { line: 17, text: 't.Run cria um subteste com nome, que aparece separado na saída.' },
      { line: 19, text: 'Errorf registra a falha com uma mensagem que mostra entrada, obtido e esperado.' },
    ],
    output: `$ go test -v ./vendas
=== RUN   TestComissao
=== RUN   TestComissao/abaixo_da_meta
=== RUN   TestComissao/na_meta
=== RUN   TestComissao/zero
--- PASS: TestComissao (0.00s)
    --- PASS: TestComissao/abaixo_da_meta (0.00s)
    --- PASS: TestComissao/na_meta (0.00s)
    --- PASS: TestComissao/zero (0.00s)
PASS
ok      github.com/voce/loja/vendas     0.003s`,
  },
  commonErrors: [
    {
      title: 'Teste que não roda',
      wrong: '// arquivo: comissao_teste.go\nfunc testComissao(t *testing.T) { ... }',
      why: 'O arquivo precisa terminar em _test.go e a função começar com Test (maiúsculo).',
      fix: '`comissao_test.go` e `func TestComissao(t *testing.T)`.',
    },
    {
      title: 'Configuração no código',
      wrong: 'db, _ := pgxpool.New(ctx, "postgresql://postgres:senha@localhost/loja")',
      why: 'A senha vai para o repositório, e trocar de ambiente exige recompilar.',
      fix: 'Leia de `os.Getenv("DATABASE_URL")` e configure por ambiente.',
    },
    {
      title: 'Binário com dependência de C',
      why: 'Sem CGO_ENABLED=0, o binário pode depender de bibliotecas do sistema e falhar em imagens mínimas ("no such file or directory").',
      fix: 'Compile com `CGO_ENABLED=0` para gerar um binário estático.',
    },
  ],
  guidedExerciseId: 'ex-go-15-guiado',
  independentExerciseId: 'ex-go-15-independente',
  reviewQuestions: [
    { question: 'Qual a vantagem de um teste de tabela?', answer: 'Casos novos são linhas novas: o procedimento do teste é escrito uma vez e cada caso aparece com nome próprio na saída.' },
    { question: 'Como gerar um binário para Linux a partir do Windows?', answer: 'Definindo GOOS=linux e GOARCH (ex.: amd64) antes do go build; com CGO_ENABLED=0, ele fica estático.' },
    { question: 'Por que um Dockerfile em dois estágios?', answer: 'Para compilar em uma imagem com o Go e rodar em outra mínima, só com o binário: imagem menor e mais segura.' },
  ],
  summary: [
    'Testes em _test.go, funções TestXxx, tabelas de casos com t.Run.',
    'go test ./... -race e go vet ./... sempre.',
    'Configuração por variáveis de ambiente, validada na inicialização.',
    'CGO_ENABLED=0 GOOS=linux go build e imagem Docker em dois estágios.',
  ],
  completionCriteria: ['Reconhecer um arquivo de teste válido (exercício guiado).', 'Montar o comando de build para o servidor (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-15-guiado',
    type: 'multiple-choice',
    title: 'O teste invisível',
    difficulty: 'iniciante',
    concepts: ['go-testes'],
    statement: 'Ao rodar `go test ./...`, o Go diz "no test files" para o pacote vendas. Qual combinação de arquivo e função seria encontrada?',
    options: [
      { id: 'a', text: 'vendas_teste.go com `func TestTotal(t *testing.T)`', feedback: 'O sufixo precisa ser _test.go, em inglês.' },
      { id: 'b', text: 'vendas_test.go com `func testTotal(t *testing.T)`', feedback: 'A função precisa começar com Test, com T maiúsculo.' },
      { id: 'c', text: 'vendas_test.go com `func TestTotal(t *testing.T)`', feedback: 'Correto: arquivo com sufixo _test.go e função TestXxx(*testing.T).' },
      { id: 'd', text: 'test_vendas.go com `func TestTotal()`', feedback: 'Nome de arquivo e assinatura incorretos.' },
    ],
    correctOptionId: 'c',
    hints: ['Conceito: o go test procura por convenção de nomes.', 'Raciocínio: confira o sufixo do arquivo e o começo do nome da função.', 'Estrutura: _test.go e TestXxx(t *testing.T).'],
    solution: { explanation: 'O go test só compila arquivos terminados em _test.go e só executa funções com a forma `func TestXxx(t *testing.T)`.' },
  },
  {
    id: 'ex-go-15-independente',
    type: 'fill-blanks',
    title: 'Binário para a VPS',
    difficulty: 'basico',
    concepts: ['go-testes'],
    language: 'shell',
    statement: 'A VPS roda Linux em processador x86-64. Complete o comando que gera, do seu notebook, um binário estático da API em ./cmd/api.',
    template: 'CGO_ENABLED=[[0]] GOOS=[[1]] GOARCH=[[2]] go [[3]] -o api ./cmd/api',
    blanks: [
      { accept: ['0'], width: 2 },
      { accept: ['linux'], caseSensitive: true, width: 6 },
      { accept: ['amd64'], caseSensitive: true, width: 6 },
      { accept: ['build'], caseSensitive: true, width: 6 },
    ],
    hints: [
      'Conceito: GOOS e GOARCH escolhem o sistema e o processador de destino.',
      'Raciocínio: CGO desligado gera binário estático; x86-64 se chama amd64 no Go.',
      'Estrutura: 0, linux, amd64 e build.',
    ],
    solution: {
      code: 'CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o api ./cmd/api',
      explanation: 'O compilador do Go gera binários para outros sistemas sem ferramentas extras. Para servidores ARM (comuns e baratos em alguns provedores), seria GOARCH=arm64.',
    },
  },
];
