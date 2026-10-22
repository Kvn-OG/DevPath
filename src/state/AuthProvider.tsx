import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getNeon, isNeonConfigured } from '../persistence/neonClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  /** false quando a variável do Neon não está configurada. */
  available: boolean;
  loading: boolean;
  user: AuthUser | null;
  signUp(email: string, password: string, displayName: string): Promise<string | null>;
  signIn(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<string | null>;
  /** Define a nova senha com o token que chega pelo link do e-mail de recuperação. */
  resetPassword(token: string, password: string): Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthError {
  message?: string;
  code?: string;
  status?: number;
}

/** Traduz os erros mais comuns do Neon Auth (Better Auth). */
function translateAuthError(error: AuthError): string {
  const code = error.code ?? '';
  const message = error.message ?? '';
  if (code === 'INVALID_EMAIL_OR_PASSWORD' || /invalid email or password/i.test(message)) return 'E-mail ou senha incorretos.';
  if (code === 'EMAIL_NOT_VERIFIED' || /not verified/i.test(message)) return 'Confirme seu e-mail pelo link enviado antes de entrar.';
  if (code.startsWith('USER_ALREADY_EXISTS') || /already exists/i.test(message)) return 'Já existe uma conta com este e-mail.';
  if (code === 'PASSWORD_TOO_SHORT') return 'A senha precisa ter pelo menos 8 caracteres.';
  if (code === 'PASSWORD_TOO_LONG') return 'A senha é longa demais.';
  if (code === 'INVALID_EMAIL') return 'E-mail inválido.';
  if (code === 'INVALID_TOKEN' || /invalid token/i.test(message)) return 'O link expirou ou já foi usado. Peça um novo em "Esqueci a senha".';
  if (error.status === 429 || /rate limit|too many/i.test(message)) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';
  if (/fetch|network/i.test(message)) return 'Sem conexão com o servidor de login. Verifique sua internet.';
  return message || 'Não foi possível concluir. Tente de novo.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const neon = getNeon();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(isNeonConfigured);

  useEffect(() => {
    if (!neon) return;
    // useSession é um store: avisa no carregamento e a cada login/logout (inclusive em outras abas).
    return neon.auth.useSession.subscribe(({ data, isPending }) => {
      const u = data?.user;
      setUser((prev) => {
        if (!u) return null;
        // Mantém a mesma referência enquanto for o mesmo usuário, para não recarregar o progresso à toa.
        if (prev && prev.id === u.id && prev.email === u.email && prev.name === u.name) return prev;
        return { id: u.id, email: u.email, name: u.name ?? '' };
      });
      if (!isPending) setLoading(false);
    });
  }, [neon]);

  const value = useMemo<AuthContextValue>(() => {
    const run = async (fn: () => Promise<{ error: AuthError | null }>) => {
      try {
        const { error } = await fn();
        return error ? translateAuthError(error) : null;
      } catch (error) {
        return translateAuthError({ message: error instanceof Error ? error.message : String(error) });
      }
    };
    return {
      available: !!neon,
      loading,
      user,
      signUp: (email, password, displayName) =>
        run(() => neon!.auth.signUp.email({ email, password, name: displayName, callbackURL: window.location.origin })),
      signIn: (email, password) => run(() => neon!.auth.signIn.email({ email, password })),
      signOut: async () => {
        await neon?.auth.signOut();
      },
      requestPasswordReset: (email) =>
        run(() => neon!.auth.requestPasswordReset({ email, redirectTo: `${window.location.origin}/configuracoes?redefinir=1` })),
      resetPassword: (token, password) => run(() => neon!.auth.resetPassword({ newPassword: password, token })),
    };
  }, [neon, user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
