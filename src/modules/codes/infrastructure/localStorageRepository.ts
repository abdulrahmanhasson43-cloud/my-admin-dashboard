import type { CodeRepository } from '../application/ports';
import type { AccessCode } from '../domain/entities';

const KEY = 'madar.codes.v1';

export class LocalStorageCodeRepository implements CodeRepository {
  list(): AccessCode[] {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as AccessCode[]; } catch { return []; }
  }
  save(all: AccessCode[]): void {
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* التخزين ممتلئ */ }
  }
}
