import { Users } from "lucide-react-native";
import ListScreen, { Badge, Primary, Secondary } from "../../components/ListScreen";
import EditClientModal from "../../components/modals/EditClientModal";
import NewClientModal from "../../components/modals/NewClientModal";
import { useClients } from "../../hooks/useClients";
import { deleteClient } from "../../services/clients.service";
import { Client } from "../../types/clients.types";

export default function ClientsScreen() {
  const { clients, loading, error, refetch } = useClients();

  return (
    <ListScreen<Client>
      title="Clientes"
      subtitle="Datos de contacto y facturación"
      icon={Users}
      noun="Cliente"
      plural="clientes"
      items={clients}
      loading={loading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Buscar por nombre, email o CUIT..."
      matches={(c, q) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.cuit ?? "").includes(q)
      }
      getName={(c) => c.nombre}
      columns={[
        { header: "Cliente", flex: 1.4, render: (c) => <Primary>{c.nombre}</Primary> },
        { header: "CUIT", width: 130, render: (c) => <Secondary>{c.cuit}</Secondary> },
        { header: "Teléfono", flex: 1, render: (c) => <Secondary>{c.telefono}</Secondary> },
        { header: "Email", flex: 1.4, render: (c) => <Secondary>{c.email}</Secondary> },
        {
          header: "Tipo",
          width: 110,
          render: (c) => (
            <Badge
              text={c.tipo_cliente === "MAYORISTA" ? "Mayorista" : "Minorista"}
              tone={c.tipo_cliente === "MAYORISTA" ? "wine" : "brand"}
            />
          ),
        },
      ]}
      cardLines={[
        { label: "Razón social", value: (c) => c.razon_social },
        { label: "CUIT", value: (c) => c.cuit },
        { label: "Teléfono", value: (c) => c.telefono },
        { label: "Email", value: (c) => c.email },
        { label: "Tipo", value: (c) => (c.tipo_cliente === "MAYORISTA" ? "Mayorista" : "Minorista") },
      ]}
      onDelete={deleteClient}
      renderNewModal={(p) => <NewClientModal {...p} />}
      renderEditModal={({ item, ...p }) => <EditClientModal client={item} {...p} />}
    />
  );
}
