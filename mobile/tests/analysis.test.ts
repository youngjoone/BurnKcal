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
