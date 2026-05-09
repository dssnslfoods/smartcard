/*
 * SmartCard — Business Card Scanner Application
 * Copyright (c) 2026 Arnon Arpaket. All rights reserved.
 */

import { Card, CardContent } from "@/components/ui/card";
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Pencil,
  Tag,
  Save,
  Check,
  Lightbulb,
  HelpCircle,
} from "lucide-react";

export function UserGuide() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
      <header>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <HelpCircle className="h-4 w-4" />
          คู่มือการใช้งาน
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          วิธีสแกนนามบัตร
        </h1>
        <p className="text-muted-foreground mt-1">
          คู่มือสำหรับผู้ใช้งาน — สแกนนามบัตรลูกค้าได้อย่างรวดเร็วด้วย AI
        </p>
      </header>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-5 flex items-start gap-3">
          <div className="rounded-xl bg-primary text-white p-2 shrink-0">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">ภาพรวมการใช้งาน</p>
            <p className="text-sm text-muted-foreground mt-1">
              SmartCard ช่วยให้คุณบันทึกข้อมูลนามบัตรอย่างรวดเร็ว — แค่ถ่ายรูป
              AI จะอ่านข้อมูลให้อัตโนมัติ คุณตรวจ-แก้ไข แล้วบันทึก
              เก็บไว้ในระบบทันที
            </p>
          </div>
        </CardContent>
      </Card>

      <Section number={1} icon={Camera} title="เข้าหน้าสแกน">
        <p>
          หลัง login เข้าระบบจะเข้าสู่หน้า <Code>สแกน</Code> ทันที
          (หรือกดที่เมนู <Code>📷 สแกน</Code> ที่แถบด้านบน/ล่าง)
        </p>
      </Section>

      <Section number={2} icon={Camera} title="ถ่ายหรือเลือกรูปนามบัตร">
        <ul className="space-y-2 list-disc list-inside">
          <li>
            กด <Code>📷 ถ่ายรูปนามบัตร</Code> เพื่อใช้กล้อง
          </li>
          <li>
            หรือกด <Code>🖼 เลือกจากคลังรูปภาพ</Code> เพื่อเลือกรูปที่มีอยู่
          </li>
          <li>
            <strong>นามบัตร 2 หน้า:</strong> ถ่ายรูปแรก → กด{" "}
            <Code>➕ เพิ่มหน้าหลัง</Code> → ถ่ายอีกรูป (สแกน 2 รูปทีเดียวได้)
          </li>
        </ul>
        <Tip>
          เคล็ดลับ: ถ่ายในที่แสงเพียงพอ วางนามบัตรราบ ถ่ายให้เห็นข้อมูลครบถ้วน
          AI จะอ่านได้แม่นยำกว่า
        </Tip>
      </Section>

      <Section number={3} icon={Sparkles} title="กดสแกน — AI อ่านข้อมูล">
        <p>
          เมื่อรูปพร้อม กดปุ่ม <Code>✨ สแกน X รูป</Code> สีเขียว
          ระบบจะส่งรูปให้ AI อ่านข้อมูลโดยอัตโนมัติ ใช้เวลาประมาณ 3-5 วินาที
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          ระบบจะดึงข้อมูล: ชื่อ, ตำแหน่ง, บริษัท, โทรศัพท์, อีเมล, เว็บไซต์,
          ที่อยู่
        </p>
      </Section>

      <Section number={4} icon={Pencil} title="ตรวจสอบและแก้ไข">
        <p>หลัง AI อ่านเสร็จ จะแสดงข้อมูลในฟอร์มให้คุณ:</p>
        <ul className="space-y-2 list-disc list-inside mt-2">
          <li>ตรวจความถูกต้องของแต่ละช่อง</li>
          <li>แก้ไขช่องที่อ่านผิดได้ทันที</li>
          <li>เพิ่มข้อมูลที่ AI อ่านไม่เจอ</li>
        </ul>
        <Tip>
          AI อ่านได้ดีกับนามบัตรภาษาอังกฤษและไทย แต่ลายมือเขียนหรือฟอนต์แปลกๆ
          อาจอ่านพลาด — ตรวจให้ครบก่อนบันทึก
        </Tip>
      </Section>

      <Section number={5} icon={Tag} title="ผูกกับ Event (ถ้ามี)">
        <p>
          ถ้าตอนสแกนอยู่ในงาน event (เช่น Thaifex, ลูกค้าเข้าเยี่ยม) สามารถ
          <strong> ผูกนามบัตรกับ event นั้น</strong>:
        </p>
        <ol className="space-y-2 list-decimal list-inside mt-2">
          <li>เลื่อนลงดูส่วน "ผูกกับ Event"</li>
          <li>เลือก event ที่เกี่ยวข้อง (admin ต้องสร้างไว้ก่อน)</li>
          <li>
            กด <Code>ถัดไป: กรอกข้อมูล Event</Code>
          </li>
          <li>กรอกฟอร์มเพิ่มเติมตามที่ event นั้นกำหนด</li>
        </ol>
        <Tip>
          ถ้าไม่ผูก event เลือก "ไม่เลือก" ก็ได้ — บันทึกเป็น contact ทั่วไป
        </Tip>
      </Section>

      <Section number={6} icon={Save} title="บันทึก">
        <p>
          กด <Code>💾 บันทึก</Code> หรือ <Code>บันทึกลง Sheet</Code>{" "}
          ระบบจะ:
        </p>
        <ul className="space-y-2 list-disc list-inside mt-2">
          <li>อัปโหลดรูปนามบัตรเก็บไว้ใน Cloud Storage</li>
          <li>บันทึกข้อมูลลงฐานข้อมูลของบริษัท</li>
          <li>ผูกกับ event (ถ้าเลือก)</li>
          <li>เก็บชื่อผู้สแกน (คุณ) ไว้</li>
        </ul>
      </Section>

      <Section number={7} icon={Check} title="เสร็จสิ้น">
        <p>
          เมื่อขึ้นข้อความ <Code className="text-emerald-600">✓ บันทึกเรียบร้อย!</Code>{" "}
          แสดงว่าข้อมูลเข้าระบบเรียบร้อย คุณสามารถ:
        </p>
        <ul className="space-y-2 list-disc list-inside mt-2">
          <li>
            กด <Code>สแกนใบใหม่</Code> เพื่อสแกนต่อ
          </li>
        </ul>
      </Section>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-5">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            คำถามที่พบบ่อย
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="font-medium">Q: AI อ่านชื่อผิด ทำยังไง?</p>
              <p className="text-muted-foreground">
                A: แก้ในช่องได้เลยก่อนกดบันทึก
              </p>
            </div>
            <div>
              <p className="font-medium">
                Q: ลูกค้าคนเดิมถูกสแกนแล้ว สแกนซ้ำได้ไหม?
              </p>
              <p className="text-muted-foreground">
                A: ได้ — ระบบจะตรวจอัตโนมัติว่าเป็นคนเดิม (ตามอีเมล/เบอร์)
                และเพิ่มเป็นการ scan ครั้งใหม่ ไม่สร้าง contact ซ้ำ
              </p>
            </div>
            <div>
              <p className="font-medium">Q: ถ้าสแกนเสร็จแล้วเพิ่งจำได้ว่าใส่ event ผิด?</p>
              <p className="text-muted-foreground">
                A: แจ้ง admin ของบริษัทให้แก้ไขให้
                — admin มีสิทธิ์แก้ไขข้อมูลทั้งหมด
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  number,
  icon: Icon,
  title,
  children,
}: {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold text-sm">
            {number}
          </div>
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">{title}</h2>
        </div>
        <div className="text-sm leading-relaxed pl-12 space-y-1">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function Code({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={`bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono ${className}`}
    >
      {children}
    </code>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-900 flex items-start gap-2">
      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600" />
      <span>{children}</span>
    </div>
  );
}
