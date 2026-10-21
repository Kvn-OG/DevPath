import { AlertTriangle, Info, Lightbulb } from 'lucide-react';
import type { Block } from '../../types/content';
import { cn } from '../../utils/cn';
import { CodeBlock } from '../code/CodeBlock';
import { renderInline } from '../ui/RichText';

const CALLOUT = {
  info: { icon: Info, className: 'border-info/25 bg-info-soft', iconClass: 'text-info' },
  tip: { icon: Lightbulb, className: 'border-accent-strong/25 bg-accent-soft', iconClass: 'text-accent-strong' },
  warning: { icon: AlertTriangle, className: 'border-warning/30 bg-warning-soft', iconClass: 'text-warning' },
};

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4 leading-relaxed">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'p':
            return (
              <p key={i} className="text-fg/90">
                {renderInline(block.text)}
              </p>
            );
          case 'h':
            return (
              <h3 key={i} className="pt-2 text-base font-semibold">
                {block.text}
              </h3>
            );
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul';
            return (
              <List key={i} className={cn('space-y-1.5 pl-5 text-fg/90', block.ordered ? 'list-decimal' : 'list-disc')}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </List>
            );
          }
          case 'code':
            return <CodeBlock key={i} code={block.code} caption={block.caption} language={block.language} />;
          case 'callout': {
            const style = CALLOUT[block.tone];
            const Icon = style.icon;
            return (
              <aside key={i} className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm', style.className)}>
                <Icon size={18} className={cn('mt-0.5 shrink-0', style.iconClass)} aria-hidden />
                <div>
                  {block.title && <div className="mb-0.5 font-semibold">{block.title}</div>}
                  <p>{renderInline(block.text)}</p>
                </div>
              </aside>
            );
          }
        }
      })}
    </div>
  );
}
