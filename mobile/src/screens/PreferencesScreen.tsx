import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ALLERGENS } from "../data/recipes";
import { Preferences } from "../domain/recommendations";
import { Button } from "../components/Button";
import { Choices } from "../components/Choices";
import { colors, styles } from "../theme";
type Props = {
  preferences: Preferences;
  busy: boolean;
  onSave: (preferences: Preferences) => void;
  onBack: () => void;
};
export function PreferencesScreen({
  preferences,
  busy,
  onSave,
  onBack,
}: Props) {
  const [draft, setDraft] = useState(preferences);
  return (
    <>
      <Text style={styles.title}>먹지 않는 재료</Text>
      <Text style={styles.subtitle}>
        선택한 재료가 포함된 레시피는 추천에서 제외해요. 설정은 이 기기에만
        저장돼요.
      </Text>
      <Text style={styles.label}>알레르기·제외 식재료</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {ALLERGENS.map((allergen) => {
          const checked = draft.allergens.includes(allergen);
          return (
            <Pressable
              key={allergen}
              accessibilityRole="checkbox"
              accessibilityLabel={`${allergen} 제외`}
              accessibilityState={{ checked, disabled: busy }}
              disabled={busy}
              onPress={() =>
                setDraft((current) => ({
                  ...current,
                  allergens: checked
                    ? current.allergens.filter((a) => a !== allergen)
                    : [...current.allergens, allergen],
                }))
              }
              style={{
                paddingHorizontal: 16,
                paddingVertical: 13,
                borderRadius: 12,
                backgroundColor: checked ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: checked ? "#FFF" : colors.text }}>
                {checked ? "✓ " : ""}
                {allergen}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.label}>그 밖에 제외할 재료</Text>
      <TextInput
        accessibilityLabel="그 밖에 제외할 재료"
        placeholder="예: 오이, 토마토"
        value={draft.excludedIngredients}
        maxLength={200}
        editable={!busy}
        onChangeText={(excludedIngredients) =>
          setDraft((current) => ({ ...current, excludedIngredients }))
        }
        style={styles.input}
      />
      <Text style={styles.small}>
        쉼표로 구분해 주세요. 재료 이름에 포함된 단어로 비교하므로 다른
        이름·가공품 성분까지 판별하지는 못해요.
      </Text>
      <Choices
        label="가능한 조리 시간"
        value={String(draft.maxMinutes)}
        disabled={busy}
        onChange={(value) =>
          setDraft((current) => ({ ...current, maxMinutes: Number(value) }))
        }
        options={[
          { value: "15", label: "15분 이내" },
          { value: "30", label: "30분 이내" },
          { value: "60", label: "60분 이내" },
        ]}
      />
      <Text style={styles.small}>
        조미료·가공품의 실제 성분표와 교차 접촉 여부를 따로 확인해 주세요. 추천
        목록이 알레르기 안전을 보장하지는 않아요.
      </Text>
      <Button
        title="추천 설정 저장"
        disabled={busy}
        loading={busy}
        onPress={() => onSave(draft)}
      />
      <Button title="돌아가기" secondary disabled={busy} onPress={onBack} />
    </>
  );
}
