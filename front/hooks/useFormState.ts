import { useCallback, useEffect, useState } from "react";

/**
 * Estado de un formulario: valores (siempre texto), errores por campo
 * y reinicio automático cada vez que el modal se vuelve a abrir.
 */
export function useFormState<T extends Record<string, string>>(initial: T, open: boolean) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initial);
      setErrors({}); 
      setServerError(null);
      setSubmitting(false);
    }
    // `initial` es una constante definida fuera del componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /** set("campo")(texto) -> actualiza el valor y limpia su error */
  const set = useCallback(
    (key: keyof T) => (value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  /** Ejecuta el guardado mostrando el error del servidor si falla */
  const submit = async (action: () => Promise<void>) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await action();
    } catch (err) {
      setServerError(
        err instanceof Error && err.message ? err.message : "No se pudo guardar. Intentá de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return { values, setValues, errors, setErrors, set, submitting, serverError, submit };
}

/** Número desde un texto escrito por una persona ("1.250,50" o "1250.50") */
export function toNumber(text: string): number {
  const clean = text.trim().replace(/\s/g, "");
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : NaN;
}
