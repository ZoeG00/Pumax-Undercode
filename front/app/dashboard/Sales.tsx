import { Redirect } from "expo-router";

/** Ahora vive como pestaña dentro de "Movimiento de stock". Se deja para no romper enlaces viejos. */
export default function Sales() {
  return <Redirect href={{ pathname: "/dashboard/Stock", params: { tab: "ventas" } }} />;
}
