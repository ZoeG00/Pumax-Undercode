import { api } from './api.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/categories.types';

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<{ success: boolean; data: Category[] }>('/categorias');
  return response.data;
}

export async function createCategory(category: CreateCategoryRequest): Promise<Category> {
  const response = await api.post<{ success: boolean; data: Category }>('/categorias', category);
  return response.data;
}

export async function updateCategory(id: number, category: UpdateCategoryRequest): Promise<Category> {
  const response = await api.put<{ success: boolean; data: Category }>(`/categorias/${id}`, category);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
