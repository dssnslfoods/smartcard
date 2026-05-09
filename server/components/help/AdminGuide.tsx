/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  Building2,
  Camera,
  FileSpreadsheet,
  Filter,
  Pencil,
  Trash2,
  Plus,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  KeyRound,
} from "lucide-react";

export function AdminGuide({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
      <header>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <HelpCircle className="h-4 w-4" />
          คู่มือการใช้งาน
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          คู่มือผู้ดูแลระบบ
          {isSuperAdmin && (
            <span className="ml-2 text-base font-medium text-primary inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Super Admin
            </span>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          ครอบคลุมการจัดการ {isSuperAdmin ? "บริษัท, " : ""}users, events,
          dashboard, และ report
        </p>
      </header>

      {/* Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-5 flex items-start gap-3">
          <div className="rounded-xl bg-primary text-white p-2 shrink-0">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="text-sm space-y-1">
            <p className="font-semibold">บทบาทของคุณ</p>
            {isSuperAdmin ? (
              <p className="text-muted-foreground">
                <strong>Super Admin</strong> — จัดการได้ทั้งระบบ ทุกบริษัท
                สร้าง/แก้บริษัท และมอบหมาย admin ให้แต่ละบริษัทไปดูแลกันเอง
              </p>
            ) : (
              <p className="text-muted-foreground">
                <strong>Admin</strong> — จัดการข้อมูลภายในบริษัทของคุณ
                สร้าง user, event, ดู dashboard, export report
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Dashboard */}
      <Section icon={LayoutDashboard} title="1. Dashboard — ดูข้อมูลและรายงาน">
        <p>หน้า Dashboard เป็นหน้าหลักของ admin มีองค์ประกอบ:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>
            <strong>4 Stats Cards</strong> — นามบัตรทั้งหมด, เพิ่มวันนี้, event
            active, ผู้สแกน
          </li>
          <li>
            <strong>Activity Chart 30 วัน</strong> — กราฟแสดงจำนวน scan ต่อวัน
          </li>
          <li>
            <strong>ตารางรายการนามบัตร</strong> พร้อม filter หลายแบบ
          </li>
        </ul>

        <Subsection title="🔍 Filter ข้อมูล">
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>ค้นหา</strong> — พิมพ์ชื่อ/บริษัท/เบอร์/อีเมล
            </li>
            <li>
              <strong>Event</strong> — เลือก event เฉพาะหรือ "ไม่ผูก event"
            </li>
            <li>
              <strong>ช่วงวันที่</strong> — กรองตามวันที่สแกน
            </li>
            <li>
              <strong>Field ของ event</strong> — เมื่อเลือก event แล้ว
              จะมี filter สำหรับฟิลด์เฉพาะของ event นั้น (เช่น
              ประเภทธุรกิจ, สินค้าที่สนใจ)
            </li>
          </ul>
        </Subsection>

        <Subsection title="📊 Export Excel">
          <p>
            กดปุ่ม <Btn icon={FileSpreadsheet} label="Excel" /> สีเขียว →
            ดาวน์โหลดไฟล์ .xlsx ที่จัดสวยพร้อมใช้
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            • ใช้ filter ปัจจุบันที่กรองอยู่
            <br />• มี header ตัวหนาสีฟ้า, freeze row, auto-filter, hyperlinks
            <br />• คอลัมน์เพิ่มตาม field ของ event ที่ filter
          </p>
        </Subsection>

        <Subsection title="✏️ แก้ไข / 🗑 ลบรายการ">
          <p>
            แต่ละ row ในตารางมีปุ่ม <Btn icon={Pencil} /> และ{" "}
            <Btn icon={Trash2} className="text-destructive" /> ทางขวา:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>
              <strong>Pencil ✏️</strong> — แก้ไขข้อมูลนามบัตร + ข้อมูล event
            </li>
            <li>
              <strong>Trash 🗑</strong> — ลบรายการ (ลบจริงในฐานข้อมูล)
            </li>
          </ul>
          <Tip>
            ลบ scan สุดท้ายของลูกค้า → ระบบจะลบนามบัตร master ให้ด้วย
            (ไม่มี orphan)
          </Tip>
        </Subsection>
      </Section>

      {/* Section 2: Events */}
      <Section icon={CalendarRange} title="2. จัดการ Events">
        <p>
          Event = งาน/แคมเปญที่มีฟิลด์เก็บข้อมูลเพิ่มเติมตามที่กำหนด
          (เช่น Thaifex จะถาม "ประเภทธุรกิจ", "สินค้าที่สนใจ")
        </p>

        <Subsection title="🆕 สร้าง Event ใหม่">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>
              ไปที่ <Code>เมนู Events</Code> → กด{" "}
              <Btn icon={Plus} label="เพิ่ม Event" />
            </li>
            <li>
              เลือก <strong>Template</strong> สำเร็จรูป 8 แบบ:
              <ul className="list-disc list-inside ml-4 mt-1 text-xs text-muted-foreground">
                <li>เริ่มจากศูนย์ — สร้างเอง</li>
                <li>งานแสดงสินค้า (Thaifex, Anuga)</li>
                <li>ลูกค้าเข้าเยี่ยม</li>
                <li>ลีดขาย / Sales Lead</li>
                <li>งาน Networking</li>
                <li>ประชุม / Conference</li>
                <li>หมายเหตุย่อๆ</li>
                <li>Recruitment Fair</li>
              </ul>
            </li>
            <li>
              กรอก <strong>ชื่อ Event</strong> — รหัสภายในจะถูกสร้างอัตโนมัติ
            </li>
            <li>
              เพิ่ม/ลบ/แก้ไข <strong>Fields</strong> ได้ตามต้องการ (text,
              textarea, multi-select)
            </li>
            <li>
              กด <Btn label="สร้าง Event" />
            </li>
          </ol>
        </Subsection>

        <Subsection title="🛠 ประเภทของ Field">
          <ul className="space-y-2">
            <li>
              <Code>Text</Code> — ช่องกรอก 1 บรรทัด (เช่น Line ID, ชื่อร้าน)
            </li>
            <li>
              <Code>Textarea</Code> — ช่องกรอกหลายบรรทัด (เช่น หมายเหตุ)
            </li>
            <li>
              <Code>Multi-select</Code> — ติ๊กเลือกหลายอย่าง (เช่น
              ประเภทธุรกิจ) มี option "อื่นๆ ระบุ" ได้
            </li>
          </ul>
        </Subsection>

        <Subsection title="📋 คัดลอกจาก Event เดิม">
          <p>
            ในหน้าเลือก template — เลื่อนลงดู "คัดลอกจาก Event ที่มีอยู่"
            กดเลือก event เดิมแล้วเริ่มจาก field ของ event นั้นได้เลย
          </p>
        </Subsection>

        <Subsection title="🗑 Archive Event">
          <p>
            ปุ่ม <Btn icon={Trash2} className="text-destructive" /> = archive
            (ไม่ลบจริง) — event จะ inactive แต่ข้อมูลที่ผูกอยู่ยังคงอยู่
            ดูใน dashboard ได้
          </p>
        </Subsection>
      </Section>

      {/* Section 3: Users */}
      <Section icon={Users} title="3. จัดการ Users">
        <p>
          สร้างบัญชีให้ทีมงานในบริษัทของคุณ — แต่ละคนมี login + รหัสผ่านของตัวเอง
        </p>

        <Subsection title="➕ เพิ่ม User ใหม่">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>
              ไปที่ <Code>เมนู Users</Code> → กด{" "}
              <Btn icon={Plus} label="เพิ่มผู้ใช้" />
            </li>
            <li>กรอก email, ชื่อ, รหัสผ่าน (ขั้นต่ำ 6 ตัว)</li>
            <li>
              เลือก Role:
              <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                <li>
                  <strong>User</strong> — สแกนนามบัตรเท่านั้น (ไม่เห็น dashboard)
                </li>
                <li>
                  <strong>Admin</strong> — จัดการบริษัทเดียวกัน (เพิ่ม user,
                  event ฯลฯ)
                </li>
                {isSuperAdmin && (
                  <li>
                    <strong>Super Admin</strong> — จัดการทั้งระบบ (ทุกบริษัท)
                  </li>
                )}
              </ul>
            </li>
            {isSuperAdmin && (
              <li>
                <strong>เลือกบริษัท</strong> สังกัด (สำหรับ admin/user)
              </li>
            )}
            <li>
              กด <Btn label="สร้างผู้ใช้" />
            </li>
          </ol>
        </Subsection>

        <Subsection title={<>🔑 เปลี่ยนรหัสผ่าน user</>}>
          <p>
            กด <Btn icon={Pencil} /> ที่ user แล้วใส่รหัสใหม่ในช่องรหัสผ่าน →
            บันทึก (เว้นว่างถ้าไม่ต้องการเปลี่ยน)
          </p>
        </Subsection>

        <Subsection title="🗑 ลบ User">
          <p>
            กด <Btn icon={Trash2} className="text-destructive" /> →
            ระบบจะลบบัญชีและประวัติการ scan ทั้งหมดของคนนั้น
          </p>
          <Tip>
            ข้อมูลนามบัตรที่คนนั้นเคยสแกนจะยังคงอยู่ในระบบ (แค่ไม่มีชื่อ
            scanner)
          </Tip>
        </Subsection>
      </Section>

      {/* Section 4: Companies (super_admin only) */}
      {isSuperAdmin && (
        <Section icon={Building2} title="4. จัดการบริษัท (Super Admin)">
          <p>
            สำหรับ Super Admin — สร้างบริษัทใหม่ + มอบหมาย admin ของบริษัทนั้น
            ไปดูแลกันเอง
          </p>

          <Subsection title="🏢 สร้างบริษัท">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>
                ไปที่ <Code>เมนู Companies</Code> → กด{" "}
                <Btn icon={Plus} label="เพิ่มบริษัท" />
              </li>
              <li>กรอกชื่อบริษัท (เช่น "NSL FOODS PLC.")</li>
              <li>เพิ่มรายละเอียด/logo URL ถ้ามี</li>
              <li>
                กด <Btn label="สร้างบริษัท" />
              </li>
            </ol>
          </Subsection>

          <Subsection title="👤 สร้าง Admin ให้บริษัท">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>
                ไป <Code>เมนู Users</Code> → กด{" "}
                <Btn icon={Plus} label="เพิ่มผู้ใช้" />
              </li>
              <li>กรอกข้อมูล + เลือก Role: <strong>Admin</strong></li>
              <li>เลือกบริษัทสังกัด</li>
              <li>ส่ง email + รหัสผ่านให้คนนั้น เพื่อ login</li>
            </ol>
            <Tip>
              Admin คนนั้นจะเห็นเฉพาะข้อมูลของบริษัทตัวเองเท่านั้น —
              ไม่เห็นบริษัทอื่น (RLS ป้องกันที่ database level)
            </Tip>
          </Subsection>

          <Subsection title="🗃 Archive บริษัท">
            <p>
              กด <Btn icon={Trash2} className="text-destructive" /> →
              บริษัทจะ inactive (user ในบริษัทนั้นจะใช้งานไม่ได้)
              — ข้อมูลทั้งหมดยังคงอยู่
            </p>
          </Subsection>
        </Section>
      )}

      {/* Section 5: Scanning */}
      <Section icon={Camera} title={`${isSuperAdmin ? "5" : "4"}. การสแกนนามบัตร`}>
        <p>
          คุณก็สามารถสแกนนามบัตรได้เหมือน user ทั่วไป — กดเมนู{" "}
          <Code>📷 สแกน</Code>
        </p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>ถ่าย/อัปโหลดรูปนามบัตร (1-2 รูป)</li>
          <li>
            กด <Btn icon={Sparkles} label="สแกน" /> → AI อ่านข้อมูลให้
          </li>
          <li>ตรวจสอบ + แก้ไข → ผูก event (ถ้ามี) → บันทึก</li>
        </ol>
      </Section>

      {/* Tips */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-5">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            Best Practices
          </p>
          <ul className="mt-3 space-y-2 text-sm text-amber-950 list-disc list-inside">
            <li>
              <strong>ตั้งชื่อ event ให้ชัดเจน</strong> — ใส่ปีไปด้วย เช่น
              "Thaifex 2026"
            </li>
            <li>
              <strong>ใช้ Template</strong> — ประหยัดเวลาตั้งค่า field ใหม่
            </li>
            <li>
              <strong>Export Excel ก่อน archive event</strong> —
              เก็บไฟล์สำรองไว้บน laptop
            </li>
            <li>
              <strong>เปลี่ยนรหัสผ่าน user เมื่อจำเป็น</strong> — ตอนพนักงานออก,
              รหัสรั่ว
            </li>
            <li>
              <strong>สอน user สแกนด้วยกล้องที่ดี</strong> — แสงสว่าง,
              วางนามบัตรราบ → AI อ่านแม่นกว่า
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardContent className="p-5">
          <p className="font-semibold text-sm flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            ความปลอดภัย
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>ทุกการกระทำผ่าน auth + RLS — บริษัทอื่นเข้ามาดูข้อมูลไม่ได้</li>
            <li>รูปนามบัตรเก็บใน Cloud Storage — ลิงก์ token แชร์ไม่ได้สาธารณะ</li>
            <li>รหัสผ่านเข้ารหัสด้วย bcrypt บน Supabase</li>
            <li>ส่ง credential ผ่านช่องทางปลอดภัย (อย่าส่งใน Slack public)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-xl bg-primary/10 text-primary p-2">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="font-semibold text-lg">{title}</h2>
        </div>
        <div className="text-sm leading-relaxed space-y-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function Subsection({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-2 border-primary/30 pl-4 ml-2 space-y-1">
      <p className="font-medium text-sm">{title}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  );
}

function Btn({
  icon: Icon,
  label,
  className = "",
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-xs ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-900 flex items-start gap-2">
      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600" />
      <span>{children}</span>
    </div>
  );
}
