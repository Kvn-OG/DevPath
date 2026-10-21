import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-01',
  trackId: 'golang',
  moduleId: 'golang-m1',
  title: 'Por que Go e o primeiro programa',
  durationMin: 20,
  objectives: [
    'Explicar onde Go se destaca e por que é usado em back-end e infraestrutura.',
    'Instalar o Go e criar um módulo com go mod init.',
    'Entender package main, import e func main.',
    'Rodar com go run e gerar um binário com go build.',
  ],
  prerequisites: [],
  concepts: ['go-basico'],
  explanation: [
    {
      type: 'p',
      text: '**Go** (ou Golang) foi criada no Google em 2009 para escrever servidores grandes sem perder a simplicidade. Ela é **compilada** (o resultado é um único arquivo executável, sem precisar instalar nada no servidor), **tipada estaticamente** (erros de tipo aparecem antes de rodar) e tem **concorrência** embutida na linguagem. Docker, Kubernetes, Terraform e boa parte das ferramentas de nuvem são escritas em Go.',
    },
    {
      type: 'p',
      text: 'Comparando com o JavaScript da Trilha 1: os conceitos (variáveis, condicionais, laços, funções) são os mesmos, mas o compilador é muito mais rigoroso — e isso é uma vantagem. Variáveis declaradas e não usadas, imports sobrando e tipos misturados **impedem o programa de compilar**.',
    },
    { type: 'h', text: 'Instalando e criando um projeto' },
    {
      type: 'code',
      language: 'shell',
      code: `# Instale pelo site oficial (go.dev/dl) e confira
go version

# Um projeto Go é um módulo, identificado por um caminho
mkdir saudacao && cd saudacao
go mod init github.com/seu-usuario/saudacao

# Crie main.go (abaixo) e rode
go run .

# Gere o executável
go build -o saudacao
./saudacao`,
    },
    {
      type: 'list',
      items: [
        '`go mod init` cria o arquivo **go.mod**, com o nome do módulo e a versão do Go. Dependências externas também ficam registradas nele.',
        '`go run .` compila e executa na hora, sem deixar arquivo.',
        '`go build` gera o binário. Ele roda em qualquer máquina com o mesmo sistema, sem o Go instalado.',
        '`go fmt ./...` formata todo o código no estilo oficial. Em Go não se discute formatação: todo mundo usa o gofmt.',
      ],
    },
    { type: 'h', text: 'A anatomia de um programa' },
    {
      type: 'list',
      items: [
        '`package main`: todo arquivo pertence a um pacote; `main` é o pacote que vira executável.',
        '`import "fmt"`: importa o pacote de formatação da biblioteca padrão (*format*).',
        '`func main()`: o ponto de entrada. O programa termina quando ela termina.',
        '`fmt.Println` escreve valores separados por espaço e pula linha; `fmt.Printf` usa um molde com verbos como `%s` (texto), `%d` (inteiro) e `%v` (qualquer valor).',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Onde rodar os exemplos',
      text: 'O DevPath ainda não executa Go no navegador. Rode os exemplos no seu computador (com `go run .`) ou cole-os no Go Playground, em go.dev/play. Os exercícios desta trilha são de leitura de código, previsão e preenchimento.',
    },
  ],
  analogy:
    'JavaScript é como cozinhar na frente do cliente: rápido para começar, e os erros aparecem no prato. Go é como uma cozinha industrial com checklist: antes de o prato sair (compilar), o fiscal confere ingredientes e etapas — e o que sai é uma marmita pronta (o binário), que qualquer um esquenta sem precisar da cozinha.',
  example: {
    language: 'go',
    code: `package main

import "fmt"

func main() {
    nome := "DevPath"
    fmt.Println("Olá,", nome)
    fmt.Printf("%s tem %d letras\\n", nome, len(nome))
}`,
    lineByLine: [
      { line: 1, text: 'Este arquivo pertence ao pacote main: vai virar um executável.' },
      { line: 3, text: 'Importa o pacote fmt, da biblioteca padrão.' },
      { line: 5, text: 'A função main é chamada quando o programa inicia.' },
      { line: 6, text: '`:=` declara a variável e deduz o tipo (string).' },
      { line: 7, text: 'Println separa os valores com espaço e pula linha.' },
      { line: 8, text: 'Printf preenche %s com o texto e %d com o inteiro; \\n pula a linha.' },
    ],
    output: `Olá, DevPath
DevPath tem 7 letras`,
  },
  commonErrors: [
    {
      title: 'Import não usado',
      wrong: 'import (\n    "fmt"\n    "os"\n)',
      why: 'Se "os" não é usado, o compilador recusa: "os" imported and not used.',
      fix: 'Remova o import. Editores com a extensão de Go fazem isso sozinhos ao salvar (goimports).',
    },
    {
      title: 'Chave na linha de baixo',
      wrong: 'func main()\n{\n    fmt.Println("oi")\n}',
      why: 'Go insere ponto e vírgula automático no fim da linha; a chave sozinha na linha seguinte quebra a sintaxe.',
      fix: 'A chave de abertura fica sempre na mesma linha: `func main() {`.',
    },
    {
      title: 'Rodar go run main.go em projetos com vários arquivos',
      why: 'Só main.go é compilado; funções de outros arquivos do pacote aparecem como "undefined".',
      fix: 'Use `go run .` para compilar o pacote inteiro.',
    },
  ],
  guidedExerciseId: 'ex-go-01-guiado',
  independentExerciseId: 'ex-go-01-independente',
  reviewQuestions: [
    { question: 'O que o go build produz?', answer: 'Um executável único, que roda sem o Go instalado na máquina de destino (do mesmo sistema operacional e arquitetura).' },
    { question: 'Para que serve o arquivo go.mod?', answer: 'Identifica o módulo (seu caminho) e registra a versão do Go e as dependências.' },
    { question: 'O que acontece se um import não for usado?', answer: 'O programa não compila. Go trata imports e variáveis não usadas como erro.' },
  ],
  summary: [
    'Go é compilada, tipada e gera um binário único.',
    'Projeto = módulo (go mod init); go run executa, go build gera o binário.',
    'package main + func main() formam o ponto de entrada.',
    'O compilador é rigoroso: imports e variáveis sem uso são erro.',
  ],
  completionCriteria: ['Ordenar a criação de um projeto do zero (exercício guiado).', 'Prever o efeito de um import sem uso (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-01-guiado',
    type: 'order-steps',
    title: 'Do zero ao binário',
    difficulty: 'iniciante',
    concepts: ['go-basico'],
    statement: 'Ordene os passos para criar um programa Go novo e gerar um executável para enviar ao servidor.',
    steps: [
      { id: 'a', text: 'Criar a pasta do projeto e entrar nela.' },
      { id: 'b', text: 'Rodar go mod init github.com/voce/api para criar o go.mod.' },
      { id: 'c', text: 'Escrever o main.go com package main e func main().' },
      { id: 'd', text: 'Testar com go run . até funcionar.' },
      { id: 'e', text: 'Gerar o executável com go build -o api.' },
    ],
    hints: [
      'Conceito: um projeto Go é um módulo, criado dentro de uma pasta.',
      'Raciocínio: o go.mod precisa existir antes de rodar ou compilar o pacote.',
      'Estrutura: pasta → go mod init → código → go run → go build.',
    ],
    solution: { explanation: 'Primeiro a pasta e o módulo (go.mod), depois o código. go run serve para testar rapidamente; go build gera o binário final.' },
  },
  {
    id: 'ex-go-01-independente',
    type: 'multiple-choice',
    title: 'O import esquecido',
    difficulty: 'iniciante',
    concepts: ['go-basico'],
    language: 'go',
    statement: 'O que acontece ao rodar `go run .` com este arquivo?',
    code: `package main

import (
    "fmt"
    "strings"
)

func main() {
    fmt.Println("pronto")
}`,
    options: [
      { id: 'a', text: 'Imprime "pronto" normalmente.', feedback: 'Em JavaScript, sim. Em Go, o compilador não aceita imports sem uso.' },
      { id: 'b', text: 'Imprime "pronto" e um aviso sobre strings.', feedback: 'Não é um aviso: é um erro de compilação, e nada é executado.' },
      { id: 'c', text: 'Não compila: "strings" imported and not used.', feedback: 'Correto: o programa nem chega a rodar.' },
      { id: 'd', text: 'Falha em tempo de execução ao chegar na linha do import.', feedback: 'Imports são verificados na compilação, antes de qualquer execução.' },
    ],
    correctOptionId: 'c',
    hints: [
      'Conceito: Go verifica muita coisa na compilação.',
      'Raciocínio: o pacote strings é usado em algum lugar?',
      'Estrutura: imports e variáveis sem uso são erros, não avisos.',
    ],
    solution: { explanation: 'O compilador recusa o programa com "strings" imported and not used. Remova o import (ou deixe o goimports remover ao salvar).' },
  },
];
