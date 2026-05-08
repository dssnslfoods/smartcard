"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  Search,
  Mail,
  Phone,
  Globe,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import type { Contact } from "@/lib/contact";

type Props = {
  contacts: Contact[];
  onEdit: (c: Contact) => void;
  onDelete: (c: Contact) => void;
};

const PAGE_SIZE = 20;
const NO_EVENT_KEY = "__none__";

export function ContactsTable({ contacts, onEdit, onDelete }: Props) {
  const [query, setQuery] = useState("");
  const [device, setDevice] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const devices = useMemo(() => {
    const set = new Set<string>();
    for (const c of contacts) if (c.device) set.add(c.device);
    return [...set].sort();
  }, [contacts]);

  const eventOptions = useMemo(() => {
    const map = new Map<string, string>();
    let hasNoEvent = false;
    for (const c of contacts) {
      if (c.eventId && c.eventName) {
        map.set(c.eventId, c.eventName);
      } else {
        hasNoEvent = true;
      }
    }
    const arr = [...map.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], "th")
    );
    return { events: arr, hasNoEvent };
  }, [contacts]);

  const showEventColumn = useMemo(
    () => contacts.some((c) => c.eventName),
    [contacts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (device !== "all" && c.device !== device) return false;
      if (eventFilter !== "all") {
        if (eventFilter === NO_EVENT_KEY) {
          if (c.eventId) return false;
        } else {
          if (c.eventId !== eventFilter) return false;
        }
      }
      if (!q) return true;
      return [
        c.name,
        c.position,
        c.company,
        c.phone,
        c.email,
        c.website,
        c.address,
        c.eventName ?? "",
      ].some((v) => v.toLowerCase().includes(q));
    });
  }, [contacts, query, device, eventFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหา ชื่อ / บริษัท / เบอร์ / อีเมล / event..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>

          {showEventColumn && (
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setPage(0);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">
                ทุก Event ({eventOptions.events.length})
              </option>
              {eventOptions.hasNoEvent && (
                <option value={NO_EVENT_KEY}>ไม่ผูก event</option>
              )}
              {eventOptions.events.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}

          <select
            value={device}
            onChange={(e) => {
              setDevice(e.target.value);
              setPage(0);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">ทุกเครื่อง ({devices.length})</option>
            {devices.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <Th>วันที่</Th>
                <Th>ชื่อ / ตำแหน่ง</Th>
                <Th>บริษัท</Th>
                <Th>ช่องทางติดต่อ</Th>
                {showEventColumn && <Th>Event</Th>}
                <Th>เครื่อง</Th>
                <Th className="text-right">จัดการ</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={showEventColumn ? 7 : 6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    ไม่พบข้อมูลที่ตรงกับการค้นหา
                  </td>
                </tr>
              ) : (
                pageRows.map((c) => {
                  const rowKey = `${c.eventId ?? "default"}-${c.rowIndex}`;
                  const isOrphan = c.eventId?.startsWith("orphan:") ?? false;
                  return (
                    <tr
                      key={rowKey}
                      className="border-t hover:bg-muted/30 transition-colors"
                    >
                      <Td className="whitespace-nowrap text-muted-foreground">
                        {c.date.split(" ")[0] || "—"}
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
                            <ContactLink
                              icon={Phone}
                              href={`tel:${c.phone}`}
                              text={c.phone}
                            />
                          )}
                          {c.email && (
                            <ContactLink
                              icon={Mail}
                              href={`mailto:${c.email}`}
                              text={c.email}
                            />
                          )}
                          {c.website && (
                            <ContactLink
                              icon={Globe}
                              href={
                                c.website.startsWith("http")
                                  ? c.website
                                  : `https://${c.website}`
                              }
                              text={c.website}
                            />
                          )}
                        </div>
                      </Td>
                      {showEventColumn && (
                        <Td>
                          {c.eventName ? (
                            <div
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                                isOrphan
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                              title={isOrphan ? "Event ถูกลบแล้ว แต่ข้อมูลยังเก็บ" : ""}
                            >
                              <Tag className="h-3 w-3" />
                              <span className="truncate max-w-[140px]">
                                {c.eventName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </Td>
                      )}
                      <Td className="text-xs text-muted-foreground whitespace-nowrap">
                        {c.device || "—"}
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        {c.imageUrl &&
                          c.imageUrl
                            .split(",")
                            .map((u) => u.trim())
                            .filter(Boolean)
                            .slice(0, 1)
                            .map((u, i) => (
                              <Button
                                key={i}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                asChild
                                title="ดูรูปนามบัตร"
                              >
                                <a
                                  href={u}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ImageIcon className="h-4 w-4" />
                                </a>
                              </Button>
                            ))}
                        {!c.eventId && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onEdit(c)}
                              title="แก้ไข"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onDelete(c)}
                              title="ลบ"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} จาก{" "}
              {filtered.length} รายการ
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, safePage - 1))}
                disabled={safePage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm tabular-nums px-2">
                {safePage + 1} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage(Math.min(totalPages - 1, safePage + 1))
                }
                disabled={safePage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
