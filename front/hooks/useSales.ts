import { useState, useEffect } from 'react';
import { getAllSales, searchSales, getSaleById, updateSaleStatus, Sale, SalesSearchParams } from '../services/sales.service';

export function useSales(searchParams?: SalesSearchParams) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async (params?: SalesSearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const result = params ? await searchSales(params) : await getAllSales();
      setSales(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar ventas');
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(searchParams);
  }, []);

  const refetch = (params?: SalesSearchParams) => fetchSales(params);

  return {
    sales,
    loading,
    error,
    refetch,
  };
}

export function useSale(id: number) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchSale = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getSaleById(id);
        setSale(result);
      } catch (err: any) {
        setError(err.message || 'Error al cargar venta');
        console.error('Error fetching sale:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, [id]);

  return {
    sale,
    loading,
    error,
  };
}
