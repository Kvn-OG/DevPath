import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSupabase, isSupabaseConfigured } from '../persistence/supabaseClient';

interface AuthContextValue {
  /** false quando as variáveis do Supabase não estão configuradas. */
  available: boolean;
  loading: boolean;
  user: User | null;
  signUp(email: string, password: string, displayName: string): Promise<string | null>;
  signIn(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<string | null>;
  updatePassword(password: string): Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Traduz as mensagens mais comuns do Supabase Auth. */
function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(message)) return 'Confirme seu e-mail pelo link enviado antes de entrar.';
  if (/already registered|already exists/i.test(message)) return 'Já existe uma conta com este e-mail.';
  if (/password should be at least/i.test(message)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/rate limit/i.test(message)) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
  if (/fetch|network/i.test(message)) return 'Sem conexão com o Supabase. Verifique sua internet.';
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => setSession(null)) // sem sessão: segue com o progresso local
      .finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(() => {
    const run = async (fn: () => Promise<{ error: { message: string } | null }>) => {
      try {
        const { error } = await fn();
        return error ? translateAuthError(error.message) : null;
      } catch (error) {
        return translateAuthError(error instanceof Error ? error.message : String(error));
      }
    };
    return {
      available: !!supabase,
      loading,
      user: session?.user ?? null,
      signUp: (email, password, displayName) =>
        run(() => supabase!.auth.signUp({ email, password, options: { data: { display_name: displayName }, emailRedirectTo: window.location.origin } })),
      signIn: (email, password) => run(() => supabase!.auth.signInWithPassword({ email, password })),
      signOut: async () => {
        await supabase?.auth.signOut();
      },
      requestPasswordReset: (email) =>
        run(() => supabase!.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/configuracoes?redefinir=1` })),
      updatePassword: (password) => run(() => supabase!.auth.updateUser({ password })),
    };
  }, [supabase, session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
