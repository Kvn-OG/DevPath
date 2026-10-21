import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-16',
  trackId: 'infra',
  moduleId: 'infra-m6',
  title: 'Backups automáticos do PostgreSQL e teste de restauração',
  durationMin: 30,
  objectives: [
    'Configurar backups agendados do Postgres para um armazenamento fora da VPS.',
    'Fazer um backup manual com pg_dump de dentro do container.',
    'Testar a restauração em um banco separado.',
    'Definir retenção e alertas.',
  ],
  prerequisites: ['infra-15'],
  concepts: ['infra-backup'],
  explanation: [
    {
      type: 'p',
      text: 'Tudo da aula 23 da Trilha 5 vale aqui, agora na prática: o backup precisa ser **automático**, ficar **fora da VPS** e ser **testado**.',
    },
    { type: 'h', text: 'Backups pelo EasyPanel' },
    {
      type: 'list',
      items: [
        'Primeiro, cadastre um **destino de armazenamento** nas configurações do servidor no painel: um bucket compatível com S3 (AWS S3, Cloudflare R2, Backblaze B2, Wasabi...). Crie uma chave de acesso com permissão só para esse bucket.',
        'Na aba **Backups** do serviço Postgres, crie uma configuração: o banco, um agendamento em formato **cron** (`0 3 * * *` = todo dia às 3h), a **retenção** (quantas cópias manter) e o caminho no destino.',
        'Rode um backup na hora para validar e acompanhe o registro de execuções.',
        'Volumes de aplicações (uploads) também podem ter backups agendados.',
      ],
    },
    { type: 'h', text: 'Backup manual pelo terminal' },
    {
      type: 'p',
      text: 'Antes de uma migração arriscada, faça um dump na hora, executando o `pg_dump` dentro do container do banco e salvando o arquivo na VPS (e depois copiando-o para fora dela):',
    },
    {
      type: 'code',
      language: 'shell',
      code: `# Encontre o container do Postgres
docker ps --format "{{.Names}}" | grep -i postgres

# Dump em formato custom, gravado na VPS
docker exec NOME_DO_CONTAINER pg_dump -U postgres -d loja -F c > loja_$(date +%F).dump`,
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'O teste que ninguém faz',
      text: 'Uma vez por mês, restaure o backup mais recente em um banco de teste (um serviço Postgres temporário, por exemplo) e confira as contagens das tabelas principais. Anote quanto tempo levou: esse é o seu tempo real de recuperação.',
    },
  ],
  analogy:
    'Um backup agendado é como o seguro do carro com débito automático: você não precisa lembrar de pagar. Mas só sabe se ele cobre o sinistro quando lê a apólice — o teste de restauração é ler a apólice antes do acidente.',
  example: {
    language: 'shell',
    code: `# Restaurar o dump em um banco de teste e conferir
docker exec -i NOME_DO_CONTAINER createdb -U postgres loja_teste
docker exec -i NOME_DO_CONTAINER pg_restore -U postgres -d loja_teste < loja_2026-03-15.dump
docker exec NOME_DO_CONTAINER psql -U postgres -d loja_teste -c "SELECT count(*) FROM tarefas;"`,
    lineByLine: [
      { line: 2, text: 'Cria um banco vazio ao lado do de produção, só para o teste.' },
      { line: 3, text: '-i permite enviar o arquivo da VPS para o pg_restore dentro do container.' },
      { line: 4, text: 'A contagem deve bater com a de produção no momento do backup. Depois, apague o banco de teste.' },
    ],
    output: ` count
-------
     8
(1 row)`,
  },
  commonErrors: [
    {
      title: 'Backup no mesmo disco',
      why: 'Se a VPS for perdida, os backups vão junto.',
      fix: 'Destino S3 em outro provedor ou outra conta.',
    },
    {
      title: 'Chave do bucket com acesso total',
      why: 'Se a VPS for invadida, o invasor pode apagar também os backups.',
      fix: 'Chave com permissão só para gravar naquele bucket e, se o provedor oferecer, versionamento ou bloqueio de objetos.',
    },
    {
      title: 'Agendar e esquecer',
      why: 'Senha trocada, bucket cheio ou chave expirada fazem os backups falharem em silêncio.',
      fix: 'Revise o registro de execuções, configure alertas e teste a restauração periodicamente.',
    },
  ],
  guidedExerciseId: 'ex-infra-16-guiado',
  independentExerciseId: 'ex-infra-16-independente',
  reviewQuestions: [
    { question: 'O que significa o cron `0 3 * * *`?', answer: 'Todos os dias, às 3h00 (minuto 0, hora 3, qualquer dia, mês e dia da semana).' },
    { question: 'Por que usar uma chave de acesso restrita para o bucket de backup?', answer: 'Para que um invasor da VPS não consiga apagar ou ler outros dados da conta de armazenamento.' },
    { question: 'O que medir no teste de restauração?', answer: 'Se os dados vieram completos (contagens) e quanto tempo a restauração levou.' },
  ],
  summary: [
    'Destino S3 fora da VPS, com chave restrita.',
    'Backups agendados (cron) com retenção na aba Backups.',
    'pg_dump via docker exec antes de mudanças arriscadas.',
    'Teste a restauração e acompanhe as execuções.',
  ],
  completionCriteria: ['Interpretar uma configuração de backup (exercício guiado).', 'Ordenar um teste de restauração (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-16-guiado',
    type: 'multiple-choice',
    title: 'Lendo o agendamento',
    difficulty: 'basico',
    concepts: ['infra-backup'],
    statement: 'O backup do banco está configurado com o agendamento `30 2 * * *` e retenção 7, enviando para um bucket R2. O que isso significa?',
    options: [
      { id: 'a', text: 'Um backup a cada 30 minutos, guardando 7 horas de cópias.', feedback: 'O primeiro campo do cron é o minuto, não um intervalo.' },
      { id: 'b', text: 'Um backup por dia às 2h30, mantendo as 7 cópias mais recentes no bucket.', feedback: 'Correto: minuto 30, hora 2, todos os dias; retenção de 7 cópias.' },
      { id: 'c', text: 'Um backup no dia 30 de cada mês, às 2h.', feedback: 'O dia do mês é o terceiro campo, que está como *.' },
      { id: 'd', text: 'Sete backups por dia.', feedback: 'A retenção diz quantas cópias manter, não quantas fazer.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: cron = minuto, hora, dia do mês, mês, dia da semana.', 'Raciocínio: 30 no minuto e 2 na hora.', 'Estrutura: retenção = quantas cópias ficam guardadas.'],
    solution: { explanation: '`30 2 * * *` dispara todos os dias às 2h30. Com retenção 7, o painel mantém uma semana de backups diários e apaga os mais antigos.' },
  },
  {
    id: 'ex-infra-16-independente',
    type: 'order-steps',
    title: 'Teste mensal de restauração',
    difficulty: 'basico',
    concepts: ['infra-backup'],
    statement: 'Ordene o teste mensal de restauração do banco da loja.',
    steps: [
      { id: 'a', text: 'Baixar do bucket o backup mais recente.' },
      { id: 'b', text: 'Criar um banco de teste separado da produção.' },
      { id: 'c', text: 'Restaurar o backup no banco de teste com pg_restore.' },
      { id: 'd', text: 'Comparar as contagens das tabelas principais com a produção e anotar o tempo gasto.' },
      { id: 'e', text: 'Apagar o banco de teste e registrar o resultado.' },
    ],
    hints: ['Conceito: restaurar sempre fora da produção.', 'Raciocínio: só dá para conferir depois de restaurar.', 'Estrutura: baixar → criar → restaurar → conferir → limpar.'],
    solution: { explanation: 'O teste usa a cópia que realmente está fora da VPS, restaura em um banco isolado, confere os dados e o tempo e limpa no fim. O registro mostra, mês a mês, que o backup funciona.' },
  },
];
