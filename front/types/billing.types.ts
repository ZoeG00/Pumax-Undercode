export type TipoFactura = 'A' | 'B' | 'C' | 'NEGRO';
export type EstadoFactura = 'EMITIDA' | 'ANULADA';

export interface Invoice {
  id: number;
  numero_factura: string;
  pedido_id: number | null;
  cliente_id: number;
  tipo_factura: TipoFactura;
  punto_venta: string;
  fecha_emision: string;
  subtotal: number;
  iva_21: number;
  iva_105: number;
  total: number;
  cae: string | null;
  vencimiento_cae: string | null;
  estado: EstadoFactura;
  observaciones: string | null;
  usuario_emision_id: number | null;
}

export interface InvoiceItem {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  iva?: number;
}

export interface CreateInvoiceRequest {
  cliente_id: number;
  tipo_factura: TipoFactura;
  items: InvoiceItem[];
  observaciones?: string;
}

export interface InvoiceResponse {
  success: boolean;
  message?: string;
  data?: Invoice;
}
