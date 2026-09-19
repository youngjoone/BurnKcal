import assert from "node:assert/strict";
import test from "node:test";
import {
  parseRecommendationResult,
  RecommendationRequest,
  RecommendationResult,
} from "../src/types/recommendation";
const request: RecommendationRequest = {
  dailyTargetKcal: 1650,
  remainingKcal: 600,
  preferences: { allergens: [], excludedIngredients: "", maxMinutes: 30 },
  avoidNames: [],
};
const result: RecommendationResult = {
  mode: "ai",
  notice: "AI 추천",
  recipes: [
    {
      id: "test-recipe",
      source: "ai",
      name: "닭고기 밥",
      minutes: 20,
      allergens: [],
      ingredients: [{ name: "닭고기", amount: "100g" }],
      steps: ["충분히 익혀요."],
      nutrition: { kcal: 500, proteinG: 35, carbsG: 55, fatG: 16 },
    },
  ],
};
test("AI recommendation contract keeps nutrition and source", () => {
  assert.equal(
    parseRecommendationResult(result, request).recipes[0].nutrition.proteinG,
    35,
  );
});
test("rejects incomplete, negative, inconsistent or over-budget recipe nutrition", () => {
  for (const bad of [
    null,
    {},
    { ...result, mode: "demo" },
    { ...result, recipes: [] },
    { ...result, recipes: [result.recipes[0], result.recipes[0]] },
  ])
    assert.throws(() => parseRecommendationResult(bad, request));
  for (const nutrition of [
    undefined,
    { kcal: 500, proteinG: -1, carbsG: 50, fatG: 10 },
    { kcal: 900, proteinG: 35, carbsG: 55, fatG: 16 },
    { kcal: 500, proteinG: 35, carbsG: 55, fatG: 90 },
  ]) {
    assert.throws(() =>
      parseRecommendationResult(
        { ...result, recipes: [{ ...result.recipes[0], nutrition }] },
        request,
      ),
    );
  }
});
test("rejects an excluded ingredient and declared allergen instead of showing a stale unsafe recommendation", () => {
  assert.throws(() =>
    parseRecommendationResult(result, {
      ...request,
      preferences: { ...request.preferences, excludedIngredients: "닭고기" },
    }),
  );
  assert.throws(() =>
    parseRecommendationResult(
      { ...result, recipes: [{ ...result.recipes[0], allergens: ["대두"] }] },
      {
        ...request,
        preferences: { ...request.preferences, allergens: ["대두"] },
      },
    ),
  );
  assert.throws(() =>
    parseRecommendationResult(result, {
      ...request,
      preferences: { ...request.preferences, maxMinutes: 15 },
    }),
  );
});
