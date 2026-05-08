import * as Device from "expo-device";

export function getDeviceLabel(): string {
  const name = Device.deviceName?.trim();
  if (name) return name;
  const model = Device.modelName?.trim();
  if (model) return model;
  return "Unknown Device";
}
