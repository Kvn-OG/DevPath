import { Download, Upload } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LOCAL_KEY } from '../persistence/localRepository';
import { isProgressState } from '../persistence/repository';
import { Button } from '../components/ui/Button';
import { Card, PageHeader, SectionTitle } from '../components/ui/primitives';
import { useAuth } from '../state/AuthProvider';
import { useProgress } from '../state/ProgressProvider';
import type { DataMode } from '../types/progress';
import { cn } from '../utils/cn';
import { readTheme, saveTheme, type ThemePreference } from '../utils/theme';

const input = 'h-10 w-full rounded-lg border border-line bg-bg px-3 text-sm outline-none focus:border-accent-strong/60';

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <PageHeader title="Configurações" />
      <ProfileSection />
      <AppearanceSection />
      <DataModeSection />
      <AccountSection />
      <BackupSection />
    </div>
  );
}

function ProfileSection() {
  const { state, actions } = useProgress();
  const [name, setName] = useState(state.profile.name);
  const [exercises, setExercises] = useState(state.profile.weeklyGoal.exercises);
  const [lessons, setLessons] = useState(state.profile.weeklyGoal.lessons);
  const [saved, setSaved] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    actions.updateProfile({
      name: name.trim().slice(0, 80),
      weeklyGoal: { exercises: clamp(exercises, 1, 100), lessons: clamp(lessons, 1, 50) },
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section aria-labelledby="perfil">
      <SectionTitle id="perfil">Perfil e metas semanais</SectionTitle>
      <Card>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm sm:col-span-3">
            <span className="mb-1 block text-muted">Como quer ser chamado</span>
            <input className={input} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Exercícios por semana</span>
            <input className={input} type="number" min={1} max={100} value={exercises} onChange={(e) => setExercises(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted">Aulas por semana</span>
            <input className={input} type="number" min={1} max={50} value={lessons} onChange={(e) => setLessons(Number(e.target.value))} />
          </label>
          <div className="flex items-end gap-3">
            <Button type="submit">Salvar</Button>
            {saved && <span className="text-sm text-success" role="status">Salvo</span>}
          </div>
        </form>
      </Card>
    </section>
  );
}

function clamp(n: number, min: number, max: number) {
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : min;
}

function AppearanceSection() {
  const [theme, setTheme] = useState<ThemePreference>(readTheme);
  const options: [ThemePreference, string][] = [
    ['escuro', 'Escuro (padrão)'],
    ['claro', 'Claro'],
    ['sistema', 'Seguir o sistema'],
  ];
  return (
    <section aria-labelledby="aparencia">
      <SectionTitle id="aparencia">Aparência</SectionTitle>
      <Card>
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Tema</legend>
          {options.map(([value, label]) => (
            <label key={value} className={cn('cursor-pointer rounded-lg border px-4 py-2 text-sm', theme === value ? 'border-accent-strong/70 bg-accent-soft' : 'border-line')}>
              <input
                type="radio"
                name="tema"
                className="sr-only"
                checked={theme === value}
                onChange={() => {
                  setTheme(value);
                  saveTheme(value);
                }}
              />
              {label}
            </label>
          ))}
        </fieldset>
      </Card>
    </section>
  );
}

function DataModeSection() {
  const { mode, activeMode, setMode } = useProgress();
  const auth = useAuth();
  const options: { value: DataMode; title: string; text: string; disabled?: boolean }[] = [
    { value: 'local', title: 'Meu progresso (neste navegador)', text: 'Padrão. Funciona sem internet e sem conta. Os dados ficam no armazenamento local deste navegador.' },
    {
      value: 'demo',
      title: 'Modo demonstração',
      text: 'Carrega um progresso FICTÍCIO para conhecer a plataforma. Fica separado do seu progresso real, que não é alterado.',
    },
    {
      value: 'supabase',
      title: 'Sincronizar com Supabase',
      text: auth.available ? 'Salva o progresso na sua conta, acessível em qualquer dispositivo. Requer login (abaixo).' : 'Indisponível: o Supabase não está configurado nesta instalação (veja o README).',
      disabled: !auth.available,
    },
  ];
  return (
    <section aria-labelledby="dados">
      <SectionTitle id="dados">Onde salvar o progresso</SectionTitle>
      <fieldset className="grid gap-2 md:grid-cols-3">
        <legend className="sr-only">Modo de dados</legend>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              'cursor-pointer rounded-xl border p-4 text-sm',
              mode === o.value ? 'border-accent-strong/70 bg-accent-soft' : 'border-line bg-surface',
              o.disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            <input type="radio" name="modo" className="sr-only" checked={mode === o.value} disabled={o.disabled} onChange={() => setMode(o.value)} />
            <div className="font-medium">{o.title}</div>
            <div className="mt-1 text-muted">{o.text}</div>
          </label>
        ))}
      </fieldset>
      {mode === 'supabase' && activeMode !== 'supabase' && (
        <p className="mt-2 text-sm text-warning">Entre na sua conta para usar a sincronização. Enquanto isso, o progresso local está em uso.</p>
      )}
    </section>
  );
}

function AccountSection() {
  const auth = useAuth();
  const { activeMode, actions } = useProgress();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tab, setTab] = useState<'entrar' | 'cadastrar' | 'recuperar'>('entrar');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  if (!auth.available) return null;

  const run = async (fn: () => Promise<string | null>, success: string) => {
    setBusy(true);
    const error = await fn();
    setBusy(false);
    setMessage(error ? { ok: false, text: error } : { ok: true, text: success });
  };

  const importLocal = () => {
    try {
      const raw = window.localStorage.getItem(LOCAL_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (!isProgressState(parsed)) {
        setMessage({ ok: false, text: 'Não há progresso local válido para importar.' });
        return;
      }
      actions.replaceState(parsed);
      setMessage({ ok: true, text: 'Progresso local importado. Ele será enviado para a sua conta.' });
    } catch {
      setMessage({ ok: false, text: 'Não foi possível ler o progresso local.' });
    }
  };

  return (
    <section aria-labelledby="conta">
      <SectionTitle id="conta">Conta Supabase</SectionTitle>
      <Card className="space-y-4">
        {auth.user ? (
          <>
            <p className="text-sm">
              Conectado como <strong>{auth.user.email}</strong>.
            </p>
            {params.get('redefinir') && (
              <form
                className="flex flex-wrap items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => auth.updatePassword(newPassword), 'Senha atualizada.');
                }}
              >
                <label className="text-sm">
                  <span className="mb-1 block text-muted">Nova senha</span>
                  <input className={input} type="password" minLength={6} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                </label>
                <Button type="submit" disabled={busy}>
                  Atualizar senha
                </Button>
              </form>
            )}
            <div className="flex flex-wrap gap-2">
              {activeMode === 'supabase' && (
                <Button variant="secondary" onClick={importLocal}>
                  Importar progresso deste navegador
                </Button>
              )}
              <Button variant="ghost" onClick={() => auth.signOut()}>
                Sair
              </Button>
            </div>
          </>
        ) : (
          <>
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
                else if (tab === 'cadastrar') run(() => auth.signUp(email, password, displayName), 'Conta criada. Se a confirmação por e-mail estiver ativa, confirme pelo link enviado.');
                else run(() => auth.requestPasswordReset(email), 'Se o e-mail existir, você receberá um link para redefinir a senha.');
              }}
            >
              {tab === 'cadastrar' && (
                <label className="text-sm">
                  <span className="mb-1 block text-muted">Nome</span>
                  <input className={input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
                </label>
              )}
              <label className="text-sm">
                <span className="mb-1 block text-muted">E-mail</span>
                <input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </label>
              {tab !== 'recuperar' && (
                <label className="text-sm">
                  <span className="mb-1 block text-muted">Senha (mínimo 6 caracteres)</span>
                  <input
                    className={input}
                    type="password"
                    required
                    minLength={6}
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
          </>
        )}
        {message && (
          <p role="status" className={cn('text-sm', message.ok ? 'text-success' : 'text-danger')}>
            {message.text}
          </p>
        )}
      </Card>
    </section>
  );
}

function BackupSection() {
  const { state, actions, activeMode } = useProgress();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devpath-progresso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isProgressState(parsed)) throw new Error('formato');
      actions.replaceState(parsed);
      setMessage({ ok: true, text: 'Progresso importado.' });
    } catch {
      setMessage({ ok: false, text: 'Arquivo inválido: não é um progresso exportado pelo DevPath.' });
    }
  };

  return (
    <section aria-labelledby="backup">
      <SectionTitle id="backup">Backup e redefinição</SectionTitle>
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportJson}>
            <Download size={16} aria-hidden /> Exportar progresso (JSON)
          </Button>
          <Button variant="secondary" onClick={() => fileInput.current?.click()}>
            <Upload size={16} aria-hidden /> Importar progresso
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importJson(file);
              e.target.value = '';
            }}
          />
        </div>
        <div className="border-t border-line pt-4">
          {confirmReset ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>{activeMode === 'demo' ? 'Recriar os dados de demonstração?' : 'Apagar todo o progresso deste modo? Esta ação não pode ser desfeita.'}</span>
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  setConfirmReset(false);
                  try {
                    await actions.resetProgress();
                    setMessage({ ok: true, text: 'Progresso redefinido.' });
                  } catch (error) {
                    setMessage({ ok: false, text: error instanceof Error ? error.message : 'Falha ao redefinir.' });
                  }
                }}
              >
                Confirmar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmReset(true)}>
              {activeMode === 'demo' ? 'Recriar dados de demonstração' : 'Apagar progresso'}
            </Button>
          )}
        </div>
        {message && (
          <p role="status" className={cn('text-sm', message.ok ? 'text-success' : 'text-danger')}>
            {message.text}
          </p>
        )}
      </Card>
    </section>
  );
}
