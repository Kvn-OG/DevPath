import type { Exercise, Lesson } from '../../../types/content';
import { LOJA } from '../datasets';

export const lesson: Lesson = {
  id: 'banco-01',
  trackId: 'sql',
  moduleId: 'sql-m1',
  title: 'O que é um banco de dados (e um SGBD)',
  durationMin: 20,
  objectives: [
    'Diferenciar dados, banco de dados e sistema gerenciador de banco de dados (SGBD).',
    'Explicar por que aplicações não guardam dados importantes em arquivos soltos ou planilhas.',
    'Descrever o caminho de uma consulta, da aplicação até o banco e de volta.',
    'Comparar bancos relacionais e não relacionais em linhas gerais.',
  ],
  prerequisites: [],
  concepts: ['bd-sgbd'],
  explanation: [
    {
      type: 'p',
      text: 'Toda aplicação útil guarda **dados**: usuários, pedidos, mensagens, tarefas. Um **banco de dados** é um conjunto organizado desses dados. Quem cuida dele é o **SGBD** (sistema gerenciador de banco de dados, em inglês *DBMS*): o programa que armazena, protege e responde perguntas sobre os dados. PostgreSQL, MySQL, SQLite e SQL Server são SGBDs.',
    },
    { type: 'h', text: 'Por que não um arquivo ou uma planilha?' },
    {
      type: 'p',
      text: 'Salvar tudo em um arquivo JSON ou em uma planilha funciona no começo. Os problemas aparecem quando a aplicação cresce:',
    },
    {
      type: 'list',
      items: [
        '**Concorrência**: duas pessoas alteram o mesmo arquivo ao mesmo tempo e uma alteração apaga a outra.',
        '**Integridade**: nada impede um preço negativo, um e-mail repetido ou um pedido de um cliente que não existe.',
        '**Falhas**: se a energia cai no meio de uma gravação, o arquivo pode ficar pela metade e corrompido.',
        '**Consultas**: para achar "pedidos de março acima de R$ 100" é preciso ler o arquivo inteiro, linha por linha, toda vez.',
        '**Segurança**: ou alguém pode ler o arquivo todo, ou não pode ler nada; não há permissões por tabela ou por operação.',
      ],
    },
    {
      type: 'p',
      text: 'Um SGBD resolve esses problemas de forma sistemática: controla acessos simultâneos, aplica regras (constraints), grava de modo a sobreviver a quedas, usa índices para buscar rápido e controla quem pode fazer o quê. Você vai estudar cada uma dessas peças nesta trilha.',
    },
    { type: 'h', text: 'Cliente e servidor' },
    {
      type: 'p',
      text: 'O PostgreSQL funciona como um **servidor**: um programa que fica rodando e aceita conexões. Sua aplicação (em Node.js, Go, Java...) é o **cliente**: ela se conecta, envia comandos em **SQL** (*Structured Query Language*) e recebe as respostas. O psql, que você usará mais adiante, é um cliente de terminal.',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'A aplicação abre uma conexão com o servidor (endereço, porta, usuário e senha).',
        'Ela envia um comando SQL, como `SELECT nome FROM produtos;`.',
        'O servidor **analisa** o texto (está escrito certo? as tabelas existem?).',
        'O **planejador** decide a forma mais barata de buscar os dados (ler a tabela toda ou usar um índice?).',
        'O **executor** lê os dados da memória ou do disco e monta o resultado.',
        'As linhas voltam para a aplicação, que decide o que mostrar.',
      ],
    },
    { type: 'h', text: 'Relacional × não relacional' },
    {
      type: 'p',
      text: 'Bancos **relacionais** (PostgreSQL, MySQL) organizam os dados em **tabelas** com colunas de tipo definido e ligam tabelas entre si por chaves. Bancos **não relacionais** (NoSQL) usam outros modelos: documentos JSON (MongoDB), chave-valor (Redis), grafos (Neo4j). Eles brilham em casos específicos, como cache ou dados sem estrutura fixa. Para a grande maioria das aplicações — cadastros, pedidos, finanças, gestão — um banco relacional é a escolha segura, e o PostgreSQL ainda guarda JSON quando você precisa (aula 22).',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Nesta trilha',
      text: 'Os exemplos e exercícios rodam em um **PostgreSQL de verdade**, executado no seu navegador. Cada execução começa com um banco novo, com as tabelas do exercício. Você não precisa instalar nada agora; a instalação no seu computador e na VPS vem no módulo 6.',
    },
  ],
  analogy:
    'Um banco de dados é como o arquivo de uma biblioteca, e o SGBD é a equipe de bibliotecários: só eles mexem nas estantes, impedem que dois leitores levem o mesmo exemplar, registram cada empréstimo antes de entregar o livro e sabem achar qualquer obra sem percorrer todas as prateleiras.',
  example: {
    language: 'sql',
    setup: LOJA,
    code: `-- Uma pergunta para o banco:
-- quais produtos da padaria estão à venda?
SELECT nome, preco
FROM produtos
WHERE categoria = 'Padaria' AND ativo = true;`,
    lineByLine: [
      { line: 1, text: 'Linhas que começam com `--` são comentários: o banco ignora.' },
      { line: 3, text: '`SELECT` diz quais colunas queremos no resultado.' },
      { line: 4, text: '`FROM` diz de qual tabela os dados vêm.' },
      { line: 5, text: '`WHERE` filtra as linhas: só as da categoria Padaria que estão ativas. O `;` encerra o comando.' },
    ],
    output: ` nome               | preco
--------------------+-------
 Pão de queijo 500g | 24.90
(1 linha)`,
  },
  commonErrors: [
    {
      title: 'Achar que o banco "é" o SQL',
      why: 'SQL é a linguagem usada para conversar com o banco. O banco (o SGBD) é o programa que guarda e protege os dados.',
      fix: 'Pense em SQL como o idioma e no PostgreSQL como a pessoa que entende esse idioma.',
    },
    {
      title: 'Guardar dados importantes em arquivo "porque é mais simples"',
      why: 'Funciona com um usuário e poucos dados. Com acessos simultâneos e quedas de energia, aparecem dados perdidos e corrompidos.',
      fix: 'Use um SGBD desde o início para dados que importam. O custo de começar é baixo; o de migrar depois, alto.',
    },
    {
      title: 'Escolher NoSQL "porque é moderno"',
      why: 'Bancos não relacionais abrem mão de garantias (como chaves estrangeiras e transações entre várias coleções) em troca de outras vantagens.',
      fix: 'Comece pelo relacional e escolha outro modelo quando houver um motivo concreto.',
    },
  ],
  guidedExerciseId: 'ex-banco-01-guiado',
  independentExerciseId: 'ex-banco-01-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre banco de dados e SGBD?', answer: 'O banco de dados é o conjunto organizado de dados; o SGBD é o programa (como o PostgreSQL) que armazena, protege e consulta esses dados.' },
    { question: 'Cite três problemas de guardar dados em um arquivo comum.', answer: 'Escritas simultâneas que se sobrescrevem, ausência de regras de integridade, corrupção em quedas de energia, buscas lentas e falta de permissões.' },
    { question: 'Quem decide se uma consulta vai usar um índice ou ler a tabela inteira?', answer: 'O planejador (*planner*) do banco, que estima o custo de cada forma de executar a consulta.' },
  ],
  summary: [
    'SGBD é o programa que guarda, protege e consulta os dados; SQL é a linguagem para conversar com ele.',
    'Bancos resolvem concorrência, integridade, falhas, consultas rápidas e permissões.',
    'O PostgreSQL é um servidor; aplicações e o psql são clientes que enviam SQL.',
    'Bancos relacionais organizam dados em tabelas ligadas por chaves.',
  ],
  completionCriteria: [
    'Ordenar o caminho de uma consulta da aplicação até o banco (exercício guiado).',
    'Identificar o problema que um SGBD resolve em um caso real (exercício independente).',
  ],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-01-guiado',
    type: 'order-steps',
    title: 'O caminho de uma consulta',
    difficulty: 'iniciante',
    concepts: ['bd-sgbd'],
    statement: 'Coloque em ordem o que acontece quando o site de uma loja busca os produtos em promoção no PostgreSQL.',
    steps: [
      { id: 'a', text: 'A aplicação abre uma conexão com o servidor do banco.' },
      { id: 'b', text: 'A aplicação envia o comando SQL com a consulta.' },
      { id: 'c', text: 'O servidor analisa o SQL e confere se as tabelas e colunas existem.' },
      { id: 'd', text: 'O planejador escolhe a forma mais barata de buscar os dados.' },
      { id: 'e', text: 'O executor lê os dados e monta as linhas do resultado.' },
      { id: 'f', text: 'As linhas voltam para a aplicação, que monta a página.' },
    ],
    hints: [
      'Conceito: o banco é um servidor; a aplicação é o cliente que conversa com ele.',
      'Raciocínio: antes de enviar qualquer comando é preciso estar conectado; antes de executar, o banco precisa entender e planejar.',
      'Estrutura: conexão → envio → análise → planejamento → execução → resposta.',
    ],
    solution: {
      explanation:
        'Primeiro a conexão, depois o envio do SQL. No servidor, o texto é analisado (sintaxe e existência das tabelas), o planejador decide como buscar e o executor faz o trabalho. Por fim, o resultado volta para o cliente.',
    },
  },
  {
    id: 'ex-banco-01-independente',
    type: 'multiple-choice',
    title: 'A planilha compartilhada',
    difficulty: 'iniciante',
    concepts: ['bd-sgbd'],
    statement:
      'Uma clínica controla agendamentos em uma planilha na rede. Duas recepcionistas abriram o arquivo ao mesmo tempo, cada uma marcou um paciente às 14h com o mesmo médico e salvou. No fim, só um agendamento ficou registrado e o outro paciente apareceu sem horário. Qual capacidade de um SGBD evitaria exatamente esse problema?',
    options: [
      { id: 'a', text: 'Índices, que deixam as buscas mais rápidas.', feedback: 'Índices aceleram buscas, mas não impedem que uma gravação sobrescreva a outra.' },
      {
        id: 'b',
        text: 'Controle de concorrência e transações: cada gravação é aplicada por inteiro e o banco coordena alterações simultâneas (e uma regra UNIQUE pode recusar o horário duplicado).',
        feedback: 'Isso. O banco coordena escritas simultâneas sem perder nenhuma, e uma constraint pode impedir dois agendamentos no mesmo horário.',
      },
      { id: 'c', text: 'A linguagem SQL, que é mais fácil que fórmulas de planilha.', feedback: 'A linguagem não resolve escritas simultâneas; quem resolve é o SGBD.' },
      { id: 'd', text: 'Backups diários.', feedback: 'O backup não teria o agendamento perdido: a sobrescrita aconteceu antes de qualquer cópia.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: o problema surgiu porque duas pessoas alteraram os mesmos dados ao mesmo tempo.',
      'Raciocínio: qual alternativa trata de alterações simultâneas, e não de velocidade ou de recuperação?',
      'Estrutura: procure a alternativa que fala em concorrência.',
    ],
    solution: {
      explanation:
        'É um problema clássico de concorrência: a última gravação apagou a anterior. Um SGBD aplica cada alteração como uma transação e coordena escritas simultâneas; com uma constraint UNIQUE (médico + horário), o segundo agendamento seria recusado com um erro claro em vez de sumir.',
    },
  },
];
