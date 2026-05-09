"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Shuffle,
  Clock,
} from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginAurora />
    </Suspense>
  );
}

function LoginAurora() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(
          error.message.toLowerCase().includes("invalid")
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : error.message
        );
        return;
      }
      window.location.href = next;
    });
  };

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.05fr_1fr] bg-white text-slate-900 overflow-hidden">
      {/* LEFT — Hero panel */}
      <aside
        className="relative overflow-hidden hidden lg:flex flex-col justify-between p-14 xl:p-16"
        style={{
          background:
            "linear-gradient(135deg, #eef1ff 0%, #f5f0ff 50%, #eaf2ff 100%)",
        }}
      >
        {/* Animated blobs */}
        <div
          className="bg-blob"
          style={{
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            background: "radial-gradient(circle, #6366F1 0%, transparent 70%)",
            opacity: 0.18,
          }}
        />
        <div
          className="bg-blob"
          style={{
            bottom: -180,
            left: -140,
            width: 480,
            height: 480,
            background: "radial-gradient(circle, #A78BFA 0%, transparent 70%)",
            opacity: 0.2,
            animationDelay: "-6s",
          }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#0B102008 1px, transparent 1px), linear-gradient(90deg, #0B102008 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
            maskImage:
              "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
          }}
        />

        {/* Brand row */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[11px] flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              boxShadow: "0 10px 28px -8px rgba(79,70,229,.5)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="3"
                stroke="#fff"
                strokeWidth="2"
              />
              <circle cx="9" cy="11" r="2" stroke="#fff" strokeWidth="2" />
              <path
                d="M14 10h4M14 13h3M6 17h8"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight">SmartCard</div>
            <div className="text-[11.5px] text-slate-500 font-medium">
              Business Card Intelligence
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 flex flex-col gap-7 mt-4">
          <span
            className="self-start inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              color: "#4F46E5",
              background: "#fff",
              border: "1px solid #E0E7FF",
              boxShadow: "0 1px 2px rgba(15,23,42,.04)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            v3.2 · เร็วขึ้น 40% สำหรับการสแกนบัตร
          </span>
          <h1
            className="font-bold m-0 max-w-[540px]"
            style={{
              fontSize: 42,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            เปลี่ยนนามบัตรเป็น
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #4F46E5, #7C3AED 60%, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              โอกาสทางธุรกิจ
            </span>
          </h1>
          <p
            className="m-0 max-w-[480px] text-slate-600"
            style={{ fontSize: 16, lineHeight: 1.6 }}
          >
            สแกน จัดเก็บ และติดตามทุกการติดต่อในที่เดียว — แพลตฟอร์มที่ทีมขายและการตลาดเลือกใช้เพื่อปิดดีลได้เร็วกว่า
          </p>
        </div>

        {/* Scanner mock */}
        <div
          className="relative z-10 flex items-center justify-center"
          style={{ height: 300, perspective: "1400px" }}
        >
          {/* Back card */}
          <div
            className="absolute overflow-hidden"
            style={{
              width: 340,
              height: 200,
              borderRadius: 18,
              background: "linear-gradient(135deg, #1E1B4B, #312E81)",
              transform: "translateY(28px) translateX(-90px) rotate(-9deg)",
              boxShadow: "0 30px 60px -20px rgba(15,23,42,.35)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 80% 0%, rgba(167,139,250,.4), transparent 60%)",
              }}
            />
            <div
              className="absolute"
              style={{
                left: 24,
                top: 24,
                fontSize: 10,
                fontWeight: 600,
                color: "rgba(255,255,255,.5)",
                letterSpacing: ".18em",
              }}
            >
              SCANNED · 2 มิ.ย.
            </div>
            <div
              className="absolute text-white font-semibold"
              style={{ left: 24, bottom: 24, fontSize: 14 }}
            >
              Sarawut · CTO, Lumen Co.
            </div>
          </div>

          {/* Front card */}
          <div
            className="relative bg-white aurora-float-card overflow-hidden"
            style={{
              width: 380,
              height: 230,
              borderRadius: 20,
              boxShadow:
                "0 30px 80px -20px rgba(15,23,42,.25), 0 0 0 1px rgba(15,23,42,.04)",
              padding: 24,
              transform: "rotate(2deg)",
            }}
          >
            {/* Corner brackets */}
            {[
              {
                top: 10,
                left: 10,
                bt: true,
                bl: true,
                radius: { topLeft: 6 },
              },
              {
                top: 10,
                right: 10,
                bt: true,
                br: true,
                radius: { topRight: 6 },
              },
              {
                bottom: 10,
                left: 10,
                bb: true,
                bl: true,
                radius: { bottomLeft: 6 },
              },
              {
                bottom: 10,
                right: 10,
                bb: true,
                br: true,
                radius: { bottomRight: 6 },
              },
            ].map((c, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: 22,
                  height: 22,
                  top: c.top,
                  left: c.left,
                  right: c.right,
                  bottom: c.bottom,
                  borderTop: c.bt ? "2.5px solid #4F46E5" : undefined,
                  borderBottom: c.bb ? "2.5px solid #4F46E5" : undefined,
                  borderLeft: c.bl ? "2.5px solid #4F46E5" : undefined,
                  borderRight: c.br ? "2.5px solid #4F46E5" : undefined,
                  borderTopLeftRadius: c.radius.topLeft,
                  borderTopRightRadius: c.radius.topRight,
                  borderBottomLeftRadius: c.radius.bottomLeft,
                  borderBottomRightRadius: c.radius.bottomRight,
                }}
              />
            ))}

            {/* Scan line */}
            <div
              className="absolute aurora-scan-line"
              style={{
                left: 0,
                right: 0,
                height: 3,
                background:
                  "linear-gradient(90deg, transparent, #4F46E5, #A78BFA, transparent)",
                boxShadow: "0 0 22px 4px rgba(79,70,229,.55)",
              }}
            />

            <div className="flex items-center gap-3.5">
              <div
                className="rounded-full shrink-0"
                style={{
                  width: 54,
                  height: 54,
                  background: "linear-gradient(135deg, #FCA5A5, #F472B6)",
                }}
              />
              <div className="min-w-0">
                <div
                  className="font-bold text-slate-900"
                  style={{ fontSize: 16 }}
                >
                  คุณ ปริญญา วงศ์ภักดี
                </div>
                <div
                  className="text-slate-500 mt-0.5"
                  style={{ fontSize: 12 }}
                >
                  Head of Marketing · Aurora Brands
                </div>
              </div>
            </div>
            <div
              className="mt-4 flex flex-col gap-1.5 text-slate-600"
              style={{ fontSize: 11.5 }}
            >
              {[
                { icon: "@", text: "parinya@aurora.co.th" },
                { icon: "☎", text: "+66 81 234 5678" },
                { icon: "⌂", text: "www.aurora.co.th · BKK" },
              ].map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div
                    className="rounded flex items-center justify-center"
                    style={{
                      width: 18,
                      height: 18,
                      background: "#EEF2FF",
                      color: "#4F46E5",
                      fontSize: 11,
                    }}
                  >
                    {row.icon}
                  </div>
                  {row.text}
                </div>
              ))}
            </div>
            <div
              className="absolute font-bold text-emerald-700 bg-emerald-50"
              style={{
                right: 18,
                top: 18,
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 10,
                letterSpacing: ".06em",
              }}
            >
              OCR · 99.4%
            </div>
          </div>
        </div>

        {/* Bullet cards */}
        <div className="relative z-10 grid grid-cols-3 gap-3.5">
          {[
            {
              c: "#EEF2FF",
              a: "#4F46E5",
              t: "OCR แม่นยำ",
              s: "อ่านนามบัตรไทย-อังกฤษ",
              Icon: Zap,
            },
            {
              c: "#FDF4FF",
              a: "#A21CAF",
              t: "CRM อัตโนมัติ",
              s: "ส่งเข้าทีมขายทันที",
              Icon: Shuffle,
            },
            {
              c: "#ECFEFF",
              a: "#0891B2",
              t: "ติดตาม follow-up",
              s: "แจ้งเตือนตามรอบ",
              Icon: Clock,
            },
          ].map((b, i) => (
            <div
              key={i}
              className="rounded-2xl"
              style={{
                background: "rgba(255,255,255,.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(15,23,42,.06)",
                padding: "14px 16px",
              }}
            >
              <div
                className="flex items-center justify-center mb-2 rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: b.c,
                  color: b.a,
                }}
              >
                <b.Icon className="h-4 w-4" />
              </div>
              <div className="text-[13px] font-semibold text-slate-900">
                {b.t}
              </div>
              <div
                className="text-slate-500 mt-0.5"
                style={{ fontSize: 11.5, lineHeight: 1.4 }}
              >
                {b.s}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT — Form panel */}
      <section className="relative flex flex-col bg-white p-6 sm:p-10 lg:p-[56px_72px]">
        {/* Mobile brand bar */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="3"
                stroke="#fff"
                strokeWidth="2"
              />
              <circle cx="9" cy="11" r="2" stroke="#fff" strokeWidth="2" />
              <path
                d="M14 10h4M14 13h3M6 17h8"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-bold tracking-tight">SmartCard</div>
            <div className="text-[11px] text-slate-500">
              Business Card Intelligence
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[440px] w-full mx-auto">
          <h2
            className="font-bold text-slate-900 m-0"
            style={{ fontSize: 30, letterSpacing: "-0.02em" }}
          >
            ยินดีต้อนรับกลับ 👋
          </h2>
          <p
            className="text-slate-500 mt-2"
            style={{ fontSize: 15, lineHeight: 1.55 }}
          >
            เข้าสู่ระบบเพื่อจัดการนามบัตรและไปป์ไลน์ดีลของคุณ
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5 flex items-start gap-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-5">
            {/* Email */}
            <div className="mt-4">
              <div className="flex justify-between mb-1.5 text-[13px] font-semibold text-slate-700">
                <span>อีเมลที่ทำงาน</span>
              </div>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-[18px] w-[18px] text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  disabled={pending}
                  className="aurora-input w-full bg-white outline-none text-slate-900 transition-all"
                  style={{
                    height: 48,
                    padding: "0 16px 0 44px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 15,
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mt-4">
              <div className="flex justify-between mb-1.5 text-[13px] font-semibold text-slate-700">
                <span>รหัสผ่าน</span>
                <a
                  href="mailto:arnon@def2design.com?subject=ลืมรหัสผ่าน SmartCard"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  ลืมรหัสผ่าน?
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-[18px] w-[18px] text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={pending}
                  className="aurora-input w-full bg-white outline-none text-slate-900 transition-all"
                  style={{
                    height: 48,
                    padding: "0 44px 0 44px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    fontSize: 15,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 p-2 text-slate-500 hover:text-slate-700 rounded-lg"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={pending || !email || !password}
              className="mt-6 w-full text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-transform active:scale-[0.99]"
              style={{
                height: 50,
                borderRadius: 12,
                fontSize: 15,
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                boxShadow: "0 12px 28px -10px rgba(79,70,229,.55)",
              }}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  เข้าสู่ระบบ
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Contact */}
            <p className="text-center text-[13px] text-slate-500 mt-5">
              ยังไม่มีบัญชีหรือมีปัญหา?{" "}
              <a
                href="mailto:arnon@def2design.com?subject=ขอเข้าใช้ SmartCard"
                className="text-indigo-600 font-semibold hover:underline"
              >
                ติดต่อผู้ดูแลระบบ
              </a>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs text-slate-400 mt-6">
          <span>© 2026 Arnon Arpaket — All rights reserved</span>
          <span className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-slate-600">
              ความเป็นส่วนตัว
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-600">
              เงื่อนไข
            </a>
          </span>
        </div>
      </section>

      {/* Aurora-specific input focus styles */}
      <style>{`
        .aurora-input:focus {
          border-color: #4F46E5 !important;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, .12) !important;
        }
      `}</style>
    </div>
  );
}
