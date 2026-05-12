# SmartCard — Go-to-Market Plan

> เอกสารวางแผนการขาย/การตลาดเชิงปฏิบัติ — based on Marketing Handoff (commit 34b0710)
> Last updated: 2026-05-10

---

## Executive Summary

**โอกาสตลาด:** AI business card scanner ที่มี event-based capture + multi-tenant + Thai-first UX — แตกต่างจาก CamCard/ABBYY/Sansan ที่ generic
**Cost-to-serve:** ~2.5 บาท/user/เดือน → ขายที่ 99-599 บาท margin >97%
**Sweet spot:** B2B exhibitors + event agencies ที่ออกงาน trade show 5+ ครั้ง/ปี
**90-day target:** 10-15 paying customers, MRR 30,000-80,000 บาท

---

## 1. Ideal Customer Profile (ICP)

### Tier 1 — Sweet Spot (โฟกัสก่อน)
**B2B Trade Show Exhibitors**
- บริษัทที่ออกบูธงานเช่น THAIFEX, Manufacturing Expo, ProPak, Money Expo, Architect Expo, TILOG-Logistix
- ขนาดทีมขาย 5-30 คน
- ออกงาน 5+ ครั้ง/ปี, lead per event 100-500 ใบ
- Industry: Food ingredient, Industrial machinery, IT/SaaS B2B, Financial services, Logistics, Construction materials
- Budget signal: ค่าออกบูธ 200,000-1M+ บาท/งาน → ราคา SmartCard เป็น <1% ของ event cost

### Tier 2 — Volume Play
**Event Agency / Marketing Agency**
- รับจัดงานให้ลูกค้า → ขายเป็น "lead capture add-on service"
- ใช้ multi-tenant feature ดูแลลูกค้าหลายบริษัทในระบบเดียว
- White-label opportunity (rebrand เป็นชื่อ agency)
- Top 20 event agency ในไทย: NCC, Index Creative, Pico Thailand, IMPACT Exhibition, etc.

### Tier 3 — Niche/Expansion
- **Property developer** — open house, sales gallery events
- **University/Education** — open day, education fair, recruiting
- **Conference/Seminar organizer** — networking events
- **Recruiting/HR agency** — career fair lead capture

### ❌ ไม่ใช่ ICP (อย่าเสียเวลา)
- B2C retail / e-commerce
- ลูกค้าที่ต้องการ full CRM functionality (push ไป HubSpot/Salesforce แทน)
- Enterprise ที่ต้อง SOC 2 / ISO 27001 / on-premise (จนกว่าจะมี)
- Single-user freelancer (margin ไม่คุ้ม support)

---

## 2. Positioning & Messaging

### Master positioning (ใช้ใน deck + landing page)
> **"AI สแกนนามบัตรที่เปลี่ยนงานอีเวนต์เป็น ROI ที่วัดได้"**
> ระบบเดียวที่ผูกทุก lead กับ event + custom field → รู้ทันทีว่างานไหนได้ผลที่สุด ใครเก็บ lead ได้มากที่สุด สินค้าไหนมีคนสนใจที่สุด

### 3 messaging angles ตาม buyer persona

**Angle A — Speed (สำหรับ Sales Manager):**
> "นามบัตร 200 ใบ → Excel พร้อมส่งทีม follow up ใน 30 นาที (ไม่ใช่ 3 ชั่วโมง)"

**Angle B — ROI (สำหรับ Marketing Director):**
> "วัด Cost per Lead, Lead per Event, Conversion per Product Interest — ทุกงานอีเวนต์ที่ลงทุนไป"

**Angle C — Multi-tenant (สำหรับ Agency Owner):**
> "ดูแลลูกค้า 10+ บริษัทในระบบเดียว — ขายเป็น recurring revenue ของ agency คุณได้"

### Tagline candidates (เลือก 1)
- "Scan once. Sell smarter."
- "นามบัตรไม่หาย ลีดไม่หล่น"
- "Every booth. Every business card. Every insight."

---

## 3. Pricing Strategy

### 4-Tier SaaS Pricing

| Tier | ราคา/user/เดือน | จำกัด | สำหรับใคร |
|---|---|---|---|
| **Starter** | 99 บาท (รายปี 999) | 1 บริษัท, 200 scan/user/เดือน, 5 users max | ทีมขายเล็ก, ทดลองใช้ |
| **Professional** ⭐ | 299 บาท | 1 บริษัท, ไม่จำกัด scan/user, ไม่จำกัด users, Google Sheets sync | ทีมขาย 10-50 คน (sweet spot) |
| **Business** | 599 บาท | 3-5 tenants, custom branding, priority support, QBR | บริษัทกลุ่ม / multi-brand |
| **Enterprise / Agency** | Custom (เริ่ม 50K/เดือน) | Unlimited tenants, white-label, custom OCR, SLA 99.9% | Event agency, Reseller |

### Add-on Services (One-time + Recurring)

| Service | ราคา one-time | ราคา recurring |
|---|---|---|
| Setup & onboarding | 15,000 | - |
| CRM webhook integration (HubSpot/Salesforce/Pipedrive) | 80,000-150,000 | 5,000/เดือน maintenance |
| White-label rebrand (web only) | 100,000 | 15,000/เดือน |
| White-label mobile app (App Store/Play Store) | 250,000 | 10,000/เดือน |
| PDPA consent flow setup | 50,000 | - |
| 2FA / SSO (Google/Microsoft) | 80,000 | - |
| Custom OCR tuning (ภาษาญี่ปุ่น/จีน/เกาหลี) | 60,000/ภาษา | - |
| ROI dashboard (Looker/Power BI) setup | 40,000 | - |
| Custom Event Template | 5,000-15,000/template | - |

### Pricing tactics
- **Annual discount:** -17% (รายเดือน 299 → รายปี 2,990 = ฟรี 2 เดือน)
- **Founding customer discount:** -50% ปีแรก สำหรับ 10 ลูกค้าแรก แลกกับ case study + testimonial
- **Event-based pricing option:** 5,000 บาท/event (สำหรับลูกค้าที่ออกงานปีละ 1-2 ครั้ง — เก็บ pre-paid)
- **Free tier:** ฟรี 1 user, 50 scan/เดือน, 14 วัน — ไม่ต้องบัตรเครดิต

---

## 4. Go-to-Market Channels (เรียงตาม priority/ROI)

### 🎯 Channel 1: Outbound Targeted (Quick wins — เริ่มสัปดาห์นี้)
**กิจกรรม:**
- ดึง exhibitor list จาก trade show ที่กำลังจะมา (THAIFEX 2026 พ.ค., Manufacturing Expo มิ.ย., ProPak มิ.ย.)
- หา Marketing Manager / Sales Director ผ่าน LinkedIn Sales Navigator
- Cold outreach: LinkedIn DM + email + LINE OA (3 touchpoint)

**Volume target:** 50 prospects/สัปดาห์, 5% positive response → 10 demo/เดือน → 2-3 close

**Script:**
> "เห็นว่าทีมจะออกบูธในงาน [X] เดือนหน้า — เผื่อยังไม่มีระบบเก็บ lead ที่วัด ROI งานอีเวนต์ได้ ผมมีระบบที่ใช้กันใน [reference customer] อยากให้ดู demo 15 นาทีไหมครับ"

### 🎯 Channel 2: Partnership (High leverage)
**Target partners:**
- **Event organizer:** TCEB, BITEC, IMPACT, QSNCC → bundle เป็น "lead capture" service ให้ exhibitor
- **Trade association:** สภาอุตสาหกรรมแห่งประเทศไทย, สภาหอการค้า, TASA → group buy
- **CRM partner:** HubSpot Solutions Partner, Salesforce consultant ในไทย → integration partner
- **Marketing agency:** บริษัท agency ที่ดูแล booth ลูกค้า → reseller

**Deal structure:** 30% commission ปีแรก, 15% renewal

### 🎯 Channel 3: Inbound Content (Long-term moat)
**SEO content (TH + EN):**
- "เก็บ lead จากงานอีเวนต์อย่างมืออาชีพ"
- "AI สแกนนามบัตร เปรียบเทียบ CamCard vs SmartCard"
- "วัด ROI งาน trade show ด้วย custom field per event"
- "PDPA สำหรับการเก็บ lead ในงานอีเวนต์"

**LinkedIn series:**
- เผยแพร่ 2 posts/สัปดาห์ — case study, ROI calculator, event marketing tips
- Engage Marketing Manager / Sales Director ตรง

### 🎯 Channel 4: Paid Ads (Selective)
- LinkedIn Ads targeted: Job title "Marketing Manager / Sales Director" + Industry filter (B2B)
- Google Ads: "ระบบเก็บ lead", "scan business card thailand", "lead capture event"
- งบเริ่มต้น 20,000 บาท/เดือน — track CPA target <2,500 บาท

### 🎯 Channel 5: Live Demo at Trade Show
- ออกบูธเล็กๆ (3×3) ในงาน Thai-style B2B trade show 1-2 งาน/quarter
- Live demo สแกนนามบัตรของผู้เข้าชมบูธ → เก็บเป็น lead ตัวเองทันที (eat your own dog food)
- งบประมาณ: 80,000-150,000 บาท/งาน รวมค่าบูธ + staff

---

## 5. Sales Playbook

### Qualification Framework (BANT + custom)
1. **Budget:** "ค่าออกบูธ trade show ปีละเท่าไหร่ครับ?" (ถ้า <500K — push Starter; ถ้า >2M — push Business)
2. **Authority:** "การตัดสินใจเรื่อง marketing tool ผ่านใครบ้าง?"
3. **Need:**
   - "ทีมออกงานอีเวนต์กี่ครั้ง/ปี?"
   - "เก็บ lead ได้กี่ใบ/งาน?"
   - "ใช้วิธีอะไรเก็บข้อมูลตอนนี้?" (Excel/Google Form/CamCard/CRM/กล่องนามบัตร)
   - "หลังกลับจากงาน ใช้เวลาเท่าไหร่ก่อนข้อมูลเข้า CRM?"
4. **Timeline:** "งานอีเวนต์ครั้งต่อไปเมื่อไหร่?" (เป็น forcing event)
5. **Tech stack:** "ใช้ CRM อะไรอยู่?" (HubSpot/Salesforce/Zoho/Sheets/None)

### Top 8 Objections + Responses

| Objection | Response |
|---|---|
| "เรามี CamCard / Sansan อยู่แล้ว" | CamCard เก็บแค่ contact ไม่ผูกกับ event — วัด ROI ต่องาน, ต่อสินค้า, ต่อพนักงาน ไม่ได้ |
| "ราคาแพง" | ROI math: ทีม 10 คน × 299 = 2,990/เดือน vs lead ที่หาย/พิมพ์ผิด 1 ใบ = ค่าเสียโอกาส 50,000+ บาท |
| "PDPA ทำได้ไหม?" | ตอบตรง: built-in ยังไม่มี consent flow — มี add-on package 50,000 one-time ครอบคลุม consent + DSAR |
| "Integrate กับ CRM ของเราได้ไหม?" | Excel export พร้อมใช้ + Google Sheets sync built-in / webhook integration เป็น paid service 80-150K |
| "Mobile app ใน App Store?" | (ตรงไปตรงมา) ตอนนี้ web mobile-responsive ใช้ได้ทันที, native app launch Q3 2026 |
| "มี case study?" | ⚠️ pre-launch — เสนอ founding customer program -50% ปีแรกแลกกับ testimonial |
| "Security/data ownership?" | RLS ระดับ DB, encryption at rest/transit, ลูกค้า export ข้อมูลออกได้ตลอด — no lock-in |
| "Free trial ได้ไหม?" | 14 วันฟรี ไม่ต้องบัตรเครดิต / Pilot 60 วันสำหรับ founding customer |

### Demo Flow (3 นาที — ตาม handoff)
0:00-0:30 Login + brand showcase
0:30-1:30 Scan flow (พระเอก) — 2 ใบ + custom field
1:30-2:30 Admin dashboard + Excel export
2:30-3:00 Multi-tenant + Event template

### Close + Next Step Templates
- **Hot lead:** "งบ Q นี้พร้อมไหม? เริ่ม pilot 60 วันก่อนงาน [event] ได้เลยนะครับ"
- **Warm lead:** "ผมส่ง ROI calculator + case study ใส่ email ภายในวันนี้ — นัดคุยอีกที [วัน] ดีไหม?"
- **Cold lead:** "ผม subscribe เข้า newsletter ให้ — ตอนใกล้งานอีเวนต์ครั้งหน้าค่อยคุยกันใหม่"

---

## 6. Marketing Assets — Priority Build List

### P0 — สัปดาห์ที่ 1-2 (must-have เพื่อรับ lead)
1. **Landing page** — hero + 3 use cases + pricing + free trial CTA
2. **Pricing page** — 4 tier table + comparison + FAQ
3. **Demo video 90 วินาที** — screen recording + voiceover
4. **Email signature + LINE OA QR** — เริ่ม personal outreach
5. **One-pager PDF (TH/EN)** — ส่งหลัง demo

### P1 — เดือนที่ 1-2 (เพิ่ม conversion)
6. **ROI Calculator** — interactive form: # event/year × # lead/event → "เวลาประหยัด + lead saved"
7. **Comparison page** — SmartCard vs CamCard / ABBYY / Sansan / Excel
8. **Case study 2-3 ตัว** (ได้จาก founding customer pilot)
9. **Customer testimonial video** 30 วินาที × 2 ตัว
10. **LinkedIn content series** — weekly post (2 ครั้ง/สัปดาห์)

### P2 — เดือนที่ 2-3 (long-term)
11. **Help center expansion** — video tutorials per role
12. **Webinar** "AI Lead Capture for B2B Event Marketing"
13. **Partner page** — สำหรับ reseller/agency program
14. **Blog** — SEO content 1 post/สัปดาห์
15. **Press release** — ลง techsauce, brand inside, marketingoops

---

## 7. 90-Day Execution Plan

### Days 1-30 — Foundation & First Customers
**Week 1:**
- [ ] Lock pricing & tier features
- [ ] Setup landing page + pricing page (use Framer/Webflow)
- [ ] Record demo video
- [ ] เลือก 3 founding customer candidates (ใน NSL ecosystem หรือ network ส่วนตัว)
- [ ] ลบ seeded data "Thaifex 2026" + email "arnon@def2design.com" ออกจาก code

**Week 2:**
- [ ] Onboard founding customer #1 (ฟรี 60 วัน)
- [ ] เริ่ม LinkedIn outreach 50 prospects
- [ ] Build ICP target list 100 บริษัท (exhibitor list งานที่กำลังจะมา)

**Week 3-4:**
- [ ] Demo 10-15 prospects
- [ ] Onboard founding customer #2, #3
- [ ] Document objections + create FAQ
- [ ] First paid customer close

**KPI Day 30:** 3 pilot, 1-2 paid (Starter or Pro)

### Days 31-60 — Sales Activation
- [ ] Demo 20+ prospects/เดือน
- [ ] Launch ROI calculator + comparison page
- [ ] ออกบูธ trade show 1 ครั้ง (ใช้ระบบเองในงาน)
- [ ] เปิด referral program 30% commission
- [ ] เริ่ม case study writing (founding customer ครบ 30 วัน)

**KPI Day 60:** 5-8 paying customers, MRR 15,000-30,000 บาท

### Days 61-90 — Scale & Partner
- [ ] Publish 2 case studies + testimonial videos
- [ ] Webinar 50+ attendees
- [ ] Partnership คุย event organizer 3 ราย, agency 5 ราย
- [ ] Customer success process — onboarding template + 30/60/90 check-in
- [ ] Hire/contract 1 SDR ถ้าผ่าน MRR 50K

**KPI Day 90:** 10-15 paying customers, MRR 30,000-80,000 บาท, NRR >100%

---

## 8. Risk & Mitigation

### High-priority risks

| Risk | Impact | Mitigation |
|---|---|---|
| ไม่มี CRM integration → enterprise reject | High | สร้าง Google Sheets template + Zapier webhook recipe / promise CRM webhook ใน Q3 |
| ไม่มี PDPA consent → corporate hesitate | High | Compliance package 50K one-time + คำตอบ FAQ ชัด / external Google Form for consent |
| Mobile app ยังไม่ submit store | Medium | Web mobile-responsive ใช้ได้ทันที / Q3 launch promise |
| ไม่มี customer testimonial | High | Founding customer program -50% ปีแรก เร่งสร้าง social proof |
| Hardcoded demo content (`arnon@def2design.com`, "Thaifex 2026") | Low (image) | ลบออกก่อน launch landing page |
| ไม่มี Excel export >5K records | Medium | Roadmap promise Q3 หรือ paid bulk export feature |

### Watch list (สำหรับ next quarter)
- Gemini API cost ถ้า scale เกิน 100K scan/เดือน → คุยกับ Google for enterprise rate
- Multi-language OCR (ญี่ปุ่น/จีน) — ลูกค้า export-import จะถาม
- SOC 2 / ISO certification — enterprise sale จะ block จนกว่าจะมี

---

## 9. Key Numbers to Remember (สำหรับ pitch + Q&A)

- **3 user roles** (user / admin / super_admin)
- **8 event templates** สำเร็จรูป
- **3-model AI fallback** → uptime resilience
- **5,000 records** Excel export per call
- **2 platforms** (Web + Mobile iOS/Android)
- **2 ภาษา** (ไทย + อังกฤษ)
- **~99% OCR accuracy** ภาษาไทย/อังกฤษ
- **30 วินาที** จากสแกนถึงข้อมูลพร้อม save
- **<3 ชั่วโมง → 30 นาที** ลดเวลาทำงานหลัง event 6 เท่า
- **Margin >97%** ที่ pricing 99-299 บาท

---

## 10. Reference Customer Pipeline (เริ่มจากคนใกล้ตัว)

แนะนำ Tier 1 prospects ที่ Golf เข้าถึงได้:
1. **NSL Foods (own group)** — Food Service team ที่ออก THAIFEX, ProPak (use case ภายใน + case study #1)
2. **NSL Intertrade (own group)** — Sales team ที่ออกงาน export trade fair
3. **บริษัท เดฟ ทู ดีไซน์ จำกัด** — ลูกค้าเก่า, อาจแนะนำต่อ
4. **SET-listed companies ที่ Golf ทำ IR ให้** — บริษัทที่ออกบูธ Money Expo, SET in the City
5. **Event agency ใน network IR** — บริษัทจัด AGM/Oppday ที่อาจสนใจขยายไป trade show

---

## Appendix A — Sales Email Templates

### Cold outreach #1 (LinkedIn DM)
> สวัสดีคุณ [Name] ครับ
> เห็นว่า [Company] จะออกบูธในงาน [Event] เดือนหน้า ผมพัฒนาระบบ AI สแกนนามบัตรที่เปลี่ยนทุก lead ให้เป็น Excel + insight ต่อ event ได้ทันที
> ลูกค้าใช้แล้วบอกว่าลดเวลาทำงานหลัง event จาก 3 ชั่วโมง → 30 นาที
> ขอนัด 15 นาที demo สัปดาห์หน้าได้ไหมครับ?

### Follow-up หลัง demo
> ขอบคุณที่สละเวลา demo ครับคุณ [Name]
> สรุปประเด็นที่คุยกัน: [pain point ที่ตรง]
> แนบ ROI calculator + pricing tier ที่เหมาะกับทีมขนาด [X] คนของคุณ
> Founding customer offer: -50% ปีแรกถ้า sign ภายใน [วันที่]
> นัดคุย next step วันที่ [X] เวลา [Y] ได้ไหมครับ?

### Closing nudge
> สวัสดีครับคุณ [Name]
> เห็นงาน [Event] เหลืออีก [N] วันแล้ว ถ้าเริ่ม onboard สัปดาห์นี้จะได้ทดลองใช้จริงในงานเลย
> ผมเตรียม onboarding 30 นาทีพร้อม template event ของอุตสาหกรรม [X] ให้แล้ว
> Confirm เริ่ม pilot ภายในวันนี้ได้ไหมครับ?

---

## Appendix B — Landing Page Copy (ตัวอย่าง hero)

**Headline:**
> AI สแกนนามบัตรที่เปลี่ยนงานอีเวนต์เป็น ROI ที่วัดได้

**Sub-headline:**
> นามบัตร 200 ใบ → Excel พร้อมส่งทีม follow up ใน 30 นาที
> ไม่ต้องพิมพ์ ไม่หายลีด วัด ROI ทุกงานอีเวนต์ที่ลงทุนไป

**Primary CTA:** ทดลองฟรี 14 วัน (ไม่ต้องบัตรเครดิต)
**Secondary CTA:** ดู demo 90 วินาที

**3 social proof bars:**
- "ลด time-to-CRM 6 เท่า" — [Customer]
- "วัด ROI งาน [Event] ได้ทันที" — [Customer]
- "ดูแลลูกค้า 12 บริษัทในระบบเดียว" — [Agency]
