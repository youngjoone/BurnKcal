import { uploadFile } from "./uploadFile";
import { isAnalysisResult, MealPhoto, AnalysisMode } from "../types/analysis";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/+$/, "");

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        body &&
        typeof body === "object" &&
        "message" in body &&
        typeof body.message === "string"
          ? body.message
          : `요청을 처리하지 못했어요. (${response.status})`;
      throw new Error(message);
    }
    return body;
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error(
        "서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.",
      );
    if (error instanceof TypeError)
      throw new Error(
        "서버에 연결할 수 없어요. 서버 실행 상태와 API 주소, Wi-Fi 연결을 확인해 주세요.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkServer(): Promise<AnalysisMode> {
  const value = await request("/api/health");
  if (
    !value ||
    typeof value !== "object" ||
    !("status" in value) ||
    value.status !== "ok" ||
    !("analysisMode" in value) ||
    (value.analysisMode !== "demo" && value.analysisMode !== "ai")
  ) {
    throw new Error(
      "서버 상태 응답을 확인할 수 없어요. API 주소를 확인해 주세요.",
    );
  }
  return value.analysisMode;
}

export async function analyzePhoto(photo: MealPhoto, note: string) {
  const form = new FormData();
  form.append("image", await uploadFile(photo.uri), "meal.jpg");
  form.append("note", note.trim());
  // The runtime supplies Content-Type with the multipart boundary.
  const result = await request("/api/analyze", { method: "POST", body: form });
  if (!isAnalysisResult(result))
    throw new Error("분석 결과 형식이 올바르지 않아요. 다시 시도해 주세요.");
  return result;
}
