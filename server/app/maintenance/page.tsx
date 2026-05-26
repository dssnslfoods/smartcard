"use client";
/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 *
 * This file is part of SmartCard, a proprietary software product.
 * Unauthorized copying, modification, distribution, or use is prohibited.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Wrench, LogOut, Loader2 } from "lucide-react";

const DEFAULT_MESSAGE =
  "ขณะนี้ระบบปิดปรับปรุงชั่วคราว กรุณากลับมาใหม่ภายหลัง ขออภัยในความไม่สะดวก";

export default function MaintenancePage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/system", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // If somehow the system became active again, bounce home.
          if (data.isActive === true || data.canControl === true) {
            window.location.href = "/";
            return;
          }
          setMessage(data.inactiveMessage || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <Wrench className="h-9 w-9" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          ระบบปิดปรับปรุงชั่วคราว
        </h1>

        {loading ? (
          <div className="mt-4 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <p className="mt-4 whitespace-pre-wrap text-slate-600 leading-relaxed">
            {message || DEFAULT_MESSAGE}
          </p>
        )}

        <div className="mt-8">
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          SmartCard © 2026 Arnon Arpaket. All rights reserved.
        </p>
      </div>
    </div>
  );
}
