import {
  BookOpen,
  ChartNoAxesColumn,
  Cloud,
  CloudOff,
  Dumbbell,
  FolderKanban,
  LayoutDashboard,
  Library,
  LogIn,
  LogOut,
  Menu,
  RefreshCcw,
  Settings,
  Swords,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { computeXp, levelInfo } from '../../domain/gamification';
import { dueReviews } from '../../domain/review';
import { failedAttemptsByConcept } from '../../domain/recommendations';
import { useAuth } from '../../state/AuthProvider';
import { useProgress } from '../../state/ProgressProvider';
import { cn } from '../../utils/cn';
import { Logo } from './Logo';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/trilhas', label: 'Trilhas', icon: BookOpen },
  { to: '/exercicios', label: 'Exercícios', icon: Dumbbell },
  { to: '/desafios', label: 'Desafios', icon: Swords },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban },
  { to: '/revisao', label: 'Revisão', icon: RefreshCcw, badge: 'reviews' as const },
  { to: '/progresso', label: 'Progresso', icon: ChartNoAxesColumn },
  { to: '/glossario', label: 'Glossário', icon: Library },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function AppShell() {
  const { state, activeMode, status, error, notice, ready } = useProgress();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  const level = levelInfo(computeXp(state));
  const dueCount = dueReviews(state, new Date(), failedAttemptsByConcept(state)).length;

  const nav = (
    <nav aria-label="Navegação principal" className="flex flex-col gap-0.5">
      {NAV.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive ? 'bg-accent-soft font-medium text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={17} aria-hidden className={isActive ? 'text-accent-strong' : undefined} />
              <span className="flex-1">{label}</span>
              {badge === 'reviews' && dueCount > 0 && (
                <span className="rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-fg tabular-nums" aria-label={`${dueCount} revisões pendentes`}>
                  {dueCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  const levelCard = (
    <Link to="/progresso" className="block rounded-lg border border-line bg-surface-2/60 p-3 text-sm hover:border-line-strong">
      <div className="flex items-center justify-between">
        <span className="font-medium">Nível {level.level}</span>
        <span className="text-xs text-muted tabular-nums">{level.xp} XP</span>
      </div>
      <div className="text-xs text-muted">{level.name}</div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-bg" aria-hidden>
        <div className="h-full rounded-full bg-accent-strong" style={{ width: `${Math.round(level.progress * 100)}%` }} />
      </div>
    </Link>
  );

  return (
    <div className="min-h-dvh">
      <a href="#conteudo" className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Pular para o conteúdo
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col gap-6 overflow-y-auto border-r border-line bg-surface px-3 py-5 lg:flex">
        <Link to="/" className="px-3" aria-label="DevPath — início">
          <Logo />
        </Link>
        {nav}
        <div className="mt-auto space-y-3">
          {levelCard}
          <AccountBox />
          <SyncIndicator status={status} mode={activeMode} error={error} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link to="/" aria-label="DevPath — início">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-movel"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          className="rounded-lg border border-line p-2 text-muted"
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </header>
      {open && (
        <div id="menu-movel" className="animate-fade-in space-y-4 border-b border-line bg-surface px-3 py-4 lg:hidden">
          {nav}
          {levelCard}
          <AccountBox />
          <SyncIndicator status={status} mode={activeMode} error={error} />
        </div>
      )}

      <main id="conteudo" className="px-4 py-8 sm:px-8 lg:ml-60 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {activeMode === 'demo' && (
            <div role="note" className="mb-6 rounded-lg border border-warning/30 bg-warning-soft px-4 py-2.5 text-sm text-fg">
              <strong className="text-warning">Modo demonstração:</strong> todo o progresso exibido é fictício e serve apenas para conhecer a plataforma.{' '}
              <Link to="/configuracoes" className="underline underline-offset-2 hover:text-accent-strong">
                Voltar ao meu progresso
              </Link>
            </div>
          )}
          {notice && (
            <div role="status" className="mb-6 rounded-lg border border-success/30 bg-success-soft px-4 py-2.5 text-sm text-fg">
              {notice}
            </div>
          )}
          {ready ? <Outlet /> : <p className="text-muted">Carregando seu progresso…</p>}
        </div>
      </main>
    </div>
  );
}

function AccountBox() {
  const auth = useAuth();
  if (!auth.available || auth.loading) return null;
  if (!auth.user) {
    return (
      <Link
        to="/entrar"
        className="flex items-center gap-2 rounded-lg border border-accent-strong/40 bg-accent-soft px-3 py-2 text-sm font-medium hover:border-accent-strong/70"
      >
        <LogIn size={16} aria-hidden className="text-accent-strong" />
        Entrar para sincronizar
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2 px-1 text-xs text-muted">
      <span className="min-w-0 flex-1 truncate" title={auth.user.email}>
        {auth.user.email}
      </span>
      <button type="button" onClick={() => auth.signOut()} className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-surface-2 hover:text-fg">
        <LogOut size={13} aria-hidden /> Sair
      </button>
    </div>
  );
}

function SyncIndicator({ status, mode, error }: { status: string; mode: string; error: string | null }) {
  const label =
    mode === 'nuvem'
      ? status === 'erro'
        ? 'Sincronização pendente'
        : status === 'salvando'
          ? 'Sincronizando…'
          : 'Sincronizado com a sua conta'
      : mode === 'demo'
        ? 'Dados de demonstração (neste navegador)'
        : status === 'erro'
          ? 'Falha ao salvar'
          : 'Salvo neste navegador';
  return (
    <div className="flex items-start gap-2 px-1 text-xs text-faint" title={error ?? undefined} role="status" aria-live="polite">
      {status === 'erro' ? <CloudOff size={14} className="mt-px shrink-0 text-warning" aria-hidden /> : <Cloud size={14} className="mt-px shrink-0" aria-hidden />}
      <span>
        {label}
        {error && status === 'erro' && <span className="block text-warning">{error}</span>}
      </span>
    </div>
  );
}
