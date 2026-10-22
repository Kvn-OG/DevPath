import { createClient } from '@neondatabase/neon-js';

// Só a URL pública do banco (sem usuário e senha) existe no front-end: dela saem
// os endereços do Neon Auth e da Data API. A segurança dos dados vem das
// políticas RLS (ver neon/migrations).
const url = import.meta.env.VITE_NEON_URL as string | undefined;

export const isNeonConfigured = Boolean(url);

// createClient tem várias assinaturas; esta fixa a de URL única (cliente Better Auth padrão).
const create = (baseUrl: string) => createClient(baseUrl);
export type NeonClient = ReturnType<typeof create>;

let client: NeonClient | null = null;

export function getNeon(): NeonClient | null {
  if (!isNeonConfigured) return null;
  client ??= create(url!);
  return client;
}
