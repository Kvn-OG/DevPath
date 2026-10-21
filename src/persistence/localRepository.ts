import type { DataMode, ProgressState } from '../types/progress';
import { isProgressState, PersistenceError, type ProgressRepository } from './repository';

export const LOCAL_KEY = 'devpath:progress:v1';
export const DEMO_KEY = 'devpath:demo:v1';

/** Repositório em localStorage. Usado no modo local e no modo demonstração (com chaves separadas). */
export class LocalStorageRepository implements ProgressRepository {
  constructor(
    readonly mode: DataMode,
    private readonly key: string,
    private readonly storage: Storage = window.localStorage,
  ) {}

  async load(): Promise<ProgressState | null> {
    let raw: string | null;
    try {
      raw = this.storage.getItem(this.key);
    } catch (error) {
      throw new PersistenceError('Não foi possível ler o armazenamento local do navegador.', error);
    }
    if (raw === null) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isProgressState(parsed)) return parsed;
    } catch {
      // cai no tratamento abaixo
    }
    // Dados corrompidos: guarda uma cópia para não perder nada e recomeça.
    try {
      this.storage.setItem(`${this.key}:corrompido:${Date.now()}`, raw);
    } catch {
      // sem espaço: não há o que fazer além de seguir
    }
    return null;
  }

  async save(state: ProgressState): Promise<void> {
    try {
      this.storage.setItem(this.key, JSON.stringify(state));
    } catch (error) {
      throw new PersistenceError('Não foi possível salvar no armazenamento local (o espaço pode estar cheio ou bloqueado).', error);
    }
  }

  async clear(): Promise<void> {
    this.storage.removeItem(this.key);
  }
}
