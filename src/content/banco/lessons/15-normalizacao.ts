import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'banco-15',
  trackId: 'sql',
  moduleId: 'sql-m4',
  title: 'Normalização: cada fato em um só lugar',
  durationMin: 30,
  objectives: [
    'Reconhecer anomalias de atualização, inserção e exclusão em tabelas mal modeladas.',
    'Aplicar a 1ª, a 2ª e a 3ª formas normais.',
    'Decidir quando repetir um dado é intencional (desnormalização).',
  ],
  prerequisites: ['banco-14'],
  concepts: ['bd-normalizacao'],
  explanation: [
    {
      type: 'p',
      text: 'Imagine os pedidos de uma loja em uma única tabela, como em uma planilha: cada linha tem o pedido, o nome e a cidade do cliente, o produto e o preço. Funciona, até aparecerem as **anomalias**:',
    },
    {
      type: 'list',
      items: [
        '**Atualização**: a cliente mudou de cidade e a informação está em 40 linhas. Esqueça uma e o banco passa a ter duas verdades.',
        '**Inserção**: não dá para cadastrar um cliente que ainda não comprou, porque toda linha precisa de um pedido.',
        '**Exclusão**: apagar o único pedido de um cliente apaga também o cliente.',
      ],
    },
    {
      type: 'p',
      text: '**Normalizar** é dividir as tabelas para que cada fato fique guardado **em um único lugar**. As formas normais são etapas desse processo:',
    },
    {
      type: 'list',
      items: [
        '**1FN**: cada célula guarda um valor só (nada de `\'11 9999-0000, 21 9888-0000\'`) e não há grupos repetidos como `telefone1`, `telefone2`. Listas viram outra tabela.',
        '**2FN**: com chave composta, toda coluna depende da chave **inteira**. Em `itens_pedido (pedido_id, produto_id, quantidade, nome_produto)`, o nome do produto depende só de `produto_id` e vai para a tabela produtos.',
        '**3FN**: nenhuma coluna depende de outra coluna que não é chave. Em `funcionarios (id, setor_id, nome_setor)`, nome_setor depende de setor_id e vai para a tabela setores.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Na prática',
      text: 'Pergunte para cada coluna: "isto descreve a entidade desta tabela, por inteiro, e nada além dela?". Se a coluna descreve outra coisa (o setor, o produto, o cliente), ela mora em outra tabela.',
    },
    { type: 'h', text: 'Desnormalização consciente' },
    {
      type: 'p',
      text: 'Às vezes repetir é o correto. O **preço do item no pedido** deve ser copiado no momento da compra: se o produto ficar mais caro amanhã, o pedido de ontem não pode mudar. Relatórios pesados também podem usar tabelas resumidas. A diferença é que a repetição é uma **decisão**, documentada, e não um acidente.',
    },
  ],
  analogy:
    'Uma agenda de contatos em que o endereço da empresa é escrito na ficha de cada funcionário: quando a empresa muda de endereço, você precisa corrigir dezenas de fichas. Normalizar é ter uma ficha da empresa e, nas fichas das pessoas, só "trabalha na empresa X".',
  example: {
    language: 'sql',
    code: `-- Normalizado: cliente, produto e pedido em tabelas próprias
CREATE TABLE clientes (id integer PRIMARY KEY, nome text NOT NULL, cidade text);
CREATE TABLE produtos (id integer PRIMARY KEY, nome text NOT NULL, preco numeric(10,2) NOT NULL);
CREATE TABLE pedidos  (id integer PRIMARY KEY, cliente_id integer NOT NULL REFERENCES clientes (id));
CREATE TABLE itens_pedido (
  pedido_id      integer REFERENCES pedidos (id),
  produto_id     integer REFERENCES produtos (id),
  quantidade     integer NOT NULL CHECK (quantidade > 0),
  preco_unitario numeric(10,2) NOT NULL,  -- cópia intencional do preço na compra
  PRIMARY KEY (pedido_id, produto_id)
);

INSERT INTO clientes VALUES (1, 'Marina', 'Salvador');
INSERT INTO produtos VALUES (1, 'Café 1kg', 89.90), (2, 'Caneca', 39.90);
INSERT INTO pedidos VALUES (10, 1);
INSERT INTO itens_pedido VALUES (10, 1, 2, 89.90), (10, 2, 1, 39.90);

UPDATE produtos SET preco = 99.90 WHERE id = 1;  -- o café ficou mais caro
UPDATE clientes SET cidade = 'Recife' WHERE id = 1;  -- uma linha, uma verdade

SELECT c.nome, c.cidade, pr.nome AS produto, i.quantidade, i.preco_unitario, pr.preco AS preco_atual
FROM itens_pedido i
JOIN pedidos p   ON p.id = i.pedido_id
JOIN clientes c  ON c.id = p.cliente_id
JOIN produtos pr ON pr.id = i.produto_id
ORDER BY pr.nome;`,
    lineByLine: [
      { line: 2, text: 'Os dados do cliente ficam só aqui.' },
      { line: 9, text: 'O preço da compra é copiado de propósito: é um fato do pedido, não do produto.' },
      { line: 18, text: 'Reajustar o produto não altera o pedido já feito.' },
      { line: 19, text: 'A mudança de cidade é feita em um único lugar e aparece em todas as consultas.' },
    ],
    output: `CREATE executado.

CREATE executado.

CREATE executado.

CREATE executado.

INSERT executado.

INSERT executado.

INSERT executado.

INSERT executado.

UPDATE executado.

UPDATE executado.

 nome   | cidade | produto  | quantidade | preco_unitario | preco_atual
--------+--------+----------+------------+----------------+-------------
 Marina | Recife | Café 1kg | 2          | 89.90          | 99.90
 Marina | Recife | Caneca   | 1          | 39.90          | 39.90
(2 linhas)`,
  },
  commonErrors: [
    {
      title: 'Lista dentro de uma coluna',
      wrong: "telefones text  -- '71 9999-0001, 71 3333-0001'",
      why: 'Viola a 1FN: não dá para validar, indexar ou buscar um telefone sem quebrar o texto.',
      fix: 'Tabela `telefones (cliente_id, numero)`, uma linha por telefone.',
    },
    {
      title: 'Copiar dados descritivos para todo lado',
      wrong: 'tarefas (id, projeto_id, nome_projeto, dono_projeto, ...)',
      why: 'nome_projeto e dono_projeto descrevem o projeto, não a tarefa (3FN). Renomear o projeto exige atualizar todas as tarefas.',
      fix: 'Guarde só projeto_id e use JOIN para ler os dados do projeto.',
    },
    {
      title: 'Normalizar o que deveria ser histórico',
      wrong: 'itens_pedido (pedido_id, produto_id, quantidade)  -- preço lido de produtos',
      why: 'Um reajuste mudaria o valor de todos os pedidos antigos.',
      fix: 'Copie o preço do momento da compra para o item do pedido.',
    },
  ],
  guidedExerciseId: 'ex-banco-15-guiado',
  independentExerciseId: 'ex-banco-15-independente',
  reviewQuestions: [
    { question: 'O que é uma anomalia de atualização?', answer: 'Quando o mesmo fato está em várias linhas e uma alteração precisa ser repetida em todas; esquecer uma deixa o banco inconsistente.' },
    { question: 'Qual forma normal é violada por `funcionarios (id, setor_id, nome_setor)`?', answer: 'A 3FN: nome_setor depende de setor_id, que não é a chave da tabela.' },
    { question: 'Dê um exemplo de repetição intencional de dado.', answer: 'O preço unitário copiado para o item do pedido no momento da compra, para preservar o histórico.' },
  ],
  summary: [
    'Dados repetidos geram anomalias de atualização, inserção e exclusão.',
    '1FN: um valor por célula. 2FN: dependência da chave inteira. 3FN: nada depende de colunas que não são chave.',
    'Cada fato em um só lugar; JOIN para juntar.',
    'Desnormalize por decisão (histórico, desempenho), nunca por acidente.',
  ],
  completionCriteria: ['Identificar a forma normal violada (exercício guiado).', 'Escolher a correção certa para um modelo com dependência transitiva (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-15-guiado',
    type: 'multiple-choice',
    title: 'Os telefones dos alunos',
    difficulty: 'basico',
    concepts: ['bd-normalizacao'],
    language: 'sql',
    statement: 'Uma escola guarda os alunos assim. Qual é o problema principal deste modelo?',
    code: `CREATE TABLE alunos (
  id        integer PRIMARY KEY,
  nome      text NOT NULL,
  telefones text   -- ex.: '71 99999-0001, 71 3333-0001'
);`,
    options: [
      { id: 'a', text: 'Viola a 1FN: uma célula guarda vários valores, que deveriam ficar em uma tabela de telefones.', feedback: 'Isso. Cada telefone deve ser uma linha em `telefones (aluno_id, numero)`.' },
      { id: 'b', text: 'Viola a 3FN, porque telefone depende do nome.', feedback: 'O problema aparece antes: a célula não é atômica, o que é a 1FN.' },
      { id: 'c', text: 'Nenhum: text aceita qualquer tamanho.', feedback: 'Caber não é o problema. Buscar "quem tem o telefone X?" exige quebrar o texto.' },
      { id: 'd', text: 'Falta NOT NULL em telefones.', feedback: 'Isso seria uma regra do negócio; não resolve a estrutura.' },
    ],
    correctOptionId: 'a',
    hints: [
      'Conceito: a 1FN exige um valor por célula.',
      'Raciocínio: quantos valores cabem na coluna telefones, do jeito que está?',
      'Estrutura: a correção é uma tabela nova com uma linha por telefone.',
    ],
    solution: {
      explanation: 'A coluna guarda uma lista dentro de um texto, violando a 1FN. A correção é `telefones (aluno_id REFERENCES alunos, numero)`, que permite validar, indexar e consultar cada número.',
    },
  },
  {
    id: 'ex-banco-15-independente',
    type: 'multiple-choice',
    title: 'O nome do setor',
    difficulty: 'intermediario',
    concepts: ['bd-normalizacao'],
    language: 'sql',
    statement:
      'A empresa renomeou o setor 3 de "Suporte" para "Atendimento", mas metade dos funcionários continua aparecendo com o nome antigo. Qual a melhor correção para o modelo?',
    code: `CREATE TABLE funcionarios (
  id         integer PRIMARY KEY,
  nome       text NOT NULL,
  setor_id   integer NOT NULL,
  nome_setor text NOT NULL
);`,
    options: [
      { id: 'a', text: 'Criar um gatilho que atualiza nome_setor em todos os funcionários quando o setor muda.', feedback: 'Trata o sintoma e mantém a repetição; o modelo continua violando a 3FN.' },
      {
        id: 'b',
        text: 'Criar a tabela setores (id, nome), transformar setor_id em chave estrangeira e remover nome_setor de funcionarios.',
        feedback: 'Correto: o nome do setor passa a existir em um só lugar, e as consultas usam JOIN.',
      },
      { id: 'c', text: 'Adicionar UNIQUE em nome_setor.', feedback: 'Vários funcionários do mesmo setor teriam o mesmo nome_setor; o UNIQUE impediria isso.' },
      { id: 'd', text: 'Trocar nome_setor para varchar(50).', feedback: 'O tipo não é o problema; a repetição é.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: na 3FN, nenhuma coluna depende de outra coluna que não é chave.',
      'Raciocínio: nome_setor depende de quem? Do funcionário ou do setor_id?',
      'Estrutura: o fato "o setor 3 se chama X" precisa de uma tabela própria.',
    ],
    solution: {
      explanation:
        'nome_setor depende de setor_id (dependência transitiva), por isso o mesmo fato se repete em cada funcionário. Com `setores (id, nome)` e `funcionarios.setor_id REFERENCES setores`, renomear é um UPDATE em uma linha.',
    },
  },
];
