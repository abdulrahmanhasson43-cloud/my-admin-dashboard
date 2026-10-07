import { describe, expect, it } from 'vitest';
import type { Client, ClientActivity } from '@/types';
import { ClientService, InvalidClientError } from './ClientService';
import { MockClientRepository } from './MockClientRepository';

const client = (overrides: Partial<Client> = {}): Client =>
  ({ id: 'c1', name: 'سارة', phone: '0100', email: 's@x.com', totalPurchases: 500, lastVisit: '2026-01-01', status: 'active', ...overrides } as Client);

const activity = (clientId: string, id: string, date = '2026-01-01'): ClientActivity =>
  ({ id, clientId, type: 'note', description: id, date });

const service = (clients: Client[] = [], activities: ClientActivity[] = []) =>
  new ClientService(new MockClientRepository(clients, activities));

describe('ClientService', () => {
  it('creates an active client with zero purchases and trimmed fields', async () => {
    const created = await service().createClient({ name: '  سارة ', phone: ' 0100 ', email: ' s@x.com ' });
    expect(created).toMatchObject({ name: 'سارة', phone: '0100', email: 's@x.com', totalPurchases: 0, status: 'active' });
    expect(created.id).toMatch(/^CLI-/);
  });

  it('rejects a blank name', async () => {
    await expect(service().createClient({ name: ' ', phone: '', email: '' })).rejects.toThrow(InvalidClientError);
  });

  it('update merges; unknown ids are rejected', async () => {
    const svc = service([client()]);
    expect((await svc.updateClient('c1', { phone: '0111' })).phone).toBe('0111');
    expect((await svc.getClientById('c1'))?.name).toBe('سارة');
    await expect(svc.updateClient('nope', {})).rejects.toThrow(InvalidClientError);
  });

  it('delete then restore brings the same client back (the undo flow)', async () => {
    const svc = service([client()]);
    const original = (await svc.getClientById('c1'))!;
    await svc.deleteClient('c1');
    expect(await svc.getClientById('c1')).toBeNull();
    await svc.restoreClient(original);
    expect(await svc.getClientById('c1')).toEqual(original);
  });

  it('activities: per client, newest first, and all', async () => {
    const svc = service([], [activity('c1', 'a1', '2026-01-01'), activity('c2', 'a2'), activity('c1', 'a3', '2026-03-01')]);
    expect((await svc.getClientActivities('c1')).map(a => a.id)).toEqual(['a3', 'a1']);
    expect(await svc.getAllActivities()).toHaveLength(3);
  });
});
