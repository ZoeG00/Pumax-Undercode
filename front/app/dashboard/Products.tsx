import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import {
  AlertTriangle,
  Check,
  Edit,
  Lamp,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react-native";
import { useProducts } from "../../hooks/useProducts";
import { useNotice } from "../../hooks/useNotice";
import { deleteProduct } from "../../services/products.service";
import EditProductModal from "../../components/modals/EditProductModal";
import NewProductModal from "../../components/modals/NewProductModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import NoticeBanner from "../../components/modals/NoticeBanner";
import { Product } from "../../types/products.types";
import { colors } from "../../constants/theme";
import { money } from "../../utils/format";

const DEFAULT_MIN_STOCK = 5;

type StockLevel = "ok" | "low" | "out";

const stockLevel = (p: Product): StockLevel => {
  if (p.stock <= 0) return "out";
  return p.stock <= (p.stock_minimo || DEFAULT_MIN_STOCK) ? "low" : "ok";
};

const STOCK_STYLES: Record<StockLevel, { box: string; text: string }> = {
  ok: { box: "bg-brand-500/20", text: "text-brand-400" },
  low: { box: "bg-amber-500/20", text: "text-amber-400" },
  out: { box: "bg-red-500/20", text: "text-red-400" },
};

function StockBadge({ product }: { product: Product }) {
  const level = stockLevel(product);
  const s = STOCK_STYLES[level];
  return (
    <View className={`${s.box} rounded-full px-3 py-1 self-start`}>
      <Text className={`${s.text} text-xs font-bold`}>
        {level === "out" ? "Sin stock" : `${product.stock} u.`}
      </Text>
    </View>
  );
}

function StatCard({
  label,
  value,
  tone = "text-white",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <View className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
      <Text className="text-slate-400 text-xs">{label}</Text>
      <Text className={`${tone} text-2xl font-bold mt-1`}>{value}</Text>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 mr-2 rounded-full border ${
        active ? "bg-brand-500 border-brand-400" : "bg-slate-800 border-slate-600"
      }`}
    >
      <Text className={`text-sm ${active ? "text-white font-semibold" : "text-slate-300"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="flex-row">
      <TouchableOpacity onPress={onEdit} className="p-2 rounded-lg bg-slate-700 mr-2">
        <Edit color={colors.brandLight} size={16} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} className="p-2 rounded-lg bg-red-600/20">
        <Trash2 color={colors.danger} size={16} />
      </TouchableOpacity>
    </View>
  );
}

export default function ProductsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { products, loading, error, refetch } = useProducts();
  const { notice, showNotice } = useNotice();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [newVisible, setNewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.categoria?.nombre).filter(Boolean) as string[])
      ).sort(),
    [products]
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      low: products.filter((p) => stockLevel(p) === "low").length,
      out: products.filter((p) => stockLevel(p) === "out").length,
    }),
    [products]
  );

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.descripcion.toLowerCase().includes(q) ||
      p.codigo.toLowerCase().includes(q) ||
      (p.categoria?.nombre ?? "").toLowerCase().includes(q);
    const matchesCategory = !categoryFilter || p.categoria?.nombre === categoryFilter;
    const matchesStock = !onlyLowStock || stockLevel(p) !== "ok";
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditVisible(true);
  };

  const handleEditClose = () => {
    setEditVisible(false);
    setSelectedProduct(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      showNotice("success", `"${productToDelete.descripcion}" se eliminó correctamente`);
      refetch();
    } catch (err) {
      showNotice("error", "No se pudo eliminar el producto");
    } finally {
      setDeleting(false);
      setProductToDelete(null);
    }
  };

  // ---------- Filas ----------
  const renderDesktopRow = ({ item }: { item: Product }) => (
    <View className="flex-row items-center bg-slate-800 border border-slate-700 px-4 py-3 mb-2">
      <Text className="text-slate-400 text-xs w-24" numberOfLines={1}>
        {item.codigo}
      </Text>
      <Text className="text-white font-semibold flex-1 pr-2" numberOfLines={1}>
        {item.descripcion}
      </Text>
      <Text className="text-slate-300 flex-1 pr-2" numberOfLines={1}>
        {item.categoria?.nombre || "Sin categoría"}
      </Text>
      <View className="w-24">
        <StockBadge product={item} />
      </View>
      <Text className="text-brand-400 font-bold w-28 text-right">
        ${money(Number(item.precio_venta))}
      </Text>
      <View className="w-24 items-end">
        <ActionButtons onEdit={() => handleEdit(item)} onDelete={() => setProductToDelete(item)} />
      </View>
    </View>
  );

  const renderMobileCard = ({ item }: { item: Product }) => (
    <View className="bg-slate-800 border border-slate-700  p-4 mb-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-white font-semibold text-base">{item.descripcion}</Text>
          <Text className="text-slate-400 text-xs mt-1">
            {item.codigo} · {item.categoria?.nombre || "Sin categoría"}
          </Text>
        </View>
        <StockBadge product={item} />
      </View>
      <View className="flex-row items-center justify-between mt-4">
        <Text className="text-brand-400 font-bold text-lg">
          ${money(Number(item.precio_venta))}
        </Text>
        <ActionButtons onEdit={() => handleEdit(item)} onDelete={() => setProductToDelete(item)} />
      </View>
    </View>
  );

  // ---------- Estados ----------
  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color={colors.brandLight} />
        <Text className="text-white mt-4">Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center px-4">
        <AlertTriangle color={colors.danger} size={48} />
        <Text className="text-white text-lg mt-4 text-center">{error}</Text>
        <TouchableOpacity
          onPress={refetch}
          className="bg-brand-500 px-6 py-3 rounded-xl mt-4"
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- Encabezado de la lista ----------
  const listHeader = (
    <View>
      {/* Título + acción principal */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <View className="w-11 h-11 rounded-xl bg-brand-700 items-center justify-center mr-3">
          <Lamp color="#ae2151" size={22} />
          </View>
          <View>
            <Text className="text-2xl font-bold text-white">Productos</Text>
            <Text className="text-slate-400 text-sm mb-2">Catálogo y stock</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setNewVisible(true)}
          className="flex-row items-center bg-brand-500 active:bg-brand-700 px-4 py-3"
        >
          <Plus color="#fff" size={18} />
          <Text className="text-white font-bold ml-1">{isMobile ? "Nuevo" : "Nuevo producto"}</Text>
        </TouchableOpacity>
      </View>

      <NoticeBanner notice={notice} />

      {/* Resumen */}
      <View className="flex-row mb-4" style={{ gap: 12 }}>
        <StatCard label="Productos" value={stats.total} />
        <StatCard label="Stock bajo" value={stats.low} tone="text-amber-400" />
        <StatCard label="Sin stock" value={stats.out} tone="text-red-400" />
      </View>

      {/* Búsqueda */}
      <View className="flex-row items-center bg-slate-800 border border-slate-700  px-3 py-2 mb-3">
        <Search color={colors.muted} size={20} />
        <TextInput
          placeholder="Buscar por nombre, código o categoría..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 text-white py-1"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <X color={colors.muted} size={20} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filtros rápidos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <Chip
          label="Todas"
          active={!categoryFilter}
          onPress={() => setCategoryFilter(null)}
        />
        {categories.map((c) => (
          <Chip
            key={c}
            label={c}
            active={categoryFilter === c}
            onPress={() => setCategoryFilter(categoryFilter === c ? null : c)}
          />
        ))}
        <Chip
          label="⚠ Stock bajo"
          active={onlyLowStock}
          onPress={() => setOnlyLowStock(!onlyLowStock)}
        />
      </ScrollView>

      {/* Cabecera de tabla (solo escritorio) */}
      {!isMobile && (
        <View className="flex-row items-center px-4 pb-2">
          <Text className="text-slate-400 text-xs font-semibold uppercase w-24">Código</Text>
          <Text className="text-slate-400 text-xs font-semibold uppercase flex-1">Producto</Text>
          <Text className="text-slate-400 text-xs font-semibold uppercase flex-1">Categoría</Text>
          <Text className="text-slate-400 text-xs font-semibold uppercase w-24">Stock</Text>
          <Text className="text-slate-400 text-xs font-semibold uppercase w-28 text-center">
            Precio
          </Text>
          <Text className="text-slate-400 text-xs font-semibold uppercase w-24 text-center">
            Acciones
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={isMobile ? renderMobileCard : renderDesktopRow}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Lamp color={colors.muted} size={32} />
            <Text className="text-slate-400 mt-3">No se encontraron productos.</Text>
          </View>
        }
        contentContainerStyle={{
          width: "100%",
          maxWidth: 1100,
          alignSelf: "center",
          paddingHorizontal: 16,
          paddingTop: isMobile ? 72 : 24,
          paddingBottom: 32,
        }}
      />

      {/* Alta de producto */}
      <NewProductModal
        visible={newVisible}
        onClose={() => setNewVisible(false)}
        onSuccess={() => {
          refetch();
          showNotice("success", "Producto creado correctamente");
        }}
      />

      {/* Edición */}
      <EditProductModal
        visible={editVisible}
        product={selectedProduct}
        onClose={handleEditClose}
        onSuccess={() => {
          refetch();
          showNotice("success", "Producto actualizado correctamente");
        }}
      />

      {/* Confirmación de borrado */}
      <ConfirmDialog
        visible={!!productToDelete}
        title="Eliminar producto"
        message={`¿Seguro que querés eliminar "${productToDelete?.descripcion ?? ""}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </View>
  );
}
