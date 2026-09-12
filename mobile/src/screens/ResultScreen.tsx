import { Image, Text, View } from "react-native";
import { AnalysisResult, MealPhoto } from "../types/analysis";
import { Button } from "../components/Button";
import { DemoNotice } from "../components/DemoNotice";
import { colors, styles } from "../theme";

type Props = { photo: MealPhoto; result: AnalysisResult; onReset: () => void };

export function ResultScreen({ photo, result, onReset }: Props) {
  const demo = result.mode === "demo";
  return (
    <>
      <View style={styles.stack}>
        <Text style={styles.tag}>02 / {demo ? "예시 결과" : "분석 결과"}</Text>
        <Text style={styles.title}>
          {demo ? "이렇게 보여드려요." : "한 끼를 확인했어요."}
        </Text>
      </View>
      {demo && <DemoNotice />}
      <Image
        source={{ uri: photo.uri }}
        style={[styles.photo, { aspectRatio: 1.8 }]}
        accessibilityLabel="전송한 음식 사진"
      />
      <View style={styles.card}>
        <Text style={styles.label}>{result.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text
            style={{
              fontSize: 54,
              fontWeight: "800",
              color: colors.primary,
              letterSpacing: -2,
            }}
          >
            {result.totalKcal.toLocaleString()}
          </Text>
          <Text style={styles.subtitle}>
            kcal{demo ? " (예시)" : " (추정)"}
          </Text>
        </View>
        <Text style={styles.small}>
          {demo ? "예시 범위" : "예상 범위"} {result.range.min}–
          {result.range.max} kcal
        </Text>
        <View style={styles.divider} />
        {result.items.map((item, index) => (
          <View key={`${item.name}-${index}`} style={styles.row}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.label}>{item.name}</Text>
              <Text style={styles.small}>{item.portion}</Text>
            </View>
            <Text style={styles.label}>{item.kcal} kcal</Text>
          </View>
        ))}
      </View>
      {result.notices.map((notice, index) => (
        <Text key={index} style={styles.small}>
          {notice}
        </Text>
      ))}
      <Button title="다른 한 끼 찍기" onPress={onReset} />
    </>
  );
}
