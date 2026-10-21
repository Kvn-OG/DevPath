import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-17',
  trackId: 'infra',
  moduleId: 'infra-m6',
  title: 'Monitoramento, logs e disco cheio',
  durationMin: 25,
  objectives: [
    'Acompanhar CPU, memória e disco da VPS e de cada container.',
    'Monitorar a disponibilidade de fora, com alertas.',
    'Encontrar e liberar o que está enchendo o disco.',
    'Usar os logs para diagnosticar problemas.',
  ],
  prerequisites: ['infra-16'],
  concepts: ['infra-monitoramento'],
  explanation: [
    { type: 'h', text: 'De dentro da VPS' },
    {
      type: 'list',
      items: [
        '`htop`: CPU e memória por processo. `free -h` e `df -h`: memória e disco.',
        '`docker stats --no-stream`: CPU e memória de cada container.',
        'O EasyPanel mostra o uso do servidor e de cada serviço no painel.',
        '`journalctl -k | grep -i "out of memory"`: o kernel matou processos por falta de memória?',
      ],
    },
    { type: 'h', text: 'De fora da VPS' },
    {
      type: 'p',
      text: 'Monitorar de dentro não avisa quando a própria VPS cai. Use um verificador externo (UptimeRobot, Better Stack, ou um Uptime Kuma em **outro** servidor) que acesse `https://api.minhaloja.com.br/saude` a cada minuto e mande alerta por e-mail, Telegram ou Slack. Crie na API uma rota de saúde que confira também a conexão com o banco.',
    },
    { type: 'h', text: 'O disco que enche' },
    {
      type: 'p',
      text: 'Disco cheio derruba tudo de uma vez: o PostgreSQL para de gravar, builds falham e o painel pode sair do ar. Os culpados de sempre:',
    },
    {
      type: 'list',
      items: [
        '**Imagens Docker antigas** de cada deploy: `docker system df` mostra o espaço; `docker image prune -a` remove imagens sem uso (confira antes).',
        '**Cache de build**: `docker builder prune`.',
        '**Logs** de containers e do sistema: limite o journald (`SystemMaxUse=500M` em `/etc/systemd/journald.conf`) e evite logs excessivos na aplicação.',
        '**Backups locais** esquecidos e uploads sem limite de tamanho.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      text: 'Configure alertas antes da emergência: disco acima de 80%, memória constantemente acima de 90%, e o verificador externo da disponibilidade.',
    },
  ],
  analogy:
    'Monitorar é ter o painel do carro: velocímetro, combustível e temperatura. Os alertas são as luzes que acendem antes de o motor fundir. E o verificador externo é um amigo que liga para saber se você chegou — porque, se o carro capotar, o painel não vai avisar ninguém.',
  example: {
    language: 'shell',
    code: `df -h /
docker system df
docker stats --no-stream --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}"`,
    lineByLine: [
      { line: 1, text: 'O disco está em 87%: hora de agir.' },
      { line: 2, text: 'Imagens ocupam 18 GB, dos quais 15 GB poderiam ser recuperados (imagens de deploys antigos).' },
      { line: 3, text: 'Consumo de cada container: o banco é o que mais usa memória, como esperado.' },
    ],
    output: `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        75G   65G  9.8G  87% /
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          42        6         18.1GB    15.3GB (84%)
Containers      6         6         84MB      0B (0%)
Local Volumes   5         5         2.4GB     0B (0%)
Build Cache     120       0         6.2GB     6.2GB
NAME             CPU %     MEM USAGE / LIMIT
loja_api.1       0.42%     58.2MiB / 3.8GiB
loja_db.1        1.10%     212.4MiB / 3.8GiB
loja_web.1       0.05%     12.1MiB / 3.8GiB`,
  },
  commonErrors: [
    {
      title: 'Monitorar só de dentro',
      why: 'Se a VPS cai ou perde a rede, o monitor cai junto e ninguém é avisado.',
      fix: 'Use um verificador externo da disponibilidade.',
    },
    {
      title: 'docker system prune -a --volumes sem pensar',
      why: 'Volumes de containers parados (inclusive de bancos) podem ser apagados.',
      fix: 'Remova imagens e cache de build; nunca volumes sem saber de quem são.',
    },
    {
      title: 'Rota de saúde que não testa nada',
      wrong: 'GET /saude → 200 sempre',
      why: 'A API responde "ok" mesmo com o banco fora do ar.',
      fix: 'Na rota de saúde, faça um `SELECT 1` com timeout curto e devolva 503 se falhar.',
    },
  ],
  guidedExerciseId: 'ex-infra-17-guiado',
  independentExerciseId: 'ex-infra-17-independente',
  reviewQuestions: [
    { question: 'Por que o monitoramento de disponibilidade deve ficar fora da VPS?', answer: 'Porque, se a VPS cair, um monitor dentro dela também cai e não avisa ninguém.' },
    { question: 'Qual comando mostra quanto espaço o Docker ocupa e quanto pode ser recuperado?', answer: '`docker system df`.' },
    { question: 'O que uma boa rota de saúde verifica?', answer: 'Que a aplicação responde e que suas dependências essenciais (como o banco) estão acessíveis.' },
  ],
  summary: [
    'htop, df, free e docker stats mostram o uso de recursos.',
    'Verificador externo + rota de saúde que testa o banco.',
    'Imagens antigas, cache de build e logs enchem o disco.',
    'Alertas antes da emergência: disco, memória e disponibilidade.',
  ],
  completionCriteria: ['Diagnosticar um disco quase cheio (exercício guiado).', 'Avaliar uma rota de saúde (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-17-guiado',
    type: 'multiple-choice',
    title: 'Disco em 95%',
    difficulty: 'basico',
    concepts: ['infra-monitoramento'],
    statement: 'O disco da VPS chegou a 95% e `docker system df` mostra 22 GB de imagens recuperáveis e 8 GB de cache de build. O que fazer primeiro?',
    options: [
      { id: 'a', text: 'Apagar a pasta de dados do PostgreSQL para liberar espaço.', feedback: 'Isso destrói o banco.' },
      { id: 'b', text: 'Remover imagens sem uso e o cache de build (`docker image prune -a` e `docker builder prune`), depois investigar por que acumulou.', feedback: 'Correto: libera espaço sem tocar em dados e dá tempo para corrigir a causa.' },
      { id: 'c', text: 'Rodar `docker system prune -a --volumes`.', feedback: 'Pode apagar volumes de dados de serviços parados.' },
      { id: 'd', text: 'Reiniciar a VPS.', feedback: 'Reiniciar não libera espaço em disco.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: imagens de deploys antigos e cache de build são descartáveis.', 'Raciocínio: o que pode ser apagado sem perder dados?', 'Estrutura: prune de imagens e de build, nunca de volumes às cegas.'],
    solution: { explanation: 'Imagens antigas e cache de build podem ser recriados; volumes, não. Depois de liberar espaço, agende a limpeza (ou ajuste a retenção de imagens) e crie um alerta de disco em 80%.' },
  },
  {
    id: 'ex-infra-17-independente',
    type: 'true-false',
    title: 'A rota de saúde otimista',
    difficulty: 'intermediario',
    concepts: ['infra-monitoramento'],
    statement: 'A API tem `GET /saude` que sempre responde 200 com `{"status":"ok"}`, sem consultar nada. O verificador externo acessa essa rota a cada minuto.',
    claim: 'Se o banco cair, o verificador vai alertar a equipe.',
    answer: false,
    justifications: [
      { id: 'a', text: 'A rota continua respondendo 200 com o banco fora do ar, então o verificador não vê problema. A rota deveria testar o banco (por exemplo, SELECT 1) e responder 503 quando falhar.' },
      { id: 'b', text: 'O verificador externo lê os logs do banco.' },
      { id: 'c', text: 'É verdadeira: qualquer rota detecta falhas do banco.' },
      { id: 'd', text: 'É verdadeira, porque o EasyPanel reinicia a API quando o banco cai.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: o monitor só sabe o que a rota informa.', 'Raciocínio: a rota consulta o banco?', 'Estrutura: health check com dependência verificada.'],
    solution: { explanation: 'Falso. A rota precisa exercitar as dependências essenciais: um `SELECT 1` com timeout curto e resposta 503 em caso de erro transforma a queda do banco em um alerta.' },
  },
];
