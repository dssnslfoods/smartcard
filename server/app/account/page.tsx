"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  ShieldCheck,
  KeyRound,
  Mail,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  role: "user" | "admin" | "super_admin";
  company_id: string | null;
};

type Company = { id: string; name: string };

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);

          // Get company name if applicable
          if (data.profile?.company_id) {
            const cRes = await fetch("/api/companies", { cache: "no-store" });
            if (cRes.ok) {
              const cData = await cRes.json();
              const c = (cData.companies ?? []).find(
                (x: Company) => x.id === data.profile.company_id
              );
              if (c) setCompany(c);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPwd !== confirmPwd) {
      setError("รหัสผ่านใหม่และยืนยันไม่ตรงกัน");
      return;
    }
    if (newPwd.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSuccess(true);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <div className="h-32 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  const roleLabel =
    profile.role === "super_admin"
      ? "Super Admin"
      : profile.role === "admin"
      ? "Admin"
      : "User";
  const roleColor =
    profile.role === "super_admin"
      ? "bg-violet-100 text-violet-700"
      : profile.role === "admin"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">บัญชีของฉัน</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          ข้อมูลบัญชีและความปลอดภัย
        </p>
      </header>

      {/* Profile info card */}
      <Card className="shadow-soft">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 text-white flex items-center justify-center text-xl font-bold shadow-glow-primary">
              {(profile.display_name || profile.email)
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-lg truncate">
                  {profile.display_name || profile.email}
                </h2>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${roleColor} inline-flex items-center gap-1`}
                >
                  {profile.role === "super_admin" || profile.role === "admin" ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5 border-t pt-4">
            <Row icon={Mail} label="อีเมล" value={profile.email} />
            {company && (
              <Row icon={Building2} label="บริษัท" value={company.name} />
            )}
            {profile.role === "super_admin" && (
              <Row
                icon={ShieldCheck}
                label="สิทธิ์"
                value="จัดการได้ทั่วทั้งระบบ (ทุกบริษัท)"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Change password card */}
      <Card className="shadow-soft">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-xl bg-primary/10 text-primary p-2">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold">เปลี่ยนรหัสผ่าน</h2>
              <p className="text-xs text-muted-foreground">
                ต้องยืนยันรหัสปัจจุบันก่อน
              </p>
            </div>
          </div>

          <form onSubmit={onChangePassword} className="space-y-3">
            <div>
              <Label className="mb-1.5 block">รหัสผ่านปัจจุบัน</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-muted-foreground hover:text-foreground"
                  aria-label="แสดง/ซ่อนรหัสผ่าน"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">รหัสผ่านใหม่</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-muted-foreground hover:text-foreground"
                  aria-label="แสดง/ซ่อนรหัสผ่าน"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                อย่างน้อย 6 ตัวอักษร
              </p>
            </div>

            <div>
              <Label className="mb-1.5 block">ยืนยันรหัสผ่านใหม่</Label>
              <Input
                type={showNew ? "text" : "password"}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 flex items-start gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>เปลี่ยนรหัสผ่านเรียบร้อย ✓</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                saving || !currentPwd || !newPwd || !confirmPwd
              }
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  เปลี่ยนรหัสผ่าน
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
