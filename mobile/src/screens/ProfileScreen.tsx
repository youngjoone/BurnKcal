import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Profile, validateProfile, caloriePlan } from "../domain/profile";
import { Button } from "../components/Button";
import { Choices } from "../components/Choices";
import { styles } from "../theme";
type Props = {
  profile: Profile | null;
  busy: boolean;
  onSave: (profile: Profile) => Promise<boolean>;
};
export function ProfileScreen({ profile, busy, onSave }: Props) {
  const [fields, setFields] = useState({
    heightCm: profile ? String(profile.heightCm) : "",
    currentKg: profile ? String(profile.currentKg) : "",
    targetKg: profile ? String(profile.targetKg) : "",
    age: profile ? String(profile.age) : "",
  });
  const [sex, setSex] = useState<Profile["sex"] | "">(profile?.sex ?? "");
  const [activity, setActivity] = useState<Profile["activity"] | "">(
    profile?.activity ?? "",
  );
  const [care, setCare] = useState<"yes" | "no" | "">(
    profile ? (profile.specialCare ? "yes" : "no") : "",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function draft() {
    if (!care) throw new Error("자동 계산 대상 확인 항목을 선택해 주세요.");
    return validateProfile({
      heightCm: Number(fields.heightCm),
      currentKg: Number(fields.currentKg),
      targetKg: Number(fields.targetKg),
      age: Number(fields.age),
      sex,
      activity,
      specialCare: care === "yes",
    });
  }
  let preview: ReturnType<typeof caloriePlan> | null = null;
  try {
    preview = caloriePlan(draft());
  } catch {
    /* Incomplete fields are normal while editing. */
  }
  return (
    <>
      <View style={styles.stack}>
        <Text style={styles.title}>나에게 맞는 하루 목표</Text>
        <Text style={styles.subtitle}>
          신체 정보는 이 기기에만 저장돼요. Gemini에 전송하지 않아요.
        </Text>
      </View>
      {(
        [
          ["heightCm", "키", "cm"],
          ["currentKg", "현재 체중", "kg"],
          ["targetKg", "목표 체중", "kg"],
          ["age", "나이", "세"],
        ] as const
      ).map(([key, label, unit]) => (
        <View key={key} style={styles.stack}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.row}>
            <TextInput
              accessibilityLabel={label}
              value={fields[key]}
              onChangeText={(text) => {
                setMessage("");
                setFields((current) => ({ ...current, [key]: text }));
              }}
              keyboardType={key === "age" ? "number-pad" : "decimal-pad"}
              maxLength={6}
              editable={!busy}
              style={[styles.input, { minHeight: 50, flex: 1 }]}
            />
            <Text style={styles.small}>{unit}</Text>
          </View>
        </View>
      ))}
      <Choices
        label="대사량 계산 기준"
        value={sex}
        onChange={(value) => {
          setSex(value);
          setMessage("");
        }}
        disabled={busy}
        options={[
          { value: "female", label: "여성" },
          { value: "male", label: "남성" },
        ]}
      />
      <Text style={styles.small}>
        추정식이 사용하는 생리적 기준이에요. 성별 정체성을 뜻하지 않으며 개인의
        실제 대사량과 다를 수 있어요.
      </Text>
      <Choices
        label="평소 활동량"
        value={activity}
        onChange={(value) => {
          setActivity(value);
          setMessage("");
        }}
        disabled={busy}
        options={[
          { value: "low", label: "주로 앉아서 생활" },
          { value: "moderate", label: "걷기·가벼운 운동" },
          { value: "high", label: "활동·운동이 많음" },
        ]}
      />
      <Choices
        label="임신·수유 중이거나 의료진의 식사 관리가 필요한가요?"
        value={care}
        onChange={(value) => {
          setCare(value);
          setMessage("");
        }}
        disabled={busy}
        options={[
          { value: "no", label: "아니요" },
          { value: "yes", label: "예 · 자동 목표 제외" },
        ]}
      />
      {preview && (
        <View style={styles.card}>
          <Text style={styles.small}>저장하면 적용할 하루 목표</Text>
          <Text style={styles.title}>
            {preview.dailyKcal
              ? `${preview.dailyKcal.toLocaleString()} kcal`
              : "자동 목표 사용 안 함"}
          </Text>
          <Text style={styles.small}>{preview.explanation}</Text>
        </View>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      )}
      {!!message && (
        <Text accessibilityLiveRegion="polite" style={styles.small}>
          {message}
        </Text>
      )}
      <Button
        title="정보와 목표 저장"
        disabled={busy}
        loading={busy}
        onPress={() => {
          setError("");
          setMessage("");
          try {
            const value = draft();
            void onSave(value).then((ok) => {
              if (ok)
                setMessage(
                  "저장했어요. 오늘 화면에서 목표와 남은 칼로리를 확인하세요.",
                );
            });
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
    </>
  );
}
