import type { Assessment, Exercise } from '../../types/content';
import { LOJA, PLATAFORMA } from './datasets';

// Questões exclusivas da avaliação final (não repetem exercícios das aulas).

const finalExam: Exercise[] = [
  {
    id: 'av-banco-1',
    type: 'multiple-choice',
    title: 'Depois do COMMIT',
    difficulty: 'basico',
    concepts: ['bd-acid', 'bd-wal'],
    statement: 'O cliente recebeu "pedido confirmado" depois do COMMIT. Um segundo depois, o servidor perdeu energia. Ao reiniciar, o pedido está lá. Qual garantia, e qual mecanismo, explicam isso?',
    options: [
      { id: 'a', text: 'Atomicidade, graças aos índices.', feedback: 'Atomicidade trata de transações incompletas; esta foi confirmada. E índices não guardam alterações.' },
      { id: 'b', text: 'Durabilidade, graças ao WAL gravado em disco antes da confirmação.', feedback: 'Correto: o COMMIT só responde depois de o WAL chegar ao disco, e a recuperação o reaplica.' },
      { id: 'c', text: 'Isolamento, graças ao MVCC.', feedback: 'O MVCC trata de transações simultâneas, não de quedas.' },
      { id: 'd', text: 'Consistência, graças às constraints.', feedback: 'Constraints garantem regras, não a sobrevivência dos dados a uma queda.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: o D de ACID.', 'Raciocínio: o que é gravado em disco antes do "ok" do COMMIT?', 'Estrutura: write-ahead log.'],
    solution: { explanation: 'Durabilidade: o COMMIT só é confirmado depois de o WAL ser forçado ao disco. Na reinicialização, o banco reaplica o WAL desde o último checkpoint.' },
  },
  {
    id: 'av-banco-2',
    type: 'sql',
    task: 'write-query',
    title: 'Valor em estoque por categoria',
    difficulty: 'intermediario',
    concepts: ['bd-agregacao', 'bd-select', 'bd-ordenacao'],
    statement: 'Calcule o valor parado em estoque (preço × estoque) de cada categoria, considerando só os produtos **ativos**, do maior valor para o menor.',
    requirements: ['Colunas: `categoria`, `valor_estoque`.', 'Ordenado do maior para o menor valor.'],
    setup: LOJA,
    starterCode: `SELECT categoria
FROM produtos;`,
    tests: [
      {
        name: 'Valor por categoria',
        ordered: true,
        expected: { columns: ['categoria', 'valor_estoque'], rows: [['Mercearia', '2247.50'], ['Utensílios', '1906.80'], ['Padaria', '747.00']] },
      },
      {
        name: 'Com outro produto ativo',
        setup: "INSERT INTO produtos VALUES (9, 'Broa de milho', 'Padaria', 15.00, 100, true);",
        ordered: true,
        expected: { rows: [['Mercearia', '2247.50'], ['Padaria', '2247.00'], ['Utensílios', '1906.80']] },
        hidden: true,
      },
    ],
    hints: ['Conceito: sum de uma expressão, agrupado.', 'Raciocínio: filtre os ativos no WHERE antes de agrupar.', 'Estrutura: SELECT categoria, sum(preco * estoque) ... WHERE ativo GROUP BY categoria ORDER BY ... DESC'],
    solution: {
      code: `SELECT categoria, sum(preco * estoque) AS valor_estoque
FROM produtos
WHERE ativo = true
GROUP BY categoria
ORDER BY valor_estoque DESC;`,
      explanation: 'O WHERE elimina os inativos, o GROUP BY monta uma linha por categoria e sum(preco * estoque) soma o valor de cada produto do grupo.',
    },
  },
  {
    id: 'av-banco-3',
    type: 'multiple-choice',
    title: 'Contando com NULL',
    difficulty: 'basico',
    concepts: ['bd-null', 'bd-agregacao'],
    language: 'sql',
    statement: 'Na tabela `clientes`, há 5 clientes e 2 deles estão sem e-mail (NULL). O que a consulta devolve?',
    code: 'SELECT count(*) AS todos, count(email) AS com_email FROM clientes;',
    options: [
      { id: 'a', text: 'todos = 5, com_email = 5', feedback: 'count(coluna) ignora os NULL.' },
      { id: 'b', text: 'todos = 5, com_email = 3', feedback: 'Correto: count(*) conta linhas; count(email), só os valores não nulos.' },
      { id: 'c', text: 'todos = 3, com_email = 3', feedback: 'count(*) conta todas as linhas, inclusive as com colunas nulas.' },
      { id: 'd', text: 'Erro: count não aceita colunas com NULL.', feedback: 'count aceita; ele apenas ignora os NULL.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: agregações ignoram NULL.', 'Raciocínio: count(*) conta o quê?', 'Estrutura: 5 linhas, 3 e-mails preenchidos.'],
    solution: { explanation: 'count(*) conta as 5 linhas. count(email) ignora os 2 NULL e devolve 3.' },
  },
  {
    id: 'av-banco-4',
    type: 'sql',
    task: 'write-query',
    title: 'Todos os projetos, inclusive os vazios',
    difficulty: 'intermediario',
    concepts: ['bd-left-join', 'bd-agregacao'],
    statement: 'Liste **todos** os projetos com a quantidade de tarefas de cada um. Projetos sem tarefas devem aparecer com **0**.',
    requirements: ['Colunas: `projeto`, `tarefas`.'],
    setup: PLATAFORMA,
    starterCode: `SELECT p.nome AS projeto, count(*) AS tarefas
FROM projetos p
JOIN tarefas t ON t.projeto_id = p.id
GROUP BY p.nome;`,
    tests: [
      {
        name: 'Todos os projetos',
        expected: { columns: ['projeto', 'tarefas'], rows: [['Site institucional', 3], ['App de entregas', 3], ['Migração do banco', 2], ['Pesquisa de UX', 0]] },
      },
      {
        name: 'Com outro projeto vazio',
        setup: "INSERT INTO projetos VALUES (5, 'Treinamento', 2);",
        expected: { rows: [['Site institucional', 3], ['App de entregas', 3], ['Migração do banco', 2], ['Pesquisa de UX', 0], ['Treinamento', 0]] },
        hidden: true,
      },
    ],
    hints: ['Conceito: LEFT JOIN mantém os projetos sem par.', 'Raciocínio: count(*) contaria a linha do projeto vazio como 1. Conte uma coluna da tabela da direita.', 'Estrutura: LEFT JOIN ... count(t.id)'],
    solution: {
      code: `SELECT p.nome AS projeto, count(t.id) AS tarefas
FROM projetos p
LEFT JOIN tarefas t ON t.projeto_id = p.id
GROUP BY p.nome;`,
      explanation: 'Com LEFT JOIN, o projeto sem tarefas aparece uma vez, com t.id NULL. count(t.id) ignora o NULL e dá 0; count(*) daria 1.',
    },
  },
  {
    id: 'av-banco-5',
    type: 'multiple-choice',
    title: 'O índice certo',
    difficulty: 'intermediario',
    concepts: ['bd-indices', 'bd-explain'],
    statement:
      'O EXPLAIN de `SELECT * FROM tarefas WHERE projeto_id = 12 ORDER BY criada_em DESC LIMIT 20` mostra um Seq Scan em 2 milhões de linhas. Qual índice resolve melhor?',
    options: [
      { id: 'a', text: '`CREATE INDEX ON tarefas (criada_em);`', feedback: 'Ajuda a ordenar, mas o banco ainda percorreria tarefas de todos os projetos até achar 20 do projeto 12.' },
      { id: 'b', text: '`CREATE INDEX ON tarefas (projeto_id, criada_em);`', feedback: 'Correto: encontra o projeto 12 e já entrega as tarefas dele ordenadas por data.' },
      { id: 'c', text: '`CREATE INDEX ON tarefas (criada_em, projeto_id);`', feedback: 'A primeira coluna deve ser a do filtro de igualdade.' },
      { id: 'd', text: 'Nenhum: com LIMIT 20 o banco já lê só 20 linhas.', feedback: 'Sem índice, o banco precisa filtrar e ordenar tudo antes de aplicar o LIMIT.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: índices compostos são usados da esquerda para a direita.', 'Raciocínio: filtro de igualdade primeiro, ordenação depois.', 'Estrutura: (coluna do WHERE, coluna do ORDER BY).'],
    solution: { explanation: 'O índice (projeto_id, criada_em) está ordenado por projeto e, dentro dele, por data: o banco lê as 20 primeiras entradas do projeto 12 de trás para a frente e para.' },
  },
  {
    id: 'av-banco-6',
    type: 'true-false',
    title: 'CHECK e NULL',
    difficulty: 'basico',
    concepts: ['bd-constraints', 'bd-null'],
    language: 'sql',
    statement: 'Avalie a afirmação sobre a coluna abaixo.',
    code: 'preco numeric(10,2) CHECK (preco > 0)',
    claim: 'Um INSERT com preco NULL é recusado pelo CHECK.',
    answer: false,
    justifications: [
      { id: 'a', text: 'Com NULL, a expressão do CHECK fica desconhecida, e o CHECK só recusa quando ela é false. Para recusar NULL, é preciso NOT NULL.' },
      { id: 'b', text: 'NULL é tratado como 0, e 0 > 0 é falso.' },
      { id: 'c', text: 'O CHECK só é avaliado em UPDATE.' },
      { id: 'd', text: 'numeric não aceita NULL.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: comparações com NULL resultam em NULL.', 'Raciocínio: o CHECK recusa quando a expressão é true, false ou NULL?', 'Estrutura: obrigatoriedade é NOT NULL.'],
    solution: { explanation: 'Falso: NULL > 0 é desconhecido, e o CHECK deixa passar. A regra completa é `preco numeric(10,2) NOT NULL CHECK (preco > 0)`.' },
  },
  {
    id: 'av-banco-7',
    type: 'sql',
    task: 'modify-data',
    title: 'Encerrar a migração',
    difficulty: 'intermediario',
    concepts: ['bd-dml', 'bd-subconsultas'],
    statement: 'Marque como `concluída` todas as tarefas do projeto chamado **Migração do banco**. Identifique o projeto pelo **nome**, não pelo id.',
    setup: PLATAFORMA,
    starterCode: `UPDATE tarefas
SET status = 'concluída';`,
    tests: [
      {
        name: 'Status das tarefas',
        query: 'SELECT id, status FROM tarefas ORDER BY id',
        ordered: true,
        expected: {
          columns: ['id', 'status'],
          rows: [
            [1, 'concluída'],
            [2, 'em andamento'],
            [3, 'a fazer'],
            [4, 'concluída'],
            [5, 'em andamento'],
            [6, 'a fazer'],
            [7, 'concluída'],
            [8, 'concluída'],
          ],
        },
      },
      {
        name: 'Quando o projeto com esse nome é outro',
        setup: `UPDATE projetos SET nome = 'Migração antiga' WHERE id = 3;
INSERT INTO projetos VALUES (5, 'Migração do banco', 2);
INSERT INTO tarefas VALUES (9, 5, 2, 'Ajustar índices', 'a fazer', 1, 2.0, '2026-03-12');`,
        query: "SELECT id, status FROM tarefas WHERE id IN (7, 8, 9) ORDER BY id",
        ordered: true,
        expected: { rows: [[7, 'concluída'], [8, 'em andamento'], [9, 'concluída']] },
        hidden: true,
      },
    ],
    hints: ['Conceito: o UPDATE precisa de um WHERE que encontre as tarefas do projeto.', 'Raciocínio: o id do projeto vem de uma subconsulta pelo nome.', "Estrutura: WHERE projeto_id = (SELECT id FROM projetos WHERE nome = 'Migração do banco')"],
    solution: {
      code: `UPDATE tarefas
SET status = 'concluída'
WHERE projeto_id = (SELECT id FROM projetos WHERE nome = 'Migração do banco');`,
      explanation: 'A subconsulta encontra o id do projeto pelo nome, e o UPDATE altera só as tarefas dele. Escrever `projeto_id = 3` funcionaria hoje, mas quebraria se os ids mudassem — o teste oculto faz exatamente isso.',
    },
  },
  {
    id: 'av-banco-8',
    type: 'multiple-choice',
    title: 'Plano de recuperação',
    difficulty: 'intermediario',
    concepts: ['pg-backup'],
    statement: 'Uma VPS roda o PostgreSQL de uma loja com uma réplica no mesmo provedor. Qual plano protege contra "alguém rodou DELETE sem WHERE"?',
    options: [
      { id: 'a', text: 'A réplica já é suficiente.', feedback: 'A réplica aplica o DELETE em segundos.' },
      { id: 'b', text: 'pg_dump diário na própria VPS.', feedback: 'Ajuda contra o DELETE, mas some junto se a VPS for perdida.' },
      {
        id: 'c',
        text: 'pg_dump diário (ou backup físico com WAL) enviado para fora do servidor, com retenção e testes periódicos de restauração.',
        feedback: 'Correto: cópias independentes, fora da VPS e comprovadamente restauráveis.',
      },
      { id: 'd', text: 'Ligar fsync = off para gravar mais rápido.', feedback: 'Isso aumenta o risco de corrupção e não ajuda em nada contra o DELETE.' },
    ],
    correctOptionId: 'c',
    hints: ['Conceito: réplica não é backup.', 'Raciocínio: a cópia precisa sobreviver ao erro humano e à perda do servidor.', 'Estrutura: regra 3-2-1 e teste de restauração.'],
    solution: { explanation: 'Só um backup independente, fora do servidor e testado, protege contra erro humano e perda da VPS. Com arquivamento de WAL, dá até para voltar ao minuto anterior ao DELETE.' },
  },
];

export const bancoAssessmentExercises: Exercise[] = finalExam;

export const bancoAssessments: Assessment[] = [
  {
    id: 'banco-final',
    kind: 'final',
    title: 'Avaliação final: Banco de dados e PostgreSQL',
    description: 'Oito questões que combinam a trilha inteira, incluindo três consultas SQL corrigidas em um PostgreSQL real.',
    trackId: 'sql',
    passingScore: 0.7,
    exerciseIds: finalExam.map((e) => e.id),
  },
];
