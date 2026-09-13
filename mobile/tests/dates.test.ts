import assert from "node:assert/strict";
import test from "node:test";
import { isCalendarDate, monthCells, shiftMonth } from "../src/domain/dates";
import { dailyTotal, Meal } from "../src/domain/journal";
test("calendar covers leap days and rejects impossible dates", () => {
  assert.equal(isCalendarDate("2024-02-29"), true);
  assert.equal(isCalendarDate("2025-02-29"), false);
  assert.equal(isCalendarDate("2026-13-01"), false);
  assert.equal(monthCells("2024-02-29").filter(Boolean).length, 29);
  assert.equal(monthCells("2026-09-13")[1], "2026-09-01");
});
test("month navigation clamps end-of-month and future dates", () => {
  assert.equal(shiftMonth("2026-03-31", -1, "2026-09-13"), "2026-02-28");
  assert.equal(shiftMonth("2026-08-31", 1, "2026-09-13"), "2026-09-13");
  assert.equal(shiftMonth("2026-01-15", -1, "2026-09-13"), "2025-12-15");
});
test("backdated records use their selected date rather than creation timestamp", () => {
  const record: Meal = {
    id: "past-meal",
    title: "직접 기록",
    createdAt: new Date(2026, 8, 13).getTime(),
    localDate: "2026-09-10",
    items: [{ name: "밥", portion: "반 공기", kcal: 150 }],
    deletedAt: null,
  };
  assert.equal(dailyTotal([record], "2026-09-10"), 150);
  assert.equal(dailyTotal([record], "2026-09-13"), 0);
});
