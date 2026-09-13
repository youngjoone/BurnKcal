import assert from "node:assert/strict";
import test from "node:test";
import {
  confirmFoods,
  draftFoods,
  foodTotal,
  scaleFood,
} from "../src/domain/food";
const foods = [
  { name: "밥", portion: "1공기", kcal: 300 },
  { name: "반찬", portion: "1접시", kcal: 100 },
];
test("portion correction recomputes total without changing original AI output", () => {
  const draft = draftFoods(foods);
  draft[0] = scaleFood(draft[0], 0.5);
  assert.equal(foodTotal(confirmFoods(draft)), 250);
  assert.equal(foods[0].kcal, 300);
});
test("rejects missing foods, names, portions, negative and fractional calories", () => {
  assert.throws(() => confirmFoods([]));
  for (const patch of [
    { name: " " },
    { portion: "" },
    { kcal: "-10" },
    { kcal: "10.5" },
    { kcal: "10001" },
    { kcal: "" },
  ])
    assert.throws(() => confirmFoods([{ ...draftFoods(foods)[0], ...patch }]));
});
