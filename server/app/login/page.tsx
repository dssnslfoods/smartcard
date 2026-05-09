"use client";
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
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="rounded-2xl bg-primary/10 p-4 mb-3">
              <ContactRound className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">SmartCard</h1>
            <p className="text-sm text-muted-foreground mt-1">
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
    </div>
  );
}
