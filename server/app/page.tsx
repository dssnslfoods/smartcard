"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, ContactRound, AlertCircle, Camera } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { ContactsTable } from "@/components/dashboard/ContactsTable";
import { EditDialog } from "@/components/dashboard/EditDialog";
import { DeleteDialog } from "@/components/dashboard/DeleteDialog";
import type { Contact } from "@/lib/contact";

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/list", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { contacts: Contact[] };
      setContacts(data.contacts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = () => {
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
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartcard-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
                <span className="hidden sm:inline">สแกนนามบัตร</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => load()}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={contacts.length === 0}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
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
        ) : (
          <>
            <StatsCards contacts={contacts} />
            <ActivityChart contacts={contacts} />
            <ContactsTable
              contacts={contacts}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          </>
        )}
      </main>

      <EditDialog
        contact={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load(true);
        }}
      />
      <DeleteDialog
        contact={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={() => {
          setDeleting(null);
          load(true);
        }}
      />
    </div>
  );
}

function csvCell(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
