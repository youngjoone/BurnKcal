// USDA FoodData Central, SR Legacy (April 2018), accessed 2026-09-15.
// Nutrient IDs: energy 1008, protein 1003, carbohydrate 1005, fat 1004.
// See docs/RECIPE_NUTRITION.md for preparation assumptions and source IDs.
export const NUTRIENT_FOODS = {
  rice: {
    fdcId: 168882,
    description: "Rice, white, short-grain, enriched, cooked",
    per100g: {
      carbsG: 28.73,
      kcal: 130.0,
      fatG: 0.19,
      proteinG: 2.36,
    },
  },
  chicken: {
    fdcId: 171477,
    description:
      "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
    per100g: {
      fatG: 3.57,
      carbsG: 0.0,
      kcal: 165.0,
      proteinG: 31.02,
    },
  },
  tofu: {
    fdcId: 172476,
    description: "Tofu, raw, regular, prepared with calcium sulfate",
    per100g: {
      carbsG: 1.87,
      fatG: 4.78,
      kcal: 76.0,
      proteinG: 8.08,
    },
  },
  egg: {
    fdcId: 171287,
    description: "Egg, whole, raw, fresh",
    per100g: {
      kcal: 143.0,
      proteinG: 12.56,
      fatG: 9.51,
      carbsG: 0.72,
    },
  },
  tuna: {
    fdcId: 171986,
    description:
      "Fish, tuna, light, canned in water, without salt, drained solids",
    per100g: {
      proteinG: 25.51,
      fatG: 0.82,
      kcal: 116.0,
      carbsG: 0.0,
    },
  },
  salmon: {
    fdcId: 175167,
    description: "Fish, salmon, Atlantic, farmed, raw",
    per100g: {
      kcal: 208.0,
      fatG: 13.42,
      proteinG: 20.42,
      carbsG: 0.0,
    },
  },
  chickpea: {
    fdcId: 173757,
    description:
      "Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt",
    per100g: {
      carbsG: 27.42,
      kcal: 164.0,
      fatG: 2.59,
      proteinG: 8.86,
    },
  },
  broccoli: {
    fdcId: 170379,
    description: "Broccoli, raw",
    per100g: {
      carbsG: 6.64,
      kcal: 34.0,
      fatG: 0.37,
      proteinG: 2.82,
    },
  },
  carrot: {
    fdcId: 170393,
    description: "Carrots, raw",
    per100g: {
      proteinG: 0.93,
      fatG: 0.24,
      carbsG: 9.58,
      kcal: 41.0,
    },
  },
  zucchini: {
    fdcId: 169291,
    description: "Squash, summer, zucchini, includes skin, raw",
    per100g: {
      fatG: 0.32,
      carbsG: 3.11,
      kcal: 17.0,
      proteinG: 1.21,
    },
  },
  onion: {
    fdcId: 170000,
    description: "Onions, raw",
    per100g: {
      fatG: 0.1,
      carbsG: 9.34,
      kcal: 40.0,
      proteinG: 1.1,
    },
  },
  mushroom: {
    fdcId: 169251,
    description: "Mushrooms, white, raw",
    per100g: {
      fatG: 0.34,
      proteinG: 3.09,
      carbsG: 3.26,
      kcal: 22.0,
    },
  },
  cucumber: {
    fdcId: 168409,
    description: "Cucumber, with peel, raw",
    per100g: {
      carbsG: 3.63,
      kcal: 15.0,
      fatG: 0.11,
      proteinG: 0.65,
    },
  },
  tomato: {
    fdcId: 170457,
    description: "Tomatoes, red, ripe, raw, year round average",
    per100g: {
      carbsG: 3.89,
      kcal: 18.0,
      fatG: 0.2,
      proteinG: 0.88,
    },
  },
  canolaOil: {
    fdcId: 172336,
    description: "Oil, canola",
    per100g: {
      fatG: 100.0,
      proteinG: 0.0,
      carbsG: 0.0,
      kcal: 884.0,
    },
  },
  sesameOil: {
    fdcId: 171016,
    description: "Oil, sesame, salad or cooking",
    per100g: {
      proteinG: 0.0,
      fatG: 100.0,
      carbsG: 0.0,
      kcal: 884.0,
    },
  },
  oliveOil: {
    fdcId: 171413,
    description: "Oil, olive, salad or cooking",
    per100g: {
      fatG: 100.0,
      carbsG: 0.0,
      kcal: 884.0,
      proteinG: 0.0,
    },
  },
  soySauce: {
    fdcId: 174277,
    description: "Soy sauce made from soy and wheat (shoyu)",
    per100g: {
      fatG: 0.57,
      carbsG: 4.93,
      proteinG: 8.14,
      kcal: 53.0,
    },
  },
  lemon: {
    fdcId: 167747,
    description: "Lemon juice, raw",
    per100g: {
      proteinG: 0.35,
      fatG: 0.24,
      carbsG: 6.9,
      kcal: 22.0,
    },
  },
  sesame: {
    fdcId: 170150,
    description: "Seeds, sesame seeds, whole, dried",
    per100g: {
      proteinG: 17.73,
      fatG: 49.67,
      carbsG: 23.45,
      kcal: 573.0,
    },
  },
  salt: {
    fdcId: 173468,
    description: "Salt, table",
    per100g: {
      proteinG: 0.0,
      fatG: 0.0,
      carbsG: 0.0,
      kcal: 0.0,
    },
  },
} as const;
export type NutrientFoodId = keyof typeof NUTRIENT_FOODS;
