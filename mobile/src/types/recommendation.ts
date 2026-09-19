import { AIRecipe, ALLERGENS } from "../data/recipes";
import { Preferences, validatePreferences } from "../domain/recommendations";
export type RecommendationRequest = {
  dailyTargetKcal: number;
  remainingKcal: number;
  preferences: Preferences;
  avoidNames: string[];
};
export type RecommendationResult = {
  mode: "ai";
  recipes: AIRecipe[];
  notice: string;
};
const nonempty = (value: unknown, max: number): value is string =>
  typeof value === "string" && !!value.trim() && value.length <= max;
const finite = (value: unknown, max: number): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= max;
export function parseRecommendationResult(
  value: unknown,
  request: RecommendationRequest,
): RecommendationResult {
  const fail = () =>
    new Error(
      "추천 결과의 영양정보나 제외 재료를 확인하지 못했어요. 다시 추천받아 주세요.",
    );
  if (!value || typeof value !== "object") throw fail();
  const r = value as RecommendationResult;
  const p = validatePreferences(request.preferences);
  const maxKcal =
    request.remainingKcal < 400 ? 650 : Math.min(request.remainingKcal, 700);
  const excluded = p.excludedIngredients
    .split(/[,，\n]/)
    .map((word) => word.trim().replaceAll(" ", "").toLowerCase())
    .filter(Boolean);
  if (
    r.mode !== "ai" ||
    !nonempty(r.notice, 500) ||
    !Array.isArray(r.recipes) ||
    !r.recipes.length ||
    r.recipes.length > 3
  )
    throw fail();
  const ids = new Set<string>();
  for (const recipe of r.recipes) {
    if (
      !recipe ||
      recipe.source !== "ai" ||
      !nonempty(recipe.id, 100) ||
      ids.has(recipe.id) ||
      !nonempty(recipe.name, 100) ||
      !Number.isInteger(recipe.minutes) ||
      recipe.minutes < 1 ||
      recipe.minutes > p.maxMinutes ||
      !Array.isArray(recipe.allergens) ||
      recipe.allergens.length > 10 ||
      recipe.allergens.some(
        (a) => !ALLERGENS.includes(a) || p.allergens.includes(a),
      ) ||
      !Array.isArray(recipe.ingredients) ||
      !recipe.ingredients.length ||
      recipe.ingredients.length > 20 ||
      recipe.ingredients.some(
        (i) => !i || !nonempty(i.name, 100) || !nonempty(i.amount, 100),
      ) ||
      !Array.isArray(recipe.steps) ||
      !recipe.steps.length ||
      recipe.steps.length > 8 ||
      recipe.steps.some((s) => !nonempty(s, 500))
    )
      throw fail();
    const n = recipe.nutrition;
    if (
      !n ||
      !Number.isInteger(n.kcal) ||
      n.kcal < 400 ||
      n.kcal > maxKcal ||
      !finite(n.proteinG, 150) ||
      !finite(n.carbsG, 200) ||
      !finite(n.fatG, 100) ||
      Math.abs(n.proteinG * 4 + n.carbsG * 4 + n.fatG * 9 - n.kcal) >
        Math.max(80, n.kcal * 0.2)
    )
      throw fail();
    const text = [
      recipe.name,
      ...recipe.ingredients.map((i) => i.name),
      ...recipe.steps,
    ]
      .join(" ")
      .replaceAll(" ", "")
      .toLowerCase();
    if (excluded.some((word) => text.includes(word))) throw fail();
    ids.add(recipe.id);
  }
  return r;
}
