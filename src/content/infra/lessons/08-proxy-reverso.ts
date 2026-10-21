import type { Exercise, Lesson } from '../../../types/content';

export const lesson: Lesson = {
  id: 'infra-08',
  trackId: 'infra',
  moduleId: 'infra-m3',
  title: 'Proxy reverso: vários sites em uma VPS',
  durationMin: 25,
  objectives: [
    'Explicar o papel de um proxy reverso.',
    'Direcionar domínios para aplicações em portas internas.',
    'Conhecer Nginx, Caddy e Traefik (usado pelo EasyPanel).',
    'Preservar o IP real do cliente com os cabeçalhos X-Forwarded-*.',
  ],
  prerequisites: ['infra-07'],
  concepts: ['infra-proxy'],
  explanation: [
    {
      type: 'p',
      text: 'Só um programa pode escutar na porta 443 de cada vez. Para ter `app.minhaloja.com.br`, `api.minhaloja.com.br` e `painel.minhaloja.com.br` na mesma VPS, um **proxy reverso** ocupa as portas 80 e 443, olha o nome pedido (cabeçalho `Host`) e repassa a requisição para a aplicação certa, que escuta em uma porta interna (3000, 8080...).',
    },
    {
      type: 'list',
      items: [
        'Ele também cuida do **HTTPS** (próxima aula), da compressão, de limites de tamanho de upload e de redirecionamentos.',
        'As aplicações deixam de ser expostas diretamente: só o proxy fala com a internet.',
        '**Nginx**: o mais usado, configurado em arquivos. **Caddy**: configuração curta e HTTPS automático. **Traefik**: descobre containers Docker sozinho; é o que o EasyPanel usa por baixo.',
      ],
    },
    {
      type: 'code',
      language: 'shell',
      code: `# Caddyfile: dois domínios, duas aplicações internas
app.minhaloja.com.br {
    reverse_proxy localhost:3000
}

api.minhaloja.com.br {
    reverse_proxy localhost:8080
}`,
    },
    { type: 'h', text: 'O IP do cliente' },
    {
      type: 'p',
      text: 'Para a aplicação, todas as requisições parecem vir do proxy (127.0.0.1 ou o IP do container dele). O IP real chega no cabeçalho `X-Forwarded-For`, e o protocolo original (https) em `X-Forwarded-Proto`. Configure a aplicação para confiar nesses cabeçalhos **apenas** quando vierem do proxy — senão qualquer cliente pode falsificá-los.',
    },
  ],
  analogy:
    'O proxy reverso é a recepção de um prédio comercial com um único endereço: o visitante diz "vim à empresa X" e a recepcionista o encaminha ao andar certo. As empresas não precisam de portaria própria na calçada.',
  example: {
    language: 'shell',
    code: `# A aplicação responde na porta interna...
curl -s localhost:8080/saude

# ...e o proxy entrega pelo domínio, com HTTPS
curl -sI https://api.minhaloja.com.br/saude | head -3`,
    lineByLine: [
      { line: 2, text: 'Teste direto na porta interna, de dentro da VPS.' },
      { line: 5, text: 'Teste pelo caminho que o usuário usa: DNS → proxy (443) → aplicação (8080). -I mostra só os cabeçalhos.' },
    ],
    output: `{"status":"ok"}
HTTP/2 200
content-type: application/json
date: Sun, 15 Mar 2026 13:02:11 GMT`,
  },
  commonErrors: [
    {
      title: 'Aplicação escutando em 0.0.0.0 com porta aberta',
      why: 'Além do domínio com HTTPS, a aplicação fica acessível direto pelo IP:porta, sem o proxy e sem HTTPS.',
      fix: 'Faça a aplicação escutar só na rede interna (localhost ou rede do Docker) e libere no firewall apenas 80 e 443.',
    },
    {
      title: '502 Bad Gateway',
      why: 'O proxy não consegue falar com a aplicação: ela caiu, está em outra porta ou em outra rede.',
      fix: 'Teste a porta interna (curl localhost:PORTA), confira os logs da aplicação e a porta configurada no proxy.',
    },
    {
      title: 'Confiar em X-Forwarded-For de qualquer origem',
      why: 'Um cliente pode enviar o cabeçalho com um IP falso e burlar limites por IP ou registros de auditoria.',
      fix: 'Confie no cabeçalho só quando a conexão vier do proxy (a maioria dos frameworks tem uma opção de "proxies confiáveis").',
    },
  ],
  guidedExerciseId: 'ex-infra-08-guiado',
  independentExerciseId: 'ex-infra-08-independente',
  reviewQuestions: [
    { question: 'Como o proxy reverso sabe para qual aplicação enviar a requisição?', answer: 'Pelo nome pedido (cabeçalho Host / SNI) e, se configurado, pelo caminho da URL.' },
    { question: 'O que costuma significar um 502 Bad Gateway?', answer: 'Que o proxy não conseguiu se comunicar com a aplicação de destino.' },
    { question: 'Onde a aplicação encontra o IP real do cliente?', answer: 'No cabeçalho X-Forwarded-For, que deve ser aceito apenas quando vem do proxy.' },
  ],
  summary: [
    'O proxy reverso ocupa 80/443 e distribui por domínio.',
    'Aplicações escutam em portas internas, sem exposição direta.',
    'Nginx, Caddy e Traefik (o do EasyPanel).',
    '502 = proxy não alcança a aplicação; X-Forwarded-For traz o IP real.',
  ],
  completionCriteria: ['Mapear domínios para portas internas (exercício guiado).', 'Diagnosticar um 502 (exercício independente).'],
};

export const exercises: Exercise[] = [
  {
    id: 'ex-infra-08-guiado',
    type: 'fill-blanks',
    title: 'Dois domínios, duas portas',
    difficulty: 'basico',
    concepts: ['infra-proxy'],
    language: 'shell',
    statement: 'O front-end roda na porta 3000 e a API na 8080, ambos na mesma VPS. Complete o Caddyfile para que `minhaloja.com.br` mostre o front-end e `api.minhaloja.com.br`, a API.',
    template: `minhaloja.com.br {
    reverse_proxy localhost:[[0]]
}

[[1]] {
    reverse_proxy localhost:[[2]]
}`,
    blanks: [
      { accept: ['3000'], width: 5 },
      { accept: ['api.minhaloja.com.br'], width: 21 },
      { accept: ['8080'], width: 5 },
    ],
    hints: [
      'Conceito: cada bloco começa com o domínio e diz para onde repassar.',
      'Raciocínio: qual porta é de qual aplicação?',
      'Estrutura: 3000 para o site e 8080 para a API, no bloco do subdomínio api.',
    ],
    solution: {
      code: `minhaloja.com.br {
    reverse_proxy localhost:3000
}

api.minhaloja.com.br {
    reverse_proxy localhost:8080
}`,
      explanation: 'O Caddy escuta 80/443 para os dois nomes, obtém certificados automaticamente e repassa cada um para a porta interna da aplicação correspondente.',
    },
  },
  {
    id: 'ex-infra-08-independente',
    type: 'multiple-choice',
    title: '502 depois do deploy',
    difficulty: 'intermediario',
    concepts: ['infra-proxy'],
    language: 'shell',
    statement: 'Depois de um deploy, `https://api.minhaloja.com.br` responde **502 Bad Gateway**. De dentro da VPS, você testa:',
    code: `$ curl -s localhost:8080/saude
curl: (7) Failed to connect to localhost port 8080: Connection refused
$ docker logs api --tail 2
listening on :3000
GET /saude 200`,
    options: [
      { id: 'a', text: 'O certificado HTTPS expirou.', feedback: 'Com certificado expirado, o navegador mostraria um erro de certificado, não um 502.' },
      { id: 'b', text: 'A nova versão escuta na porta 3000, mas o proxy continua mandando para a 8080. Corrija a porta da aplicação ou a do proxy.', feedback: 'Correto: o log mostra a porta 3000 e o proxy tenta a 8080.' },
      { id: 'c', text: 'O DNS ainda aponta para o servidor antigo.', feedback: 'O 502 vem do seu próprio proxy: o DNS já chegou nele.' },
      { id: 'd', text: 'O firewall bloqueou a porta 443.', feedback: 'Se a 443 estivesse bloqueada, a conexão nem chegaria ao proxy.' },
    ],
    correctOptionId: 'b',
    hints: ['Conceito: 502 = o proxy não alcança a aplicação.', 'Raciocínio: compare a porta que o proxy usa com a porta do log da aplicação.', 'Estrutura: uma das duas configurações precisa mudar.'],
    solution: { explanation: '"Connection refused" na 8080 e "listening on :3000" no log mostram que a aplicação mudou de porta. Ajuste a variável PORT da aplicação para 8080 ou a porta de destino no proxy (no EasyPanel, a porta do domínio do serviço).' },
  },
];
