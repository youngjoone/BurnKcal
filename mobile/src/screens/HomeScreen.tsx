import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
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
      <View style={[styles.stack, { paddingTop: 12, gap: 8 }]}>
        <Text style={styles.title}>한 장으로 확인하는{"\n"}오늘의 식사.</Text>
        <Text style={styles.subtitle}>
          음식마다 나눠서, 칼로리까지 간편하게.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={picking ? "사진 준비 중" : "사진 찍기"}
        accessibilityState={{ disabled: busy, busy: picking }}
        disabled={busy}
        onPress={onCamera}
        style={({ pressed }) => [s.scan, (busy || pressed) && { opacity: 0.7 }]}
      >
        <View style={styles.row}>
          <Text style={s.scanTag}>FOOD SCAN</Text>
          <View style={s.status}>
            <View style={s.dot} />
            <Text style={s.statusText}>카메라로 시작</Text>
          </View>
        </View>
        <View
          style={s.frame}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={[s.corner, s.topLeft]} />
          <View style={[s.corner, s.topRight]} />
          <View style={[s.corner, s.bottomLeft]} />
          <View style={[s.corner, s.bottomRight]} />
          <View style={s.camera}>
            <View style={s.cameraTop} />
            <View style={s.lens} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ gap: 5 }}>
            <Text style={s.scanTitle}>
              {picking ? "사진 준비 중…" : "음식 사진 찍기"}
            </Text>
            <Text style={s.scanCaption}>접시 전체가 보이도록 찍어 주세요.</Text>
          </View>
          <View style={s.arrow}>
            {picking ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={s.arrowText}>↗</Text>
            )}
          </View>
        </View>
      </Pressable>
      <Button
        title="앨범에서 사진 선택"
        onPress={onLibrary}
        secondary
        disabled={busy}
      />
      <View style={s.steps}>
        {["사진 선택", "AI 분석", "음식별 확인"].map((label, index) => (
          <View key={label} style={s.step}>
            <Text style={s.stepNumber}>
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Text style={s.stepLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <AnalysisNotice mode={mode} />
    </>
  );
}

const s = StyleSheet.create({
  scan: { backgroundColor: "#202328", borderRadius: 24, padding: 24, gap: 28 },
  scanTag: {
    color: "#BEC3CB",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
  },
  status: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  statusText: { color: "#D5D9E0", fontSize: 11 },
  frame: {
    width: 128,
    height: 96,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: "#777E86",
  },
  topLeft: {
    left: 0,
    top: 0,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderTopLeftRadius: 8,
  },
  topRight: {
    right: 0,
    top: 0,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    left: 0,
    bottom: 0,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    right: 0,
    bottom: 0,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomRightRadius: 8,
  },
  camera: {
    width: 49,
    height: 35,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraTop: {
    position: "absolute",
    top: -7,
    width: 20,
    height: 7,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.accent,
    backgroundColor: "#202328",
  },
  lens: {
    width: 15,
    height: 15,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 8,
  },
  scanTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 19,
    letterSpacing: -0.5,
  },
  scanCaption: { color: "#A6ADB7", fontSize: 11, lineHeight: 18 },
  arrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { color: colors.text, fontSize: 24 },
  steps: { flexDirection: "row", paddingVertical: 4 },
  step: { flex: 1, gap: 7, alignItems: "center" },
  stepNumber: { color: colors.muted, fontSize: 10, letterSpacing: 1 },
  stepLabel: { color: colors.text, fontSize: 12, fontWeight: "500" },
});
