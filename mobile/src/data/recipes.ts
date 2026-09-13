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
export type Recipe = {
  id: string;
  name: string;
  minutes: number;
  allergens: Allergen[];
  ingredients: { name: string; amount: string; kcal: number }[];
  steps: string[];
};
// One adult meal serving. Ingredient calories are rounded estimates, not a verified nutrient database.
export const RECIPES: Recipe[] = [
  {
    id: "chicken-rice",
    name: "닭고기 채소 덮밥",
    minutes: 20,
    allergens: ["대두", "밀"],
    ingredients: [
      { name: "밥", amount: "150g", kcal: 225 },
      { name: "닭가슴살", amount: "100g", kcal: 165 },
      { name: "브로콜리·당근", amount: "100g", kcal: 35 },
      { name: "식용유", amount: "5g", kcal: 45 },
      { name: "간장", amount: "5g", kcal: 5 },
    ],
    steps: [
      "닭가슴살과 채소를 먹기 좋은 크기로 썰어요.",
      "팬에 기름을 두르고 닭고기를 익힌 뒤 채소를 넣어요. 닭고기 중심까지 충분히 익혀요.",
      "간장으로 간을 맞추고 밥 위에 올려요.",
    ],
  },
  {
    id: "tofu-rice",
    name: "두부 버섯 덮밥",
    minutes: 15,
    allergens: ["대두", "밀"],
    ingredients: [
      { name: "밥", amount: "150g", kcal: 225 },
      { name: "두부", amount: "150g", kcal: 120 },
      { name: "버섯", amount: "100g", kcal: 25 },
      { name: "당근", amount: "50g", kcal: 20 },
      { name: "식용유", amount: "5g", kcal: 45 },
      { name: "간장", amount: "5g", kcal: 5 },
    ],
    steps: [
      "두부는 물기를 빼서 썰고 버섯과 당근을 손질해요.",
      "기름을 두른 팬에서 두부를 굽고 채소를 넣어 익혀요.",
      "간장과 물 한 숟가락으로 간을 맞춘 뒤 밥에 올려요.",
    ],
  },
  {
    id: "egg-rice",
    name: "달걀 채소 볶음밥",
    minutes: 15,
    allergens: ["달걀"],
    ingredients: [
      { name: "밥", amount: "150g", kcal: 225 },
      { name: "달걀", amount: "2개", kcal: 140 },
      { name: "당근·애호박·양파", amount: "150g", kcal: 55 },
      { name: "식용유", amount: "5g", kcal: 45 },
      { name: "소금", amount: "약간", kcal: 0 },
    ],
    steps: [
      "채소를 잘게 썰어 기름을 두른 팬에서 볶아요.",
      "달걀을 넣고 흰자와 노른자가 모두 굳을 때까지 익혀요.",
      "밥을 넣어 고루 볶고 소금으로 간을 해요.",
    ],
  },
  {
    id: "tuna-rice",
    name: "참치 오이 비빔밥",
    minutes: 10,
    allergens: ["생선", "참깨"],
    ingredients: [
      { name: "밥", amount: "150g", kcal: 225 },
      { name: "물에 담긴 참치 통조림", amount: "물 뺀 100g", kcal: 115 },
      { name: "오이", amount: "100g", kcal: 15 },
      { name: "당근", amount: "50g", kcal: 20 },
      { name: "참기름", amount: "5g", kcal: 45 },
      { name: "깨", amount: "2g", kcal: 12 },
      { name: "소금", amount: "약간", kcal: 0 },
    ],
    steps: [
      "참치의 물기를 빼고 오이와 당근을 가늘게 썰어요.",
      "밥 위에 참치와 채소를 담아요.",
      "참기름, 깨, 소금을 넣고 비벼요.",
    ],
  },
  {
    id: "chickpea-bowl",
    name: "병아리콩 채소 볼",
    minutes: 10,
    allergens: [],
    ingredients: [
      { name: "삶은 병아리콩", amount: "150g", kcal: 245 },
      { name: "밥", amount: "100g", kcal: 150 },
      { name: "토마토·오이", amount: "150g", kcal: 30 },
      { name: "올리브유", amount: "5g", kcal: 45 },
      { name: "레몬즙", amount: "10g", kcal: 3 },
    ],
    steps: [
      "익혀진 병아리콩을 준비하고 채소를 깨끗이 씻어 썰어요.",
      "밥과 콩, 채소를 그릇에 담아요.",
      "올리브유와 레몬즙을 섞어 곁들여요.",
    ],
  },
  {
    id: "salmon-bowl",
    name: "연어 브로콜리 밥",
    minutes: 25,
    allergens: ["생선"],
    ingredients: [
      { name: "밥", amount: "150g", kcal: 225 },
      { name: "연어", amount: "120g", kcal: 250 },
      { name: "브로콜리", amount: "100g", kcal: 35 },
      { name: "올리브유", amount: "5g", kcal: 45 },
      { name: "레몬즙", amount: "10g", kcal: 3 },
    ],
    steps: [
      "브로콜리를 먹기 좋게 썰어 찌거나 데쳐요.",
      "팬에 기름을 두르고 연어를 중심까지 충분히 익혀요.",
      "밥, 연어, 브로콜리를 함께 담고 레몬즙을 곁들여요.",
    ],
  },
];
export function recipeKcal(recipe: Recipe) {
  return recipe.ingredients.reduce((sum, item) => sum + item.kcal, 0);
}
