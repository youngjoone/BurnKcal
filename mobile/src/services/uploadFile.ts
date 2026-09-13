import { File } from "expo-file-system";
export async function uploadFile(uri: string): Promise<Blob> {
  const file = new File(uri);
  if (!file.exists || file.size <= 0)
    throw new Error("사진 파일을 읽을 수 없어요. 다시 선택해 주세요.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("사진은 5MB 이하로 선택해 주세요.");
  return file;
}
