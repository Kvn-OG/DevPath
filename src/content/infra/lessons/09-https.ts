import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-09',
  trackId: 'infra',
  moduleId: 'infra-m3',
  title: "HTTPS com Let's Encrypt",
  durationMin: 25,
  objectives: [
    'Explicar o que o HTTPS protege e o papel do certificado.',
    "Entender como o Let's Encrypt emite certificados (ACME, desafio HTTP-01).",
    'Garantir a renovação automática e o redirecionamento de HTTP para HTTPS.',
    'Diagnosticar falhas comuns na emissão.',
  ],
  prerequisites: ['infra-08'],
  concepts: ['infra-https'],
  explanation: [
    {
      type: 'p',
      text: 'O **HTTPS** criptografa a conversa entre o navegador e o servidor (senhas, tokens e dados pessoais não trafegam em texto puro) e prova que o servidor é mesmo o dono do domínio. Essa prova é o **certificado**, assinado por uma autoridade em que os navegadores confiam.',
    },
    {
      type: 'p',
      text: "O **Let's Encrypt** emite certificados gratuitos e automáticos pelo protocolo **ACME**. No desafio mais comum (**HTTP-01**), ele pede um arquivo em `http://seu-dominio/.well-known/acme-challenge/...`; se conseguir buscá-lo, o domínio é seu. Os certificados valem **90 dias** e são renovados automaticamente — Caddy, Traefik (EasyPanel) e o certbot fazem isso sozinhos.",
    },
    { type: 'h', text: 'Para a emissão funcionar' },
    {
      type: 'list',
      items: [
        'O DNS do domínio precisa apontar para a VPS **antes** de pedir o certificado.',
        'A porta **80** precisa estar aberta (o desafio HTTP-01 usa HTTP).',
        'Há limites de tentativas: muitos pedidos que falham seguidos geram um bloqueio temporário. Corrija o DNS e o firewall antes de insistir.',
        'Para certificados curinga (`*.minhaloja.com.br`), usa-se o desafio DNS-01, com acesso à API do seu DNS.',
      ],
    },
    {
      type: 'callout',
      tone: 'tip',
      title: 'Depois do certificado',
      text: 'Redirecione todo HTTP para HTTPS (301), marque cookies de sessão como `Secure` e, quando tudo estiver estável, considere o cabeçalho HSTS, que faz o navegador usar sempre HTTPS para o domínio.',
    },
  ],
  analogy:
    'O certificado é o crachá do servidor, emitido por uma portaria em que todos confiam. Para emitir o crachá, o Let\'s Encrypt faz um teste simples: deixa um bilhete com um código e pede que o servidor o mostre em um endereço do domínio. Quem consegue mostrar, controla o domínio.',
  example: {
    language: 'shell',
    code: `curl -sI http://api.minhaloja.com.br | head -2
echo | openssl s_client -connect api.minhaloja.com.br:443 -servername api.minhaloja.com.br 2>/dev/null \\
  | openssl x509 -noout -issuer -dates`,
    lineByLine: [
      { line: 1, text: 'Pelo HTTP, o servidor responde com um redirecionamento permanente para o HTTPS.' },
      { line: 2, text: 'Conecta na 443 e mostra quem emitiu o certificado e as datas de validade (90 dias).' },
    ],
    output: `HTTP/1.1 308 Permanent Redirect
Location: https://api.minhaloja.com.br/
issuer=C = US, O = Let's Encrypt, CN = R12
notBefore=Mar  1 04:12:33 2026 GMT
notAfter=May 30 04:12:32 2026 GMT`,
  },
  commonErrors: [
    {
      title: 'Pedir o certificado antes de o DNS apontar',
      why: "O Let's Encrypt tenta o desafio no IP antigo (ou em lugar nenhum) e falha; repetir muitas vezes leva a um bloqueio temporário.",
      fix: 'Confira com `dig +short dominio` que o IP é o da VPS e só então emita.',
    },
    {
      title: 'Porta 80 fechada',
      wrong: 'sudo ufw allow 443/tcp   # e só',
      why: 'O desafio HTTP-01 precisa da porta 80; a renovação automática também falha meses depois.',
      fix: 'Libere 80 e 443 e redirecione o HTTP para o HTTPS em vez de bloqueá-lo.',
    },
    {
      title: 'Loop de redirecionamento com proxy na frente',
      why: 'Um proxy externo (como o Cloudflare em modo "Flexible") fala HTTP com a VPS, que redireciona para HTTPS, e assim por diante.',
      fix: 'Use o modo "Full (strict)" no proxy externo, com certificado válido também na VPS.',
    },
  ],
  guidedExerciseId: 'ex-infra-09-guiado',
  independentExerciseId: 'ex-infra-09-independente',
  reviewQuestions: [
    { question: 'O que o desafio HTTP-01 verifica?', answer: 'Que quem pede o certificado controla o domínio, servindo um arquivo de verificação na porta 80.' },
    { question: "Quanto tempo vale um certificado do Let's Encrypt?", answer: '90 dias, com renovação automática pelas ferramentas.' },
    { question: 'Por que manter a porta 80 aberta mesmo com HTTPS?', answer: 'Para os desafios de emissão e renovação e para redirecionar quem digita http:// para o HTTPS.' },
  ],
  summary: [
    'HTTPS criptografa e autentica o servidor com um certificado.',
    "Let's Encrypt: gratuito, ACME, 90 dias, renovação automática.",
    'DNS apontando e porta 80 aberta antes de emitir.',
    'Redirecione HTTP para HTTPS; cuidado com proxies externos.',
  ],
  completionCriteria: ['Ordenar a emissão de um certificado (exercício guiado).', 'Diagnosticar uma falha de emissão (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-09-guiado',
    type: 'order-steps',
    title: 'Do domínio ao cadeado',
    difficulty: 'basico',
    concepts: ['infra-https', 'infra-dns'],
    statement: 'Ordene os passos para colocar `api.minhaloja.com.br` no ar com HTTPS em uma VPS com proxy reverso.',
    steps: [
      { id: 'a', text: 'Criar o registro A de api apontando para o IP da VPS.' },
      { id: 'b', text: 'Conferir com dig que o nome já resolve para o IP certo.' },
      { id: 'c', text: 'Garantir que as portas 80 e 443 estão abertas no firewall.' },
      { id: 'd', text: "Configurar o domínio no proxy, que pede o certificado ao Let's Encrypt." },
      { id: 'e', text: 'Testar o HTTPS e o redirecionamento de HTTP para HTTPS.' },
    ],
    hints: [
      'Conceito: a emissão depende de DNS e de porta 80.',
      'Raciocínio: o Let\'s Encrypt precisa encontrar a sua VPS pelo nome.',
      'Estrutura: DNS → conferir → firewall → proxy/certificado → testar.',
    ],
    solution: { explanation: 'Sem o DNS apontando e a porta 80 aberta, o desafio falha. Com eles prontos, o proxy obtém o certificado sozinho; por fim, teste HTTPS e redirecionamento.' },
  },
  {
    id: 'ex-infra-09-independente',
    type: 'multiple-choice',
    title: 'Certificado que não sai',
    difficulty: 'intermediario',
    concepts: ['infra-https'],
    language: 'shell',
    statement: 'O log do proxy mostra o erro abaixo ao pedir o certificado. O DNS já aponta para a VPS. Qual a causa mais provável?',
    code: `acme: error: 400 :: urn:ietf:params:acme:error:connection ::
Timeout during connect (likely firewall problem)
while fetching http://api.minhaloja.com.br/.well-known/acme-challenge/...`,
    options: [
      { id: 'a', text: 'O domínio expirou.', feedback: 'O DNS está funcionando, e o erro é de conexão.' },
      { id: 'b', text: 'A porta 80 está bloqueada no UFW ou no firewall do provedor.', feedback: 'Correto: o Let\'s Encrypt não conseguiu se conectar via HTTP para buscar o arquivo do desafio.' },
      { id: 'c', text: 'Falta o certificado intermediário.', feedback: 'O certificado nem foi emitido; o problema é anterior.' },
      { id: 'd', text: 'É preciso esperar 90 dias.', feedback: '90 dias é a validade do certificado, não um prazo de espera.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: o desafio HTTP-01 acessa o domínio pela porta 80.', 'Raciocínio: "Timeout during connect" indica que nada respondeu.', 'Estrutura: confira os dois firewalls.'],
    solution: { explanation: 'O desafio precisa da porta 80. Libere com `sudo ufw allow 80/tcp` e confira o firewall do painel do provedor; depois, peça o certificado de novo.' },
  },
];
