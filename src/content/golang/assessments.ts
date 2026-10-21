import type { Assessment, Exercise } from '../../types/content';

// Questões exclusivas da avaliação final (não repetem exercícios das aulas).

const finalExam: Exercise[] = [
  {
    id: 'av-go-1',
    type: 'multiple-choice',
    title: 'Valor zero',
    difficulty: 'basico',
    concepts: ['go-tipos', 'go-maps-structs'],
    language: 'go',
    statement: 'O que o programa imprime?',
    code: `package main

import "fmt"

type Pedido struct {
    Cliente string
    Total   float64
    Pago    bool
}

func main() {
    var p Pedido
    fmt.Printf("%q %v %v\\n", p.Cliente, p.Total, p.Pago)
}`,
    options: [
      { id: 'a', text: '"" 0 false', feedback: 'Correto: cada campo recebe o valor zero do seu tipo.' },
      { id: 'b', text: 'nil nil nil', feedback: 'string, float64 e bool nunca são nil.' },
      { id: 'c', text: 'Não compila: p não foi inicializada.', feedback: 'Em Go, toda variável declarada já tem um valor (o valor zero).' },
      { id: 'd', text: 'undefined 0 false', feedback: 'Go não tem undefined.' },
    ],
    correctOptionId: 'a',
    hints: ['Conceito: valores zero.', 'Raciocínio: qual o valor zero de string, float64 e bool?', 'Estrutura: %q mostra a string entre aspas.'],
    solution: { explanation: 'Uma struct declarada sem valor tem todos os campos com o valor zero: "", 0 e false.' },
  },
  {
    id: 'av-go-2',
    type: 'multiple-choice',
    title: 'Slice dentro da função',
    difficulty: 'intermediario',
    concepts: ['go-slices', 'go-ponteiros'],
    language: 'go',
    statement: 'O que o programa imprime?',
    code: `package main

import "fmt"

func dobrar(nums []int) {
    for i := range nums {
        nums[i] *= 2
    }
}

func main() {
    valores := []int{1, 2, 3}
    dobrar(valores)
    fmt.Println(valores)
}`,
    options: [
      { id: 'a', text: '[1 2 3]', feedback: 'A função recebe uma cópia do cabeçalho do slice, mas ele aponta para o mesmo array: alterar elementos altera o original.' },
      { id: 'b', text: '[2 4 6]', feedback: 'Correto: os elementos são alterados no array compartilhado.' },
      { id: 'c', text: 'Não compila: slices precisam ser passados por ponteiro.', feedback: 'Compila normalmente.' },
      { id: 'd', text: '[2 4 6 0]', feedback: 'Nenhum elemento é acrescentado.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: um slice é uma janela sobre um array.', 'Raciocínio: alterar nums[i] muda o array por baixo. E o append?', 'Estrutura: compare com o exercício do append que "sumiu".'],
    solution: { explanation: 'O slice é copiado, mas a cópia aponta para o mesmo array; alterar elementos é visível em main. Já um append dentro da função não mudaria o tamanho de valores.' },
  },
  {
    id: 'av-go-3',
    type: 'true-false',
    title: 'Interface implícita',
    difficulty: 'basico',
    concepts: ['go-interfaces'],
    language: 'go',
    statement: 'Avalie a afirmação.',
    code: `type Armazenamento interface {
    Salvar(chave string, dados []byte) error
}

type Disco struct{ Pasta string }

func (d Disco) Salvar(chave string, dados []byte) error {
    return os.WriteFile(filepath.Join(d.Pasta, chave), dados, 0o644)
}`,
    claim: 'Disco não satisfaz Armazenamento, porque falta declarar `implements Armazenamento`.',
    answer: false,
    justifications: [
      { id: 'a', text: 'Em Go a satisfação é implícita: basta ter o método com a mesma assinatura, e Disco tem.' },
      { id: 'b', text: 'Disco satisfaz porque é uma struct, e toda struct satisfaz qualquer interface.' },
      { id: 'c', text: 'A afirmação é verdadeira: Go exige a palavra implements.' },
      { id: 'd', text: 'Disco só satisfaria se o receptor fosse ponteiro.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: Go não tem implements.', 'Raciocínio: Disco tem o método Salvar com a mesma assinatura?', 'Estrutura: nome, parâmetros e retorno iguais.'],
    solution: { explanation: 'Falso. Disco tem `Salvar(string, []byte) error`, então satisfaz Armazenamento automaticamente — e pode ser trocado por uma implementação em memória nos testes.' },
  },
  {
    id: 'av-go-4',
    type: 'fill-blanks',
    title: 'Erro com contexto',
    difficulty: 'basico',
    concepts: ['go-erros'],
    language: 'go',
    statement: 'Complete para devolver o erro com contexto, preservando o original, e para testar se a causa foi "não encontrado".',
    template: `pedido, err := repo.Buscar(ctx, id)
if err != nil {
    return Pedido{}, fmt.Errorf("buscar pedido %d: [[0]]", id, err)
}

// no handler:
if errors.[[1]](err, ErrNaoEncontrado) {
    http.Error(w, "pedido não encontrado", http.StatusNotFound)
}`,
    blanks: [
      { accept: ['%w'], width: 3 },
      { accept: ['Is'], caseSensitive: true, width: 3 },
    ],
    hints: ['Conceito: embrulhar e inspecionar erros.', 'Raciocínio: qual verbo embrulha? Qual função procura um sentinela na cadeia?', 'Estrutura: %w e errors.Is.'],
    solution: { code: 'fmt.Errorf("buscar pedido %d: %w", id, err)\n// ...\nerrors.Is(err, ErrNaoEncontrado)', explanation: '%w preserva o erro original na cadeia, e errors.Is o encontra mesmo depois de vários embrulhos.' },
  },
  {
    id: 'av-go-5',
    type: 'multiple-choice',
    title: 'Corrida no mapa de sessões',
    difficulty: 'intermediario',
    concepts: ['go-goroutines', 'go-http'],
    statement: 'Uma API guarda as sessões em um `map[string]Sessao` global, lido e alterado pelos handlers. Sob carga, o servidor cai com "fatal error: concurrent map writes". Qual a causa e a correção?',
    options: [
      { id: 'a', text: 'O map está cheio; aumentar a capacidade com make resolve.', feedback: 'Maps crescem sozinhos; o problema é o acesso simultâneo.' },
      {
        id: 'b',
        text: 'Cada requisição roda em uma goroutine, e maps não aceitam escritas simultâneas: proteger o acesso com sync.Mutex (ou guardar as sessões no banco ou no Redis).',
        feedback: 'Correto: o Go detecta escritas concorrentes em maps e encerra o programa.',
      },
      { id: 'c', text: 'Faltou fechar o map com close.', feedback: 'close é para channels, não para maps.' },
      { id: 'd', text: 'É um bug do net/http; usar outro framework resolve.', feedback: 'Qualquer servidor concorrente teria o mesmo problema.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: o net/http atende cada requisição em uma goroutine.', 'Raciocínio: várias goroutines escrevem no mesmo map ao mesmo tempo.', 'Estrutura: Mutex em volta das leituras e escritas.'],
    solution: { explanation: 'Maps não são seguros para uso concorrente. Com um `sync.RWMutex` (Lock para escrever, RLock para ler) o acesso fica serializado; em produção com várias instâncias, as sessões ficam melhor em um armazenamento compartilhado.' },
  },
  {
    id: 'av-go-6',
    type: 'multiple-choice',
    title: 'Timeout na chamada externa',
    difficulty: 'intermediario',
    concepts: ['go-context', 'go-channels'],
    statement: 'O handler chama uma API de frete que às vezes demora 30 segundos. A resposta ao cliente não pode passar de 2 segundos. Qual a melhor abordagem?',
    options: [
      { id: 'a', text: 'time.Sleep(2 * time.Second) antes de chamar a API.', feedback: 'Só atrasa tudo em 2 segundos.' },
      { id: 'b', text: 'ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second); defer cancel(); e passar ctx para a requisição HTTP de frete.', feedback: 'Correto: a chamada é cancelada aos 2 segundos (ou se o cliente desistir antes).' },
      { id: 'c', text: 'Rodar a chamada em uma goroutine e não esperar o resultado.', feedback: 'O handler responderia sem o frete, e a goroutine continuaria presa.' },
      { id: 'd', text: 'Usar context.Background() para a chamada não ser cancelada.', feedback: 'É o oposto do que se quer.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: context com prazo.', 'Raciocínio: o prazo deve derivar da requisição do cliente.', 'Estrutura: WithTimeout(r.Context(), ...).'],
    solution: { explanation: 'Um contexto derivado de r.Context() com timeout de 2 s cancela a requisição de frete quando o prazo vence ou o cliente desconecta. Com `http.NewRequestWithContext(ctx, ...)`, o cliente HTTP respeita o cancelamento.' },
  },
  {
    id: 'av-go-7',
    type: 'multiple-choice',
    title: 'Busca por e-mail',
    difficulty: 'basico',
    concepts: ['go-postgres'],
    language: 'go',
    statement: 'Qual trecho busca o usuário pelo e-mail com segurança e trata o caso de não existir?',
    options: [
      {
        id: 'a',
        text: '`err := db.QueryRow(ctx, "SELECT id, nome FROM usuarios WHERE email = $1", email).Scan(&u.ID, &u.Nome)` e `if errors.Is(err, pgx.ErrNoRows) { /* 404 */ }`',
        feedback: 'Correto: parâmetro $1 e tratamento explícito de "nenhuma linha".',
      },
      { id: 'b', text: '`db.QueryRow(ctx, "SELECT id, nome FROM usuarios WHERE email = \'" + email + "\'").Scan(&u.ID, &u.Nome)`', feedback: 'Concatenação permite injeção de SQL, e o erro é ignorado.' },
      { id: 'c', text: '`rows, _ := db.Query(ctx, "SELECT * FROM usuarios")` e procurar o e-mail em um laço no Go.', feedback: 'Lê a tabela inteira e ignora o erro; o filtro é trabalho do banco.' },
      { id: 'd', text: '`db.Exec(ctx, "SELECT id FROM usuarios WHERE email = $1", email)`', feedback: 'Exec não devolve as linhas da consulta.' },
    ],
    correctOptionId: 'a',
    hints: ['Conceito: parâmetros e QueryRow.', 'Raciocínio: o que acontece quando o e-mail não existe?', 'Estrutura: pgx.ErrNoRows.'],
    solution: { explanation: 'QueryRow + Scan lê uma linha; com $1 o e-mail é um parâmetro. Sem resultado, Scan devolve pgx.ErrNoRows, que a API traduz em 404.' },
  },
  {
    id: 'av-go-8',
    type: 'order-steps',
    title: 'Do código à imagem',
    difficulty: 'basico',
    concepts: ['go-testes'],
    statement: 'Ordene o caminho da API em Go até uma imagem pronta para publicar.',
    steps: [
      { id: 'a', text: 'go vet ./... e go test -race ./... passam.' },
      { id: 'b', text: 'O estágio de build do Dockerfile baixa as dependências com go mod download.' },
      { id: 'c', text: 'O mesmo estágio compila com CGO_ENABLED=0 go build.' },
      { id: 'd', text: 'O estágio final copia só o binário para uma imagem mínima.' },
      { id: 'e', text: 'A imagem é publicada e configurada com DATABASE_URL e PORT no ambiente.' },
    ],
    hints: ['Conceito: verificar → compilar → empacotar → configurar.', 'Raciocínio: as dependências precisam estar baixadas antes de compilar.', 'Estrutura: testes, download, build, imagem mínima, ambiente.'],
    solution: { explanation: 'Primeiro garanta a qualidade (vet e testes). No Dockerfile, baixe as dependências (camada reaproveitada entre builds), compile um binário estático e copie-o para a imagem final. A configuração entra por variáveis de ambiente na hora de rodar.' },
  },
];

export const golangAssessmentExercises: Exercise[] = finalExam;

export const golangAssessments: Assessment[] = [
  {
    id: 'golang-final',
    kind: 'final',
    title: 'Avaliação final: Go',
    description: 'Oito questões sobre a linguagem, concorrência, erros, APIs HTTP, banco de dados e build.',
    trackId: 'golang',
    passingScore: 0.7,
    exerciseIds: finalExam.map((e) => e.id),
  },
];
