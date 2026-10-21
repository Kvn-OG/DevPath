import type { Exercise, Lesson } from '../../../types/content';
import { PLATAFORMA } from '../../banco/datasets';

export const lesson: Lesson = {
  id: 'infra-18',
  trackId: 'infra',
  moduleId: 'infra-m6',
  title: 'Atualizações, deploy sem queda, rollback e custos',
  durationMin: 30,
  objectives: [
    'Planejar atualizações do sistema, do painel, das imagens e do banco.',
    'Reduzir quedas no deploy com health checks e migrações compatíveis.',
    'Voltar para a versão anterior quando um deploy der errado.',
    'Estimar custos e decidir quando escalar ou migrar para serviços gerenciados.',
  ],
  prerequisites: ['infra-17'],
  concepts: ['infra-operacao'],
  explanation: [
    { type: 'h', text: 'O que precisa ser atualizado' },
    {
      type: 'list',
      items: [
        '**Sistema**: correções de segurança automáticas (aula 6) e reinícios planejados.',
        '**EasyPanel**: atualize pelo próprio painel, depois de ler as notas da versão.',
        '**Imagens das aplicações**: a cada deploy. Imagens base (node, golang, postgres) também recebem correções — reconstrua periodicamente.',
        '**Banco**: versões menores (17.2 → 17.4) são simples; versões principais (16 → 17) exigem backup, restauração ou pg_upgrade, testados antes.',
        'Antes de mexer em algo grande, tire um **snapshot** da VPS pelo painel do provedor.',
      ],
    },
    { type: 'h', text: 'Deploy com menos queda' },
    {
      type: 'list',
      items: [
        'A nova versão só deve receber tráfego depois de pronta: tenha uma rota de saúde e configure-a como health check do container.',
        'A aplicação deve encerrar com calma ao receber SIGTERM: parar de aceitar requisições e terminar as que estão em andamento.',
        '**Migrações compatíveis**: durante o deploy, a versão antiga e a nova podem rodar juntas por alguns segundos. Adicione colunas antes de usá-las; remova colunas só depois que nenhuma versão as usa (migração em duas etapas).',
      ],
    },
    { type: 'h', text: 'Rollback' },
    {
      type: 'p',
      text: 'Se o deploy der errado, volte rápido: com imagens versionadas, aponte o serviço para a tag anterior (`api:1.4.0` em vez de `1.5.0`) e faça o deploy; com GitHub, reverta o commit (`git revert`) e deixe o auto deploy publicar. Migrações destrutivas não têm rollback simples — por isso, backup antes.',
    },
    { type: 'h', text: 'Custos e crescimento' },
    {
      type: 'list',
      items: [
        'Some: VPS + armazenamento de backups + domínio + monitoramento externo. Compare com o equivalente gerenciado.',
        '**Escala vertical** (VPS maior) resolve a maioria dos casos e é um clique no provedor.',
        '**Escala horizontal** (várias máquinas, balanceador) traz complexidade: considere quando uma máquina não bastar ou a disponibilidade exigir.',
        'Quando o banco virar o ponto crítico (dados valiosos, necessidade de réplica e PITR sem equipe para operar), um PostgreSQL gerenciado pode valer o custo.',
      ],
    },
  ],
  analogy:
    'Operar um servidor é como cuidar de uma frota de entregas: revisões programadas (atualizações), troca de motorista sem parar a entrega (deploy sem queda), um carro reserva na garagem (rollback e snapshot) e a conta do mês para decidir se compensa ter frota própria ou contratar uma transportadora (serviços gerenciados).',
  example: {
    language: 'sql',
    setup: PLATAFORMA,
    code: `-- Migração em etapas para renomear "titulo" para "nome"
-- Deploy 1: adiciona a coluna nova e copia os dados (as duas versões funcionam)
ALTER TABLE tarefas ADD COLUMN nome text;
UPDATE tarefas SET nome = titulo WHERE nome IS NULL;

-- Deploy 2: a aplicação passa a ler e gravar só "nome"

-- Deploy 3, depois de confirmar que nada usa "titulo":
ALTER TABLE tarefas DROP COLUMN titulo;

SELECT id, nome FROM tarefas WHERE id <= 3 ORDER BY id;`,
    lineByLine: [
      { line: 3, text: 'Adicionar uma coluna anulável é rápido e não quebra a versão antiga.' },
      { line: 4, text: 'Copia os dados existentes para a coluna nova.' },
      { line: 9, text: 'A coluna antiga só some quando nenhuma versão em produção depende dela.' },
      { line: 11, text: 'Os títulos agora estão na coluna nome.' },
    ],
    output: `ALTER executado.

UPDATE executado.

ALTER executado.

 id | nome
----+-------------------------
 1  | Criar layout da home
 2  | Escrever textos da home
 3  | Configurar domínio
(3 linhas)`,
  },
  commonErrors: [
    {
      title: 'Renomear ou apagar coluna no mesmo deploy que muda o código',
      wrong: 'ALTER TABLE tarefas RENAME COLUMN titulo TO nome;  -- no início do deploy',
      why: 'Por alguns segundos, a versão antiga continua rodando e falha ao procurar "titulo".',
      fix: 'Migrações em etapas, compatíveis com a versão anterior e a nova.',
    },
    {
      title: 'Atualizar tudo ao mesmo tempo',
      why: 'Sistema, painel, banco e aplicação mudando juntos: se algo quebrar, não se sabe o que foi.',
      fix: 'Uma mudança por vez, com snapshot e backup antes das maiores.',
    },
    {
      title: 'Imagens sem versão',
      wrong: 'ghcr.io/voce/api:latest',
      why: 'Sem tags versionadas, não há para onde voltar em um rollback.',
      fix: 'Publique imagens com versão ou hash do commit e mantenha as últimas no registry.',
    },
  ],
  guidedExerciseId: 'ex-infra-18-guiado',
  independentExerciseId: 'ex-infra-18-independente',
  reviewQuestions: [
    { question: 'Por que migrações precisam ser compatíveis com a versão anterior?', answer: 'Porque, durante o deploy, a versão antiga e a nova podem rodar ao mesmo tempo sobre o mesmo banco.' },
    { question: 'Como fazer rollback com imagens versionadas?', answer: 'Apontando o serviço para a tag da versão anterior e fazendo o deploy dela.' },
    { question: 'O que fazer antes de uma atualização grande na VPS?', answer: 'Um snapshot pelo provedor e um backup do banco.' },
  ],
  summary: [
    'Atualize sistema, painel, imagens e banco — um por vez.',
    'Health check, encerramento gracioso e migrações em etapas.',
    'Rollback = voltar para a tag anterior (ou git revert).',
    'Escala vertical primeiro; gerenciado quando o custo de operar for maior.',
  ],
  completionCriteria: ['Escolher como responder a um deploy quebrado (exercício guiado).', 'Ordenar uma migração sem queda (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-18-guiado',
    type: 'multiple-choice',
    title: 'O deploy das 18h',
    difficulty: 'basico',
    concepts: ['infra-operacao'],
    statement: 'A versão 1.5.0 da API foi publicada às 18h e os pedidos começaram a falhar. A 1.4.0 funcionava. A migração dessa versão só adicionou uma coluna nova. O que fazer?',
    options: [
      { id: 'a', text: 'Restaurar o backup da madrugada.', feedback: 'Perderia todos os pedidos desde a madrugada; o problema está no código, não nos dados.' },
      { id: 'b', text: 'Voltar o serviço para a imagem 1.4.0 e fazer o deploy; depois investigar a 1.5.0 com calma.', feedback: 'Correto: a migração foi compatível (só adicionou uma coluna), então a versão anterior roda normalmente.' },
      { id: 'c', text: 'Corrigir direto no servidor, editando os arquivos do container.', feedback: 'A correção some no próximo deploy e ninguém sabe o que mudou.' },
      { id: 'd', text: 'Reiniciar a VPS.', feedback: 'A versão quebrada voltaria a subir.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: rollback restaura o serviço rapidamente.', 'Raciocínio: a versão anterior funciona com o banco atual?', 'Estrutura: uma coluna nova não atrapalha o código antigo.'],
    solution: { explanation: 'Como a migração foi apenas aditiva, a 1.4.0 funciona com o banco atual. O rollback para a tag anterior estanca o problema em minutos; a correção vem depois, em uma nova versão.' },
  },
  {
    id: 'ex-infra-18-independente',
    type: 'order-steps',
    title: 'Removendo uma coluna sem queda',
    difficulty: 'intermediario',
    concepts: ['infra-operacao'],
    statement: 'A coluna `tarefas.prioridade_antiga` não é mais necessária. Ordene os passos para removê-la sem derrubar a aplicação.',
    steps: [
      { id: 'a', text: 'Publicar uma versão da aplicação que não lê nem grava prioridade_antiga.' },
      { id: 'b', text: 'Confirmar que nenhuma instância em produção ainda usa a versão antiga.' },
      { id: 'c', text: 'Fazer backup do banco.' },
      { id: 'd', text: 'Rodar ALTER TABLE tarefas DROP COLUMN prioridade_antiga.' },
    ],
    hints: ['Conceito: o código deve deixar de usar a coluna antes de ela sumir.', 'Raciocínio: o DROP COLUMN não tem volta sem backup.', 'Estrutura: código → confirmação → backup → remoção.'],
    solution: { explanation: 'Primeiro o código para de depender da coluna; depois de confirmar que nenhuma versão antiga está rodando, faça o backup e só então remova a coluna. Em nenhum momento uma versão em produção procura algo que não existe.' },
  },
];
