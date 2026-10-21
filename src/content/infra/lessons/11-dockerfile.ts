import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-11',
  trackId: 'infra',
  moduleId: 'infra-m4',
  title: 'Dockerfile: empacotando a sua aplicação',
  durationMin: 30,
  objectives: [
    'Escrever um Dockerfile com FROM, WORKDIR, COPY, RUN, ENV, EXPOSE e CMD.',
    'Aproveitar o cache de camadas para builds rápidos.',
    'Usar .dockerignore e build em dois estágios.',
    'Rodar a aplicação com um usuário sem privilégios.',
  ],
  prerequisites: ['infra-10'],
  concepts: ['infra-dockerfile'],
  explanation: [
    {
      type: 'p',
      text: 'O **Dockerfile** é a receita da imagem: cada instrução gera uma **camada**. `docker build -t api:1.0 .` lê o Dockerfile da pasta atual e monta a imagem.',
    },
    {
      type: 'list',
      items: [
        '`FROM node:22-alpine`: a imagem base.',
        '`WORKDIR /app`: a pasta de trabalho dentro da imagem.',
        '`COPY origem destino`: copia arquivos do seu projeto para a imagem.',
        '`RUN comando`: executa durante o build (instalar dependências, compilar).',
        '`ENV NODE_ENV=production`: variável de ambiente padrão.',
        '`EXPOSE 3000`: documenta a porta que a aplicação usa (não publica nada sozinho).',
        '`USER node`: a partir daqui, roda como um usuário comum, não como root.',
        '`CMD ["node", "server.js"]`: o comando que inicia o container.',
      ],
    },
    { type: 'h', text: 'Cache de camadas' },
    {
      type: 'p',
      text: 'O Docker reaproveita camadas que não mudaram. Por isso, copie primeiro só os arquivos de dependências (`package.json` e `package-lock.json`, ou `go.mod` e `go.sum`), instale, e só depois copie o resto do código. Mudou uma linha do código? A camada das dependências vem do cache e o build leva segundos.',
    },
    {
      type: 'p',
      text: 'O arquivo **.dockerignore** lista o que não deve ir para a imagem: `node_modules`, `.git`, `.env`, `dist`. Isso deixa o build mais rápido e evita vazar segredos para dentro da imagem.',
    },
    { type: 'h', text: 'Dois estágios' },
    {
      type: 'p',
      text: 'Em linguagens compiladas (ou front-ends com build), um estágio compila e outro, mínimo, só recebe o resultado — como o Dockerfile de Go da aula 15 da Trilha 10. Imagem menor, menos vulnerabilidades e nenhum compilador em produção.',
    },
  ],
  analogy:
    'O Dockerfile é a receita escrita passo a passo, e o cache de camadas é ter os ingredientes já picados na geladeira: se você só mudou o tempero final, não precisa descascar tudo de novo. Por isso o que muda menos (as dependências) vem primeiro na receita.',
  example: {
    language: 'shell',
    code: `# Dockerfile de uma API Node.js
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]`,
    lineByLine: [
      { line: 2, text: 'Base pequena (Alpine) com o Node 22.' },
      { line: 5, text: 'Só os arquivos de dependências: esta camada muda raramente e fica em cache.' },
      { line: 6, text: 'npm ci instala exatamente o que está no lock, sem as dependências de desenvolvimento.' },
      { line: 8, text: 'Agora o código; mudanças aqui não refazem o npm ci.' },
      { line: 10, text: 'A imagem oficial do Node já tem o usuário node, sem privilégios.' },
      { line: 12, text: 'O formato em lista (exec form) faz o node ser o processo principal e receber os sinais de parada.' },
    ],
    output: `$ docker build -t api:1.0 .
[+] Building 14.2s (10/10) FINISHED
 => [1/5] FROM docker.io/library/node:22-alpine
 => [2/5] WORKDIR /app
 => [3/5] COPY package.json package-lock.json ./
 => [4/5] RUN npm ci --omit=dev
 => [5/5] COPY . .
 => exporting to image
 => => naming to docker.io/library/api:1.0`,
  },
  commonErrors: [
    {
      title: 'COPY . . antes de instalar as dependências',
      wrong: 'COPY . .\nRUN npm ci',
      why: 'Qualquer mudança no código invalida o cache e reinstala todas as dependências a cada build.',
      fix: 'Copie os arquivos de dependências primeiro, instale, depois copie o resto.',
    },
    {
      title: '.env dentro da imagem',
      wrong: 'COPY . .   # sem .dockerignore, com um .env na pasta',
      why: 'As senhas viram parte da imagem; quem tiver a imagem tem as senhas.',
      fix: 'Liste .env no .dockerignore e passe a configuração em tempo de execução (variáveis do painel).',
    },
    {
      title: 'Rodar como root',
      why: 'Se a aplicação for explorada, o invasor tem root dentro do container, o que facilita escapar para o servidor.',
      fix: 'Use `USER` com um usuário sem privilégios.',
    },
  ],
  guidedExerciseId: 'ex-infra-11-guiado',
  independentExerciseId: 'ex-infra-11-independente',
  reviewQuestions: [
    { question: 'Por que copiar o package.json antes do restante do código?', answer: 'Para que a camada de instalação das dependências fique em cache quando só o código muda.' },
    { question: 'O EXPOSE publica a porta?', answer: 'Não. Ele só documenta; quem publica é o -p do docker run (ou o proxy/painel).' },
    { question: 'Para que serve o .dockerignore?', answer: 'Para impedir que arquivos desnecessários ou sensíveis (node_modules, .git, .env) entrem na imagem.' },
  ],
  summary: [
    'FROM, WORKDIR, COPY, RUN, ENV, USER, EXPOSE e CMD.',
    'Dependências primeiro, código depois: cache de camadas.',
    '.dockerignore para node_modules, .git e .env.',
    'Dois estágios e usuário sem privilégios em produção.',
  ],
  completionCriteria: ['Ordenar as instruções de um Dockerfile eficiente (exercício guiado).', 'Diagnosticar um build lento (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-11-guiado',
    type: 'order-steps',
    title: 'Dockerfile em ordem',
    difficulty: 'basico',
    concepts: ['infra-dockerfile'],
    statement: 'Ordene as instruções do Dockerfile de uma API Node.js para aproveitar o cache e rodar sem root.',
    steps: [
      { id: 'a', text: 'FROM node:22-alpine' },
      { id: 'b', text: 'WORKDIR /app' },
      { id: 'c', text: 'COPY package.json package-lock.json ./' },
      { id: 'd', text: 'RUN npm ci --omit=dev' },
      { id: 'e', text: 'COPY . .' },
      { id: 'f', text: 'USER node' },
      { id: 'g', text: 'CMD ["node", "src/server.js"]' },
    ],
    hints: [
      'Conceito: a imagem base vem sempre primeiro, e o comando de início, por último.',
      'Raciocínio: o que muda raramente (dependências) deve vir antes do que muda sempre (código).',
      'Estrutura: base → pasta → dependências → instalação → código → usuário → comando.',
    ],
    solution: { explanation: 'Com os arquivos de dependências copiados e instalados antes do código, a camada do npm ci fica em cache. O USER vem depois das etapas que precisam de permissão para escrever na imagem, e o CMD fecha a receita.' },
  },
  {
    id: 'ex-infra-11-independente',
    type: 'multiple-choice',
    title: 'Build de 6 minutos',
    difficulty: 'intermediario',
    concepts: ['infra-dockerfile'],
    language: 'shell',
    statement: 'Toda mudança de uma linha no código faz o build demorar 6 minutos, sempre reinstalando as dependências. Qual a correção?',
    code: `FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci --omit=dev
CMD ["node", "src/server.js"]`,
    options: [
      { id: 'a', text: 'Trocar npm ci por npm install.', feedback: 'O problema não é o comando, e sim a ordem das camadas.' },
      { id: 'b', text: 'Copiar package.json e package-lock.json, rodar npm ci e só depois copiar o restante (COPY . .).', feedback: 'Correto: a camada das dependências passa a vir do cache quando só o código muda.' },
      { id: 'c', text: 'Usar a tag latest na imagem base.', feedback: 'Não afeta o cache e ainda deixa o build imprevisível.' },
      { id: 'd', text: 'Rodar o build com sudo.', feedback: 'Permissão não tem relação com cache.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: uma camada é refeita quando ela ou qualquer anterior muda.', 'Raciocínio: o COPY . . muda a cada alteração do código — e vem antes do npm ci.', 'Estrutura: dependências antes do código.'],
    solution: { explanation: 'Como o COPY . . vem antes, qualquer mudança no código invalida a camada do npm ci. Copiando só os arquivos de dependências antes, a instalação é reaproveitada do cache e o build cai para segundos.' },
  },
];
