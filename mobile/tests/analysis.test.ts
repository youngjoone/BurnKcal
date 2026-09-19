import assert from "node:assert/strict";
import test from "node:test";
import { isAnalysisResult } from "../src/types/analysis";

const sample = {
  mode: "demo",
  title: "샘플 식사",
  totalKcal: 650,
  range: { min: 500, max: 800 },
  items: [{ name: "밥", portion: "예시", kcal: 650 }],
  notices: ["실제 AI 분석이 아닙니다."],
};

test("accepts the server result contract and preserves demo mode", () => {
  assert.equal(isAnalysisResult(sample), true);
  assert.equal(isAnalysisResult({ ...sample, mode: "ai" }), true);
});

test("rejects missing or unknown mode instead of displaying it as real AI", () => {
  assert.equal(isAnalysisResult({ ...sample, mode: undefined }), false);
  assert.equal(isAnalysisResult({ ...sample, mode: "unknown" }), false);
});

test("rejects negative, nonfinite, and inverted calorie ranges", () => {
  for (const totalKcal of [-1, NaN, Infinity, "650"]) {
    assert.equal(isAnalysisResult({ ...sample, totalKcal }), false);
  }
  assert.equal(
    isAnalysisResult({ ...sample, range: { min: 800, max: 500 } }),
    false,
  );
  assert.equal(
    isAnalysisResult({ ...sample, range: { min: 100, max: 200 } }),
    false,
  );
});

test("rejects malformed response bodies and food items without throwing", () => {
  for (const value of [
    null,
    [],
    "html error",
    {},
    { ...sample, items: [null] },
    { ...sample, items: [] },
    { ...sample, notices: [42] },
    { ...sample, range: null },
  ]) {
    assert.equal(isAnalysisResult(value), false);
  }
});

test("validates multi-food totals instead of accepting inconsistent AI numbers", () => {
  const items = [
    { name: "밥", portion: "1공기", kcal: 300 },
    { name: "닭고기", portion: "1인분", kcal: 250 },
    { name: "반찬", portion: "소량", kcal: 100 },
  ];
  assert.equal(isAnalysisResult({ ...sample, items }), true);
  assert.equal(isAnalysisResult({ ...sample, items, totalKcal: 700 }), false);
  assert.equal(
    isAnalysisResult({
      ...sample,
      items: [{ ...items[0], kcal: 650.5 }],
      totalKcal: 650.5,
    }),
    false,
  );
});

test("food name requests default to one serving and preserve explicit portion assumptions", async () => {
  const { textAnalysisRequest } = await import("../src/types/analysis");
  assert.deepEqual(textAnalysisRequest(" 순대국 ", " "), {
    foodName: "순대국",
    portion: "1인분",
  });
  assert.deepEqual(textAnalysisRequest("순대국", "밥 포함"), {
    foodName: "순대국",
    portion: "밥 포함",
  });
  assert.throws(() => textAnalysisRequest(" ", ""));
  assert.throws(() => textAnalysisRequest("가".repeat(101), ""));
  assert.throws(() => textAnalysisRequest("순대국", "가".repeat(201)));
});
