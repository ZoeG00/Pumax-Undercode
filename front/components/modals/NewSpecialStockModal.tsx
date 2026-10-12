import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SpecialStockModal({ visible, onClose }) {
  const [tipo, setTipo] = useState("Entrada");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [motivo, setMotivo] = useState("Seleccionar motivo");
  const [motivoOpen, setMotivoOpen] = useState(false);

  const motivosEntrada = [
    "Devolución de cliente",
    "Ajuste positivo / Corrección de inventario",
    "Producción terminada",
    "Transferencia desde otra sucursal",
    "Donación recibida",
  ];

  const motivosSalida = [
    "Devolución a proveedor",
    "Ajuste negativo / Pérdida de inventario",
    "Uso interno / Consumo propio",
    "Transferencia a otra sucursal",
    "Donación o promoción",
  ];

  const motivosDisponibles =
    tipo === "Entrada" ? motivosEntrada : motivosSalida;

  const handleRegistrar = () => {
    if (!producto || !cantidad || motivo === "Seleccionar motivo") {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    const movimiento = {
      tipo,
      producto,
      cantidad: parseInt(cantidad),
      fecha: fecha.toISOString().split("T")[0],
      motivo,
    };

    alert("Movimiento registrado correctamente ✅");

    // Limpiar campos
    setProducto("");
    setCantidad("");
    setMotivo("Seleccionar motivo");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Fondo oscuro */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center" />
      </TouchableWithoutFeedback>

      {/* Contenedor del modal */}
      <View className="absolute inset-0 justify-center items-center px-4">
        <View className="bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-lg border border-slate-700">
          <ScrollView showsVerticalScrollIndicator={true}>
            <Text className="text-xl font-bold mb-6 text-white text-center">
              Movimiento de stock extraordinario
            </Text>

            {/* Tipo */}
            <Text className="text-white mb-2 font-semibold">
              Tipo de movimiento
            </Text>
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className={`flex-1 mr-2 p-3 rounded-xl ${
                  tipo === "Entrada" ? "bg-brand-500" : "bg-slate-700"
                }`}
                onPress={() => {
                  setTipo("Entrada");
                  setMotivo("Seleccionar motivo");
                  setMotivoOpen(false);
                }}
              >
                <Text
                  className={`text-center font-semibold ${
                    tipo === "Entrada" ? "text-white" : "text-gray-400"
                  }`}
                >
                  Entrada
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 ml-2 p-3 rounded-xl ${
                  tipo === "Salida" ? "bg-brand-500" : "bg-slate-700"
                }`}
                onPress={() => {
                  setTipo("Salida");
                  setMotivo("Seleccionar motivo");
                  setMotivoOpen(false);
                }}
              >
                <Text
                  className={`text-center font-semibold ${
                    tipo === "Salida" ? "text-white" : "text-gray-400"
                  }`}
                >
                  Salida
                </Text>
              </TouchableOpacity>
            </View>

            {/* Producto */}
            <Text className="text-white mb-2 font-semibold">Producto</Text>
            <TextInput
              className="bg-slate-700 border border-gray-500 rounded-xl p-3 mb-4 text-base text-white"
              placeholder="Ej: Tornillos, Ladrillos, etc."
              placeholderTextColor="#9ca3af"
              value={producto}
              onChangeText={setProducto}
            />

            {/* Cantidad */}
            <Text className="text-white mb-2 font-semibold">Cantidad</Text>
            <TextInput
              className="bg-slate-700 border border-gray-500 rounded-xl p-3 mb-4 text-base text-white"
              placeholder="Ej: 20"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={cantidad}
              onChangeText={setCantidad}
            />

            {/* Fecha */}
            <Text className="text-white mb-2 font-semibold">Fecha</Text>
            {Platform.OS === "web" ? (
              <input
                type="date"
                className="bg-slate-700 border border-gray-500 rounded-xl p-3 mb-4 text-base w-full text-white"
                value={fecha.toISOString().split("T")[0]}
                onChange={(e) => setFecha(new Date(e.target.value))}
              />
            ) : (
              <>
                <TouchableOpacity
                  className="bg-slate-700 border border-gray-500 rounded-xl p-3 mb-4"
                  onPress={() => setMostrarFecha(true)}
                >
                  <Text className="text-white text-center">
                    {fecha.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {mostrarFecha && (
                  <DateTimePicker
                    value={fecha}
                    mode="date"
                    display="calendar"
                    onChange={(event, selectedDate) => {
                      setMostrarFecha(false);
                      if (selectedDate) setFecha(selectedDate);
                    }}
                  />
                )}
              </>
            )}

            {/* Motivo */}
            <Text className="text-white mb-2 font-semibold">Motivo</Text>
            <TouchableOpacity
              className="flex-row justify-between items-center bg-slate-700 rounded-xl p-3"
              onPress={() => setMotivoOpen(!motivoOpen)}
            >
              <Text className="text-base text-white">{motivo}</Text>
              <Text className="text-white">{motivoOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {motivoOpen && (
              <View className="mt-2 bg-slate-700 rounded-xl border border-slate-600">
                {motivosDisponibles.map((m) => (
                  <TouchableOpacity
                    key={m}
                    className="py-2 px-3 border-b border-slate-600"
                    onPress={() => {
                      setMotivo(m);
                      setMotivoOpen(false);
                    }}
                  >
                    <Text className="text-white">{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Botones */}
            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                onPress={onClose}
                className=" mr-2 bg-brand-700 rounded-xl p-4"
              >
                <Text className="text-white text-center font-semibold">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRegistrar}
                className=" ml-2 bg-brand-500 rounded-2xl p-4"
              >
                <Text className="text-white text-center font-semibold">
                  Registrar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
