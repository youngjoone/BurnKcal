export type AnalysisMode = "demo" | "ai";

export type AnalysisResult = {
  mode: AnalysisMode;
  title: string;
  totalKcal: number;
  range: { min: number; max: number };
  items: { name: string; portion: string; kcal: number }[];
  notices: string[];
};

export type MealPhoto = { uri: string; width: number; height: number };

export function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const kcal = (n: unknown): n is number =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
  const range = v.range as AnalysisResult["range"] | undefined;
  return (
    (v.mode === "demo" || v.mode === "ai") &&
    typeof v.title === "string" &&
    kcal(v.totalKcal) &&
    !!range &&
    kcal(range.min) &&
    kcal(range.max) &&
    range.min <= v.totalKcal &&
    v.totalKcal <= range.max &&
    Array.isArray(v.items) &&
    v.items.length > 0 &&
    v.items.every(
      (item) =>
        item &&
        typeof item.name === "string" &&
        typeof item.portion === "string" &&
        kcal(item.kcal),
    ) &&
    v.items.reduce((sum, item) => sum + item.kcal, 0) === v.totalKcal &&
    Array.isArray(v.notices) &&
    v.notices.every((notice) => typeof notice === "string")
  );
}
