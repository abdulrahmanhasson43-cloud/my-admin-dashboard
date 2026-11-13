import type { SupportRepository } from '../application/ports';
import type { SupportRequest } from '../domain/entities';

const KEY = 'madar.support.v1';

export class LocalStorageSupportRepository implements SupportRepository {
  list(): SupportRequest[] {
    try { const raw = localStorage.getItem(KEY); const p = raw ? JSON.parse(raw) : []; return Array.isArray(p) ? p : []; } catch { return []; }
  }
  save(list: SupportRequest[]): void { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ممتلئ */ } }
}
