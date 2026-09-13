import { AnalysisResult } from "../types/analysis";
export type Food = AnalysisResult["items"][number];
export type FoodDraft = {
  id: string;
  name: string;
  portion: string;
  kcal: string;
};
let sequence = 0;
export function newId() {
  return `${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
export function draftFoods(items: Food[]): FoodDraft[] {
  return items.map((item) => ({
    ...item,
    id: newId(),
    kcal: String(item.kcal),
  }));
}
export function confirmFoods(drafts: FoodDraft[]): Food[] {
  if (!drafts.length || drafts.length > 20)
    throw new Error("음식은 1개 이상, 20개 이하로 입력해 주세요.");
  return drafts.map((item) => {
    if (!item.name.trim() || item.name.trim().length > 100)
      throw new Error("음식 이름을 100자 이내로 입력해 주세요.");
    if (!item.portion.trim() || item.portion.trim().length > 200)
      throw new Error("먹은 양을 200자 이내로 입력해 주세요.");
    if (!/^\d+$/.test(item.kcal) || Number(item.kcal) > 10000)
      throw new Error("음식별 칼로리는 0~10,000 사이 정수로 입력해 주세요.");
    return {
      name: item.name.trim(),
      portion: item.portion.trim(),
      kcal: Number(item.kcal),
    };
  });
}
export function foodTotal(items: Food[]) {
  return items.reduce((sum, item) => sum + item.kcal, 0);
}
export function scaleFood(item: FoodDraft, factor: number): FoodDraft {
  if (!/^\d+$/.test(item.kcal)) return item;
  return {
    ...item,
    portion: `${item.portion} × ${factor}`.slice(0, 200),
    kcal: String(Math.round(Number(item.kcal) * factor)),
  };
}
