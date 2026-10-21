// Traduz erros do JavaScript para explicações em português, mantendo a
// mensagem original (que o estudante precisa aprender a ler).

export interface FriendlyError {
  name: string;
  message: string;
  explanation: string;
}

interface Rule {
  test: RegExp;
  explain: (match: RegExpMatchArray) => string;
}

const RULES: Rule[] = [
  {
    test: /^(\S+) is not defined$/,
    explain: (m) =>
      `O nome "${m[1]}" não existe neste ponto do código. Verifique se foi declarado com let, const ou function, se está escrito exatamente igual (maiúsculas e minúsculas importam) e se está dentro do escopo certo.`,
  },
  {
    test: /^Cannot access '(\S+)' before initialization$|^can't access lexical declaration '(\S+)' before initialization$/,
    explain: (m) => `"${m[1] ?? m[2]}" foi usado antes da linha em que é declarado. Mova a declaração para antes do uso.`,
  },
  {
    test: /^(\S+) is not a function$/,
    explain: (m) =>
      `Você tentou chamar "${m[1]}" com parênteses, mas esse valor não é uma função. Confira o nome do método e o tipo do valor (por exemplo, map só existe em arrays).`,
  },
  {
    test: /^Cannot read propert(?:y|ies) of (undefined|null)(?: \(reading '(.+)'\))?|^can't access property "(.+)", .+ is (undefined|null)/,
    explain: (m) => {
      const kind = m[1] ?? m[4];
      const prop = m[2] ?? m[3];
      return `Você tentou ler ${prop ? `a propriedade "${prop}"` : 'uma propriedade'} de um valor ${kind}. A variável antes do ponto não contém o objeto/array que você esperava — verifique de onde ela vem.`;
    },
  },
  {
    test: /^Cannot set propert(?:y|ies) of (undefined|null)/,
    explain: (m) => `Você tentou alterar uma propriedade de um valor ${m[1]}. Garanta que o objeto existe antes de modificá-lo.`,
  },
  {
    test: /^Assignment to constant variable\.?$|^invalid assignment to const/,
    explain: () => 'Você tentou reatribuir uma constante (const). Use let se o valor precisa mudar.',
  },
  {
    test: /Identifier '(\S+)' has already been declared|redeclaration of (?:let|const) (\S+)/,
    explain: (m) => `"${m[1] ?? m[2]}" foi declarado duas vezes no mesmo escopo. Remova a segunda declaração ou use outro nome.`,
  },
  {
    test: /^Unexpected end of input$|^missing \} /,
    explain: () => 'O código terminou antes do esperado. Normalmente falta fechar uma chave }, um parêntese ) ou um colchete ].',
  },
  {
    test: /^missing \) after argument list$/,
    explain: () => 'Falta fechar um parêntese ) na chamada de uma função, ou há uma vírgula/aspas faltando entre os argumentos.',
  },
  {
    test: /^Unexpected token '?(.+?)'?$|^expected expression, got '(.+)'$/,
    explain: (m) => `O JavaScript encontrou "${m[1] ?? m[2]}" num lugar onde não esperava. Confira parênteses, chaves, vírgulas e aspas perto desse ponto.`,
  },
  {
    test: /^Invalid or unexpected token$|^unterminated string literal$/,
    explain: () => 'Há um caractere inválido ou uma string sem fechar aspas. Verifique se cada texto abre e fecha com o mesmo tipo de aspas.',
  },
  {
    test: /^Maximum call stack size exceeded$|^too much recursion$/,
    explain: () => 'Uma função está chamando a si mesma sem parar (recursão infinita). Verifique a condição de parada.',
  },
  {
    test: /^Illegal return statement$|^return not in function$/,
    explain: () => 'Existe um return fora de uma função. return só pode ser usado dentro de funções.',
  },
];

export function toFriendlyError(error: unknown): FriendlyError {
  if (error instanceof Error) {
    for (const rule of RULES) {
      const match = error.message.match(rule.test);
      if (match) return { name: error.name, message: error.message, explanation: rule.explain(match) };
    }
    return {
      name: error.name,
      message: error.message,
      explanation: 'Leia a mensagem com calma: o tipo do erro (antes dos dois-pontos) indica a categoria do problema e o texto descreve o que aconteceu.',
    };
  }
  return {
    name: 'Erro',
    message: String(error),
    explanation: 'Seu código lançou um valor que não é um objeto Error. Use throw new Error("mensagem").',
  };
}

export const TIMEOUT_ERROR: FriendlyError = {
  name: 'Tempo esgotado',
  message: 'A execução passou do limite de tempo.',
  explanation:
    'Seu código demorou demais para terminar — quase sempre é um laço infinito. Verifique se a condição do while/for fica falsa em algum momento e se a variável de controle está sendo atualizada.',
};
