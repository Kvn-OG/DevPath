import { RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { concepts, getConcept } from '../content';
import { conceptMastery, MASTERY_LABEL, masteryLevel } from '../domain/mastery';
import { failedAttemptsByConcept, recommendations } from '../domain/recommendations';
import { dueReviews, REVIEW_INTERVALS, upcomingReviews } from '../domain/review';
import { ButtonLink } from '../components/ui/Button';
import { Badge, Card, EmptyState, PageHeader, SectionTitle } from '../components/ui/primitives';
import { useProgress } from '../state/ProgressProvider';

export default function ReviewPage() {
  const { state } = useProgress();
  const now = new Date();
  const due = dueReviews(state, now, failedAttemptsByConcept(state));
  const upcoming = upcomingReviews(state, now).slice(0, 6);
  const reasons = new Map(recommendations(state, now, 50).filter((r) => r.conceptId).map((r) => [r.conceptId!, r.reason]));

  return (
    <div className="space-y-10">
      <PageHeader
        title="Revisão de conteúdos"
        description="Revisão espaçada: cada conceito volta em intervalos crescentes quando você acerta, e mais cedo quando você erra. Conceitos com erros recorrentes e aprendidos recentemente têm prioridade."
      />

      <section aria-labelledby="pendentes">
        <SectionTitle id="pendentes" aside={<span className="text-sm text-muted tabular-nums">{due.length} pendente(s)</span>}>
          Para revisar agora
        </SectionTitle>
        {due.length === 0 ? (
          <EmptyState icon={<RefreshCcw size={22} />} title="Tudo em dia">
            Conceitos entram na revisão quando você conclui uma aula, erra repetidamente um exercício ou erra questões de uma avaliação.
          </EmptyState>
        ) : (
          <ul className="space-y-2">
            {due.map(({ item }) => {
              const concept = getConcept(item.conceptId);
              if (!concept) return null;
              return (
                <li key={item.conceptId}>
                  <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium">{concept.name}</div>
                      <p className="text-sm text-muted">
                        {reasons.get(item.conceptId) ?? 'Revisão programada pela repetição espaçada.'}
                        {item.lapses > 0 && ` Você já teve dificuldade ${item.lapses} vez(es) em revisões deste conceito.`}
                      </p>
                    </div>
                    <ButtonLink to={`/revisao/${item.conceptId}`} size="sm" className="shrink-0">
                      Revisar
                    </ButtonLink>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="dominio">
        <SectionTitle id="dominio">Domínio por conceito</SectionTitle>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-2 text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-4 py-2.5 font-medium">Conceito</th>
                <th className="px-4 py-2.5 font-medium">Situação</th>
                <th className="px-4 py-2.5 font-medium">Exercícios</th>
                <th className="px-4 py-2.5 font-medium">Tentativas erradas</th>
                <th className="px-4 py-2.5 font-medium">Próxima revisão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {concepts.map((c) => {
                const m = conceptMastery(state, c.id);
                const level = masteryLevel(m.score);
                const review = state.reviews[c.id];
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-2.5">
                      <Link to={`/revisao/${c.id}`} className="hover:text-accent-strong">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={level === 'dominado' ? 'success' : level === 'revisar' ? 'danger' : level === 'praticando' ? 'accent' : 'neutral'}>
                        {MASTERY_LABEL[level]}
                        {m.score !== null && ` · ${Math.round(m.score * 100)}%`}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted tabular-nums">
                      {m.solvedExercises}/{m.attemptedExercises} resolvidos
                    </td>
                    <td className="px-4 py-2.5 text-muted tabular-nums">{m.failedAttempts}</td>
                    <td className="px-4 py-2.5 text-muted">{review ? new Date(review.dueAt).toLocaleDateString('pt-BR') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {upcoming.length > 0 && (
        <section aria-labelledby="proximas">
          <SectionTitle id="proximas">Próximas revisões</SectionTitle>
          <ul className="flex flex-wrap gap-2">
            {upcoming.map((r) => (
              <li key={r.conceptId}>
                <Badge>
                  {getConcept(r.conceptId)?.name} · {new Date(r.dueAt).toLocaleDateString('pt-BR')}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Card className="text-sm text-muted">
        <h2 className="mb-2 font-semibold text-fg">Como funciona</h2>
        <p>
          Cada conceito está em uma "caixa". Ao acertar uma revisão, ele sobe de caixa e o próximo intervalo aumenta ({REVIEW_INTERVALS.join(', ')}{' '}
          dias). Ao errar, volta para a primeira caixa e reaparece no dia seguinte. A revisão é concluída resolvendo um exercício do conceito com no
          máximo uma tentativa errada.
        </p>
      </Card>
    </div>
  );
}
