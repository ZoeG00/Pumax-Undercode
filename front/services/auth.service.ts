import { api } from './api.service';
import { LoginRequest, LoginResponse } from '../types/auth.types';

// Servicio de autenticación
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>('/usuarios/login', credentials);
}

// Verificar si la sesión actual es válida
export async function verificarSesion(): Promise<LoginResponse> {
  return api.get<LoginResponse>('/usuarios/verificar-sesion');
}
