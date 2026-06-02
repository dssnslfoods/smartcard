"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileBarChart2,
  Download,
  Loader2,
  CalendarRange,
  Sparkles,
  ListChecks,
  AlertCircle,
} from "lucide-react";
import type { EventField, EventRow } from "@/lib/supabase/types";

type EventLite = Pick<
  EventRow,
  "id" | "slug" | "name" | "event_date" | "fields" | "active"
>;

export default function ReportsPage() {
  const [events, setEvents] = useState<EventLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // selected values per field key: { fieldKey: Set<value> }
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setEvents(
            ((data.events ?? []) as EventLite[]).filter((e) => e.active !== false)
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === eventId) ?? null,
    [events, eventId]
  );

  // Reset selected interests when event changes
  useEffect(() => {
    setSelected({});
    setPreviewCount(null);
  }, [eventId]);

  const multiselectFields = useMemo<EventField[]>(() => {
    if (!selectedEvent) return [];
    return selectedEvent.fields.filter((f) => f.type === "multiselect");
  }, [selectedEvent]);

  const toggleValue = (key: string, value: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      if (set.size === 0) delete next[key];
      else next[key] = set;
      return next;
    });
    setPreviewCount(null);
  };

  const buildQuery = (): string => {
    const params = new URLSearchParams();
    if (eventId) params.set("event_id", eventId);
    if (dateFrom) params.set("date_from", new Date(dateFrom).toISOString());
    if (dateTo) {
      // include the whole "to" day
      const d = new Date(dateTo);
      d.setHours(23, 59, 59, 999);
      params.set("date_to", d.toISOString());
    }
    for (const [key, set] of Object.entries(selected)) {
      for (const v of set) params.append(`event_data[${key}]`, v);
    }
    return params.toString();
  };

  const onPreview = async () => {
    setPreviewLoading(true);
    setError(null);
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/contacts/stats?${qs}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setPreviewCount(typeof data.total === "number" ? data.total : 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPreviewLoading(false);
    }
  };

  const onExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/contacts/export?${qs}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 10);
      const slug = selectedEvent?.slug || "all";
      a.download = `smartcard-report-${slug}-${stamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setExporting(false);
    }
  };

  const totalSelected = Object.values(selected).reduce(
    (n, s) => n + s.size,
    0
  );

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="h-32 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 space-y-5">
      <header className="flex items-start gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-3 shadow-glow-primary">
          <FileBarChart2 className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            รายงานตามความสนใจ
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            กรองผู้เข้าร่วมตามฟิลด์ความสนใจของ event แล้ว export เป็น Excel
          </p>
        </div>
        <Button
          type="button"
          disabled={exporting}
          onClick={onExport}
          className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Export Excel</span>
        </Button>
      </header>

      {/* Step 1: Event */}
      <Card className="shadow-soft">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
              1
            </span>
            <h2 className="font-semibold">เลือก Event</h2>
          </div>
          <div>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">— ทุก Event —</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                  {e.event_date ? ` (${e.event_date})` : ""}
                </option>
              ))}
            </select>
            {selectedEvent && multiselectFields.length === 0 && (
              <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Event นี้ไม่มีฟิลด์แบบ multiselect (ความสนใจ) — จะ export ทั้งหมด
              </p>
            )}
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs">
                <CalendarRange className="h-3.5 w-3.5 inline mr-1" />
                วันที่เริ่ม
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPreviewCount(null);
                }}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">
                <CalendarRange className="h-3.5 w-3.5 inline mr-1" />
                วันที่สิ้นสุด
              </Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPreviewCount(null);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Interest filters */}
      {selectedEvent && multiselectFields.length > 0 && (
        <Card className="shadow-soft">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                2
              </span>
              <h2 className="font-semibold">เลือกความสนใจ (ตัวกรอง)</h2>
              {totalSelected > 0 && (
                <span className="text-xs px-2 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">
                  เลือกแล้ว {totalSelected}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              ไม่เลือกใดๆ = export ทุกคน · เลือกหลายตัวเลือก = export คนที่ตรงกับ
              <span className="font-medium"> ตัวเลือกใดตัวเลือกหนึ่ง (OR)</span>
            </p>

            {multiselectFields.map((f) => {
              if (f.type !== "multiselect") return null;
              const set = selected[f.key] ?? new Set<string>();
              return (
                <div key={f.key} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      {f.labelTh}
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        / {f.labelEn}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {f.options.map((opt) => {
                      const active = set.has(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleValue(f.key, opt)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background hover:bg-muted border-muted-foreground/20"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview + export */}
      <Card className="shadow-soft border-primary/20">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {selectedEvent && multiselectFields.length > 0 ? "3" : "2"}
            </span>
            <h2 className="font-semibold">ดูจำนวน &amp; Export</h2>
          </div>

          {previewCount !== null && (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2.5 flex items-center gap-2 text-sm text-emerald-700">
              <Sparkles className="h-4 w-4" />
              พบ <span className="font-bold">{previewCount.toLocaleString()}</span>{" "}
              รายการที่ตรงกับตัวกรอง
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={previewLoading}
              onClick={onPreview}
              className="flex-1"
            >
              {previewLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              ดูจำนวนก่อน
            </Button>
            <Button
              type="button"
              disabled={exporting}
              onClick={onExport}
              className="flex-1"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
