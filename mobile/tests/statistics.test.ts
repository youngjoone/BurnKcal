import assert from "node:assert/strict";
import test from "node:test";
import { Meal } from "../src/domain/journal";
import {
  shiftStatisticsPeriod,
  summarizeMeals,
} from "../src/domain/statistics";

function meal(id: string, day: string, kcal: number, deleted = false): Meal {
  return {
    id,
    title: "통계 검증용 기록",
    createdAt: new Date(2026, 8, 15, 12).getTime(),
    localDate: day,
    items: [{ name: "검증용 음식", portion: "1인분", kcal }],
    deletedAt: deleted ? 1700000000000 : null,
  };
}

test("monthly totals combine same-day meals and omit deleted, other-month and future meals", () => {
  const result = summarizeMeals(
    [
      meal("a", "2026-09-01", 500),
      meal("b", "2026-09-01", 700),
      meal("c", "2026-09-02", 600),
      meal("removed", "2026-09-02", 900, true),
      meal("previous", "2026-08-31", 1000),
      meal("future", "2026-09-16", 1200),
    ],
    "month",
    "2026-09-15",
    "2026-09-15",
  );
  assert.equal(result.totalKcal, 1800);
  assert.equal(result.mealCount, 3);
  assert.equal(result.recordedDays, 2);
  assert.equal(result.elapsedDays, 15);
  assert.equal(result.averageKcal, 900);
  assert.equal(result.buckets[0].totalKcal, 1200);
  assert.equal(result.buckets[1].totalKcal, 600);
  assert.equal(result.buckets[2].averageKcal, null);
  assert.equal(result.buckets[15].future, true);
});

test("annual average is weighted by recorded days, not the average of monthly averages", () => {
  const result = summarizeMeals(
    [
      meal("a", "2025-01-01", 1000),
      meal("b", "2025-02-01", 2000),
      meal("c", "2025-02-02", 3000),
      meal("other-year", "2024-12-31", 4000),
    ],
    "year",
    "2025-12-31",
    "2026-09-15",
  );
  assert.equal(result.buckets.length, 12);
  assert.equal(result.totalKcal, 6000);
  assert.equal(result.recordedDays, 3);
  assert.equal(result.elapsedDays, 365);
  assert.equal(result.averageKcal, 2000);
  assert.equal(result.buckets[0].averageKcal, 1000);
  assert.equal(result.buckets[1].averageKcal, 2500);
  assert.equal(result.buckets[2].averageKcal, null);
});

test("unrecorded and future periods stay distinct from an explicitly saved zero-calorie meal", () => {
  const result = summarizeMeals(
    [meal("zero", "2026-09-01", 0)],
    "month",
    "2026-09-15",
    "2026-09-15",
  );
  assert.equal(result.recordedDays, 1);
  assert.equal(result.averageKcal, 0);
  assert.equal(result.buckets[0].mealCount, 1);
  assert.equal(result.buckets[0].averageKcal, 0);
  assert.equal(result.buckets[1].averageKcal, null);
  const empty = summarizeMeals([], "year", "2026-09-15", "2026-09-15");
  assert.equal(empty.averageKcal, null);
  assert.equal(empty.elapsedDays, 258);
  assert.equal(empty.buckets[8].future, false);
  assert.equal(empty.buckets[9].future, true);
});

test("leap years and calendar boundaries count local dates rather than timestamps", () => {
  const record = meal("leap", "2024-02-29", 700);
  const february = summarizeMeals(
    [record],
    "month",
    "2024-02-29",
    "2026-09-15",
  );
  assert.equal(february.buckets.length, 29);
  assert.equal(february.elapsedDays, 29);
  assert.equal(february.buckets[28].totalKcal, 700);
  assert.equal(february.start, "2024-02-01");
  assert.equal(february.end, "2024-02-29");
  assert.equal(
    summarizeMeals([record], "year", "2024-02-29", "2026-09-15").elapsedDays,
    366,
  );
  assert.equal(
    summarizeMeals([record], "year", "2026-09-15", "2026-09-15").totalKcal,
    0,
  );
});

test("edits, deletion and restoration rebuild statistics without retaining stale totals", () => {
  const original = meal("record", "2026-09-10", 600);
  const changed = { ...original, items: [{ ...original.items[0], kcal: 300 }] };
  const stats = (value: Meal) =>
    summarizeMeals([value], "month", "2026-09-15", "2026-09-15");
  assert.equal(stats(original).totalKcal, 600);
  assert.equal(stats(changed).totalKcal, 300);
  assert.equal(
    stats({ ...changed, deletedAt: 1700000000000 }).averageKcal,
    null,
  );
  assert.equal(stats({ ...changed, deletedAt: null }).totalKcal, 300);
  assert.equal(original.items[0].kcal, 600);
});

test("period navigation clamps leap days, crosses years and cannot advance past today", () => {
  assert.equal(
    shiftStatisticsPeriod("2024-02-29", "year", 1, "2026-09-15"),
    "2025-02-28",
  );
  assert.equal(
    shiftStatisticsPeriod("2026-01-31", "month", -1, "2026-09-15"),
    "2025-12-31",
  );
  assert.equal(
    shiftStatisticsPeriod("2026-08-31", "month", 1, "2026-09-15"),
    "2026-09-15",
  );
  assert.equal(
    shiftStatisticsPeriod("2026-09-15", "year", 1, "2026-09-15"),
    "2026-09-15",
  );
  assert.throws(() => summarizeMeals([], "month", "2025-02-29", "2026-09-15"));
});
