import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-08',
  trackId: 'golang',
  moduleId: 'golang-m3',
  title: 'Erros como valores',
  durationMin: 30,
  objectives: [
    'Tratar erros com o padrão if err != nil.',
    'Criar erros com errors.New e fmt.Errorf.',
    'Encadear contexto com %w e inspecionar com errors.Is e errors.As.',
    'Definir erros sentinela e tipos de erro próprios.',
  ],
  prerequisites: ['go-07'],
  concepts: ['go-erros'],
  explanation: [
    {
      type: 'p',
      text: 'Go não tem exceções. Uma função que pode falhar devolve um valor do tipo `error` (uma interface com o método `Error() string`), e quem chama decide o que fazer. Isso deixa explícito, em cada linha, o que pode dar errado.',
    },
    {
      type: 'code',
      language: 'go',
      code: `cfg, err := lerConfig("app.yaml")
if err != nil {
    return fmt.Errorf("iniciar servidor: %w", err)
}`,
    },
    { type: 'h', text: 'Criando e encadeando erros' },
    {
      type: 'list',
      items: [
        '`errors.New("mensagem")`: um erro simples.',
        '`fmt.Errorf("buscar pedido %d: %w", id, err)`: acrescenta **contexto** e **embrulha** o erro original com `%w`. A mensagem final conta a história: "iniciar servidor: ler config: open app.yaml: no such file or directory".',
        'Mensagens de erro em minúsculas e sem ponto final, porque costumam ser encadeadas.',
      ],
    },
    { type: 'h', text: 'Inspecionando erros' },
    {
      type: 'list',
      items: [
        '**Sentinela**: `var ErrNaoEncontrado = errors.New("não encontrado")`. Teste com `errors.Is(err, ErrNaoEncontrado)`, que procura em toda a cadeia de erros embrulhados — `==` só compara o erro de fora.',
        '**Tipo próprio**: uma struct com método Error(), que carrega dados (ex.: qual campo é inválido). Extraia com `errors.As(err, &alvo)`.',
        'Na API, essa distinção vira status HTTP: não encontrado → 404, validação → 400, o resto → 500.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Trate ou devolva, uma vez',
      text: 'Ou você resolve o erro ali (usa um padrão, tenta de novo, responde ao usuário), ou o devolve com contexto. Registrar no log **e** devolver faz o mesmo erro aparecer várias vezes no log.',
    },
  ],
  analogy:
    'Um erro em Go é como uma nota de devolução de encomenda que cada setor carimba antes de repassar: "transportadora: endereço não encontrado" vira "expedição: transportadora: endereço não encontrado". No fim, quem lê sabe o que aconteceu e em que caminho — e ainda consegue achar o carimbo original (errors.Is).',
  example: {
    language: 'go',
    code: `package main

import (
    "errors"
    "fmt"
)

var ErrNaoEncontrado = errors.New("não encontrado")

type ErroValidacao struct{ Campo string }

func (e *ErroValidacao) Error() string { return "campo inválido: " + e.Campo }

func buscarUsuario(id int) (string, error) {
    if id <= 0 {
        return "", &ErroValidacao{Campo: "id"}
    }
    if id != 1 {
        return "", fmt.Errorf("buscar usuário %d: %w", id, ErrNaoEncontrado)
    }
    return "Ana", nil
}

func main() {
    for _, id := range []int{1, 7, -1} {
        nome, err := buscarUsuario(id)
        var ev *ErroValidacao
        switch {
        case err == nil:
            fmt.Println("encontrado:", nome)
        case errors.Is(err, ErrNaoEncontrado):
            fmt.Println("404 →", err)
        case errors.As(err, &ev):
            fmt.Println("400 →", ev.Campo)
        }
    }
}`,
    lineByLine: [
      { line: 8, text: 'Erro sentinela: um valor fixo que pode ser comparado.' },
      { line: 10, text: 'Tipo de erro próprio, com um campo de dados.' },
      { line: 19, text: '%w embrulha o sentinela, acrescentando o id ao contexto.' },
      { line: 31, text: 'errors.Is encontra o sentinela mesmo embrulhado.' },
      { line: 33, text: 'errors.As extrai o *ErroValidacao para ler o campo.' },
    ],
    output: `encontrado: Ana
404 → buscar usuário 7: não encontrado
400 → id`,
  },
  commonErrors: [
    {
      title: 'Comparar erro embrulhado com ==',
      wrong: 'if err == ErrNaoEncontrado { ... }',
      why: 'Se alguém fez fmt.Errorf("...: %w", ErrNaoEncontrado), o erro de fora é outro valor e a comparação falha.',
      fix: '`if errors.Is(err, ErrNaoEncontrado) { ... }`',
    },
    {
      title: 'Embrulhar com %v',
      wrong: 'return fmt.Errorf("salvar: %v", err)',
      why: '%v só copia o texto; a cadeia se perde e errors.Is deixa de funcionar.',
      fix: 'Use %w para embrulhar.',
    },
    {
      title: 'Ignorar o erro',
      wrong: 'dados, _ := os.ReadFile("config.json")',
      why: 'Se o arquivo não existir, o programa segue com dados vazios e falha mais adiante, longe da causa.',
      fix: 'Verifique e devolva com contexto.',
    },
  ],
  guidedExerciseId: 'ex-go-08-guiado',
  independentExerciseId: 'ex-go-08-independente',
  reviewQuestions: [
    { question: 'O que é a interface error?', answer: 'Uma interface com o método Error() string. Qualquer tipo com esse método é um erro.' },
    { question: 'Qual a diferença entre %w e %v no fmt.Errorf?', answer: '%w embrulha o erro original, preservando a cadeia para errors.Is/As; %v só copia o texto.' },
    { question: 'Quando usar errors.As?', answer: 'Para extrair um tipo de erro específico da cadeia e ler seus dados.' },
  ],
  summary: [
    'Erros são valores: devolva-os e verifique com if err != nil.',
    'fmt.Errorf com %w acrescenta contexto sem perder o original.',
    'errors.Is para sentinelas; errors.As para tipos de erro.',
    'Trate ou devolva — uma vez só.',
  ],
  completionCriteria: ['Completar o tratamento de erro com contexto (exercício guiado).', 'Prever o efeito de == com erros embrulhados (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-08-guiado',
    type: 'fill-blanks',
    title: 'Contexto no erro',
    difficulty: 'basico',
    concepts: ['go-erros'],
    language: 'go',
    statement: 'Complete o tratamento: se a leitura falhar, devolva o erro com o contexto "ler config", **preservando** o erro original.',
    template: `func carregar() (Config, error) {
    dados, err := os.ReadFile("config.json")
    if err [[0]] nil {
        return Config{}, fmt.Errorf("ler config: [[1]]", err)
    }
    return parse(dados)
}`,
    blanks: [
      { accept: ['!='], width: 3 },
      { accept: ['%w'], width: 3 },
    ],
    hints: [
      'Conceito: o erro existe quando é diferente de nil.',
      'Raciocínio: qual verbo do fmt.Errorf embrulha o erro em vez de só copiar o texto?',
      'Estrutura: `if err != nil` e `%w`.',
    ],
    solution: {
      code: `if err != nil {
    return Config{}, fmt.Errorf("ler config: %w", err)
}`,
      explanation: '`err != nil` detecta a falha. `%w` embrulha o erro: a mensagem ganha contexto e quem chama ainda pode usar errors.Is, por exemplo com os.ErrNotExist.',
    },
  },
  {
    id: 'ex-go-08-independente',
    type: 'multiple-choice',
    title: 'O 404 que virou 500',
    difficulty: 'intermediario',
    concepts: ['go-erros'],
    language: 'go',
    statement: 'A API deveria responder 404, mas responde 500. O que o programa imprime e por quê?',
    code: `package main

import (
    "errors"
    "fmt"
)

var ErrNaoEncontrado = errors.New("não encontrado")

func buscar(id int) error {
    return fmt.Errorf("buscar pedido %d: %w", id, ErrNaoEncontrado)
}

func main() {
    err := buscar(9)
    if err == ErrNaoEncontrado {
        fmt.Println(404)
    } else {
        fmt.Println(500)
    }
    fmt.Println(errors.Is(err, ErrNaoEncontrado))
}`,
    options: [
      { id: 'a', text: '404 e true', feedback: 'O == compara o erro de fora, que é outro valor.' },
      { id: 'b', text: '500 e true', feedback: 'Correto: o erro embrulhado não é igual ao sentinela, mas errors.Is o encontra na cadeia.' },
      { id: 'c', text: '500 e false', feedback: 'Com %w, errors.Is percorre a cadeia e encontra o sentinela.' },
      { id: 'd', text: 'Não compila: não se compara error com ==.', feedback: 'Compila; o problema é de lógica.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: fmt.Errorf com %w cria um erro novo que embrulha o original.', 'Raciocínio: o erro novo é o mesmo valor que ErrNaoEncontrado?', 'Estrutura: para cadeias, use errors.Is.'],
    solution: { explanation: '`err` é um erro novo que contém ErrNaoEncontrado. `==` compara só o de fora (500); errors.Is percorre a cadeia (true). A correção é `if errors.Is(err, ErrNaoEncontrado)`.' },
  },
];
