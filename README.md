# DevPath

Plataforma interativa para aprender programação full stack do zero: aulas curtas e progressivas, exercícios corrigidos de verdade, dicas progressivas, desafios, projetos guiados, avaliações, revisão espaçada e acompanhamento de progresso. Todo o conteúdo é em português brasileiro.

## Como rodar

Requisitos: Node.js 20+ (testado com Node 24) e npm.

```bash
npm install        # instala as dependências
npm run dev        # inicia em http://localhost:5173
npm test           # roda todos os testes (Vitest)
npm run typecheck  # checagem de tipos
npm run build      # build de produção em dist/
npm run preview    # serve o build localmente
```

Nenhum serviço externo é necessário: o DevPath funciona 100% local, salvando o progresso no navegador.

## O que está pronto (v0.1)

| Item | Situação |
| --- | --- |
| Trilha 1 — Lógica de programação com JavaScript | **Completa**: 3 módulos, 12 aulas |
| Trilha 5 — Banco de dados e PostgreSQL | **Completa**: 6 módulos, 24 aulas (fundamentos, SQL puro, relacionamentos, modelagem, índices/EXPLAIN/MVCC/WAL e PostgreSQL na prática), com SQL executado em um PostgreSQL real no navegador |
| Trilha 10 — Go | **Completa**: 5 módulos, 15 aulas (linguagem, dados, interfaces e erros, concorrência, APIs com PostgreSQL) |
| Trilha 11 — Servidores: VPS, Docker e EasyPanel | **Completa**: 6 módulos, 18 aulas (VPS e Linux, segurança, DNS/proxy/HTTPS, Docker, EasyPanel, operação) |
| Exercícios das aulas | 138 (guiado + independente por aula), 4 níveis de dificuldade, 11 formatos |
| Avaliações | Lógica: diagnóstica (6), 3 de módulo (4 cada) e final (8); finais de Banco de dados, Go e VPS (8 cada): 50 questões exclusivas |
| Desafios | 5 completos (calculadora, conversor, validador, tarefas, contatos) + 7 planejados |
| Projeto guiado | Projeto A — Calculadora de comissões e metas (5 etapas incrementais) |
| Trilhas 2–4 e 6–9, trilha 12, projetos B–F e projeto final | **Planejados**: estrutura, objetivos, pré-requisitos e tópicos. Marcados como “Em planejamento” na interface |
| Glossário | 40 termos + comparações (JavaScript × Java, React × Node.js, banco × back-end, Supabase × API própria) |

### Formatos de exercício
Múltipla escolha · verdadeiro/falso com justificativa · preencher lacunas · ordenar etapas · prever a saída · exercícios de código (escrever função, corrigir bug, completar código, resolver algoritmo e refatorar) · e exercícios de SQL (escrever e corrigir consultas, alterar dados e criar tabelas).

### Como a correção funciona
- **Código**: executado em um **Web Worker isolado** (sem DOM, sem rede, sem acesso ao armazenamento da aplicação, modo estrito, limite de 2,5 s contra laços infinitos) e corrigido por **testes automatizados**, incluindo testes ocultos de casos-limite. Algumas tarefas têm restrições verificáveis (ex.: “use filter e map, sem for”). Erros do JavaScript são exibidos com a mensagem original e uma explicação em português.
- **SQL**: executado em um **PostgreSQL real (PGlite, compilado para WebAssembly)** dentro de um Web Worker, carregado só quando a página tem SQL. Cada execução começa com um banco limpo (schemas, roles e transações do estudante são descartados) e roda o script de dados do exercício. Os testes comparam o resultado da consulta (ou uma consulta de conferência, para INSERT/UPDATE/CREATE TABLE), e os testes ocultos rodam a mesma resposta com **outros dados**, para recusar resultados fixados à mão. Erros do PostgreSQL aparecem com o código, a linha e uma explicação em português. Os testes de conteúdo rodam todas as soluções, códigos iniciais e exemplos no mesmo PostgreSQL, no Node.
- **Go e shell**: ainda sem execução no navegador. As aulas usam leitura de código, previsão, lacunas e ordenação; os exemplos de Go foram conferidos no Go Playground durante a autoria.
- **Prever a saída**: compara linha a linha, ignorando espaços extras e tipo de aspas. As saídas esperadas são conferidas pelos testes executando o código de verdade.
- **Lacunas**: aceita variações equivalentes (ex.: `.nome`, `["nome"]`, `['nome']`).
- **Verdadeiro/falso**: exige o valor **e** a justificativa, e diz qual das duas partes está errada.
- Dicas em 4 níveis: conceito → raciocínio → estrutura parcial → solução comentada. A solução só é liberada depois de uma tentativa e das três dicas.

### Progresso e aprendizagem
- Aula **concluída** = os dois exercícios resolvidos (abrir a página não conta). **Dominada** = concluída sem consultar a solução do exercício independente e com domínio ≥ 80% nos conceitos.
- Domínio por conceito calculado a partir de acertos, tentativas erradas, dicas e soluções vistas em todos os exercícios do conceito.
- **Revisão espaçada** (caixas de Leitner: 1, 2, 4, 7, 15, 30 dias). Conceitos entram ao concluir a aula, ao errar o mesmo exercício duas vezes ou ao errar questões de avaliação.
- **Recomendações explicáveis**, ex.: “Recomendamos revisar condicionais porque você teve dificuldade em 3 exercícios desse assunto (4 tentativas sem sucesso).”
- Gamificação moderada: XP (reduzido quando há dicas/solução), níveis, 12 conquistas, metas semanais configuráveis, sequência de dias **sem punição** e marcos por trilha.
- Pré-requisitos entre aulas, com opção “Abrir mesmo assim” para consulta.

### Modos de dados
- **Meu progresso (padrão)**: sem login, salvo no `localStorage`. Com login (Neon configurado), sincronizado com a conta e disponível em qualquer dispositivo. No primeiro login, se a conta estiver vazia, o progresso do navegador é enviado para ela automaticamente.
- **Demonstração**: progresso **fictício**, gerado pelas mesmas regras do sistema, salvo separadamente e sinalizado com um aviso em todas as páginas. Não altera o progresso real.

Exportar/importar progresso em JSON fica em Configurações.

## Arquitetura

SPA em **React 19 + Vite + TypeScript + Tailwind CSS 4**, com React Router, CodeMirror 6 (editor) e Lucide (ícones).

```
src/
  content/       Conteúdo educacional tipado (aulas, exercícios, avaliações, desafios, projetos, trilhas, glossário)
  types/         Tipos de conteúdo e de progresso
  domain/        Regras puras: correção, domínio, revisão espaçada, XP, estatísticas, recomendações, reducer de progresso
  sandbox/       Execução isolada de código (avaliador, Web Worker, formatação, tradução de erros)
  persistence/   Repositórios (localStorage, demonstração, Neon) e mapeamento para tabelas
  state/         Providers React (autenticação opcional e progresso com salvamento automático)
  components/    UI: layout, primitivos, código, exercícios, aula
  pages/         Uma página por rota
neon/migrations/      SQL das tabelas, constraints, índices e políticas RLS
```

Decisões principais:
- **Conteúdo separado da interface**: novas aulas são arquivos em `src/content/...` registrados em `src/content/index.ts`. Nenhum componente precisa mudar.
- **Toda mudança de progresso passa por um reducer puro** (`domain/progressReducer.ts`). A persistência só salva o estado resultante, através da interface `ProgressRepository`. Trocar localStorage pelo Neon (ou o Neon por outro banco) não toca na UI.
- **Estatísticas são derivadas** dos registros (tentativas, aulas, avaliações). Nada é armazenado “pronto” e nenhum número é inventado: sem tentativas, a taxa de acertos aparece como “—”.
- **Testes de conteúdo** garantem que toda solução oficial passa nos próprios testes, que nenhum código inicial passa sozinho e que toda saída esperada confere com a execução real.

## Configuração opcional do Neon (login e sincronização)

1. Crie um banco Neon. Pela Vercel: *Storage → Create Database → Neon*, conectado ao projeto. Também dá para criar direto em [neon.com](https://neon.com).
2. No console do Neon, ative o **Neon Auth** (Better Auth) e a **Data API**. Na Data API, marque *Use Neon Auth* e deixe *Grant public schema access* **desmarcado**: as permissões ficam no SQL do passo 3.
3. No **SQL Editor** do Neon, execute `neon/migrations/001_progress.sql` (tabelas de progresso, constraints, índices, permissões e RLS). O arquivo `002_content_catalog.sql` é opcional: ele documenta o modelo relacional do catálogo de conteúdo para uma futura gestão via CMS; o app não depende dele.
4. Em *Settings → Better Auth*:
   - em **Domains**, adicione o endereço de produção (ex.: `https://seu-app.vercel.app`) e mantenha **Allow Localhost** ligado para desenvolvimento;
   - ative **Verify at Sign-up** para exigir a confirmação do e-mail;
   - troque o **Application Name** pelo nome que deve aparecer nos e-mails.
5. Copie `.env.example` para `.env.local` e preencha com a URL pública do banco: a **API URL** da Data API sem `.apirest` e sem `/rest/v1`.
   ```
   VITE_NEON_URL=https://ep-xxx.c-2.us-east-1.aws.neon.tech/neondb
   ```
   Essa URL não tem senha. A connection string do Postgres (com senha) nunca deve ir para o front-end ou para o repositório. `.env.local` já está no `.gitignore`.
6. Na Vercel, cadastre a mesma variável em *Project Settings → Environment Variables* e faça um novo deploy (variáveis `VITE_` entram no build).
7. Reinicie `npm run dev`. Use **Entrar para sincronizar** (barra lateral) ou a página `/entrar` para criar a conta ou entrar.

Segurança: RLS está habilitado em todas as tabelas e cada política restringe o acesso a `auth.user_id() = user_id` (o `sub` do JWT do Neon Auth). O papel `authenticated` só recebe permissão nas tabelas de progresso. Tentativas e resultados de avaliação não têm UPDATE (histórico imutável). Falhas de conexão não perdem dados: o progresso fica em cache local e é reenviado automaticamente.

## Testes

`npm test` roda 153 testes em 6 arquivos:
- integridade do conteúdo (soluções, códigos iniciais, saídas esperadas, referências e quantidades mínimas);
- avaliador do sandbox (testes, erros, isolamento, restrições);
- correção dos formatos não-código;
- regras de progresso, revisão, recomendações, XP e estatísticas;
- persistência local, dados de demonstração e mapeamento para as tabelas do Neon;
- fluxo de ponta a ponta na interface: abrir a aula 1, errar, receber feedback, acertar, concluir a aula, salvar e restaurar o progresso, além das dicas, dos pré-requisitos e da navegação por todas as páginas.

## Limitações conhecidas

- **Web Workers no jsdom**: o jsdom (ambiente dos testes de interface) não tem Web Workers, então a execução de código na UI não é coberta por esses testes. A lógica do avaliador é testada diretamente, e o worker compilado foi validado em Node com um `self` simulado. Se o navegador não oferecer Workers, o DevPath informa a limitação em vez de simular resultados.
- **Isolamento do sandbox**: ele é adequado para código do próprio estudante rodando no próprio navegador, mas não é um sandbox para código de terceiros. Por exemplo, `(() => {}).constructor` ainda alcança o escopo do worker, que já está sem rede.
- Mensagens de erro não indicam a linha exata do código do estudante.
- As perguntas de revisão das aulas são de autoverificação (resposta revelada) e não contam para o domínio.
- As reflexões dos projetos são registradas, mas não avaliadas automaticamente.
- Go, Java, shell e React ainda não têm ambiente de execução (sugestão: um executor remoto isolado para Go e Java).
- O PostgreSQL do navegador (PGlite) baixa cerca de 16 MB (wasm + dados) na primeira execução de SQL; depois fica em cache. Ele roda com `fsync` desligado e um único usuário: serve para aprender SQL, não para medir desempenho.
- Conquistas são derivadas do progresso e não guardam a data de desbloqueio.
- O cliente Neon (Auth + Data API) entra no bundle inicial mesmo sem configuração.

## Próximas melhorias recomendadas

1. Produzir a Trilha 2 (Fundamentos da Web) e o Projeto B, com exercícios de HTML/CSS/DOM validados em um iframe isolado.
2. Executor remoto isolado para Go, transformando os exercícios da Trilha 10 em exercícios de código com testes.
3. Indicar a linha do erro no editor (mapeando o stack trace do worker).
4. Carregar o cliente Neon sob demanda (import dinâmico) quando configurado.
5. Testes E2E em navegador real (Playwright) cobrindo os exercícios de código.
6. Registrar a data de desbloqueio das conquistas e mostrar uma notificação discreta.
