import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'go-14',
  trackId: 'golang',
  moduleId: 'golang-m5',
  title: 'PostgreSQL com pgx e SQL puro',
  durationMin: 35,
  objectives: [
    'Conectar ao PostgreSQL com um pool (pgxpool) a partir de DATABASE_URL.',
    'Executar consultas com parâmetros ($1, $2), sem concatenar strings.',
    'Ler linhas com Query/QueryRow e Scan.',
    'Usar transações e organizar migrações em arquivos SQL.',
  ],
  prerequisites: ['go-13'],
  concepts: ['go-postgres'],
  explanation: [
    {
      type: 'p',
      text: 'Tudo o que você aprendeu na Trilha 5 vale aqui: em Go é comum escrever **SQL puro**, sem ORM, e mapear o resultado para structs. O driver mais usado é o **pgx** (`go get github.com/jackc/pgx/v5`), com o pool `pgxpool`.',
    },
    {
      type: 'list',
      items: [
        '`pgxpool.New(ctx, os.Getenv("DATABASE_URL"))`: cria o pool **uma vez**, no início do programa (aula 24 da Trilha 5).',
        '`db.Query(ctx, sql, args...)`: várias linhas. Percorra com `rows.Next()` e leia com `rows.Scan(&a, &b)`; feche com `defer rows.Close()` e confira `rows.Err()` no fim.',
        '`db.QueryRow(ctx, sql, args...).Scan(&a)`: uma linha. Sem resultado, devolve `pgx.ErrNoRows` (vira 404 na API).',
        '`db.Exec(ctx, sql, args...)`: INSERT, UPDATE e DELETE sem retorno de linhas.',
        'Colunas que podem ser NULL precisam de ponteiro (`*string`) ou de tipos como `pgtype.Text` no Scan.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Parâmetros, nunca concatenação',
      text: '`fmt.Sprintf("... WHERE email = \'%s\'", email)` permite **injeção de SQL**: um e-mail como `\' OR 1=1 --` muda a consulta. Use os marcadores `$1`, `$2` e passe os valores separados — o banco os trata sempre como dados, nunca como código.',
    },
    { type: 'h', text: 'Transações' },
    {
      type: 'code',
      language: 'go',
      code: `tx, err := db.Begin(ctx)
if err != nil {
    return err
}
defer tx.Rollback(ctx) // sem efeito se o Commit já aconteceu

if _, err := tx.Exec(ctx, "UPDATE contas SET saldo = saldo - $1 WHERE id = $2", valor, origem); err != nil {
    return err
}
if _, err := tx.Exec(ctx, "UPDATE contas SET saldo = saldo + $1 WHERE id = $2", valor, destino); err != nil {
    return err
}
return tx.Commit(ctx)`,
    },
    { type: 'h', text: 'Migrações' },
    {
      type: 'p',
      text: 'A estrutura do banco evolui junto com o código. Guarde cada mudança em arquivos numerados (`0001_criar_tarefas.up.sql` e `.down.sql`) e aplique com uma ferramenta como **golang-migrate** ou **goose**, no deploy, com um role que tem permissão de alterar tabelas (aula 21 da Trilha 5).',
    },
  ],
  analogy:
    'Consultas com parâmetros são como um formulário com campos: o atendente lê "nome: Robert\'); DROP TABLE alunos;--" como um nome estranho, e não como uma ordem. Concatenar strings é deixar o cliente escrever direto na ficha de instruções do atendente.',
  example: {
    language: 'go',
    code: `package main

import (
    "context"
    "fmt"
    "log"
    "os"

    "github.com/jackc/pgx/v5/pgxpool"
)

type Tarefa struct {
    ID     int
    Titulo string
    Status string
}

func tarefasDoProjeto(ctx context.Context, db *pgxpool.Pool, projetoID int) ([]Tarefa, error) {
    rows, err := db.Query(ctx,
        "SELECT id, titulo, status FROM tarefas WHERE projeto_id = $1 ORDER BY id", projetoID)
    if err != nil {
        return nil, fmt.Errorf("consultar tarefas: %w", err)
    }
    defer rows.Close()

    var lista []Tarefa
    for rows.Next() {
        var t Tarefa
        if err := rows.Scan(&t.ID, &t.Titulo, &t.Status); err != nil {
            return nil, err
        }
        lista = append(lista, t)
    }
    return lista, rows.Err()
}

func main() {
    ctx := context.Background()
    db, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    tarefas, err := tarefasDoProjeto(ctx, db, 1)
    if err != nil {
        log.Fatal(err)
    }
    for _, t := range tarefas {
        fmt.Printf("#%d %-24s %s\\n", t.ID, t.Titulo, t.Status)
    }
}`,
    lineByLine: [
      { line: 9, text: 'Dependência externa: instale com `go get github.com/jackc/pgx/v5`.' },
      { line: 20, text: '$1 é um parâmetro: o valor de projetoID vai separado do SQL.' },
      { line: 24, text: 'Fecha o cursor quando a função terminar, mesmo com erro.' },
      { line: 29, text: 'Scan copia cada coluna para um campo, na ordem do SELECT.' },
      { line: 34, text: 'rows.Err() informa erros que aconteceram durante a leitura.' },
      { line: 39, text: 'O pool é criado uma vez, com a string de conexão da variável de ambiente.' },
    ],
    output: `#1 Criar layout da home     concluída
#2 Escrever textos da home  em andamento
#3 Configurar domínio       a fazer`,
  },
  commonErrors: [
    {
      title: 'Montar o SQL com Sprintf',
      wrong: 'sql := fmt.Sprintf("SELECT * FROM usuarios WHERE email = \'%s\'", email)',
      why: 'Injeção de SQL: a entrada do usuário vira parte do comando.',
      fix: '`db.QueryRow(ctx, "SELECT ... WHERE email = $1", email)`',
    },
    {
      title: 'Esquecer rows.Close()',
      why: 'Cada cursor aberto segura uma conexão do pool; com o tempo, o pool esgota e a API trava.',
      fix: '`defer rows.Close()` logo depois do Query bem-sucedido.',
    },
    {
      title: 'Scan de NULL em string',
      wrong: 'var cidade string\nrows.Scan(&cidade)  // a coluna pode ser NULL',
      why: 'O Scan falha ("cannot scan NULL into *string").',
      fix: 'Use `var cidade *string` (nil quando NULL) ou `COALESCE(cidade, \'\')` no SQL.',
    },
  ],
  guidedExerciseId: 'ex-go-14-guiado',
  independentExerciseId: 'ex-go-14-independente',
  reviewQuestions: [
    { question: 'Por que usar $1 em vez de montar o SQL com Sprintf?', answer: 'Porque os parâmetros são enviados separados do comando e tratados como dados, o que impede injeção de SQL.' },
    { question: 'Quando o pool deve ser criado?', answer: 'Uma vez, na inicialização do programa, e compartilhado por todos os handlers.' },
    { question: 'Por que `defer tx.Rollback(ctx)` logo após o Begin?', answer: 'Para desfazer a transação em qualquer caminho de erro; depois de um Commit bem-sucedido, o Rollback não tem efeito.' },
  ],
  summary: [
    'pgxpool.New uma vez, com DATABASE_URL.',
    'Query + Next + Scan + Close + Err; QueryRow para uma linha; Exec para escrita.',
    'Sempre parâmetros $1, $2: nada de concatenar SQL.',
    'Transações com Begin, defer Rollback e Commit; migrações em arquivos SQL.',
  ],
  completionCriteria: ['Identificar a consulta vulnerável a injeção (exercício guiado).', 'Ordenar uma transação em Go (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-go-14-guiado',
    type: 'multiple-choice',
    title: 'Login seguro',
    difficulty: 'basico',
    concepts: ['go-postgres'],
    language: 'go',
    statement: 'Qual forma de buscar o usuário pelo e-mail digitado no login é segura?',
    options: [
      { id: 'a', text: '`db.QueryRow(ctx, "SELECT id FROM usuarios WHERE email = \'" + email + "\'")`', feedback: 'Concatenação: um e-mail malicioso altera a consulta.' },
      { id: 'b', text: '`db.QueryRow(ctx, fmt.Sprintf("SELECT id FROM usuarios WHERE email = \'%s\'", email))`', feedback: 'Sprintf é concatenação disfarçada; a injeção continua possível.' },
      { id: 'c', text: '`db.QueryRow(ctx, "SELECT id FROM usuarios WHERE email = $1", email)`', feedback: 'Correto: o valor vai como parâmetro, separado do SQL.' },
      { id: 'd', text: 'Qualquer uma, desde que o e-mail seja validado no front-end.', feedback: 'Requisições podem ser feitas sem passar pelo front-end.' },
    ],
    correctOptionId: 'c',
    hints: ['Conceito: injeção de SQL acontece quando dados viram parte do comando.', 'Raciocínio: em qual opção o e-mail nunca é colado no texto do SQL?', 'Estrutura: marcadores $1, $2...'],
    solution: { explanation: 'Com $1, o PostgreSQL recebe o comando e o valor separadamente, e o valor é sempre tratado como dado. Concatenar (com + ou Sprintf) deixa a entrada do usuário reescrever a consulta.' },
  },
  {
    id: 'ex-go-14-independente',
    type: 'order-steps',
    title: 'Transferência em Go',
    difficulty: 'intermediario',
    concepts: ['go-postgres', 'go-erros'],
    statement: 'Ordene os passos de uma função Go que transfere saldo entre duas contas em uma transação.',
    steps: [
      { id: 'a', text: 'tx, err := db.Begin(ctx) e, se der erro, devolvê-lo.' },
      { id: 'b', text: 'defer tx.Rollback(ctx), para desfazer em qualquer saída com erro.' },
      { id: 'c', text: 'tx.Exec com o débito na conta de origem; se der erro, return err.' },
      { id: 'd', text: 'tx.Exec com o crédito na conta de destino; se der erro, return err.' },
      { id: 'e', text: 'return tx.Commit(ctx).' },
    ],
    hints: [
      'Conceito: a transação começa com Begin e termina com Commit ou Rollback.',
      'Raciocínio: o Rollback precisa estar agendado antes de qualquer operação que possa falhar.',
      'Estrutura: Begin → defer Rollback → débito → crédito → Commit.',
    ],
    solution: { explanation: 'O defer do Rollback logo após o Begin cobre todos os returns com erro. Se o débito ou o crédito falharem, nada é gravado; se tudo der certo, o Commit confirma, e o Rollback adiado passa a não ter efeito.' },
  },
];
