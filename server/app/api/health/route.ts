/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasSheetId: Boolean(process.env.GOOGLE_SHEET_ID),
    hasServiceAccount: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL),
  });
}
