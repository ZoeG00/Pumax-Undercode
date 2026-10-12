import { Package } from "lucide-react-native";
import ListScreen, { Primary, Secondary } from "../../components/ListScreen";
import EditSupplierModal from "../../components/modals/EditSupplierModal";
import NewSupplierModal from "../../components/modals/NewSupplierModal";
import { useSuppliers } from "../../hooks/useSuppliers";
import { deleteSupplier } from "../../services/suppliers.service";
import { Supplier } from "../../types/suppliers.types";

export default function SuppliersScreen() {
  const { suppliers, loading, error, refetch } = useSuppliers();

  return (
    <ListScreen<Supplier>
      title="Proveedores"
      subtitle="Quiénes te abastecen"
      icon={Package}
      noun="Proveedor"
      plural="proveedores"
      items={suppliers}
      loading={loading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Buscar por nombre o email..."
      matches={(s, q) =>
        s.nombre.toLowerCase().includes(q) || (s.email ?? "").toLowerCase().includes(q)
      }
      getName={(s) => s.nombre}
      columns={[
        { header: "Proveedor", flex: 1.3, render: (s) => <Primary>{s.nombre}</Primary> },
        { header: "Teléfono", flex: 1, render: (s) => <Secondary>{s.telefono}</Secondary> },
        { header: "Dirección", flex: 1.4, render: (s) => <Secondary>{s.direccion}</Secondary> },
        { header: "Email", flex: 1.4, render: (s) => <Secondary>{s.email}</Secondary> },
      ]}
      cardLines={[
        { label: "Teléfono", value: (s) => s.telefono },
        { label: "Dirección", value: (s) => s.direccion },
        { label: "Email", value: (s) => s.email },
      ]}
      onDelete={deleteSupplier}
      renderNewModal={(p) => <NewSupplierModal {...p} />}
      renderEditModal={({ item, ...p }) => <EditSupplierModal supplier={item} {...p} />}
    />
  );
}
