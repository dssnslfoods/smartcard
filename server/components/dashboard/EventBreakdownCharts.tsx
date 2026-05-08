"use client";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
  eventData: Record<string, string>;
};

const COLORS = [
  "hsl(221.2 83.2% 53.3%)",
  "hsl(142.1 76.2% 36.3%)",
  "hsl(262.1 83.3% 57.8%)",
  "hsl(38.3 95.5% 50.6%)",
  "hsl(346.8 77.2% 49.8%)",
  "hsl(187.9 85.7% 53.3%)",
  "hsl(24.6 95% 53.1%)",
  "hsl(173.4 80.4% 40%)",
];

export function EventBreakdownCharts({
  event,
  contacts,
}: {
  event: EventConfig;
  contacts: EventContact[];
}) {
  const multiFields = event.fields.filter(
    (f): f is Extract<EventField, { type: "multiselect" }> =>
      f.type === "multiselect"
  );
  if (multiFields.length === 0) return null;

  const total = contacts.length;

  const breakdowns = multiFields.map((f) => {
    const counts = new Map<string, number>();
    for (const c of contacts) {
      const raw = c.eventData[f.key] ?? "";
      if (!raw) continue;
      const selected = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const opt of selected) {
        counts.set(opt, (counts.get(opt) ?? 0) + 1);
      }
      const other = c.eventData[`${f.key}__other`] ?? "";
      if (other.trim()) {
        counts.set("(อื่นๆ)", (counts.get("(อื่นๆ)") ?? 0) + 1);
      }
    }
    const data = Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
    return { field: f, data };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {breakdowns.map(({ field, data }) => (
        <Card key={field.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {field.labelTh}
              <span className="text-muted-foreground font-normal text-sm">
                {" "}
                / {field.labelEn}
              </span>
            </CardTitle>
            <CardDescription>
              {data.length} ตัวเลือกที่ถูกเลือก
              {total > 0 ? ` จากทั้งหมด ${total} รายการ` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              {data.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  ยังไม่มีข้อมูล
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ left: 0, right: 24, top: 4, bottom: 4 }}
                  >
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--foreground))",
                      }}
                      width={130}
                      interval={0}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value, _name, item) => {
                        const percent =
                          (item as unknown as { payload: { percent: number } })
                            .payload.percent;
                        return [`${value} รายการ (${percent}%)`, ""] as [
                          string,
                          string,
                        ];
                      }}
                      labelFormatter={(label) => String(label)}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
