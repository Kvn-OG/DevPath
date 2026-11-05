import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { gsap, motionOK, useGSAP } from '../../identity/motion';
import { cn } from '../../utils/cn';

/** Cartão com holofote que segue o ponteiro (classe dp-spot). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('dp-spot rounded-2xl border border-line bg-surface p-5', className)} {...props} />;
}

type Tone = 'neutral' | 'accent' | 'success' | 'danger' | 'warning' | 'info';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted border-line',
  accent: 'bg-accent-soft text-accent-strong border-accent-strong/25',
  success: 'bg-success-soft text-success border-success/25',
  danger: 'bg-danger-soft text-danger border-danger/25',
  warning: 'bg-warning-soft text-warning border-warning/25',
  info: 'bg-info-soft text-info border-info/25',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap', toneClass[tone], className)}>
      {children}
    </span>
  );
}

/**
 * O traço: a barra de progresso é um caminho que acende, com uma faísca na ponta.
 * Ao entrar na tela, ela "corre" do zero até o valor.
 */
export function ProgressBar({ value, label, className, hue }: { value: number; label: string; className?: string; hue?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const fill = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      const el = fill.current;
      if (!el || !motionOK()) return;
      if (first.current) {
        first.current = false;
        gsap.fromTo(
          el,
          { width: '0%' },
          { width: `${pct}%`, duration: 1.4, ease: 'expo.out', delay: 0.15, scrollTrigger: { trigger: el, start: 'top 95%', once: true } },
        );
      } else {
        gsap.to(el, { width: `${pct}%`, duration: 0.9, ease: 'expo.out' });
      }
    },
    { dependencies: [pct] },
  );

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={cn('h-1.5 w-full rounded-full bg-surface-2', className)}
      style={hue ? ({ '--dp-trail': hue } as CSSProperties) : undefined}
    >
      {pct > 0 && <div ref={fill} className="dp-trail" data-full={pct >= 100} style={{ width: `${pct}%` }} />}
    </div>
  );
}

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-3 font-mono text-xs tracking-wider text-muted uppercase">{eyebrow}</div>}
        <h1 className="text-3xl text-fg sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, id, aside }: { children: ReactNode; id?: string; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 id={id} className="flex items-center gap-2.5 text-lg font-semibold text-fg">
        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-spark shadow-[0_0_10px_var(--dp-spark)]" />
        {children}
      </h2>
      {aside}
    </div>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong/70 bg-surface/40 px-6 py-10 text-center">
      {icon && <div className="mb-3 text-faint">{icon}</div>}
      <p className="font-medium text-fg">{title}</p>
      {children && <div className="mt-1 max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="dp-spot overflow-hidden rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between font-mono text-[11px] tracking-wider text-muted uppercase">
        {label}
        {icon}
      </div>
      <div className="font-display mt-2 text-3xl font-semibold tabular-nums text-fg">{value}</div>
      {hint && <div className="mt-1 text-xs text-faint">{hint}</div>}
    </div>
  );
}
