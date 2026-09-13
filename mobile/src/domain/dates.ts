export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
export function monthCells(selectedDay: string): (string | null)[] {
  if (!isCalendarDate(selectedDay)) throw new Error("날짜를 확인해 주세요.");
  const [year, month] = selectedDay.split("-").map(Number);
  const leading = (new Date(year, month - 1, 1, 12).getDay() + 6) % 7;
  const count = new Date(year, month, 0, 12).getDate();
  return Array.from(
    { length: Math.ceil((leading + count) / 7) * 7 },
    (_, index) =>
      index < leading || index >= leading + count
        ? null
        : `${selectedDay.slice(0, 7)}-${String(index - leading + 1).padStart(2, "0")}`,
  );
}
export function shiftMonth(
  selectedDay: string,
  offset: number,
  today: string,
): string {
  const [year, month, day] = selectedDay.split("-").map(Number);
  const last = new Date(year, month + offset, 0, 12).getDate();
  const result = localDate(
    new Date(year, month - 1 + offset, Math.min(day, last), 12),
  );
  return result > today ? today : result;
}
