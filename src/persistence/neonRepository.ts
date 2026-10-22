import type { NeonClient } from './neonClient';
import type { ProgressState } from '../types/progress';
import { isProgressState, PersistenceError, type ProgressRepository } from './repository';
import { changedRows, PRIMARY_KEYS, rowsToState, stateToRows, type Rows, type TableName } from './neonMapping';

const TABLES = Object.keys(PRIMARY_KEYS) as TableName[];
const APPEND_ONLY = new Set<TableName>(['exercise_attempts', 'assessment_results']);

/**
 * Persiste o progresso nas tabelas do Neon (via Data API), protegidas por RLS.
 * Envia apenas as linhas alteradas desde o último salvamento bem-sucedido e
 * mantém uma cópia local para tolerar falhas de conexão.
 */
export class NeonRepository implements ProgressRepository {
  readonly mode = 'nuvem' as const;
  private snapshot: Rows | null = null;
  /** true quando o último load usou a cópia local por falha de conexão. */
  loadedFromCache = false;

  constructor(
    private readonly client: NeonClient,
    private readonly userId: string,
    private readonly storage: Storage = window.localStorage,
  ) {}

  private get cacheKey() {
    return `devpath:nuvem-cache:${this.userId}`;
  }

  async load(): Promise<ProgressState | null> {
    try {
      const profile = await this.client.from('profiles').select('*').eq('id', this.userId).maybeSingle();
      if (profile.error) throw profile.error;
      const results = await Promise.all(TABLES.map((t) => this.client.from(t).select('*').eq('user_id', this.userId)));
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      if (!profile.data) return null;

      const rows = { profile: profile.data } as Rows;
      TABLES.forEach((t, i) => {
        (rows as unknown as Record<string, unknown>)[t] = results[i].data ?? [];
      });
      this.snapshot = rows;
      this.loadedFromCache = false;
      const state = rowsToState(rows);
      this.writeCache(state);
      return state;
    } catch (error) {
      const cached = this.readCache();
      if (cached) {
        this.loadedFromCache = true;
        return cached;
      }
      throw new PersistenceError('Não foi possível carregar seu progresso da nuvem. Verifique a conexão.', error);
    }
  }

  async save(state: ProgressState): Promise<void> {
    this.writeCache(state);
    const rows = stateToRows(state, this.userId);
    try {
      if (!this.snapshot || JSON.stringify(this.snapshot.profile) !== JSON.stringify(rows.profile)) {
        const { error } = await this.client.from('profiles').upsert(rows.profile, { onConflict: 'id' });
        if (error) throw error;
      }
      for (const table of TABLES) {
        const changed = changedRows(table, rows[table] as Record<string, unknown>[], (this.snapshot?.[table] ?? []) as Record<string, unknown>[]);
        if (changed.length === 0) continue;
        // Tabelas de histórico não têm política de UPDATE: linhas existentes são ignoradas.
        const { error } = await this.client
          .from(table)
          .upsert(changed, { onConflict: PRIMARY_KEYS[table].join(','), ignoreDuplicates: APPEND_ONLY.has(table) });
        if (error) throw error;
      }
      this.snapshot = rows;
    } catch (error) {
      // O snapshot não muda: na próxima tentativa, tudo o que ficou pendente é reenviado.
      throw new PersistenceError('Falha ao sincronizar com a nuvem. Seu progresso está guardado neste navegador e será reenviado.', error);
    }
  }

  async clear(): Promise<void> {
    for (const table of TABLES) {
      const { error } = await this.client.from(table).delete().eq('user_id', this.userId);
      if (error) throw new PersistenceError('Não foi possível apagar o progresso na nuvem.', error);
    }
    this.snapshot = null;
    this.storage.removeItem(this.cacheKey);
  }

  private writeCache(state: ProgressState) {
    try {
      this.storage.setItem(this.cacheKey, JSON.stringify(state));
    } catch {
      // cache é opcional
    }
  }

  private readCache(): ProgressState | null {
    try {
      const raw = this.storage.getItem(this.cacheKey);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return isProgressState(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}
