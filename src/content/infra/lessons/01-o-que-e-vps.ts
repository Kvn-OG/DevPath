import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-01',
  trackId: 'infra',
  moduleId: 'infra-m1',
  title: 'O que é uma VPS e quando usar uma',
  durationMin: 20,
  objectives: [
    'Explicar o que é uma VPS e como ela se compara a hospedagem compartilhada, plataformas gerenciadas e serverless.',
    'Escolher provedor, plano (vCPU, RAM, disco) e região.',
    'Reconhecer o que passa a ser sua responsabilidade ao usar uma VPS.',
  ],
  prerequisites: [],
  concepts: ['infra-vps'],
  explanation: [
    {
      type: 'p',
      text: 'Uma **VPS** (*virtual private server*) é uma máquina virtual em um data center, com uma fatia reservada de CPU, memória e disco, e um IP público. Você recebe acesso de administrador (root) a um Linux limpo e instala o que quiser: banco de dados, APIs, painéis, filas.',
    },
    { type: 'h', text: 'As opções de hospedagem' },
    {
      type: 'list',
      items: [
        '**Hospedagem compartilhada**: barata e simples, mas limitada a PHP/sites estáticos; você não controla o servidor.',
        '**Plataformas gerenciadas** (Vercel, Render, Railway, Supabase): você envia o código e elas cuidam do servidor, HTTPS, escala e backups. Rápido e confortável; o custo cresce com o uso.',
        '**Serverless** (funções que sobem sob demanda): ótimo para tráfego irregular, mas com limites de tempo de execução e cuidados com conexões ao banco (aula 24 da Trilha 5).',
        '**VPS**: custo fixo e baixo, controle total, várias aplicações e bancos na mesma máquina. Em troca, segurança, atualizações, backups e monitoramento são **seus**.',
      ],
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Nesta trilha',
      text: 'Você vai preparar uma VPS do zero e publicar uma API com PostgreSQL usando Docker e o **EasyPanel**, um painel que automatiza deploy, domínios e HTTPS. Os comandos rodam no terminal da sua VPS (ou no WSL/Linux do seu computador); o DevPath não executa comandos de sistema.',
    },
    { type: 'h', text: 'Escolhendo o plano' },
    {
      type: 'list',
      items: [
        '**RAM** é o recurso que mais limita: para EasyPanel + uma API + PostgreSQL, comece com **2 a 4 GB**.',
        '**vCPU**: 2 é um bom começo. **Disco SSD/NVMe**: 40 GB ou mais (imagens Docker e backups ocupam espaço).',
        '**Região**: perto dos usuários. Para o Brasil, São Paulo reduz a latência; regiões nos EUA ou na Europa costumam ser mais baratas.',
        '**Sistema**: Ubuntu Server LTS (versões de suporte longo, como 24.04) é o mais documentado.',
        'Provedores comuns: Hetzner, DigitalOcean, Vultr, Contabo, Hostinger, Magalu Cloud, AWS Lightsail. Compare preço, região e se há **snapshots** e **firewall** no painel do provedor.',
      ],
    },
  ],
  analogy:
    'Plataformas gerenciadas são como morar em um hotel: limpeza, segurança e manutenção inclusas, e você paga por diária. Uma VPS é alugar um apartamento vazio: muito mais barato por mês e do seu jeito, mas trancar a porta, consertar o chuveiro e pagar o seguro é com você.',
  example: {
    language: 'shell',
    code: `# Primeiros comandos em uma VPS nova: o que eu contratei?
cat /etc/os-release | head -2
nproc
free -h
df -h /`,
    lineByLine: [
      { line: 2, text: 'Qual sistema e versão estão instalados.' },
      { line: 3, text: 'Quantos núcleos de CPU (vCPUs) a máquina tem.' },
      { line: 4, text: 'Memória total, usada e disponível, em unidades legíveis (-h).' },
      { line: 5, text: 'Espaço em disco da partição principal.' },
    ],
    output: `PRETTY_NAME="Ubuntu 24.04.3 LTS"
NAME="Ubuntu"
2
               total        used        free      shared  buff/cache   available
Mem:           3.8Gi       412Mi       2.9Gi       1.0Mi       680Mi       3.4Gi
Swap:             0B          0B          0B
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        75G  2.1G   70G   3% /`,
  },
  commonErrors: [
    {
      title: 'Contratar a menor máquina possível',
      why: 'Com 512 MB ou 1 GB de RAM, Docker, painel, aplicação e banco disputam memória; o sistema mata processos (OOM) e tudo fica instável.',
      fix: 'Comece com 2 a 4 GB para o conjunto desta trilha e acompanhe o uso real.',
    },
    {
      title: 'Achar que a VPS "se cuida sozinha"',
      why: 'Ninguém atualiza o sistema, faz backup ou bloqueia ataques por você.',
      fix: 'Reserve tempo para segurança e operação (módulos 2 e 6 desta trilha).',
    },
    {
      title: 'Banco de produção em uma VPS sem backup externo',
      why: 'Se o disco ou a conta tiverem problemas, os dados se vão junto com a máquina.',
      fix: 'Backups automáticos para fora da VPS desde o primeiro dia.',
    },
  ],
  guidedExerciseId: 'ex-infra-01-guiado',
  independentExerciseId: 'ex-infra-01-independente',
  reviewQuestions: [
    { question: 'O que muda de responsabilidade ao trocar uma plataforma gerenciada por uma VPS?', answer: 'Segurança do servidor, atualizações, backups, monitoramento e configuração de HTTPS passam a ser seus.' },
    { question: 'Qual recurso costuma limitar primeiro uma VPS pequena?', answer: 'A memória RAM.' },
    { question: 'Por que escolher a região perto dos usuários?', answer: 'Para reduzir a latência: cada requisição percorre uma distância menor.' },
  ],
  summary: [
    'VPS = máquina virtual com IP público e acesso root.',
    'Custo fixo e controle total, em troca de responsabilidade operacional.',
    'Comece com 2–4 GB de RAM, 2 vCPUs, SSD e Ubuntu LTS.',
    'Região perto dos usuários; provedor com snapshots e firewall.',
  ],
  completionCriteria: ['Escolher a hospedagem certa para um cenário (exercício guiado).', 'Ordenar os primeiros passos com uma VPS nova (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-01-guiado',
    type: 'multiple-choice',
    title: 'Onde hospedar?',
    difficulty: 'iniciante',
    concepts: ['infra-vps'],
    statement:
      'Uma pequena empresa tem uma API em Go, um PostgreSQL e um painel interno, com tráfego estável o mês todo. O orçamento é apertado e a equipe quer aprender a operar servidores. Qual opção faz mais sentido?',
    options: [
      { id: 'a', text: 'Hospedagem compartilhada de sites.', feedback: 'Não roda APIs em Go nem um PostgreSQL próprio.' },
      { id: 'b', text: 'Uma VPS com Docker e um painel como o EasyPanel.', feedback: 'Correto: custo fixo baixo para várias aplicações e banco, com controle total.' },
      { id: 'c', text: 'Funções serverless para tudo, inclusive o banco.', feedback: 'Bancos não rodam em funções serverless; e o tráfego estável não aproveita a escala sob demanda.' },
      { id: 'd', text: 'Um servidor físico no escritório.', feedback: 'Energia, internet e hardware viram problemas da empresa; uma VPS resolve isso.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: cada tipo de hospedagem tem um perfil de custo e controle.', 'Raciocínio: tráfego estável + orçamento apertado + vontade de operar.', 'Estrutura: custo fixo e várias aplicações na mesma máquina.'],
    solution: { explanation: 'Com tráfego estável, uma VPS de custo fixo roda a API, o banco e o painel juntos. Plataformas gerenciadas também funcionariam, a um custo maior; serverless não hospeda o banco.' },
  },
  {
    id: 'ex-infra-01-independente',
    type: 'order-steps',
    title: 'Primeiro dia com a VPS',
    difficulty: 'iniciante',
    concepts: ['infra-vps'],
    statement: 'Ordene os primeiros passos depois de decidir usar uma VPS.',
    steps: [
      { id: 'a', text: 'Comparar provedores e escolher região e plano (RAM, vCPU, disco).' },
      { id: 'b', text: 'Criar a VPS com Ubuntu LTS e cadastrar sua chave SSH pública.' },
      { id: 'c', text: 'Entrar por SSH e conferir sistema, CPU, memória e disco.' },
      { id: 'd', text: 'Atualizar o sistema e aplicar as configurações de segurança.' },
      { id: 'e', text: 'Instalar Docker e o EasyPanel para publicar as aplicações.' },
    ],
    hints: ['Conceito: primeiro a máquina, depois o acesso, depois a segurança, por último as aplicações.', 'Raciocínio: não se instala nada antes de proteger o servidor.', 'Estrutura: escolher → criar → acessar → proteger → instalar.'],
    solution: { explanation: 'Escolha e crie a máquina (já com chave SSH), confira o que recebeu, proteja e atualize o sistema e só então instale a plataforma de deploy.' },
  },
];
