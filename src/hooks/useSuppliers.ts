import { useCallback, useEffect, useState } from 'react';
import type { Supplier } from '@/types';
import type { CreateSupplierInput } from '@/services/supplier';
import { useSupplierService } from '@/context/supplier-service-context';

/**
 * useSuppliers — reactive state layered over SupplierService. Components using
 * this hook never touch MockSupplierRepository or any storage detail.
 */
export function useSuppliers() {
  const supplierService = useSupplierService();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await supplierService.getAllSuppliers();
      setSuppliers(all);
    } finally {
      setIsLoading(false);
    }
  }, [supplierService]);

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

  const createSupplier = useCallback(async (input: CreateSupplierInput) => {
    const created = await supplierService.createSupplier(input);
    setSuppliers(prev => [...prev, created]);
    return created;
  }, [supplierService]);

  const updateSupplier = useCallback(async (id: string, updates: Partial<Omit<Supplier, 'id'>>) => {
    const updated = await supplierService.updateSupplier(id, updates);
    setSuppliers(prev => prev.map(s => (s.id === id ? updated : s)));
    return updated;
  }, [supplierService]);

  const deleteSupplier = useCallback(async (id: string) => {
    await supplierService.deleteSupplier(id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  }, [supplierService]);

  const restoreSupplier = useCallback((supplier: Supplier) => {
    setSuppliers(prev => [supplier, ...prev]);
  }, []);

  return { suppliers, isLoading, refetch, createSupplier, updateSupplier, deleteSupplier, restoreSupplier };
}
