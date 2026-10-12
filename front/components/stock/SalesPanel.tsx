import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useSales } from "../../hooks/useSales";
import { exportSalesToExcel } from "../../services/sales.service";
import { Search, ChevronDown, ChevronUp, Download } from "lucide-react-native";

export default function SalesPanel() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const { sales, loading, error, refetch } = useSales();

  const handleExportExcel = async () => {
    try {
      setExportLoading(true);
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      await exportSalesToExcel({
        fecha_desde: firstDay.toISOString().split("T")[0],
        fecha_hasta: lastDay.toISOString().split("T")[0],
      });

      alert("Exportación iniciada. El archivo se descargará en breve.");
    } catch (err: any) {
      alert(`Error al exportar: ${err.message || "No se pudo exportar"}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Filtrar ventas localmente por búsqueda
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.cliente?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      sale.id.toString().includes(search);

    const matchesStatus = !filterStatus || sale.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETADO":
        return "bg-brand-500";
      case "EN_PROCESO":
        return "bg-brand-500";
      case "PENDIENTE":
        return "bg-yellow-600";
      case "CANCELADO":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "BLANCO"
      ? "bg-slate-200 text-slate-900"
      : "bg-slate-700 text-white";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && sales.length === 0) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#45bd66" />
        <Text className="text-white mt-4">Cargando ventas...</Text>
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

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row justify-end items-center mb-3">
          <TouchableOpacity
            onPress={handleExportExcel}
            disabled={exportLoading}
            className="bg-brand-500 px-4 py-2 rounded-lg flex-row items-center"
          >
            {exportLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Download color="white" size={18} />
                <Text className="text-white font-semibold ml-2">Excel</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 mb-3">
          <Search color="#9CA3AF" size={20} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por cliente o ID..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-white"
          />
        </View>

        {/* Filtros de estado */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          <TouchableOpacity
            onPress={() => setFilterStatus("")}
            className={`px-4 py-2 rounded-full mr-2 ${filterStatus === "" ? "bg-brand-700" : "bg-slate-800"}`}
          >
            <Text className="text-white">Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus("PENDIENTE")}
            className={`px-4 py-2 rounded-full mr-2 ${filterStatus === "PENDIENTE" ? "bg-yellow-600" : "bg-slate-800"}`}
          >
            <Text className="text-white">Pendiente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus("EN_PROCESO")}
            className={`px-4 py-2 rounded-full mr-2 ${filterStatus === "EN_PROCESO" ? "bg-wine-600" : "bg-slate-800"}`}
          >
            <Text className="text-white">En Proceso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus("COMPLETADO")}
            className={`px-4 py-2 rounded-full mr-2 ${filterStatus === "COMPLETADO" ? "bg-brand-500" : "bg-slate-800"}`}
          >
            <Text className="text-white">Completado</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de ventas */}
      <ScrollView className="flex-1 px-4">
        {filteredSales.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-400 text-lg">
              No se encontraron ventas
            </Text>
          </View>
        ) : (
          filteredSales.map((sale) => (
            <View
              key={sale.id}
              className="bg-slate-800 border border-slate-700 rounded-2xl mb-3 overflow-hidden"
            >
              <TouchableOpacity
                onPress={() => toggleExpand(sale.id)}
                className="p-4"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-white font-bold text-lg mr-2">
                        Venta #{sale.id}
                      </Text>
                      <View
                        className={`px-2 py-1 rounded ${getTypeColor(sale.tipo_operacion)}`}
                      >
                        <Text className="text-xs font-semibold">
                          {sale.tipo_operacion}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-300">
                      {sale.cliente?.nombre || `Cliente #${sale.cliente_id}`}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {formatDate(sale.fecha_pedido)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-bold text-lg">
                      {formatCurrency(sale.total)}
                    </Text>
                    <View
                      className={`px-3 py-1 rounded-full ${getStatusColor(sale.estado)} mt-1`}
                    >
                      <Text className="text-white text-xs font-semibold">
                        {sale.estado.replace("_", " ")}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-gray-400 text-sm">
                    {expandedId === sale.id ? "Ver menos" : "Ver detalles"}
                  </Text>
                  {expandedId === sale.id ? (
                    <ChevronUp color="#9CA3AF" size={20} />
                  ) : (
                    <ChevronDown color="#9CA3AF" size={20} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Detalles expandidos */}
              {expandedId === sale.id && (
                <View className="px-4 pb-4 border-t border-slate-700 pt-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Subtotal:</Text>
                    <Text className="text-white">
                      {formatCurrency(sale.subtotal)}
                    </Text>
                  </View>
                  {sale.descuento > 0 && (
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-400">Descuento:</Text>
                      <Text className="text-brand-400">
                        -{formatCurrency(sale.descuento)}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-white font-bold">Total:</Text>
                    <Text className="text-white font-bold">
                      {formatCurrency(sale.total)}
                    </Text>
                  </View>
                  {sale.observaciones && (
                    <View className="mt-3 pt-3 border-t border-slate-700">
                      <Text className="text-gray-400 mb-1">Observaciones:</Text>
                      <Text className="text-white">{sale.observaciones}</Text>
                    </View>
                  )}
                  {sale.items && sale.items.length > 0 && (
                    <View className="mt-3 pt-3 border-t border-slate-700">
                      <Text className="text-gray-400 mb-2">Productos:</Text>
                      {sale.items.map((item) => (
                        <View
                          key={item.id}
                          className="flex-row justify-between mb-2"
                        >
                          <Text className="text-white flex-1">
                            {item.producto?.nombre ||
                              `Producto #${item.producto_id}`}
                          </Text>
                          <Text className="text-gray-400 mx-2">
                            x{item.cantidad}
                          </Text>
                          <Text className="text-white">
                            {formatCurrency(item.subtotal)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer con total */}
      <View className="bg-slate-800 px-4 py-3 border-t border-slate-700">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-300">Total de ventas:</Text>
          <Text className="text-white font-bold text-lg">
            {filteredSales.length}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-gray-300">Monto total:</Text>
          <Text className="text-brand-400 font-bold text-lg">
            {formatCurrency(
              filteredSales.reduce((sum, sale) => sum + sale.total, 0)
            )}
          </Text>
        </View>
      </View>
    </View>
  );
}
