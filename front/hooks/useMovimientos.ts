import { useState, useEffect } from 'react';
import { getMovimientosStock, MovimientoStock } from '../services/reports.service';

export function useMovimientos(params?: {
  producto_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo_movimiento?: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
}) {
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMovimientosStock(params);
      setMovimientos(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar movimientos de stock');
      console.error('Error fetching movimientos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, [params?.producto_id, params?.fecha_desde, params?.fecha_hasta, params?.tipo_movimiento]);

  return {
    movimientos,
    loading,
    error,
    refetch: fetchMovimientos,
  };
}
