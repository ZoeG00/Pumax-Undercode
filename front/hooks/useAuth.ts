import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook personalizado para acceder al contexto de autenticación
 *
 * @returns AuthContext con user, isAuthenticated, login, logout, etc.
 * @throws Error si se usa fuera del AuthProvider
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
}
