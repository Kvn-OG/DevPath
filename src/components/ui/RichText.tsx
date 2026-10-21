import { Fragment, type ReactNode } from 'react';

// Formatação inline mínima usada no conteúdo: **negrito**, *itálico* e `código`.
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;

export function renderInline(text: string): ReactNode {
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-fg">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return (
        <code key={i} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.86em] text-accent-strong">
          {part.slice(1, -1)}
        </code>
      );
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function RichText({ text, className }: { text: string; className?: string }) {
  return <p className={className}>{renderInline(text)}</p>;
}
