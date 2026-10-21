-- DevPath — catálogo de conteúdo no banco (OPCIONAL, planejado para evolução)
--
-- Hoje a fonte da verdade do conteúdo são os arquivos tipados em src/content,
-- versionados no Git. Estas tabelas documentam o modelo relacional para quando
-- o conteúdo for gerenciado por um CMS/painel administrativo. A aplicação atual
-- NÃO depende delas.

create table if not exists public.tracks (
  id text primary key,
  position smallint not null unique,
  title text not null,
  description text not null,
  status text not null check (status in ('completo', 'em-producao', 'planejado'))
);

create table if not exists public.modules (
  id text primary key,
  track_id text not null references public.tracks (id) on delete cascade,
  position smallint not null,
  title text not null,
  status text not null check (status in ('completo', 'em-producao', 'planejado')),
  unique (track_id, position)
);

create table if not exists public.lessons (
  id text primary key,
  module_id text not null references public.modules (id) on delete cascade,
  position smallint not null,
  title text not null,
  duration_min smallint not null check (duration_min > 0),
  body jsonb not null, -- blocos de explicação, exemplo, erros comuns, resumo...
  unique (module_id, position)
);

create table if not exists public.lesson_prerequisites (
  lesson_id text not null references public.lessons (id) on delete cascade,
  required_lesson_id text not null references public.lessons (id) on delete restrict,
  primary key (lesson_id, required_lesson_id),
  check (lesson_id <> required_lesson_id)
);

create table if not exists public.concepts (
  id text primary key,
  name text not null,
  lesson_id text not null references public.lessons (id)
);

create table if not exists public.exercises (
  id text primary key,
  lesson_id text references public.lessons (id) on delete set null,
  type text not null check (type in ('multiple-choice', 'true-false', 'fill-blanks', 'order-steps', 'predict-output', 'code')),
  difficulty text not null check (difficulty in ('iniciante', 'basico', 'intermediario', 'avancado')),
  title text not null,
  statement text not null,
  hints text[] not null check (array_length(hints, 1) = 3),
  solution jsonb not null
);

create table if not exists public.exercise_concepts (
  exercise_id text not null references public.exercises (id) on delete cascade,
  concept_id text not null references public.concepts (id) on delete cascade,
  primary key (exercise_id, concept_id)
);

-- Alternativas (múltipla escolha e justificativas de verdadeiro/falso).
create table if not exists public.exercise_options (
  id text not null,
  exercise_id text not null references public.exercises (id) on delete cascade,
  position smallint not null,
  text text not null,
  feedback text,
  is_correct boolean not null default false,
  primary key (exercise_id, id)
);

-- Critérios de correção: testes automatizados, restrições e respostas aceitas.
create table if not exists public.grading_criteria (
  id bigint generated always as identity primary key,
  exercise_id text not null references public.exercises (id) on delete cascade,
  kind text not null check (kind in ('test', 'constraint', 'accepted-answer', 'expected-output', 'order')),
  spec jsonb not null,
  hidden boolean not null default false
);

create table if not exists public.challenges (
  id text primary key,
  position smallint not null unique,
  title text not null,
  level text not null check (level in ('iniciante', 'basico', 'intermediario', 'avancado')),
  status text not null check (status in ('completo', 'em-producao', 'planejado')),
  exercise_id text references public.exercises (id)
);

create table if not exists public.projects (
  id text primary key,
  letter text not null unique,
  title text not null,
  status text not null check (status in ('completo', 'em-producao', 'planejado'))
);

create table if not exists public.project_steps (
  id text not null,
  project_id text not null references public.projects (id) on delete cascade,
  position smallint not null,
  title text not null,
  exercise_id text references public.exercises (id),
  primary key (project_id, id),
  unique (project_id, position)
);

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null
);

-- Conquistas desbloqueadas (hoje são derivadas no cliente a partir do progresso).
create table if not exists public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- Catálogo: leitura para usuários autenticados; escrita apenas via service_role (painel admin/CI).
do $$
declare
  t text;
begin
  foreach t in array array[
    'tracks', 'modules', 'lessons', 'lesson_prerequisites', 'concepts', 'exercises',
    'exercise_concepts', 'exercise_options', 'challenges', 'projects', 'project_steps', 'achievements'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "catálogo: leitura" on public.%I', t);
    execute format('create policy "catálogo: leitura" on public.%I for select to authenticated using (true)', t);
  end loop;
end
$$;

-- grading_criteria contém testes ocultos e respostas: sem política de leitura para usuários.
alter table public.grading_criteria enable row level security;

alter table public.user_achievements enable row level security;
drop policy if exists "dono: ler" on public.user_achievements;
create policy "dono: ler" on public.user_achievements for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "dono: inserir" on public.user_achievements;
create policy "dono: inserir" on public.user_achievements for insert to authenticated with check ((select auth.uid()) = user_id);
