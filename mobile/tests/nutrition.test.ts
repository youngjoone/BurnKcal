import assert from "node:assert/strict";
import test from "node:test";
import {
  RECIPES,
  recipeKcal,
  recipeNutrition,
  Recipe,
} from "../src/data/recipes";
import { NUTRIENT_FOODS } from "../src/data/nutrients";

test("recipe nutrients scale edible grams and round only after summing", () => {
  const sample: Recipe = {
    source: "catalog",
    id: "portion-test",
    name: "검증용",
    minutes: 1,
    allergens: [],
    steps: [],
    ingredients: [
      { name: "익힌 밥", amount: "150g", foodId: "rice", grams: 150 },
      { name: "익힌 닭가슴살", amount: "100g", foodId: "chicken", grams: 100 },
      { name: "기름", amount: "5g", foodId: "canolaOil", grams: 5 },
    ],
  };
  assert.deepEqual(recipeNutrition(sample), {
    kcal: 404,
    proteinG: 34.6,
    carbsG: 43.1,
    fatG: 8.9,
  });
  const half = {
    ...sample,
    ingredients: sample.ingredients.map((item) => ({
      ...item,
      grams: item.grams / 2,
    })),
  };
  assert.deepEqual(recipeNutrition(half), {
    kcal: 202,
    proteinG: 17.3,
    carbsG: 21.5,
    fatG: 4.4,
  });
});

test("every recipe uses traceable ingredients and a consistent recommendation calorie total", () => {
  for (const recipe of RECIPES) {
    for (const ingredient of recipe.ingredients) {
      assert.ok(ingredient.grams > 0);
      const food = NUTRIENT_FOODS[ingredient.foodId];
      assert.ok(Number.isInteger(food.fdcId));
      assert.ok(
        Object.values(food.per100g).every(
          (value) => Number.isFinite(value) && value >= 0,
        ),
      );
    }
    const nutrition = recipeNutrition(recipe);
    assert.equal(recipeKcal(recipe), nutrition.kcal);
    assert.ok(
      nutrition.proteinG > 0 && nutrition.carbsG > 0 && nutrition.fatG > 0,
    );
  }
});
