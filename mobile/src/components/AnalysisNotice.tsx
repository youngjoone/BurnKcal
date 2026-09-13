import { Text, View } from "react-native";
import { AnalysisMode } from "../types/analysis";
import { DemoNotice } from "./DemoNotice";
import { colors, styles } from "../theme";

export function AnalysisNotice({ mode }: { mode: AnalysisMode | null }) {
  if (mode === "demo") return <DemoNotice />;
  return (
    <View style={[styles.notice, { backgroundColor: colors.pale }]}>
      <Text style={styles.small}>
        {mode === "ai"
          ? "음식별 칼로리는 AI 추정값이에요. 분석을 누르면 사진과 설명이 Google Gemini에 전송됩니다."
          : "서버 연결을 확인해 주세요. 연결 후 음식별 분석을 시작할 수 있어요."}
      </Text>
    </View>
  );
}
