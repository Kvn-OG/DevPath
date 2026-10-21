// Formata valores como o console do Node.js, para que a saída seja previsível
// nos exercícios de "prever a saída".

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

export function formatValue(value: unknown, top = true, depth = 0, seen = new WeakSet<object>()): string {
  if (typeof value === 'string') return top ? value : `'${value}'`;
  if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') return value.name ? `[Function: ${value.name}]` : '[Function (anonymous)]';
  if (value === null || typeof value !== 'object') return String(value);

  if (seen.has(value)) return '[Circular]';
  if (value instanceof Error) return `${value.name}: ${value.message}`;

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (depth > 2) return '[Array]';
    seen.add(value);
    const items = value.map((item) => formatValue(item, false, depth + 1, seen));
    seen.delete(value);
    return `[ ${items.join(', ')} ]`;
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) return '{}';
  if (depth > 2) return '[Object]';
  seen.add(value);
  const parts = entries.map(([key, v]) => {
    const k = IDENTIFIER.test(key) ? key : `'${key}'`;
    return `${k}: ${formatValue(v, false, depth + 1, seen)}`;
  });
  seen.delete(value);
  return `{ ${parts.join(', ')} }`;
}

export function formatLogArgs(args: unknown[]): string {
  return args.map((arg) => formatValue(arg)).join(' ');
}
