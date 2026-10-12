import { Blocks } from "lucide-react-native";
import FormModal from "../FormModal";
import { Field } from "../FormFields";
import { useFormState } from "../../hooks/useFormState";
import { createCategory } from "../../services/categories.service";

type Props = { visible: boolean; onClose: () => void; onSuccess: () => void };

const INITIAL = { nombre: "", descripcion: "" };

export default function NewCategoryModal({ visible, onClose, onSuccess }: Props) {
  const { values, errors, setErrors, set, submitting, serverError, submit } = useFormState(
    INITIAL,
    visible
  );

  const handleSave = () => {
    if (!values.nombre.trim()) {
      setErrors({ nombre: "Ingresá el nombre de la categoría" });
      return;
    }
    submit(async () => {
      await createCategory({
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || undefined,
        activo: true,
      });
      onSuccess();
      onClose();
    });
  };

  return (
    <FormModal
      visible={visible}
      title="Nueva categoría"
      subtitle="Sirve para agrupar tus productos"
      icon={Blocks}
      submitText="Crear categoría"
      submitting={submitting}
      error={serverError}
      onClose={onClose}
      onSubmit={handleSave}
    >
      <Field
        label="Nombre"
        required
        value={values.nombre}
        onChangeText={set("nombre")}
        placeholder="Ej: Bebidas"
        error={errors.nombre}
      />
      <Field
        label="Descripción"
        value={values.descripcion}
        onChangeText={set("descripcion")}
        placeholder="Opcional"
        multiline
      />
    </FormModal>
  );
}
