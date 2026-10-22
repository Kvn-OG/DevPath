import { useState } from 'react';
import { useAuth } from '../../state/AuthProvider';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

export const inputClass = 'h-10 w-full rounded-lg border border-line bg-bg px-3 text-sm outline-none focus:border-accent-strong/60';

type Tab = 'entrar' | 'cadastrar' | 'recuperar';

/** Formulário de entrar, criar conta e recuperar senha (Neon Auth). */
export function AuthForm({ initialTab = 'entrar' }: { initialTab?: Tab }) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tab, setTab] = useState<Tab>(initialTab);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<string | null>, success: string) => {
    setBusy(true);
    const error = await fn();
    setBusy(false);
    setMessage(error ? { ok: false, text: error } : { ok: true, text: success });
  };

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-1">
        {(
          [
            ['entrar', 'Entrar'],
            ['cadastrar', 'Criar conta'],
            ['recuperar', 'Esqueci a senha'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setMessage(null);
            }}
            className={cn('rounded-lg px-3 py-1.5 text-sm', tab === id ? 'bg-accent-soft text-fg' : 'text-muted hover:text-fg')}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        className="grid max-w-md gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (tab === 'entrar') run(() => auth.signIn(email, password), 'Login realizado.');
          else if (tab === 'cadastrar') run(() => auth.signUp(email, password, displayName), 'Conta criada. Enviamos um link de confirmação para o seu e-mail: confirme antes de entrar.');
          else run(() => auth.requestPasswordReset(email), 'Se o e-mail existir, você receberá um link para redefinir a senha.');
        }}
      >
        {tab === 'cadastrar' && (
          <label className="text-sm">
            <span className="mb-1 block text-muted">Nome</span>
            <input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
          </label>
        )}
        <label className="text-sm">
          <span className="mb-1 block text-muted">E-mail</span>
          <input className={inputClass} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        {tab !== 'recuperar' && (
          <label className="text-sm">
            <span className="mb-1 block text-muted">Senha (mínimo 8 caracteres)</span>
            <input
              className={inputClass}
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'entrar' ? 'current-password' : 'new-password'}
            />
          </label>
        )}
        <Button type="submit" disabled={busy} className="justify-self-start">
          {busy ? 'Aguarde…' : tab === 'entrar' ? 'Entrar' : tab === 'cadastrar' ? 'Criar conta' : 'Enviar link'}
        </Button>
      </form>
      {message && (
        <p role="status" className={cn('text-sm', message.ok ? 'text-success' : 'text-danger')}>
          {message.text}
        </p>
      )}
    </div>
  );
}
