import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-13',
  trackId: 'golang',
  moduleId: 'golang-m5',
  title: 'Uma API HTTP com net/http e JSON',
  durationMin: 35,
  objectives: [
    'Criar rotas com http.ServeMux, incluindo método e parâmetros de caminho.',
    'Ler e escrever JSON com encoding/json e tags de struct.',
    'Responder com os códigos de status corretos.',
    'Testar handlers sem subir um servidor com httptest.',
  ],
  prerequisites: ['go-12'],
  concepts: ['go-http'],
  explanation: [
    {
      type: 'p',
      text: 'A biblioteca padrão de Go já tem um servidor HTTP de produção. Desde o Go 1.22, o roteador (`http.ServeMux`) entende **método** e **parâmetros de caminho**, então muitas APIs nem precisam de framework.',
    },
    {
      type: 'code',
      language: 'go',
      code: `mux := http.NewServeMux()
mux.HandleFunc("GET /tarefas", listar)
mux.HandleFunc("GET /tarefas/{id}", buscar)   // r.PathValue("id")
mux.HandleFunc("POST /tarefas", criar)

log.Fatal(http.ListenAndServe(":8080", mux))`,
    },
    {
      type: 'list',
      items: [
        'Um **handler** recebe `w http.ResponseWriter` (onde escrever a resposta) e `r *http.Request` (a requisição).',
        '`r.PathValue("id")` lê o `{id}` da rota (é texto: converta com strconv.Atoi). `r.URL.Query().Get("pagina")` lê a query string.',
        '`w.WriteHeader(http.StatusCreated)` define o status; ele precisa vir **antes** de escrever o corpo.',
        '`http.Error(w, "mensagem", http.StatusBadRequest)` responde um erro em texto.',
        'Rota com método errado recebe 405 automaticamente; rota inexistente, 404.',
      ],
    },
    { type: 'h', text: 'JSON' },
    {
      type: 'p',
      text: '`json.NewEncoder(w).Encode(v)` escreve v como JSON; `json.NewDecoder(r.Body).Decode(&v)` lê o corpo para dentro de v. As **tags** de struct definem o nome de cada campo no JSON: `` Titulo string `json:"titulo"` ``. Só campos exportados (maiúscula) entram no JSON.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Cada requisição roda em uma goroutine',
      text: 'O servidor atende requisições em paralelo. Dados compartilhados em memória (como o slice do exemplo) precisam de Mutex — ou, melhor, ficam no banco de dados (próxima aula).',
    },
  ],
  analogy:
    'O ServeMux é a recepção de um prédio: olha o método e o endereço de quem chegou ("POST /tarefas") e encaminha para a sala certa (o handler). Cada sala lê o pedido, faz o trabalho e devolve uma resposta com um carimbo de status: 201 criado, 400 pedido errado, 404 não existe.',
  example: {
    language: 'go',
    code: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "net/http/httptest"
    "strings"
)

type Tarefa struct {
    ID     int    \`json:"id"\`
    Titulo string \`json:"titulo"\`
}

var tarefas = []Tarefa{{ID: 1, Titulo: "Criar layout"}}

func listar(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(tarefas)
}

func criar(w http.ResponseWriter, r *http.Request) {
    var nova Tarefa
    if err := json.NewDecoder(r.Body).Decode(&nova); err != nil || nova.Titulo == "" {
        http.Error(w, "título obrigatório", http.StatusBadRequest)
        return
    }
    nova.ID = len(tarefas) + 1
    tarefas = append(tarefas, nova)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(nova)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /tarefas", listar)
    mux.HandleFunc("POST /tarefas", criar)
    // Em produção: http.ListenAndServe(":8080", mux)

    requisicoes := []*http.Request{
        httptest.NewRequest("POST", "/tarefas", strings.NewReader(\`{"titulo":"Escrever testes"}\`)),
        httptest.NewRequest("POST", "/tarefas", strings.NewReader(\`{}\`)),
        httptest.NewRequest("GET", "/tarefas", nil),
        httptest.NewRequest("DELETE", "/tarefas", nil),
    }
    for _, req := range requisicoes {
        rec := httptest.NewRecorder()
        mux.ServeHTTP(rec, req)
        fmt.Printf("%s %s → %d %s", req.Method, req.URL.Path, rec.Code, rec.Body.String())
    }
}`,
    lineByLine: [
      { line: 12, text: 'As tags definem os nomes dos campos no JSON (id e titulo, em minúsculas).' },
      { line: 25, text: 'Lê o corpo da requisição para dentro de nova; JSON inválido ou sem título vira 400.' },
      { line: 32, text: 'O status 201 precisa ser escrito antes do corpo.' },
      { line: 38, text: 'Rotas com método: "GET /tarefas" e "POST /tarefas".' },
      { line: 49, text: 'httptest simula requisições sem abrir uma porta de rede: é assim que se testam handlers.' },
    ],
    output: `POST /tarefas → 201 {"id":2,"titulo":"Escrever testes"}
POST /tarefas → 400 título obrigatório
GET /tarefas → 200 [{"id":1,"titulo":"Criar layout"},{"id":2,"titulo":"Escrever testes"}]
DELETE /tarefas → 405 Method Not Allowed`,
  },
  commonErrors: [
    {
      title: 'Status depois do corpo',
      wrong: 'json.NewEncoder(w).Encode(nova)\nw.WriteHeader(http.StatusCreated)',
      why: 'Ao escrever o corpo, o status 200 já é enviado; o WriteHeader posterior é ignorado (com um aviso no log).',
      fix: 'Cabeçalhos e WriteHeader primeiro, corpo depois.',
    },
    {
      title: 'Esquecer o return depois do erro',
      wrong: 'if nova.Titulo == "" {\n    http.Error(w, "título obrigatório", 400)\n}\ntarefas = append(tarefas, nova)',
      why: 'O handler responde 400 e continua: a tarefa inválida é gravada mesmo assim.',
      fix: 'Sempre `return` logo após responder um erro.',
    },
    {
      title: 'Campos minúsculos sumindo do JSON',
      wrong: 'type Tarefa struct {\n    titulo string\n}',
      why: 'Campos não exportados são ignorados pelo encoding/json.',
      fix: 'Campo exportado com tag: `` Titulo string `json:"titulo"` ``.',
    },
  ],
  guidedExerciseId: 'ex-go-13-guiado',
  independentExerciseId: 'ex-go-13-independente',
  reviewQuestions: [
    { question: 'Como ler o parâmetro {id} de uma rota "GET /tarefas/{id}"?', answer: 'Com `r.PathValue("id")`, que devolve uma string a ser convertida.' },
    { question: 'Para que servem as tags `json:"..."`?', answer: 'Para definir o nome de cada campo no JSON (e opções como omitempty).' },
    { question: 'Como testar um handler sem subir o servidor?', answer: 'Com httptest.NewRequest e httptest.NewRecorder, chamando mux.ServeHTTP(rec, req).' },
  ],
  summary: [
    'ServeMux com "MÉTODO /caminho/{parametro}" desde o Go 1.22.',
    'Handlers recebem ResponseWriter e *Request.',
    'encoding/json com tags; só campos exportados.',
    'Status antes do corpo, return após erros, httptest nos testes.',
  ],
  completionCriteria: ['Escolher os códigos de status de uma API (exercício guiado).', 'Completar a rota de busca por id (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-13-guiado',
    type: 'multiple-choice',
    title: 'Qual status devolver?',
    difficulty: 'basico',
    concepts: ['go-http'],
    statement: 'Na API de tarefas, `POST /tarefas` recebe um JSON sem o campo obrigatório `titulo`. Qual resposta é a correta?',
    options: [
      { id: 'a', text: '200 OK com `{"erro": "título obrigatório"}`', feedback: '200 diz que deu certo; clientes e monitoramento tratariam a falha como sucesso.' },
      { id: 'b', text: '400 Bad Request, com a mensagem explicando o campo faltante.', feedback: 'Correto: o problema está na requisição do cliente.' },
      { id: 'c', text: '404 Not Found', feedback: 'A rota existe; o problema são os dados enviados.' },
      { id: 'd', text: '500 Internal Server Error', feedback: '500 indica falha do servidor, não um erro de quem enviou os dados.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: 4xx são erros do cliente, 5xx do servidor.', 'Raciocínio: quem errou — quem enviou ou quem processou?', 'Estrutura: requisição malformada ou inválida.'],
    solution: { explanation: '400 indica que a requisição é inválida e pode ser corrigida pelo cliente. Em Go: `http.Error(w, "título obrigatório", http.StatusBadRequest)` seguido de return.' },
  },
  {
    id: 'ex-go-13-independente',
    type: 'fill-blanks',
    title: 'Buscar tarefa por id',
    difficulty: 'intermediario',
    concepts: ['go-http'],
    language: 'go',
    statement: 'Complete a rota e o handler que busca uma tarefa pelo id do caminho e responde 404 quando ela não existe.',
    template: `mux.HandleFunc("[[0]] /tarefas/{id}", buscar)

func buscar(w http.ResponseWriter, r *http.Request) {
    id, err := strconv.Atoi(r.[[1]]("id"))
    if err != nil {
        http.Error(w, "id inválido", http.StatusBadRequest)
        return
    }
    t, ok := encontrar(id)
    if !ok {
        http.Error(w, "tarefa não encontrada", http.[[2]])
        return
    }
    json.NewEncoder(w).Encode(t)
}`,
    blanks: [
      { accept: ['GET'], caseSensitive: true, width: 4 },
      { accept: ['PathValue'], caseSensitive: true, width: 10 },
      { accept: ['StatusNotFound'], caseSensitive: true, width: 15 },
    ],
    hints: [
      'Conceito: o padrão da rota começa pelo método; o parâmetro é lido pelo nome.',
      'Raciocínio: buscar é uma leitura. O método do Request que lê {id} se chama "valor do caminho". A constante de 404 segue o padrão StatusXxx.',
      'Estrutura: GET, PathValue e StatusNotFound.',
    ],
    solution: {
      code: `mux.HandleFunc("GET /tarefas/{id}", buscar)
// ...
id, err := strconv.Atoi(r.PathValue("id"))
// ...
http.Error(w, "tarefa não encontrada", http.StatusNotFound)`,
      explanation: 'Leituras usam GET. PathValue devolve o texto do {id}, convertido com Atoi (id não numérico → 400). Tarefa inexistente → 404 com http.StatusNotFound.',
    },
  },
];
