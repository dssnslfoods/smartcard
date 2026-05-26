/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

// The single account allowed to toggle (and bypass) system inactive mode.
export const SYSTEM_CONTROLLER_EMAIL = "arnon@def2design.com";

export function isSystemController(email?: string | null): boolean {
  return (email ?? "").trim().toLowerCase() === SYSTEM_CONTROLLER_EMAIL;
}
