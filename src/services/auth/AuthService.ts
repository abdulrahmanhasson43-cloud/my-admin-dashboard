import type { AuthSession, IAuthSessionRepository } from './IAuthSessionRepository';

/**
 * True only for a well-formed session. Storage can hold anything (edited by
 * hand, left behind by an older build), so the shape is checked, not assumed.
 */
function isValidSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false;
  const { signedInAt } = value as { signedInAt?: unknown };
  return typeof signedInAt === 'string' && !Number.isNaN(Date.parse(signedInAt));
}

/**
 * AuthService — the rule "who may enter the app". The UI asks it; the UI never
 * reads a session itself.
 *
 * TODO(phase-3): today signing in only records that someone signed in on this
 * device (the login form accepts any input and there is no server). With a
 * real backend this is where credentials are verified and a token's expiry is
 * checked — the route guard and the screens stay as they are.
 */
export class AuthService {
  private readonly repository: IAuthSessionRepository;

  constructor(repository: IAuthSessionRepository) {
    this.repository = repository;
  }

  isSignedIn(): boolean {
    return isValidSession(this.repository.load());
  }

  signIn(now: Date = new Date()): AuthSession {
    const session: AuthSession = { signedInAt: now.toISOString() };
    this.repository.save(session);
    return session;
  }

  signOut(): void {
    this.repository.clear();
  }
}
