import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'banco-19',
  trackId: 'sql',
  moduleId: 'sql-m5',
  title: 'WAL: como o banco sobrevive a quedas',
  durationMin: 25,
  objectives: [
    'Explicar o log de escrita antecipada (WAL) e por que ele garante a durabilidade.',
    'Descrever checkpoints e a recuperação depois de uma queda.',
    'Avaliar o efeito de synchronous_commit e fsync.',
    'Relacionar o WAL com replicação e restauração em um ponto no tempo.',
  ],
  prerequisites: ['banco-18'],
  concepts: ['bd-wal'],
  explanation: [
    {
      type: 'p',
      text: 'Gravar cada página alterada direto nos arquivos de dados a cada COMMIT seria lento: as páginas estão espalhadas pelo disco. O PostgreSQL usa outra estratégia, o **WAL** (*write-ahead log*, log de escrita antecipada):',
    },
    {
      type: 'list',
      ordered: true,
      items: [
        'O comando altera a página **na memória** (shared buffers).',
        'Uma descrição compacta da alteração é acrescentada ao **WAL**, um arquivo escrito sempre no fim, em sequência.',
        'No **COMMIT**, o banco força o WAL até o disco (`fsync`) e só então responde "ok" ao cliente.',
        'As páginas alteradas vão para os arquivos de dados depois, aos poucos, e de vez em quando um **checkpoint** garante que tudo até certo ponto do WAL já está nos arquivos.',
      ],
    },
    {
      type: 'p',
      text: 'Se o servidor cair, os arquivos de dados podem estar desatualizados, mas o WAL tem tudo o que foi confirmado. Na inicialização, o banco parte do último checkpoint e **reaplica** o WAL (*redo*). Transações sem COMMIT no WAL são simplesmente ignoradas — é assim que atomicidade e durabilidade funcionam juntas.',
    },
    { type: 'h', text: 'Os parâmetros que importam' },
    {
      type: 'list',
      items: [
        '`synchronous_commit = on` (padrão): o COMMIT espera o WAL chegar ao disco. Com `off`, responde antes; uma queda pode perder os **últimos** milissegundos de transações confirmadas, mas o banco **não** corrompe.',
        '`fsync = off`: o banco deixa de forçar a gravação em disco. Uma queda pode **corromper** o banco. Só serve para dados descartáveis (testes, como o PostgreSQL que roda no seu navegador nesta trilha).',
        '`checkpoint_timeout` e `max_wal_size`: a frequência dos checkpoints. Mais espaçados = menos escrita, recuperação mais longa.',
      ],
    },
    { type: 'h', text: 'O WAL também serve para…' },
    {
      type: 'list',
      items: [
        '**Replicação**: um servidor réplica recebe o WAL do principal e o aplica continuamente (*streaming replication*).',
        '**PITR** (*point-in-time recovery*): com um backup físico mais os arquivos de WAL guardados, dá para restaurar o banco como estava às 14h32 de ontem, um minuto antes de um `DELETE` sem WHERE.',
      ],
    },
  ],
  analogy:
    'É o caderno de pedidos de um restaurante: o garçom anota cada pedido no caderno (rápido, sempre na página seguinte) antes de a cozinha atualizar o quadro de estoque. Se o quadro for apagado sem querer, basta reler o caderno a partir da última conferência para reconstruí-lo.',
  example: {
    language: 'shell',
    code: `# No servidor PostgreSQL (não no navegador)
sudo -u postgres psql -c "SHOW wal_level;" -c "SHOW synchronous_commit;" -c "SHOW checkpoint_timeout;"

# Os segmentos do WAL ficam na pasta pg_wal do diretório de dados
sudo ls /var/lib/postgresql/17/main/pg_wal | head -3`,
    lineByLine: [
      { line: 2, text: 'Mostra três parâmetros ligados ao WAL. `replica` permite replicação e PITR.' },
      { line: 5, text: 'Cada arquivo de 16 MB é um segmento do WAL, nomeado em hexadecimal. O caminho muda conforme a versão.' },
    ],
    output: ` wal_level
-----------
 replica
(1 row)

 synchronous_commit
--------------------
 on
(1 row)

 checkpoint_timeout
--------------------
 5min
(1 row)

000000010000000000000001
000000010000000000000002
archive_status`,
  },
  commonErrors: [
    {
      title: 'Desligar fsync para "ganhar desempenho"',
      wrong: 'fsync = off   # postgresql.conf de produção',
      why: 'Uma queda de energia pode deixar o banco corrompido, sem recuperação.',
      fix: 'Nunca em produção. Se precisa de mais velocidade e aceita perder os últimos instantes, avalie synchronous_commit = off.',
    },
    {
      title: 'Apagar arquivos da pasta pg_wal para liberar espaço',
      why: 'Os segmentos ainda podem ser necessários para recuperação ou réplicas; apagá-los à mão pode impedir o banco de subir.',
      fix: 'Investigue a causa (réplica parada, arquivamento falhando, slot de replicação esquecido) e deixe o PostgreSQL reciclar os arquivos.',
    },
    {
      title: 'Achar que réplica é backup',
      why: 'A réplica aplica tudo o que o principal faz — inclusive o DELETE sem WHERE, em segundos.',
      fix: 'Mantenha backups (e, se possível, arquivamento de WAL para PITR) além das réplicas.',
    },
  ],
  guidedExerciseId: 'ex-banco-19-guiado',
  independentExerciseId: 'ex-banco-19-independente',
  reviewQuestions: [
    { question: 'Por que gravar no WAL é mais rápido que gravar as páginas de dados no COMMIT?', answer: 'Porque o WAL é escrito em sequência, sempre no fim do arquivo, enquanto as páginas alteradas estão espalhadas pelo disco.' },
    { question: 'O que o banco faz com o WAL ao reiniciar depois de uma queda?', answer: 'Parte do último checkpoint e reaplica as alterações registradas no WAL (redo), recuperando tudo o que foi confirmado.' },
    { question: 'Qual a diferença de risco entre synchronous_commit = off e fsync = off?', answer: 'synchronous_commit = off pode perder as últimas transações confirmadas, sem corromper; fsync = off pode corromper o banco.' },
  ],
  summary: [
    'Alterações vão primeiro para o WAL, gravado em sequência e forçado ao disco no COMMIT.',
    'Checkpoints levam as páginas aos arquivos de dados.',
    'Na recuperação, o banco reaplica o WAL a partir do último checkpoint.',
    'O WAL permite réplicas e restauração em um ponto no tempo (PITR).',
  ],
  completionCriteria: ['Ordenar as etapas da recuperação após uma queda (exercício guiado).', 'Avaliar o risco de synchronous_commit = off (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-19-guiado',
    type: 'order-steps',
    title: 'Depois da queda de energia',
    difficulty: 'basico',
    concepts: ['bd-wal'],
    statement: 'O servidor perdeu energia logo depois de confirmar várias transações, antes do próximo checkpoint. Ordene o que acontece quando ele volta.',
    steps: [
      { id: 'a', text: 'O PostgreSQL inicia e percebe que não foi desligado corretamente.' },
      { id: 'b', text: 'Ele localiza o último checkpoint registrado.' },
      { id: 'c', text: 'Ele relê o WAL a partir desse checkpoint.' },
      { id: 'd', text: 'As alterações das transações confirmadas são reaplicadas nas páginas de dados.' },
      { id: 'e', text: 'O banco volta a aceitar conexões, com todos os COMMITs preservados.' },
    ],
    hints: [
      'Conceito: a recuperação é a reaplicação (redo) do WAL.',
      'Raciocínio: o checkpoint marca até onde os arquivos de dados já estavam em dia; o que vem depois está só no WAL.',
      'Estrutura: detectar a queda → achar o checkpoint → reler o WAL → reaplicar → abrir.',
    ],
    solution: {
      explanation:
        'O banco detecta o desligamento incorreto, encontra o último checkpoint, reaplica o WAL dali em diante e só então aceita conexões. Transações sem COMMIT no WAL não são reaplicadas.',
    },
  },
  {
    id: 'ex-banco-19-independente',
    type: 'true-false',
    title: 'Commit assíncrono',
    difficulty: 'intermediario',
    concepts: ['bd-wal'],
    statement: 'Um sistema de métricas configurou `synchronous_commit = off` para gravar mais rápido. Avalie a afirmação.',
    claim: 'Com essa configuração, uma queda pode perder algumas transações que já tinham recebido COMMIT, mas o banco volta consistente, sem corrupção.',
    answer: true,
    justifications: [
      { id: 'a', text: 'O COMMIT responde antes de o WAL chegar ao disco; os últimos registros podem se perder, mas o WAL que foi gravado continua íntegro e a recuperação funciona.' },
      { id: 'b', text: 'Com synchronous_commit = off o WAL deixa de existir.' },
      { id: 'c', text: 'É falsa: synchronous_commit = off corrompe o banco em qualquer queda.' },
      { id: 'd', text: 'É falsa: nenhuma transação confirmada pode ser perdida em nenhuma configuração.' },
    ],
    correctJustificationId: 'a',
    hints: [
      'Conceito: o COMMIT normal espera o WAL ser forçado ao disco.',
      'Raciocínio: o que muda se ele não esperar? O que fica no disco continua válido?',
      'Estrutura: compare com fsync = off, que é o parâmetro perigoso.',
    ],
    solution: {
      explanation:
        'Verdadeiro. A janela de perda são os últimos instantes antes da queda; como o WAL é gravado em ordem e o fsync continua ativo, a recuperação leva o banco a um estado consistente. Para métricas, perder milissegundos pode ser aceitável; para pagamentos, não.',
    },
  },
];
