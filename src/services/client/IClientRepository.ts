import type { Client, ClientActivity } from '@/types';

/**
 * IClientRepository — the abstraction (port) that ClientService depends on.
 *
 * Dependency Inversion: ClientService (high-level policy) depends on THIS
 * interface, never on a concrete storage technology. Concrete adapters
 * (MockClientRepository today; a FirestoreClientRepository tomorrow)
 * implement this same interface, so swapping storage touches exactly one
 * file — the composition root — and nothing else in the app.
 */
export interface IClientRepository {
  /** Returns every client. Ordering is NOT guaranteed — callers sort as needed. */
  findAll(): Promise<Client[]>;

  /** Returns a single client by id, or null if it doesn't exist. */
  findById(id: string): Promise<Client | null>;

  /** Persists a brand-new client and returns the stored record. */
  insert(client: Client): Promise<Client>;

  /** Persists a full replacement of an existing client, or throws if the id is unknown. */
  update(client: Client): Promise<Client>;

  /** Removes a client by id. No-ops if it doesn't exist. */
  remove(id: string): Promise<void>;

  /** Returns every activity recorded for a given client, newest first. */
  findActivitiesByClientId(clientId: string): Promise<ClientActivity[]>;

  /** Returns every activity across all clients. */
  findAllActivities(): Promise<ClientActivity[]>;
}

/** Thrown by repository implementations when a client id can't be found. */
export class ClientNotFoundError extends Error {
  constructor(id: string) {
    super(`Client not found: ${id}`);
    this.name = 'ClientNotFoundError';
  }
}
