import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/products.types';
import { getProducts } from '../services/products.service';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}
