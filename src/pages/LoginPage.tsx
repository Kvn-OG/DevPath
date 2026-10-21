import { Navigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '../components/auth/AuthForm';
import { Card, PageHeader } from '../components/ui/primitives';
import { useAuth } from '../state/AuthProvider';

export default function LoginPage() {
  const auth = useAuth();
  const [params] = useSearchParams();

  if (auth.user) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader title="Entrar no DevPath" />
      {auth.available ? (
        <Card className="space-y-4">
          <p className="text-sm text-muted">
            Com uma conta, seu progresso fica salvo na nuvem e aparece em qualquer dispositivo. No primeiro login, o progresso já feito neste navegador vai junto para a conta.
          </p>
          <AuthForm initialTab={params.get('aba') === 'cadastrar' ? 'cadastrar' : 'entrar'} />
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-muted">O login não está disponível nesta instalação: o Supabase não foi configurado (veja o README). Seu progresso continua salvo neste navegador.</p>
        </Card>
      )}
    </div>
  );
}
