/**
 * Colores de marca Pumax.
 * Para clases de NativeWind usá los tokens de tailwind.config.js (brand-*, wine-*);
 * estos valores sirven para props que no aceptan className (íconos, spinners, etc.).
 */
export const colors = {
  brand: "#0b6623", // verde del logo
  brandLight: "#45bd66", // verde legible sobre fondos oscuros (íconos, acentos)
  wine: "#ae2151", // bordó del logo
  wineLight: "#e0507d", // bordó legible sobre fondos oscuros
  muted: "#9ca3af",
  danger: "#ef4444",
  success: "#10b981",
  warning: "#f59e0b",
  white: "#ffffff",
} as const;

export type ThemeColor = keyof typeof colors;
