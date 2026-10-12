import { Redirect } from "expo-router";

/** Ahora vive como pestaña dentro de "Movimiento de stock". Se deja para no romper enlaces viejos. */
export default function Buys() {
  return <Redirect href={{ pathname: "/dashboard/Stock", params: { tab: "compras" } }} />;
}
