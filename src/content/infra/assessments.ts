import type { Assessment, Exercise } from '../../types/content';

// Questões exclusivas da avaliação final (não repetem exercícios das aulas).

const finalExam: Exercise[] = [
  {
    id: 'av-infra-1',
    type: 'multiple-choice',
    title: 'Primeira hora da VPS',
    difficulty: 'basico',
    concepts: ['infra-usuarios', 'infra-firewall'],
    statement: 'Você acabou de criar uma VPS e entrou como root com senha. Qual conjunto de ações vem antes de instalar qualquer aplicação?',
    options: [
      { id: 'a', text: 'Instalar o EasyPanel e depois pensar em segurança.', feedback: 'O servidor ficaria exposto desde o primeiro minuto.' },
      { id: 'b', text: 'Criar um usuário com sudo e chave SSH, desativar root e senha no SSH, ativar o UFW (22, 80, 443) e atualizar o sistema.', feedback: 'Correto: o mínimo antes de colocar qualquer coisa no ar.' },
      { id: 'c', text: 'Trocar a porta do SSH e manter o login por senha.', feedback: 'Mudar a porta só reduz o ruído; senha continua sendo o elo fraco.' },
      { id: 'd', text: 'Abrir todas as portas para testar com calma.', feedback: 'Testar com tudo aberto é exatamente o que os robôs procuram.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: acesso seguro, firewall e atualizações primeiro.', 'Raciocínio: o que os robôs atacam primeiro?', 'Estrutura: módulo 2 da trilha.'],
    solution: { explanation: 'Usuário próprio com chave, SSH sem root e sem senha, firewall liberando só 22, 80 e 443 e sistema atualizado formam a base. Só então instale Docker e o painel.' },
  },
  {
    id: 'av-infra-2',
    type: 'multiple-choice',
    title: 'O caminho de uma requisição',
    difficulty: 'basico',
    concepts: ['infra-dns', 'infra-proxy', 'infra-https'],
    statement: 'Um usuário abre https://api.minhaloja.com.br/pedidos. Qual é o caminho da requisição até a API, que roda em um container na porta 8080?',
    options: [
      { id: 'a', text: 'Navegador → container na porta 8080 → proxy.', feedback: 'A API não fica exposta diretamente; o proxy vem antes.' },
      { id: 'b', text: 'DNS resolve o nome para o IP da VPS → proxy reverso na 443 (com o certificado) → container da API na 8080, pela rede interna.', feedback: 'Correto: DNS, proxy com HTTPS e só então a aplicação.' },
      { id: 'c', text: "Navegador → Let's Encrypt → API.", feedback: "O Let's Encrypt só emite o certificado; ele não participa das requisições." },
      { id: 'd', text: 'Navegador → banco de dados → API.', feedback: 'O banco é acessado pela API, nunca pelo navegador.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: DNS → proxy → aplicação.', 'Raciocínio: quem escuta na porta 443?', 'Estrutura: a aplicação escuta numa porta interna.'],
    solution: { explanation: 'O DNS leva ao IP da VPS; o proxy reverso recebe na 443, apresenta o certificado, escolhe o serviço pelo nome e repassa para a porta interna 8080 do container.' },
  },
  {
    id: 'av-infra-3',
    type: 'true-false',
    title: 'UFW e Docker',
    difficulty: 'intermediario',
    concepts: ['infra-firewall', 'infra-docker'],
    language: 'shell',
    statement: 'O UFW nega tudo menos 22, 80 e 443. Um banco foi criado com o comando abaixo.',
    code: 'docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=segredo postgres:17',
    claim: 'O banco está protegido pelo UFW e não pode ser acessado de fora.',
    answer: false,
    justifications: [
      { id: 'a', text: 'Portas publicadas pelo Docker usam regras de iptables próprias que contornam o UFW; o banco fica acessível da internet.' },
      { id: 'b', text: 'O UFW protege todas as portas, inclusive as do Docker.' },
      { id: 'c', text: 'O PostgreSQL recusa conexões externas por padrão em qualquer imagem.' },
      { id: 'd', text: 'A porta 5432 é bloqueada pelos provedores de VPS.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: Docker manipula o iptables diretamente.', 'Raciocínio: o que -p 5432:5432 faz?', 'Estrutura: aula 5.'],
    solution: { explanation: 'Falso. O Docker publica a porta por regras próprias, avaliadas antes das do UFW. Bancos não devem publicar portas; quem precisa deles está na rede interna.' },
  },
  {
    id: 'av-infra-4',
    type: 'fill-blanks',
    title: 'O banco no Compose',
    difficulty: 'basico',
    concepts: ['infra-compose'],
    language: 'shell',
    statement: 'Complete: os dados do banco persistem em um volume, e a API se conecta ao serviço `db` pela rede interna.',
    template: `services:
  db:
    image: postgres:17
    [[0]]:
      - pgdata:/var/lib/postgresql/data
  api:
    environment:
      DATABASE_URL: postgresql://loja:senha@[[1]]:5432/loja`,
    blanks: [
      { accept: ['volumes'], width: 8 },
      { accept: ['db'], width: 4 },
    ],
    hints: ['Conceito: volumes persistem dados; serviços se acham pelo nome.', 'Raciocínio: a chave do compose que monta volumes, e o host do banco visto da API.', 'Estrutura: volumes e db.'],
    solution: { code: 'volumes:\n  - pgdata:/var/lib/postgresql/data\n# ...\n@db:5432', explanation: 'A chave volumes monta o volume pgdata no diretório de dados do PostgreSQL; dentro da rede do Compose, o banco é alcançado pelo nome do serviço, db.' },
  },
  {
    id: 'av-infra-5',
    type: 'multiple-choice',
    title: 'Dockerfile eficiente',
    difficulty: 'intermediario',
    concepts: ['infra-dockerfile'],
    statement: 'Qual Dockerfile de uma API Go gera a imagem menor e mais segura, com builds rápidos?',
    options: [
      { id: 'a', text: 'FROM golang:1.25, COPY . ., RUN go build, CMD ["./api"] — tudo em um estágio, rodando como root.', feedback: 'A imagem final carrega o compilador inteiro e roda como root.' },
      {
        id: 'b',
        text: 'Estágio de build: copiar go.mod e go.sum, go mod download, copiar o código, CGO_ENABLED=0 go build; estágio final: imagem mínima só com o binário, sem root.',
        feedback: 'Correto: cache de dependências, binário estático e imagem final mínima.',
      },
      { id: 'c', text: 'FROM ubuntu:latest e instalar o Go com apt dentro da imagem.', feedback: 'Imagem grande, versão imprevisível e sem cache eficiente.' },
      { id: 'd', text: 'Copiar o binário compilado no seu notebook e o arquivo .env para a imagem.', feedback: 'Segredos não entram na imagem, e o build deixa de ser reproduzível.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: dois estágios e cache de camadas.', 'Raciocínio: o que a imagem final realmente precisa?', 'Estrutura: dependências antes do código.'],
    solution: { explanation: 'Copiar go.mod/go.sum antes do código aproveita o cache; o binário estático (CGO_ENABLED=0) roda em uma imagem mínima, sem compilador, sem shell e sem root.' },
  },
  {
    id: 'av-infra-6',
    type: 'multiple-choice',
    title: 'Conectando ao banco do painel',
    difficulty: 'basico',
    concepts: ['infra-easypanel-postgres', 'infra-deploy'],
    statement: 'No EasyPanel, a API e o Postgres estão no mesmo projeto. A API falha com "connection refused". A DATABASE_URL usa `localhost:5432`. Qual a correção?',
    options: [
      { id: 'a', text: 'Expor o Postgres na aba Expose.', feedback: 'Exporia o banco sem necessidade; a API está na mesma rede interna.' },
      { id: 'b', text: 'Usar a URL interna mostrada na aba Credentials do serviço Postgres e fazer o Deploy da API.', feedback: 'Correto: o host interno do banco, e não o localhost do container da API.' },
      { id: 'c', text: 'Instalar o PostgreSQL na imagem da API.', feedback: 'O banco já existe como serviço próprio.' },
      { id: 'd', text: 'Trocar a porta para 5433.', feedback: 'O problema é o host, não a porta.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: cada container tem seu localhost.', 'Raciocínio: onde o painel mostra o endereço interno do banco?', 'Estrutura: Credentials → URL interna.'],
    solution: { explanation: 'localhost aponta para o container da API. A URL interna da aba Credentials aponta para o serviço Postgres na rede do projeto. Depois de alterar a variável, é preciso fazer o Deploy.' },
  },
  {
    id: 'av-infra-7',
    type: 'order-steps',
    title: 'Plano de backup',
    difficulty: 'basico',
    concepts: ['infra-backup'],
    statement: 'Ordene a implantação dos backups do banco no EasyPanel.',
    steps: [
      { id: 'a', text: 'Criar um bucket S3 em outro provedor e uma chave com acesso só a ele.' },
      { id: 'b', text: 'Cadastrar o destino de armazenamento nas configurações do servidor no painel.' },
      { id: 'c', text: 'Na aba Backups do Postgres, definir agendamento (cron) e retenção.' },
      { id: 'd', text: 'Rodar um backup imediato e conferir o arquivo no bucket.' },
      { id: 'e', text: 'Restaurar esse backup em um banco de teste e conferir os dados.' },
    ],
    hints: ['Conceito: destino → configuração → validação → teste.', 'Raciocínio: o painel precisa conhecer o destino antes de agendar.', 'Estrutura: bucket, destino, agendamento, backup imediato, restauração.'],
    solution: { explanation: 'O destino fora da VPS vem primeiro, depois a configuração do agendamento. Um backup imediato confirma que funciona, e a restauração de teste prova que ele serve.' },
  },
  {
    id: 'av-infra-8',
    type: 'multiple-choice',
    title: 'Deploy quebrado',
    difficulty: 'intermediario',
    concepts: ['infra-operacao', 'infra-monitoramento'],
    statement: 'O verificador externo alertou: a rota /saude da API responde 503 desde o deploy da versão 2.3.0, que só adicionou uma tabela nova. Qual a melhor primeira ação?',
    options: [
      { id: 'a', text: 'Restaurar o banco do backup da noite anterior.', feedback: 'Perderia dados do dia, e a migração foi só aditiva.' },
      { id: 'b', text: 'Voltar o serviço para a imagem 2.2.0, confirmar que a saúde voltou e investigar a 2.3.0 pelos logs.', feedback: 'Correto: rollback rápido e seguro, já que a migração não quebra a versão anterior.' },
      { id: 'c', text: 'Desligar o verificador externo até o problema passar.', feedback: 'Tira o alarme, não o problema.' },
      { id: 'd', text: 'Aumentar a VPS para o dobro de memória.', feedback: 'Nada indica falta de recursos; o problema começou com o deploy.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: rollback primeiro, investigação depois.', 'Raciocínio: a versão anterior funciona com o banco atual?', 'Estrutura: uma tabela nova não afeta o código antigo.'],
    solution: { explanation: 'Como a migração foi aditiva, a 2.2.0 roda com o banco atual. Voltar para a tag anterior restaura o serviço em minutos; os logs da 2.3.0 mostram a causa para corrigir em uma nova versão.' },
  },
];

export const infraAssessmentExercises: Exercise[] = finalExam;

export const infraAssessments: Assessment[] = [
  {
    id: 'infra-final',
    kind: 'final',
    title: 'Avaliação final: VPS, Docker e EasyPanel',
    description: 'Oito questões sobre segurança do servidor, redes, Docker, EasyPanel, backups e operação.',
    trackId: 'infra',
    passingScore: 0.7,
    exerciseIds: finalExam.map((e) => e.id),
  },
];
