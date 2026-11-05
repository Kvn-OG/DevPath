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
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { computeXp, levelInfo } from '../../domain/gamification';
import { dueReviews } from '../../domain/review';
import { failedAttemptsByConcept } from '../../domain/recommendations';
import { useAuth } from '../../state/AuthProvider';
import { useProgress } from '../../state/ProgressProvider';
import { cn } from '../../utils/cn';
import { Atmosphere } from '../../identity/Atmosphere';
import { LevelRing } from '../../identity/LevelRing';
import { gsap, motionOK, useGSAP } from '../../identity/motion';
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

  const nav = <MainNav dueCount={dueCount} pathname={location.pathname} />;

  const levelCard = (
    <Link to="/progresso" className="dp-spot flex items-center gap-3 rounded-2xl border border-line bg-surface-2/50 p-3 text-sm hover:border-line-strong">
      <LevelRing progress={level.progress} level={level.level} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium">Nível {level.level}</span>
          <span className="font-mono text-[11px] text-muted tabular-nums">{level.xp} XP</span>
        </div>
        <div className="truncate text-xs text-muted">{level.name}</div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-dvh">
      <Atmosphere />
      <a href="#conteudo" className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Pular para o conteúdo
      </a>

      <aside className="dp-glass fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-7 overflow-y-auto border-r border-line px-3 py-6 lg:flex">
        <Link to="/" className="px-3" aria-label="DevPath — início">
          <Logo animate />
        </Link>
        {nav}
        <div className="mt-auto space-y-3">
          {levelCard}
          <AccountBox />
          <SyncIndicator status={status} mode={activeMode} error={error} />
        </div>
      </aside>

      <header className="dp-glass sticky top-0 z-30 flex items-center justify-between border-b border-line px-4 py-3 lg:hidden">
        <Link to="/" aria-label="DevPath — início">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-movel"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          className="rounded-xl border border-line p-2 text-muted"
        >
          {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
        </button>
      </header>
      {open && (
        <div id="menu-movel" className="dp-glass animate-fade-in sticky top-[61px] z-30 space-y-4 border-b border-line px-3 py-4 lg:hidden">
          {nav}
          {levelCard}
          <AccountBox />
          <SyncIndicator status={status} mode={activeMode} error={error} />
        </div>
      )}

      <main id="conteudo" className="px-4 py-8 sm:px-8 lg:ml-64 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-6xl">
          {activeMode === 'demo' && (
            <div role="note" className="mb-6 rounded-xl border border-warning/30 bg-warning-soft px-4 py-2.5 text-sm text-fg">
              <strong className="text-warning">Modo demonstração:</strong> todo o progresso exibido é fictício e serve apenas para conhecer a plataforma.{' '}
              <Link to="/configuracoes" className="underline underline-offset-2 hover:text-accent-strong">
                Voltar ao meu progresso
              </Link>
            </div>
          )}
          {notice && (
            <div role="status" className="mb-6 rounded-xl border border-success/30 bg-success-soft px-4 py-2.5 text-sm text-fg">
              {notice}
            </div>
          )}
          {ready ? <Outlet /> : <p className="py-10 text-muted">Carregando seu progresso…</p>}
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
        className="flex items-center gap-2 rounded-xl border border-accent-strong/40 bg-accent-soft px-3 py-2 text-sm font-medium hover:border-accent-strong/70"
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

/**
 * Navegação com um indicador luminoso que desliza até o item ativo.
 */
function MainNav({ dueCount, pathname }: { dueCount: number; pathname: string }) {
  const root = useRef<HTMLElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const nav = root.current;
      const ind = indicator.current;
      if (!nav || !ind) return;
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active) {
        gsap.set(ind, { autoAlpha: 0 });
        return;
      }
      const target = { y: active.offsetTop, height: active.offsetHeight, autoAlpha: 1 };
      if (motionOK() && ind.dataset.placed) gsap.to(ind, { ...target, duration: 0.55, ease: 'expo.out' });
      else gsap.set(ind, target);
      ind.dataset.placed = '1';
    },
    { dependencies: [pathname], scope: root },
  );

  return (
    <nav ref={root} aria-label="Navegação principal" className="relative flex flex-col gap-0.5">
      <span
        ref={indicator}
        aria-hidden
        className="pointer-events-none invisible absolute inset-x-0 top-0 rounded-xl border border-accent-strong/20 bg-accent-soft"
      >
        <span className="absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-r-full bg-spark shadow-[0_0_12px_2px_var(--dp-spark)]" />
      </span>
      {NAV.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn('relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors', isActive ? 'font-medium text-fg' : 'text-muted hover:bg-surface-2/70 hover:text-fg')
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={17} aria-hidden className={cn('transition-transform duration-300', isActive ? 'scale-110 text-accent-strong' : undefined)} />
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
}
