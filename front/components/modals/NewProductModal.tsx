import { Lamp } from "lucide-react-native";
import FormModal from "../FormModal";
import { ChipSelect, Field, FieldRow, Section } from "../FormFields";
import { useFormState, toNumber } from "../../hooks/useFormState";
import { useCategories } from "../../hooks/useCategories";
import { createProduct } from "../../services/products.service";

type Props = { visible: boolean; onClose: () => void; onSuccess: () => void };

const INITIAL = {
  codigo: "",
  descripcion: "",
  categoria_id: "", // vacío = sin categoría
  precio_base: "",
  margen_ganancia: "20",
  precio_venta: "",
  stock: "0",
  stock_minimo: "10",
};

const round2 = (n: number) => String(Math.round(n * 100) / 100);

export default function NewProductModal({ visible, onClose, onSuccess }: Props) {
  const { categories } = useCategories();
  const { values, setValues, errors, setErrors, set, submitting, serverError, submit } =
    useFormState(INITIAL, visible);

  const categoryOptions = [
    { value: "", label: "Sin categoría" },
    ...categories.map((c) => ({ value: String(c.id), label: c.nombre })),
  ];

  // Precio base o margen -> se recalcula el precio de venta
  const onBaseOrMargin = (field: "precio_base" | "margen_ganancia") => (text: string) => {
    setValues((prev) => {
      const next = { ...prev, [field]: text };
      const base = toNumber(next.precio_base);
      const margen = toNumber(next.margen_ganancia);
      if (!Number.isNaN(base) && base > 0 && !Number.isNaN(margen)) {
        next.precio_venta = round2(base * (1 + margen / 100));
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined, precio_venta: undefined }));
  };

  // Precio de venta escrito a mano -> se recalcula el margen
  const onSalePrice = (text: string) => {
    setValues((prev) => {
      const next = { ...prev, precio_venta: text };
      const base = toNumber(prev.precio_base);
      const venta = toNumber(text);
      if (!Number.isNaN(base) && base > 0 && !Number.isNaN(venta)) {
        next.margen_ganancia = round2((venta / base - 1) * 100);
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, precio_venta: undefined }));
  };

  const handleSave = () => {
    const found: typeof errors = {};
    const base = toNumber(values.precio_base);
    const venta = toNumber(values.precio_venta);
    const margen = toNumber(values.margen_ganancia || "0");
    const stock = toNumber(values.stock || "0");
    const minimo = toNumber(values.stock_minimo || "0");

    if (!values.codigo.trim()) found.codigo = "Ingresá un código";
    if (!values.descripcion.trim()) found.descripcion = "Ingresá el nombre del producto";
    if (Number.isNaN(base) || base < 0) found.precio_base = "Ingresá el precio de costo";
    if (Number.isNaN(venta) || venta <= 0) found.precio_venta = "Debe ser mayor a 0";
    if (Number.isNaN(margen)) found.margen_ganancia = "Número inválido";
    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock))
      found.stock = "Entero, 0 o más";
    if (Number.isNaN(minimo) || minimo < 0 || !Number.isInteger(minimo))
      found.stock_minimo = "Entero, 0 o más";

    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    submit(async () => {
      await createProduct({
        codigo: values.codigo.trim(),
        descripcion: values.descripcion.trim(),
        categoria_id: values.categoria_id ? Number(values.categoria_id) : null,
        precio_base: base,
        precio_venta: venta,
        margen_ganancia: margen,
        stock,
        stock_minimo: minimo,
        activo: true,
      });
      onSuccess();
      onClose();
    });
  };

  return (
    <FormModal
      visible={visible}
      title="Nuevo producto"
      subtitle="Se suma al catálogo y al stock"
      icon={Lamp}
      submitText="Crear producto"
      submitting={submitting}
      error={serverError}
      onClose={onClose}
      onSubmit={handleSave}
    >
      <FieldRow>
        <Field
          label="Código"
          required
          value={values.codigo}
          onChangeText={set("codigo")}
          placeholder="Ej: LAM-001"
          autoCapitalize="characters"
          error={errors.codigo}
        />
        <Field
          label="Nombre"
          required
          value={values.descripcion}
          onChangeText={set("descripcion")}
          placeholder="Ej: Lámpara LED 9W"
          error={errors.descripcion}
        />
      </FieldRow>

      <ChipSelect
        label="Categoría"
        options={categoryOptions}
        value={values.categoria_id}
        onChange={set("categoria_id")}
      />

      <Section title="Precios" />
      <FieldRow>
        <Field
          label="Costo"
          required
          value={values.precio_base}
          onChangeText={onBaseOrMargin("precio_base")}
          keyboardType="decimal-pad"
          prefix="$"
          error={errors.precio_base}
        />
        <Field
          label="Margen"
          value={values.margen_ganancia}
          onChangeText={onBaseOrMargin("margen_ganancia")}
          keyboardType="decimal-pad"
          suffix="%"
          error={errors.margen_ganancia}
        />
      </FieldRow>
      <Field
        label="Precio de venta"
        required
        value={values.precio_venta}
        onChangeText={onSalePrice}
        keyboardType="decimal-pad"
        prefix="$"
        hint="Se calcula con el costo y el margen, pero podés escribirlo vos."
        error={errors.precio_venta}
      />

      <Section title="Stock" />
      <FieldRow>
        <Field
          label="Stock inicial"
          value={values.stock}
          onChangeText={set("stock")}
          keyboardType="number-pad"
          error={errors.stock}
        />
        <Field
          label="Stock mínimo"
          value={values.stock_minimo}
          onChangeText={set("stock_minimo")}
          keyboardType="number-pad"
          hint="Avisa cuando queda poco"
          error={errors.stock_minimo}
        />
      </FieldRow>
    </FormModal>
  );
}
