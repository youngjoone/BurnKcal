import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
let connection: Promise<SQLiteDatabase> | undefined;
async function db() {
  connection ??= (async () => {
    const database = await openDatabaseAsync("burnkcal.db");
    const version = await database.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version",
    );
    if ((version?.user_version ?? 0) > 1)
      throw new Error(
        "저장 데이터가 더 최신 버전이에요. 앱을 업데이트해 주세요.",
      );
    await database.execAsync(
      "PRAGMA journal_mode = WAL; CREATE TABLE IF NOT EXISTS entries (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL); PRAGMA user_version = 1;",
    );
    return database;
  })().catch((error) => {
    connection = undefined;
    throw error;
  });
  return connection;
}
export async function readEntry(key: string): Promise<string | null> {
  return (
    (
      await (
        await db()
      ).getFirstAsync<{ value: string }>(
        "SELECT value FROM entries WHERE key = ?",
        key,
      )
    )?.value ?? null
  );
}
export async function listEntries(prefix: string): Promise<string[]> {
  return (
    await (
      await db()
    ).getAllAsync<{ value: string }>(
      "SELECT value FROM entries WHERE key LIKE ?",
      `${prefix}%`,
    )
  ).map((row) => row.value);
}
export async function writeEntry(key: string, value: string) {
  await (
    await db()
  ).runAsync(
    "INSERT INTO entries (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key,
    value,
  );
}
export async function insertEntry(
  key: string,
  value: string,
): Promise<boolean> {
  return (
    (
      await (
        await db()
      ).runAsync(
        "INSERT OR IGNORE INTO entries (key, value) VALUES (?, ?)",
        key,
        value,
      )
    ).changes === 1
  );
}
