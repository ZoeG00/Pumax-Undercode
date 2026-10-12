// Tipos para el Dashboard basados en la nueva estructura del backend

export interface DashboardKPIs {
  ventas_totales: number;
  facturacion_total: number;
  ticket_promedio: number;
  pedidos_pendientes: number;
  stock_critico: number;
  clientes_activos: number;
  productos_vendidos: number;
  crecimiento_vs_mes_anterior: number;
}

export interface EvolucionVentas {
  mes: string;
  ventas: number;
}

export interface TopProducto {
  producto_id: number;
  nombre: string;
  cantidad_vendida: number;
  monto_total: number;
}

export interface TopCliente {
  cliente_id: number;
  nombre: string;
  total_compras: number;
  cantidad_pedidos: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  ventas_por_tipo: {
    BLANCO: number;
    NEGRO: number;
  };
  evolucion_ventas: EvolucionVentas[];
  top_productos: TopProducto[];
  top_clientes: TopCliente[];
  facturacion_por_tipo: {
    A: number;
    B: number;
    C: number;
    NEGRO: number;
  };
  pedidos_por_estado: {
    PENDIENTE: number;
    EN_PROCESO: number;
    COMPLETADO: number;
    CANCELADO: number;
  };
}
