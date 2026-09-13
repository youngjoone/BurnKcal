import assert from "node:assert/strict";
import test from "node:test";
import { dailyTotal, localDate, Meal, parseMeal } from "../src/domain/journal";
const meal: Meal = {
  id: "test-meal",
  title: "밥",
  createdAt: 1700000000000,
  localDate: "2026-09-13",
  items: [{ name: "밥", portion: "반 공기", kcal: 150 }],
  deletedAt: null,
};
test("today sum excludes other dates and deleted meals; changes recompute", () => {
  assert.equal(
    dailyTotal(
      [
        meal,
        { ...meal, id: "other", localDate: "2026-09-12" },
        { ...meal, id: "removed", deletedAt: 1700000000001 },
      ],
      "2026-09-13",
    ),
    150,
  );
  assert.equal(
    dailyTotal(
      [{ ...meal, items: [{ ...meal.items[0], kcal: 75 }] }],
      "2026-09-13",
    ),
    75,
  );
});
test("calendar date uses device local time, not UTC date truncation", () => {
  assert.equal(localDate(new Date(2026, 8, 13, 0, 1)), "2026-09-13");
});
test("corrupt stored records fail closed without silently resetting storage", () => {
  assert.deepEqual(parseMeal(meal).items, meal.items);
  for (const bad of [
    null,
    {},
    { ...meal, items: [null] },
    { ...meal, items: [{ ...meal.items[0], kcal: -1 }] },
  ])
    assert.throws(() => parseMeal(bad));
});
