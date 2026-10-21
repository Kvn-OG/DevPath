import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-07',
  trackId: 'infra',
  moduleId: 'infra-m3',
  title: 'DNS: apontando um domínio para a VPS',
  durationMin: 25,
  objectives: [
    'Explicar como o DNS transforma nomes em endereços IP.',
    'Usar os registros A, AAAA, CNAME, TXT e MX.',
    'Entender TTL e propagação.',
    'Conferir registros com dig.',
  ],
  prerequisites: ['infra-06'],
  concepts: ['infra-dns'],
  explanation: [
    {
      type: 'p',
      text: 'O **DNS** é a lista telefônica da internet: transforma `api.minhaloja.com.br` no IP da sua VPS. Você compra o domínio em um registrador (Registro.br para .br, ou outros) e cria os **registros** no painel de DNS (do registrador, do Cloudflare, do provedor da VPS).',
    },
    {
      type: 'list',
      items: [
        '**A**: nome → endereço IPv4. `api.minhaloja.com.br → 203.0.113.10`.',
        '**AAAA**: nome → endereço IPv6.',
        '**CNAME**: nome → outro nome (um apelido). `www → minhaloja.com.br`. Não pode ser usado no domínio raiz.',
        '**TXT**: textos de verificação (provar que o domínio é seu) e de e-mail (SPF, DKIM).',
        '**MX**: quais servidores recebem os e-mails do domínio.',
      ],
    },
    {
      type: 'p',
      text: 'Para hospedar várias aplicações na mesma VPS, aponte vários subdomínios para o mesmo IP (`app`, `api`, `painel`). Um registro curinga `*.minhaloja.com.br` cobre todos de uma vez. Quem decide qual aplicação responde a cada nome é o **proxy reverso** (próxima aula).',
    },
    { type: 'h', text: 'TTL e propagação' },
    {
      type: 'p',
      text: 'Cada registro tem um **TTL** (*time to live*): por quantos segundos os servidores podem guardar a resposta em cache. Com TTL de 3600, uma mudança pode levar até uma hora para chegar a todos. Antes de uma migração, baixe o TTL para 300 e espere o TTL antigo expirar.',
    },
  ],
  analogy:
    'O DNS é a agenda de contatos da internet: você procura "api.minhaloja" e ela devolve o "número" (o IP). Cada pessoa guarda uma cópia da agenda por um tempo (o TTL) — por isso, quando você muda de número, alguns ainda ligam para o antigo por um tempo.',
  example: {
    language: 'shell',
    code: `dig +short api.minhaloja.com.br A
dig +short www.minhaloja.com.br
dig api.minhaloja.com.br A +noall +answer`,
    lineByLine: [
      { line: 1, text: 'Pergunta o registro A: a resposta é o IP da VPS.' },
      { line: 2, text: 'O www é um CNAME: o dig mostra o nome de destino e depois o IP final.' },
      { line: 3, text: 'A resposta completa mostra também o TTL restante (300 segundos).' },
    ],
    output: `203.0.113.10
minhaloja.com.br.
203.0.113.10
api.minhaloja.com.br.	300	IN	A	203.0.113.10`,
  },
  commonErrors: [
    {
      title: 'CNAME no domínio raiz',
      wrong: 'minhaloja.com.br.  CNAME  app.plataforma.com.',
      why: 'O domínio raiz precisa de outros registros (como SOA, NS e MX) e não pode ser CNAME.',
      fix: 'Use A/AAAA na raiz, ou o recurso de "CNAME flattening"/ALIAS do seu provedor de DNS.',
    },
    {
      title: 'Achar que o DNS "não funcionou"',
      why: 'Com TTL alto, seu computador (ou provedor de internet) ainda usa a resposta antiga em cache.',
      fix: 'Confira com `dig @1.1.1.1 nome` e aguarde o TTL. Planeje mudanças baixando o TTL antes.',
    },
    {
      title: 'Proxy do Cloudflare na hora do certificado',
      why: 'Com a "nuvem laranja" ligada, o IP mostrado é o do Cloudflare e algumas validações de certificado falham ou entram em loop de redirecionamento.',
      fix: 'Deixe o registro só como DNS (nuvem cinza) até o HTTPS da VPS funcionar; depois, se ativar o proxy, use o modo SSL "Full (strict)".',
    },
  ],
  guidedExerciseId: 'ex-infra-07-guiado',
  independentExerciseId: 'ex-infra-07-independente',
  reviewQuestions: [
    { question: 'Qual registro aponta um nome para um IPv4?', answer: 'O registro A.' },
    { question: 'O que o TTL controla?', answer: 'Por quanto tempo os resolvedores podem guardar a resposta em cache antes de perguntar de novo.' },
    { question: 'Como várias aplicações podem usar a mesma VPS?', answer: 'Apontando vários subdomínios para o mesmo IP; o proxy reverso direciona cada nome para a aplicação certa.' },
  ],
  summary: [
    'DNS traduz nomes em IPs.',
    'A (IPv4), AAAA (IPv6), CNAME (apelido), TXT (verificações), MX (e-mail).',
    'TTL define o cache; baixe antes de migrar.',
    'dig confere o que o mundo está vendo.',
  ],
  completionCriteria: ['Escolher o registro certo para cada caso (exercício guiado).', 'Diagnosticar uma mudança de IP que "não pegou" (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-07-guiado',
    type: 'multiple-choice',
    title: 'Apontando a API',
    difficulty: 'iniciante',
    concepts: ['infra-dns'],
    statement: 'Você quer que `api.minhaloja.com.br` aponte para a VPS de IP `203.0.113.10`. Qual registro criar?',
    options: [
      { id: 'a', text: 'MX api → 203.0.113.10', feedback: 'MX define servidores de e-mail.' },
      { id: 'b', text: 'A api → 203.0.113.10', feedback: 'Correto: registro A liga o nome a um endereço IPv4.' },
      { id: 'c', text: 'CNAME api → 203.0.113.10', feedback: 'CNAME aponta para outro nome, não para um IP.' },
      { id: 'd', text: 'TXT api → 203.0.113.10', feedback: 'TXT guarda textos, como verificações; não direciona tráfego.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: cada tipo de registro tem um papel.', 'Raciocínio: o destino é um endereço IPv4.', 'Estrutura: nome → IPv4 é o registro mais básico.'],
    solution: { explanation: 'Registros A associam nomes a endereços IPv4. Se a VPS tiver IPv6, crie também um AAAA com o endereço IPv6.' },
  },
  {
    id: 'ex-infra-07-independente',
    type: 'multiple-choice',
    title: 'A mudança que não pegou',
    difficulty: 'basico',
    concepts: ['infra-dns'],
    language: 'shell',
    statement: 'Você migrou a aplicação para uma VPS nova e trocou o registro A há 10 minutos, mas seu navegador ainda abre o servidor antigo. O registro tinha TTL de 86400. O que está acontecendo?',
    code: `$ dig +short app.minhaloja.com.br @1.1.1.1
198.51.100.20   # IP novo
$ dig +short app.minhaloja.com.br
203.0.113.10    # IP antigo, vindo do resolvedor do seu provedor`,
    options: [
      { id: 'a', text: 'O registro foi salvo errado no painel.', feedback: 'O resolvedor 1.1.1.1 já devolve o IP novo: o registro está certo.' },
      { id: 'b', text: 'Resolvedores ainda têm a resposta antiga em cache, válida por até 24 horas (TTL de 86400 s).', feedback: 'Correto: o cache só expira depois do TTL.' },
      { id: 'c', text: 'A VPS nova está desligada.', feedback: 'O problema aparece antes de chegar a qualquer VPS: no DNS.' },
      { id: 'd', text: 'É preciso criar um CNAME além do A.', feedback: 'Não; um registro A é suficiente.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: o TTL define por quanto tempo uma resposta fica em cache.', 'Raciocínio: 86400 segundos são quantas horas?', 'Estrutura: compare a resposta de 1.1.1.1 com a do seu resolvedor.'],
    solution: { explanation: 'O resolvedor do seu provedor guardou a resposta antiga por até 86400 s (24 h). Em migrações, baixe o TTL para 300 um dia antes; assim a troca se espalha em minutos. Mantenha o servidor antigo no ar até o tráfego migrar.' },
  },
];
