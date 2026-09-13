import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Profile, validateProfile, caloriePlan } from "../domain/profile";
import { Button } from "../components/Button";
import { Choices } from "../components/Choices";
import { colors, styles } from "../theme";
type Props = {
  profile: Profile | null;
  busy: boolean;
  onboarding?: boolean;
  onSave: (profile: Profile) => Promise<boolean>;
  onCancel?: () => void;
  onScrollTop?: () => void;
};
export function ProfileScreen({
  profile,
  busy,
  onboarding,
  onSave,
  onCancel,
  onScrollTop,
}: Props) {
  const [step, setStep] = useState(0);
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
  const [error, setError] = useState("");
  const [details, setDetails] = useState(false);
  function numbers() {
    return {
      heightCm: Number(fields.heightCm),
      currentKg: Number(fields.currentKg),
      targetKg: Number(fields.targetKg),
      age: Number(fields.age),
    };
  }
  function draft() {
    if (!care) throw new Error("자동 계산 대상 확인 항목을 선택해 주세요.");
    return validateProfile({
      ...numbers(),
      sex,
      activity,
      specialCare: care === "yes",
    });
  }
  function next() {
    setError("");
    try {
      if (step === 0)
        validateProfile({
          ...numbers(),
          sex: "female",
          activity: "low",
          specialCare: false,
        });
      else draft();
      setStep(step + 1);
      onScrollTop?.();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const plan = step === 2 ? caloriePlan(draft()) : null;
  return (
    <View key={step} style={styles.stack}>
      <View style={styles.row}>
        <Text style={styles.tag}>
          {onboarding ? "시작하기" : "내 정보 수정"}
        </Text>
        <Text style={styles.small}>{step + 1} / 3</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 16 }}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: index <= step ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
      <Text style={styles.title}>
        {
          [
            "나에게 맞는 목표부터\n시작해 볼까요?",
            "평소 생활에 맞춰\n목표를 계산할게요.",
            plan?.dailyKcal
              ? "하루 목표를\n확인해 주세요."
              : "식사 기록부터\n시작해요.",
          ][step]
        }
      </Text>
      {step === 0 && (
        <>
          <Text style={styles.subtitle}>
            처음 한 번만 입력해요. 나중에 설정에서 바꿀 수 있어요.
          </Text>
          {(
            [
              ["heightCm", "키", "cm"],
              ["currentKg", "현재 체중", "kg"],
              ["targetKg", "목표 체중", "kg"],
              ["age", "나이", "세"],
            ] as const
          ).map(([key, label, unit]) => (
            <View key={key} style={{ gap: 8, marginTop: 8 }}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.row}>
                <TextInput
                  accessibilityLabel={label}
                  value={fields[key]}
                  onChangeText={(text) =>
                    setFields((current) => ({ ...current, [key]: text }))
                  }
                  keyboardType={key === "age" ? "number-pad" : "decimal-pad"}
                  maxLength={6}
                  editable={!busy}
                  style={[styles.input, { minHeight: 50, flex: 1 }]}
                />
                <Text style={styles.small}>{unit}</Text>
              </View>
            </View>
          ))}
        </>
      )}
      {step === 1 && (
        <>
          <Text style={styles.subtitle}>
            몸무게만으로는 하루 필요량을 정하기 어려워요.
          </Text>
          <Choices
            label="대사량 계산 기준"
            value={sex}
            onChange={setSex}
            disabled={busy}
            options={[
              { value: "female", label: "여성" },
              { value: "male", label: "남성" },
            ]}
          />
          <Text style={styles.small}>
            추정식에 쓰이는 생리적 기준이며 성별 정체성을 뜻하지 않아요.
          </Text>
          <Choices
            label="평소 활동량"
            value={activity}
            onChange={setActivity}
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
            onChange={setCare}
            disabled={busy}
            options={[
              { value: "no", label: "아니요" },
              { value: "yes", label: "예 · 자동 목표 제외" },
            ]}
          />
        </>
      )}
      {step === 2 && plan && (
        <>
          <View style={[styles.card, { marginVertical: 12 }]}>
            <Text style={styles.small}>하루 참고 목표</Text>
            <Text style={[styles.title, { fontSize: 40 }]}>
              {plan.dailyKcal
                ? `${plan.dailyKcal.toLocaleString()} kcal`
                : "자동 계산 제외"}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.small}>
              현재 {fields.currentKg} kg → 목표 {fields.targetKg} kg
            </Text>
          </View>
          <Text style={styles.subtitle}>
            {plan.dailyKcal
              ? "식사를 저장하면 목표에서 차감해요. 남은 양과 식사 균형을 함께 고려해 다음 한 끼를 추천해요."
              : plan.explanation}
          </Text>
          <Text style={styles.small}>
            목표는 절대적인 섭취 상한이 아니에요. 체중 변화와 컨디션에 따라
            조정해 주세요.
          </Text>
          {!!plan.dailyKcal && (
            <Button
              title={details ? "계산 기준 접기" : "계산 기준 보기"}
              secondary
              onPress={() => setDetails(!details)}
            />
          )}
          {details && <Text style={styles.small}>{plan.explanation}</Text>}
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      )}
      <View style={{ gap: 10, marginTop: 16 }}>
        {step < 2 ? (
          <Button
            title={step === 0 ? "다음" : "목표 확인"}
            disabled={busy}
            onPress={next}
          />
        ) : (
          <Button
            title={onboarding ? "이 설정으로 시작하기" : "변경 내용 저장"}
            disabled={busy}
            loading={busy}
            onPress={() => {
              setError("");
              void onSave(draft());
            }}
          />
        )}
        {step > 0 && (
          <Button
            title="이전 단계"
            secondary
            disabled={busy}
            onPress={() => {
              setError("");
              setStep(step - 1);
            }}
          />
        )}
        {onCancel && (
          <Button
            title="설정으로 돌아가기"
            secondary
            disabled={busy}
            onPress={onCancel}
          />
        )}
      </View>
      <Text
        style={[
          styles.small,
          { textAlign: "center", fontSize: 11, marginTop: 8 },
        ]}
      >
        신체 정보는 이 기기에만 저장돼요. Gemini에 전송하지 않아요.
      </Text>
    </View>
  );
}
