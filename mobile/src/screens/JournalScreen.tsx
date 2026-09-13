import { MealCalendar } from "../components/MealCalendar";
import { useState } from "react";
import { Text, View } from "react-native";
import { Meal, dailyTotal } from "../domain/journal";
import { foodTotal } from "../domain/food";
import { Button } from "../components/Button";
import { colors, styles } from "../theme";
type Props = {
  meals: Meal[];
  busy: boolean;
  day: string;
  today: string;
  onDay: (date: string) => void;
  onManual: () => void;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => Promise<boolean>;
  onRestore: (meal: Meal) => Promise<boolean>;
  onScan: () => void;
};
export function JournalScreen({
  meals,
  busy,
  day,
  today,
  onDay,
  onManual,
  onEdit,
  onDelete,
  onRestore,
  onScan,
}: Props) {
  const [showDeleted, setShowDeleted] = useState(false);
  const [removed, setRemoved] = useState<Meal | null>(null);
  const visible = meals.filter((m) => !m.deletedAt && m.localDate === day);
  return (
    <>
      <View style={styles.stack}>
        <Text style={styles.title}>식사 기록</Text>
        <Text style={styles.subtitle}>
          날짜를 선택해 식사를 확인하고 기록해요.
        </Text>
      </View>
      <MealCalendar
        selectedDay={day}
        today={today}
        meals={meals}
        disabled={busy}
        onSelect={onDay}
      />
      <View style={styles.card}>
        <Text style={styles.small}>선택한 날짜 섭취량 · {day}</Text>
        <Text style={[styles.title, { fontSize: 38 }]}>
          {dailyTotal(meals, day).toLocaleString()}{" "}
          <Text style={styles.small}>kcal</Text>
        </Text>
      </View>
      {day !== today && (
        <Button
          title="오늘로 이동"
          secondary
          disabled={busy}
          onPress={() => onDay(today)}
        />
      )}
      <Button
        title={`${day.slice(5).replace("-", "/")} 식사 사진 추가`}
        disabled={busy}
        onPress={onScan}
      />
      <Button
        title="사진 없이 직접 기록"
        secondary
        disabled={busy}
        onPress={onManual}
      />
      {removed && (
        <View style={styles.card}>
          <Text style={styles.small}>기록을 삭제했어요.</Text>
          <Button
            title="삭제 되돌리기"
            secondary
            disabled={busy}
            onPress={() =>
              void onRestore(removed).then((ok) => {
                if (ok) setRemoved(null);
              })
            }
          />
        </View>
      )}
      {!visible.length && (
        <View style={styles.card}>
          <Text style={styles.label}>이 날짜에 저장한 식사가 없어요.</Text>
          <Text style={styles.small}>
            사진을 분석한 뒤 먹은 양을 확인하고 저장해 주세요.
          </Text>
        </View>
      )}
      {visible.map((meal) => (
        <View key={meal.id} style={styles.card}>
          <Text style={styles.small}>
            입력 ·{" "}
            {new Date(meal.createdAt).toLocaleString("ko-KR", {
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <View style={styles.row}>
            <Text style={[styles.label, { flex: 1 }]}>{meal.title}</Text>
            <Text style={styles.label}>
              {foodTotal(meal.items).toLocaleString()} kcal
            </Text>
          </View>
          {meal.items.map((food, index) => (
            <View key={index} style={styles.row}>
              <Text style={[styles.small, { flex: 1 }]}>
                {food.name} · {food.portion}
              </Text>
              <Text style={styles.small}>{food.kcal}</Text>
            </View>
          ))}
          <Button
            title="이 식사 수정"
            secondary
            disabled={busy}
            onPress={() => onEdit(meal)}
          />
          <Button
            title="기록 삭제"
            secondary
            disabled={busy}
            onPress={() =>
              void onDelete(meal).then((ok) => {
                if (ok) setRemoved(meal);
              })
            }
          />
        </View>
      ))}
      {meals.some((m) => m.deletedAt && m.localDate === day) && (
        <Button
          title={showDeleted ? "삭제한 기록 접기" : "삭제한 기록 보기"}
          secondary
          onPress={() => setShowDeleted(!showDeleted)}
        />
      )}
      {showDeleted &&
        meals
          .filter((m) => m.deletedAt && m.localDate === day)
          .map((meal) => (
            <View key={meal.id} style={styles.card}>
              <Text style={styles.small}>{meal.title} · 삭제됨</Text>
              <Button
                title="이 기록 복구"
                secondary
                disabled={busy}
                onPress={() => void onRestore(meal)}
              />
            </View>
          ))}
      <Text style={[styles.small, { color: colors.muted }]}>
        이 기기에만 저장돼요. 사진 원본은 기록에 보관하지 않아요.
      </Text>
    </>
  );
}
