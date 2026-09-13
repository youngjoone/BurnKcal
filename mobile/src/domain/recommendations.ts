import { ALLERGENS, Allergen, RECIPES, recipeKcal } from "../data/recipes";
export type Preferences = {
  allergens: Allergen[];
  excludedIngredients: string;
  maxMinutes: number;
};
export const DEFAULT_PREFERENCES: Preferences = {
  allergens: [],
  excludedIngredients: "",
  maxMinutes: 30,
};
export function validatePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object")
    throw new Error("추천 설정을 확인해 주세요.");
  const p = value as Preferences;
  if (
    !Array.isArray(p.allergens) ||
    p.allergens.some((a) => !ALLERGENS.includes(a)) ||
    typeof p.excludedIngredients !== "string" ||
    p.excludedIngredients.length > 200 ||
    ![15, 30, 60].includes(p.maxMinutes)
  )
    throw new Error("추천 설정을 확인해 주세요.");
  return {
    allergens: [...new Set(p.allergens)],
    excludedIngredients: p.excludedIngredients.trim(),
    maxMinutes: p.maxMinutes,
  };
}
export function recommendMeals(remaining: number, preferences: Preferences) {
  if (!Number.isFinite(remaining))
    throw new Error("남은 칼로리를 확인할 수 없어요.");
  const p = validatePreferences(preferences);
  const excluded = p.excludedIngredients
    .split(/[,，\n]/)
    .map((x) => x.trim().replaceAll(" ", "").toLowerCase())
    .filter(Boolean);
  const allowed = RECIPES.filter(
    (recipe) =>
      recipe.minutes <= p.maxMinutes &&
      !recipe.allergens.some((a) => p.allergens.includes(a)) &&
      !excluded.some((word) =>
        `${recipe.name} ${recipe.ingredients.map((i) => i.name).join(" ")}`
          .replaceAll(" ", "")
          .toLowerCase()
          .includes(word),
      ),
  );
  const mealBudget = Math.min(remaining, 700);
  const fits = allowed.filter((recipe) => recipeKcal(recipe) <= mealBudget);
  // Never shrink a normal meal to an arbitrarily tiny calorie remainder.
  const relaxed = remaining < 400 || !fits.length;
  const target = relaxed ? 500 : mealBudget;
  const recipes = [...(relaxed ? allowed : fits)]
    .sort(
      (a, b) =>
        Math.abs(recipeKcal(a) - target) - Math.abs(recipeKcal(b) - target),
    )
    .slice(0, 3);
  const notice = !recipes.length
    ? "선택한 제외 재료와 조리 시간에 맞는 레시피가 없어요. 조건을 무시한 추천은 하지 않아요."
    : relaxed
      ? "남은 칼로리에 억지로 맞춰 끼니를 줄이지 않아요. 참고량을 넘을 수 있는 일반적인 한 끼를 보여드려요."
      : "남은 칼로리 안에서 다음 한 끼 후보를 골랐어요. 하루 남은 양을 한 번에 모두 먹으라는 뜻은 아니에요.";
  return { recipes, notice, relaxed };
}
