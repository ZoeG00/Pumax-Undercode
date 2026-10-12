import API_CONFIG from '../constants/config';
import { storageService } from './storage.service';

// Clase de error personalizada para errores de API
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Obtiene el token de sesión del usuario autenticado
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const token = await storageService.getToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Función genérica para hacer peticiones HTTP
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Limpiar el endpoint de barras iniciales
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Construir URL asegurando que BASE_URL termina sin / y endpoint empieza sin /
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const url = `${baseUrl}/${cleanEndpoint}`;


  // Obtener el token de sesión para autenticación
  const token = await getAuthToken();

  // Construir headers como objeto plano para compatibilidad total en Web y React Native
  const headers: Record<string, string> = {
    ...(API_CONFIG.DEFAULT_HEADERS as Record<string, string>),
    ...((options.headers as Record<string, string>) || {}),
  };

  // Agregar header de autorización si hay token de sesión
  if (token) {
    headers['x-session-token'] = token;
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parsear respuesta JSON de forma segura (por si viene vacía)
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    // Si la respuesta no es OK, lanzar error
    if (!response.ok) {
      throw new ApiError(
        data.message || data.mensaje || 'Error en la petición',
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    // Manejar diferentes tipos de errores
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('La petición tardó demasiado tiempo');
      }
      throw new ApiError(error.message);
    }

    throw new ApiError('Error desconocido en la petición');
  }
}

// Métodos HTTP convenientes
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};