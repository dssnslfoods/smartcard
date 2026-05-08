import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasSheetId: Boolean(process.env.GOOGLE_SHEET_ID),
    hasServiceAccount: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
  });
}
