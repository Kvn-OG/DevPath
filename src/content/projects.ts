import type { Project } from '../types/content';

// Projeto A: cada etapa recebe como código inicial o código final da etapa anterior
// (ver domain/projects.ts), então o estudante constrói o sistema incrementalmente.

const projetoA: Project = {
  id: 'projeto-a-comissoes',
  letter: 'A',
  title: 'Calculadora de comissões e metas',
  description:
    'Um módulo de cálculo para a equipe de vendas: comissão por faixa, acompanhamento de metas e relatório da equipe. Você constrói o sistema em cinco etapas, reaproveitando o código de cada etapa na seguinte.',
  trackId: 'logica-js',
  status: 'completo',
  topics: ['variáveis', 'funções', 'condicionais', 'operadores', 'validação de entradas', 'arrays e objetos'],
  requiredLessonIds: ['logica-07'],
  steps: [
    {
      id: 'a1',
      title: 'Etapa 1 — Comissão com validação',
      explanation: [
        { type: 'p', text: 'Toda regra de negócio começa pela função mais simples. Aqui, a comissão é um percentual sobre as vendas — mas entradas inválidas (negativas) não podem gerar valores sem sentido.' },
        { type: 'p', text: 'Valores monetários devem ser arredondados para 2 casas: `Math.round(valor * 100) / 100`.' },
      ],
      acceptanceCriteria: [
        'calcularComissao(2000, 5) devolve 100.',
        'Vendas ou percentual negativos devolvem 0.',
        'O resultado é arredondado para 2 casas decimais.',
      ],
      reflectionPrompt: 'Por que validar as entradas dentro da função, em vez de confiar que quem chama sempre enviará valores corretos?',
      exercise: {
        id: 'projeto-a-1',
        type: 'code',
        task: 'write-function',
        title: 'calcularComissao',
        difficulty: 'basico',
        concepts: ['funcoes', 'condicionais'],
        statement: 'Escreva calcularComissao(valorVendas, percentual).',
        starterCode: `function calcularComissao(valorVendas, percentual) {
  // valide as entradas e calcule a comissão
}`,
        tests: [
          { name: '(2000, 5) → 100', code: 'return calcularComissao(2000, 5);', expected: 100 },
          { name: '(1234.56, 3) → 37.04', code: 'return calcularComissao(1234.56, 3);', expected: 37.04 },
          { name: 'Vendas negativas → 0', code: 'return calcularComissao(-100, 5);', expected: 0 },
          { name: 'Percentual negativo → 0', code: 'return calcularComissao(1000, -2);', expected: 0 },
          { name: 'Vendas zero → 0', code: 'return calcularComissao(0, 5);', expected: 0, hidden: true },
        ],
        hints: [
          'Conceito: cláusula de guarda (if no início que devolve cedo) e arredondamento.',
          'Raciocínio: primeiro descarte os casos inválidos; depois calcule; por fim arredonde.',
          'Estrutura: if (valorVendas < 0 || percentual < 0) return 0; const comissao = valorVendas * percentual / 100; return Math.round(comissao * 100) / 100;',
        ],
        solution: {
          code: `function calcularComissao(valorVendas, percentual) {
  if (valorVendas < 0 || percentual < 0) {
    return 0;
  }
  const comissao = valorVendas * percentual / 100;
  return Math.round(comissao * 100) / 100;
}`,
          explanation: 'A validação no início deixa o cálculo principal sem desvios. Multiplicar por 100, arredondar e dividir por 100 mantém duas casas decimais.',
        },
      },
    },
    {
      id: 'a2',
      title: 'Etapa 2 — Percentual por faixa de vendas',
      explanation: [
        { type: 'p', text: 'A empresa paga mais a quem vende mais. O percentual depende da faixa de vendas do mês:' },
        { type: 'list', items: ['Abaixo de R$ 5.000: 3%.', 'De R$ 5.000 até R$ 9.999,99: 5%.', 'R$ 10.000 ou mais: 8%.'] },
        { type: 'p', text: 'Lembre-se da aula de condicionais: a ordem das faixas importa.' },
      ],
      acceptanceCriteria: ['percentualPorFaixa(4999.99) devolve 3.', 'percentualPorFaixa(5000) devolve 5.', 'percentualPorFaixa(10000) devolve 8.'],
      reflectionPrompt: 'Em que ordem você testou as faixas e por quê? O que aconteceria com a outra ordem?',
      exercise: {
        id: 'projeto-a-2',
        type: 'code',
        task: 'write-function',
        title: 'percentualPorFaixa',
        difficulty: 'basico',
        concepts: ['condicionais'],
        statement: 'Mantenha calcularComissao e adicione percentualPorFaixa(valorVendas).',
        starterCode: `function percentualPorFaixa(valorVendas) {
  // devolva 3, 5 ou 8
}`,
        tests: [
          { name: '1000 → 3', code: 'return percentualPorFaixa(1000);', expected: 3 },
          { name: '4999.99 → 3', code: 'return percentualPorFaixa(4999.99);', expected: 3 },
          { name: '5000 → 5', code: 'return percentualPorFaixa(5000);', expected: 5 },
          { name: '9999.99 → 5', code: 'return percentualPorFaixa(9999.99);', expected: 5 },
          { name: '10000 → 8', code: 'return percentualPorFaixa(10000);', expected: 8 },
          { name: 'calcularComissao continua funcionando', code: 'return calcularComissao(2000, 5);', expected: 100, hidden: true },
        ],
        hints: [
          'Conceito: faixas com if/else if, da mais restritiva para a menos restritiva.',
          'Raciocínio: comece por >= 10000 e desça.',
          'Estrutura: if (valorVendas >= 10000) return 8; if (valorVendas >= 5000) return 5; return 3;',
        ],
        solution: {
          code: `function percentualPorFaixa(valorVendas) {
  if (valorVendas >= 10000) return 8;
  if (valorVendas >= 5000) return 5;
  return 3;
}`,
          explanation: 'Testando primeiro a faixa mais alta, cada if só é alcançado por valores abaixo das faixas anteriores.',
        },
      },
    },
    {
      id: 'a3',
      title: 'Etapa 3 — Meta e status',
      explanation: [
        { type: 'p', text: 'Além da comissão, o gestor quer ver quanto da meta cada vendedor atingiu e um status textual.' },
        {
          type: 'list',
          items: [
            'percentualDaMeta(vendido, meta): inteiro arredondado com Math.round; meta <= 0 devolve 0.',
            'statusDaMeta(percentual): 100 ou mais → "Meta batida"; de 80 a 99 → "Quase lá"; abaixo de 80 → "Abaixo da meta".',
          ],
        },
      ],
      acceptanceCriteria: ['percentualDaMeta(4000, 5000) devolve 80.', 'statusDaMeta(80) devolve "Quase lá".', 'Meta zero não gera erro nem NaN.'],
      reflectionPrompt: 'Por que separar percentualDaMeta e statusDaMeta em duas funções, em vez de uma só?',
      exercise: {
        id: 'projeto-a-3',
        type: 'code',
        task: 'write-function',
        title: 'percentualDaMeta e statusDaMeta',
        difficulty: 'basico',
        concepts: ['funcoes', 'condicionais'],
        statement: 'Adicione percentualDaMeta(vendido, meta) e statusDaMeta(percentual).',
        starterCode: `function percentualDaMeta(vendido, meta) {
  // seu código aqui
}

function statusDaMeta(percentual) {
  // seu código aqui
}`,
        tests: [
          { name: 'percentualDaMeta(4000, 5000) → 80', code: 'return percentualDaMeta(4000, 5000);', expected: 80 },
          { name: 'percentualDaMeta(12000, 10000) → 120', code: 'return percentualDaMeta(12000, 10000);', expected: 120 },
          { name: 'Meta zero → 0', code: 'return percentualDaMeta(100, 0);', expected: 0 },
          { name: 'statusDaMeta(100) → Meta batida', code: 'return statusDaMeta(100);', expected: 'Meta batida' },
          { name: 'statusDaMeta(80) → Quase lá', code: 'return statusDaMeta(80);', expected: 'Quase lá' },
          { name: 'statusDaMeta(79) → Abaixo da meta', code: 'return statusDaMeta(79);', expected: 'Abaixo da meta' },
          { name: 'statusDaMeta(150) → Meta batida', code: 'return statusDaMeta(150);', expected: 'Meta batida', hidden: true },
        ],
        hints: [
          'Conceito: funções pequenas e com uma responsabilidade.',
          'Raciocínio: percentualDaMeta você já escreveu na aula 7. statusDaMeta é uma classificação por faixas, como percentualPorFaixa.',
          'Estrutura: if (percentual >= 100) return "Meta batida"; if (percentual >= 80) return "Quase lá"; return "Abaixo da meta";',
        ],
        solution: {
          code: `function percentualDaMeta(vendido, meta) {
  if (meta <= 0) return 0;
  return Math.round(vendido / meta * 100);
}

function statusDaMeta(percentual) {
  if (percentual >= 100) return "Meta batida";
  if (percentual >= 80) return "Quase lá";
  return "Abaixo da meta";
}`,
          explanation: 'Separar cálculo e classificação permite reaproveitar cada parte e testá-las isoladamente — por exemplo, mudar as faixas do status sem tocar no cálculo.',
        },
      },
    },
    {
      id: 'a4',
      title: 'Etapa 4 — Relatório de um vendedor',
      explanation: [
        { type: 'p', text: 'Agora você compõe as funções anteriores. Um vendedor é { nome, vendas, meta }. O relatório é um objeto novo:' },
        {
          type: 'code',
          code: `{
  nome: "Ana",
  comissao: 960,          // vendas × percentual da faixa
  percentualMeta: 120,
  status: "Meta batida",
}`,
        },
      ],
      acceptanceCriteria: ['Usa calcularComissao, percentualPorFaixa, percentualDaMeta e statusDaMeta.', 'Não altera o objeto recebido.'],
      reflectionPrompt: 'Que vantagem você teve por já ter as funções das etapas anteriores prontas e testadas?',
      exercise: {
        id: 'projeto-a-4',
        type: 'code',
        task: 'write-function',
        title: 'relatorioVendedor',
        difficulty: 'intermediario',
        concepts: ['funcoes', 'objetos'],
        statement: 'Adicione relatorioVendedor(vendedor), reaproveitando as funções anteriores.',
        starterCode: `function relatorioVendedor(vendedor) {
  // combine as funções das etapas anteriores
}`,
        tests: [
          {
            name: 'Ana: meta batida, faixa de 8%',
            code: 'return relatorioVendedor({ nome: "Ana", vendas: 12000, meta: 10000 });',
            expected: { nome: 'Ana', comissao: 960, percentualMeta: 120, status: 'Meta batida' },
          },
          {
            name: 'Bruno: quase lá, faixa de 3%',
            code: 'return relatorioVendedor({ nome: "Bruno", vendas: 4000, meta: 5000 });',
            expected: { nome: 'Bruno', comissao: 120, percentualMeta: 80, status: 'Quase lá' },
          },
          {
            name: 'Carla: abaixo da meta, faixa de 5%',
            code: 'return relatorioVendedor({ nome: "Carla", vendas: 6000, meta: 10000 });',
            expected: { nome: 'Carla', comissao: 300, percentualMeta: 60, status: 'Abaixo da meta' },
          },
          {
            name: 'Não altera o vendedor recebido',
            code: 'const v = { nome: "Davi", vendas: 100, meta: 100 }; relatorioVendedor(v); return Object.keys(v).length;',
            expected: 3,
            hidden: true,
          },
        ],
        hints: [
          'Conceito: composição de funções.',
          'Raciocínio: calcule primeiro o percentual da faixa, depois a comissão com esse percentual; em paralelo, o percentual da meta e o status.',
          'Estrutura: const percentual = percentualPorFaixa(vendedor.vendas); const comissao = calcularComissao(vendedor.vendas, percentual); const percentualMeta = ...; return { nome: vendedor.nome, comissao, ... };',
        ],
        solution: {
          code: `function relatorioVendedor(vendedor) {
  const percentual = percentualPorFaixa(vendedor.vendas);
  const comissao = calcularComissao(vendedor.vendas, percentual);
  const percentualMeta = percentualDaMeta(vendedor.vendas, vendedor.meta);
  return {
    nome: vendedor.nome,
    comissao: comissao,
    percentualMeta: percentualMeta,
    status: statusDaMeta(percentualMeta),
  };
}`,
          explanation: 'A função quase não tem lógica própria: ela orquestra funções já testadas. Isso reduz bugs e torna o código fácil de ler.',
        },
      },
    },
    {
      id: 'a5',
      title: 'Etapa 5 — Relatório da equipe',
      explanation: [
        { type: 'p', text: 'Por último, o relatório consolidado da equipe, a partir de uma lista de vendedores:' },
        {
          type: 'list',
          items: [
            'totalVendido: soma das vendas.',
            'totalComissoes: soma das comissões (arredondada para 2 casas).',
            'destaque: nome de quem mais vendeu (null se a lista estiver vazia; em empate, o primeiro da lista).',
            'vendedores: a lista de relatórios individuais, na mesma ordem.',
          ],
        },
      ],
      acceptanceCriteria: ['Funciona com lista vazia.', 'Usa relatorioVendedor para cada item.', 'Destaque correto em caso de empate.'],
      reflectionPrompt: 'Explique como você escolheu entre laço, map e reduce em cada parte desta etapa.',
      exercise: {
        id: 'projeto-a-5',
        type: 'code',
        task: 'write-function',
        title: 'relatorioEquipe',
        difficulty: 'intermediario',
        concepts: ['manipulacao-dados', 'arrays', 'objetos'],
        statement: 'Adicione relatorioEquipe(vendedores).',
        starterCode: `function relatorioEquipe(vendedores) {
  // seu código aqui
}

console.log(relatorioEquipe([
  { nome: "Ana", vendas: 12000, meta: 10000 },
  { nome: "Bruno", vendas: 4000, meta: 5000 },
  { nome: "Carla", vendas: 6000, meta: 10000 },
]));`,
        tests: [
          {
            name: 'Relatório completo',
            code: 'return relatorioEquipe([{ nome: "Ana", vendas: 12000, meta: 10000 }, { nome: "Bruno", vendas: 4000, meta: 5000 }, { nome: "Carla", vendas: 6000, meta: 10000 }]);',
            expected: {
              totalVendido: 22000,
              totalComissoes: 1380,
              destaque: 'Ana',
              vendedores: [
                { nome: 'Ana', comissao: 960, percentualMeta: 120, status: 'Meta batida' },
                { nome: 'Bruno', comissao: 120, percentualMeta: 80, status: 'Quase lá' },
                { nome: 'Carla', comissao: 300, percentualMeta: 60, status: 'Abaixo da meta' },
              ],
            },
          },
          { name: 'Lista vazia', code: 'return relatorioEquipe([]);', expected: { totalVendido: 0, totalComissoes: 0, destaque: null, vendedores: [] } },
          {
            name: 'Empate: o primeiro da lista é o destaque',
            code: 'return relatorioEquipe([{ nome: "Eva", vendas: 500, meta: 1000 }, { nome: "Fábio", vendas: 500, meta: 1000 }]).destaque;',
            expected: 'Eva',
            hidden: true,
          },
          {
            name: 'Comissões somadas com 2 casas',
            code: 'return relatorioEquipe([{ nome: "G", vendas: 1234.56, meta: 1 }, { nome: "H", vendas: 1000.1, meta: 1 }]).totalComissoes;',
            expected: 67.04,
            hidden: true,
          },
        ],
        hints: [
          'Conceito: map para transformar, reduce (ou laço) para somar, percurso com "melhor até agora" para o destaque.',
          'Raciocínio: comece criando os relatórios com map. Depois some vendas e comissões. Para o destaque, só troque quando encontrar vendas estritamente maiores (> e não >=), assim o primeiro vence o empate.',
          'Estrutura: const relatorios = vendedores.map(relatorioVendedor); const totalVendido = vendedores.reduce((s, v) => s + v.vendas, 0); let destaque = null; let maior = -1; for (const v of vendedores) { if (v.vendas > maior) { ... } }',
        ],
        solution: {
          code: `function relatorioEquipe(vendedores) {
  const relatorios = vendedores.map((v) => relatorioVendedor(v));
  const totalVendido = vendedores.reduce((soma, v) => soma + v.vendas, 0);
  const somaComissoes = relatorios.reduce((soma, r) => soma + r.comissao, 0);

  let destaque = null;
  let maiorVenda = -Infinity;
  for (const v of vendedores) {
    if (v.vendas > maiorVenda) { // > mantém o primeiro em caso de empate
      maiorVenda = v.vendas;
      destaque = v.nome;
    }
  }

  return {
    totalVendido: totalVendido,
    totalComissoes: Math.round(somaComissoes * 100) / 100,
    destaque: destaque,
    vendedores: relatorios,
  };
}`,
          explanation:
            'map transforma cada vendedor no seu relatório; reduce agrega os totais; o laço com "melhor até agora" encontra o destaque. Arredondar o total evita resíduos de ponto flutuante (como 67.03999999).',
        },
      },
    },
  ],
};

const planned = (
  id: string,
  letter: string,
  title: string,
  trackId: string,
  description: string,
  topics: string[],
  stages: [string, string][],
): Project => ({
  id,
  letter,
  title,
  description,
  trackId,
  status: 'planejado',
  topics,
  requiredLessonIds: [],
  steps: [],
  plannedStages: stages.map(([t, d]) => ({ title: t, description: d })),
});

export const projects: Project[] = [
  projetoA,
  planned(
    'projeto-b-contatos',
    'B',
    'Painel de gerenciamento de contatos',
    'web',
    'Página interativa de contatos com cadastro validado, busca, filtros e persistência no navegador.',
    ['HTML semântico', 'CSS responsivo', 'DOM', 'eventos', 'formulários', 'localStorage'],
    [
      ['Estrutura e estilo', 'HTML semântico e layout responsivo com Flexbox e Grid.'],
      ['Formulário validado', 'Validação em tempo real com mensagens acessíveis.'],
      ['Lista dinâmica', 'Renderização via DOM, busca e filtros.'],
      ['Persistência', 'Salvar e restaurar com localStorage.'],
    ],
  ),
  planned(
    'projeto-c-produtividade',
    'C',
    'Dashboard de produtividade',
    'react',
    'Aplicação React com projetos, tarefas, filtros, formulários controlados e navegação entre páginas.',
    ['componentes', 'props', 'state', 'hooks', 'rotas', 'formulários', 'tabelas e filtros'],
    [
      ['Componentes', 'Decompor a interface em componentes reutilizáveis.'],
      ['Estado e formulários', 'useState, formulários controlados e validação.'],
      ['Navegação', 'Rotas, páginas de detalhe e estados vazios.'],
      ['Dados externos', 'Integração com uma API simulada, carregamento e erros.'],
    ],
  ),
  planned(
    'projeto-d-tarefas-supabase',
    'D',
    'Gerenciador de tarefas com Supabase',
    'supabase',
    'Aplicação React com cadastro, login e tarefas persistidas no PostgreSQL do Supabase, protegidas por RLS.',
    ['CRUD', 'autenticação', 'SQL', 'relacionamentos', 'RLS'],
    [
      ['Modelagem', 'Tabelas de usuários, projetos e tarefas com chaves estrangeiras.'],
      ['Autenticação', 'Cadastro, login, sessão e recuperação de senha.'],
      ['CRUD', 'Operações de tarefas pelo cliente Supabase.'],
      ['Segurança', 'Políticas RLS para que cada usuário veja só seus dados.'],
    ],
  ),
  planned(
    'projeto-e-fullstack-node',
    'E',
    'Aplicação full stack com Node.js',
    'node',
    'Front-end React consumindo uma API REST própria em Node.js/Express com PostgreSQL.',
    ['rotas', 'controllers', 'services', 'validação', 'tratamento de erros', 'autenticação'],
    [
      ['API base', 'Servidor Express, rotas e controllers.'],
      ['Persistência', 'Integração com PostgreSQL e camada de serviços.'],
      ['Segurança', 'Autenticação, autorização e validação.'],
      ['Integração', 'Consumir a API no React com estados de carregamento e erro.'],
    ],
  ),
  planned(
    'projeto-f-spring',
    'F',
    'API de projetos e tarefas com Spring Boot',
    'spring',
    'API Java com Spring Boot, JPA, PostgreSQL, DTOs, validação e testes.',
    ['Java', 'orientação a objetos', 'Spring Boot', 'JPA', 'DTOs', 'testes'],
    [
      ['Domínio em Java', 'Classes, encapsulamento e regras de negócio.'],
      ['API REST', 'Controllers, services, repositories e DTOs.'],
      ['Persistência', 'Entidades JPA, relacionamentos e migrações.'],
      ['Qualidade', 'Validação, tratamento global de exceções e testes.'],
    ],
  ),
];

/** Projeto final: planejado para evolução por etapas ao longo das trilhas. */
export const finalProject = {
  title: 'Plataforma de gestão de projetos e tarefas',
  description:
    'Uma aplicação full stack inspirada em Trello, Asana e Linear: projetos, quadros Kanban, membros, permissões, comentários e histórico. Ela é construída aos poucos — cada etapa só é liberada depois da trilha que ensina o que ela exige.',
  features: [
    'Cadastro, login e perfil',
    'Projetos com membros e permissões',
    'Quadro Kanban com colunas personalizáveis',
    'Responsáveis, prioridades, prazos e etiquetas',
    'Comentários e histórico de alterações',
    'Filtros, pesquisa e dashboard com estatísticas',
    'Testes automatizados, documentação e deploy',
  ],
  stages: [
    { title: 'Etapa 1 — HTML, CSS e JavaScript', trackId: 'web', description: 'Quadro Kanban com dados em memória: criar, editar, mudar status, filtrar e validar tarefas.' },
    { title: 'Etapa 2 — React', trackId: 'react', description: 'Componentes reutilizáveis, estado, props, formulários, listas e navegação.' },
    { title: 'Etapa 3 — Banco de dados e Supabase', trackId: 'supabase', description: 'Modelagem de usuários, projetos, tarefas, comentários e categorias; CRUD, autenticação e RLS.' },
    { title: 'Etapa 4 — Node.js e Express', trackId: 'node', description: 'API REST com regras de negócio, permissões, tratamento de erros e testes.' },
    { title: 'Etapa 5 — Java e Spring Boot', trackId: 'spring', description: 'Segunda versão da API com orientação a objetos, JPA, DTOs, validação e testes.' },
    { title: 'Etapa 6 — Integração e publicação', trackId: 'profissional', description: 'Conectar o React a uma das APIs, com autenticação, testes, documentação e deploy.' },
  ],
  pedagogy: [
    'Cada funcionalidade começa com a explicação dos conceitos e exercícios menores.',
    'Requisitos e critérios de aceitação claros antes de codificar.',
    'Dicas progressivas, sem entregar a implementação completa.',
    'O estudante explica suas decisões em cada etapa.',
    'Avaliação da funcionalidade e da qualidade do código, com recomendações de revisão.',
  ],
};
