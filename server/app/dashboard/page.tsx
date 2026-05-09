"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Calendar,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Mail,
  Phone,
  Globe,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Tag,
  Users,
  ContactRound,
  CalendarRange,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EventField, EventRow } from "@/lib/supabase/types";
import {
  ContactEditDialog,
  type ContactEditTarget,
} from "@/components/dashboard/ContactEditDialog";
import {
  ContactDeleteDialog,
  type DeleteTarget,
} from "@/components/dashboard/ContactDeleteDialog";

type ContactRecord = {
  id: string;
  name: string | null;
  position: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  image_urls: string[];
  event_id: string | null;
  event_data: Record<string, string>;
  notes?: string | null;
  scanned_by: string | null;
  created_at: string;
  events: { id: string; name: string; slug: string; event_date: string | null } | null;
  profiles: { id: string; email: string; display_name: string | null } | null;
};

const PAGE_SIZE = 25;

export default function DashboardPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [eventDataFilters, setEventDataFilters] = useState<
    Record<string, string>
  >({});
  const [page, setPage] = useState(0);

  // Edit/delete dialogs
  const [editing, setEditing] = useState<ContactEditTarget | null>(null);
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events?all=1");
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (eventFilter) params.set("event_id", eventFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", new Date(dateTo + "T23:59:59").toISOString());
      if (search) params.set("search", search);
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(page * PAGE_SIZE));
      for (const [k, v] of Object.entries(eventDataFilters)) {
        if (v) params.set(`event_data[${k}]`, v);
      }
      const res = await fetch(`/api/contacts?${params}`, { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setContacts(data.contacts ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventFilter, dateFrom, dateTo, search, eventDataFilters, page]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [eventFilter, dateFrom, dateTo, search, eventDataFilters]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === eventFilter),
    [events, eventFilter]
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportXlsx = () => {
    const params = new URLSearchParams();
    if (eventFilter) params.set("event_id", eventFilter);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", new Date(dateTo + "T23:59:59").toISOString());
    if (search) params.set("search", search);
    for (const [k, v] of Object.entries(eventDataFilters)) {
      if (v) params.set(`event_data[${k}]`, v);
    }
    const a = document.createElement("a");
    a.href = `/api/contacts/export?${params}`;
    a.click();
  };

  const clearFilters = () => {
    setSearch("");
    setEventFilter("");
    setDateFrom("");
    setDateTo("");
    setEventDataFilters({});
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            ภาพรวมและรายงานนามบัตร
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadContacts()}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>
          <Button
            size="sm"
            onClick={exportXlsx}
            disabled={total === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
        </div>
      </div>

      <StatsCards events={events} contacts={contacts} total={total} />

      <ActivityChart contacts={contacts} />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">รายการนามบัตร</CardTitle>
          <CardDescription>กรองและส่งออกข้อมูล</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="px-4 py-3 border-b space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-2">
                <Label className="text-xs">ค้นหา</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ชื่อ / บริษัท / เบอร์ / อีเมล"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Event</Label>
                <select
                  value={eventFilter}
                  onChange={(e) => {
                    setEventFilter(e.target.value);
                    setEventDataFilters({});
                  }}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">ทุก event</option>
                  <option value="none">ไม่ผูก event</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">ช่วงวันที่</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Event-specific field filters */}
            {selectedEvent && selectedEvent.fields.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  กรองตาม field ของ {selectedEvent.name}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedEvent.fields.map((f: EventField) => (
                    <div key={f.key}>
                      <Label className="text-xs">
                        {f.labelTh} / {f.labelEn}
                      </Label>
                      {f.type === "multiselect" ? (
                        <select
                          value={eventDataFilters[f.key] ?? ""}
                          onChange={(e) =>
                            setEventDataFilters({
                              ...eventDataFilters,
                              [f.key]: e.target.value,
                            })
                          }
                          className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">ทั้งหมด</option>
                          {f.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={eventDataFilters[f.key] ?? ""}
                          onChange={(e) =>
                            setEventDataFilters({
                              ...eventDataFilters,
                              [f.key]: e.target.value,
                            })
                          }
                          placeholder={`มีคำว่า...`}
                          className="mt-1 h-9"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(search || eventFilter || dateFrom || dateTo || Object.values(eventDataFilters).some(Boolean)) && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  พบ {total.toLocaleString("th-TH")} รายการ
                </span>
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  ล้าง filter
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <Th>วันที่</Th>
                  <Th>ชื่อ / ตำแหน่ง</Th>
                  <Th>บริษัท</Th>
                  <Th>ติดต่อ</Th>
                  <Th>Event</Th>
                  <Th>Scanner</Th>
                  <Th className="text-right">จัดการ</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      กำลังโหลด...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <Td className="whitespace-nowrap text-muted-foreground text-xs">
                        {new Date(c.created_at).toLocaleDateString("th-TH", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                        <div>
                          {new Date(c.created_at).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </Td>
                      <Td>
                        <div className="font-medium">{c.name || "—"}</div>
                        {c.position && (
                          <div className="text-xs text-muted-foreground">
                            {c.position}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <div className="font-medium">{c.company || "—"}</div>
                        {c.address && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
                            {c.address}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <div className="space-y-0.5">
                          {c.phone && (
                            <ContactLink icon={Phone} href={`tel:${c.phone}`} text={c.phone} />
                          )}
                          {c.email && (
                            <ContactLink icon={Mail} href={`mailto:${c.email}`} text={c.email} />
                          )}
                          {c.website && (
                            <ContactLink
                              icon={Globe}
                              href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
                              text={c.website}
                            />
                          )}
                        </div>
                      </Td>
                      <Td>
                        {c.events ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                            <Tag className="h-3 w-3" />
                            <span className="truncate max-w-[140px]">
                              {c.events.name}
                            </span>
                          </div>
                        ) : c.event_id ? (
                          <span className="text-xs text-amber-700">deleted event</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </Td>
                      <Td className="text-xs">
                        {c.profiles?.display_name || c.profiles?.email || "—"}
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-0.5">
                          {c.image_urls.map((u, i) => (
                            <Button
                              key={i}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                              title={
                                c.image_urls.length > 1
                                  ? `รูปที่ ${i + 1}/${c.image_urls.length}`
                                  : "ดูรูปนามบัตร"
                              }
                            >
                              <a href={u} target="_blank" rel="noopener noreferrer">
                                <ImageIcon className="h-4 w-4" />
                              </a>
                            </Button>
                          ))}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setEditing({
                                id: c.id,
                                name: c.name,
                                position: c.position,
                                company: c.company,
                                phone: c.phone,
                                email: c.email,
                                website: c.website,
                                address: c.address,
                                event_id: c.event_id,
                                event_data: c.event_data ?? {},
                                notes: c.notes ?? null,
                              })
                            }
                            title="แก้ไข"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() =>
                              setDeleting({
                                id: c.id,
                                name: c.name,
                                company: c.company,
                              })
                            }
                            title="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-xs text-muted-foreground">
                {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, total)} จาก {total.toLocaleString("th-TH")} รายการ
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm tabular-nums px-2">
                  {page + 1} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ContactEditDialog
        contact={editing}
        events={events}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          loadContacts();
        }}
      />
      <ContactDeleteDialog
        target={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null);
          loadContacts();
        }}
      />
    </div>
  );
}

function StatsCards({
  events,
  contacts,
  total,
}: {
  events: EventRow[];
  contacts: ContactRecord[];
  total: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = contacts.filter(
    (c) => new Date(c.created_at) >= today
  ).length;

  const activeEvents = events.filter((e) => e.active && !e.archived_at).length;

  const items = [
    {
      label: "นามบัตรทั้งหมด",
      value: total.toLocaleString("th-TH"),
      icon: ContactRound,
      gradient: "from-blue-500/15 to-blue-500/5",
      iconTint: "bg-blue-500 text-white",
    },
    {
      label: "เพิ่มวันนี้",
      value: todayCount.toLocaleString("th-TH"),
      icon: Calendar,
      gradient: "from-emerald-500/15 to-emerald-500/5",
      iconTint: "bg-emerald-500 text-white",
    },
    {
      label: "Event ที่ active",
      value: activeEvents.toLocaleString("th-TH"),
      icon: CalendarRange,
      gradient: "from-violet-500/15 to-violet-500/5",
      iconTint: "bg-violet-500 text-white",
    },
    {
      label: "ผู้สแกน",
      value: new Set(contacts.map((c) => c.scanned_by).filter(Boolean))
        .size.toLocaleString("th-TH"),
      icon: Users,
      gradient: "from-amber-500/15 to-amber-500/5",
      iconTint: "bg-amber-500 text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => (
        <Card
          key={it.label}
          className={`relative overflow-hidden card-hover bg-gradient-to-br ${it.gradient} border-0 shadow-soft`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                {it.label}
              </p>
              <p className="text-2xl font-bold tracking-tight mt-0.5 truncate">
                {it.value}
              </p>
            </div>
            <div className={`rounded-xl p-2.5 shadow-sm ${it.iconTint}`}>
              <it.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ActivityChart({ contacts }: { contacts: ContactRecord[] }) {
  const series = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    for (const c of contacts) {
      const key = c.created_at.slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([date, count]) => ({
      date,
      label: date.slice(5),
      count,
    }));
  }, [contacts]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">กิจกรรม 30 วันล่าสุด</CardTitle>
        <CardDescription>จำนวนนามบัตรที่บันทึกในแต่ละวัน</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(221.2 83.2% 53.3%)"
                fill="url(#g1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2.5 text-left font-medium text-xs uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

function ContactLink({
  icon: Icon,
  href,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  text: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs hover:text-primary truncate max-w-[200px]"
    >
      <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="truncate">{text}</span>
    </a>
  );
}
