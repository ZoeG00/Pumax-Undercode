import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertTriangle, FileText, NotepadText } from "lucide-react-native";
import { useDashboard } from "../../hooks/useReports";

export default function Reports() {
  const { dashboard, loading, error, refetch } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num);
  };

  if (loading && !dashboard) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#45bd66" />
        <Text className="text-white mt-4">Cargando reportes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center p-4">
        <Text className="text-red-500 text-lg mb-4">Error: {error}</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-brand-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-gray-400">No hay datos disponibles</Text>
      </View>
    );
  }

  const kpis = dashboard.kpis;
  const crecimiento = kpis.crecimiento_vs_mes_anterior;

  return (
    <ScrollView
      className="flex-1 bg-slate-900"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#45bd66" />
      }
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-6  mb-2">
        <View className="w-11 h-11 rounded-xl bg-brand-700 items-center justify-center mr-3">
          <NotepadText color={"#ae2151"} size={20} />
        </View>
        <View>
          <Text className="text-2xl font-bold text-white mb-2">Reportes</Text>
          <Text className="text-gray-400">Resumen de operaciones del negocio</Text>
        </View>
      </View>

      {/* KPIs principales - Grid 2x2 */}
      <View className="px-4 mb-4">
        <View className="flex-row mb-3">
          {/* Ventas totales */}
          <View className="flex-1 bg-slate-800 rounded-xl p-4 mr-2">
            <View className="flex-row items-center mb-2">
              <ShoppingCart color="#45bd66" size={20} />
              <Text className="text-gray-400 text-xs ml-2">Ventas</Text>
            </View>
            <Text className="text-white font-bold text-xl">{formatNumber(kpis.ventas_totales)}</Text>
            <View className="flex-row items-center mt-1">
              {crecimiento >= 0 ? (
                <TrendingUp color="#10B981" size={16} />
              ) : (
                <TrendingDown color="#EF4444" size={16} />
              )}
              <Text className={`text-xs ml-1 ${crecimiento >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {crecimiento > 0 ? '+' : ''}{crecimiento.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Facturación */}
          <View className="flex-1 bg-slate-800 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <DollarSign color="#10B981" size={20} />
              <Text className="text-gray-400 text-xs ml-2">Facturación</Text>
            </View>
            <Text className="text-white font-bold text-lg">
              {formatCurrency(kpis.facturacion_total)}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              Ticket: {formatCurrency(kpis.ticket_promedio)}
            </Text>
          </View>
        </View>

        <View className="flex-row mb-3">
          {/* Pedidos pendientes */}
          <View className="flex-1 bg-slate-800 rounded-xl p-4 mr-2">
            <View className="flex-row items-center mb-2">
              <FileText color="#F59E0B" size={20} />
              <Text className="text-gray-400 text-xs ml-2">Pendientes</Text>
            </View>
            <Text className="text-white font-bold text-xl">{kpis.pedidos_pendientes}</Text>
            <Text className="text-gray-500 text-xs mt-1">Pedidos</Text>
          </View>

          {/* Stock crítico */}
          <View className="flex-1 bg-slate-800 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <AlertTriangle color="#EF4444" size={20} />
              <Text className="text-gray-400 text-xs ml-2">Stock crítico</Text>
            </View>
            <Text className="text-white font-bold text-xl">{kpis.stock_critico}</Text>
            <Text className="text-gray-500 text-xs mt-1">Productos</Text>
          </View>
        </View>

        <View className="flex-row">
          {/* Clientes activos */}
          <View className="flex-1 bg-slate-800 rounded-xl p-4 mr-2">
            <View className="flex-row items-center mb-2">
              <Users color="#8B5CF6" size={20} />
              <Text className="text-gray-400 text-xs ml-2">Clientes</Text>
            </View>
            <Text className="text-white font-bold text-xl">{kpis.clientes_activos}</Text>
            <Text className="text-gray-500 text-xs mt-1">Activos</Text>
          </View>

          {/* Productos vendidos */}
          <View className="flex-1 bg-slate-800 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Package color="#EC4899" size={20} />
              <Text className="text-gray-400 text-xs ml-2">Productos</Text>
            </View>
            <Text className="text-white font-bold text-xl">{kpis.productos_vendidos}</Text>
            <Text className="text-gray-500 text-xs mt-1">Vendidos</Text>
          </View>
        </View>
      </View>

      {/* Ventas BLANCO vs NEGRO */}
      <View className="px-4 mb-4">
        <Text className="text-white font-bold text-lg mb-3">Ventas por Tipo</Text>
        <View className="bg-slate-800 rounded-xl p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-300">Blanco</Text>
            <Text className="text-white font-bold">
              {formatCurrency(dashboard.ventas_por_tipo.BLANCO)}
            </Text>
          </View>
          <View className="h-2 bg-slate-700 rounded-full mb-3">
            <View
              className="h-2 bg-brand-500 rounded-full"
              style={{
                width: `${(dashboard.ventas_por_tipo.BLANCO / (dashboard.ventas_por_tipo.BLANCO + dashboard.ventas_por_tipo.NEGRO)) * 100}%`
              }}
            />
          </View>

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-300">Negro</Text>
            <Text className="text-white font-bold">
              {formatCurrency(dashboard.ventas_por_tipo.NEGRO)}
            </Text>
          </View>
          <View className="h-2 bg-slate-700 rounded-full">
            <View
              className="h-2 bg-gray-600 rounded-full"
              style={{
                width: `${(dashboard.ventas_por_tipo.NEGRO / (dashboard.ventas_por_tipo.BLANCO + dashboard.ventas_por_tipo.NEGRO)) * 100}%`
              }}
            />
          </View>
        </View>
      </View>

      {/* Top 5 productos */}
      <View className="px-4 mb-4">
        <Text className="text-white font-bold text-lg mb-3">Top Productos</Text>
        <View className="bg-slate-800 rounded-xl p-4">
          {dashboard.top_productos.length === 0 ? (
            <Text className="text-gray-400 text-center">No hay datos</Text>
          ) : (
            dashboard.top_productos.slice(0, 5).map((producto, index) => (
              <View
                key={producto.producto_id}
                className={`flex-row justify-between items-center ${index < 4 ? 'mb-3 pb-3 border-b border-slate-700' : ''}`}
              >
                <View className="flex-1">
                  <Text className="text-white font-semibold">{producto.nombre}</Text>
                  <Text className="text-gray-400 text-sm">
                    {producto.cantidad_vendida} unidades
                  </Text>
                </View>
                <Text className="text-brand-400 font-bold">
                  {formatCurrency(producto.monto_total)}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Top 5 clientes */}
      <View className="px-4 mb-4">
        <Text className="text-white font-bold text-lg mb-3">Top Clientes</Text>
        <View className="bg-slate-800 rounded-xl p-4">
          {dashboard.top_clientes.length === 0 ? (
            <Text className="text-gray-400 text-center">No hay datos</Text>
          ) : (
            dashboard.top_clientes.slice(0, 5).map((cliente, index) => (
              <View
                key={cliente.cliente_id}
                className={`flex-row justify-between items-center ${index < 4 ? 'mb-3 pb-3 border-b border-slate-700' : ''}`}
              >
                <View className="flex-1">
                  <Text className="text-white font-semibold">{cliente.nombre}</Text>
                  <Text className="text-gray-400 text-sm">
                    {cliente.cantidad_pedidos} pedidos
                  </Text>
                </View>
                <Text className="text-green-500 font-bold">
                  {formatCurrency(cliente.total_compras)}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Pedidos por estado */}
      <View className="px-4 mb-6">
        <Text className="text-white font-bold text-lg mb-3">Estado de Pedidos</Text>
        <View className="bg-slate-800 rounded-xl p-4">
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
              <Text className="text-gray-300">Pendiente</Text>
            </View>
            <Text className="text-white font-bold">{dashboard.pedidos_por_estado.PENDIENTE}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-brand-500 rounded-full mr-2" />
              <Text className="text-gray-300">En Proceso</Text>
            </View>
            <Text className="text-white font-bold">{dashboard.pedidos_por_estado.EN_PROCESO}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
              <Text className="text-gray-300">Completado</Text>
            </View>
            <Text className="text-white font-bold">{dashboard.pedidos_por_estado.COMPLETADO}</Text>
          </View>
          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <Text className="text-gray-300">Cancelado</Text>
            </View>
            <Text className="text-white font-bold">{dashboard.pedidos_por_estado.CANCELADO}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
