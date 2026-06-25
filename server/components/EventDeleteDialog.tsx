"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowRightLeft,
  Loader2,
  Trash2,
  AlertCircle,
  Info,
} from "lucide-react";

export type EventLite = {
  id: string;
  name: string;
  slug: string;
};

type Mode = "move" | "delete_cards";

export function EventDeleteDialog({
  event,
  otherEvents,
  open,
  onOpenChange,
  onDone,
}: {
  event: EventLite | null;
  otherEvents: EventLite[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
}) {
  const [count, setCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const [mode, setMode] = useState<Mode>("delete_cards");
  const [moveTo, setMoveTo] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available target events (excluding this one)
  const targets = useMemo(
    () => otherEvents.filter((e) => e.id !== event?.id),
    [otherEvents, event]
  );

  useEffect(() => {
    if (!open || !event) return;
    // Default: move (if there are other events to move into); otherwise hard-delete.
    setMode(targets.length > 0 ? "move" : "delete_cards");
    setMoveTo(targets[0]?.id ?? "");
    setError(null);
    setCount(null);
    setLoadingCount(true);
    (async () => {
      try {
        const res = await fetch(`/api/events/${event.id}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setCount(
            typeof data.attendanceCount === "number" ? data.attendanceCount : 0
          );
        } else {
          setCount(0);
        }
      } catch {
        setCount(0);
      } finally {
        setLoadingCount(false);
      }
    })();
  }, [open, event, targets]);

  if (!event) return null;

  const onSubmit = async () => {
    setError(null);
    if (mode === "move" && !moveTo) {
      setError("กรุณาเลือก event ปลายทาง");
      return;
    }
    setSubmitting(true);
    try {
      const params = new URLSearchParams({ mode });
      if (mode === "move") params.set("to", moveTo);
      const res = await fetch(`/api/events/${event.id}?${params}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      onOpenChange(false);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const hasCards = (count ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            ลบ Event: {event.name}
          </DialogTitle>
        </DialogHeader>

        {/* Card count banner */}
        <div
          className={`rounded-md px-3 py-2.5 text-sm flex items-start gap-2 border ${
            loadingCount
              ? "bg-muted/40 border-muted"
              : hasCards
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {loadingCount ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mt-0.5" />
              <span>กำลังตรวจจำนวนนามบัตรใน event นี้...</span>
            </>
          ) : hasCards ? (
            <>
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Event นี้มีนามบัตร <b>{count?.toLocaleString()}</b> ใบ —
                เลือกว่าจะจัดการอย่างไรก่อนลบ
              </span>
            </>
          ) : (
            <>
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Event นี้ไม่มีนามบัตรอยู่ — ลบได้เลย</span>
            </>
          )}
        </div>

        {/* Mode picker */}
        <div className="space-y-2.5 mt-1">
          {targets.length > 0 && (
            <OptionRow
              active={mode === "move"}
              onClick={() => setMode("move")}
              icon={ArrowRightLeft}
              color="text-blue-600"
              title="ย้ายนามบัตรไป event อื่นแล้วลบ event นี้"
              desc="นามบัตรทั้งหมดจะถูกย้ายไปอยู่ใน event ที่เลือก"
            >
              {mode === "move" && (
                <select
                  value={moveTo}
                  onChange={(e) => setMoveTo(e.target.value)}
                  className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">— เลือก event ปลายทาง —</option>
                  {targets.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              )}
            </OptionRow>
          )}

          <OptionRow
            active={mode === "delete_cards"}
            onClick={() => setMode("delete_cards")}
            icon={Trash2}
            color="text-red-600"
            title="ลบนามบัตรทั้งหมดและ event นี้ออกถาวร"
            desc={
              hasCards
                ? `นามบัตร ${count?.toLocaleString()} ใบในนี้จะถูกลบถาวร (รวมรูปนามบัตร) — กู้คืนไม่ได้`
                : "ลบ event นี้ออกถาวร — กู้คืนไม่ได้"
            }
            danger
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="flex-1"
          >
            ยกเลิก
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting || loadingCount}
            variant={mode === "delete_cards" ? "destructive" : "default"}
            className="flex-1"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "move" ? (
              <ArrowRightLeft className="h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {mode === "move" ? "ย้ายและลบ" : "ลบทั้งหมด"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OptionRow({
  active,
  onClick,
  icon: Icon,
  color,
  title,
  desc,
  danger,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  desc: string;
  danger?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border-2 p-3 transition-colors ${
        active
          ? danger
            ? "border-red-500 bg-red-50"
            : "border-primary bg-primary/5"
          : "border-muted hover:border-muted-foreground/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 ${
            active
              ? danger
                ? "border-red-500 bg-red-500"
                : "border-primary bg-primary"
              : "border-muted-foreground/40"
          }`}
        />
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${color}`} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
          {children}
        </div>
      </div>
    </button>
  );
}
