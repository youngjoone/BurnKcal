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
        style={styles.photo}
        resizeMode="contain"
        accessibilityLabel="전송한 음식 사진"
      />
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>{result.title}</Text>
          <Text style={styles.small}>
            총 {result.items.length}개 음식{demo ? " · 예시" : ""}
          </Text>
        </View>
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
      </View>
      <View style={styles.stack}>
        <View style={styles.row}>
          <Text style={styles.label}>음식별 칼로리</Text>
          <Text style={styles.small}>{demo ? "예시 구성" : "추정량 기준"}</Text>
        </View>
        {result.items.map((item, index) => (
          <View key={`${item.name}-${index}`} style={[styles.card, styles.row]}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: colors.pale,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </Text>
            </View>
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
