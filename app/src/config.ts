import Constants from "expo-constants";

const fromExtra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;

export const API_BASE_URL = fromExtra && fromExtra !== "REPLACE_WITH_YOUR_VERCEL_URL"
  ? fromExtra.replace(/\/$/, "")
  : "";

export const ASSERT_API_BASE_URL = () => {
  if (!API_BASE_URL) {
    throw new Error(
      "ยังไม่ได้ตั้ง apiBaseUrl ใน app.json (extra.apiBaseUrl) — กรุณาใส่ URL ของ backend ก่อนใช้งาน"
    );
  }
};
