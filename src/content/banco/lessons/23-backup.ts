import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'banco-23',
  trackId: 'sql',
  moduleId: 'sql-m6',
  title: 'Backup e restauração: pg_dump e pg_restore',
  durationMin: 30,
  objectives: [
    'Fazer backups lógicos com pg_dump nos formatos plain e custom.',
    'Restaurar com psql e com pg_restore, inteiro ou por partes.',
    'Diferenciar backup lógico de físico (pg_basebackup e PITR).',
    'Montar uma rotina de backup testada, com retenção e cópia fora do servidor.',
  ],
  prerequisites: ['banco-22'],
  concepts: ['pg-backup'],
  explanation: [
    {
      type: 'p',
      text: 'Um backup só existe de verdade quando você **já restaurou** a partir dele. Discos falham, alguém roda `DELETE` sem WHERE, uma migração dá errado, um servidor é invadido: em todos os casos, a pergunta é "qual a cópia mais recente que eu consigo restaurar, e em quanto tempo?".',
    },
    { type: 'h', text: 'Backup lógico: pg_dump' },
    {
      type: 'p',
      text: 'O `pg_dump` gera os comandos e dados necessários para recriar **um banco**, com uma foto consistente (ele usa uma transação). Funciona com o banco no ar.',
    },
    {
      type: 'list',
      items: [
        '`-F p` (plain, padrão): um arquivo .sql legível. Restaura com `psql -f`.',
        '`-F c` (custom): comprimido, restaura com `pg_restore`, permite escolher tabelas (`-t`) e restaurar em paralelo (`-j 4`). É o recomendado.',
        '`pg_dumpall --globals-only`: roles e configurações globais, que o pg_dump de um banco não inclui.',
      ],
    },
    { type: 'h', text: 'Backup físico e PITR' },
    {
      type: 'p',
      text: 'Para bancos grandes ou quando perder horas de dados é inaceitável, usa-se backup **físico**: `pg_basebackup` copia os arquivos do servidor e, com o **arquivamento contínuo do WAL** (aula 19), é possível restaurar até um instante exato. Ferramentas como pgBackRest e WAL-G automatizam isso; serviços gerenciados (Supabase, RDS) já fazem por você.',
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Regra 3-2-1',
      text: '3 cópias dos dados, em 2 tipos de armazenamento diferentes, sendo 1 fora do servidor (outro provedor ou um bucket S3). Backup no mesmo disco da VPS some junto com ela.',
    },
    { type: 'h', text: 'Uma rotina mínima' },
    {
      type: 'list',
      ordered: true,
      items: [
        'pg_dump diário em formato custom, com data no nome do arquivo (agendado com cron ou pelo painel, como o EasyPanel).',
        'Envio da cópia para fora do servidor.',
        'Retenção: por exemplo, 7 diários e 4 semanais; apague os mais antigos automaticamente.',
        'Teste de restauração periódico em um banco separado, conferindo contagens de linhas.',
        'Alerta quando o backup falhar.',
      ],
    },
  ],
  analogy:
    'Backup é como a chave reserva de casa: não adianta tê-la dentro da própria casa (mesmo servidor), e é bom testar de vez em quando se ela ainda abre a porta.',
  example: {
    language: 'shell',
    code: `# 1. Backup em formato custom
pg_dump -h localhost -U postgres -d loja -F c -f loja_2026-03-15.dump

# 2. Conferir o conteúdo do arquivo
pg_restore -l loja_2026-03-15.dump | head -4

# 3. Restaurar em um banco novo e conferir
createdb -h localhost -U postgres loja_teste
pg_restore -h localhost -U postgres -d loja_teste loja_2026-03-15.dump
psql -h localhost -U postgres -d loja_teste -c "SELECT count(*) FROM produtos;"`,
    lineByLine: [
      { line: 2, text: '-F c: formato custom, comprimido. O nome do arquivo leva a data.' },
      { line: 5, text: 'pg_restore -l lista o que há dentro do backup, sem restaurar nada.' },
      { line: 8, text: 'Restaurar em um banco separado é a forma segura de testar o backup.' },
      { line: 10, text: 'Confira se os dados vieram: a contagem deve bater com o banco original.' },
    ],
    output: `;
; Archive created at 2026-03-15 03:00:01 -03
;     dbname: loja
;     TOC Entries: 14
 count
-------
     8
(1 row)`,
  },
  commonErrors: [
    {
      title: 'Nunca ter testado a restauração',
      why: 'Backups vazios, corrompidos, sem uma tabela ou sem permissões só são descobertos no dia em que você precisa deles.',
      fix: 'Restaure periodicamente em um banco de teste e confira os dados.',
    },
    {
      title: 'Guardar o backup no mesmo servidor',
      why: 'Se a VPS for perdida, invadida ou tiver o disco corrompido, o backup vai junto.',
      fix: 'Copie para outro lugar (bucket S3, outro provedor).',
    },
    {
      title: 'Restaurar por cima do banco de produção',
      wrong: 'pg_restore --clean -d loja backup_antigo.dump',
      why: '--clean apaga os objetos atuais antes de recriar: dados novos desde o backup são perdidos.',
      fix: 'Restaure em um banco separado, confira e só então decida o que copiar ou trocar.',
    },
  ],
  guidedExerciseId: 'ex-banco-23-guiado',
  independentExerciseId: 'ex-banco-23-independente',
  reviewQuestions: [
    { question: 'Qual a vantagem do formato custom (-F c) sobre o plain?', answer: 'É comprimido e permite, com pg_restore, listar o conteúdo, restaurar só algumas tabelas e restaurar em paralelo.' },
    { question: 'O pg_dump de um banco inclui os roles?', answer: 'Não. Roles e configurações globais exigem `pg_dumpall --globals-only`.' },
    { question: 'Quando o backup físico com WAL é necessário?', answer: 'Quando é preciso restaurar até um instante específico (PITR) ou o banco é grande demais para dumps frequentes.' },
  ],
  summary: [
    'pg_dump faz backup lógico consistente com o banco no ar.',
    'Formato custom + pg_restore: seletivo e paralelo.',
    'Backup físico + WAL permite restaurar até um instante (PITR).',
    'Regra 3-2-1, retenção, alerta e testes de restauração.',
  ],
  completionCriteria: ['Ordenar uma rotina de backup e teste (exercício guiado).', 'Recuperar uma única tabela apagada por engano (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-banco-23-guiado',
    type: 'order-steps',
    title: 'Rotina de backup',
    difficulty: 'basico',
    concepts: ['pg-backup'],
    statement: 'Ordene a rotina diária de backup do banco da loja, do agendamento ao teste.',
    steps: [
      { id: 'a', text: 'Às 3h, o agendador dispara o pg_dump em formato custom, com a data no nome do arquivo.' },
      { id: 'b', text: 'O script confere se o comando terminou sem erro e se o arquivo não está vazio.' },
      { id: 'c', text: 'O arquivo é enviado para um bucket fora do servidor.' },
      { id: 'd', text: 'Os backups mais antigos que o prazo de retenção são apagados.' },
      { id: 'e', text: 'Uma vez por semana, o backup mais recente é restaurado em um banco de teste e as contagens são conferidas.' },
    ],
    hints: [
      'Conceito: backup = gerar, validar, guardar fora, limpar e testar.',
      'Raciocínio: não faz sentido enviar para fora um arquivo que você ainda não validou.',
      'Estrutura: pg_dump → validar → enviar → retenção → teste de restauração.',
    ],
    solution: {
      explanation:
        'Primeiro gera-se o arquivo, depois confere-se que ele é válido, envia-se a cópia para fora, aplica-se a retenção e, periodicamente, testa-se a restauração. Sem o último passo, você não sabe se tem um backup.',
    },
  },
  {
    id: 'ex-banco-23-independente',
    type: 'multiple-choice',
    title: 'A tabela apagada',
    difficulty: 'intermediario',
    concepts: ['pg-backup'],
    language: 'shell',
    statement:
      'Às 10h, alguém rodou `DROP TABLE cupons;` em produção. O resto do banco recebeu pedidos normalmente desde então. Você tem o backup da madrugada, `loja_2026-03-15.dump`, em formato custom. Qual o caminho mais seguro?',
    options: [
      { id: 'a', text: '`pg_restore --clean -d loja loja_2026-03-15.dump`', feedback: 'Restaura o banco inteiro por cima: os pedidos feitos desde as 3h seriam perdidos.' },
      {
        id: 'b',
        text: 'Restaurar só a tabela em um banco temporário (`pg_restore -d loja_tmp -t cupons ...`), conferir e então copiá-la de volta para a produção.',
        feedback: 'Correto: o formato custom permite escolher a tabela, e restaurar à parte evita surpresas na produção.',
      },
      { id: 'c', text: 'Recriar a tabela vazia com o CREATE TABLE original.', feedback: 'A estrutura volta, mas os cupons não.' },
      { id: 'd', text: 'Restaurar o backup em uma réplica.', feedback: 'A réplica aplica tudo do principal — inclusive o DROP TABLE.' },
    ],
    correctOptionId: 'b',
    hints: [
      'Conceito: o formato custom permite restaurar só parte do backup.',
      'Raciocínio: restaurar o banco inteiro desfaria horas de pedidos válidos.',
      'Estrutura: pg_restore com -t, em um banco separado.',
    ],
    solution: {
      explanation:
        'Com `pg_restore -t cupons` em um banco temporário, você recupera apenas a tabela perdida (com os dados da madrugada), confere e a traz para a produção — por exemplo, com pg_dump/pg_restore só dessa tabela. Os cupons usados entre 3h e 10h precisariam de PITR para voltar, um bom argumento para ter arquivamento de WAL.',
    },
  },
];
