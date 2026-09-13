import { Meal, parseMeal, localDate } from "../domain/journal";
import { insertEntry, listEntries, writeEntry } from "./database";
export async function loadMeals(): Promise<Meal[]> {
  return (await listEntries("meal."))
    .map((value) => parseMeal(JSON.parse(value)))
    .sort((a, b) => b.createdAt - a.createdAt);
}
export async function saveMeal(meal: Meal): Promise<void> {
  const valid = parseMeal(meal);
  if (valid.localDate > localDate())
    throw new Error("미래 날짜에는 식사를 기록할 수 없어요.");
  await insertEntry(`meal.${valid.id}`, JSON.stringify(valid));
}
export async function updateMeal(meal: Meal): Promise<void> {
  const valid = parseMeal(meal);
  await writeEntry(`meal.${valid.id}`, JSON.stringify(valid));
}
