import { useState, useEffect } from 'react';
import { getCurrentUser, User } from '../services/users.service';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCurrentUser();
      setUser(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar perfil');
      console.error('Error fetching current user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchCurrentUser,
  };
}
