import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { FoodEditor } from "../components/FoodEditor";
import { Button } from "../components/Button";
import { Food } from "../domain/food";
import { AnalysisMode } from "../types/analysis";
import { styles } from "../theme";
export function ManualMealScreen({
  recordDay,
  busy,
  mode,
  onEstimate,
  onSave,
  onCancel,
}: {
  recordDay: string;
  busy: boolean;
  mode: AnalysisMode | null;
  onEstimate: (foodName: string, portion: string) => void;
  onSave: (items: Food[]) => void;
  onCancel: () => void;
}) {
  const [foodName, setFoodName] = useState("");
  const [portion, setPortion] = useState("");
  const [knownCalories, setKnownCalories] = useState(false);
  return (
    <>
      <Text style={styles.title}>무엇을 드셨나요?</Text>
      <Text style={styles.small}>{recordDay} 식사로 기록해요.</Text>
      {knownCalories ? (
        <FoodEditor
          items={[{ name: foodName, portion: portion || "1인분", kcal: 0 }]}
          busy={busy}
          confirmTitle="식사 기록 저장"
          onConfirm={onSave}
          onCancel={() => setKnownCalories(false)}
        />
      ) : (
        <>
          <Text style={styles.subtitle}>
            음식 이름만 적어 주세요. 예상 칼로리는 AI가 채워드려요.
          </Text>
          <View style={styles.stack}>
            <Text style={styles.label}>음식 이름</Text>
            <TextInput
              accessibilityLabel="추정할 음식 이름"
              value={foodName}
              onChangeText={setFoodName}
              maxLength={100}
              editable={!busy}
              placeholder="예: 순대국, 김치볶음밥"
              style={[styles.input, { minHeight: 56 }]}
            />
            <Text style={styles.label}>먹은 양 · 선택</Text>
            <TextInput
              accessibilityLabel="추정할 먹은 양"
              value={portion}
              onChangeText={setPortion}
              maxLength={200}
              editable={!busy}
              placeholder="예: 반 그릇, 공기밥 포함"
              style={[styles.input, { minHeight: 56 }]}
            />
            <Text style={styles.small}>
              비워두면 기본 1인분으로 추정해요. 국·찌개의 별도 공기밥은 포함
              여부를 적어 주세요.
            </Text>
          </View>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {mode === "demo"
                ? "현재 데모 모드예요. 예시 결과는 실제 기록으로 저장되지 않아요."
                : "버튼을 누르면 음식 이름과 먹은 양을 Gemini에 보내 추정해요. 추정한 분량과 칼로리를 확인한 뒤 저장해 주세요."}
            </Text>
          </View>
          <Button
            title={busy ? "예상 칼로리 확인 중…" : "예상 칼로리 채우기"}
            disabled={busy || !foodName.trim()}
            loading={busy}
            onPress={() => onEstimate(foodName, portion)}
          />
          <Button
            title="칼로리를 알고 있어요 · 직접 입력"
            secondary
            disabled={busy}
            onPress={() => setKnownCalories(true)}
          />
        </>
      )}
      <Button
        title="기록으로 돌아가기"
        secondary
        disabled={busy}
        onPress={onCancel}
      />
    </>
  );
}
