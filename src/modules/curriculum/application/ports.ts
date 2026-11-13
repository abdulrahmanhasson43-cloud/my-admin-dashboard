import type { CurriculumConfig } from '../domain/entities';

/** منفذ التخزين: اليوم localStorage، وغداً Supabase بدون تغيير أي كود في domain أو application. */
export interface CurriculumRepository {
  load(): CurriculumConfig;
  save(config: CurriculumConfig): void;
}
