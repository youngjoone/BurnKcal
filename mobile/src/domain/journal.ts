import { Food, confirmFoods, draftFoods, foodTotal } from "./food";
export type Meal = {
  id: string;
  title: string;
  createdAt: number;
  localDate: string;
  items: Food[];
  deletedAt: number | null;
};
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function parseMeal(value: unknown): Meal {
  if (!value || typeof value !== "object")
    throw new Error("식사 기록 형식을 확인할 수 없어요.");
  const m = value as Meal;
  if (
    typeof m.id !== "string" ||
    !/^[a-z0-9-]+$/.test(m.id) ||
    typeof m.title !== "string" ||
    !m.title.trim() ||
    m.title.length > 100 ||
    !Number.isSafeInteger(m.createdAt) ||
    m.createdAt <= 0 ||
    typeof m.localDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(m.localDate) ||
    (m.deletedAt !== null &&
      (!Number.isSafeInteger(m.deletedAt) || m.deletedAt <= 0)) ||
    !Array.isArray(m.items)
  )
    throw new Error("식사 기록 형식을 확인할 수 없어요.");
  if (
    m.items.some(
      (f) =>
        !f ||
        typeof f.name !== "string" ||
        typeof f.portion !== "string" ||
        !Number.isSafeInteger(f.kcal),
    )
  )
    throw new Error("식사 기록을 읽을 수 없어요.");
  return { ...m, items: confirmFoods(draftFoods(m.items)) };
}
export function dailyTotal(meals: Meal[], day: string) {
  return meals
    .filter((m) => !m.deletedAt && m.localDate === day)
    .reduce((total, meal) => total + foodTotal(meal.items), 0);
}
