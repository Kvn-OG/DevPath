import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-10',
  trackId: 'infra',
  moduleId: 'infra-m4',
  title: 'Docker: imagens e containers',
  durationMin: 30,
  objectives: [
    'Diferenciar imagem e container.',
    'Rodar, listar, inspecionar e remover containers.',
    'Passar configuração por variáveis de ambiente e expor portas.',
    'Ler logs e executar comandos dentro de um container.',
  ],
  prerequisites: ['infra-09'],
  concepts: ['infra-docker'],
  explanation: [
    {
      type: 'p',
      text: 'O **Docker** empacota uma aplicação com tudo o que ela precisa (sistema base, bibliotecas, binário) em uma **imagem**. Um **container** é uma imagem em execução, isolada do resto da máquina. A mesma imagem roda igual no seu notebook, no CI e na VPS — o fim do "na minha máquina funciona".',
    },
    {
      type: 'list',
      items: [
        '**Imagem**: o molde, somente leitura, identificado por nome e tag (`postgres:17`, `nginx:1.27`). Fica em um *registry* (Docker Hub, GitHub Container Registry).',
        '**Container**: uma instância da imagem, com processo e arquivos próprios. Você pode ter vários da mesma imagem.',
        'Tudo o que é gravado dentro do container **some** quando ele é removido — a não ser que esteja em um **volume** (aula 12).',
      ],
    },
    {
      type: 'code',
      language: 'shell',
      code: `# Instalar o Docker no Ubuntu (script oficial)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # usar docker sem sudo (saia e entre de novo)`,
    },
    { type: 'h', text: 'Comandos do dia a dia' },
    {
      type: 'list',
      items: [
        '`docker run -d --name web -p 8080:80 nginx:1.27`: roda em segundo plano (-d), com nome, publicando a porta 80 do container na 8080 da VPS.',
        '`-e CHAVE=valor`: variável de ambiente (é assim que a aplicação recebe DATABASE_URL e afins).',
        '`docker ps` (rodando), `docker ps -a` (todos), `docker images`.',
        '`docker logs -f web`: logs ao vivo. `docker exec -it web sh`: abre um terminal dentro do container.',
        '`docker stop web`, `docker start web`, `docker rm web`, `docker pull imagem:tag`.',
        '`--restart unless-stopped`: sobe de novo sozinho se cair ou se a VPS reiniciar.',
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Fixe as versões',
      text: 'Use tags específicas (`postgres:17`, `node:22-alpine`) em vez de `latest`. Com `latest`, um `docker pull` qualquer dia traz uma versão nova — inclusive uma versão principal do banco que não lê os dados antigos.',
    },
  ],
  analogy:
    'A imagem é a receita congelada de uma marmita; o container é a marmita esquentada e servida. Você pode servir várias da mesma receita, e o que alguém joga dentro de uma marmita não muda a receita nem as outras.',
  example: {
    language: 'shell',
    code: `docker run -d --name web --restart unless-stopped -p 127.0.0.1:8080:80 nginx:1.27
docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}"
curl -s localhost:8080 | grep -o "<title>.*</title>"
docker logs web --tail 1`,
    lineByLine: [
      { line: 1, text: 'Roda o Nginx em segundo plano, reiniciando sozinho, publicado só no localhost da VPS.' },
      { line: 2, text: 'Lista os containers em uma tabela com nome, imagem, situação e portas.' },
      { line: 3, text: 'Acessa o container pela porta publicada.' },
      { line: 4, text: 'A última linha do log é o registro da requisição feita pelo curl.' },
    ],
    output: `3f9c1a7d2b64e0c8a1f5d9b2e7c4a6f8d0b3e5c7a9f1d2b4e6c8a0f3d5b7e9c1
NAMES     IMAGE        STATUS         PORTS
web       nginx:1.27   Up 3 seconds   127.0.0.1:8080->80/tcp
<title>Welcome to nginx!</title>
172.17.0.1 - - [15/Mar/2026:13:20:05 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/8.5.0" "-"`,
  },
  commonErrors: [
    {
      title: 'Dados dentro do container',
      wrong: 'docker run -d --name db postgres:17   # sem volume',
      why: 'Ao recriar o container (atualização, nova configuração), o banco volta vazio.',
      fix: 'Monte um volume no diretório de dados: `-v pgdata:/var/lib/postgresql/data`.',
    },
    {
      title: '"port is already allocated"',
      why: 'Outro container (ou programa) já usa essa porta da VPS.',
      fix: 'Veja quem é com `docker ps` ou `sudo ss -tulpn` e escolha outra porta ou pare o anterior.',
    },
    {
      title: 'Segredos na linha de comando versionada',
      wrong: 'docker run -e DB_PASSWORD=Senha123 ...   # em um script no Git',
      why: 'A senha vai para o repositório e para o histórico do shell.',
      fix: 'Use um arquivo .env fora do Git (`--env-file .env`) ou as variáveis do painel (EasyPanel).',
    },
  ],
  guidedExerciseId: 'ex-infra-10-guiado',
  independentExerciseId: 'ex-infra-10-independente',
  reviewQuestions: [
    { question: 'Qual a diferença entre imagem e container?', answer: 'A imagem é o molde imutável; o container é uma instância em execução dela.' },
    { question: 'O que faz `-p 127.0.0.1:8080:80`?', answer: 'Publica a porta 80 do container na porta 8080 da VPS, aceitando conexões só da própria máquina.' },
    { question: 'Por que evitar a tag latest?', answer: 'Porque ela muda com o tempo; um pull pode trazer uma versão incompatível sem você perceber.' },
  ],
  summary: [
    'Imagem = molde; container = instância em execução.',
    'docker run com -d, --name, -p, -e e --restart.',
    'docker ps, logs -f, exec -it, stop, rm.',
    'Dados persistentes em volumes; tags fixas em vez de latest.',
  ],
  completionCriteria: ['Montar um docker run completo (exercício guiado).', 'Prever o que acontece com dados sem volume (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-10-guiado',
    type: 'fill-blanks',
    title: 'Subindo a API',
    difficulty: 'basico',
    concepts: ['infra-docker'],
    language: 'shell',
    statement:
      'Rode a imagem `ghcr.io/voce/api:1.4.0` em segundo plano, com o nome `api`, reiniciando sozinha, recebendo a variável `PORT=8080` e publicando a porta 8080 do container só no localhost da VPS.',
    template: 'docker run [[0]] --name api --restart unless-stopped [[1]] PORT=8080 [[2]] 127.0.0.1:8080:8080 ghcr.io/voce/api:1.4.0',
    blanks: [
      { accept: ['-d', '--detach'], width: 3 },
      { accept: ['-e', '--env'], width: 3 },
      { accept: ['-p', '--publish'], width: 3 },
    ],
    hints: [
      'Conceito: cada opção do docker run tem uma letra.',
      'Raciocínio: segundo plano (detached), variável de ambiente (env) e porta (publish).',
      'Estrutura: -d, -e e -p.',
    ],
    solution: {
      code: 'docker run -d --name api --restart unless-stopped -e PORT=8080 -p 127.0.0.1:8080:8080 ghcr.io/voce/api:1.4.0',
      explanation: '-d roda em segundo plano, -e passa a variável e -p publica a porta (aqui só no localhost, para o proxy reverso acessar e a internet não).',
    },
  },
  {
    id: 'ex-infra-10-independente',
    type: 'true-false',
    title: 'Recriando o banco',
    difficulty: 'basico',
    concepts: ['infra-docker'],
    language: 'shell',
    statement: 'Avalie a afirmação sobre a sequência de comandos.',
    code: `docker run -d --name db -e POSTGRES_PASSWORD=segredo postgres:17
# ... a aplicação grava pedidos por uma semana ...
docker rm -f db
docker run -d --name db -e POSTGRES_PASSWORD=segredo postgres:17`,
    claim: 'Os pedidos continuam no banco depois de recriar o container, porque a imagem é a mesma.',
    answer: false,
    justifications: [
      { id: 'a', text: 'Sem um volume, os dados ficavam na camada gravável do container removido; o container novo começa com um banco vazio.' },
      { id: 'b', text: 'A imagem postgres:17 guarda os dados de todos os containers.' },
      { id: 'c', text: 'O docker rm -f faz backup automático.' },
      { id: 'd', text: 'É verdadeira: o PostgreSQL grava os dados direto no disco da VPS.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: a imagem é somente leitura; o que é gravado fica no container.', 'Raciocínio: o que aconteceu com o container antigo?', 'Estrutura: dados persistentes precisam de -v.'],
    solution: { explanation: 'Falso. Sem `-v pgdata:/var/lib/postgresql/data`, os dados viviam no container apagado pelo rm. Com o volume, o container novo encontraria os mesmos arquivos.' },
  },
];
