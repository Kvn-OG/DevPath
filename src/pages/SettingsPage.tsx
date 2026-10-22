import { Download, Upload } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { LOCAL_KEY } from '../persistence/localRepository';
import { isProgressState } from '../persistence/repository';
import { AuthForm, inputClass as input } from '../components/auth/AuthForm';
import { Button } from '../components/ui/Button';
import { Card, PageHeader, SectionTitle } from '../components/ui/primitives';
import { useAuth } from '../state/AuthProvider';
import { useProgress } from '../state/ProgressProvider';
import type { DataMode } from '../types/progress';
import { cn } from '../utils/cn';
import { readTheme, saveTheme, type ThemePreference } from '../utils/theme';

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
  const { mode, setMode } = useProgress();
  const auth = useAuth();
  const options: { value: DataMode; title: string; text: string }[] = [
    {
      value: 'local',
      title: 'Meu progresso',
      text: auth.user
        ? 'Sincronizado com a sua conta: o mesmo progresso em qualquer dispositivo.'
        : auth.available
          ? 'Salvo neste navegador. Entre na sua conta para acessá-lo em qualquer dispositivo.'
          : 'Funciona sem internet e sem conta. Os dados ficam no armazenamento local deste navegador.',
    },
    {
      value: 'demo',
      title: 'Modo demonstração',
      text: 'Carrega um progresso FICTÍCIO para conhecer a plataforma. Fica separado do seu progresso real, que não é alterado.',
    },
  ];
  return (
    <section aria-labelledby="dados">
      <SectionTitle id="dados">Progresso exibido</SectionTitle>
      <fieldset className="grid gap-2 md:grid-cols-2">
        <legend className="sr-only">Modo de dados</legend>
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              'cursor-pointer rounded-xl border p-4 text-sm',
              mode === o.value ? 'border-accent-strong/70 bg-accent-soft' : 'border-line bg-surface',
            )}
          >
            <input type="radio" name="modo" className="sr-only" checked={mode === o.value} onChange={() => setMode(o.value)} />
            <div className="font-medium">{o.title}</div>
            <div className="mt-1 text-muted">{o.text}</div>
          </label>
        ))}
      </fieldset>
    </section>
  );
}

function AccountSection() {
  const auth = useAuth();
  const { activeMode, actions } = useProgress();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!auth.available) return null;

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
      <SectionTitle id="conta">Conta</SectionTitle>
      <Card className="space-y-4">
        {auth.user ? (
          <>
            <p className="text-sm">
              Conectado como <strong>{auth.user.email}</strong>.
            </p>
            <div className="flex flex-wrap gap-2">
              {activeMode === 'nuvem' && (
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
            <p className="text-sm text-muted">Entre para sincronizar seu progresso entre dispositivos.</p>
            <AuthForm />
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
