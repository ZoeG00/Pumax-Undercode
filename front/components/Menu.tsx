import { View, Text, TouchableOpacity, Image } from "react-native";
import { router, usePathname, type Href } from "expo-router";
import {
  ArrowLeftRight,
  Blocks,
  HandCoins,
  Home,
  Lamp,
  LogOut,
  NotepadText,
  Package,
  Settings,
  User,
  UserCheck,
  type LucideIcon,
} from "lucide-react-native";
import { useAuth } from "../hooks/useAuth";
import { colors } from "../constants/theme";

// `match`: otras rutas en las que esta opción también debe verse activa
type MenuItem = { label: string; href: Href; icon: LucideIcon; match?: string[] };

const ITEMS: MenuItem[] = [
  {
    label: "Mi cuenta",
    href: "/dashboard/Users",
    icon: User,
    // La gestión de usuarios (solo ADMIN) se abre desde Mi cuenta
    match: ["/dashboard/AdminUsers"],
  },
  { label: "Productos", href: "/dashboard/Products", icon: Lamp },
  { label: "Categorías", href: "/dashboard/Categories", icon: Blocks },
  { label: "Proveedores", href: "/dashboard/Suppliers", icon: Package },
  {
    label: "Movimiento de Stock",
    href: "/dashboard/Stock",
    icon: ArrowLeftRight,
    // Rutas anteriores que ahora son pestañas de esta pantalla
    match: ["/dashboard/Sales", "/dashboard/Buys", "/dashboard/SpecialStock"],
  },
  { label: "Reportes", href: "/dashboard/Reports", icon: NotepadText },
  { label: "Clientes", href: "/dashboard/Clients", icon: UserCheck },
  { label: "Facturación", href: "/dashboard/WhiteBill", icon: HandCoins },
];

function MenuRow({ item, pathname }: { item: MenuItem; pathname: string }) {
  const Icon = item.icon;
  const active = item.href === pathname || !!item.match?.includes(pathname);
  return (
    <TouchableOpacity
      onPress={() => router.push(item.href)}
      className={`flex-row items-center px-4 py-3 border-l-4 ${
        active ? "bg-brand-700 border-wine-400" : "border-transparent"
      }`}
    >
      <Icon color={colors.brandLight} size={22} />
      <Text className="text-white text-base ml-3">{item.label}</Text>
    </TouchableOpacity>
  );
}

export default function Menu() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View className="justify-between bg-slate-800 border-r border-slate-700">
      <View>
        {/* Logo sobre fondo claro para que se vea con sus colores originales */}
        <TouchableOpacity
          onPress={() => router.push("/dashboard/Home")}
          className="items-center"
        >
          <Image
            source={require("../assets/images/pumax-horizontal.png")}
            style={{ width: 180, height: 100 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {ITEMS.map((item) => (
          <MenuRow key={item.label} item={item} pathname={pathname} />
        ))}
      </View>

      {/* Sección inferior */}
      <View className="flex-row justify-between px-4 py-2 border-t border-slate-700">
        <TouchableOpacity
          className="items-center my-2"
          onPress={() => router.push("/dashboard/Home")}
        >
          <Home color={colors.wineLight} size={22} />
          <Text className="text-white text-sm">Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center my-2"
          onPress={() => router.push("/dashboard/Settings")}
        >
          <Settings color={colors.muted} size={22} />
          <Text className="text-white text-sm">Config</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center my-2" onPress={handleLogout}>
          <LogOut color={colors.brandLight} size={22} />
          <Text className="text-white text-sm">Salir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
