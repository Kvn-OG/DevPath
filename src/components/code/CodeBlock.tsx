import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '../../utils/cn';
import { highlightLines } from './highlight';

interface CodeBlockProps {
  code: string;
  caption?: string;
  /** Linhas destacadas (começando em 1). */
  highlight?: number[];
  lineNumbers?: boolean;
  plain?: boolean;
  className?: string;
}

/** Bloco de código somente leitura, com destaque de sintaxe e botão de copiar. */
export function CodeBlock({ code, caption, highlight = [], lineNumbers = true, plain = false, className }: CodeBlockProps) {
  const lines = useMemo(() => (plain ? code.split('\n').map((text) => [{ text, className: '' }]) : highlightLines(code)), [code, plain]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <figure className={cn('group relative overflow-hidden rounded-lg border border-line bg-bg', className)}>
      {caption && <figcaption className="border-b border-line px-4 py-2 text-xs text-muted">{caption}</figcaption>}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Código copiado' : 'Copiar código'}
        className="absolute top-2 right-2 rounded-md border border-line bg-surface p-1.5 text-muted opacity-70 transition hover:text-fg focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
      >
        {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      </button>
      <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-6">
        <code>
          {lines.map((tokens, i) => (
            <div key={i} className={cn('flex pr-10', highlight.includes(i + 1) && 'bg-accent-soft')}>
              {lineNumbers && (
                <span aria-hidden className="w-10 shrink-0 pr-3 text-right text-faint select-none">
                  {i + 1}
                </span>
              )}
              <span className={cn('whitespace-pre', !lineNumbers && 'pl-4')}>
                {tokens.length === 0 ? ' ' : tokens.map((t, j) => <span key={j} className={t.className || undefined}>{t.text}</span>)}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </figure>
  );
}
