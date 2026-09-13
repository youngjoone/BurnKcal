export type Profile = {
  heightCm: number;
  currentKg: number;
  targetKg: number;
  age: number;
  sex: "female" | "male";
  activity: "low" | "moderate" | "high";
  specialCare: boolean;
};
export type CaloriePlan = { dailyKcal: number | null; explanation: string };
export function validateProfile(value: unknown): Profile {
  if (!value || typeof value !== "object")
    throw new Error("신체 정보를 입력해 주세요.");
  const p = value as Profile;
  for (const [value, min, max, label] of [
    [p.heightCm, 100, 230, "키"],
    [p.currentKg, 25, 300, "현재 체중"],
    [p.targetKg, 25, 300, "목표 체중"],
    [p.age, 1, 120, "나이"],
  ] as const) {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max
    )
      throw new Error(`${label}는 ${min}~${max} 범위로 입력해 주세요.`);
  }
  if (
    !Number.isInteger(p.age) ||
    !["female", "male"].includes(p.sex) ||
    !["low", "moderate", "high"].includes(p.activity) ||
    typeof p.specialCare !== "boolean"
  )
    throw new Error("계산에 필요한 항목을 모두 선택해 주세요.");
  return {
    heightCm: p.heightCm,
    currentKg: p.currentKg,
    targetKg: p.targetKg,
    age: p.age,
    sex: p.sex,
    activity: p.activity,
    specialCare: p.specialCare,
  };
}
export function caloriePlan(input: Profile): CaloriePlan {
  const p = validateProfile(input);
  if (p.age < 18 || p.age > 80 || p.specialCare)
    return {
      dailyKcal: null,
      explanation:
        "자동 목표는 일반 성인용이에요. 미성년자, 80세 초과, 임신·수유 또는 의료진의 식사 관리가 필요한 경우 목표를 자동 제안하지 않아요. 식사 기록은 사용할 수 있어요.",
    };
  const heightM = p.heightCm / 100;
  if (Math.min(p.currentKg, p.targetKg) / heightM ** 2 < 18.5)
    return {
      dailyKcal: null,
      explanation:
        "현재 또는 목표 체중이 낮은 범위에 있어요. 자동 감량 목표 대신 의료진과 적절한 목표를 정해 주세요. 식사 기록은 사용할 수 있어요.",
    };
  const resting =
    10 * p.currentKg +
    6.25 * p.heightCm -
    5 * p.age +
    (p.sex === "male" ? 5 : -161);
  const activity = { low: 1.2, moderate: 1.4, high: 1.6 }[p.activity];
  const change =
    p.targetKg < p.currentKg - 0.5
      ? -300
      : p.targetKg > p.currentKg + 0.5
        ? 200
        : 0;
  const estimate = Math.round((resting * activity + change) / 50) * 50;
  if (estimate > 4000)
    return {
      dailyKcal: null,
      explanation:
        "일반적인 자동 계산 범위를 벗어났어요. 개인 목표는 전문가와 정해 주세요.",
    };
  return {
    dailyKcal: Math.max(1500, estimate),
    explanation:
      "기초대사량 추정식과 활동량으로 계산한 시작 목표예요. 감량은 하루 300 kcal를 조정하며 앱은 1,500 kcal 미만의 자동 목표를 제안하지 않아요. 개인에게 충분한 섭취량이라는 보장은 아니며 체중 변화·컨디션에 따라 재평가가 필요해요.",
  };
}
