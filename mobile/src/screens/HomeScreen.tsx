import { Text, View, StyleSheet } from "react-native";
import { Button } from "../components/Button";
import { AnalysisNotice } from "../components/AnalysisNotice";
import { AnalysisMode } from "../types/analysis";
import { colors, styles } from "../theme";

type Props = {
  mode: AnalysisMode | null;
  busy: boolean;
  picking: boolean;
  onCamera: () => void;
  onLibrary: () => void;
};

export function HomeScreen({
  mode,
  busy,
  picking,
  onCamera,
  onLibrary,
}: Props) {
  return (
    <>
      <View style={styles.stack}>
        <Text style={styles.tag}>A LITTLE MORE MINDFUL</Text>
        <Text style={styles.title}>한 끼를 찍고,{"\n"}가볍게 알아봐요.</Text>
        <Text style={styles.subtitle}>
          한 장에 담긴 음식을 하나씩,{"\n"}칼로리는 한눈에 확인해요.
        </Text>
      </View>
      <View
        style={s.illustration}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View style={s.plate}>
          <View style={s.innerPlate}>
            <Text style={s.food}>🥗</Text>
          </View>
        </View>
        <View style={s.caption}>
          <Text style={s.captionText}>오늘의 한 끼</Text>
        </View>
      </View>
      <View style={styles.stack}>
        <Button
          title={picking ? "사진 준비 중…" : "사진 찍기"}
          onPress={onCamera}
          disabled={busy}
          loading={picking}
        />
        <Button
          title="앨범에서 선택"
          onPress={onLibrary}
          secondary
          disabled={busy}
        />
        <Text style={[styles.small, { textAlign: "center" }]}>
          음식 전체가 보이도록 밝은 곳에서 찍어 주세요.
        </Text>
      </View>
      <AnalysisNotice mode={mode} />
    </>
  );
}

const s = StyleSheet.create({
  illustration: {
    height: 210,
    backgroundColor: colors.pale,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  plate: {
    height: 162,
    width: 162,
    borderRadius: 81,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    transform: [{ rotate: "-8deg" }],
  },
  innerPlate: {
    height: 132,
    width: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  food: { fontSize: 77 },
  caption: {
    position: "absolute",
    bottom: 18,
    right: 18,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  captionText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
});
