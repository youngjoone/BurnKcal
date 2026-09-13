import { Text, View } from "react-native";
import { Meal, dailyTotal } from "../domain/journal";
import { Profile, caloriePlan } from "../domain/profile";
import { Button } from "../components/Button";
import { colors, styles } from "../theme";
type Props = {
  meals: Meal[];
  profile: Profile | null;
  day: string;
  ready: boolean;
  onScan: () => void;
  onProfile: () => void;
  onJournal: () => void;
};
export function TodayScreen({
  meals,
  profile,
  day,
  ready,
  onScan,
  onProfile,
  onJournal,
}: Props) {
  const consumed = dailyTotal(meals, day);
  const plan = profile ? caloriePlan(profile) : null;
  const goal = plan?.dailyKcal;
  return (
    <>
      <View style={{ gap: 6 }}>
        <Text style={styles.small}>{day.replaceAll("-", ". ")}</Text>
        <Text style={styles.title}>오늘의 식사</Text>
      </View>
      <View
        style={{
          backgroundColor: "#202328",
          borderRadius: 24,
          padding: 24,
          gap: 18,
        }}
      >
        <Text style={{ color: "#C1C6CF", fontSize: 13 }}>
          {goal ? "목표까지 남은 칼로리" : "오늘 기록한 칼로리"}
        </Text>
        <Text
          style={{
            color: colors.accent,
            fontSize: 52,
            fontWeight: "700",
            letterSpacing: -2,
          }}
        >
          {ready
            ? (goal ? Math.max(0, goal - consumed) : consumed).toLocaleString()
            : "—"}{" "}
          <Text style={{ fontSize: 17, color: "#E8EAEE" }}>kcal</Text>
        </Text>
        {!!goal && (
          <>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "#454A52",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 6,
                  width: `${Math.min(100, (consumed / goal) * 100)}%`,
                  backgroundColor: colors.accent,
                }}
              />
            </View>
            <View style={styles.row}>
              <Text style={{ color: "#C1C6CF", fontSize: 12 }}>
                섭취 {consumed.toLocaleString()}
              </Text>
              <Text style={{ color: "#C1C6CF", fontSize: 12 }}>
                목표 {goal.toLocaleString()}
              </Text>
            </View>
          </>
        )}
      </View>
      {!!goal && (
        <Text style={styles.small}>
          {consumed > goal
            ? `목표보다 ${(consumed - goal).toLocaleString()} kcal 더 기록했어요. 다음 끼니를 굶거나 무리하게 보상할 필요는 없어요.`
            : "하루 목표는 참고값이에요. 허기와 식사 균형도 함께 살펴 주세요."}
        </Text>
      )}
      {!profile && (
        <View style={styles.card}>
          <Text style={styles.label}>내 하루 목표부터 설정해요.</Text>
          <Text style={styles.small}>
            키·체중·활동량을 입력하면 시작 목표를 계산해 드려요.
          </Text>
          <Button title="내 정보 입력" secondary onPress={onProfile} />
        </View>
      )}
      {profile && !goal && (
        <View style={styles.card}>
          <Text style={styles.small}>{plan?.explanation}</Text>
          <Button title="내 정보 확인" secondary onPress={onProfile} />
        </View>
      )}
      <Button title="+  음식 사진 분석" onPress={onScan} />
      <Button
        title={`오늘 식사 ${meals.filter((m) => !m.deletedAt && m.localDate === day).length}건 보기`}
        secondary
        onPress={onJournal}
      />
    </>
  );
}
