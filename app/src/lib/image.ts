import * as ImageManipulator from "expo-image-manipulator";

export async function prepareForUpload(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1600 } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );
  if (!result.base64) {
    throw new Error("ไม่สามารถแปลงรูปเป็น base64 ได้");
  }
  return result.base64;
}
