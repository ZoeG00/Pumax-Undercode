export interface Product {
  id: number;
  codigo: string;
  descripcion: string;
  categoria_id: number | null;
  precio_base: number;
  precio_venta: number;
  margen_ganancia: number;
  stock: number;
  stock_minimo: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  categoria?: {
    id: number;
    nombre: string;
  };
}

export interface CreateProductRequest {
  codigo: string;
  descripcion: string;
  categoria_id?: number | null;
  precio_base: number;
  precio_venta: number;
  margen_ganancia?: number;
  stock?: number;
  stock_minimo?: number;
  activo?: boolean;
}

export interface UpdateProductRequest {
  codigo?: string;
  descripcion?: string;
  categoria_id?: number | null;
  precio_base?: number;
  precio_venta?: number;
  margen_ganancia?: number;
  stock?: number;
  stock_minimo?: number;
  activo?: boolean;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data?: Product | Product[];
}
