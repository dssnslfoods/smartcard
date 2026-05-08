"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  RefreshCw,
  ContactRound,
  AlertCircle,
  Camera,
  Settings,
} from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ContactsTable } from "@/components/dashboard/ContactsTable";
import { EventContactsTable } from "@/components/dashboard/EventContactsTable";
import { EditDialog } from "@/components/dashboard/EditDialog";
import { DeleteDialog } from "@/components/dashboard/DeleteDialog";
import type { Contact } from "@/lib/contact";

type EventField =
  | { type: "text"; key: string; labelTh: string; labelEn: string }
  | { type: "textarea"; key: string; labelTh: string; labelEn: string }
  | {
      type: "multiselect";
      key: string;
      labelTh: string;
      labelEn: string;
      options: string[];
      allowOther?: boolean;
    };

type EventConfig = {
  id: string;
  name: string;
  sheetTab: string;
  active: boolean;
  fields: EventField[];
};

type EventContact = {
  rowIndex: number;
  date: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  device: string;
  imageUrl: string;
  eventName: string;
  eventData: Record<string, string>;
};

const DEFAULT_TAB = "default";

export default function DashboardPage() {
  const [tab, setTab] = useState<string>(DEFAULT_TAB);
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [eventContacts, setEventContacts] = useState<EventContact[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    }
  }, []);

  const load = useCallback(
    async (currentTab: string, silent = false) => {
      if (!silent) setLoading(true);
      setRefreshing(true);
      setError(null);
      try {
        if (currentTab === DEFAULT_TAB) {
          const res = await fetch("/api/list", { cache: "no-store" });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.error || `HTTP ${res.status}`);
          }
          const data = (await res.json()) as { contacts: Contact[] };
          setContacts(data.contacts || []);
          setActiveEvent(null);
          setEventContacts([]);
        } else {
          const res = await fetch(`/api/list-event?id=${encodeURIComponent(currentTab)}`, {
            cache: "no-store",
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.error || `HTTP ${res.status}`);
          }
          const data = (await res.json()) as {
            event: EventConfig;
            contacts: EventContact[];
          };
          setActiveEvent(data.event);
          setEventContacts(data.contacts || []);
          setContacts([]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  const exportCsv = () => {
    if (tab === DEFAULT_TAB) {
      const headers = [
        "วันที่",
        "ชื่อ",
        "ตำแหน่ง",
        "บริษัท",
        "โทรศัพท์",
        "อีเมล",
        "เว็บไซต์",
        "ที่อยู่",
        "บันทึกโดย",
        "รูปนามบัตร",
      ];
      const rows = contacts.map((c) => [
        c.date,
        c.name,
        c.position,
        c.company,
        c.phone,
        c.email,
        c.website,
        c.address,
        c.device,
        c.imageUrl,
      ]);
      downloadCsv("smartcard", headers, rows);
    } else if (activeEvent) {
      const headers = [
        "วันที่",
        "ชื่อ",
        "ตำแหน่ง",
        "บริษัท",
        "โทรศัพท์",
        "อีเมล",
        "เว็บไซต์",
        "ที่อยู่",
        "บันทึกโดย",
        "รูปนามบัตร",
        "Event",
      ];
      const eventCols: string[] = [];
      for (const f of activeEvent.fields) {
        headers.push(`${f.labelTh}/${f.labelEn}`);
        eventCols.push(f.key);
        if (f.type === "multiselect" && f.allowOther) {
          headers.push(`${f.labelTh} (อื่นๆ)`);
          eventCols.push(`${f.key}__other`);
        }
      }
      const rows = eventContacts.map((c) => [
        c.date,
        c.name,
        c.position,
        c.company,
        c.phone,
        c.email,
        c.website,
        c.address,
        c.device,
        c.imageUrl,
        c.eventName,
        ...eventCols.map((k) => c.eventData[k] ?? ""),
      ]);
      downloadCsv(activeEvent.sheetTab, headers, rows);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-lg bg-primary/10 p-2">
              <ContactRound className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">SmartCard Dashboard</h1>
              <p className="text-xs text-muted-foreground truncate">
                ฐานข้อมูลนามบัตรลูกค้า
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href="/scan">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">สแกน</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/events">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(tab)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={
                (tab === DEFAULT_TAB && contacts.length === 0) ||
                (tab !== DEFAULT_TAB && eventContacts.length === 0)
              }
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          <TabPill
            label="ทั้งหมด (ไม่ผูก event)"
            active={tab === DEFAULT_TAB}
            onClick={() => setTab(DEFAULT_TAB)}
          />
          {events.map((e) => (
            <TabPill
              key={e.id}
              label={e.name}
              active={tab === e.id}
              onClick={() => setTab(e.id)}
            />
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">
              <div className="font-medium">โหลดข้อมูลไม่สำเร็จ</div>
              <div className="text-destructive/80">{error}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[110px] rounded-xl border bg-card animate-pulse" />
            ))}
          </div>
        ) : tab === DEFAULT_TAB ? (
          <>
            <StatsCards contacts={contacts} />
            <ActivityChart contacts={contacts} />
            <ContactsTable
              contacts={contacts}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          </>
        ) : activeEvent ? (
          <EventContactsTable event={activeEvent} contacts={eventContacts} />
        ) : null}
      </main>

      <EditDialog
        contact={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load(tab, true);
        }}
      />
      <DeleteDialog
        contact={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null);
          load(tab, true);
        }}
      />
    </div>
  );
}

function TabPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-input hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

function csvCell(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function downloadCsv(prefix: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
