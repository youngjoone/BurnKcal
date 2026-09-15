import { isCalendarDate, localDate, shiftMonth } from "./dates";
import { foodTotal } from "./food";
import { Meal } from "./journal";

export type StatisticsRange = "month" | "year";
export type StatisticsBucket = {
  date: string;
  totalKcal: number;
  mealCount: number;
  recordedDays: number;
  averageKcal: number | null;
  future: boolean;
};
export type MealStatistics = {
  start: string;
  end: string;
  totalKcal: number;
  mealCount: number;
  recordedDays: number;
  elapsedDays: number;
  averageKcal: number | null;
  buckets: StatisticsBucket[];
};

export function statisticsPeriodKey(day: string, range: StatisticsRange) {
  return day.slice(0, range === "month" ? 7 : 4);
}

export function shiftStatisticsPeriod(
  day: string,
  range: StatisticsRange,
  direction: -1 | 1,
  today: string,
) {
  return shiftMonth(day, direction * (range === "month" ? 1 : 12), today);
}

// Input meals have already passed parseMeal at the storage boundary.
// Recalculate from confirmed meals; never persist a second, potentially stale total.
export function summarizeMeals(
  meals: Meal[],
  range: StatisticsRange,
  anchorDay: string,
  today = localDate(),
): MealStatistics {
  if (!isCalendarDate(anchorDay) || !isCalendarDate(today))
    throw new Error("통계 날짜를 확인해 주세요.");
  const [year, month] = anchorDay.split("-").map(Number);
  const firstMonth = range === "month" ? month - 1 : 0;
  const afterMonth = range === "month" ? month : 12;
  const start = localDate(new Date(year, firstMonth, 1, 12));
  const end = localDate(new Date(year, afterMonth, 0, 12));
  const totals = new Map<string, { totalKcal: number; mealCount: number }>();
  for (const meal of meals) {
    if (
      meal.deletedAt !== null ||
      meal.localDate < start ||
      meal.localDate > end ||
      meal.localDate > today
    )
      continue;
    const previous = totals.get(meal.localDate);
    totals.set(meal.localDate, {
      totalKcal: (previous?.totalKcal ?? 0) + foodTotal(meal.items),
      mealCount: (previous?.mealCount ?? 0) + 1,
    });
  }
  const buckets = new Map<string, StatisticsBucket>();
  let elapsedDays = 0;
  for (let m = firstMonth; m < afterMonth; m++) {
    const days = new Date(year, m + 1, 0, 12).getDate();
    for (let d = 1; d <= days; d++) {
      const date = localDate(new Date(year, m, d, 12));
      const key = range === "month" ? date : `${date.slice(0, 7)}-01`;
      const bucket = buckets.get(key) ?? {
        date: key,
        totalKcal: 0,
        mealCount: 0,
        recordedDays: 0,
        averageKcal: null,
        future: key > today,
      };
      if (date <= today) elapsedDays++;
      const total = totals.get(date);
      if (total) {
        bucket.totalKcal += total.totalKcal;
        bucket.mealCount += total.mealCount;
        bucket.recordedDays++;
      }
      buckets.set(key, bucket);
    }
  }
  const result = [...buckets.values()].map((bucket) => ({
    ...bucket,
    averageKcal: bucket.recordedDays
      ? bucket.totalKcal / bucket.recordedDays
      : null,
  }));
  const totalKcal = result.reduce((sum, bucket) => sum + bucket.totalKcal, 0);
  const mealCount = result.reduce((sum, bucket) => sum + bucket.mealCount, 0);
  const recordedDays = result.reduce(
    (sum, bucket) => sum + bucket.recordedDays,
    0,
  );
  return {
    start,
    end,
    totalKcal,
    mealCount,
    recordedDays,
    elapsedDays,
    averageKcal: recordedDays ? totalKcal / recordedDays : null,
    buckets: result,
  };
}
