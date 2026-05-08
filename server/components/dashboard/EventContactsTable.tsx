"use client";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Mail,
  Phone,
  Globe,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

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

const PAGE_SIZE = 20;

export function EventContactsTable({
  event,
  contacts,
}: {
  event: EventConfig;
  contacts: EventContact[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [
        c.name,
        c.position,
        c.company,
        c.phone,
        c.email,
        c.address,
        ...Object.values(c.eventData),
      ].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [contacts, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหา..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <Th>วันที่</Th>
                <Th>ชื่อ / บริษัท</Th>
                <Th>ติดต่อ</Th>
                {event.fields.map((f) => (
                  <Th key={f.key}>{f.labelTh}</Th>
                ))}
                <Th>เครื่อง</Th>
                <Th className="text-right">รูป</Th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + event.fields.length}
                    className="text-center py-12 text-muted-foreground"
                  >
                    ยังไม่มีข้อมูลใน event นี้
                  </td>
                </tr>
              ) : (
                pageRows.map((c) => (
                  <tr key={c.rowIndex} className="border-t hover:bg-muted/30 transition-colors">
                    <Td className="whitespace-nowrap text-muted-foreground">
                      {c.date.split(" ")[0] || "—"}
                    </Td>
                    <Td>
                      <div className="font-medium">{c.name || "—"}</div>
                      {c.company && (
                        <div className="text-xs text-muted-foreground">{c.company}</div>
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
                    {event.fields.map((f) => {
                      const main = c.eventData[f.key] ?? "";
                      const other = c.eventData[`${f.key}__other`] ?? "";
                      return (
                        <Td key={f.key} className="max-w-[200px]">
                          <div className="text-xs whitespace-pre-wrap break-words">
                            {main || "—"}
                            {other ? ` (อื่นๆ: ${other})` : ""}
                          </div>
                        </Td>
                      );
                    })}
                    <Td className="text-xs text-muted-foreground whitespace-nowrap">
                      {c.device || "—"}
                    </Td>
                    <Td className="text-right">
                      {(() => {
                        const urls = (c.imageUrl ?? "")
                          .split(",")
                          .map((u) => u.trim())
                          .filter(Boolean);
                        if (urls.length === 0)
                          return <span className="text-muted-foreground">—</span>;
                        return (
                          <div className="inline-flex gap-1">
                            {urls.map((u, i) => (
                              <Button
                                key={i}
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                asChild
                                title={
                                  urls.length > 1
                                    ? `รูปที่ ${i + 1}/${urls.length}`
                                    : "ดูรูปนามบัตร"
                                }
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
                          </div>
                        );
                      })()}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} จาก {filtered.length}{" "}
              รายการ
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
                onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
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
