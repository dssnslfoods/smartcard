"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Building2, Smartphone } from "lucide-react";
import type { Contact } from "@/lib/contact";

export function StatsCards({ contacts }: { contacts: Contact[] }) {
  const total = contacts.length;

  const now = new Date();
  const thisMonth = contacts.filter((c) => {
    const d = parseDate(c.date);
    if (!d) return false;
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const companyCounts = countBy(contacts.map((c) => c.company).filter(Boolean));
  const topCompany = companyCounts[0];

  const deviceCounts = countBy(contacts.map((c) => c.device).filter(Boolean));
  const activeDevices = deviceCounts.length;

  const items = [
    {
      label: "นามบัตรทั้งหมด",
      value: total.toLocaleString("th-TH"),
      sub: `ฐานข้อมูลปัจจุบัน`,
      icon: Users,
      tint: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "เพิ่มเดือนนี้",
      value: thisMonth.toLocaleString("th-TH"),
      sub: thaiMonth(now),
      icon: Calendar,
      tint: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "บริษัทที่พบบ่อย",
      value: topCompany?.[0] || "—",
      sub: topCompany ? `${topCompany[1]} ใบ` : "ยังไม่มีข้อมูล",
      icon: Building2,
      tint: "bg-violet-500/10 text-violet-600",
    },
    {
      label: "อุปกรณ์ที่ใช้บันทึก",
      value: activeDevices.toLocaleString("th-TH"),
      sub: "เครื่อง active",
      icon: Smartphone,
      tint: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it) => (
        <Card key={it.label}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 min-w-0">
                <p className="text-sm text-muted-foreground">{it.label}</p>
                <p className="text-2xl font-bold tracking-tight truncate">{it.value}</p>
                <p className="text-xs text-muted-foreground truncate">{it.sub}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${it.tint}`}>
                <it.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function countBy(items: string[]): [string, number][] {
  const map = new Map<string, number>();
  for (const it of items) map.set(it, (map.get(it) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function thaiMonth(d: Date): string {
  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  return `${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}
