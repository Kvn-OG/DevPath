import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-12',
  trackId: 'golang',
  moduleId: 'golang-m4',
  title: 'context: cancelamento e timeouts',
  durationMin: 25,
  objectives: [
    'Explicar para que serve o context.Context.',
    'Criar contextos com timeout e cancelamento.',
    'Respeitar o cancelamento em funções lentas com ctx.Done().',
    'Propagar o contexto de uma requisição HTTP até o banco de dados.',
  ],
  prerequisites: ['go-11'],
  concepts: ['go-context'],
  explanation: [
    {
      type: 'p',
      text: 'Quando um usuário fecha a página no meio de uma requisição, continuar consultando o banco é desperdício. O **context** carrega um sinal de cancelamento (e um prazo) através das chamadas: da requisição HTTP para o serviço, do serviço para o banco. Quando o sinal dispara, todo mundo para.',
    },
    {
      type: 'code',
      language: 'go',
      code: `ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel() // libera os recursos do contexto, sempre

linhas, err := db.Query(ctx, "SELECT ...") // desiste se passar de 2 s`,
    },
    {
      type: 'list',
      items: [
        '`context.Background()`: a raiz, usada em main e em testes.',
        '`context.WithTimeout(pai, d)` / `WithDeadline`: cancela sozinho quando o tempo acaba.',
        '`context.WithCancel(pai)`: devolve uma função `cancel` para cancelar manualmente.',
        'Cancelar um contexto cancela também todos os derivados dele.',
        'Em um handler HTTP, use `r.Context()`: ele é cancelado se o cliente desconectar.',
      ],
    },
    { type: 'h', text: 'Respeitando o cancelamento' },
    {
      type: 'p',
      text: 'Bibliotecas de banco e HTTP já respeitam o contexto. No seu próprio código lento, use `select` com `<-ctx.Done()` e devolva `ctx.Err()`, que é `context.Canceled` ou `context.DeadlineExceeded`.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Convenções',
      text: 'O contexto é sempre o **primeiro parâmetro** e se chama `ctx`: `func Buscar(ctx context.Context, id int)`. Não guarde contextos em structs, e sempre chame o `cancel` (com defer) — mesmo quando o timeout vai disparar sozinho.',
    },
  ],
  analogy:
    'O context é como o pedido de um cliente em uma cozinha com prazo de entrega: o garçom passa o pedido com a hora-limite para a cozinha, que passa para o confeiteiro. Se o cliente for embora, o garçom grita "cancela a mesa 5" e todos que estavam trabalhando naquele pedido param ao mesmo tempo.',
  example: {
    language: 'go',
    code: `package main

import (
    "context"
    "errors"
    "fmt"
    "time"
)

func consultaLenta(ctx context.Context) (string, error) {
    select {
    case <-time.After(3 * time.Second):
        return "dados", nil
    case <-ctx.Done():
        return "", ctx.Err()
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()

    inicio := time.Now()
    _, err := consultaLenta(ctx)
    fmt.Println("erro:", err)
    fmt.Println("timeout?", errors.Is(err, context.DeadlineExceeded))
    fmt.Println("esperou ~", time.Since(inicio).Round(time.Second))
}`,
    lineByLine: [
      { line: 10, text: 'O contexto é o primeiro parâmetro.' },
      { line: 11, text: 'Espera o que vier primeiro: o trabalho de 3 s ou o cancelamento.' },
      { line: 14, text: 'ctx.Done() é um channel que fecha quando o contexto é cancelado ou o prazo vence.' },
      { line: 20, text: 'Prazo de 1 segundo; o defer cancel() libera os recursos de qualquer forma.' },
      { line: 27, text: 'Esperou 1 s, não 3: a consulta desistiu quando o prazo venceu.' },
    ],
    output: `erro: context deadline exceeded
timeout? true
esperou ~ 1s`,
  },
  commonErrors: [
    {
      title: 'Não propagar o contexto',
      wrong: 'func (h *Handler) Listar(w http.ResponseWriter, r *http.Request) {\n    rows, err := h.db.Query(context.Background(), "SELECT ...")',
      why: 'Se o cliente desistir, a consulta continua rodando no banco até o fim.',
      fix: 'Passe `r.Context()` para o banco.',
    },
    {
      title: 'Esquecer o cancel',
      wrong: 'ctx, _ := context.WithTimeout(context.Background(), time.Second)',
      why: 'O timer e os recursos do contexto só são liberados quando o prazo vence; o go vet avisa sobre isso.',
      fix: '`ctx, cancel := ...` e `defer cancel()` logo em seguida.',
    },
    {
      title: 'Ignorar ctx.Done() em laços longos',
      why: 'Um processamento de milhares de itens não percebe o cancelamento e segue até o fim.',
      fix: 'Verifique periodicamente: `if err := ctx.Err(); err != nil { return err }`.',
    },
  ],
  guidedExerciseId: 'ex-go-12-guiado',
  independentExerciseId: 'ex-go-12-independente',
  reviewQuestions: [
    { question: 'O que ctx.Err() devolve depois que o prazo de um WithTimeout vence?', answer: 'context.DeadlineExceeded.' },
    { question: 'Qual contexto usar dentro de um handler HTTP?', answer: 'r.Context(), que é cancelado quando o cliente desconecta.' },
    { question: 'Por que chamar cancel mesmo com timeout?', answer: 'Para liberar os recursos do contexto assim que a operação termina, sem esperar o prazo.' },
  ],
  summary: [
    'context carrega cancelamento e prazo pelas chamadas.',
    'WithTimeout, WithDeadline e WithCancel; sempre defer cancel().',
    'Código lento escuta ctx.Done() e devolve ctx.Err().',
    'ctx é o primeiro parâmetro; use r.Context() em handlers.',
  ],
  completionCriteria: ['Escolher o contexto certo em um handler (exercício guiado).', 'Avaliar o uso do cancel (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-12-guiado',
    type: 'multiple-choice',
    title: 'O relatório abandonado',
    difficulty: 'basico',
    concepts: ['go-context'],
    statement:
      'Um relatório leva 40 segundos para ser gerado no banco. Muitos usuários desistem e fecham a página, mas as consultas continuam rodando e sobrecarregam o banco. O que o handler deve fazer?',
    options: [
      { id: 'a', text: 'Usar context.Background() na consulta.', feedback: 'Background nunca é cancelado: é exatamente o problema atual.' },
      { id: 'b', text: 'Passar r.Context() (ou um contexto derivado dele, com timeout) para a consulta ao banco.', feedback: 'Correto: quando o cliente desconecta, o contexto é cancelado e o driver cancela a consulta no banco.' },
      { id: 'c', text: 'Rodar a consulta em uma goroutine separada.', feedback: 'A consulta continuaria rodando do mesmo jeito; só ficaria mais difícil de controlar.' },
      { id: 'd', text: 'Aumentar o timeout do servidor HTTP.', feedback: 'Isso mantém as consultas ainda mais tempo.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: o context propaga o cancelamento.', 'Raciocínio: qual contexto sabe que o cliente foi embora?', 'Estrutura: o contexto da própria requisição.'],
    solution: { explanation: 'r.Context() é cancelado quando o cliente desconecta. Passado para o driver (pgx, database/sql), ele interrompe a consulta no PostgreSQL. Um `context.WithTimeout(r.Context(), 30*time.Second)` ainda limita o tempo máximo.' },
  },
  {
    id: 'ex-go-12-independente',
    type: 'true-false',
    title: 'Para que o cancel?',
    difficulty: 'intermediario',
    concepts: ['go-context'],
    language: 'go',
    statement: 'Avalie a afirmação sobre o trecho.',
    code: `func buscar(id int) (Pedido, error) {
    ctx, _ := context.WithTimeout(context.Background(), 2*time.Second)
    return repo.Buscar(ctx, id)
}`,
    claim: 'Descartar o cancel com _ é inofensivo, porque o contexto será cancelado de qualquer jeito quando os 2 segundos passarem.',
    answer: false,
    justifications: [
      { id: 'a', text: 'Até o prazo vencer, o timer e os recursos do contexto continuam vivos mesmo depois de a busca terminar; com muitas chamadas, isso acumula. O go vet aponta esse vazamento.' },
      { id: 'b', text: 'Sem o cancel, o contexto nunca expira.' },
      { id: 'c', text: 'O cancel é necessário para o timeout funcionar.' },
      { id: 'd', text: 'É inofensivo: o coletor de lixo libera tudo imediatamente.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: cancel libera os recursos do contexto.', 'Raciocínio: se a busca termina em 5 ms, o que acontece com o timer nos 1,995 s restantes?', 'Estrutura: `ctx, cancel := ...; defer cancel()`.'],
    solution: { explanation: 'Falso. O timeout dispararia sozinho, mas até lá o contexto e seu timer ficam alocados. `defer cancel()` libera tudo assim que a função termina; o `go vet` avisa: "the cancel function is not used on all paths".' },
  },
];
