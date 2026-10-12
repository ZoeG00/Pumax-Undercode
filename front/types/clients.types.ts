export type TipoCliente = 'MINORISTA' | 'MAYORISTA';
export type CondicionIVA = 'RI' | 'MONOTRIBUTO' | 'EXENTO' | 'CONSUMIDOR_FINAL';

export interface Client {
  id: number;
  nombre: string;
  razon_social: string | null;
  cuit: string | null;
  direccion: string | null;
  localidad: string | null;
  provincia: string | null;
  telefono: string | null;
  email: string | null;
  tipo_cliente: TipoCliente;
  condicion_iva: CondicionIVA;
  descuento_habitual: number;
  limite_credito: number;
  saldo_actual: number;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface CreateClientRequest {
  nombre: string;
  razon_social?: string;
  cuit?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  telefono?: string;
  email?: string;
  tipo_cliente?: TipoCliente;
  condicion_iva?: CondicionIVA;
  descuento_habitual?: number;
  limite_credito?: number;
  activo?: boolean;
}

export interface UpdateClientRequest {
  nombre?: string;
  razon_social?: string;
  cuit?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  telefono?: string;
  email?: string;
  tipo_cliente?: TipoCliente;
  condicion_iva?: CondicionIVA;
  descuento_habitual?: number;
  limite_credito?: number;
  saldo_actual?: number;
  activo?: boolean;
}

export interface ClientResponse {
  success: boolean;
  message?: string;
  data?: Client | Client[];
}
