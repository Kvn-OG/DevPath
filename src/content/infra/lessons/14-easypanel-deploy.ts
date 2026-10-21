import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-14',
  trackId: 'infra',
  moduleId: 'infra-m5',
  title: 'Deploy de uma aplicação no EasyPanel',
  durationMin: 30,
  objectives: [
    'Criar um serviço App a partir de um repositório GitHub, de uma imagem ou de um Dockerfile.',
    'Escolher o método de build: Dockerfile, Nixpacks, Railpack ou Buildpacks.',
    'Configurar variáveis de ambiente, domínio e porta de destino.',
    'Ativar o deploy automático e acompanhar logs e implantações.',
  ],
  prerequisites: ['infra-13'],
  concepts: ['infra-deploy'],
  explanation: [
    { type: 'h', text: 'De onde vem a aplicação' },
    {
      type: 'list',
      items: [
        '**GitHub**: dono/repositório, branch e caminho de build. O painel clona e faz o build no servidor.',
        '**Imagem Docker**: `ghcr.io/voce/api:1.4.0` — o build foi feito antes (por exemplo, no GitHub Actions) e o servidor só baixa e roda. É o caminho mais leve para VPS pequenas.',
        '**Git** (via SSH, com chave de deploy), **upload** de arquivo compactado ou **Dockerfile** escrito no próprio painel.',
      ],
    },
    { type: 'h', text: 'Como o build é feito' },
    {
      type: 'list',
      items: [
        '**Dockerfile**: o seu Dockerfile (aula 11) — previsível, recomendado para produção.',
        '**Nixpacks** ou **Railpack**: detectam a linguagem (Node, Go, Python...) e montam a imagem sozinhos, com opções para os comandos de instalação, build e start.',
        '**Buildpacks**: o mesmo princípio, com construtores Cloud Native Buildpacks.',
      ],
    },
    { type: 'h', text: 'Configuração' },
    {
      type: 'list',
      items: [
        '**Environment**: variáveis no formato `.env` (`DATABASE_URL=...`, `NODE_ENV=production`). Ficam disponíveis no build e na execução. Salvar não aplica: é preciso clicar em **Deploy**.',
        '**Domains**: o nome (`api.minhaloja.com.br`), o caminho e a **porta de destino**, que precisa ser a porta em que a aplicação escuta **dentro do container**. Com o DNS apontando, o HTTPS é emitido automaticamente.',
        'A aplicação deve escutar em `0.0.0.0` (todas as interfaces do container), e não em `127.0.0.1`, senão o proxy não a alcança.',
        '**Mounts**: volumes para arquivos que precisam persistir (uploads), como na aula 12.',
      ],
    },
    { type: 'h', text: 'Deploys' },
    {
      type: 'p',
      text: 'Na aba de implantações, o histórico mostra cada deploy e seus logs de build. Para fontes do GitHub, o **auto deploy** cria um webhook que faz um deploy novo a cada push na branch. Há também uma URL secreta de disparo (*deployment trigger*), útil para o CI chamar depois de publicar uma imagem. Os **logs** e o **shell** do serviço ajudam no diagnóstico.',
    },
  ],
  analogy:
    'Configurar um serviço no EasyPanel é preencher a ficha de admissão de um funcionário: de onde ele vem (repositório ou imagem), como foi treinado (método de build), o que precisa saber (variáveis), em que sala atende (porta) e qual o ramal externo (domínio). A cada push, o painel "contrata" a versão nova e dispensa a antiga.',
  example: {
    language: 'shell',
    code: `# Variáveis do serviço "api" (aba Environment)
NODE_ENV=production
PORT=8080
DATABASE_URL=postgres://postgres:<senha>@<host-interno>:5432/loja?sslmode=disable

# Domínio (aba Domains): api.minhaloja.com.br → porta 8080
# Depois do Deploy, de qualquer lugar:
curl -s https://api.minhaloja.com.br/saude`,
    lineByLine: [
      { line: 3, text: 'A aplicação lê a porta da variável PORT e escuta em 0.0.0.0:8080.' },
      { line: 4, text: 'A URL interna do banco, copiada da aba Credentials do serviço Postgres (próxima aula).' },
      { line: 6, text: 'A porta de destino do domínio é a mesma da variável PORT.' },
      { line: 8, text: 'O proxy do painel recebe na 443, com certificado, e repassa para a 8080 do container.' },
    ],
    output: `{"status":"ok","banco":"conectado"}`,
  },
  commonErrors: [
    {
      title: 'Porta de destino diferente da porta da aplicação',
      why: 'O proxy encaminha para uma porta em que nada escuta: 502 Bad Gateway.',
      fix: 'Confira no log em que porta a aplicação subiu e use a mesma no domínio.',
    },
    {
      title: 'Aplicação escutando em 127.0.0.1',
      wrong: 'app.listen(8080, "127.0.0.1")',
      why: 'Dentro do container, 127.0.0.1 só aceita conexões do próprio container; o proxy está em outro.',
      fix: 'Escute em 0.0.0.0 (no Node, `app.listen(8080)` já faz isso; em Go, `":8080"`).',
    },
    {
      title: 'Mudar uma variável e esperar que valha',
      why: 'Salvar a configuração não reinicia o serviço.',
      fix: 'Clique em Deploy depois de alterar variáveis, domínios ou volumes.',
    },
  ],
  guidedExerciseId: 'ex-infra-14-guiado',
  independentExerciseId: 'ex-infra-14-independente',
  reviewQuestions: [
    { question: 'Qual a vantagem de publicar uma imagem pronta em vez de fazer o build no servidor?', answer: 'O servidor não gasta CPU e memória com builds; só baixa e roda a imagem, o que é mais rápido e previsível.' },
    { question: 'O que a porta de destino de um domínio precisa ser?', answer: 'A porta em que a aplicação escuta dentro do container.' },
    { question: 'Como fazer um deploy a cada push no GitHub?', answer: 'Ativando o auto deploy do serviço, que cria um webhook no repositório (ou chamando a URL de disparo pelo CI).' },
  ],
  summary: [
    'Fontes: GitHub, Git, imagem Docker, upload ou Dockerfile.',
    'Builds: Dockerfile, Nixpacks, Railpack ou Buildpacks.',
    'Environment + Deploy; domínio com a porta interna certa; escutar em 0.0.0.0.',
    'Auto deploy, histórico, logs e shell para operar.',
  ],
  completionCriteria: ['Ordenar o primeiro deploy de uma API (exercício guiado).', 'Diagnosticar um 502 depois do deploy (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-14-guiado',
    type: 'order-steps',
    title: 'Primeiro deploy da API',
    difficulty: 'basico',
    concepts: ['infra-deploy'],
    statement: 'Ordene os passos para colocar a API do repositório `voce/api` no ar em `api.minhaloja.com.br` pelo EasyPanel.',
    steps: [
      { id: 'a', text: 'Criar (ou abrir) o projeto loja e adicionar um serviço App.' },
      { id: 'b', text: 'Escolher a fonte GitHub (voce/api, branch main) e o build por Dockerfile.' },
      { id: 'c', text: 'Preencher as variáveis de ambiente (PORT, DATABASE_URL...).' },
      { id: 'd', text: 'Adicionar o domínio api.minhaloja.com.br com a porta de destino 8080.' },
      { id: 'e', text: 'Clicar em Deploy e acompanhar os logs de build e de execução.' },
      { id: 'f', text: 'Testar https://api.minhaloja.com.br e ativar o auto deploy.' },
    ],
    hints: ['Conceito: serviço → fonte → configuração → deploy → verificação.', 'Raciocínio: as variáveis e o domínio precisam estar prontos antes do deploy que vai valer.', 'Estrutura: criar, fonte/build, variáveis, domínio, deploy, testar.'],
    solution: { explanation: 'Com o serviço criado, defina de onde vem o código e como fazer o build, configure o ambiente e o domínio, faça o deploy olhando os logs e, depois de testar, automatize os próximos deploys.' },
  },
  {
    id: 'ex-infra-14-independente',
    type: 'multiple-choice',
    title: 'Funciona no log, 502 no navegador',
    difficulty: 'intermediario',
    concepts: ['infra-deploy', 'infra-proxy'],
    language: 'shell',
    statement: 'O deploy terminou, o log da API mostra a linha abaixo, mas o domínio responde 502. O domínio está configurado com a porta de destino 8080.',
    code: 'Servidor ouvindo em http://127.0.0.1:8080',
    options: [
      { id: 'a', text: 'O certificado ainda está sendo emitido.', feedback: 'Problemas de certificado geram erros de TLS no navegador, não 502.' },
      { id: 'b', text: 'A API escuta só em 127.0.0.1 dentro do container; o proxy, em outro container, não a alcança. Faça-a escutar em 0.0.0.0.', feedback: 'Correto: dentro do container, 127.0.0.1 só aceita conexões dele mesmo.' },
      { id: 'c', text: 'É preciso publicar a porta 8080 no firewall.', feedback: 'O tráfego chega pelo proxy na 443; a 8080 é interna.' },
      { id: 'd', text: 'Trocar a porta de destino para 443.', feedback: 'A aplicação não escuta na 443; o proxy é quem cuida dela.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: cada container tem seu próprio localhost.', 'Raciocínio: o proxy está no mesmo container da API?', 'Estrutura: a documentação do painel pede que a aplicação escute em 0.0.0.0.'],
    solution: { explanation: 'O proxy fala com a API pela rede interna do Docker, e não pelo localhost do container dela. Escutando em 0.0.0.0:8080 (todas as interfaces), a API passa a receber as requisições e o 502 some.' },
  },
];
