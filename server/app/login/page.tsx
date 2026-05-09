"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ContactRound, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setError(error.message);
        return;
      }
      // Hard navigation so cookies are guaranteed flushed before middleware runs
      window.location.href = next;
    });
  };

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50">
      {/* Decorative animated blobs */}
      <div
        className="bg-blob bg-blue-300"
        style={{ width: 380, height: 380, top: -120, left: -100 }}
      />
      <div
        className="bg-blob bg-indigo-300"
        style={{
          width: 320,
          height: 320,
          bottom: -100,
          right: -80,
          animationDelay: "-6s",
        }}
      />
      <div
        className="bg-blob bg-violet-200"
        style={{
          width: 260,
          height: 260,
          top: "40%",
          right: "15%",
          animationDelay: "-12s",
          opacity: 0.35,
        }}
      />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="relative w-full max-w-md shadow-soft-lg border-white/40 backdrop-blur-md bg-white/85 animate-fade-up">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-md" />
              <div className="relative rounded-2xl bg-gradient-to-br from-primary to-indigo-500 p-4 mb-3 shadow-glow-primary">
                <ContactRound className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">
              SmartCard
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              เข้าสู่ระบบเพื่อเริ่มใช้งาน
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={pending}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={pending}
                className="mt-1.5"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={pending || !email || !password}
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                "เข้าสู่ระบบ"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            ติดต่อผู้ดูแลระบบหากยังไม่มีบัญชี
          </p>
        </CardContent>
        </Card>
      </main>

      <footer className="relative px-4 pb-4 pt-2 text-center text-xs text-muted-foreground/80">
        © 2026 <span className="font-medium">Arnon Arpaket</span> — All rights reserved
      </footer>
    </div>
  );
}
