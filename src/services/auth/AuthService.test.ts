import { describe, expect, it } from 'vitest';
import type { AuthSession, IAuthSessionRepository } from './IAuthSessionRepository';
import { AuthService } from './AuthService';

class FakeRepository implements IAuthSessionRepository {
  session: AuthSession | null;
  constructor(session: AuthSession | null = null) { this.session = session; }
  load() { return this.session; }
  save(session: AuthSession) { this.session = session; }
  clear() { this.session = null; }
}

const NOW = new Date('2026-10-06T09:30:00Z');

describe('AuthService', () => {
  it('nobody is signed in when nothing is saved', () => {
    expect(new AuthService(new FakeRepository()).isSignedIn()).toBe(false);
  });

  it('signIn saves a session stamped with the given time and signs the user in', () => {
    const repo = new FakeRepository();
    const service = new AuthService(repo);
    expect(service.signIn(NOW)).toEqual({ signedInAt: '2026-10-06T09:30:00.000Z' });
    expect(repo.session).toEqual({ signedInAt: '2026-10-06T09:30:00.000Z' });
    expect(service.isSignedIn()).toBe(true);
  });

  it('signOut clears the session', () => {
    const repo = new FakeRepository({ signedInAt: NOW.toISOString() });
    const service = new AuthService(repo);
    expect(service.isSignedIn()).toBe(true);
    service.signOut();
    expect(repo.session).toBeNull();
    expect(service.isSignedIn()).toBe(false);
  });

  it('a session that is not well formed does not count as signed in', () => {
    // Storage is untrusted: these stand in for hand-edited or stale values.
    const garbage = [{ signedInAt: 'not a date' }, {}, { signedInAt: 123 }, 'yes'] as unknown as AuthSession[];
    for (const session of garbage) {
      expect(new AuthService(new FakeRepository(session)).isSignedIn()).toBe(false);
    }
  });
});
