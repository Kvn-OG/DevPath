import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-05',
  trackId: 'infra',
  moduleId: 'infra-m2',
  title: 'Firewall e portas',
  durationMin: 25,
  objectives: [
    'Entender portas e quais delas um servidor web precisa expor.',
    'Configurar o UFW negando tudo por padrão.',
    'Ver quais programas escutam em quais portas.',
    'Conhecer a armadilha do Docker com o UFW e usar o firewall do provedor.',
  ],
  prerequisites: ['infra-04'],
  concepts: ['infra-firewall'],
  explanation: [
    {
      type: 'p',
      text: 'Cada serviço de rede escuta em uma **porta**: SSH na 22, HTTP na 80, HTTPS na 443, PostgreSQL na 5432. Um servidor web só precisa expor **22, 80 e 443**. Tudo o mais — banco, painéis internos, APIs internas — deve ficar inacessível de fora.',
    },
    { type: 'h', text: 'UFW' },
    {
      type: 'code',
      language: 'shell',
      code: `sudo ufw default deny incoming    # nega tudo que chega...
sudo ufw default allow outgoing   # ...e libera o que sai
sudo ufw allow OpenSSH            # NÃO esqueça, ou perde o acesso
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose`,
    },
    {
      type: 'p',
      text: 'Para ver quem está escutando: `sudo ss -tulpn`. Um serviço em `127.0.0.1:5432` só aceita conexões da própria máquina; em `0.0.0.0:5432`, de qualquer interface — e então só o firewall o protege.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Docker passa por cima do UFW',
      text: 'Quando um container publica uma porta (`-p 5432:5432`), o Docker cria regras próprias de iptables que **ignoram** as regras do UFW: o banco fica exposto à internet mesmo com o UFW negando tudo. Não publique portas de bancos; deixe-os acessíveis só na rede interna do Docker (ou publique em `127.0.0.1:5432:5432`). Use também o **firewall do painel do provedor**, que filtra antes de o tráfego chegar à VPS.',
    },
  ],
  analogy:
    'Portas são as entradas de um prédio: portaria (443), entrega de mercadorias (80), porta dos fundos da administração (22). O firewall tranca todas, menos as que precisam ficar abertas. E o Docker, por padrão, é aquele funcionário que abre uma porta lateral sem avisar a segurança.',
  example: {
    language: 'shell',
    code: `sudo ufw status verbose
sudo ss -tulpn | grep LISTEN`,
    lineByLine: [
      { line: 1, text: 'Mostra a política padrão e as regras ativas.' },
      { line: 2, text: 'Lista os programas escutando: o PostgreSQL está só em 127.0.0.1, inacessível de fora.' },
    ],
    output: `Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp (OpenSSH)           ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
tcp   LISTEN 0  4096    0.0.0.0:22         0.0.0.0:*   users:(("sshd",pid=812,fd=3))
tcp   LISTEN 0  4096    0.0.0.0:443        0.0.0.0:*   users:(("docker-proxy",pid=1904,fd=4))
tcp   LISTEN 0  4096    0.0.0.0:80         0.0.0.0:*   users:(("docker-proxy",pid=1921,fd=4))
tcp   LISTEN 0  200   127.0.0.1:5432       0.0.0.0:*   users:(("postgres",pid=1650,fd=6))`,
  },
  commonErrors: [
    {
      title: 'Ativar o UFW sem liberar o SSH',
      wrong: 'sudo ufw default deny incoming\nsudo ufw enable',
      why: 'A conexão SSH atual e as próximas são bloqueadas.',
      fix: '`sudo ufw allow OpenSSH` antes do enable. Se já aconteceu, use o console do provedor.',
    },
    {
      title: 'Banco publicado pelo Docker',
      wrong: 'docker run -p 5432:5432 -e POSTGRES_PASSWORD=123 postgres',
      why: 'A porta fica aberta para a internet apesar do UFW; robôs procuram PostgreSQL com senha fraca o tempo todo.',
      fix: 'Não publique a porta (use a rede interna) ou publique só em 127.0.0.1: `-p 127.0.0.1:5432:5432`.',
    },
    {
      title: 'Liberar portas "para testar" e esquecer',
      wrong: 'sudo ufw allow 3000',
      why: 'Painéis e aplicações de teste ficam expostos sem HTTPS e sem autenticação forte.',
      fix: 'Remova a regra depois (`sudo ufw delete allow 3000`) e acesse via domínio com HTTPS.',
    },
  ],
  guidedExerciseId: 'ex-infra-05-guiado',
  independentExerciseId: 'ex-infra-05-independente',
  reviewQuestions: [
    { question: 'Quais portas um servidor web precisa expor?', answer: '22 (SSH, de preferência restrita), 80 (HTTP) e 443 (HTTPS).' },
    { question: 'Qual a diferença entre um serviço escutando em 127.0.0.1 e em 0.0.0.0?', answer: '127.0.0.1 aceita só conexões da própria máquina; 0.0.0.0 aceita de qualquer interface, inclusive da internet.' },
    { question: 'Por que o UFW não protege portas publicadas pelo Docker?', answer: 'Porque o Docker cria regras de iptables próprias que são avaliadas antes das regras do UFW.' },
  ],
  summary: [
    'Exponha só 22, 80 e 443.',
    'UFW: deny incoming, allow OpenSSH, 80 e 443, enable.',
    'ss -tulpn mostra quem escuta onde.',
    'Docker ignora o UFW: não publique portas de bancos; use também o firewall do provedor.',
  ],
  completionCriteria: ['Ordenar a ativação do firewall sem perder o SSH (exercício guiado).', 'Diagnosticar um banco exposto pelo Docker (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-05-guiado',
    type: 'order-steps',
    title: 'Ligando o firewall',
    difficulty: 'basico',
    concepts: ['infra-firewall'],
    statement: 'Ordene os comandos para ativar o UFW em uma VPS acessada por SSH, que servirá um site com HTTPS.',
    steps: [
      { id: 'a', text: 'sudo ufw default deny incoming' },
      { id: 'b', text: 'sudo ufw allow OpenSSH' },
      { id: 'c', text: 'sudo ufw allow 80/tcp e sudo ufw allow 443/tcp' },
      { id: 'd', text: 'sudo ufw enable' },
      { id: 'e', text: 'sudo ufw status verbose, para conferir.' },
    ],
    hints: ['Conceito: defina a política, libere o necessário, ative e confira.', 'Raciocínio: o SSH precisa estar liberado antes de o firewall ser ativado.', 'Estrutura: política → SSH → web → enable → status.'],
    solution: { explanation: 'Com a política padrão definida e as regras de SSH, HTTP e HTTPS criadas, o enable não derruba a sua sessão. O status confirma o resultado.' },
  },
  {
    id: 'ex-infra-05-independente',
    type: 'multiple-choice',
    title: 'O banco que estava aberto',
    difficulty: 'intermediario',
    concepts: ['infra-firewall'],
    language: 'shell',
    statement: 'O UFW nega tudo menos 22, 80 e 443, mas um scanner externo encontrou o PostgreSQL aberto na porta 5432. O banco foi criado assim. O que explica e o que corrige?',
    code: 'docker run -d --name db -p 5432:5432 -e POSTGRES_PASSWORD=segredo postgres:17',
    options: [
      { id: 'a', text: 'O UFW está desligado; basta rodar ufw enable de novo.', feedback: 'Mesmo ativo, o UFW não filtra portas publicadas pelo Docker.' },
      {
        id: 'b',
        text: 'O Docker cria regras de iptables que contornam o UFW. Remova o -p (use a rede interna do Docker) ou publique só em 127.0.0.1:5432:5432, e bloqueie a porta também no firewall do provedor.',
        feedback: 'Correto: a publicação de portas do Docker passa por cima do UFW.',
      },
      { id: 'c', text: 'Trocar a porta para 15432 resolve.', feedback: 'Scanners varrem todas as portas; esconder não é proteger.' },
      { id: 'd', text: 'Usar uma senha mais forte e manter a porta aberta.', feedback: 'Ajuda, mas o banco continua exposto a ataques e a falhas futuras.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: Docker e UFW mexem nas mesmas regras de rede do Linux.', 'Raciocínio: o que o -p 5432:5432 faz com a porta?', 'Estrutura: não publique a porta, ou publique só no localhost.'],
    solution: { explanation: 'O `-p 5432:5432` publica a porta em todas as interfaces e o Docker cria regras de iptables avaliadas antes das do UFW. Bancos devem ficar na rede interna dos containers; quem precisa acessá-los (a API) está na mesma rede.' },
  },
];
