"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact } from "@/lib/contact";

type Props = {
  contact: Contact | null;
  onClose: () => void;
  onSaved: () => void;
};

const FIELDS: { key: keyof Contact; label: string; multiline?: boolean }[] = [
  { key: "name", label: "ชื่อ" },
  { key: "position", label: "ตำแหน่ง" },
  { key: "company", label: "บริษัท" },
  { key: "phone", label: "โทรศัพท์" },
  { key: "email", label: "อีเมล" },
  { key: "website", label: "เว็บไซต์" },
  { key: "address", label: "ที่อยู่", multiline: true },
];

export function EditDialog({ contact, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Contact | null>(contact);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(contact);
    setError(null);
  }, [contact]);

  if (!form) return null;

  const update = (key: keyof Contact, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const onSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rowIndex: form.rowIndex,
          card: {
            name: form.name,
            position: form.position,
            company: form.company,
            phone: form.phone,
            email: form.email,
            website: form.website,
            address: form.address,
          },
          device: form.device,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!contact} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลนามบัตร</DialogTitle>
          <DialogDescription>
            {form.date} • บันทึกโดย {form.device || "—"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
              <Label htmlFor={f.key} className="mb-1.5 block">
                {f.label}
              </Label>
              {f.multiline ? (
                <textarea
                  id={f.key}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              ) : (
                <Input
                  id={f.key}
                  value={String(form[f.key] ?? "")}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
