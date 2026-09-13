// Web preview uses browser storage; it does not share the iPhone SQLite database.
const namespace = "burnkcal.v1.";
export async function readEntry(key: string): Promise<string | null> {
  return localStorage.getItem(namespace + key);
}
export async function listEntries(prefix: string): Promise<string[]> {
  const values: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(namespace + prefix)) {
      const value = localStorage.getItem(key);
      if (value !== null) values.push(value);
    }
  }
  return values;
}
export async function writeEntry(key: string, value: string) {
  localStorage.setItem(namespace + key, value);
}
export async function insertEntry(
  key: string,
  value: string,
): Promise<boolean> {
  if (localStorage.getItem(namespace + key) !== null) return false;
  localStorage.setItem(namespace + key, value);
  return true;
}
