"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import type { Profile, Company } from "@/lib/supabase/types";

type Draft = {
  id?: string;
  email: string;
  display_name: string;
  password: string;
  role: "user" | "admin" | "super_admin";
  company_id: string | null;
};

const empty = (): Draft => ({
  email: "",
  display_name: "",
  password: "",
  role: "user",
  company_id: null,
});

type Me = { role: string; company_id: string | null };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, profileRes] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/profile", { cache: "no-store" }),
      ]);
      if (!usersRes.ok) {
        const j = await usersRes.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${usersRes.status}`);
      }
      const data = (await usersRes.json()) as {
        users: Profile[];
        companies: Company[];
      };
      setUsers(data.users ?? []);
      setCompanies(data.companies ?? []);
      const profileData = await profileRes.json();
      setMe(profileData.profile ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = () => {
    setEditing(empty());
    setIsNew(true);
  };

  const onEdit = (u: Profile) => {
    setEditing({
      id: u.id,
      email: u.email,
      display_name: u.display_name ?? "",
      password: "",
      role: u.role,
      company_id: u.company_id,
    });
    setIsNew(false);
  };

  const onDelete = async (u: Profile) => {
    if (!confirm(`ลบ user "${u.email}" ใช่ไหม?`)) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">จัดการผู้ใช้</h1>
          <p className="text-sm text-muted-foreground">
            สร้างบัญชีให้ทีมงาน + กำหนด role
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[72px] rounded-xl border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : (
        users.map((u) => (
          <Card key={u.id} className="card-hover shadow-soft">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={`rounded-full p-2 ${
                  u.role === "admin"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {u.role === "admin" ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">
                    {u.display_name || u.email}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded ${
                      u.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {u.email}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(u)}
                title="แก้ไข"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(u)}
                title="ลบ"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {editing && (
        <UserEditor
          user={editing}
          isNew={isNew}
          isSuperAdmin={me?.role === "super_admin"}
          companies={companies}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function UserEditor({
  user,
  isNew,
  isSuperAdmin,
  companies,
  onClose,
  onSaved,
}: {
  user: Draft;
  isNew: boolean;
  isSuperAdmin: boolean;
  companies: Company[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(user);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSave = async () => {
    if (isNew && (!draft.email || !draft.password)) {
      setErr("กรุณาใส่อีเมลและรหัสผ่าน");
      return;
    }
    if (isNew && draft.password.length < 6) {
      setErr("รหัสผ่านต้อง 6 ตัวอักษรขึ้นไป");
      return;
    }
    if (!isNew && draft.password && draft.password.length < 6) {
      setErr("รหัสผ่านต้อง 6 ตัวอักษรขึ้นไป");
      return;
    }
    if (
      isSuperAdmin &&
      isNew &&
      draft.role !== "super_admin" &&
      !draft.company_id
    ) {
      setErr("กรุณาเลือกบริษัทสังกัด");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (isNew) {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: draft.email,
            password: draft.password,
            display_name: draft.display_name || null,
            role: draft.role,
            company_id:
              draft.role === "super_admin" ? null : draft.company_id,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
      } else {
        const body: Record<string, unknown> = {
          display_name: draft.display_name || null,
          role: draft.role,
        };
        if (draft.password) body.password = draft.password;
        const res = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-md sm:rounded-xl shadow-xl flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold">
            {isNew ? "เพิ่มผู้ใช้ใหม่" : `แก้ไข: ${user.email}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {err && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {err}
            </div>
          )}

          <div>
            <Label className="mb-1.5 block">
              อีเมล <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              value={draft.email}
              onChange={(e) =>
                setDraft((d) => ({ ...d, email: e.target.value }))
              }
              disabled={!isNew}
            />
          </div>

          <div>
            <Label className="mb-1.5 block">ชื่อ-นามสกุล</Label>
            <Input
              value={draft.display_name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, display_name: e.target.value }))
              }
            />
          </div>

          <div>
            <Label className="mb-1.5 block">
              รหัสผ่าน {isNew && <span className="text-destructive">*</span>}
              {!isNew && (
                <span className="text-xs text-muted-foreground ml-1">
                  (เว้นว่างถ้าไม่เปลี่ยน)
                </span>
              )}
            </Label>
            <Input
              type="password"
              value={draft.password}
              onChange={(e) =>
                setDraft((d) => ({ ...d, password: e.target.value }))
              }
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div>
            <Label className="mb-1.5 block">Role</Label>
            <select
              value={draft.role}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  role: e.target.value as "user" | "admin" | "super_admin",
                }))
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="user">User (สแกนนามบัตรเท่านั้น)</option>
              <option value="admin">Admin (จัดการบริษัทตัวเอง)</option>
              {isSuperAdmin && (
                <option value="super_admin">Super Admin (จัดการทั้งระบบ)</option>
              )}
            </select>
          </div>

          {isSuperAdmin && draft.role !== "super_admin" && (
            <div>
              <Label className="mb-1.5 block">
                บริษัทสังกัด <span className="text-destructive">*</span>
              </Label>
              <select
                value={draft.company_id ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    company_id: e.target.value || null,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— เลือกบริษัท —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="border-t px-5 py-3 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "กำลังบันทึก..." : isNew ? "สร้างผู้ใช้" : "บันทึก"}
          </Button>
        </div>
      </div>
    </div>
  );
}
