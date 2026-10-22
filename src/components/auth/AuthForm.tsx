import { useState } from 'react';
import { EMAIL_NOT_VERIFIED_MESSAGE, useAuth } from '../../state/AuthProvider';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

export const inputClass = 'h-10 w-full rounded-lg border border-line bg-bg px-3 text-sm outline-none focus:border-accent-strong/60';

type Tab = 'entrar' | 'cadastrar' | 'recuperar';
/** 'codigo': confirmar o e-mail; 'nova-senha': código de recuperação + nova senha. */
type Step = 'formulario' | 'codigo' | 'nova-senha';

/** Formulário de entrar, criar conta e recuperar senha (Neon Auth, com códigos enviados por e-mail). */
export function AuthForm({ initialTab = 'entrar' }: { initialTab?: Tab }) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState('');
  const [tab, setTab] = useState<Tab>(initialTab);
  const [step, setStep] = useState<Step>('formulario');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  /** Executa os passos em sequência e para no primeiro erro. */
  const run = async (fns: (() => Promise<string | null>)[], success: string) => {
    setBusy(true);
    let error: string | null = null;
    for (const fn of fns) {
      error = await fn();
      if (error) break;
    }
    setBusy(false);
    setMessage(error ? { ok: false, text: error } : { ok: true, text: success });
    return error;
  };

  const goTo = (next: Step, text: string) => {
    setCode('');
    setStep(next);
    setMessage({ ok: true, text });
  };

  const submit = async () => {
    if (step === 'codigo') {
      await run([() => auth.verifyEmail(email, code), () => auth.signIn(email, password)], 'E-mail confirmado. Login realizado.');
    } else if (step === 'nova-senha') {
      await run([() => auth.resetPassword(email, code, password), () => auth.signIn(email, password)], 'Senha atualizada. Login realizado.');
    } else if (tab === 'entrar') {
      const error = await run([() => auth.signIn(email, password)], 'Login realizado.');
      if (error === EMAIL_NOT_VERIFIED_MESSAGE) goTo('codigo', `Seu e-mail ainda não foi confirmado. Digite o código enviado para ${email} ou peça um novo.`);
    } else if (tab === 'cadastrar') {
      const error = await run([() => auth.signUp(email, password, displayName)], '');
      if (!error) goTo('codigo', `Conta criada. Enviamos um código de 6 dígitos para ${email}.`);
    } else {
      const error = await run([() => auth.requestPasswordReset(email)], '');
      if (!error) goTo('nova-senha', `Se existir uma conta com ${email}, enviamos um código de 6 dígitos para redefinir a senha.`);
    }
  };

  const codeField = (
    <label className="text-sm">
      <span className="mb-1 block text-muted">Código recebido por e-mail</span>
      <input
        className={cn(inputClass, 'tracking-[0.3em]')}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
      />
    </label>
  );

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
              setStep('formulario');
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
          void submit();
        }}
      >
        {step === 'formulario' && tab === 'cadastrar' && (
          <label className="text-sm">
            <span className="mb-1 block text-muted">Nome</span>
            <input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
          </label>
        )}
        {step === 'formulario' && (
          <label className="text-sm">
            <span className="mb-1 block text-muted">E-mail</span>
            <input className={inputClass} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
        )}
        {step !== 'formulario' && codeField}
        {/* No passo do código a senha já foi digitada e é usada para entrar logo após a confirmação. */}
        {((step === 'formulario' && tab !== 'recuperar') || step === 'nova-senha') && (
          <label className="text-sm">
            <span className="mb-1 block text-muted">{step === 'nova-senha' ? 'Nova senha' : 'Senha'} (mínimo 8 caracteres)</span>
            <input
              className={inputClass}
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'entrar' && step === 'formulario' ? 'current-password' : 'new-password'}
            />
          </label>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={busy}>
            {busy
              ? 'Aguarde…'
              : step === 'codigo'
                ? 'Confirmar e-mail'
                : step === 'nova-senha'
                  ? 'Salvar nova senha'
                  : tab === 'entrar'
                    ? 'Entrar'
                    : tab === 'cadastrar'
                      ? 'Criar conta'
                      : 'Enviar código'}
          </Button>
          {step !== 'formulario' && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                run(
                  [() => (step === 'codigo' ? auth.resendVerificationCode(email) : auth.requestPasswordReset(email))],
                  `Enviamos um novo código para ${email}.`,
                )
              }
            >
              Reenviar código
            </Button>
          )}
        </div>
      </form>
      {message?.text && (
        <p role="status" className={cn('text-sm', message.ok ? 'text-success' : 'text-danger')}>
          {message.text}
        </p>
      )}
    </div>
  );
}
