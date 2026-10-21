// Diferenças que confundem iniciantes, exibidas na página de trilhas.

export interface Comparison {
  title: string;
  left: { name: string; text: string };
  right: { name: string; text: string };
  takeaway: string;
}

export const comparisons: Comparison[] = [
  {
    title: 'JavaScript × Java',
    left: { name: 'JavaScript', text: 'Linguagem dinâmica que roda no navegador e, com Node.js, no servidor. Tipos são verificados durante a execução.' },
    right: { name: 'Java', text: 'Linguagem compilada e estaticamente tipada, executada na JVM. Muito usada em back-ends corporativos com Spring Boot.' },
    takeaway: 'Os nomes são parecidos por marketing dos anos 1990; são linguagens diferentes, com regras diferentes.',
  },
  {
    title: 'React × Node.js',
    left: { name: 'React', text: 'Biblioteca para construir interfaces. Roda no navegador e cuida do que o usuário vê e com o que interage.' },
    right: { name: 'Node.js', text: 'Ambiente que executa JavaScript fora do navegador — por exemplo, num servidor que responde requisições.' },
    takeaway: 'Ambos usam JavaScript, mas React é front-end e Node.js é um ambiente de execução, muito usado no back-end.',
  },
  {
    title: 'Banco de dados × back-end',
    left: { name: 'Banco de dados', text: 'Armazena e consulta dados com segurança e integridade (ex.: PostgreSQL).' },
    right: { name: 'Back-end', text: 'Código que aplica regras de negócio, valida dados, autentica usuários e conversa com o banco.' },
    takeaway: 'O banco guarda; o back-end decide o que pode ser guardado, por quem e como.',
  },
  {
    title: 'Supabase × API própria',
    left: { name: 'Supabase', text: 'Back-end gerenciado: PostgreSQL, autenticação, RLS e Storage prontos. O front-end acessa o banco diretamente, protegido por políticas.' },
    right: { name: 'API própria', text: 'Servidor escrito por você (Node.js ou Spring Boot) que concentra regras de negócio complexas, integrações e processamentos.' },
    takeaway: 'Supabase acelera muito, mas não elimina a necessidade de entender banco de dados, segurança e regras de negócio. Use uma API própria quando a lógica não couber bem em políticas e funções do banco.',
  },
];
