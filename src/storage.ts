export type RecordBook = { best: number; runs: number; sound: boolean };
export const STORAGE_KEY = "flappy-pepe-v1";
const defaults = (): RecordBook => ({ best: 0, runs: 0, sound: false });
export function readRecords(storage: Pick<Storage, "getItem">): RecordBook {
  try {
    const raw: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return defaults();
    const value = raw as Record<string, unknown>;
    const integer = (n: unknown) =>
      typeof n === "number" && Number.isSafeInteger(n) && n >= 0 ? n : 0;
    return {
      best: integer(value.best),
      runs: integer(value.runs),
      sound: value.sound === true,
    };
  } catch {
    return defaults();
  }
}
export function saveRecords(
  storage: Pick<Storage, "setItem">,
  records: RecordBook,
): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}
