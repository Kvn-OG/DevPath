import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'banco-20',
  trackId: 'sql',
  moduleId: 'sql-m6',
  title: 'Instalando o PostgreSQL e usando o psql',
  durationMin: 30,
  objectives: [
    'Instalar o PostgreSQL no Linux, no Windows ou com Docker.',
    'Conectar com o psql usando parâmetros ou uma string de conexão.',
    'Usar os metacomandos do psql: \\l, \\c, \\dt, \\d, \\du, \\x e \\q.',
    'Executar arquivos .sql pelo terminal.',
  ],
  prerequisites: ['banco-19'],
  concepts: ['pg-psql'],
  explanation: [
    { type: 'h', text: 'Três formas de instalar' },
    {
      type: 'list',
      items: [
        '**Ubuntu/Debian** (sua máquina Linux ou a VPS): `sudo apt install postgresql`. O serviço já sobe e fica ativo ao reiniciar.',
        '**Windows/macOS**: instalador oficial em postgresql.org/download (inclui o psql e o pgAdmin), ou Homebrew no macOS.',
        '**Docker** (qualquer sistema, sem instalar nada no sistema): `docker run --name pg -e POSTGRES_PASSWORD=segredo -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres:17`. O volume `pgdata` mantém os dados se o container for recriado.',
      ],
    },
    {
      type: 'code',
      language: 'shell',
      code: `# Ubuntu: instalar e conferir o serviço
sudo apt update
sudo apt install -y postgresql
sudo systemctl status postgresql --no-pager

# Entrar como o superusuário "postgres" (autenticação pelo usuário do Linux)
sudo -u postgres psql`,
    },
    { type: 'h', text: 'Conectando' },
    {
      type: 'p',
      text: 'Uma conexão precisa de **host**, **porta** (5432 por padrão), **usuário**, **senha** e **banco**. No psql, use parâmetros (`psql -h localhost -p 5432 -U app -d loja`) ou uma **string de conexão** — o mesmo formato que as aplicações usam em `DATABASE_URL`:',
    },
    { type: 'code', language: 'shell', code: 'psql "postgresql://app:s3nh4@localhost:5432/loja"' },
    { type: 'h', text: 'Metacomandos do psql' },
    {
      type: 'list',
      items: [
        '`\\l`: lista os bancos. `\\c loja`: conecta ao banco loja.',
        '`\\dt`: lista as tabelas. `\\d produtos`: mostra colunas, tipos, índices e constraints da tabela.',
        '`\\du`: lista os roles. `\\dn`: lista os schemas.',
        '`\\x`: alterna para exibição vertical (boa para linhas largas). `\\timing`: mostra o tempo de cada comando.',
        '`\\i arquivo.sql`: executa um arquivo. `\\q`: sai. `\\?`: ajuda.',
        'Comandos SQL terminam em `;`. Sem ele, o psql espera mais linhas (o prompt muda de `=#` para `-#`).',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Scripts pelo terminal',
      text: 'Para rodar um arquivo e parar no primeiro erro: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migracao.sql`. É assim que migrações e scripts de manutenção rodam em servidores e em pipelines de deploy.',
    },
  ],
  analogy:
    'O servidor PostgreSQL é uma central telefônica que fica sempre ligada; o psql é um telefone. Para ligar, você precisa do número (host e porta), do ramal (o banco) e de um crachá (usuário e senha).',
  example: {
    language: 'shell',
    code: `psql "postgresql://postgres:segredo@localhost:5432/postgres"
CREATE DATABASE loja;
\\c loja
CREATE TABLE produtos (id integer PRIMARY KEY, nome text NOT NULL);
\\dt
\\d produtos
\\q`,
    lineByLine: [
      { line: 1, text: 'Conecta ao banco padrão `postgres` com uma string de conexão.' },
      { line: 2, text: 'Cria um banco novo. Comandos SQL terminam em `;`.' },
      { line: 3, text: 'Metacomando (começa com barra, sem `;`): troca para o banco loja. O prompt muda.' },
      { line: 5, text: 'Lista as tabelas do banco atual.' },
      { line: 6, text: 'Descreve a tabela: colunas, tipos, obrigatoriedade e o índice da PK.' },
    ],
    output: `psql (17.2)
Type "help" for help.

postgres=# CREATE DATABASE loja;
CREATE DATABASE
postgres=# \\c loja
You are now connected to database "loja" as user "postgres".
loja=# CREATE TABLE produtos (id integer PRIMARY KEY, nome text NOT NULL);
CREATE TABLE
loja=# \\dt
          List of relations
 Schema |   Name   | Type  |  Owner
--------+----------+-------+----------
 public | produtos | table | postgres
(1 row)

loja=# \\d produtos
              Table "public.produtos"
 Column |  Type   | Collation | Nullable | Default
--------+---------+-----------+----------+---------
 id     | integer |           | not null |
 nome   | text    |           | not null |
Indexes:
    "produtos_pkey" PRIMARY KEY, btree (id)

loja=# \\q`,
  },
  commonErrors: [
    {
      title: '"Peer authentication failed"',
      wrong: 'psql -U postgres',
      why: 'No Linux, por padrão, o usuário postgres só entra a partir do usuário postgres do sistema (autenticação peer).',
      fix: 'Use `sudo -u postgres psql`, ou conecte por TCP com senha: `psql -h localhost -U postgres`.',
    },
    {
      title: '"Connection refused" na porta 5432',
      why: 'O servidor não está rodando, está em outra porta ou só escuta em localhost.',
      fix: 'Confira `systemctl status postgresql` (ou `docker ps`) e o parâmetro `listen_addresses`.',
    },
    {
      title: 'O comando "não faz nada"',
      wrong: 'loja=# SELECT * FROM produtos\nloja-#',
      why: 'Faltou o `;`: o psql está esperando o fim do comando (prompt `-#`).',
      fix: 'Digite `;` e Enter. Para desistir do comando, Ctrl+C.',
    },
  ],
  guidedExerciseId: 'ex-banco-20-guiado',
  independentExerciseId: 'ex-banco-20-independente',
  reviewQuestions: [
    { question: 'Como ver as colunas e os índices de uma tabela no psql?', answer: 'Com `\\d nome_da_tabela`.' },
    { question: 'Quais informações formam uma string de conexão?', answer: 'Usuário, senha, host, porta e banco: `postgresql://usuario:senha@host:porta/banco`.' },
    { question: 'Como executar um arquivo .sql parando no primeiro erro?', answer: '`psql ... -v ON_ERROR_STOP=1 -f arquivo.sql`.' },
  ],
  summary: [
    'Instale com apt, com o instalador oficial ou com Docker (com volume).',
    'Conexão: host, porta, usuário, senha e banco — ou uma string de conexão.',
    'Metacomandos: \\l, \\c, \\dt, \\d, \\du, \\x, \\i, \\q.',
    'Comandos SQL terminam em ; e scripts rodam com -f e ON_ERROR_STOP.',
  ],
  completionCriteria: ['Escolher o metacomando certo (exercício guiado).', 'Montar a string de conexão de uma aplicação (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-20-guiado',
    type: 'multiple-choice',
    title: 'Qual a estrutura da tabela?',
    difficulty: 'iniciante',
    concepts: ['pg-psql'],
    statement: 'Você está no psql, conectado ao banco `loja`, e quer ver as colunas, os tipos e os índices da tabela `pedidos`. Qual comando usar?',
    options: [
      { id: 'a', text: '`\\dt pedidos`', feedback: '\\dt lista tabelas (nome, dono), sem as colunas.' },
      { id: 'b', text: '`\\d pedidos`', feedback: 'Correto: \\d descreve a tabela com colunas, tipos, constraints e índices.' },
      { id: 'c', text: '`\\l pedidos`', feedback: '\\l lista os bancos de dados.' },
      { id: 'd', text: '`DESCRIBE pedidos;`', feedback: 'DESCRIBE é do MySQL; o PostgreSQL não tem esse comando.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: metacomandos do psql começam com barra invertida.',
      'Raciocínio: "d" de describe; com "t" ele só lista tabelas.',
      'Estrutura: barra, a letra d e o nome da tabela.',
    ],
    solution: { explanation: '`\\d pedidos` mostra a definição completa da tabela. `\\dt` lista as tabelas e `\\l`, os bancos.' },
  },
  {
    id: 'ex-banco-20-independente',
    type: 'fill-blanks',
    title: 'A DATABASE_URL da API',
    difficulty: 'basico',
    concepts: ['pg-psql'],
    language: 'shell',
    statement:
      'A API vai se conectar ao banco `loja` no servidor `db.minhaempresa.com`, na porta padrão do PostgreSQL, com o usuário `api` e a senha `Tr0caR`. Complete a variável de ambiente.',
    template: 'DATABASE_URL="postgresql://[[0]]:[[1]]@[[2]]:[[3]]/[[4]]"',
    blanks: [
      { accept: ['api'], caseSensitive: true, width: 4 },
      { accept: ['Tr0caR'], caseSensitive: true, width: 7 },
      { accept: ['db.minhaempresa.com'], width: 20 },
      { accept: ['5432'], width: 5 },
      { accept: ['loja'], caseSensitive: true, width: 5 },
    ],
    hints: [
      'Conceito: o formato é `postgresql://usuario:senha@host:porta/banco`.',
      'Raciocínio: a porta padrão do PostgreSQL é um número de quatro dígitos que você já viu nesta aula.',
      'Estrutura: api, Tr0caR, db.minhaempresa.com, 5432, loja.',
    ],
    solution: {
      code: 'DATABASE_URL="postgresql://api:Tr0caR@db.minhaempresa.com:5432/loja"',
      explanation:
        'Usuário e senha antes do @, host e porta depois, e o banco após a barra. Essa string fica em uma variável de ambiente, nunca no código. Se a senha tiver caracteres especiais (@, :, /), eles precisam ser codificados (%40, %3A, %2F).',
    },
  },
];
