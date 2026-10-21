import { javascriptLanguage } from '@codemirror/lang-javascript';
import { classHighlighter, highlightCode } from '@lezer/highlight';

export interface Token {
  text: string;
  className: string;
}

/** Divide o código em linhas de tokens com classes tok-* (estilizadas em index.css). */
export function highlightLines(code: string): Token[][] {
  const lines: Token[][] = [[]];
  const tree = javascriptLanguage.parser.parse(code);
  highlightCode(
    code,
    tree,
    classHighlighter,
    (text, classes) => lines[lines.length - 1].push({ text, className: classes }),
    () => lines.push([]),
  );
  return lines;
}
