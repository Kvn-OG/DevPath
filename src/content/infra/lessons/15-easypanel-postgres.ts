import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-15',
  trackId: 'infra',
  moduleId: 'infra-m5',
  title: 'PostgreSQL no EasyPanel',
  durationMin: 30,
  objectives: [
    'Criar um serviço Postgres e ler as credenciais internas.',
    'Conectar a aplicação pelo endereço interno, sem expor o banco.',
    'Expor o banco com segurança quando for realmente necessário.',
    'Rodar migrações e acessar o psql pelo shell do serviço.',
  ],
  prerequisites: ['infra-14'],
  concepts: ['infra-easypanel-postgres'],
  explanation: [
    {
      type: 'p',
      text: 'No projeto, **New Service → Postgres** cria um PostgreSQL em container, com volume para os dados. Você pode definir nome do banco, usuário, senha e imagem; em branco, o banco recebe o nome do projeto, o usuário é `postgres` e a senha é gerada.',
    },
    { type: 'h', text: 'Credenciais internas e externas' },
    {
      type: 'list',
      items: [
        'A aba **Credentials** mostra a conexão **interna**: usuário, senha, banco, host interno e uma URL pronta. Aplicações do mesmo projeto usam essa URL na `DATABASE_URL`.',
        'O host interno é derivado dos nomes do projeto e do serviço. **Copie da aba Credentials** em vez de adivinhar.',
        'A URL interna usa `sslmode=disable`: o tráfego não sai da rede privada dos containers.',
        'Por padrão, o banco é **privado**. A aba **Expose** publica uma porta no servidor e mostra a conexão **externa**.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Expor é exceção',
      text: 'Só exponha o banco se algo fora da VPS precisar dele (uma ferramenta de BI, por exemplo). Nesse caso, use uma porta não padrão, senha forte, e libere no firewall do provedor **somente o IP** de quem precisa. Para acessos pontuais, um túnel SSH evita a exposição: `ssh -L 5433:localhost:PORTA vps`.',
    },
    { type: 'h', text: 'Migrações e manutenção' },
    {
      type: 'list',
      items: [
        'Rode as migrações no deploy: como comando de pré-inicialização da aplicação, um passo do CI, ou um script executado no shell do serviço da aplicação.',
        'No shell do serviço Postgres, `psql -U postgres -d loja` abre o banco para consultas e ajustes (tudo da Trilha 5 vale aqui).',
        'Crie um role próprio para a aplicação, com o mínimo de privilégios (aula 21 da Trilha 5), em vez de usar o usuário postgres em produção.',
        'Backups agendados ficam na aba **Backups** (próximo módulo).',
      ],
    },
  ],
  analogy:
    'O banco no EasyPanel é como o cofre nos fundos da loja: os funcionários (as aplicações do projeto) chegam a ele por um corredor interno, sem passar pela rua. Expor o banco é abrir uma janela do cofre para a calçada — às vezes necessário, mas só com grade, cadeado e uma lista de quem pode se aproximar.',
  example: {
    language: 'shell',
    code: `# No shell do serviço Postgres (aba Shell)
psql -U postgres -d loja -c "\\dt"
psql -U postgres -d loja -c "SELECT count(*) AS tarefas FROM tarefas;"`,
    lineByLine: [
      { line: 2, text: 'Lista as tabelas criadas pelas migrações da API.' },
      { line: 3, text: 'Uma consulta rápida para conferir que os dados estão lá.' },
    ],
    output: `           List of relations
 Schema |    Name     | Type  |  Owner
--------+-------------+-------+----------
 public | comentarios | table | postgres
 public | projetos    | table | postgres
 public | tarefas     | table | postgres
 public | usuarios    | table | postgres
(4 rows)

 tarefas
---------
       8
(1 row)`,
  },
  commonErrors: [
    {
      title: 'Usar a URL externa dentro do projeto',
      why: 'O tráfego sai para a interface pública e volta, exige o banco exposto e depende do firewall.',
      fix: 'Aplicações do mesmo projeto usam a URL interna da aba Credentials.',
    },
    {
      title: 'Expor o banco na porta 5432 para todo mundo',
      why: 'Robôs varrem a internet atrás de PostgreSQL aberto e testam senhas o tempo todo.',
      fix: 'Não exponha; se for preciso, porta diferente, senha forte e firewall liberando só o IP necessário.',
    },
    {
      title: 'Trocar a versão principal da imagem do banco',
      wrong: 'postgres:16  →  postgres:17   # e Deploy',
      why: 'Os arquivos de dados de uma versão principal não são lidos pela seguinte; o banco não sobe.',
      fix: 'Atualizações de versão principal exigem backup e restauração (ou pg_upgrade), planejadas e testadas.',
    },
  ],
  guidedExerciseId: 'ex-infra-15-guiado',
  independentExerciseId: 'ex-infra-15-independente',
  reviewQuestions: [
    { question: 'Qual URL a API do mesmo projeto deve usar para falar com o banco?', answer: 'A URL interna mostrada na aba Credentials do serviço Postgres.' },
    { question: 'Por que o banco fica privado por padrão?', answer: 'Para que só os serviços da rede interna o alcancem, sem exposição à internet.' },
    { question: 'Como acessar o banco pontualmente de fora sem expô-lo?', answer: 'Por um túnel SSH até a VPS, ou pelo shell do serviço no painel.' },
  ],
  summary: [
    'New Service → Postgres cria banco com volume e credenciais.',
    'Use a URL interna de Credentials na DATABASE_URL.',
    'Expose só quando necessário, com firewall restrito.',
    'Migrações no deploy; psql pelo shell; role próprio para a aplicação.',
  ],
  completionCriteria: ['Escolher a conexão certa entre API e banco (exercício guiado).', 'Avaliar a exposição de um banco (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-15-guiado',
    type: 'multiple-choice',
    title: 'API e banco no mesmo projeto',
    difficulty: 'basico',
    concepts: ['infra-easypanel-postgres'],
    statement: 'A API e o Postgres estão no mesmo projeto do EasyPanel. Qual DATABASE_URL a API deve usar?',
    options: [
      { id: 'a', text: 'A URL externa, com o IP público da VPS.', feedback: 'Exigiria expor o banco e faria o tráfego passar pela interface pública.' },
      { id: 'b', text: 'A URL interna da aba Credentials do serviço Postgres.', feedback: 'Correto: serviços do mesmo projeto se falam pela rede privada.' },
      { id: 'c', text: 'postgres://postgres@localhost:5432/loja', feedback: 'localhost, dentro do container da API, é a própria API.' },
      { id: 'd', text: 'Qualquer uma: o banco aceita as duas igualmente.', feedback: 'A externa nem existe enquanto o banco não é exposto, e não deve ser exposto à toa.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: rede interna do projeto.', 'Raciocínio: qual endereço não exige expor o banco?', 'Estrutura: está pronto na aba Credentials.'],
    solution: { explanation: 'A URL interna aponta para o host do serviço na rede privada dos containers. O banco continua sem nenhuma porta aberta para a internet.' },
  },
  {
    id: 'ex-infra-15-independente',
    type: 'true-false',
    title: 'Banco exposto para o BI',
    difficulty: 'intermediario',
    concepts: ['infra-easypanel-postgres', 'infra-firewall'],
    statement: 'A equipe de BI, fora da VPS, precisa ler o banco toda manhã. Alguém propõe expor o Postgres na porta 5432, aberta para qualquer IP, "porque a senha é forte".',
    claim: 'Essa configuração é adequada.',
    answer: false,
    justifications: [
      { id: 'a', text: 'Uma porta de banco aberta para qualquer IP fica sujeita a varreduras e ataques; o certo é restringir no firewall do provedor ao IP do BI (ou usar túnel), com um role só de leitura.' },
      { id: 'b', text: 'É adequada: senhas fortes tornam qualquer exposição segura.' },
      { id: 'c', text: 'O EasyPanel não permite expor bancos.' },
      { id: 'd', text: 'É adequada desde que o banco esteja no mesmo projeto do BI.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: menor exposição possível.', 'Raciocínio: quem precisa acessar? Só o IP do BI.', 'Estrutura: firewall restrito + role de leitura (Trilha 5, aula 21).'],
    solution: { explanation: 'Falso. Senha forte não impede ataques a falhas do próprio serviço nem a enxurrada de tentativas. Exponha com porta não padrão, firewall liberando só o IP do BI e um role com apenas SELECT nas tabelas necessárias.' },
  },
];
