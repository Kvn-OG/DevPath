// Cria o PostgreSQL em memória (PGlite) usado pelos exercícios de SQL.

import { PGlite } from '@electric-sql/pglite';
import { RAW_TEXT_TYPES, type SqlDatabase } from './sqlEvaluator';

export async function createSqlDatabase(): Promise<SqlDatabase> {
  const parsers = Object.fromEntries(RAW_TEXT_TYPES.map((oid) => [oid, (value: string) => value]));
  const db = await PGlite.create({ parsers });
  return db as unknown as SqlDatabase;
}
