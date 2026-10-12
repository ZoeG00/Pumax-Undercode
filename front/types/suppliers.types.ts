export interface Supplier {
  id: number;
  nombre: string;
  razon_social: string | null;
  cuit: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  contacto_nombre: string | null;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface CreateSupplierRequest {
  nombre: string;
  razon_social?: string;
  cuit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  contacto_nombre?: string;
  activo?: boolean;
}

export interface UpdateSupplierRequest {
  nombre?: string;
  razon_social?: string;
  cuit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  contacto_nombre?: string;
  activo?: boolean;
}

export interface SupplierResponse {
  success: boolean;
  message?: string;
  data?: Supplier | Supplier[];
}
