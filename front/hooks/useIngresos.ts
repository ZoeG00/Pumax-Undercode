import { useState, useEffect } from 'react';
import { getAllIngresos, getIngresoById, Ingreso } from '../services/buys.service';

export function useIngresos() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIngresos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllIngresos();
      setIngresos(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar ingresos');
      console.error('Error fetching ingresos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngresos();
  }, []);

  return {
    ingresos,
    loading,
    error,
    refetch: fetchIngresos,
  };
}

export function useIngreso(id: number) {
  const [ingreso, setIngreso] = useState<Ingreso | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchIngreso = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getIngresoById(id);
        setIngreso(result);
      } catch (err: any) {
        setError(err.message || 'Error al cargar ingreso');
        console.error('Error fetching ingreso:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIngreso();
  }, [id]);

  return {
    ingreso,
    loading,
    error,
  };
}
