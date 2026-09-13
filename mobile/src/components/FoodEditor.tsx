import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  Food,
  FoodDraft,
  confirmFoods,
  draftFoods,
  newId,
  scaleFood,
} from "../domain/food";
import { styles, colors } from "../theme";
import { Button } from "./Button";

type Props = {
  items: Food[];
  onConfirm: (items: Food[]) => void;
  onCancel: () => void;
};
export function FoodEditor({ items, onConfirm, onCancel }: Props) {
  const [drafts, setDrafts] = useState(() => draftFoods(items));
  const [error, setError] = useState("");
  function update(id: string, patch: Partial<FoodDraft>) {
    setDrafts((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }
  return (
    <View style={styles.stack}>
      <Text style={styles.label}>실제로 먹은 양을 확인해요</Text>
      <Text style={styles.small}>
        공유한 음식은 내가 먹은 만큼만 남겨 주세요. 양 버튼은 현재 칼로리를 비례
        조정해요.
      </Text>
      {drafts.map((item, index) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.small}>음식 {index + 1}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`음식 ${index + 1} 삭제`}
              onPress={() =>
                setDrafts((current) =>
                  current.filter((food) => food.id !== item.id),
                )
              }
              style={{ padding: 10 }}
            >
              <Text style={{ color: colors.muted }}>삭제</Text>
            </Pressable>
          </View>
          <TextInput
            accessibilityLabel={`음식 ${index + 1} 이름`}
            placeholder="음식 이름"
            maxLength={100}
            value={item.name}
            onChangeText={(name) => update(item.id, { name })}
            style={[styles.input, { minHeight: 48 }]}
          />
          <TextInput
            accessibilityLabel={`음식 ${index + 1} 먹은 양`}
            placeholder="예: 밥 반 공기"
            maxLength={200}
            value={item.portion}
            onChangeText={(portion) => update(item.id, { portion })}
            style={[styles.input, { minHeight: 48 }]}
          />
          <View style={styles.row}>
            <TextInput
              accessibilityLabel={`음식 ${index + 1} 칼로리`}
              keyboardType="number-pad"
              value={item.kcal}
              onChangeText={(kcal) => update(item.id, { kcal })}
              style={[styles.input, { minHeight: 48, flex: 1 }]}
            />
            <Text style={styles.small}>kcal</Text>
          </View>
          <View style={styles.row}>
            {[0.5, 1.5, 2].map((factor) => (
              <Pressable
                key={factor}
                accessibilityRole="button"
                accessibilityLabel={`음식 ${index + 1} 양 ${factor}배`}
                onPress={() => update(item.id, scaleFood(item, factor))}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: colors.pale,
                  alignItems: "center",
                }}
              >
                <Text style={styles.small}>
                  {factor === 0.5 ? "절반" : `${factor}배`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <Button
        title="빠진 음식 추가"
        secondary
        disabled={drafts.length >= 20}
        onPress={() =>
          setDrafts((current) => [
            ...current,
            { id: newId(), name: "", portion: "", kcal: "" },
          ])
        }
      />
      {!!error && (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      )}
      <Button
        title="수정 적용"
        onPress={() => {
          try {
            onConfirm(confirmFoods(drafts));
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
      <Button title="수정 취소" secondary onPress={onCancel} />
    </View>
  );
}
