import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-06',
  trackId: 'infra',
  moduleId: 'infra-m2',
  title: 'Atualizações de segurança e fail2ban',
  durationMin: 20,
  objectives: [
    'Atualizar o sistema e saber quando é preciso reiniciar.',
    'Ativar atualizações automáticas de segurança.',
    'Bloquear tentativas repetidas de login com fail2ban.',
    'Ler o log de autenticação.',
  ],
  prerequisites: ['infra-05'],
  concepts: ['infra-atualizacoes'],
  explanation: [
    { type: 'h', text: 'Atualizações' },
    {
      type: 'p',
      text: 'A maioria das invasões explora falhas **já corrigidas** em versões novas. Mantenha o sistema atualizado:',
    },
    {
      type: 'code',
      language: 'shell',
      code: `sudo apt update && sudo apt upgrade -y
# Se o kernel ou bibliotecas centrais mudaram:
[ -f /var/run/reboot-required ] && echo "reinicie em um horário tranquilo"`,
    },
    {
      type: 'p',
      text: 'No Ubuntu, o pacote **unattended-upgrades** instala sozinho as atualizações de segurança todos os dias. Ative com `sudo dpkg-reconfigure -plow unattended-upgrades`. As atualizações de versão de programas (e de imagens Docker) continuam com você, com teste antes.',
    },
    { type: 'h', text: 'fail2ban' },
    {
      type: 'p',
      text: 'O **fail2ban** lê os logs e, quando um IP erra o login várias vezes em pouco tempo, bloqueia esse IP no firewall por um período. Com login por chave o SSH já está protegido, mas o fail2ban reduz o ruído nos logs e protege outros serviços.',
    },
    {
      type: 'code',
      language: 'shell',
      code: `sudo apt install -y fail2ban
# /etc/fail2ban/jail.local
[sshd]
enabled  = true
maxretry = 5
findtime = 10m
bantime  = 1h`,
    },
    {
      type: 'p',
      text: 'O log de autenticação mostra quem tentou entrar: `sudo journalctl -u ssh --since today` ou `/var/log/auth.log`. Ver centenas de tentativas por dia é normal em uma VPS pública — e é o motivo das aulas anteriores.',
    },
  ],
  analogy:
    'Atualizar o sistema é trocar fechaduras assim que o fabricante avisa que um modelo foi quebrado. O fail2ban é o porteiro que, depois de ver alguém tentar cinco chaves erradas, chama a segurança e o proíbe de voltar por uma hora.',
  example: {
    language: 'shell',
    code: `sudo fail2ban-client status sshd`,
    lineByLine: [{ line: 1, text: 'Mostra quantas falhas foram vistas e quais IPs estão bloqueados no jail do SSH.' }],
    output: `Status for the jail: sshd
|- Filter
|  |- Currently failed: 3
|  |- Total failed:     1287
|  \`- Journal matches:  _SYSTEMD_UNIT=ssh.service + _COMM=sshd
\`- Actions
   |- Currently banned: 4
   |- Total banned:     96
   \`- Banned IP list:   192.0.2.15 198.51.100.44 203.0.113.201 203.0.113.87`,
  },
  commonErrors: [
    {
      title: 'Nunca reiniciar',
      why: 'Atualizações do kernel só valem depois de reiniciar; o servidor segue vulnerável por meses.',
      fix: 'Confira /var/run/reboot-required e agende reinícios em horários de pouco acesso.',
    },
    {
      title: 'Bloquear o próprio IP',
      why: 'Testando o login várias vezes, você mesmo cai no fail2ban.',
      fix: 'Inclua seu IP fixo em `ignoreip` no jail.local, ou desbloqueie com `sudo fail2ban-client set sshd unbanip SEU_IP`.',
    },
    {
      title: 'Editar o jail.conf',
      why: 'Atualizações do pacote sobrescrevem esse arquivo.',
      fix: 'Coloque suas configurações em jail.local.',
    },
  ],
  guidedExerciseId: 'ex-infra-06-guiado',
  independentExerciseId: 'ex-infra-06-independente',
  reviewQuestions: [
    { question: 'O que o unattended-upgrades faz?', answer: 'Instala automaticamente as atualizações de segurança do sistema.' },
    { question: 'Como saber se o servidor precisa ser reiniciado depois de uma atualização?', answer: 'Verificando se existe o arquivo /var/run/reboot-required.' },
    { question: 'O que o fail2ban faz quando um IP erra o login várias vezes?', answer: 'Bloqueia esse IP no firewall por um tempo (bantime).' },
  ],
  summary: [
    'apt update && apt upgrade com frequência; reinicie quando pedido.',
    'unattended-upgrades para correções de segurança automáticas.',
    'fail2ban bloqueia IPs com falhas repetidas; configure em jail.local.',
    'Logs de autenticação mostram as tentativas.',
  ],
  completionCriteria: ['Interpretar a configuração do fail2ban (exercício guiado).', 'Avaliar a necessidade de reiniciar após atualizações (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-06-guiado',
    type: 'multiple-choice',
    title: 'Lendo o jail',
    difficulty: 'basico',
    concepts: ['infra-atualizacoes'],
    language: 'shell',
    statement: 'Com esta configuração, o que acontece com um IP que erra a senha do SSH 6 vezes em 5 minutos?',
    code: `[sshd]
enabled  = true
maxretry = 5
findtime = 10m
bantime  = 1h`,
    options: [
      { id: 'a', text: 'Nada: o limite é por dia.', feedback: 'A janela de contagem é o findtime (10 minutos).' },
      { id: 'b', text: 'Fica bloqueado por 1 hora.', feedback: 'Correto: passou de 5 falhas dentro de 10 minutos, então é banido por 1 hora.' },
      { id: 'c', text: 'Fica bloqueado para sempre.', feedback: 'O bantime é de 1 hora.' },
      { id: 'd', text: 'O servidor desliga o SSH.', feedback: 'Só o IP é bloqueado; o serviço continua para os demais.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: maxretry, findtime e bantime.', 'Raciocínio: 6 falhas em 5 minutos passam do limite dentro da janela?', 'Estrutura: mais de maxretry em findtime → ban por bantime.'],
    solution: { explanation: 'O fail2ban conta as falhas dentro de uma janela de 10 minutos; ao chegar a 5, bloqueia o IP por 1 hora.' },
  },
  {
    id: 'ex-infra-06-independente',
    type: 'true-false',
    title: 'Atualizei, estou seguro?',
    difficulty: 'basico',
    concepts: ['infra-atualizacoes'],
    statement: 'Você rodou `sudo apt upgrade`, que instalou um kernel novo com correção de segurança, e não reiniciou a VPS.',
    claim: 'A correção do kernel já está valendo.',
    answer: false,
    justifications: [
      { id: 'a', text: 'O kernel em execução continua sendo o antigo até a máquina reiniciar; o arquivo /var/run/reboot-required avisa isso.' },
      { id: 'b', text: 'O apt upgrade não instala kernels.' },
      { id: 'c', text: 'Está valendo, porque o apt reinicia o kernel sozinho.' },
      { id: 'd', text: 'Kernels de VPS são atualizados pelo provedor, não pelo apt.' },
    ],
    correctJustificationId: 'a',
    hints: ['Conceito: o kernel é carregado no boot.', 'Raciocínio: o que precisa acontecer para o kernel novo ser carregado?', 'Estrutura: procure o arquivo reboot-required.'],
    solution: { explanation: 'Falso. O pacote foi instalado, mas o kernel carregado na memória é o anterior. É preciso reiniciar (em um horário tranquilo) para a correção valer.' },
  },
];
