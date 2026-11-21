/** Utilitários de formatação. */

export const brl = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export const dataBR = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
};