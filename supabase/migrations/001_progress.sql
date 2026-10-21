-- DevPath — progresso do estudante (integração OPCIONAL com Supabase)
-- Execute no SQL Editor do seu projeto Supabase.
--
-- Princípios:
--   * Cada linha pertence a um usuário (user_id = auth.uid()).
--   * RLS habilitado em TODAS as tabelas; nenhuma política dá acesso a dados de outros usuários.
--   * IDs de conteúdo (aulas, exercícios...) são textos estáveis definidos no repositório
--     (src/content). Veja 002_content_catalog.sql para o catálogo opcional no banco.

-- ---------------------------------------------------------------------------
-- Perfis

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  weekly_goal_exercises smallint not null default 10 check (weekly_goal_exercises between 1 and 100),
  weekly_goal_lessons smallint not null default 3 check (weekly_goal_lessons between 1 and 50),
  created_at timestamptz not null default now()
);

-- Cria o perfil automaticamente no cadastro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Progresso

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  started_at timestamptz not null,
  last_visited_at timestamptz not null,
  completed_at timestamptz,
  primary key (user_id, lesson_id),
  check (completed_at is null or completed_at >= started_at - interval '1 minute')
);

create table if not exists public.exercise_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,
  attempts integer not null default 0 check (attempts >= 0),
  failed_attempts integer not null default 0 check (failed_attempts >= 0 and failed_attempts <= attempts),
  solved boolean not null default false,
  first_solved_at timestamptz,
  hints_used smallint not null default 0 check (hints_used between 0 and 3),
  solution_viewed boolean not null default false,
  last_code text check (char_length(last_code) <= 50000),
  solved_code text check (char_length(solved_code) <= 50000),
  primary key (user_id, exercise_id),
  check (not solved or first_solved_at is not null)
);

-- Histórico imutável de tentativas (base das estatísticas e recomendações).
create table if not exists public.exercise_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,
  created_at timestamptz not null,
  correct boolean not null,
  hints_used smallint not null check (hints_used between 0 and 3),
  solution_viewed boolean not null,
  source text not null check (source in ('aula', 'pratica', 'revisao', 'avaliacao', 'desafio', 'projeto'))
);
create index if not exists exercise_attempts_user_exercise_idx on public.exercise_attempts (user_id, exercise_id);
create index if not exists exercise_attempts_user_created_idx on public.exercise_attempts (user_id, created_at desc);

create table if not exists public.challenge_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  challenge_id text not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  primary key (user_id, challenge_id)
);

create table if not exists public.project_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id text not null,
  started_at timestamptz not null,
  completed_step_ids text[] not null default '{}',
  reflections jsonb not null default '{}'::jsonb check (jsonb_typeof(reflections) = 'object'),
  completed_at timestamptz,
  primary key (user_id, project_id)
);

create table if not exists public.assessment_results (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  assessment_id text not null,
  created_at timestamptz not null,
  correct integer not null check (correct >= 0),
  total integer not null check (total > 0),
  passed boolean not null,
  missed_exercise_ids text[] not null default '{}',
  check (correct <= total)
);
create index if not exists assessment_results_user_assessment_idx on public.assessment_results (user_id, assessment_id);

-- Revisão espaçada (caixas de Leitner).
create table if not exists public.review_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  concept_id text not null,
  box smallint not null default 0 check (box between 0 and 5),
  due_at timestamptz not null,
  lapses integer not null default 0 check (lapses >= 0),
  last_reviewed_at timestamptz,
  primary key (user_id, concept_id)
);
create index if not exists review_items_user_due_idx on public.review_items (user_id, due_at);

create table if not exists public.study_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  activities integer not null default 0 check (activities >= 0),
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------------
-- Row Level Security: cada usuário acessa apenas as próprias linhas.

alter table public.profiles enable row level security;

drop policy if exists "perfil: ler o próprio" on public.profiles;
create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "perfil: criar o próprio" on public.profiles;
create policy "perfil: criar o próprio" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "perfil: atualizar o próprio" on public.profiles;
create policy "perfil: atualizar o próprio" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare
  t text;
begin
  foreach t in array array[
    'lesson_progress', 'exercise_progress', 'exercise_attempts', 'challenge_progress',
    'project_progress', 'assessment_results', 'review_items', 'study_days'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "dono: ler" on public.%I', t);
    execute format('create policy "dono: ler" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);

    execute format('drop policy if exists "dono: inserir" on public.%I', t);
    execute format('create policy "dono: inserir" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);

    execute format('drop policy if exists "dono: atualizar" on public.%I', t);
    execute format('create policy "dono: atualizar" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);

    execute format('drop policy if exists "dono: apagar" on public.%I', t);
    execute format('create policy "dono: apagar" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end
$$;

-- Tentativas e resultados de avaliação são históricos: impede reescrever o passado.
drop policy if exists "dono: atualizar" on public.exercise_attempts;
drop policy if exists "dono: atualizar" on public.assessment_results;
