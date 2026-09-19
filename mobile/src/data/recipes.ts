import { NUTRIENT_FOODS, NutrientFoodId } from "./nutrients";
export const ALLERGENS = [
  "달걀",
  "우유",
  "대두",
  "밀",
  "생선",
  "갑각류",
  "조개류",
  "땅콩",
  "견과류",
  "참깨",
] as const;
export type Allergen = (typeof ALLERGENS)[number];
type RecipeBase = {
  id: string;
  name: string;
  minutes: number;
  allergens: Allergen[];
  steps: string[];
};
export type CatalogRecipe = RecipeBase & {
  source: "catalog";
  ingredients: {
    name: string;
    amount: string;
    foodId: NutrientFoodId;
    grams: number;
  }[];
};
export type AIRecipe = RecipeBase & {
  source: "ai";
  ingredients: { name: string; amount: string }[];
  nutrition: RecipeNutrition;
};
export type Recipe = CatalogRecipe | AIRecipe;
// One serving; nutrient estimates scale USDA reference foods by edible ingredient weight.
export const RECIPES: CatalogRecipe[] = [
  {
    source: "catalog",
    id: "chicken-rice",
    name: "닭고기 채소 덮밥",
    minutes: 20,
    allergens: ["대두", "밀"],
    ingredients: [
      { name: "밥", amount: "150g (익힌 밥)", foodId: "rice", grams: 150 },
      { name: "익힌 닭가슴살", amount: "100g", foodId: "chicken", grams: 100 },
      { name: "브로콜리", amount: "50g", foodId: "broccoli", grams: 50 },
      { name: "당근", amount: "50g", foodId: "carrot", grams: 50 },
      { name: "카놀라유", amount: "5g", foodId: "canolaOil", grams: 5 },
      { name: "간장", amount: "5g", foodId: "soySauce", grams: 5 },
    ],
    steps: [
      "닭가슴살과 채소를 먹기 좋은 크기로 썰어요.",
      "팬에 기름을 두르고 채소를 볶다가 익힌 닭가슴살을 넣어 속까지 뜨겁게 데워요.",
      "간장으로 간을 맞추고 밥 위에 올려요.",
    ],
  },
  {
    source: "catalog",
    id: "tofu-rice",
    name: "두부 버섯 덮밥",
    minutes: 15,
    allergens: ["대두", "밀"],
    ingredients: [
      { name: "밥", amount: "150g (익힌 밥)", foodId: "rice", grams: 150 },
      { name: "두부", amount: "160g", foodId: "tofu", grams: 160 },
      { name: "양송이버섯", amount: "100g", foodId: "mushroom", grams: 100 },
      { name: "당근", amount: "50g", foodId: "carrot", grams: 50 },
      { name: "카놀라유", amount: "5g", foodId: "canolaOil", grams: 5 },
      { name: "간장", amount: "5g", foodId: "soySauce", grams: 5 },
    ],
    steps: [
      "두부는 물기를 빼서 썰고 버섯과 당근을 손질해요.",
      "기름을 두른 팬에서 두부를 굽고 채소를 넣어 익혀요.",
      "간장과 물 한 숟가락으로 간을 맞춘 뒤 밥에 올려요.",
    ],
  },
  {
    source: "catalog",
    id: "egg-rice",
    name: "달걀 채소 볶음밥",
    minutes: 15,
    allergens: ["달걀"],
    ingredients: [
      { name: "밥", amount: "150g (익힌 밥)", foodId: "rice", grams: 150 },
      {
        name: "달걀",
        amount: "2개 (껍질 제외 100g)",
        foodId: "egg",
        grams: 100,
      },
      { name: "당근", amount: "50g", foodId: "carrot", grams: 50 },
      { name: "주키니 호박", amount: "50g", foodId: "zucchini", grams: 50 },
      { name: "양파", amount: "50g", foodId: "onion", grams: 50 },
      { name: "카놀라유", amount: "5g", foodId: "canolaOil", grams: 5 },
      { name: "소금", amount: "1g", foodId: "salt", grams: 1 },
    ],
    steps: [
      "채소를 잘게 썰어 기름을 두른 팬에서 볶아요.",
      "달걀을 넣고 흰자와 노른자가 모두 굳을 때까지 익혀요.",
      "밥을 넣어 고루 볶고 소금으로 간을 해요.",
    ],
  },
  {
    source: "catalog",
    id: "tuna-rice",
    name: "참치 오이 비빔밥",
    minutes: 10,
    allergens: ["생선", "참깨"],
    ingredients: [
      { name: "밥", amount: "150g (익힌 밥)", foodId: "rice", grams: 150 },
      {
        name: "무염 물참치 통조림",
        amount: "물 뺀 100g",
        foodId: "tuna",
        grams: 100,
      },
      { name: "오이", amount: "100g", foodId: "cucumber", grams: 100 },
      { name: "당근", amount: "50g", foodId: "carrot", grams: 50 },
      { name: "참기름", amount: "5g", foodId: "sesameOil", grams: 5 },
      { name: "깨", amount: "2g", foodId: "sesame", grams: 2 },
      { name: "소금", amount: "1g", foodId: "salt", grams: 1 },
    ],
    steps: [
      "참치의 물기를 빼고 오이와 당근을 가늘게 썰어요.",
      "밥 위에 참치와 채소를 담아요.",
      "참기름, 깨, 소금을 넣고 비벼요.",
    ],
  },
  {
    source: "catalog",
    id: "chickpea-bowl",
    name: "병아리콩 채소 볼",
    minutes: 10,
    allergens: [],
    ingredients: [
      { name: "삶은 병아리콩", amount: "150g", foodId: "chickpea", grams: 150 },
      { name: "밥", amount: "100g (익힌 밥)", foodId: "rice", grams: 100 },
      { name: "토마토", amount: "75g", foodId: "tomato", grams: 75 },
      { name: "오이", amount: "75g", foodId: "cucumber", grams: 75 },
      { name: "올리브유", amount: "5g", foodId: "oliveOil", grams: 5 },
      { name: "레몬즙", amount: "10g", foodId: "lemon", grams: 10 },
    ],
    steps: [
      "익혀진 병아리콩을 준비하고 채소를 깨끗이 씻어 썰어요.",
      "밥과 콩, 채소를 그릇에 담아요.",
      "올리브유와 레몬즙을 섞어 곁들여요.",
    ],
  },
  {
    source: "catalog",
    id: "salmon-bowl",
    name: "연어 브로콜리 밥",
    minutes: 25,
    allergens: ["생선"],
    ingredients: [
      { name: "밥", amount: "150g (익힌 밥)", foodId: "rice", grams: 150 },
      { name: "연어", amount: "120g (조리 전)", foodId: "salmon", grams: 120 },
      { name: "브로콜리", amount: "100g", foodId: "broccoli", grams: 100 },
      { name: "올리브유", amount: "5g", foodId: "oliveOil", grams: 5 },
      { name: "레몬즙", amount: "10g", foodId: "lemon", grams: 10 },
    ],
    steps: [
      "브로콜리를 먹기 좋게 썰어 찌거나 데쳐요.",
      "팬에 기름을 두르고 연어를 중심까지 충분히 익혀요.",
      "밥, 연어, 브로콜리를 함께 담고 레몬즙을 곁들여요.",
    ],
  },
];
export type RecipeNutrition = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};
export function recipeNutrition(recipe: Recipe): RecipeNutrition {
  if (recipe.source === "ai") return recipe.nutrition;
  const totals = recipe.ingredients.reduce(
    (sum, item) => {
      const food = NUTRIENT_FOODS[item.foodId].per100g;
      const factor = item.grams / 100;
      return {
        kcal: sum.kcal + food.kcal * factor,
        proteinG: sum.proteinG + food.proteinG * factor,
        carbsG: sum.carbsG + food.carbsG * factor,
        fatG: sum.fatG + food.fatG * factor,
      };
    },
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
  return {
    kcal: Math.round(totals.kcal),
    proteinG: Math.round(totals.proteinG * 10) / 10,
    carbsG: Math.round(totals.carbsG * 10) / 10,
    fatG: Math.round(totals.fatG * 10) / 10,
  };
}
export function recipeKcal(recipe: Recipe) {
  return recipeNutrition(recipe).kcal;
}
