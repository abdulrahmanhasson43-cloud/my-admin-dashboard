import type { Client, ClientActivity } from '@/types';
import { sampleClients, clientActivities } from '@/services/mock/clients';
import { ClientNotFoundError } from './IClientRepository';
import type { IClientRepository } from './IClientRepository';

/**
 * MockClientRepository — an in-memory implementation of IClientRepository.
 *
 * This is a low-level module: it implements the abstraction rather than
 * ClientService depending on it directly. ClientService never imports this
 * file.
 *
 * TODO(phase-3): replace with a real adapter (e.g. FirestoreClientRepository)
 * that implements the same interface. Swap it in one place —
 * src/context/ClientServiceContext.tsx — and nothing else changes.
 */
export class MockClientRepository implements IClientRepository {
  private clients: Client[];
  private readonly activities: ClientActivity[];

  constructor(
    seed: Client[] = sampleClients,
    activitySeed: ClientActivity[] = clientActivities,
  ) {
    // Copy so mutations here never reach back into the shared mock fixtures.
    this.clients = seed.map(c => ({ ...c }));
    this.activities = activitySeed.map(a => ({ ...a }));
  }

  async findAll(): Promise<Client[]> {
    return [...this.clients];
  }

  async findById(id: string): Promise<Client | null> {
    return this.clients.find(c => c.id === id) ?? null;
  }

  async insert(client: Client): Promise<Client> {
    this.clients = [...this.clients, client];
    return client;
  }

  async update(client: Client): Promise<Client> {
    const index = this.clients.findIndex(c => c.id === client.id);
    if (index === -1) {
      throw new ClientNotFoundError(client.id);
    }
    this.clients = [
      ...this.clients.slice(0, index),
      client,
      ...this.clients.slice(index + 1),
    ];
    return client;
  }

  async remove(id: string): Promise<void> {
    this.clients = this.clients.filter(c => c.id !== id);
  }

  async findActivitiesByClientId(clientId: string): Promise<ClientActivity[]> {
    return this.activities
      .filter(a => a.clientId === clientId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async findAllActivities(): Promise<ClientActivity[]> {
    return [...this.activities];
  }
}
