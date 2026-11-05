/**
 * Cada trilha tem uma cor própria, usada só como luz (brilho, nós do caminho,
 * faixas e numerais), nunca como cor de texto: assim o contraste é sempre o do tema.
 */
const HUES: Record<string, string> = {
  'logica-js': '#c8ff3e',
  web: '#ff8a3d',
  'js-moderno': '#ffd23e',
  react: '#4de1ff',
  sql: '#7c8cff',
  supabase: '#3ecf8e',
  node: '#8bdc4a',
  java: '#ff5d5d',
  spring: '#6ddc6d',
  golang: '#29d3e6',
  infra: '#ff4fd8',
  profissional: '#a98bff',
};

export function trackHue(trackId: string): string {
  return HUES[trackId] ?? '#a98bff';
}
