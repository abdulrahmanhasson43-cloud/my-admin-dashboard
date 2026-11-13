import type { SiteSettings } from '../domain/entities';

export interface SiteRepository {
  load(): SiteSettings;
  save(settings: SiteSettings): void;
}
