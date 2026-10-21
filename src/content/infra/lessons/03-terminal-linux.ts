import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-03',
  trackId: 'infra',
  moduleId: 'infra-m1',
  title: 'Terminal Linux essencial',
  durationMin: 30,
  objectives: [
    'Navegar e manipular arquivos no terminal.',
    'Ler e alterar permissões com ls -l, chmod e chown.',
    'Ver e encerrar processos.',
    'Gerenciar serviços com systemctl e ler logs com journalctl; instalar pacotes com apt.',
  ],
  prerequisites: ['infra-02'],
  concepts: ['infra-linux'],
  explanation: [
    { type: 'h', text: 'Arquivos e pastas' },
    {
      type: 'list',
      items: [
        '`pwd` (onde estou), `ls -la` (o que há aqui, inclusive ocultos), `cd /srv` (ir para), `cd ~` (pasta do usuário).',
        '`mkdir -p a/b`, `cp origem destino`, `mv origem destino` (move ou renomeia), `rm arquivo`, `rm -r pasta`.',
        '`cat`, `less` (rolar; sai com q), `tail -f /var/log/syslog` (acompanhar um log ao vivo), `grep erro app.log`.',
        '`nano arquivo` edita no terminal: Ctrl+O salva, Ctrl+X sai.',
        'Caminhos que começam com `/` são absolutos; os outros, relativos à pasta atual.',
      ],
    },
    { type: 'h', text: 'Permissões' },
    {
      type: 'p',
      text: '`ls -l` mostra algo como `-rw-r----- 1 deploy deploy`. São três grupos de permissões — **dono**, **grupo** e **outros** — com `r` (ler), `w` (escrever) e `x` (executar). Em números: r = 4, w = 2, x = 1, somados por grupo. `chmod 600 .env` deixa só o dono ler e escrever; `chmod 755 script.sh` deixa todos lerem e executarem, mas só o dono alterar. `chown deploy:deploy arquivo` troca o dono.',
    },
    { type: 'h', text: 'Processos, serviços e pacotes' },
    {
      type: 'list',
      items: [
        '`ps aux | grep node`, `htop` (painel interativo), `kill PID` (pede para encerrar), `kill -9 PID` (força).',
        '`sudo systemctl status|start|stop|restart|enable nginx`: gerencia serviços do systemd; `enable` liga no boot.',
        '`journalctl -u docker -f`: logs de um serviço, ao vivo. `journalctl -p err --since today`: só erros de hoje.',
        '`sudo apt update` (atualiza a lista de pacotes) e `sudo apt install -y htop` (instala).',
        '`sudo` executa um comando como administrador. Use só quando precisa.',
      ],
    },
  ],
  analogy:
    'O terminal é como dirigir com câmbio manual: no começo parece mais trabalhoso que clicar em ícones, mas dá controle preciso, funciona em qualquer servidor do mundo pela mesma "estrada" (SSH) e permite repetir exatamente a mesma manobra quantas vezes quiser.',
  example: {
    language: 'shell',
    code: `cd /srv/loja
ls -la
chmod 600 .env
ls -l .env
systemctl is-active docker`,
    lineByLine: [
      { line: 1, text: 'Vai para a pasta da aplicação.' },
      { line: 2, text: 'Lista com detalhes (permissões, dono, grupo, tamanho e data), inclusive os arquivos ocultos, que começam com ponto.' },
      { line: 3, text: 'O .env tem senhas: só o dono pode ler e escrever (6 = 4 + 2).' },
      { line: 5, text: 'Confere se o serviço do Docker está rodando.' },
    ],
    output: `total 20
drwxr-xr-x 3 deploy deploy 4096 Mar 15 10:02 .
drwxr-xr-x 3 root   root   4096 Mar 15 09:58 ..
-rw-r--r-- 1 deploy deploy  412 Mar 15 10:02 .env
-rw-r--r-- 1 deploy deploy 1204 Mar 15 10:02 compose.yaml
drwxr-xr-x 2 deploy deploy 4096 Mar 15 10:02 scripts
-rw------- 1 deploy deploy 412 Mar 15 10:02 .env
active`,
  },
  commonErrors: [
    {
      title: 'chmod 777 para "resolver" permissão negada',
      wrong: 'sudo chmod -R 777 /srv/loja',
      why: 'Qualquer usuário (ou processo invadido) passa a poder alterar e executar tudo.',
      fix: 'Descubra qual usuário precisa de acesso e ajuste dono (chown) e permissões mínimas (644, 600, 755).',
    },
    {
      title: 'rm -rf com caminho errado',
      wrong: 'sudo rm -rf / srv/loja/tmp   # um espaço a mais',
      why: 'O espaço transforma o comando em "apague / e srv/loja/tmp".',
      fix: 'Confira o caminho com ls antes, evite sudo para apagar e prefira caminhos absolutos sem espaços soltos.',
    },
    {
      title: 'Matar o processo em vez de reiniciar o serviço',
      wrong: 'kill -9 1234   # o processo do nginx',
      why: 'O systemd pode subir de novo sem a configuração correta, ou o serviço fica em estado inconsistente.',
      fix: 'Use `sudo systemctl restart nginx` para serviços gerenciados.',
    },
  ],
  guidedExerciseId: 'ex-infra-03-guiado',
  independentExerciseId: 'ex-infra-03-independente',
  reviewQuestions: [
    { question: 'O que significa a permissão 640?', answer: 'Dono lê e escreve (6), grupo só lê (4), outros não têm acesso (0).' },
    { question: 'Como acompanhar os logs de um serviço ao vivo?', answer: 'Com `journalctl -u nome-do-servico -f` (ou `tail -f` em um arquivo de log).' },
    { question: 'Qual a diferença entre systemctl start e enable?', answer: 'start inicia agora; enable faz o serviço iniciar automaticamente no boot.' },
  ],
  summary: [
    'ls, cd, cp, mv, rm, cat, less, tail -f e grep no dia a dia.',
    'Permissões: dono, grupo e outros; r = 4, w = 2, x = 1.',
    'Segredos com 600; nunca 777.',
    'systemctl para serviços, journalctl para logs, apt para pacotes.',
  ],
  completionCriteria: ['Escolher a permissão certa para um arquivo de senhas (exercício guiado).', 'Completar os comandos de diagnóstico de um serviço (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-03-guiado',
    type: 'multiple-choice',
    title: 'O arquivo de senhas',
    difficulty: 'iniciante',
    concepts: ['infra-linux'],
    statement: 'O arquivo `/srv/loja/.env` tem a senha do banco e pertence ao usuário `deploy`, que roda a aplicação. Qual permissão usar?',
    options: [
      { id: 'a', text: '`chmod 777 .env`', feedback: 'Todos poderiam ler, alterar e executar o arquivo.' },
      { id: 'b', text: '`chmod 644 .env`', feedback: 'Qualquer usuário do servidor conseguiria ler as senhas.' },
      { id: 'c', text: '`chmod 600 .env`', feedback: 'Correto: só o dono (deploy) lê e escreve.' },
      { id: 'd', text: '`chmod 000 .env`', feedback: 'Nem a aplicação conseguiria ler o arquivo.' },
    ],
    correctOptionId: 'c',
    hints: ['Conceito: três grupos (dono, grupo, outros), somando r = 4 e w = 2.', 'Raciocínio: só o dono precisa ler e escrever; mais ninguém.', 'Estrutura: 6 para o dono e 0 para os demais.'],
    solution: { explanation: '600 = dono com leitura e escrita (4 + 2), grupo e outros sem nada. Arquivos com segredos nunca devem ser legíveis por todos.' },
  },
  {
    id: 'ex-infra-03-independente',
    type: 'fill-blanks',
    title: 'Diagnóstico do serviço',
    difficulty: 'basico',
    concepts: ['infra-linux'],
    language: 'shell',
    statement: 'O Docker parou de responder. Complete os comandos para ver o estado do serviço, acompanhar os logs dele ao vivo e reiniciá-lo.',
    template: `sudo systemctl [[0]] docker
sudo journalctl [[1]] docker [[2]]
sudo systemctl [[3]] docker`,
    blanks: [
      { accept: ['status'], width: 7 },
      { accept: ['-u', '--unit'], width: 4 },
      { accept: ['-f', '--follow'], width: 4 },
      { accept: ['restart'], width: 8 },
    ],
    hints: [
      'Conceito: systemctl gerencia serviços; journalctl lê os logs do systemd.',
      'Raciocínio: journalctl precisa saber de qual unidade mostrar os logs e se deve seguir o arquivo.',
      'Estrutura: status, -u, -f e restart.',
    ],
    solution: {
      code: `sudo systemctl status docker
sudo journalctl -u docker -f
sudo systemctl restart docker`,
      explanation: '`status` mostra se o serviço está ativo e as últimas linhas de log; `journalctl -u docker -f` acompanha os logs ao vivo (Ctrl+C sai); `restart` reinicia pelo systemd.',
    },
  },
];
