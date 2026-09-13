import { Image, Text, TextInput, View } from "react-native";
import { MealPhoto, AnalysisMode } from "../types/analysis";
import { Button } from "../components/Button";
import { AnalysisNotice } from "../components/AnalysisNotice";
import { colors, styles } from "../theme";

type Props = {
  mode: AnalysisMode | null;
  photo: MealPhoto;
  recordDay: string;
  note: string;
  onNote: (note: string) => void;
  busy: boolean;
  onAnalyze: () => void;
  onBack: () => void;
};

export function PreviewScreen({
  mode,
  photo,
  recordDay,
  note,
  onNote,
  busy,
  onAnalyze,
  onBack,
}: Props) {
  return (
    <>
      <View style={styles.stack}>
        <Text style={styles.tag}>사진 확인 · {recordDay}</Text>
        <Text style={styles.title}>분석할 사진을 확인해요.</Text>
      </View>
      <Image
        source={{ uri: photo.uri }}
        style={styles.photo}
        resizeMode="contain"
        accessibilityLabel="선택한 음식 사진"
      />
      <View style={styles.stack}>
        <View style={styles.row}>
          <Text style={styles.label}>
            음식 설명 <Text style={styles.small}>(선택)</Text>
          </Text>
          <Text style={styles.small}>{note.length}/300</Text>
        </View>
        <TextInput
          accessibilityLabel="음식 설명"
          value={note}
          onChangeText={onNote}
          editable={!busy}
          maxLength={300}
          multiline
          placeholder="예: 밥 반 공기, 소스는 조금 넣었어요"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>
      <AnalysisNotice mode={mode} />
      <View style={styles.stack}>
        <Button
          title={
            busy
              ? "음식별로 분석 중…"
              : mode === "demo"
                ? "예시 분석 결과 보기"
                : "음식별 칼로리 분석"
          }
          onPress={onAnalyze}
          loading={busy}
        />
        <Button
          title="다른 사진 선택하기"
          onPress={onBack}
          secondary
          disabled={busy}
        />
      </View>
    </>
  );
}
