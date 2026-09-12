import { Text, View } from "react-native";
import { styles } from "../theme";

export function DemoNotice() {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>
        데모 버전 · 아직 AI가 연결되지 않았어요. 어떤 사진을 선택해도 같은 예시
        결과가 표시됩니다.
      </Text>
    </View>
  );
}
