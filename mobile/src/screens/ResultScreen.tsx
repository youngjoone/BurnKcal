import { useState } from "react";
import { FoodEditor } from "../components/FoodEditor";
import { foodTotal, Food } from "../domain/food";
import { Image, Text, View, StyleSheet } from "react-native";
import { AnalysisResult, MealPhoto } from "../types/analysis";
import { Button } from "../components/Button";
import { DemoNotice } from "../components/DemoNotice";
import { colors, styles } from "../theme";

type Props = {
  photo?: MealPhoto;
  recordDay: string;
  result: AnalysisResult;
  busy: boolean;
  onSave: (items: Food[]) => void;
  onScrollTop: () => void;
  onReset: () => void;
};

export function ResultScreen({
  photo,
  recordDay,
  result,
  busy,
  onSave,
  onScrollTop,
  onReset,
}: Props) {
  const demo = result.mode === "demo";
  const [items, setItems] = useState(result.items);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState(false);
  const [showNotices, setShowNotices] = useState(!photo);
  if (editing)
    return (
      <FoodEditor
        items={items}
        onConfirm={(foods) => {
          setItems(foods);
          setEdited(true);
          setEditing(false);
          onScrollTop();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  return (
    <>
      <View style={{ gap: 6 }}>
        <Text style={styles.tag}>{demo ? "예시 결과" : "분석 완료"}</Text>
        <Text style={styles.title}>{result.title}</Text>
      </View>
      {demo && <DemoNotice />}
      {photo && (
        <Image
          source={{ uri: photo.uri }}
          style={styles.photo}
          resizeMode="contain"
          accessibilityLabel="전송한 음식 사진"
        />
      )}
      <View style={s.summary}>
        <View style={styles.row}>
          <Text style={s.summaryLabel}>총 예상 칼로리</Text>
          <Text style={s.summaryLabel}>
            {items.length}개 음식 · {demo ? "예시" : "AI 추정"}
          </Text>
        </View>
        <View style={s.totalRow}>
          <Text style={s.total}>{foodTotal(items).toLocaleString()}</Text>
          <Text style={s.unit}>kcal</Text>
        </View>
        {edited ? (
          <Text style={s.range}>
            먹은 양을 수정한 값 · 실제 영양값과 다를 수 있어요
          </Text>
        ) : (
          <Text style={s.range}>
            {demo ? "예시 범위" : "예상 범위"}{" "}
            {result.range.min.toLocaleString()}–
            {result.range.max.toLocaleString()} kcal
          </Text>
        )}
      </View>
      <View style={{ gap: 4 }}>
        <View style={[styles.row, { paddingBottom: 8 }]}>
          <Text style={styles.label}>음식별 분석</Text>
          <Text style={styles.small}>추정량 기준</Text>
        </View>
        {items.map((item, index) => (
          <View key={`${item.name}-${index}`} style={s.foodRow}>
            <Text style={s.index}>{String(index + 1).padStart(2, "0")}</Text>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.label}>{item.name}</Text>
              <Text style={styles.small}>{item.portion}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 3 }}>
              <Text style={s.foodKcal}>{item.kcal}</Text>
              <Text style={s.kcalLabel}>kcal</Text>
            </View>
          </View>
        ))}
      </View>
      <Button
        title="음식·먹은 양 수정"
        secondary
        disabled={busy}
        onPress={() => {
          setEditing(true);
          onScrollTop();
        }}
      />
      {!demo && (
        <Text style={styles.small}>
          {recordDay} 식사로 저장돼요. 실제로 먹은 양을 확인해 주세요.
        </Text>
      )}
      {!demo && (
        <Button
          title="먹은 양 확인 · 식사 저장"
          disabled={busy}
          loading={busy}
          onPress={() => onSave(items)}
        />
      )}
      <View style={[styles.stack, { gap: 8 }]}>
        <Text style={styles.small}>분석 참고사항</Text>
        {(showNotices ? result.notices : result.notices.slice(0, 1)).map(
          (notice, index) => (
            <Text key={index} style={[styles.small, { fontSize: 12 }]}>
              {notice}
            </Text>
          ),
        )}
      </View>
      <Button
        title={showNotices ? "참고사항 접기" : "분석 참고사항 더 보기"}
        secondary
        disabled={busy}
        onPress={() => setShowNotices(!showNotices)}
      />
      <Button
        title="다른 식사 분석하기"
        secondary
        disabled={busy}
        onPress={onReset}
      />
    </>
  );
}
const s = StyleSheet.create({
  summary: {
    padding: 22,
    gap: 10,
    borderRadius: 20,
    backgroundColor: "#202328",
  },
  summaryLabel: { fontSize: 12, color: "#C1C6CF" },
  totalRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  total: {
    fontSize: 54,
    fontWeight: "700",
    letterSpacing: -2.5,
    color: colors.accent,
    fontVariant: ["tabular-nums"],
  },
  unit: { fontSize: 17, color: "#E8EAEE" },
  range: { fontSize: 12, color: "#A6ADB7" },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  index: { fontSize: 11, color: colors.muted },
  foodKcal: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 19,
    fontVariant: ["tabular-nums"],
  },
  kcalLabel: { color: colors.muted, fontSize: 10 },
});
