import { useState, useEffect, useCallback } from 'react';
import { Client } from '../types/clients.types';
import { getClients } from '../services/clients.service';

interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClients();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
  };
}
