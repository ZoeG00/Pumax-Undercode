import { View, Text, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { Home, AlertTriangle } from "lucide-react-native";
import { useDashboard } from "../../hooks/useDashboard";

export default function DashboardHome() {
  const { data, loading, error } = useDashboard();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <>
      {/* Ocultamos el header automático */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1 bg-slate-900" style={{ paddingTop: isMobile ? 70 : 16, paddingHorizontal: 16, paddingBottom: 16 }}>
        {/* Header del dashboard */}
        <View className="flex-row items-center mb-6">
          <View className="w-11 h-11 rounded-xl bg-brand-700 items-center justify-center mr-3">
            <Home color="#e0507d" size={22} />
          </View>
          <Text className="text-2xl font-bold text-white ml-2">
            Inicio
          </Text>
        </View>

        {/* Estados de carga y error */}
        {loading && (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#e0507d" />
            <Text className="text-white mt-4">Cargando dashboard...</Text>
          </View>
        )}

        {error && (
          <View className="bg-red-500/20 border border-red-500 p-4 rounded-2xl mb-4">
            <View className="flex-row items-center">
              <AlertTriangle color="#ef4444" size={20} />
              <Text className="text-red-500 font-semibold ml-2">Error</Text>
            </View>
            <Text className="text-white mt-2">{error}</Text>
          </View>
        )}

        {/* Contenido principal */}
        {!loading && !error && data && (
          <>
            {/* Tarjetas de resumen */}
            <View className="flex-row flex-wrap justify-between">
              <View style={{ width: isMobile ? '100%' : '48%' }} className="bg-slate-600 p-4 rounded-2xl shadow mb-4">
                <Text className="text-white text-sm">Alertas de Stock</Text>
                <Text className="text-2xl font-bold text-white mt-2">
                  {data.kpis.stock_critico}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  Productos con stock bajo
                </Text>
              </View>

              <View style={{ width: isMobile ? '100%' : '48%' }} className="bg-slate-800 p-4 rounded-2xl shadow mb-4">
                <Text className="text-white text-sm">Pedidos Pendientes</Text>
                <Text className="text-2xl font-bold text-white mt-2">
                  {data.kpis.pedidos_pendientes}
                </Text>
              </View>

              <View style={{ width: isMobile ? '100%' : '48%' }} className="bg-slate-600 p-4 rounded-2xl shadow mb-4">
                <Text className="text-white text-sm">Clientes Activos</Text>
                <Text className="text-2xl font-bold text-white mt-2">
                  {data.kpis.clientes_activos}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  Total clientes
                </Text>
              </View>

              <View style={{ width: isMobile ? '100%' : '48%' }} className="bg-slate-800 p-4 rounded-2xl shadow mb-4">
                <Text className="text-white text-sm">Facturación del Mes</Text>
                <Text className="text-2xl font-bold text-white mt-2">
                  ${data.kpis.facturacion_total.toLocaleString()}
                </Text>
                {data.kpis.crecimiento_vs_mes_anterior !== 0 && (
                  <Text className={`text-xs mt-1 ${data.kpis.crecimiento_vs_mes_anterior > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.kpis.crecimiento_vs_mes_anterior > 0 ? '↑' : '↓'} {Math.abs(data.kpis.crecimiento_vs_mes_anterior).toFixed(1)}%
                  </Text>
                )}
              </View>
            </View>

            {/* Top Productos */}
            <View className="bg-brand-700 p-4 rounded-2xl shadow mt-4">
              <Text className="text-lg font-semibold text-white mb-3">
                Top Productos del Mes
              </Text>

              {data.top_productos && data.top_productos.length > 0 ? (
                data.top_productos.slice(0, 3).map((producto) => (
                  <View
                    key={producto.producto_id}
                    className="border-b border-gray-200 py-2"
                  >
                    <Text className="text-brand-400 font-medium">
                      {producto.nombre}
                    </Text>
                    <Text className="text-white text-sm">
                      {producto.cantidad_vendida} unidades - ${producto.monto_total.toLocaleString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-400 text-center py-4">
                  No hay productos vendidos este mes
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}
