import { Blocks } from "lucide-react-native";
import ListScreen, { Primary, Secondary } from "../../components/ListScreen";
import EditCategoryModal from "../../components/modals/EditCategoryModal";
import NewCategoryModal from "../../components/modals/NewCategoryModal";
import { useCategories } from "../../hooks/useCategories";
import { deleteCategory } from "../../services/categories.service";
import { Category } from "../../types/categories.types";

export default function CategoriesScreen() {
  const { categories, loading, error, refetch } = useCategories();

  return (
    <ListScreen<Category>
      title="Categorías"
      subtitle="Agrupan tus productos"
      icon={Blocks}
      noun="Categoría"
      plural="categorías"
      feminine
      items={categories}
      loading={loading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Buscar categoría..."
      matches={(c, q) =>
        c.nombre.toLowerCase().includes(q) || (c.descripcion ?? "").toLowerCase().includes(q)
      }
      getName={(c) => c.nombre}
      columns={[
        { header: "Categoría", flex: 1, render: (c) => <Primary>{c.nombre}</Primary> },
        { header: "Descripción", flex: 2, render: (c) => <Secondary>{c.descripcion}</Secondary> },
      ]}
      cardLines={[{ label: "Descripción", value: (c) => c.descripcion }]}
      onDelete={deleteCategory}
      renderNewModal={(p) => <NewCategoryModal {...p} />}
      renderEditModal={({ item, ...p }) => <EditCategoryModal category={item} {...p} />}
    />
  );
}
