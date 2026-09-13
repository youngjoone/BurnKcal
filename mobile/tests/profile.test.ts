import assert from "node:assert/strict";
import test from "node:test";
import { Profile, caloriePlan, validateProfile } from "../src/domain/profile";
const profile: Profile = {
  heightCm: 170,
  currentKg: 70,
  targetKg: 65,
  age: 30,
  sex: "male",
  activity: "low",
  specialCare: false,
};
test("target uses current body, activity and bounded goal direction", () => {
  assert.equal(caloriePlan(profile).dailyKcal, 1650);
  assert.equal(caloriePlan({ ...profile, targetKg: 70 }).dailyKcal, 1950);
  assert.ok(caloriePlan({ ...profile, activity: "high" }).dailyKcal! > 1650);
});
test("does not offer restrictive targets or special population plans", () => {
  assert.equal(
    caloriePlan({ ...profile, sex: "female", currentKg: 55, targetKg: 54 })
      .dailyKcal,
    1500,
  );
  for (const p of [
    { ...profile, age: 17 },
    { ...profile, specialCare: true },
    { ...profile, targetKg: 40 },
  ])
    assert.equal(caloriePlan(p).dailyKcal, null);
});
test("rejects invalid profile values", () => {
  for (const p of [
    { ...profile, heightCm: NaN },
    { ...profile, age: 30.5 },
    { ...profile, activity: "invalid" },
    { ...profile, currentKg: "70" },
  ])
    assert.throws(() => validateProfile(p));
});
