import { api } from './api.service';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../types/suppliers.types';

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await api.get<{ success: boolean; data: Supplier[] }>('/proveedores');
  return response.data;
}

export async function getSupplierById(id: number): Promise<Supplier> {
  const response = await api.get<{ success: boolean; data: Supplier }>(`/proveedores/${id}`);
  return response.data;
}

export async function createSupplier(supplier: CreateSupplierRequest): Promise<Supplier> {
  const response = await api.post<{ success: boolean; data: Supplier }>('/proveedores', supplier);
  return response.data;
}

export async function updateSupplier(id: number, supplier: UpdateSupplierRequest): Promise<Supplier> {
  const response = await api.put<{ success: boolean; data: Supplier }>(`/proveedores/${id}`, supplier);
  return response.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`/proveedores/${id}`);
}
