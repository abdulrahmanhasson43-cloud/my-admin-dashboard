import { STORAGE_KEYS } from '@/constants/storageKeys';
import { readJson, writeJson } from '@/lib/storage';
import type { AuthSession, IAuthSessionRepository } from './IAuthSessionRepository';

/**
 * LocalStorageAuthSessionRepository — keeps the session in the browser.
 * TODO(phase-3): swap in data-services-context.tsx.
 */
export class LocalStorageAuthSessionRepository implements IAuthSessionRepository {
  load(): AuthSession | null {
    return readJson<AuthSession | null>(STORAGE_KEYS.authSession, null);
  }

  save(session: AuthSession): void {
    writeJson(STORAGE_KEYS.authSession, session);
  }

  /** `lib/storage` has no remove, so "signed out" is stored as null. */
  clear(): void {
    writeJson(STORAGE_KEYS.authSession, null);
  }
}
