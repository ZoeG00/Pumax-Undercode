/** Importe con formato argentino: 1250 -> "1.250,00" */
export const money = (n: number) =>
  Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
