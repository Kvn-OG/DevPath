import { javascript } from '@codemirror/lang-javascript';
import { indentUnit, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { classHighlighter } from '@lezer/highlight';
import CodeMirror from '@uiw/react-codemirror';
import { useMemo } from 'react';

const devpathTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--dp-bg)',
    color: 'var(--dp-fg)',
    fontSize: '13px',
    borderRadius: '0.5rem',
  },
  '.cm-content': { fontFamily: 'var(--font-mono)', padding: '12px 0', caretColor: 'var(--dp-accent-strong)' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  '.cm-gutters': { backgroundColor: 'var(--dp-bg)', color: 'var(--dp-faint)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--dp-surface-2) 60%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--dp-muted)' },
  '&.cm-focused': { outline: 'none' },
  '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--dp-accent-strong)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--dp-accent-soft) !important' },
  '.cm-matchingBracket': { backgroundColor: 'var(--dp-accent-soft)', outline: 'none' },
});

interface CodeEditorProps {
  value: string;
  onChange(value: string): void;
  label: string;
  minHeight?: string;
}

/** Editor de código real (CodeMirror 6): destaque, numeração, indentação e atalhos. */
export function CodeEditor({ value, onChange, label, minHeight = '220px' }: CodeEditorProps) {
  const extensions = useMemo(() => [javascript(), syntaxHighlighting(classHighlighter), indentUnit.of('  '), EditorView.lineWrapping, devpathTheme], []);
  return (
    <div className="overflow-hidden rounded-lg border border-line focus-within:border-accent-strong/60">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme="none"
        minHeight={minHeight}
        aria-label={label}
        basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: false, tabSize: 2 }}
        indentWithTab
      />
      <p className="border-t border-line bg-surface px-3 py-1.5 text-[11px] text-faint">
        Tab indenta. Para sair do editor pelo teclado, pressione Esc e depois Tab.
      </p>
    </div>
  );
}
