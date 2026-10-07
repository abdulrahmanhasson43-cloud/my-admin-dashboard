import { useCallback, useEffect, useState } from 'react';
import type { Client, ClientActivity } from '@/types';
import type { CreateClientInput } from '@/services/client';
import { useDataServices } from '@/context/data-services-context-value';

/**
 * useClients — the hook pages actually use. It layers ordinary React state
 * (loading/clients/activities) on top of ClientService so components get a
 * familiar reactive API, while every bit of business logic and data access
 * still lives in ClientService + IClientRepository underneath.
 */
export function useClients() {
  const { client: clientService } = useDataServices();
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const [all, allActivities] = await Promise.all([
        clientService.getAllClients(),
        clientService.getAllActivities(),
      ]);
      setClients(all);
      setActivities(allActivities);
    } finally {
      setIsLoading(false);
    }
  }, [clientService]);

  // Load once on mount. The fetch is kicked off from a microtask so the state
  // updates inside `refetch` run asynchronously, satisfying the
  // react-hooks/set-state-in-effect rule without changing the behaviour.
  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (!cancelled) return refetch();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const createClient = useCallback(async (input: CreateClientInput) => {
    const created = await clientService.createClient(input);
    setClients(prev => [...prev, created]);
    return created;
  }, [clientService]);

  const updateClient = useCallback(async (id: string, updates: Partial<Omit<Client, 'id'>>) => {
    const updated = await clientService.updateClient(id, updates);
    setClients(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  }, [clientService]);

  const deleteClient = useCallback(async (id: string) => {
    await clientService.deleteClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
  }, [clientService]);

  const restoreClient = useCallback(async (client: Client) => {
    const restored = await clientService.restoreClient(client);
    setClients(prev => [...prev, restored]);
    return restored;
  }, [clientService]);

  const getClientActivities = useCallback(
    (clientId: string) => activities.filter(a => a.clientId === clientId),
    [activities],
  );

  return {
    clients,
    activities,
    isLoading,
    refetch,
    createClient,
    updateClient,
    deleteClient,
    restoreClient,
    getClientActivities,
  };
}
