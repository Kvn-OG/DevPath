// Bancos de exemplo usados nas aulas e exercícios de SQL. Cada execução começa
// de um banco vazio e roda um destes scripts antes do código do estudante.

/** Loja de cafés: uma tabela simples para as primeiras consultas. */
export const LOJA = `CREATE TABLE produtos (
  id        integer PRIMARY KEY,
  nome      text NOT NULL,
  categoria text NOT NULL,
  preco     numeric(10,2) NOT NULL,
  estoque   integer NOT NULL,
  ativo     boolean NOT NULL DEFAULT true
);

INSERT INTO produtos (id, nome, categoria, preco, estoque, ativo) VALUES
  (1, 'Café em grãos 1kg',  'Mercearia',  89.90, 25, true),
  (2, 'Chá verde',          'Mercearia',  18.50,  0, true),
  (3, 'Caneca de cerâmica', 'Utensílios', 39.90, 12, true),
  (4, 'Moedor manual',      'Utensílios', 159.00, 4, true),
  (5, 'Filtro de papel',    'Utensílios',  9.90, 80, true),
  (6, 'Bolo de cenoura',    'Padaria',    32.00,  6, false),
  (7, 'Pão de queijo 500g', 'Padaria',    24.90, 30, true),
  (8, 'Garrafa térmica',    'Utensílios', 129.90, 0, false);`;

/** Cadastro de clientes com dados faltando, para trabalhar com NULL. */
export const CLIENTES = `CREATE TABLE clientes (
  id       integer PRIMARY KEY,
  nome     text NOT NULL,
  email    text,
  cidade   text,
  telefone text
);

INSERT INTO clientes (id, nome, email, cidade, telefone) VALUES
  (1, 'Marina Alves',   'marina@exemplo.com', 'Salvador',  '71 99999-0001'),
  (2, 'Otávio Nunes',   NULL,                 'Fortaleza', '85 99999-0002'),
  (3, 'Paula Freitas',  'paula@exemplo.com',  NULL,        NULL),
  (4, 'Rafael Torres',  'rafael@exemplo.com', 'Salvador',  NULL),
  (5, 'Sofia Mendes',   NULL,                 NULL,        '11 99999-0005');`;

/** Plataforma de gestão de projetos: usuários, projetos, tarefas e comentários. */
export const PLATAFORMA = `CREATE TABLE usuarios (
  id     integer PRIMARY KEY,
  nome   text NOT NULL,
  email  text NOT NULL UNIQUE,
  cidade text
);

CREATE TABLE projetos (
  id      integer PRIMARY KEY,
  nome    text NOT NULL,
  dono_id integer NOT NULL REFERENCES usuarios (id)
);

CREATE TABLE tarefas (
  id              integer PRIMARY KEY,
  projeto_id      integer NOT NULL REFERENCES projetos (id),
  responsavel_id  integer REFERENCES usuarios (id),
  titulo          text NOT NULL,
  status          text NOT NULL,
  prioridade      integer NOT NULL,
  horas_estimadas numeric(5,1),
  criada_em       date NOT NULL
);

CREATE TABLE comentarios (
  id        integer PRIMARY KEY,
  tarefa_id integer NOT NULL REFERENCES tarefas (id),
  autor_id  integer NOT NULL REFERENCES usuarios (id),
  texto     text NOT NULL
);

INSERT INTO usuarios (id, nome, email, cidade) VALUES
  (1, 'Ana Souza',   'ana@exemplo.com',   'São Paulo'),
  (2, 'Bruno Lima',  'bruno@exemplo.com', 'Recife'),
  (3, 'Carla Dias',  'carla@exemplo.com', 'São Paulo'),
  (4, 'Diego Rocha', 'diego@exemplo.com', NULL),
  (5, 'Elisa Prado', 'elisa@exemplo.com', 'Curitiba');

INSERT INTO projetos (id, nome, dono_id) VALUES
  (1, 'Site institucional', 1),
  (2, 'App de entregas',    2),
  (3, 'Migração do banco',  1),
  (4, 'Pesquisa de UX',     3);

INSERT INTO tarefas (id, projeto_id, responsavel_id, titulo, status, prioridade, horas_estimadas, criada_em) VALUES
  (1, 1, 1,    'Criar layout da home',    'concluída',    2,  8.0, '2026-03-02'),
  (2, 1, 3,    'Escrever textos da home', 'em andamento', 1,  5.0, '2026-03-03'),
  (3, 1, NULL, 'Configurar domínio',      'a fazer',      3,  1.5, '2026-03-05'),
  (4, 2, 2,    'Tela de login',           'concluída',    1, 12.0, '2026-03-01'),
  (5, 2, 2,    'Rastreamento do pedido',  'em andamento', 1, 20.0, '2026-03-04'),
  (6, 2, 4,    'Notificações push',       'a fazer',      2, NULL, '2026-03-06'),
  (7, 3, 1,    'Mapear tabelas antigas',  'concluída',    2,  6.0, '2026-02-20'),
  (8, 3, 1,    'Script de migração',      'em andamento', 1, 16.0, '2026-02-25');

INSERT INTO comentarios (id, tarefa_id, autor_id, texto) VALUES
  (1, 1, 3, 'Layout aprovado pelo cliente.'),
  (2, 2, 1, 'Falta a seção de depoimentos.'),
  (3, 5, 4, 'API de mapas definida.'),
  (4, 5, 2, 'Começando a integração.'),
  (5, 8, 3, 'Revisar tipos de data.');`;

/** Contas bancárias, para transações. */
export const CONTAS = `CREATE TABLE contas (
  id      integer PRIMARY KEY,
  titular text NOT NULL,
  saldo   numeric(10,2) NOT NULL CHECK (saldo >= 0)
);

INSERT INTO contas (id, titular, saldo) VALUES
  (1, 'Ana',   500.00),
  (2, 'Bruno', 120.00),
  (3, 'Carla',   0.00);`;

/**
 * Função auxiliar dos testes: executa um comando e devolve true se o banco o
 * aceitou, false se o recusou. Usada para conferir constraints e permissões.
 */
export const ACEITA = `CREATE OR REPLACE FUNCTION pg_temp.aceita(comando text) RETURNS boolean LANGUAGE plpgsql AS $fn$
BEGIN
  EXECUTE comando;
  RETURN true;
EXCEPTION WHEN others THEN
  RETURN false;
END
$fn$;`;
