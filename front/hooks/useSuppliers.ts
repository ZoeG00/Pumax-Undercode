import { useState, useEffect, useCallback } from 'react';
import { Supplier } from '../types/suppliers.types';
import { getSuppliers } from '../services/suppliers.service';

interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSuppliers(): UseSuppliersReturn {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar proveedores');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
  };
}
