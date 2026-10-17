import type { Client, ClientActivity } from '@/types';
import { generateId } from '@/lib/utils';
import type { IClientRepository } from './IClientRepository';

/** Input accepted when creating a client from the UI. */
export interface CreateClientInput {
  name: string;
  phone: string;
  email: string;
}

/** Thrown when a caller tries to create/update a client with invalid data. */
export class InvalidClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidClientError';
  }
}

/**
 * ClientService — all client business logic lives here, and ONLY here.
 *
 * High-level module in Dependency Inversion terms: it depends solely on the
 * IClientRepository abstraction injected through the constructor, never on a
 * concrete storage technology. The UI (pages/components) reaches this service
 * through useClients() and never touches services/mock directly.
 */
export class ClientService {
  private readonly repository: IClientRepository;

  constructor(repository: IClientRepository) {
    this.repository = repository;
  }

  async getAllClients(): Promise<Client[]> {
    return this.repository.findAll();
  }

  async getClientById(id: string): Promise<Client | null> {
    return this.repository.findById(id);
  }

  async createClient(input: CreateClientInput): Promise<Client> {
    if (!input.name.trim()) {
      throw new InvalidClientError('Client name is required');
    }

    const client: Client = {
      id: generateId('CLI'),
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      totalPurchases: 0,
      lastVisit: new Date().toISOString().slice(0, 10),
      status: 'active',
    };

    return this.repository.insert(client);
  }

  async updateClient(id: string, updates: Partial<Omit<Client, 'id'>>): Promise<Client> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new InvalidClientError(`Cannot update unknown client: ${id}`);
    }
    return this.repository.update({ ...existing, ...updates });
  }

  async deleteClient(id: string): Promise<void> {
    return this.repository.remove(id);
  }

  /** Re-inserts a previously deleted client (used to support the "undo" toast). */
  async restoreClient(client: Client): Promise<Client> {
    return this.repository.insert(client);
  }

  async getClientActivities(clientId: string): Promise<ClientActivity[]> {
    return this.repository.findActivitiesByClientId(clientId);
  }

  async getAllActivities(): Promise<ClientActivity[]> {
    return this.repository.findAllActivities();
  }
}
