import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-02',
  trackId: 'infra',
  moduleId: 'infra-m1',
  title: 'SSH e chaves',
  durationMin: 25,
  objectives: [
    'Gerar um par de chaves SSH e entender a diferença entre chave pública e privada.',
    'Cadastrar a chave pública no servidor e entrar sem senha.',
    'Criar atalhos no ~/.ssh/config.',
    'Copiar arquivos com scp e rsync.',
  ],
  prerequisites: ['infra-01'],
  concepts: ['infra-ssh'],
  explanation: [
    {
      type: 'p',
      text: '**SSH** (*Secure Shell*) abre um terminal criptografado em outra máquina. É por ele que você administra a VPS. Em vez de senha, use **chaves**: um par de arquivos gerados juntos.',
    },
    {
      type: 'list',
      items: [
        '**Chave privada** (`~/.ssh/id_ed25519`): fica só no seu computador. Nunca envie, nunca coloque em repositório. Proteja com uma *passphrase*.',
        '**Chave pública** (`~/.ssh/id_ed25519.pub`): pode ser compartilhada. Vai para o servidor, no arquivo `~/.ssh/authorized_keys` do usuário.',
        'Ao conectar, o servidor desafia seu computador a provar que tem a privada correspondente — sem que ela trafegue pela rede.',
      ],
    },
    {
      type: 'code',
      language: 'shell',
      code: `# No SEU computador (Linux, macOS ou Windows com PowerShell/WSL)
ssh-keygen -t ed25519 -C "voce@exemplo.com"

# Enviar a chave pública para o servidor (pede a senha uma última vez)
ssh-copy-id root@203.0.113.10

# Daí em diante, sem senha
ssh root@203.0.113.10`,
    },
    {
      type: 'p',
      text: 'Na primeira conexão, o SSH mostra a **impressão digital** (*fingerprint*) do servidor e pergunta se você confia nela. Ela fica salva em `~/.ssh/known_hosts`. Se um dia aparecer o aviso "REMOTE HOST IDENTIFICATION HAS CHANGED", investigue antes de continuar: pode ser uma reinstalação do servidor — ou alguém no meio do caminho.',
    },
    { type: 'h', text: 'Atalhos e cópia de arquivos' },
    {
      type: 'list',
      items: [
        'No `~/.ssh/config`, um bloco `Host loja` com `HostName`, `User` e `IdentityFile` permite conectar com `ssh loja`.',
        '`scp arquivo.sql loja:/home/deploy/` copia um arquivo.',
        '`rsync -avz pasta/ loja:/srv/pasta/` sincroniza pastas, enviando só o que mudou.',
      ],
    },
  ],
  analogy:
    'A chave pública é um cadeado que você distribui: qualquer servidor pode instalá-lo na porta. A chave privada é a única chave que abre esses cadeados, e ela nunca sai do seu bolso.',
  example: {
    language: 'shell',
    code: `cat ~/.ssh/config
ssh loja "hostname && whoami"`,
    lineByLine: [
      { line: 1, text: 'O arquivo de configuração com um atalho chamado loja.' },
      { line: 2, text: 'Conecta usando o atalho e executa dois comandos no servidor, sem abrir um terminal interativo.' },
    ],
    output: `Host loja
    HostName 203.0.113.10
    User deploy
    IdentityFile ~/.ssh/id_ed25519

vps-loja
deploy`,
  },
  commonErrors: [
    {
      title: 'Enviar a chave privada',
      wrong: 'ssh-copy-id -i ~/.ssh/id_ed25519 ...   # e depois colar o conteúdo dela em um chat',
      why: 'Quem tiver a chave privada entra em todos os servidores que confiam nela.',
      fix: 'Só a .pub é compartilhada. Se a privada vazar, gere outra e remova a antiga do authorized_keys de cada servidor.',
    },
    {
      title: '"Permission denied (publickey)"',
      why: 'A chave pública não está no authorized_keys do usuário certo, ou as permissões estão abertas demais (o SSH recusa ~/.ssh com permissão para outros).',
      fix: 'Confira o usuário, e no servidor: `chmod 700 ~/.ssh` e `chmod 600 ~/.ssh/authorized_keys`.',
    },
    {
      title: 'Ignorar o aviso de identificação alterada',
      why: 'Remover a linha do known_hosts sem pensar pode significar conectar em uma máquina falsa.',
      fix: 'Confirme no painel do provedor se o servidor foi reinstalado antes de aceitar a nova impressão digital.',
    },
  ],
  guidedExerciseId: 'ex-infra-02-guiado',
  independentExerciseId: 'ex-infra-02-independente',
  reviewQuestions: [
    { question: 'Qual chave vai para o servidor?', answer: 'A pública (.pub), no arquivo ~/.ssh/authorized_keys do usuário.' },
    { question: 'Para que serve o arquivo known_hosts?', answer: 'Guarda as impressões digitais dos servidores já confiados, para detectar se um deles mudou.' },
    { question: 'Qual a vantagem do rsync sobre o scp?', answer: 'O rsync envia só as diferenças e pode retomar transferências, o que é muito mais rápido para pastas grandes.' },
  ],
  summary: [
    'SSH abre um terminal criptografado no servidor.',
    'Chave privada fica com você; a pública vai para authorized_keys.',
    'ssh-keygen -t ed25519 e ssh-copy-id para começar.',
    '~/.ssh/config cria atalhos; scp e rsync copiam arquivos.',
  ],
  completionCriteria: ['Identificar o papel de cada chave (exercício guiado).', 'Escrever um atalho no ~/.ssh/config (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-02-guiado',
    type: 'multiple-choice',
    title: 'Qual arquivo vai para o servidor?',
    difficulty: 'iniciante',
    concepts: ['infra-ssh'],
    statement: 'Depois de rodar `ssh-keygen -t ed25519`, você tem `id_ed25519` e `id_ed25519.pub` em `~/.ssh`. O provedor pede uma chave para cadastrar na VPS. O que você cola no painel dele?',
    options: [
      { id: 'a', text: 'O conteúdo de id_ed25519.', feedback: 'Essa é a chave privada: ela nunca sai do seu computador.' },
      { id: 'b', text: 'O conteúdo de id_ed25519.pub.', feedback: 'Correto: a chave pública pode ser compartilhada e vai para o authorized_keys.' },
      { id: 'c', text: 'Os dois, para garantir.', feedback: 'Entregar a privada é dar a chave da casa a terceiros.' },
      { id: 'd', text: 'A passphrase da chave.', feedback: 'A passphrase protege a chave privada localmente; não vai para lugar nenhum.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: o par tem uma chave pública e uma privada.', 'Raciocínio: qual delas pode ser vista por qualquer pessoa sem risco?', 'Estrutura: a que termina em .pub.'],
    solution: { explanation: 'O servidor precisa apenas da chave pública (.pub). A privada prova sua identidade e deve ficar só com você, protegida por passphrase.' },
  },
  {
    id: 'ex-infra-02-independente',
    type: 'fill-blanks',
    title: 'Atalho para a VPS',
    difficulty: 'basico',
    concepts: ['infra-ssh'],
    language: 'shell',
    statement: 'Complete o `~/.ssh/config` para que `ssh api` conecte ao IP `198.51.100.7` com o usuário `deploy` e a chave `~/.ssh/id_ed25519`.',
    template: `[[0]] api
    [[1]] 198.51.100.7
    [[2]] deploy
    [[3]] ~/.ssh/id_ed25519`,
    blanks: [
      { accept: ['Host'], width: 5 },
      { accept: ['HostName', 'Hostname'], width: 9 },
      { accept: ['User'], width: 5 },
      { accept: ['IdentityFile'], width: 13 },
    ],
    hints: [
      'Conceito: cada bloco começa com o apelido e lista as opções da conexão.',
      'Raciocínio: o apelido, o endereço real, o usuário e o arquivo da chave.',
      'Estrutura: Host, HostName, User e IdentityFile.',
    ],
    solution: {
      code: `Host api
    HostName 198.51.100.7
    User deploy
    IdentityFile ~/.ssh/id_ed25519`,
      explanation: '`Host` define o apelido usado no comando; `HostName`, o endereço; `User`, o usuário remoto; `IdentityFile`, qual chave privada usar.',
    },
  },
];
