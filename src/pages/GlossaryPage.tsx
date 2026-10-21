import { Search } from 'lucide-react';
import { useState } from 'react';
import { glossary } from '../content/glossary';
import { EmptyState, PageHeader } from '../components/ui/primitives';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const q = normalize(query.trim());
  const terms = [...glossary]
    .sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'))
    .filter((t) => !q || normalize(`${t.term} ${t.english ?? ''} ${t.definition}`).includes(q));

  return (
    <div>
      <PageHeader title="Glossário" description="Termos técnicos explicados em português, com o nome original em inglês quando ele é usado no dia a dia." />
      <label className="relative mb-6 block max-w-md">
        <span className="sr-only">Buscar termo</span>
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-faint" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar termo (ex.: escopo, array, callback)"
          className="h-10 w-full rounded-lg border border-line bg-surface pr-3 pl-9 text-sm outline-none focus:border-accent-strong/60"
        />
      </label>
      {terms.length === 0 ? (
        <EmptyState title={`Nenhum termo encontrado para "${query}"`} />
      ) : (
        <dl className="grid gap-3 md:grid-cols-2">
          {terms.map((t) => (
            <div key={t.term} className="rounded-xl border border-line bg-surface p-4">
              <dt className="font-semibold">
                {t.term} {t.english && <span className="text-sm font-normal text-faint">({t.english})</span>}
              </dt>
              <dd className="mt-1 text-sm text-muted">{t.definition}</dd>
              {t.example && <dd className="mt-2 rounded-md bg-surface-2 px-3 py-1.5 font-mono text-xs text-fg">{t.example}</dd>}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
