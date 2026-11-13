import type { SiteRepository } from '../application/ports';
import { isSiteSettings, type SiteSettings } from '../domain/entities';
import { DEFAULT_SITE, withDefaults } from '../domain/defaults';

const KEY = 'madar.site.v1';

export class LocalStorageSiteRepository implements SiteRepository {
  load(): SiteSettings {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT_SITE;
      const parsed: unknown = JSON.parse(raw);
      return isSiteSettings(parsed) ? withDefaults(parsed) : DEFAULT_SITE;
    } catch { return DEFAULT_SITE; }
  }
  save(settings: SiteSettings): void {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* التخزين ممتلئ */ }
  }
}
