import { useState, useEffect } from 'react';
import { getDashboard, DashboardData } from '../services/reports.service';

export function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDashboard();
      setDashboard(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar dashboard');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
