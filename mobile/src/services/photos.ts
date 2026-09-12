import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import { MealPhoto } from "../types/analysis";

export async function pickPhoto(
  source: "camera" | "library",
): Promise<MealPhoto | null> {
  if (source === "camera" && Platform.OS !== "web") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error(
        "카메라 권한이 필요해요. 아이폰 설정에서 카메라 접근을 허용하거나 앨범에서 사진을 선택해 주세요.",
      );
    }
  }
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.8,
    exif: false,
  };
  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return null;
  const asset = result.assets[0];
  // Normalize HEIC/PNG and large phone photos to a bounded JPEG before upload.
  const context = ImageManipulator.manipulate(asset.uri);
  try {
    if (Math.max(asset.width, asset.height) > 1600) {
      context.resize(
        asset.width >= asset.height ? { width: 1600 } : { height: 1600 },
      );
    }
    const rendered = await context.renderAsync();
    try {
      return await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.8,
      });
    } finally {
      rendered.release();
    }
  } finally {
    context.release();
  }
}
