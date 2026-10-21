import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-13',
  trackId: 'infra',
  moduleId: 'infra-m5',
  title: 'O que é o EasyPanel e como instalá-lo',
  durationMin: 25,
  objectives: [
    'Explicar o que o EasyPanel faz por baixo: Docker Swarm e um proxy com HTTPS automático.',
    'Preparar a VPS e instalar o EasyPanel.',
    'Criar o usuário administrador e colocar o painel em um domínio com HTTPS.',
    'Entender a organização em projetos e serviços.',
  ],
  prerequisites: ['infra-12'],
  concepts: ['infra-easypanel'],
  explanation: [
    {
      type: 'p',
      text: 'O **EasyPanel** é um painel web para servidores que roda sobre o **Docker**. Ele faz pela interface o que você aprendeu no terminal: cria containers, volumes e redes, faz o build das suas aplicações a partir do GitHub, configura domínios no proxy reverso (que obtém certificados do Let\'s Encrypt sozinho) e cria bancos de dados com backups agendados. É uma alternativa às plataformas gerenciadas, rodando na **sua** VPS.',
    },
    { type: 'h', text: 'Antes de instalar' },
    {
      type: 'list',
      items: [
        'Uma VPS **Ubuntu limpa**, com pelo menos **2 GB de RAM** e acesso root ou sudo.',
        'As portas **80 e 443 livres** (nada de Nginx ou Apache instalado antes): o proxy do EasyPanel vai ocupá-las.',
        'As aulas de segurança aplicadas: usuário com sudo, SSH só com chave, firewall liberando 22, 80 e 443.',
        'Um subdomínio para o painel, como `painel.minhaloja.com.br`, com registro A apontando para a VPS.',
      ],
    },
    {
      type: 'code',
      language: 'shell',
      code: `# Instalação pelo script oficial (instala o Docker se precisar)
curl -sSL https://get.easypanel.io | sh

# Ou, com o Docker já instalado:
docker run --rm -it \\
  -v /etc/easypanel:/etc/easypanel \\
  -v /var/run/docker.sock:/var/run/docker.sock:ro \\
  easypanel/easypanel setup`,
    },
    {
      type: 'p',
      text: 'O instalador ativa o **Docker Swarm** (o modo de orquestração do Docker, com um único servidor) e inicia o painel. Ao terminar, acesse `http://IP-DA-VPS:3000` e crie a conta de administrador. A partir daí, nas configurações do painel, defina o domínio dele (`painel.minhaloja.com.br`) para acessá-lo com HTTPS.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A porta 3000 é temporária',
      text: 'O primeiro acesso pela porta 3000 é por HTTP, sem criptografia: crie o administrador com uma senha forte logo após a instalação, configure o domínio com HTTPS e, depois, **não** deixe a 3000 liberada no firewall do provedor. Ative também a autenticação em dois fatores, se disponível.',
    },
    { type: 'h', text: 'Projetos e serviços' },
    {
      type: 'list',
      items: [
        'Um **projeto** agrupa o que pertence a um mesmo sistema: `loja` contém a API, o front-end e o banco.',
        'Cada **serviço** é um container gerenciado: **App** (sua aplicação, de um repositório GitHub, uma imagem Docker ou um Dockerfile), bancos (**Postgres**, MySQL, MongoDB, Redis) e **templates** prontos (como Uptime Kuma e n8n).',
        'Serviços do mesmo projeto se enxergam pela rede interna; o banco nem precisa ser exposto.',
      ],
    },
  ],
  analogy:
    'O EasyPanel é um gerente de obras para a sua VPS: você diz "quero esta aplicação, neste domínio, com este banco" e ele contrata os operários certos (Docker, proxy, Let\'s Encrypt) e acompanha o trabalho. Você continua dono do terreno — e precisa saber o que eles estão fazendo, que é o que as aulas anteriores ensinaram.',
  example: {
    language: 'shell',
    code: `# Depois da instalação, confira:
docker info --format "{{.Swarm.LocalNodeState}}"
curl -s -o /dev/null -w "%{http_code}\\n" http://localhost:3000`,
    lineByLine: [
      { line: 2, text: 'O instalador ativou o Docker Swarm: o estado do nó é active.' },
      { line: 3, text: 'O painel responde na porta 3000 (código 200, ou um 3xx se redirecionar para o login). Agora acesse http://IP-DA-VPS:3000 para criar o administrador.' },
    ],
    output: `active
200`,
  },
  commonErrors: [
    {
      title: 'Instalar em uma VPS que já tem Nginx ou Apache',
      why: 'As portas 80 e 443 estão ocupadas e o proxy do EasyPanel não consegue subir.',
      fix: 'Use uma VPS limpa, ou remova o servidor web existente antes (migrando os sites para o EasyPanel).',
    },
    {
      title: 'Deixar o painel acessível por HTTP na porta 3000',
      why: 'A senha do administrador trafega sem criptografia e o painel fica exposto a tentativas de acesso.',
      fix: 'Configure o domínio do painel com HTTPS e bloqueie a porta 3000 no firewall do provedor.',
    },
    {
      title: 'VPS com 1 GB de RAM',
      why: 'Painel, proxy, builds e banco não cabem; builds falham e containers são mortos por falta de memória.',
      fix: 'Pelo menos 2 GB; 4 GB se for fazer builds de front-end no próprio servidor.',
    },
  ],
  guidedExerciseId: 'ex-infra-13-guiado',
  independentExerciseId: 'ex-infra-13-independente',
  reviewQuestions: [
    { question: 'O que o EasyPanel usa por baixo para rodar as aplicações?', answer: 'Docker (em modo Swarm) e um proxy reverso que emite certificados HTTPS automaticamente.' },
    { question: 'Por que as portas 80 e 443 precisam estar livres?', answer: 'Porque o proxy do EasyPanel precisa ocupá-las para receber o tráfego web e emitir certificados.' },
    { question: 'O que é um projeto no EasyPanel?', answer: 'Um agrupamento de serviços (aplicações e bancos) de um mesmo sistema, que se comunicam pela rede interna.' },
  ],
  summary: [
    'EasyPanel = painel sobre Docker Swarm, com proxy e HTTPS automáticos.',
    'Ubuntu limpo, 2 GB+, portas 80/443 livres, segurança já aplicada.',
    'Instale, crie o admin na porta 3000 e mude para um domínio com HTTPS.',
    'Projetos agrupam serviços: apps, bancos e templates.',
  ],
  completionCriteria: ['Ordenar a instalação do EasyPanel (exercício guiado).', 'Diagnosticar uma instalação que falhou (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-13-guiado',
    type: 'order-steps',
    title: 'Instalando o painel',
    difficulty: 'basico',
    concepts: ['infra-easypanel'],
    statement: 'Ordene a instalação do EasyPanel em uma VPS nova até o painel ficar acessível com HTTPS.',
    steps: [
      { id: 'a', text: 'Aplicar a segurança básica: usuário com sudo, SSH com chave, firewall com 22, 80 e 443.' },
      { id: 'b', text: 'Criar o registro A de painel.minhaloja.com.br apontando para a VPS.' },
      { id: 'c', text: 'Rodar o instalador oficial do EasyPanel.' },
      { id: 'd', text: 'Acessar http://IP:3000 e criar o administrador com uma senha forte.' },
      { id: 'e', text: 'Configurar o domínio do painel com HTTPS e fechar a porta 3000 no firewall do provedor.' },
    ],
    hints: ['Conceito: segurança antes de instalar; HTTPS antes de usar no dia a dia.', 'Raciocínio: o domínio do painel precisa resolver antes de pedir o certificado.', 'Estrutura: proteger → DNS → instalar → admin → domínio com HTTPS.'],
    solution: { explanation: 'Proteja o servidor, deixe o DNS pronto, instale, crie o administrador imediatamente e mova o painel para o domínio com HTTPS, deixando de usar a porta 3000.' },
  },
  {
    id: 'ex-infra-13-independente',
    type: 'multiple-choice',
    title: 'O proxy que não sobe',
    difficulty: 'intermediario',
    concepts: ['infra-easypanel', 'infra-proxy'],
    language: 'shell',
    statement: 'A VPS já tinha um site em Nginx. Depois de instalar o EasyPanel, os domínios configurados no painel não abrem. Você encontra:',
    code: `$ sudo ss -tulpn | grep -E ":(80|443) "
tcp LISTEN 0 511 0.0.0.0:80   0.0.0.0:* users:(("nginx",pid=902,fd=6))
tcp LISTEN 0 511 0.0.0.0:443  0.0.0.0:* users:(("nginx",pid=902,fd=7))`,
    options: [
      { id: 'a', text: 'O DNS dos domínios ainda não propagou.', feedback: 'O sintoma aponta para outro processo ocupando as portas na VPS.' },
      { id: 'b', text: 'O Nginx ocupa as portas 80 e 443, e o proxy do EasyPanel não consegue usá-las. Migre o site e desative o Nginx.', feedback: 'Correto: só um programa pode escutar em cada porta.' },
      { id: 'c', text: 'O EasyPanel só funciona na porta 3000.', feedback: 'A 3000 é só do painel na instalação; os sites usam 80 e 443.' },
      { id: 'd', text: 'Falta liberar a porta 3000 no firewall.', feedback: 'Os sites não passam pela porta 3000.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: cada porta tem um único dono.', 'Raciocínio: quem está escutando nas portas 80 e 443?', 'Estrutura: o EasyPanel exige 80 e 443 livres.'],
    solution: { explanation: 'O Nginx antigo segura as portas 80 e 443. Recrie o site como um serviço no EasyPanel (ou como um container), pare e desative o Nginx (`sudo systemctl disable --now nginx`) e o proxy do painel assume o tráfego.' },
  },
];
