import { api } from './api.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/products.types';

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<{ success: boolean; data: Product[] }>('/productos');
  return response.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await api.get<{ success: boolean; data: Product }>(`/productos/${id}`);
  return response.data;
}

export async function createProduct(product: CreateProductRequest): Promise<Product> {
  const response = await api.post<{ success: boolean; data: Product }>('/productos', product);
  return response.data;
}

export async function updateProduct(id: number, product: UpdateProductRequest): Promise<Product> {
  const response = await api.put<{ success: boolean; data: Product }>(`/productos/${id}`, product);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await api.get<{ success: boolean; data: Product[] }>(`/productos/buscar?q=${encodeURIComponent(query)}`);
  return response.data;
}
