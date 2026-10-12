import { Users } from "lucide-react-native";
import FormModal from "../FormModal";
import { ChipSelect, Field, FieldRow, Section } from "../FormFields";
import { useFormState, toNumber } from "../../hooks/useFormState";
import { createClient } from "../../services/clients.service";
import type { CondicionIVA, TipoCliente } from "../../types/clients.types";

type Props = { visible: boolean; onClose: () => void; onSuccess: () => void };

const INITIAL = {
  nombre: "",
  razon_social: "",
  cuit: "",
  telefono: "",
  email: "",
  direccion: "",
  localidad: "",
  provincia: "",
  tipo_cliente: "MINORISTA",
  condicion_iva: "CONSUMIDOR_FINAL",
  descuento_habitual: "0",
  limite_credito: "0",
};

const TIPOS: { value: TipoCliente; label: string }[] = [
  { value: "MINORISTA", label: "Minorista" },
  { value: "MAYORISTA", label: "Mayorista" },
];

const IVA: { value: CondicionIVA; label: string }[] = [
  { value: "CONSUMIDOR_FINAL", label: "Consumidor final" },
  { value: "MONOTRIBUTO", label: "Monotributo" },
  { value: "RI", label: "Resp. inscripto" },
  { value: "EXENTO", label: "Exento" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NewClientModal({ visible, onClose, onSuccess }: Props) {
  const { values, errors, setErrors, set, submitting, serverError, submit } = useFormState(
    INITIAL,
    visible
  );

  const handleSave = () => {
    const found: typeof errors = {};
    if (!values.nombre.trim()) found.nombre = "Ingresá el nombre del cliente";
    if (values.cuit.trim() && values.cuit.replace(/\D/g, "").length !== 11)
      found.cuit = "El CUIT tiene 11 dígitos";
    if (values.email.trim() && !EMAIL.test(values.email.trim()))
      found.email = "El email no parece válido";

    const descuento = toNumber(values.descuento_habitual || "0");
    const limite = toNumber(values.limite_credito || "0");
    if (Number.isNaN(descuento) || descuento < 0 || descuento > 100)
      found.descuento_habitual = "Entre 0 y 100";
    if (Number.isNaN(limite) || limite < 0) found.limite_credito = "Ingresá un importe válido";

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    const opt = (v: string) => v.trim() || undefined;
    submit(async () => {
      await createClient({
        nombre: values.nombre.trim(),
        razon_social: opt(values.razon_social),
        cuit: opt(values.cuit),
        telefono: opt(values.telefono),
        email: opt(values.email),
        direccion: opt(values.direccion),
        localidad: opt(values.localidad),
        provincia: opt(values.provincia),
        tipo_cliente: values.tipo_cliente as TipoCliente,
        condicion_iva: values.condicion_iva as CondicionIVA,
        descuento_habitual: descuento,
        limite_credito: limite,
        activo: true,
      });
      onSuccess();
      onClose();
    });
  };

  return (
    <FormModal
      visible={visible}
      title="Nuevo cliente"
      subtitle="Datos de contacto y facturación"
      icon={Users}
      submitText="Crear cliente"
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
        placeholder="Nombre o nombre de fantasía"
        error={errors.nombre}
      />
      <FieldRow>
        <Field label="Razón social" value={values.razon_social} onChangeText={set("razon_social")} />
        <Field
          label="CUIT"
          value={values.cuit}
          onChangeText={set("cuit")}
          placeholder="20-12345678-9"
          keyboardType="numbers-and-punctuation"
          error={errors.cuit}
        />
      </FieldRow>

      <Section title="Contacto" />
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
      <FieldRow>
        <Field label="Localidad" value={values.localidad} onChangeText={set("localidad")} />
        <Field label="Provincia" value={values.provincia} onChangeText={set("provincia")} />
      </FieldRow>

      <Section title="Condiciones comerciales" />
      <ChipSelect
        label="Tipo de cliente"
        options={TIPOS}
        value={values.tipo_cliente as TipoCliente}
        onChange={set("tipo_cliente")}
      />
      <ChipSelect
        label="Condición frente al IVA"
        options={IVA}
        value={values.condicion_iva as CondicionIVA}
        onChange={set("condicion_iva")}
      />
      <FieldRow>
        <Field
          label="Descuento habitual"
          value={values.descuento_habitual}
          onChangeText={set("descuento_habitual")}
          keyboardType="decimal-pad"
          suffix="%"
          error={errors.descuento_habitual}
        />
        <Field
          label="Límite de crédito"
          value={values.limite_credito}
          onChangeText={set("limite_credito")}
          keyboardType="decimal-pad"
          prefix="$"
          error={errors.limite_credito}
        />
      </FieldRow>
    </FormModal>
  );
}
