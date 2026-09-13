import {
  DEFAULT_PREFERENCES,
  Preferences,
  validatePreferences,
} from "../domain/recommendations";
import { readEntry, writeEntry } from "./database";
export async function loadPreferences(): Promise<Preferences> {
  const value = await readEntry("preferences");
  return value === null
    ? DEFAULT_PREFERENCES
    : validatePreferences(JSON.parse(value));
}
export async function savePreferences(value: Preferences) {
  await writeEntry("preferences", JSON.stringify(validatePreferences(value)));
}
