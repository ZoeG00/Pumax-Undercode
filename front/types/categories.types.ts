export interface Category {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface CreateCategoryRequest {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateCategoryRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data?: Category | Category[];
}
