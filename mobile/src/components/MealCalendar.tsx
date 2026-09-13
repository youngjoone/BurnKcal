import { Pressable, Text, View } from "react-native";
import { Meal, dailyTotal } from "../domain/journal";
import { monthCells, shiftMonth } from "../domain/dates";
import { colors, styles } from "../theme";
type Props = {
  selectedDay: string;
  today: string;
  meals: Meal[];
  disabled: boolean;
  onSelect: (date: string) => void;
};
export function MealCalendar({
  selectedDay,
  today,
  meals,
  disabled,
  onSelect,
}: Props) {
  const [year, month] = selectedDay.split("-");
  const cells = monthCells(selectedDay);
  const weeks = Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
  return (
    <View style={[styles.card, { padding: 16, gap: 14 }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전 달"
          disabled={disabled}
          onPress={() => onSelect(shiftMonth(selectedDay, -1, today))}
          style={{ padding: 12 }}
        >
          <Text style={styles.label}>‹</Text>
        </Pressable>
        <Text style={styles.label}>
          {year}년 {Number(month)}월
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다음 달"
          disabled={disabled || selectedDay.slice(0, 7) >= today.slice(0, 7)}
          onPress={() => onSelect(shiftMonth(selectedDay, 1, today))}
          style={{
            padding: 12,
            opacity: selectedDay.slice(0, 7) >= today.slice(0, 7) ? 0.25 : 1,
          }}
        >
          <Text style={styles.label}>›</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row" }}>
        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
          <Text
            key={day}
            style={[
              styles.small,
              { flex: 1, textAlign: "center", fontSize: 11 },
            ]}
          >
            {day}
          </Text>
        ))}
      </View>
      <View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={{ flexDirection: "row" }}>
            {week.map((date, index) => {
              if (!date)
                return (
                  <View
                    key={`empty-${index}`}
                    style={{ flex: 1, minHeight: 54 }}
                  />
                );
              const count = meals.filter(
                (meal) => !meal.deletedAt && meal.localDate === date,
              ).length;
              const selected = date === selectedDay;
              return (
                <Pressable
                  key={date}
                  accessibilityRole="button"
                  accessibilityLabel={`${date} 식사 ${count}건 ${dailyTotal(meals, date)}킬로칼로리`}
                  accessibilityState={{
                    selected,
                    disabled: disabled || date > today,
                  }}
                  disabled={disabled || date > today}
                  onPress={() => onSelect(date)}
                  style={{
                    flex: 1,
                    minHeight: 54,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    backgroundColor: selected ? colors.primary : "transparent",
                    opacity: date > today ? 0.25 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: selected ? "#FFF" : colors.text,
                      fontWeight: date === today || selected ? "700" : "400",
                    }}
                  >
                    {Number(date.slice(-2))}
                  </Text>
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: count
                        ? selected
                          ? colors.accent
                          : colors.primary
                        : "transparent",
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={[styles.small, { fontSize: 11 }]}>
        점이 있는 날짜에 식사 기록이 있어요.
      </Text>
    </View>
  );
}
