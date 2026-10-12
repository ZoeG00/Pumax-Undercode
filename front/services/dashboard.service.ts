import { api } from './api.service';
import { DashboardData } from '../types/dashboard.types';

// Servicio para obtener datos del dashboard
export async function getDashboardData(): Promise<DashboardData> {
  const response = await api.get<{ success: boolean; data: DashboardData }>('/reportes/dashboard');
  return response.data;
}
