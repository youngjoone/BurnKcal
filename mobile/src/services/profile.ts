import { Profile, validateProfile } from "../domain/profile";
import { readEntry, writeEntry } from "./database";
export async function loadProfile(): Promise<Profile | null> {
  const value = await readEntry("profile");
  return value === null ? null : validateProfile(JSON.parse(value));
}
export async function saveProfile(profile: Profile) {
  await writeEntry("profile", JSON.stringify(validateProfile(profile)));
}
