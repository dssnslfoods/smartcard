"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  Save,
  Building2,
} from "lucide-react";
import type { Company } from "@/lib/supabase/types";

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  active: boolean;
};

const empty = (): Draft => ({
  name: "",
  slug: "",
  description: "",
  logo_url: "",
  active: true,
});

function autoSlug(name: string): string {
  const slug = (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length >= 2) return slug;
  return `company-${Date.now().toString(36)}`;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/companies?all=1", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { companies: Company[] };
      setCompanies(data.companies ?? []);
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

  const onEdit = (c: Company) => {
    setEditing({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      logo_url: c.logo_url ?? "",
      active: c.active,
    });
    setIsNew(false);
  };

  const onDelete = async (c: Company) => {
    if (
      !confirm(
        `Archive company "${c.name}" ใช่ไหม?\n• ข้อมูลทั้งหมดของบริษัทนี้จะยังเก็บไว้\n• แต่ user ของบริษัทจะไม่สามารถใช้งานได้`
      )
    )
      return;
    try {
      const res = await fetch(`/api/companies/${c.id}`, { method: "DELETE" });
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
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            จัดการบริษัท
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            สร้าง/แก้ไขบริษัท และจัดการ admin ของแต่ละบริษัท
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4" />
          เพิ่มบริษัท
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
              className="h-[88px] rounded-xl border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            ยังไม่มีบริษัท — กด "เพิ่มบริษัท" เพื่อเริ่มสร้าง
          </CardContent>
        </Card>
      ) : (
        companies.map((c) => (
          <Card
            key={c.id}
            className={`card-hover shadow-soft ${c.archived_at ? "opacity-60" : ""}`}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold truncate">{c.name}</span>
                  {c.archived_at && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      archived
                    </span>
                  )}
                  {!c.active && !c.archived_at && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      inactive
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  slug: <code>{c.slug}</code>
                  {c.description && ` · ${c.description}`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(c)}
                title="แก้ไข"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {!c.archived_at && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(c)}
                  title="Archive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {editing && (
        <CompanyEditor
          company={editing}
          isNew={isNew}
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

function CompanyEditor({
  company,
  isNew,
  onClose,
  onSaved,
}: {
  company: Draft;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(company);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSave = async () => {
    if (!draft.name.trim()) {
      setErr("ใส่ชื่อบริษัท");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (isNew) {
        const slug = draft.slug.trim() || autoSlug(draft.name);
        const res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.name,
            slug,
            description: draft.description || null,
            logo_url: draft.logo_url || null,
            active: draft.active,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `HTTP ${res.status}`);
        }
      } else {
        const res = await fetch(`/api/companies/${company.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.name,
            description: draft.description || null,
            logo_url: draft.logo_url || null,
            active: draft.active,
          }),
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
            {isNew ? "เพิ่มบริษัทใหม่" : `แก้ไข: ${company.name}`}
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
              ชื่อบริษัท <span className="text-destructive">*</span>
            </Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="เช่น NSL FOODS PLC."
            />
            {isNew && (
              <p className="text-xs text-muted-foreground mt-1">
                รหัสภายในจะเป็น{" "}
                <code className="text-foreground bg-muted px-1 rounded">
                  {draft.slug.trim() || autoSlug(draft.name)}
                </code>
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">รายละเอียด (ไม่บังคับ)</Label>
            <Textarea
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              rows={2}
            />
          </div>

          <div>
            <Label className="mb-1.5 block">Logo URL (ไม่บังคับ)</Label>
            <Input
              type="url"
              value={draft.logo_url}
              onChange={(e) =>
                setDraft((d) => ({ ...d, logo_url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) =>
                setDraft((d) => ({ ...d, active: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <span className="text-sm">Active</span>
          </label>
        </div>

        <div className="border-t px-5 py-3 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "กำลังบันทึก..." : isNew ? "สร้างบริษัท" : "บันทึก"}
          </Button>
        </div>
      </div>
    </div>
  );
}
