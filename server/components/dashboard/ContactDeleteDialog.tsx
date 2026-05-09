"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Trash2, X } from "lucide-react";

export type DeleteTarget = {
  id: string;
  name: string | null;
  company: string | null;
};

export function ContactDeleteDialog({
  target,
  onClose,
  onDeleted,
}: {
  target: DeleteTarget | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!target) return null;

  const onConfirm = async () => {
    setDeleting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/contacts/${target.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      onDeleted();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background w-full max-w-sm rounded-xl shadow-soft-lg flex flex-col">
        <div className="border-b px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" />
            ลบรายการนามบัตร
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm">
            คุณต้องการลบรายการนี้ใช่ไหม?
          </p>
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            <div className="font-medium">{target.name || "—"}</div>
            {target.company && (
              <div className="text-xs text-muted-foreground">
                {target.company}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            • รายการ scan นี้จะถูกลบถาวรออกจากฐานข้อมูล
            <br />
            • ถ้าเป็น scan สุดท้ายของลูกค้า → ลบนามบัตรหลักด้วย
            <br />
            • รูปใน Storage ยังคงอยู่ (ลบเองได้ถ้าต้องการ)
          </p>

          {err && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{err}</span>
            </div>
          )}
        </div>

        <div className="border-t px-5 py-3 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            ยกเลิก
          </Button>
          <Button
            onClick={onConfirm}
            disabled={deleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                ลบ
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
