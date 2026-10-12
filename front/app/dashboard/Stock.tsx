import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react-native";
import SalesPanel from "../../components/stock/SalesPanel";
import PurchasesPanel from "../../components/stock/PurchasesPanel";
import AdjustmentsPanel from "../../components/stock/AdjustmentsPanel";
import { colors } from "../../constants/theme";

type TabKey = "ventas" | "compras" | "otros";

const TABS: { key: TabKey; label: string; hint: string; icon: LucideIcon }[] = [
  { key: "ventas", label: "Ventas", hint: "Salidas de mercadería por ventas", icon: ArrowUpRight },
  { key: "compras", label: "Compras", hint: "Entradas por ingresos de proveedores", icon: ArrowDownLeft },
  { key: "otros", label: "Otros", hint: "Ajustes y movimientos especiales", icon: SlidersHorizontal },
];

const isTabKey = (value: unknown): value is TabKey =>
  TABS.some((t) => t.key === value);

export default function StockScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // La pestaña vive en la dirección (?tab=compras): se puede enlazar y el botón "atrás" funciona
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const active: TabKey = isTabKey(tab) ? tab : "ventas";
  const current = TABS.find((t) => t.key === active)!;

  return (
    <View className="flex-1 bg-slate-900">
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1100,
          alignSelf: "center",
          paddingTop: isMobile ? 72 : 24,
        }}
      >
        {/* Encabezado */}
        <View className="px-4 mb-4 flex-row items-center">
          <View className="w-11 h-11 rounded-xl bg-brand-700 items-center justify-center mr-3">
            <ArrowLeftRight color={colors.wineLight} size={22} />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white">Movimiento de stock</Text>
            <Text className="text-slate-400 text-sm">{current.hint}</Text>
          </View>
        </View>

        {/* Pestañas */}
        <View className="px-4 mb-2">
          <View className="flex-row bg-slate-800 border border-slate-700 rounded-2xl p-1">
            {TABS.map(({ key, label, icon: Icon }) => {
              const selected = key === active;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => router.setParams({ tab: key })}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                    selected ? "bg-brand-500" : ""
                  }`}
                >
                  <Icon color={selected ? "#fff" : colors.muted} size={18} />
                  <Text
                    className={`ml-2 font-semibold ${selected ? "text-white" : "text-slate-300"}`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Contenido de la pestaña activa */}
        <View className="flex-1">
          {active === "ventas" && <SalesPanel />}
          {active === "compras" && <PurchasesPanel />}
          {active === "otros" && <AdjustmentsPanel />}
        </View>
      </View>
    </View>
  );
}
