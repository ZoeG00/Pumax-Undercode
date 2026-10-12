import { Redirect } from "expo-router";

/** Pantalla anterior: ahora todo vive en "Mi cuenta". Se deja para no romper enlaces viejos. */
export default function EmployeeProfile() {
  return <Redirect href="/dashboard/Users" />;
}
