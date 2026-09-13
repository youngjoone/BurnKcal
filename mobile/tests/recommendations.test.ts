import assert from "node:assert/strict";
import test from "node:test";
import { recipeKcal } from "../src/data/recipes";
import {
  recommendMeals,
  DEFAULT_PREFERENCES,
} from "../src/domain/recommendations";
test("fits a meal into available calories when possible", () => {
  const result = recommendMeals(480, DEFAULT_PREFERENCES);
  assert.equal(result.relaxed, false);
  assert.ok(result.recipes.length);
  assert.ok(result.recipes.every((r) => recipeKcal(r) <= 480));
});
test("does not prescribe a tiny dinner or fasting after a low remainder", () => {
  for (const remaining of [200, 0, -800]) {
    const result = recommendMeals(remaining, DEFAULT_PREFERENCES);
    assert.equal(result.relaxed, true);
    assert.ok(result.recipes.every((r) => recipeKcal(r) >= 400));
  }
});
test("never bypasses allergen, ingredient or cooking time exclusions", () => {
  const result = recommendMeals(600, {
    allergens: ["달걀", "대두", "생선"],
    excludedIngredients: "병아리콩",
    maxMinutes: 15,
  });
  assert.equal(result.recipes.length, 0);
  const quick = recommendMeals(600, { ...DEFAULT_PREFERENCES, maxMinutes: 15 });
  assert.ok(quick.recipes.every((r) => r.minutes <= 15));
});
