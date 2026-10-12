import { api } from './api.service';
import { storageService } from './storage.service';
import API_CONFIG from '../constants/config';

// Tipos
export interface Sale {
  id: number;
  fecha_pedido: string;
  cliente_id: number;
  cliente?: {
    id: number;
    nombre: string;
    email?: string;
  };
  tipo_operacion: 'BLANCO' | 'NEGRO';
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  subtotal: number;
  descuento: number;
  total: number;
  observaciones?: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: number;
  pedido_id: number;
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

export interface SalesReportParams {
  fecha_desde: string; // YYYY-MM-DD
  fecha_hasta: string; // YYYY-MM-DD
  tipo_operacion?: 'BLANCO' | 'NEGRO';
}

export interface SalesSearchParams {
  estado?: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
  tipo_operacion?: 'BLANCO' | 'NEGRO';
  cliente_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_min?: number;
  monto_max?: number;
  order_by?: 'fecha_pedido' | 'total' | 'estado';
  order?: 'ASC' | 'DESC';
}

// Obtener reporte de ventas por período
export async function getSalesReport(params: SalesReportParams) {
  const queryParams = new URLSearchParams({
    fecha_desde: params.fecha_desde,
    fecha_hasta: params.fecha_hasta,
    ...(params.tipo_operacion && { tipo_operacion: params.tipo_operacion }),
  });

  return api.get(`/reportes/ventas?${queryParams}`);
}

// Buscar pedidos/ventas con filtros avanzados
export async function searchSales(params: SalesSearchParams = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await api.get<{ success: boolean; data: Sale[] }>(
    `/busquedas/pedidos?${queryParams}`
  );
  return response.data;
}

// Obtener todas las ventas/pedidos (sin filtros)
export async function getAllSales() {
  const response = await api.get<{ success: boolean; data: Sale[] }>('/pedidos');
  return response.data;
}

// Obtener detalle de una venta específica
export async function getSaleById(id: number) {
  const response = await api.get<{ success: boolean; data: Sale }>(`/pedidos/${id}`);
  return response.data;
}

// Obtener pedidos pendientes de un cliente
export async function getPendingSalesByClient(clientId: number) {
  const response = await api.get<{ success: boolean; data: Sale[] }>(
    `/busquedas/pedidos/pendientes/${clientId}`
  );
  return response.data;
}

// Obtener estadísticas de pedidos por estado
export async function getSalesStatistics() {
  return api.get('/busquedas/pedidos/estadisticas');
}

// Actualizar estado de un pedido
export async function updateSaleStatus(id: number, estado: string) {
  const response = await api.patch<{ success: boolean; data: Sale; message: string }>(
    `/pedidos/${id}/estado`,
    { estado }
  );
  return response;
}

// Exportar ventas a Excel
export async function exportSalesToExcel(params: SalesReportParams) {
  const queryParams = new URLSearchParams({
    fecha_desde: params.fecha_desde,
    fecha_hasta: params.fecha_hasta,
  });

  if (params.tipo_operacion) {
    queryParams.append('tipo_operacion', params.tipo_operacion);
  }

  // Obtener el token de sesión
  const token = await storageService.getToken();
  if (token) {
    queryParams.append('token', token);
  }

  const url = `${API_CONFIG.BASE_URL}/exportar/ventas/excel?${queryParams}`;

  // Abrir en nueva pestaña - el navegador maneja la descarga
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}
