import { Text, View } from "react-native";
import { Profile, caloriePlan } from "../domain/profile";
import { Preferences } from "../domain/recommendations";
import { Button } from "../components/Button";
import { styles } from "../theme";
type Props = {
  profile: Profile | null;
  preferences: Preferences | null;
  onProfile: () => void;
  onPreferences: () => void;
};
export function SettingsScreen({
  profile,
  preferences,
  onProfile,
  onPreferences,
}: Props) {
  const goal = profile ? caloriePlan(profile).dailyKcal : null;
  return (
    <>
      <Text style={styles.title}>설정</Text>
      <View style={styles.card}>
        <Text style={styles.label}>내 정보와 하루 목표</Text>
        <Text style={styles.title}>
          {goal ? `${goal.toLocaleString()} kcal` : "자동 목표 없음"}
        </Text>
        {profile && (
          <Text style={styles.small}>
            키 {profile.heightCm} cm · 현재 {profile.currentKg} kg → 목표{" "}
            {profile.targetKg} kg
          </Text>
        )}
        <Button title="신체 정보·목표 변경" secondary onPress={onProfile} />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>음식 취향과 제외 재료</Text>
        <Text style={styles.small}>
          {preferences
            ? `조리 시간 ${preferences.maxMinutes}분 이내 · 제외 식재료 ${preferences.allergens.length}개${preferences.excludedIngredients ? " + 추가 재료" : ""}`
            : "설정을 불러와 주세요."}
        </Text>
        <Button
          title="제외 재료·조리 시간 변경"
          secondary
          onPress={onPreferences}
        />
      </View>
      <View style={styles.stack}>
        <Text style={styles.label}>내 데이터</Text>
        <Text style={styles.small}>
          신체 정보와 식사 기록은 이 기기에 저장돼요. 분석할 때 사진·설명 또는
          음식 이름·양이 Google Gemini로 전송돼요. 추천할 때는 계산된 하루
          목표·남은 칼로리·제외 재료·조리 시간과 이전 메뉴 이름을 보내요.
          키·체중·나이 원문과 사진 원본은 서버에 보관하지 않아요.
        </Text>
        <Text style={styles.small}>
          아직 계정 동기화·백업은 없어요. 앱을 삭제하거나 기기를 바꾸면 기록이
          사라질 수 있어요.
        </Text>
      </View>
    </>
  );
}
