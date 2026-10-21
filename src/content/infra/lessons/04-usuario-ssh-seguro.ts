import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-04',
  trackId: 'infra',
  moduleId: 'infra-m2',
  title: 'Usuário sem root e SSH blindado',
  durationMin: 25,
  objectives: [
    'Criar um usuário administrador com sudo.',
    'Desativar o login como root e o login por senha no SSH.',
    'Aplicar mudanças no SSH sem se trancar para fora do servidor.',
  ],
  prerequisites: ['infra-03'],
  concepts: ['infra-usuarios'],
  explanation: [
    {
      type: 'p',
      text: 'Minutos depois de uma VPS ganhar um IP público, robôs começam a tentar senhas no SSH como `root`. Duas mudanças eliminam quase todo esse risco: **ninguém entra como root** e **ninguém entra com senha** — só com chave.',
    },
    { type: 'h', text: '1. Um usuário administrador' },
    {
      type: 'code',
      language: 'shell',
      code: `# Ainda como root
adduser deploy                  # cria o usuário e pede uma senha (usada no sudo)
usermod -aG sudo deploy         # adiciona ao grupo sudo

# Copia as chaves autorizadas do root para o novo usuário
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy`,
    },
    { type: 'h', text: '2. Endurecer o SSH' },
    {
      type: 'p',
      text: 'Crie um arquivo em `/etc/ssh/sshd_config.d/` (as configurações dessa pasta são lidas pelo SSH) com:',
    },
    {
      type: 'code',
      language: 'shell',
      code: `# /etc/ssh/sshd_config.d/01-seguranca.conf
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no`,
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Não se tranque para fora',
      text: 'Antes de reiniciar o SSH, abra **outra** janela e confirme que `ssh deploy@IP` entra com a chave e que `sudo` funciona. Só então rode `sudo sshd -t` (valida a configuração) e `sudo systemctl restart ssh`, **mantendo a sessão antiga aberta** até testar de novo. Se algo der errado, o console web do provedor é o plano B.',
    },
    {
      type: 'p',
      text: 'Os arquivos dessa pasta são lidos em ordem alfabética e, para cada diretiva, **o primeiro valor lido vence**. Algumas imagens de nuvem trazem um `50-cloud-init.conf` com `PasswordAuthentication yes` — por isso o nosso arquivo começa com 01. Confira sempre o resultado final com `sudo sshd -T | grep -i passwordauthentication`.',
    },
  ],
  analogy:
    'Deixar o root entrar com senha é ter uma porta da frente com a placa "gerente" e uma fechadura de quatro dígitos: todo ladrão sabe o nome e testa combinações o dia inteiro. Com usuário próprio e chave, a porta não tem placa nem teclado — só abre para quem tem a chave física.',
  example: {
    language: 'shell',
    code: `sudo sshd -t && echo "configuração válida"
sudo sshd -T | grep -Ei "^(permitrootlogin|passwordauthentication)"
sudo systemctl restart ssh`,
    lineByLine: [
      { line: 1, text: 'Valida a sintaxe antes de aplicar; um erro aqui impediria o SSH de subir.' },
      { line: 2, text: 'Mostra os valores efetivos, depois de juntar todos os arquivos de configuração.' },
      { line: 3, text: 'Aplica as mudanças. Teste em uma nova janela antes de fechar a atual.' },
    ],
    output: `configuração válida
permitrootlogin no
passwordauthentication no`,
  },
  commonErrors: [
    {
      title: 'Desativar a senha antes de testar a chave',
      why: 'Se a chave do novo usuário não funciona, você perde o acesso por SSH.',
      fix: 'Teste o login com chave em outra janela antes de reiniciar o SSH.',
    },
    {
      title: 'Configuração ignorada',
      why: 'Outro arquivo em sshd_config.d define o mesmo parâmetro antes do seu e vence.',
      fix: 'Confira os valores efetivos com `sudo sshd -T`.',
    },
    {
      title: 'Rodar tudo como root no dia a dia',
      why: 'Um comando errado ou um script malicioso tem poder total sobre o sistema.',
      fix: 'Use o usuário comum e `sudo` só quando necessário.',
    },
  ],
  guidedExerciseId: 'ex-infra-04-guiado',
  independentExerciseId: 'ex-infra-04-independente',
  reviewQuestions: [
    { question: 'Por que desativar o login por senha no SSH?', answer: 'Porque senhas podem ser adivinhadas por robôs; chaves são praticamente impossíveis de adivinhar.' },
    { question: 'Como confirmar quais valores o SSH está realmente usando?', answer: 'Com `sudo sshd -T`, que mostra a configuração efetiva.' },
    { question: 'Qual o plano B se você perder o acesso por SSH?', answer: 'O console web (VNC/serial) do painel do provedor.' },
  ],
  summary: [
    'Crie um usuário com sudo e copie as chaves para ele.',
    'PermitRootLogin no e PasswordAuthentication no.',
    'Valide com sshd -t, confira com sshd -T e teste em outra janela.',
    'Console do provedor é o plano B.',
  ],
  completionCriteria: ['Ordenar o endurecimento do SSH sem perder o acesso (exercício guiado).', 'Completar as diretivas de segurança (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-04-guiado',
    type: 'order-steps',
    title: 'Sem se trancar para fora',
    difficulty: 'basico',
    concepts: ['infra-usuarios', 'infra-ssh'],
    statement: 'Ordene os passos para desativar o login como root e por senha sem perder o acesso à VPS.',
    steps: [
      { id: 'a', text: 'Como root, criar o usuário deploy e adicioná-lo ao grupo sudo.' },
      { id: 'b', text: 'Copiar as chaves autorizadas para /home/deploy/.ssh.' },
      { id: 'c', text: 'Em outra janela, entrar como deploy com a chave e testar o sudo.' },
      { id: 'd', text: 'Escrever PermitRootLogin no e PasswordAuthentication no e validar com sshd -t.' },
      { id: 'e', text: 'Reiniciar o SSH e testar um novo login antes de fechar a sessão antiga.' },
    ],
    hints: [
      'Conceito: o acesso alternativo precisa existir e estar testado antes de fechar o antigo.',
      'Raciocínio: o que acontece se você desativar o root antes de o deploy funcionar?',
      'Estrutura: criar usuário → chaves → testar → configurar → reiniciar e testar.',
    ],
    solution: { explanation: 'Primeiro garanta o novo caminho de acesso (usuário, chave e sudo testados). Só então feche os caminhos inseguros, validando a configuração e testando antes de encerrar a sessão atual.' },
  },
  {
    id: 'ex-infra-04-independente',
    type: 'fill-blanks',
    title: 'As duas diretivas',
    difficulty: 'basico',
    concepts: ['infra-usuarios'],
    language: 'shell',
    statement: 'Complete o arquivo de configuração do SSH: o root não pode entrar e ninguém entra com senha.',
    template: `# /etc/ssh/sshd_config.d/01-seguranca.conf
[[0]] no
[[1]] no`,
    blanks: [
      { accept: ['PermitRootLogin'], width: 16 },
      { accept: ['PasswordAuthentication'], width: 23 },
    ],
    hints: [
      'Conceito: cada linha é uma diretiva do sshd seguida do valor.',
      'Raciocínio: uma permite (ou não) o login do root; a outra, a autenticação por senha.',
      'Estrutura: PermitRootLogin e PasswordAuthentication.',
    ],
    solution: {
      code: `PermitRootLogin no
PasswordAuthentication no`,
      explanation: 'Com as duas diretivas, o SSH só aceita usuários comuns autenticados por chave. Valide com `sudo sshd -t` e reinicie com `sudo systemctl restart ssh`.',
    },
  },
];
