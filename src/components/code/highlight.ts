import { goLanguage } from '@codemirror/lang-go';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { PostgreSQL } from '@codemirror/lang-sql';
import type { Parser } from '@lezer/common';
import { classHighlighter, highlightCode } from '@lezer/highlight';
import type { CodeLanguage } from '../../types/content';

export interface Token {
  text: string;
  className: string;
}

const PARSERS: Partial<Record<CodeLanguage, Parser>> = {
  javascript: javascriptLanguage.parser,
  sql: PostgreSQL.language.parser,
  go: goLanguage.parser,
};

/** Divide o código em linhas de tokens com classes tok-* (estilizadas em index.css). */
export function highlightLines(code: string, language: CodeLanguage = 'javascript'): Token[][] {
  const parser = PARSERS[language];
  if (!parser) {
    // Shell: só os comentários (#) ganham destaque.
    return code.split('\n').map((text) => (text ? [{ text, className: /^\s*#/.test(text) ? 'tok-comment' : '' }] : []));
  }
  const lines: Token[][] = [[]];
  highlightCode(
    code,
    parser.parse(code),
    classHighlighter,
    (text, classes) => lines[lines.length - 1].push({ text, className: classes }),
    () => lines.push([]),
  );
  return lines;
}
