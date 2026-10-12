import { api } from "./api.service";
import type { Account, UpdateAccountData } from "../types/account.types";

/** Cuenta del usuario logueado (sirve para cualquier rol) */
export async function getMyAccount(): Promise<Account> {
  const res = await api.get<{ success: boolean; data: Account }>("/usuarios/me");
  return res.data;
}

/** Edita los datos personales propios */
export async function updateMyAccount(data: UpdateAccountData): Promise<Account> {
  const res = await api.put<{ success: boolean; data: Account }>("/usuarios/me", data);
  return res.data;
}

/** Cambia la contraseña propia; el back verifica la actual */
export async function changeMyPassword(passwordActual: string, passwordNueva: string): Promise<void> {
  await api.put("/usuarios/me/password", {
    password_actual: passwordActual,
    password_nueva: passwordNueva,
  });
}
