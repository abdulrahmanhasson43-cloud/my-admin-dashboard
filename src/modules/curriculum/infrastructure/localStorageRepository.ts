import type { CurriculumRepository } from '../application/ports';
import { isCurriculumConfig, type CurriculumConfig } from '../domain/entities';
import { SEED_CONFIG } from './seed';

const KEY = 'madar.curriculum.v3';

/** تخزين إعدادات المنهج في المتصفح. يُستبدل بـ Supabase بنفس الواجهة. */
export class LocalStorageCurriculumRepository implements CurriculumRepository {
  load(): CurriculumConfig {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return SEED_CONFIG;
      const parsed: unknown = JSON.parse(raw);
      return isCurriculumConfig(parsed) ? parsed : SEED_CONFIG;
    } catch {
      return SEED_CONFIG;
    }
  }
  save(config: CurriculumConfig): void {
    try { localStorage.setItem(KEY, JSON.stringify(config)); } catch { /* التخزين ممتلئ أو محجوب: نكمل بالذاكرة */ }
  }
}
