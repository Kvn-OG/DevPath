import type { Challenge } from '../types/content';

export const challenges: Challenge[] = [
  {
    id: 'desafio-calculadora',
    order: 1,
    title: 'Calculadora',
    level: 'iniciante',
    status: 'completo',
    trackId: 'logica-js',
    requiredLessonIds: ['logica-05', 'logica-07'],
    context: 'Um sistema de caixa precisa de uma função de cálculo reutilizável, que nunca quebre com entradas inesperadas.',
    objective: 'Escrever calcular(a, operador, b), que aplica uma das quatro operações básicas.',
    requirements: [
      'Operadores aceitos: "+", "-", "*" e "/".',
      'Divisão por zero devolve o texto "Erro: divisão por zero".',
      'Operador desconhecido devolve o texto "Erro: operador inválido".',
    ],
    restrictions: ['Não use eval nem new Function.'],
    evaluationCriteria: ['Todos os testes passam, inclusive os ocultos.', 'Os casos de erro são tratados antes do cálculo.', 'Nomes e estrutura legíveis.'],
    exercise: {
      id: 'desafio-calculadora-ex',
      type: 'code',
      task: 'algorithm',
      title: 'Calculadora',
      difficulty: 'iniciante',
      concepts: ['condicionais', 'funcoes'],
      statement: 'Implemente calcular(a, operador, b).',
      starterCode: `function calcular(a, operador, b) {
  // seu código aqui
}

console.log(calcular(8, "+", 2)); // 10
console.log(calcular(8, "/", 0)); // Erro: divisão por zero`,
      tests: [
        { name: '8 + 2 = 10', code: 'return calcular(8, "+", 2);', expected: 10 },
        { name: '8 - 2 = 6', code: 'return calcular(8, "-", 2);', expected: 6 },
        { name: '8 * 2 = 16', code: 'return calcular(8, "*", 2);', expected: 16 },
        { name: '8 / 2 = 4', code: 'return calcular(8, "/", 2);', expected: 4 },
        { name: 'Divisão por zero', code: 'return calcular(8, "/", 0);', expected: 'Erro: divisão por zero' },
        { name: 'Operador inválido', code: 'return calcular(8, "%", 2);', expected: 'Erro: operador inválido' },
        { name: 'Decimais', code: 'return calcular(0.5, "*", 3);', expected: 1.5, hidden: true },
        { name: 'Zero dividido por número', code: 'return calcular(0, "/", 5);', expected: 0, hidden: true },
        { name: 'Operador vazio', code: 'return calcular(1, "", 1);', expected: 'Erro: operador inválido', hidden: true },
      ],
      constraints: [{ kind: 'must-not-include', pattern: '\\beval\\b|new\\s+Function', message: 'Não use eval nem new Function: implemente cada operação.' }],
      hints: [
        'Conceito: if/else if (ou switch) escolhendo a operação pelo valor de operador.',
        'Raciocínio: trate primeiro os casos especiais (divisão por zero), depois cada operação, e por fim o caso "nenhum operador conhecido".',
        'Estrutura: if (operador === "+") return a + b; ... if (operador === "/") { if (b === 0) return "Erro: divisão por zero"; return a / b; } return "Erro: operador inválido";',
      ],
      solution: {
        code: `function calcular(a, operador, b) {
  if (operador === "+") return a + b;
  if (operador === "-") return a - b;
  if (operador === "*") return a * b;
  if (operador === "/") {
    if (b === 0) {
      return "Erro: divisão por zero";
    }
    return a / b;
  }
  // nenhum operador conhecido
  return "Erro: operador inválido";
}`,
        explanation: 'Cada operador é testado com ===. A divisão verifica o zero antes de dividir. O return final só é alcançado quando nenhum operador conhecido foi encontrado.',
      },
    },
  },
  {
    id: 'desafio-conversor',
    order: 2,
    title: 'Conversor de unidades',
    level: 'basico',
    status: 'completo',
    trackId: 'logica-js',
    requiredLessonIds: ['logica-05', 'logica-07'],
    context: 'Um aplicativo de clima recebe temperaturas em escalas diferentes e precisa convertê-las.',
    objective: 'Escrever converterTemperatura(valor, de, para) entre Celsius ("C"), Fahrenheit ("F") e Kelvin ("K").',
    requirements: [
      'Fórmulas: F = C × 9/5 + 32; K = C + 273.15.',
      'O resultado deve ser arredondado para 2 casas decimais: Math.round(x * 100) / 100.',
      'Se de e para forem iguais, devolva o próprio valor.',
      'Unidade desconhecida devolve null.',
    ],
    restrictions: ['Não escreva uma fórmula para cada um dos 6 pares: converta primeiro para Celsius e depois de Celsius para o destino.'],
    evaluationCriteria: ['Todos os testes passam.', 'A conversão usa Celsius como unidade intermediária.', 'O arredondamento acontece uma única vez, no final.'],
    exercise: {
      id: 'desafio-conversor-ex',
      type: 'code',
      task: 'algorithm',
      title: 'Conversor de temperatura',
      difficulty: 'basico',
      concepts: ['funcoes', 'condicionais'],
      statement: 'Implemente converterTemperatura(valor, de, para).',
      starterCode: `function paraCelsius(valor, unidade) {
  // devolva o valor em Celsius, ou null se a unidade for desconhecida
}

function deCelsius(celsius, unidade) {
  // converta de Celsius para a unidade pedida, ou null
}

function converterTemperatura(valor, de, para) {
  // use as duas funções acima
}

console.log(converterTemperatura(100, "C", "F")); // 212`,
      tests: [
        { name: '100 C → 212 F', code: 'return converterTemperatura(100, "C", "F");', expected: 212 },
        { name: '32 F → 0 C', code: 'return converterTemperatura(32, "F", "C");', expected: 0 },
        { name: '0 C → 273.15 K', code: 'return converterTemperatura(0, "C", "K");', expected: 273.15 },
        { name: '300 K → 80.33 F', code: 'return converterTemperatura(300, "K", "F");', expected: 80.33 },
        { name: 'Mesma unidade', code: 'return converterTemperatura(25, "C", "C");', expected: 25 },
        { name: 'Unidade inválida → null', code: 'return converterTemperatura(10, "X", "C");', expected: null },
        { name: '-40 F → -40 C', code: 'return converterTemperatura(-40, "F", "C");', expected: -40, hidden: true },
        { name: 'Destino inválido → null', code: 'return converterTemperatura(10, "C", "Z");', expected: null, hidden: true },
        { name: '98.6 F → 310.15 K', code: 'return converterTemperatura(98.6, "F", "K");', expected: 310.15, hidden: true },
      ],
      hints: [
        'Conceito: decomposição — dividir a conversão em duas funções pequenas.',
        'Raciocínio: de F para C: (F − 32) × 5/9. De K para C: K − 273.15. Com essas duas e as fórmulas do enunciado, qualquer par funciona passando por Celsius.',
        'Estrutura: const c = paraCelsius(valor, de); if (c === null) return null; const r = deCelsius(c, para); if (r === null) return null; return Math.round(r * 100) / 100;',
      ],
      solution: {
        code: `function paraCelsius(valor, unidade) {
  if (unidade === "C") return valor;
  if (unidade === "F") return (valor - 32) * 5 / 9;
  if (unidade === "K") return valor - 273.15;
  return null;
}

function deCelsius(celsius, unidade) {
  if (unidade === "C") return celsius;
  if (unidade === "F") return celsius * 9 / 5 + 32;
  if (unidade === "K") return celsius + 273.15;
  return null;
}

function converterTemperatura(valor, de, para) {
  const celsius = paraCelsius(valor, de);
  if (celsius === null) return null;
  const resultado = deCelsius(celsius, para);
  if (resultado === null) return null;
  return Math.round(resultado * 100) / 100;
}`,
        explanation: 'Com Celsius como unidade intermediária, bastam 3 + 3 fórmulas em vez de 6 pares. Adicionar uma nova escala exige só uma linha em cada função auxiliar.',
      },
    },
  },
  {
    id: 'desafio-validador',
    order: 3,
    title: 'Validador de formulários',
    level: 'basico',
    status: 'completo',
    trackId: 'logica-js',
    requiredLessonIds: ['logica-06', 'logica-09', 'logica-10'],
    context: 'Antes de enviar um cadastro ao servidor, o front-end valida os dados e mostra todas as mensagens de erro de uma vez.',
    objective: 'Escrever validarCadastro(dados), que devolve um array com as mensagens de erro (vazio se tudo estiver certo).',
    requirements: [
      'nome: obrigatório, com pelo menos 3 caracteres depois de remover espaços das pontas (use .trim()). Mensagem: "Nome deve ter pelo menos 3 caracteres".',
      'email: precisa conter "@" e ter pelo menos um "." depois do "@". Mensagem: "E-mail inválido". Dica: texto.indexOf("@") e texto.lastIndexOf(".").',
      'idade: número inteiro entre 16 e 120 (inclusive). Mensagem: "Idade deve estar entre 16 e 120". Use Number.isInteger(valor).',
      'As mensagens devem aparecer na ordem: nome, email, idade.',
    ],
    restrictions: ['Não use expressões regulares — o objetivo é praticar condições e métodos de string.'],
    evaluationCriteria: ['Todos os testes passam.', 'Cada regra está isolada e legível.', 'Todas as mensagens aparecem, não só a primeira.'],
    exercise: {
      id: 'desafio-validador-ex',
      type: 'code',
      task: 'algorithm',
      title: 'Validador de cadastro',
      difficulty: 'basico',
      concepts: ['condicionais', 'arrays', 'objetos'],
      statement: 'Implemente validarCadastro(dados), onde dados é { nome, email, idade }.',
      starterCode: `function validarCadastro(dados) {
  const erros = [];
  // valide nome, email e idade
  return erros;
}

console.log(validarCadastro({ nome: "Ana", email: "ana@exemplo.com", idade: 30 })); // []
console.log(validarCadastro({ nome: " A ", email: "ana.com", idade: 10 }));`,
      tests: [
        { name: 'Dados válidos → []', code: 'return validarCadastro({ nome: "Ana", email: "ana@exemplo.com", idade: 30 });', expected: [] },
        {
          name: 'Todos inválidos, na ordem certa',
          code: 'return validarCadastro({ nome: " A ", email: "ana.com", idade: 10 });',
          expected: ['Nome deve ter pelo menos 3 caracteres', 'E-mail inválido', 'Idade deve estar entre 16 e 120'],
        },
        { name: 'Ponto antes do @ não vale', code: 'return validarCadastro({ nome: "Bruno", email: "bruno.silva@exemplo", idade: 20 });', expected: ['E-mail inválido'] },
        { name: 'Idade 16 é válida', code: 'return validarCadastro({ nome: "Carla", email: "c@x.io", idade: 16 });', expected: [] },
        { name: 'Idade decimal é inválida', code: 'return validarCadastro({ nome: "Carla", email: "c@x.io", idade: 20.5 });', expected: ['Idade deve estar entre 16 e 120'] },
        { name: 'Nome só com espaços', code: 'return validarCadastro({ nome: "     ", email: "a@b.com", idade: 40 });', expected: ['Nome deve ter pelo menos 3 caracteres'], hidden: true },
        { name: 'Idade 121', code: 'return validarCadastro({ nome: "Davi", email: "d@x.com", idade: 121 });', expected: ['Idade deve estar entre 16 e 120'], hidden: true },
        { name: 'Idade como texto é inválida', code: 'return validarCadastro({ nome: "Eva", email: "e@x.com", idade: "30" });', expected: ['Idade deve estar entre 16 e 120'], hidden: true },
      ],
      constraints: [
        { kind: 'must-not-include', pattern: '\\/[^/\\n]+\\/[gimsuy]*\\.test\\(|new RegExp|\\.match\\(', message: 'Não use expressões regulares neste desafio.' },
      ],
      hints: [
        'Conceito: várias validações independentes, cada uma podendo adicionar (push) uma mensagem ao array.',
        'Raciocínio: não use else entre as validações — todas precisam ser verificadas. Para o e-mail: a posição do "@" deve ser maior que 0 (precisa haver algo antes dele) e o último "." deve vir depois dela.',
        'Estrutura: if (dados.nome.trim().length < 3) erros.push("..."); const arroba = dados.email.indexOf("@"); const ponto = dados.email.lastIndexOf("."); if (arroba < 1 || ponto < arroba) erros.push("..."); if (!Number.isInteger(dados.idade) || dados.idade < 16 || dados.idade > 120) erros.push("...");',
      ],
      solution: {
        code: `function validarCadastro(dados) {
  const erros = [];

  if (dados.nome.trim().length < 3) {
    erros.push("Nome deve ter pelo menos 3 caracteres");
  }

  const arroba = dados.email.indexOf("@");
  const ultimoPonto = dados.email.lastIndexOf(".");
  // precisa ter algo antes do @ e um ponto depois dele
  if (arroba < 1 || ultimoPonto < arroba) {
    erros.push("E-mail inválido");
  }

  const idade = dados.idade;
  if (!Number.isInteger(idade) || idade < 16 || idade > 120) {
    erros.push("Idade deve estar entre 16 e 120");
  }

  return erros;
}`,
        explanation: 'Cada regra é um if independente, então todas as mensagens são coletadas. indexOf devolve -1 quando não encontra, e por isso arroba < 1 também cobre a ausência do @. Number.isInteger rejeita decimais e textos.',
      },
    },
  },
  {
    id: 'desafio-tarefas',
    order: 4,
    title: 'Lista de tarefas',
    level: 'intermediario',
    status: 'completo',
    trackId: 'logica-js',
    requiredLessonIds: ['logica-10', 'logica-11'],
    context: 'O núcleo de um app de tarefas são funções que recebem a lista atual e devolvem uma nova lista. É assim que o React trabalha com estado — este desafio prepara você para isso.',
    objective: 'Implementar adicionarTarefa, concluirTarefa e filtrarTarefas sem alterar a lista recebida.',
    requirements: [
      'Tarefa: { id, titulo, concluida }.',
      'adicionarTarefa(lista, titulo): devolve uma nova lista com a tarefa no final. id = maior id existente + 1 (ou 1 se a lista estiver vazia). concluida começa false. O título é salvo sem espaços nas pontas.',
      'Título vazio (depois de trim) não é adicionado: devolva a lista sem mudanças.',
      'concluirTarefa(lista, id): devolve uma nova lista com a tarefa daquele id marcada como concluída.',
      'filtrarTarefas(lista, filtro): filtro "todas", "pendentes" ou "concluidas".',
    ],
    restrictions: ['Não altere a lista recebida (nem seus objetos): crie novas listas e novos objetos.'],
    evaluationCriteria: ['Todos os testes passam, inclusive os de imutabilidade.', 'Uso adequado de map/filter.', 'Funções pequenas e com uma responsabilidade.'],
    exercise: {
      id: 'desafio-tarefas-ex',
      type: 'code',
      task: 'algorithm',
      title: 'Funções da lista de tarefas',
      difficulty: 'intermediario',
      concepts: ['manipulacao-dados', 'objetos', 'funcoes'],
      statement: 'Implemente as três funções do núcleo de uma lista de tarefas.',
      starterCode: `function adicionarTarefa(lista, titulo) {
  // seu código aqui
}

function concluirTarefa(lista, id) {
  // seu código aqui
}

function filtrarTarefas(lista, filtro) {
  // seu código aqui
}

let tarefas = [];
tarefas = adicionarTarefa(tarefas, "Estudar arrays");
tarefas = adicionarTarefa(tarefas, "Fazer o desafio");
tarefas = concluirTarefa(tarefas, 1);
console.log(filtrarTarefas(tarefas, "pendentes"));`,
      tests: [
        { name: 'Adiciona com id 1 em lista vazia', code: 'return adicionarTarefa([], "Estudar");', expected: [{ id: 1, titulo: 'Estudar', concluida: false }] },
        {
          name: 'id = maior id + 1',
          code: 'return adicionarTarefa([{ id: 5, titulo: "A", concluida: false }, { id: 2, titulo: "B", concluida: true }], "C")[2].id;',
          expected: 6,
        },
        { name: 'Remove espaços do título', code: 'return adicionarTarefa([], "  Ler  ")[0].titulo;', expected: 'Ler' },
        { name: 'Título vazio não é adicionado', code: 'return adicionarTarefa([], "   ").length;', expected: 0 },
        {
          name: 'Conclui a tarefa certa',
          code: 'return concluirTarefa([{ id: 1, titulo: "A", concluida: false }, { id: 2, titulo: "B", concluida: false }], 2);',
          expected: [{ id: 1, titulo: 'A', concluida: false }, { id: 2, titulo: 'B', concluida: true }],
        },
        {
          name: 'Filtra pendentes',
          code: 'return filtrarTarefas([{ id: 1, titulo: "A", concluida: true }, { id: 2, titulo: "B", concluida: false }], "pendentes");',
          expected: [{ id: 2, titulo: 'B', concluida: false }],
        },
        {
          name: 'Filtra concluídas',
          code: 'return filtrarTarefas([{ id: 1, titulo: "A", concluida: true }, { id: 2, titulo: "B", concluida: false }], "concluidas");',
          expected: [{ id: 1, titulo: 'A', concluida: true }],
        },
        {
          name: 'adicionarTarefa não altera a lista original',
          code: 'const original = [{ id: 1, titulo: "A", concluida: false }]; adicionarTarefa(original, "B"); return original.length;',
          expected: 1,
          hidden: true,
        },
        {
          name: 'concluirTarefa não altera os objetos originais',
          code: 'const t = { id: 1, titulo: "A", concluida: false }; concluirTarefa([t], 1); return t.concluida;',
          expected: false,
          hidden: true,
        },
        {
          name: 'Filtro "todas" devolve tudo',
          code: 'return filtrarTarefas([{ id: 1, titulo: "A", concluida: true }, { id: 2, titulo: "B", concluida: false }], "todas").length;',
          expected: 2,
          hidden: true,
        },
      ],
      hints: [
        'Conceito: imutabilidade — em vez de alterar, crie uma nova lista com map/filter e novos objetos.',
        'Raciocínio: para concluir, percorra com map: se o id for o procurado, devolva um objeto novo com concluida: true; senão, devolva o item como está. Para adicionar, crie um array novo com os itens antigos e o novo item.',
        'Estrutura: const novos = lista.slice(); novos.push(novaTarefa); — ou — lista.map((t) => t.id === id ? { id: t.id, titulo: t.titulo, concluida: true } : t)',
      ],
      solution: {
        code: `function adicionarTarefa(lista, titulo) {
  const tituloLimpo = titulo.trim();
  if (tituloLimpo === "") {
    return lista;
  }
  let maiorId = 0;
  for (const tarefa of lista) {
    if (tarefa.id > maiorId) maiorId = tarefa.id;
  }
  const nova = { id: maiorId + 1, titulo: tituloLimpo, concluida: false };
  const novaLista = lista.slice(); // cópia: não altera a original
  novaLista.push(nova);
  return novaLista;
}

function concluirTarefa(lista, id) {
  return lista.map((t) => {
    if (t.id !== id) return t;
    return { id: t.id, titulo: t.titulo, concluida: true }; // objeto novo
  });
}

function filtrarTarefas(lista, filtro) {
  if (filtro === "pendentes") return lista.filter((t) => !t.concluida);
  if (filtro === "concluidas") return lista.filter((t) => t.concluida);
  return lista.slice();
}`,
        explanation:
          'slice() sem argumentos copia o array; map e filter já devolvem arrays novos. Em concluirTarefa, um objeto novo é criado só para a tarefa alterada. Na trilha de JavaScript moderno você verá o spread ([...lista, nova] e { ...t, concluida: true }), que encurta este código.',
      },
    },
  },
  {
    id: 'desafio-contatos',
    order: 5,
    title: 'Gerenciador de contatos',
    level: 'intermediario',
    status: 'completo',
    trackId: 'logica-js',
    requiredLessonIds: ['logica-10', 'logica-11'],
    context: 'Uma agenda de contatos precisa de busca e de uma listagem agrupada pela letra inicial do nome.',
    objective: 'Implementar buscarContatos e agruparPorInicial.',
    requirements: [
      'Contato: { nome, email }.',
      'buscarContatos(contatos, termo): devolve os contatos cujo nome OU e-mail contém o termo, ignorando maiúsculas/minúsculas e espaços nas pontas do termo. Termo vazio devolve todos.',
      'agruparPorInicial(contatos): devolve um objeto em que cada chave é a inicial maiúscula do nome e o valor é a lista de nomes com essa inicial, em ordem alfabética.',
      'Use texto.includes(parte) para busca e lista.sort() para ordenar nomes.',
    ],
    restrictions: ['Não altere o array recebido (sort altera o array: ordene uma cópia).'],
    evaluationCriteria: ['Todos os testes passam.', 'Busca insensível a maiúsculas.', 'Nenhuma alteração nos dados recebidos.'],
    exercise: {
      id: 'desafio-contatos-ex',
      type: 'code',
      task: 'algorithm',
      title: 'Busca e agrupamento de contatos',
      difficulty: 'intermediario',
      concepts: ['manipulacao-dados', 'objetos', 'arrays'],
      statement: 'Implemente buscarContatos e agruparPorInicial.',
      starterCode: `function buscarContatos(contatos, termo) {
  // seu código aqui
}

function agruparPorInicial(contatos) {
  // seu código aqui
}

const agenda = [
  { nome: "Bruno Lima", email: "bruno@exemplo.com" },
  { nome: "ana Souza", email: "ana@exemplo.com" },
  { nome: "Beatriz Melo", email: "bia@empresa.com" },
];
console.log(buscarContatos(agenda, "EMPRESA"));
console.log(agruparPorInicial(agenda));`,
      tests: [
        {
          name: 'Busca no e-mail, sem diferenciar maiúsculas',
          code: 'return buscarContatos([{ nome: "Bruno", email: "b@x.com" }, { nome: "Bia", email: "bia@empresa.com" }], "EMPRESA");',
          expected: [{ nome: 'Bia', email: 'bia@empresa.com' }],
        },
        {
          name: 'Busca no nome',
          code: 'return buscarContatos([{ nome: "Ana Souza", email: "a@x.com" }, { nome: "Bruno", email: "b@x.com" }], "souza").length;',
          expected: 1,
        },
        { name: 'Termo vazio devolve todos', code: 'return buscarContatos([{ nome: "A", email: "a@x" }, { nome: "B", email: "b@x" }], "  ").length;', expected: 2 },
        {
          name: 'Agrupa por inicial maiúscula e ordena',
          code: 'return agruparPorInicial([{ nome: "Bruno Lima", email: "" }, { nome: "ana Souza", email: "" }, { nome: "Beatriz Melo", email: "" }]);',
          expected: { B: ['Beatriz Melo', 'Bruno Lima'], A: ['ana Souza'] },
        },
        { name: 'Lista vazia → {}', code: 'return agruparPorInicial([]);', expected: {} },
        {
          name: 'Ignora espaços nas pontas do termo',
          code: 'return buscarContatos([{ nome: "Carla", email: "c@x.com" }], "  carla ").length;',
          expected: 1,
          hidden: true,
        },
        {
          name: 'Não altera o array recebido',
          code: 'const lista = [{ nome: "Zeca", email: "" }, { nome: "Ana", email: "" }]; agruparPorInicial(lista); buscarContatos(lista, "a"); return lista[0].nome;',
          expected: 'Zeca',
          hidden: true,
        },
      ],
      hints: [
        'Conceito: filter com uma condição composta (||) e agrupamento em objeto (como em totalPorVendedor).',
        'Raciocínio: normalize o termo uma vez (trim + toLowerCase) e compare com nome e e-mail também em minúsculas. Para agrupar, ordene uma cópia dos nomes primeiro; assim cada grupo já recebe os nomes em ordem.',
        'Estrutura: const nomes = contatos.map((c) => c.nome).sort(); for (const nome of nomes) { const inicial = nome[0].toUpperCase(); if (!grupos[inicial]) grupos[inicial] = []; grupos[inicial].push(nome); }',
      ],
      solution: {
        code: `function buscarContatos(contatos, termo) {
  const busca = termo.trim().toLowerCase();
  if (busca === "") return contatos.slice();
  return contatos.filter((c) =>
    c.nome.toLowerCase().includes(busca) || c.email.toLowerCase().includes(busca)
  );
}

function agruparPorInicial(contatos) {
  // map cria um array novo, então o sort não altera "contatos"
  const nomes = contatos.map((c) => c.nome).sort((a, b) => a.localeCompare(b));
  const grupos = {};
  for (const nome of nomes) {
    const inicial = nome[0].toUpperCase();
    if (grupos[inicial] === undefined) {
      grupos[inicial] = [];
    }
    grupos[inicial].push(nome);
  }
  return grupos;
}`,
        explanation:
          'O termo é normalizado uma única vez. map cria um array novo de nomes, então ordená-lo não altera os contatos originais. localeCompare ordena considerando o idioma (acentos e maiúsculas), mais robusto que o sort padrão.',
      },
    },
  },
  ...(
    [
      ['desafio-dashboard', 'Dashboard com filtros', 'intermediario', 'react', 'Criar um dashboard React com filtros combináveis e estados vazios.'],
      ['desafio-crud-usuarios', 'CRUD de usuários', 'intermediario', 'react', 'Criar, listar, editar e remover usuários com formulários controlados.'],
      ['desafio-sql-relatorios', 'Consultas SQL para relatórios', 'intermediario', 'sql', 'Escrever consultas com JOIN, GROUP BY e agregações para relatórios de tarefas.'],
      ['desafio-api-tarefas', 'API de tarefas', 'avancado', 'node', 'Implementar endpoints REST de tarefas com validação e códigos de status corretos.'],
      ['desafio-autenticacao', 'Sistema de autenticação', 'avancado', 'node', 'Cadastro, login e rotas protegidas com hash de senha e tokens.'],
      ['desafio-painel-admin', 'Painel administrativo', 'avancado', 'react', 'Painel com permissões por papel, tabelas paginadas e ações em lote.'],
      ['desafio-integracao', 'Integração entre front-end e back-end', 'avancado', 'profissional', 'Conectar um front-end React a uma API própria com tratamento de erros e carregamento.'],
    ] as const
  ).map(
    ([id, title, level, trackId, objective], i): Challenge => ({
      id,
      order: 6 + i,
      title,
      level,
      status: 'planejado',
      trackId,
      requiredLessonIds: [],
      context: 'Desafio planejado. Ele será liberado junto com a trilha que ensina os conceitos necessários.',
      objective,
      requirements: [],
      restrictions: [],
      evaluationCriteria: [],
    }),
  ),
];
