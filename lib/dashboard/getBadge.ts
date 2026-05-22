export function getBadge(
  stock: number,
): { label: string; type: "warning" | "success" } | null {
  if (stock === 0) return { label: "Habis", type: "warning" };
  if (stock <= 5) return { label: `Sisa ${stock}`, type: "warning" };
  return null;
}
