# SmartCard — Handoff for Personal Assistant Agent

> เอกสารนี้สำหรับ AI agent ที่เป็นเลขาส่วนตัวของคุณ Arnon (เจ้าของระบบ)
> เพื่อให้เข้าใจ "SmartCard" — ระบบสแกนนามบัตรของ NSL Foods —
> และช่วยจัดการ/ตอบคำถามที่เกี่ยวกับระบบนี้ได้

---

## 1. SmartCard คืออะไร — ใน 30 วินาที

- **เว็บแอปสแกนนามบัตร** ใช้ AI (Google Gemini) อ่านข้อมูลจากรูปนามบัตรอัตโนมัติ → จัดเก็บลง database → export Excel ได้
- **ใช้ที่งาน event / expo** เพื่อเก็บลูกค้า/ผู้สนใจสินค้า แล้วทำ report ส่งทีมขาย-การตลาด
- **เจ้าของระบบ:** Arnon Arpaket (ผู้พัฒนา) — `arnon@def2design.com`
- **ลูกค้าหลัก:** NSL Foods PLC (ทีมขายและการตลาด)
- **ภาษา:** UI หลักเป็นภาษาไทย (มี EN field labels คู่กัน)

## 2. URL & การเข้าถึง

| รายการ | ค่า |
|---|---|
| **Production URL** | `https://smartcard--smartcard-d24ec.asia-southeast1.hosted.app` |
| **Login URL** | `<production>/login` |
| **GitHub repo** | `https://github.com/dssnslfoods/smartcard` |
| **Firebase Console** | project `smartcard-d24ec` (Firebase App Hosting + Storage) |
| **Supabase Console** | project `yppriqeewxkowlujdkkt` (Postgres + Auth + RLS) |
| **Gemini API** | billing เปิดแล้ว (paid tier) — ไม่ติดลิมิต free tier |

> ไม่ต้องเก็บ password/secrets ใน handoff นี้ — ทั้งหมดอยู่ใน `server/.env` (gitignored) และ Firebase Secrets

## 3. คนสำคัญในระบบ (Key People)

| Role | Email | บทบาท |
|---|---|---|
| **Super Admin** | `arpaket@gmail.com` | จัดการได้ทั่วทั้งระบบ ทุกบริษัท (ของคุณ Arnon) |
| **System Controller / Admin** | `arnon@def2design.com` | เปิด/ปิดระบบ (maintenance mode) ได้คนเดียว — เป็น admin ของ NSL FOODS PLC |
| **Day-to-day Admin (NSL)** | `maliwan.th@nslfoods.com` | ผู้ดูแลฝั่งลูกค้า รับเรื่องสมัครใช้/ลืมรหัสผ่าน |
| **Day-to-day Admin (NSL)** | `jariya.mu@nslfoods.com` | CC ทุกอีเมลที่ส่งหา maliwan |
| **Users** | — | พนักงานขาย/event staff ที่สแกนนามบัตรหน้างาน |

> หากใครถามว่า "อยากใช้งาน / ลืมรหัสผ่าน / มีปัญหา" — ส่งไปที่ **maliwan.th + cc jariya.mu** (ปุ่มบนหน้า login ทำลิงก์ mailto ให้แล้ว)

## 4. โครงสร้างสิทธิ์ (Roles)

3 ระดับ:

1. **`user`** — สแกนนามบัตรได้ ดูเฉพาะของตัวเอง ใช้คู่มือ
2. **`admin`** — ทุกอย่างที่ user ทำได้ + Dashboard, จัดการ Events, จัดการ Users, ดึงรายงาน Excel, ดู contacts ทั้งบริษัท
3. **`super_admin`** — ทุกอย่างที่ admin ทำได้ + จัดการ Companies (ข้ามบริษัท)

**Multi-tenant:** ข้อมูลถูก scope ตาม `company_id` ด้วย RLS — admin บริษัท A เห็นเฉพาะข้อมูลบริษัท A เท่านั้น

## 5. ฟีเจอร์หลัก (เรียงตามที่เลขาน่าจะถูกถามบ่อย)

### 📷 สแกนนามบัตร (`/scan`)
- ถ่าย/อัปโหลด **2 รูป** ได้ (หน้า + หลัง)
- AI อ่านชื่อ ตำแหน่ง บริษัท เบอร์ อีเมล เว็บไซต์ ที่อยู่
- เลือก Event ตอนสแกน → กรอกข้อมูลเพิ่มเติม (เช่น "ความสนใจ") → บันทึก
- ใช้ได้ทั้งมือถือ (camera) และ desktop (webcam)

### 📊 Dashboard (`/dashboard`) — admin เท่านั้น
- ภาพรวม: จำนวนนามบัตรทั้งหมด, วันนี้, รายชื่อผู้สแกน (ranking)
- ตาราง contacts พร้อม filter: event, ช่วงวันที่, ค้นหา
- **ปุ่ม Excel เขียวมุมบนขวา** → export contacts ที่อยู่ใน filter

### 📅 Events (`/admin/events`) — admin
- สร้าง event ใหม่ (พร้อม template form 8 แบบ หรือ duplicate จาก event เดิม)
- กำหนดฟิลด์เพิ่ม เช่น "ความสนใจ" (multiselect), "Segment" (multiselect), เบอร์เพิ่มเติม (text), notes (textarea)
- ลบ/แก้ไข event ได้ (contacts เดิมไม่หาย)

### 👥 Users (`/admin/users`) — admin
- เพิ่ม/ลบ user ในบริษัท
- กำหนด role (user/admin)
- รีเซ็ตรหัสผ่าน (admin user ตั้งให้ใหม่)

### 📈 รายงานตามความสนใจ (`/admin/reports`) — admin
- เลือก event → ติ๊กตัวเลือก "ความสนใจ" / "Segment" → ดูจำนวนก่อน → Export Excel
- Excel มีคอลัมน์พิเศษ **"เกณฑ์ที่ตรง"** บอกว่าแต่ละคนตรงกับเกณฑ์ข้อไหน (เช่น "ความสนใจ: Snack, Drink")
- มีชีท "Criteria" สรุปเกณฑ์ที่ใช้

### 🏢 Companies (`/admin/companies`) — super_admin เท่านั้น
- ไว้สำหรับขยายไปบริษัทอื่น (ตอนนี้มี NSL Foods PLC อยู่)

### 🔧 System Control (`/account`) — เฉพาะ `arnon@def2design.com`
- มีการ์ด **"ควบคุมระบบ"** ในหน้าบัญชีของฉัน
- กดปุ่มปิดระบบ (Inactive Mode) + พิมพ์ข้อความที่จะแสดงให้ user เห็น
- เมื่อปิดแล้ว: user/admin คนอื่นทั้งหมดถูก redirect ไปหน้า `/maintenance` พร้อมข้อความที่ตั้ง
- **มีเพียง arnon@def2design.com คนเดียวที่ login เข้าใช้งานได้ตอนปิดระบบ**
- ใช้ตอนต้องการทำ maintenance หรือ debug

## 6. คำถาม/งานที่เลขาน่าจะถูกขอบ่อย

### "ช่วยส่งให้ทีม X / report งาน Y ที่จัดเมื่อ DD/MM"
1. เข้า Dashboard หรือ /admin/reports
2. เลือก event "Y" + ช่วงวันที่
3. กด Export Excel
4. ส่งไฟล์ทาง email/Slack

### "user A ลืมรหัสผ่าน / สมัครใช้ไม่ได้"
- บอกให้คลิก "ลืมรหัสผ่าน?" หรือ "ติดต่อผู้ดูแลระบบ" ที่หน้า login
- ลิงก์ mailto ตั้งค่าให้ส่งหา **maliwan.th@nslfoods.com cc jariya.mu@nslfoods.com** อัตโนมัติ

### "ระบบสแกนช้า / error"
- โดยปกติเรื่อง quota ไม่ใช่ปัญหาแล้ว (billing เปิด — paid tier)
- ถ้า error ให้ดู Firebase Console > App Hosting > logs หรือบอกคุณ Arnon
- รหัส 503/429/404 ระบบจะ fallback ไปโมเดล Gemini ตัวถัดไปอัตโนมัติ

### "อยากปิดระบบชั่วคราว"
- เฉพาะคุณ Arnon เท่านั้น → login → /account → การ์ด "ควบคุมระบบ" → ปิดระบบ + พิมพ์ข้อความ
- จำได้ว่า**ต้องเปิดกลับ** ที่เดิมเมื่อทำเสร็จ

### "อยาก deploy version ใหม่"
- คุณ Arnon push code ขึ้น `main` บน GitHub → trigger rollout บน Firebase App Hosting
- หรือใช้คำสั่ง: `firebase apphosting:rollouts:create smartcard --git-branch main --force --project smartcard-d24ec`
- Cloud Build ใช้เวลาประมาณ 2-5 นาที

## 7. ข้อมูล/ตารางหลัก (high-level)

ที่ Supabase project `yppriqeewxkowlujdkkt`:

- **`profiles`** — user accounts + role + company_id
- **`companies`** — บริษัท (multi-tenant root)
- **`events`** — event แต่ละงาน + custom form fields (JSON)
- **`contacts`** — master record ของนามบัตร (dedupe ด้วย email/phone ภายในบริษัท)
- **`attendances`** — 1 การสแกน = 1 row (เชื่อม contact + event + event_data)
- **`system_settings`** — single row คุม inactive mode (id=1)
- **Firebase Storage** — เก็บรูปนามบัตร (URL อยู่ใน contacts.image_urls)

## 8. สิ่งที่เลขาไม่ควรทำ

- ❌ อย่าบอก/ส่งต่อ password, API key, service-role key ให้ใครเด็ดขาด (ทั้งหมดอยู่ใน .env + Firebase Secrets)
- ❌ อย่ากดปิดระบบ (inactive mode) เองโดยไม่ confirm กับคุณ Arnon ก่อน — กระทบ user ทั้งบริษัท
- ❌ อย่าลบ user / event / contact ใน Supabase console โดยตรง — ใช้ผ่าน UI เท่านั้น (มี business logic + cascade)
- ❌ อย่าตอบคำถามด้านเทคนิคลึกๆ (database schema, RLS policy, deployment infra) แทนคุณ Arnon — ส่งต่อให้คุณ Arnon

## 9. Quick Reference (Cheat Sheet)

```
Production:      smartcard--smartcard-d24ec.asia-southeast1.hosted.app
Owner:           Arnon Arpaket (arnon@def2design.com)
Customer admins: maliwan.th@nslfoods.com (CC jariya.mu@nslfoods.com)
Tech stack:      Next.js 15, Supabase, Firebase, Gemini Vision
Tenant:          NSL Foods PLC (และพร้อมขยายบริษัทอื่น)
ภาษา:            ไทย (UI หลัก)
ที่ตอบลูกค้า:     ส่งหา maliwan + cc jariya
```

---

*Last updated: 2026-06-18 — generated for personal AI secretary context.
ถ้ามีฟีเจอร์เพิ่ม/เปลี่ยน workflow ให้ผู้พัฒนา update ไฟล์นี้.*
