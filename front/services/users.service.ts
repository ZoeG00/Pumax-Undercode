import { api } from './api.service';

// Tipos
export interface User {
  id: number;
  username: string;
  nombre: string;
  apellido?: string;
  email?: string;
  rol: 'ADMIN' | 'EMPLEADO' | 'Empleado' | 'Admin';
  activo: boolean;
  empleado_id?: number;
  ultimo_acceso?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  nombre: string;
  apellido?: string;
  email?: string;
  rol: 'ADMIN' | 'EMPLEADO';
  empleado_id?: number;
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: 'ADMIN' | 'EMPLEADO';
  activo?: boolean;
}

// Obtener todos los usuarios
export async function getAllUsers() {
  const response = await api.get<{ success: boolean; data: User[] }>('/usuarios');
  return response.data;
}

// Obtener un usuario por ID
export async function getUserById(id: number) {
  const response = await api.get<{ success: boolean; data: User }>(`/usuarios/${id}`);
  return response.data;
}

// Crear un nuevo usuario
export async function createUser(data: CreateUserData) {
  const response = await api.post<{ success: boolean; data: User; message: string }>(
    '/usuarios',
    data
  );
  return response;
}

// Actualizar un usuario
export async function updateUser(id: number, data: UpdateUserData) {
  const response = await api.put<{ success: boolean; data: User; message: string }>(
    `/usuarios/${id}`,
    data
  );
  return response;
}

// Eliminar (desactivar) un usuario
export async function deleteUser(id: number) {
  const response = await api.delete<{ success: boolean; message: string }>(
    `/usuarios/${id}`
  );
  return response;
}

// Obtener perfil del usuario actual
export async function getCurrentUser() {
  const response = await api.get<{ success: boolean; data: User; message: string }>(
    '/usuarios/verificar-sesion'
  );
  return response.data;
}

// Actualizar perfil del usuario actual
export async function updateCurrentUserProfile(data: {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
}) {
  // Primero obtenemos el usuario actual para saber su ID
  const currentUser = await getCurrentUser();

  const response = await api.put<{ success: boolean; data: User; message: string }>(
    `/usuarios/${currentUser.id}`,
    data
  );
  return response;
}
