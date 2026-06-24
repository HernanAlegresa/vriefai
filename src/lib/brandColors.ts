const BRAND_COLORS = [
  "#4f7eff",
  "#9747ff",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#f97316",
] as const;

export function getBrandColor(name: string): string {
  const hash = name
    .trim()
    .toLowerCase()
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return BRAND_COLORS[hash % BRAND_COLORS.length];
}

export function getBrandInitial(name: string): string {
  return name.trim()[0]?.toUpperCase() ?? "V";
}
