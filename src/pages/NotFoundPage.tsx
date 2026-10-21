import { ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/primitives';

export default function NotFoundPage() {
  return (
    <div className="py-12">
      <EmptyState title="Página não encontrada">
        <p>O endereço pode estar errado ou o conteúdo ainda não foi produzido.</p>
        <div className="mt-4">
          <ButtonLink to="/" variant="secondary">
            Voltar ao dashboard
          </ButtonLink>
        </div>
      </EmptyState>
    </div>
  );
}
