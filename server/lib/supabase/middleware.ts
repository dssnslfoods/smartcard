/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicPath =
    path === "/login" ||
    path.startsWith("/api/auth") ||
    path === "/favicon.ico" ||
    path.startsWith("/_next");

  const isApiPath = path.startsWith("/api/");

  if (!user && !isPublicPath) {
    if (isApiPath) {
      return new NextResponse(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (path !== "/") url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Role-based gating for admin paths
  if (user && (path.startsWith("/admin") || path.startsWith("/dashboard"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin =
      profile && (profile.role === "admin" || profile.role === "super_admin");
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/scan";
      return NextResponse.redirect(url);
    }

    // /admin/companies is super_admin only
    if (path.startsWith("/admin/companies") && profile.role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Logged in but on /login → redirect by role
  if (user && path === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin =
      profile && (profile.role === "admin" || profile.role === "super_admin");
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/dashboard" : "/scan";
    return NextResponse.redirect(url);
  }

  // Root: redirect by role
  if (user && path === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin =
      profile && (profile.role === "admin" || profile.role === "super_admin");
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/dashboard" : "/scan";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
