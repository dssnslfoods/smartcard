"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { Button } from "@/components/ui/button";
import { Trophy, X, Medal, Award, Crown } from "lucide-react";

export type ScannerRow = {
  id: string;
  name: string;
  email: string;
  count: number;
  todayCount: number;
};

export function ScannerRankingDialog({
  open,
  scanners,
  onClose,
}: {
  open: boolean;
  scanners: ScannerRow[];
  onClose: () => void;
}) {
  if (!open) return null;

  const total = scanners.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-lg sm:rounded-xl shadow-soft-lg flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
        <div className="border-b px-5 py-3 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
          <h2 className="font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            อันดับผู้สแกน
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-5 py-3 border-b bg-muted/30">
          <div className="text-sm text-muted-foreground flex items-center justify-between">
            <span>
              {scanners.length} คน · รวม {total.toLocaleString("th-TH")} ใบ
            </span>
            <span className="text-xs">(จากข้อมูลที่กรองอยู่)</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {scanners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              ยังไม่มีข้อมูลการสแกน
            </div>
          ) : (
            scanners.map((s, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const percentage = total > 0 ? (s.count / total) * 100 : 0;
              return (
                <div
                  key={s.id}
                  className={`relative rounded-xl border p-3 flex items-center gap-3 overflow-hidden ${
                    rank === 1
                      ? "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50"
                      : rank === 2
                      ? "border-slate-300 bg-gradient-to-r from-slate-50 to-zinc-50"
                      : rank === 3
                      ? "border-orange-300 bg-gradient-to-r from-orange-50 to-red-50/40"
                      : "border-border bg-card"
                  }`}
                >
                  {/* Background progress bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-primary/5 rounded-xl"
                    style={{ width: `${percentage}%` }}
                  />

                  {/* Rank badge */}
                  <div className="relative shrink-0">
                    {rank === 1 ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                        <Crown className="h-5 w-5" />
                      </div>
                    ) : rank === 2 ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white shadow">
                        <Medal className="h-5 w-5" />
                      </div>
                    ) : rank === 3 ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white shadow">
                        <Award className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm">
                        #{rank}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="relative flex-1 min-w-0">
                    <div className="font-semibold truncate flex items-center gap-1.5">
                      {s.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.email}
                    </div>
                  </div>

                  {/* Count */}
                  <div className="relative text-right shrink-0">
                    <div
                      className={`font-bold tabular-nums ${
                        isTop3 ? "text-xl" : "text-lg"
                      }`}
                    >
                      {s.count.toLocaleString("th-TH")}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      ใบ · {percentage.toFixed(1)}%
                    </div>
                    {s.todayCount > 0 && (
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        +{s.todayCount} วันนี้
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t px-5 py-3 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            ปิด
          </Button>
        </div>
      </div>
    </div>
  );
}
