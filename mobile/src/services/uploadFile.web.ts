export async function uploadFile(uri: string): Promise<Blob> {
  const blob = await (await fetch(uri)).blob();
  if (blob.size > 5 * 1024 * 1024)
    throw new Error("사진은 5MB 이하로 선택해 주세요.");
  return blob;
}
