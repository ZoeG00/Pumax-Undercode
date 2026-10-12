import { Package } from "lucide-react-native";
import FormModal from "../FormModal";
import { Field, FieldRow, Section } from "../FormFields";
import { useFormState } from "../../hooks/useFormState";
import { createSupplier } from "../../services/suppliers.service";

type Props = { visible: boolean; onClose: () => void; onSuccess: () => void };

const INITIAL = {
  nombre: "",
  razon_social: "",
  cuit: "",
  contacto_nombre: "",
  telefono: "",
  email: "",
  direccion: "",
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewSupplierModal({ visible, onClose, onSuccess }: Props) {
  const { values, errors, setErrors, set, submitting, serverError, submit } = useFormState(
    INITIAL,
    visible
  );

  const handleSave = () => {
    const found: typeof errors = {};
    if (!values.nombre.trim()) found.nombre = "Ingresá el nombre del proveedor";
    if (values.cuit.trim() && values.cuit.replace(/\D/g, "").length !== 11)
      found.cuit = "El CUIT tiene 11 dígitos";
    if (values.email.trim() && !EMAIL.test(values.email.trim()))
      found.email = "El email no parece válido";
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    const opt = (v: string) => v.trim() || undefined;
    submit(async () => {
      await createSupplier({
        nombre: values.nombre.trim(),
        razon_social: opt(values.razon_social),
        cuit: opt(values.cuit),
        contacto_nombre: opt(values.contacto_nombre),
        telefono: opt(values.telefono),
        email: opt(values.email),
        direccion: opt(values.direccion),
        activo: true,
      });
      onSuccess();
      onClose();
    });
  };

  return (
    <FormModal
      visible={visible}
      title="Nuevo proveedor"
      subtitle="Quién te abastece"
      icon={Package}
      submitText="Crear proveedor"
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
        placeholder="Nombre comercial"
        error={errors.nombre}
      />
      <FieldRow>
        <Field label="Razón social" value={values.razon_social} onChangeText={set("razon_social")} />
        <Field
          label="CUIT"
          value={values.cuit}
          onChangeText={set("cuit")}
          placeholder="30-12345678-9"
          keyboardType="numbers-and-punctuation"
          error={errors.cuit}
        />
      </FieldRow>

      <Section title="Contacto" />
      <Field
        label="Persona de contacto"
        value={values.contacto_nombre}
        onChangeText={set("contacto_nombre")}
      />
      <FieldRow>
        <Field
          label="Teléfono"
          value={values.telefono}
          onChangeText={set("telefono")}
          keyboardType="phone-pad"
        />
        <Field
          label="Email"
          value={values.email}
          onChangeText={set("email")}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
      </FieldRow>
      <Field label="Dirección" value={values.direccion} onChangeText={set("direccion")} />
    </FormModal>
  );
}
