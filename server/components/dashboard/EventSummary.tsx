"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, ChevronRight, Users } from "lucide-react";

type EventField = { type: string; key: string };

type EventConfig = {
  id: string;
  name: string;
  sheetTab: string;
  active: boolean;
  fields: EventField[];
};

type EventContactBrief = {
  date: string;
  company: string;
};

export function EventSummary({
  events,
  onSelect,
}: {
  events: EventConfig[];
  onSelect: (id: string) => void;
}) {
  const [counts, setCounts] = useState<Record<string, EventContactBrief[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (events.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      events.map((e) =>
        fetch(`/api/list-event?id=${encodeURIComponent(e.id)}`, {
          cache: "no-store",
        })
          .then((r) => r.json())
          .then((d) => ({
            id: e.id,
            list: ((d.contacts ?? []) as { date: string; company: string }[]).map(
              (c) => ({ date: c.date, company: c.company })
            ),
          }))
          .catch(() => ({ id: e.id, list: [] }))
      )
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, EventContactBrief[]> = {};
      for (const r of results) map[r.id] = r.list;
      setCounts(map);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [events]);

  if (events.length === 0) return null;

  const now = new Date();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">📊 สรุปตาม Event</CardTitle>
        <CardDescription>
          คลิกเพื่อดูรายละเอียดของแต่ละ event
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {events.map((e) => {
            const list = counts[e.id] ?? [];
            const thisMonth = list.filter((c) => {
              const d = parseDate(c.date);
              if (!d) return false;
              return (
                d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth()
              );
            }).length;

            return (
              <button
                key={e.id}
                type="button"
                onClick={() => onSelect(e.id)}
                className="w-full px-5 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    tab: <code>{e.sheetTab}</code>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Stat
                    icon={Users}
                    value={loading ? "..." : list.length.toLocaleString("th-TH")}
                    label="รวม"
                  />
                  <Stat
                    icon={Calendar}
                    value={loading ? "..." : thisMonth.toLocaleString("th-TH")}
                    label="เดือนนี้"
                  />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
