/** A sign-in session as it is kept on this device. */
export interface AuthSession {
  /** When the user signed in (ISO 8601). */
  signedInAt: string;
}

/**
 * IAuthSessionRepository — the port AuthService depends on (synchronous,
 * per-device). Where the session lives (browser storage today, a server-issued
 * token in phase 3) is the repository's business, never the UI's.
 */
export interface IAuthSessionRepository {
  /** The saved session, or null when nobody is signed in. */
  load(): AuthSession | null;
  save(session: AuthSession): void;
  clear(): void;
}
