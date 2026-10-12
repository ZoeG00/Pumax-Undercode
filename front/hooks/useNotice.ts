import { useCallback, useEffect, useRef, useState } from "react";

export type Notice = { kind: "success" | "error" | "info"; text: string };

/**
 * Avisos dentro de la pantalla que se ocultan solos.
 * Reemplaza a Alert.alert, que no muestra nada en la versión web/PWA.
 */
export function useNotice(durationMs = 4000) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const showNotice = useCallback(
    (kind: Notice["kind"], text: string) => {
      setNotice({ kind, text });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setNotice(null), durationMs);
    },
    [durationMs]
  );

  return { notice, showNotice, clearNotice: () => setNotice(null) };
}
