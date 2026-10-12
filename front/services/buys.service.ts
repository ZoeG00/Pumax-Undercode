import { api } from './api.service';

// Tipos
export interface Ingreso {
  id: number;
  proveedor_id: number;
  proveedor?: {
    id: number;
    nombre: string;
    contacto?: string;
  };
  fecha_ingreso: string;
  estado: 'PENDIENTE' | 'VERIFICADO' | 'COMPLETADO';
  tipo_comprobante?: string;
  numero_comprobante?: string;
  total: number;
  observaciones?: string;
  items?: IngresoItem[];
  created_at?: string;
  updated_at?: string;
}

export interface IngresoItem {
  id: number;
  ingreso_id: number;
  producto_id: number;
  producto?: {
    id: number;
    nombre: string;
    codigo?: string;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CreateIngresoData {
  proveedor_id: number;
  fecha_ingreso: string;
  tipo_comprobante?: string;
  numero_comprobante?: string;
  observaciones?: string;
  items: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

// Obtener todos los ingresos
export async function getAllIngresos() {
  const response = await api.get<{ success: boolean; data: Ingreso[] }>('/ingresos');
  return response.data;
}

// Obtener un ingreso por ID
export async function getIngresoById(id: number) {
  const response = await api.get<{ success: boolean; data: Ingreso }>(`/ingresos/${id}`);
  return response.data;
}

// Crear un nuevo ingreso
export async function createIngreso(data: CreateIngresoData) {
  const response = await api.post<{ success: boolean; data: Ingreso; message: string }>(
    '/ingresos',
    data
  );
  return response;
}

// Verificar un ingreso (cambiar estado a VERIFICADO)
export async function verificarIngreso(id: number) {
  const response = await api.patch<{ success: boolean; data: Ingreso; message: string }>(
    `/ingresos/${id}/verificar`,
    {}
  );
  return response;
}

// Completar un ingreso (cambiar estado a COMPLETADO y actualizar stock)
export async function completarIngreso(id: number) {
  const response = await api.patch<{ success: boolean; data: Ingreso; message: string }>(
    `/ingresos/${id}/completar`,
    {}
  );
  return response;
}
