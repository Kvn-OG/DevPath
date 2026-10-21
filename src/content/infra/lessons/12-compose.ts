import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-12',
  trackId: 'infra',
  moduleId: 'infra-m4',
  title: 'Volumes, redes e Docker Compose',
  durationMin: 30,
  objectives: [
    'Persistir dados com volumes.',
    'Conectar containers por uma rede e pelo nome do serviço.',
    'Descrever uma aplicação com API e PostgreSQL em um compose.yaml.',
    'Usar healthcheck e depends_on para ordenar a inicialização.',
  ],
  prerequisites: ['infra-11'],
  concepts: ['infra-compose'],
  explanation: [
    { type: 'h', text: 'Volumes' },
    {
      type: 'p',
      text: 'Um **volume** é um espaço de disco gerenciado pelo Docker e montado dentro do container. Ele sobrevive à remoção do container. Para o PostgreSQL: `-v pgdata:/var/lib/postgresql/data`. Um *bind mount* (`-v /srv/loja/uploads:/app/uploads`) monta uma pasta da VPS.',
    },
    { type: 'h', text: 'Redes' },
    {
      type: 'p',
      text: 'Containers na mesma rede Docker se encontram **pelo nome**: a API acessa o banco em `db:5432`, sem IP e sem publicar a porta do banco para fora. É assim que o banco fica seguro (aula 5).',
    },
    { type: 'h', text: 'Docker Compose' },
    {
      type: 'p',
      text: 'O **Compose** descreve vários containers, redes e volumes em um arquivo `compose.yaml`. `docker compose up -d` cria tudo; `docker compose logs -f api` mostra os logs; `docker compose pull && docker compose up -d` atualiza; `docker compose down` remove os containers (os volumes ficam).',
    },
    {
      type: 'list',
      items: [
        'Cada serviço do arquivo vira um nome na rede interna (`db`, `api`).',
        '`depends_on` com `condition: service_healthy` faz a API esperar o banco estar pronto, não só iniciado.',
        '`env_file: .env` carrega as variáveis de um arquivo fora do Git.',
        'O EasyPanel faz tudo isso por você na interface — mas entender o compose ajuda a saber o que o painel está criando.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'down -v apaga os dados',
      text: '`docker compose down -v` remove também os **volumes**: o banco inteiro vai embora. Use só quando quiser mesmo começar do zero.',
    },
  ],
  analogy:
    'O compose.yaml é a planta de uma pequena cozinha industrial: quais equipamentos (serviços) existem, onde ficam as despensas que não podem ser jogadas fora (volumes) e quais portas internas ligam um setor ao outro (rede). Com a planta, montar a cozinha em outro endereço é repetir um comando.',
  example: {
    language: 'shell',
    code: `# compose.yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: loja
      POSTGRES_USER: loja
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U loja -d loja"]
      interval: 5s
      retries: 10
    restart: unless-stopped

  api:
    image: ghcr.io/voce/api:1.4.0
    environment:
      DATABASE_URL: postgresql://loja:\${DB_PASSWORD}@db:5432/loja
      PORT: "8080"
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "127.0.0.1:8080:8080"
    restart: unless-stopped

volumes:
  pgdata:`,
    lineByLine: [
      { line: 8, text: 'A senha vem da variável DB_PASSWORD, definida em um .env ao lado do arquivo (fora do Git).' },
      { line: 10, text: 'Volume nomeado: os dados sobrevivem à recriação do container.' },
      { line: 12, text: 'pg_isready diz quando o banco aceita conexões.' },
      { line: 20, text: 'A API encontra o banco pelo nome do serviço, db, na rede interna.' },
      { line: 24, text: 'A API só sobe depois que o healthcheck do banco passar.' },
      { line: 26, text: 'Só a API é publicada, e apenas no localhost (para o proxy). O banco não tem ports.' },
    ],
    output: `$ docker compose up -d
[+] Running 4/4
 ✔ Network loja_default  Created
 ✔ Volume "loja_pgdata"  Created
 ✔ Container loja-db-1   Healthy
 ✔ Container loja-api-1  Started`,
  },
  commonErrors: [
    {
      title: 'API acessando o banco por localhost',
      wrong: 'DATABASE_URL: postgresql://loja:senha@localhost:5432/loja',
      why: 'Dentro do container da API, localhost é o próprio container da API, onde não há banco.',
      fix: 'Use o nome do serviço: `@db:5432`.',
    },
    {
      title: 'Publicar a porta do banco "para facilitar"',
      wrong: 'ports:\n  - "5432:5432"',
      why: 'O banco fica exposto à internet, contornando o UFW (aula 5).',
      fix: 'Sem ports no banco. Para acessar de fora, use um túnel SSH: `ssh -L 5432:localhost:5432 vps` com a porta publicada só em 127.0.0.1.',
    },
    {
      title: 'Esperar o banco só com depends_on',
      wrong: 'depends_on:\n  - db',
      why: 'Isso espera o container iniciar, não o PostgreSQL ficar pronto; a API pode falhar ao conectar.',
      fix: 'Healthcheck no banco e `condition: service_healthy` (e tentativas de reconexão na aplicação).',
    },
  ],
  guidedExerciseId: 'ex-infra-12-guiado',
  independentExerciseId: 'ex-infra-12-independente',
  reviewQuestions: [
    { question: 'Como a API encontra o banco em um compose?', answer: 'Pelo nome do serviço (ex.: db:5432) na rede interna criada pelo Compose.' },
    { question: 'O que acontece com os volumes em `docker compose down`?', answer: 'Eles são mantidos; só são removidos com `docker compose down -v`.' },
    { question: 'Para que serve o healthcheck do banco?', answer: 'Para que os serviços dependentes só iniciem quando o banco estiver realmente aceitando conexões.' },
  ],
  summary: [
    'Volumes guardam dados além da vida do container.',
    'Containers da mesma rede se acham pelo nome do serviço.',
    'compose.yaml descreve serviços, volumes e dependências.',
    'Banco sem ports; healthcheck + service_healthy; cuidado com down -v.',
  ],
  completionCriteria: ['Completar a conexão da API com o banco no compose (exercício guiado).', 'Diagnosticar uma API que não acha o banco (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-12-guiado',
    type: 'fill-blanks',
    title: 'Ligando API e banco',
    difficulty: 'basico',
    concepts: ['infra-compose'],
    language: 'shell',
    statement: 'Complete o compose: o banco guarda os dados no volume `pgdata`, e a API se conecta ao serviço `db` e só sobe quando ele estiver saudável.',
    template: `services:
  db:
    image: postgres:17
    volumes:
      - [[0]]:/var/lib/postgresql/data
  api:
    environment:
      DATABASE_URL: postgresql://loja:senha@[[1]]:5432/loja
    depends_on:
      db:
        condition: [[2]]
volumes:
  pgdata:`,
    blanks: [
      { accept: ['pgdata'], width: 7 },
      { accept: ['db'], width: 4 },
      { accept: ['service_healthy'], width: 16 },
    ],
    hints: [
      'Conceito: volumes têm nome; serviços se encontram pelo nome; depends_on aceita condições.',
      'Raciocínio: o host do banco, visto de dentro da API, é o nome do serviço.',
      'Estrutura: pgdata, db e service_healthy.',
    ],
    solution: {
      code: `volumes:
  - pgdata:/var/lib/postgresql/data
# ...
DATABASE_URL: postgresql://loja:senha@db:5432/loja
# ...
condition: service_healthy`,
      explanation: 'O volume pgdata persiste os dados, o nome db resolve para o container do banco na rede interna, e service_healthy faz a API esperar o healthcheck do PostgreSQL.',
    },
  },
  {
    id: 'ex-infra-12-independente',
    type: 'multiple-choice',
    title: 'Connection refused no localhost',
    difficulty: 'intermediario',
    concepts: ['infra-compose'],
    language: 'shell',
    statement: 'A API, rodando no compose junto com o serviço `db`, falha ao iniciar com o erro abaixo. Qual a correção?',
    code: `dial tcp 127.0.0.1:5432: connect: connection refused
# DATABASE_URL=postgresql://loja:senha@localhost:5432/loja`,
    options: [
      { id: 'a', text: 'Publicar a porta 5432 do banco com ports.', feedback: 'Exporia o banco à internet, e a API continuaria procurando no próprio container.' },
      { id: 'b', text: 'Trocar localhost por db na DATABASE_URL.', feedback: 'Correto: dentro do container da API, o banco é alcançado pelo nome do serviço.' },
      { id: 'c', text: 'Instalar o PostgreSQL dentro da imagem da API.', feedback: 'Cada serviço em seu container; o banco já existe no serviço db.' },
      { id: 'd', text: 'Reiniciar a VPS.', feedback: 'O endereço continuaria errado.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: cada container tem seu próprio localhost.', 'Raciocínio: onde o PostgreSQL está rodando, visto de dentro da API?', 'Estrutura: o nome do serviço no compose.'],
    solution: { explanation: 'localhost, dentro da API, é o container da API. O Compose cria uma rede em que o nome db aponta para o container do banco: `postgresql://loja:senha@db:5432/loja`.' },
  },
];
