# Handoff: SmartCard Login Redesign

## Overview
Redesign of the SmartCard authentication entry point (`/login`). The current page is a single centered card with email/password fields. The new design is a **split-screen** layout: the left side communicates the product's value (business-card scanning, lead/CRM intelligence) while the right side hosts a focused login form. The redesign targets the business / sales / marketing audience and is meant to feel modern, premium, and trustworthy.

Three full directions are included — Aurora (light/professional), Midnight (premium dark), and Pulse (bold marketing). The development team should pick **one** and ship it; the others are alternates.

## About the Design Files
The files in this bundle are **design references created in HTML/React** — prototypes that show the intended look-and-feel, layout, copy, and micro-interactions. They are **not** meant to be copy-pasted into production. The task is to **recreate these designs in the SmartCard codebase's existing environment** (the current `/login` page already lives in a Next.js / React app per the URL `smartcard-d24ec.asia-southeast1.hosted.app/login`), using whatever component library, CSS strategy, and form-handling patterns the codebase already uses.

If the codebase already has primitives for `Button`, `Input`, `Card`, etc., reuse those — match the design's visual spec but route through existing components so the rest of the app stays consistent.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and micro-interactions are specified. The implementer should match the design pixel-for-pixel using the codebase's existing libraries and patterns.

## Scope of Changes vs. Current Login
Compared to the original screenshot:
- **Removed**: Single centered card layout, generic blue gradient background, the lone "ติดต่อผู้ดูแลระบบหากยังไม่มีบัญชี" footer link as the only CTA.
- **Added**: Split-screen layout, branded left-side hero with product visuals, value-prop bullets / KPIs / testimonial (depending on variation), trust badges (SOC 2 / ISO 27001 / PDPA), password show/hide toggle, "ลืมรหัสผ่าน?" link.
- **Explicitly NOT included** (per latest direction):
  - No Google / Microsoft / SSO buttons of any kind
  - No "จำการเข้าสู่ระบบ X วัน" (remember-me) checkbox
  - No "ติดต่อทีมขาย" / "ขอเดโม" / "เริ่มทดลอง" CTA at top-right
- **Kept**: Email + password fields, "เข้าสู่ระบบ" submit button, "ติดต่อผู้ดูแลระบบ" support link, footer copyright.

## Three Variations

### V1 · Aurora — Light & Professional
**File**: `login-v1.jsx`
**Use when**: target audience is broad / wants a friendly, approachable feel.

**Left panel** (60% width, 1.05fr in grid):
- Background: linear gradient `135deg` from `#eef1ff` → `#f5f0ff` → `#eaf2ff`, with two soft radial blobs (indigo `#6366F1` top-right, violet `#A78BFA` bottom-left, both at 18-20% opacity, blurred 20px), and a faint dot/grid pattern (42px tiles, opacity ~0.03).
- Brand row top: 40×40 indigo→violet gradient icon (`#4F46E5 → #7C3AED`, 11px radius) + "SmartCard" / "Business Card Intelligence" subtitle.
- Hero block:
  - Eyebrow pill: white bg, indigo border, green dot, copy "v3.2 · เร็วขึ้น 40% สำหรับการสแกนบัตร".
  - H1 (42px, 700, -0.02em tracking): "เปลี่ยนนามบัตรเป็น" / "**โอกาสทางธุรกิจ**" — second line in indigo→violet→pink gradient text.
  - Sub copy (16px, #475569): "สแกน จัดเก็บ และติดตามทุกการติดต่อในที่เดียว — แพลตฟอร์มที่ทีมขายและการตลาดเลือกใช้เพื่อปิดดีลได้เร็วกว่า"
- Center scan visual: an animated business-card scanner mock — one dark "scanned" card behind, one white card in front with corner brackets, an animated horizontal scan line (pure CSS keyframe, 2.6s ease-in-out infinite), avatar circle, name/title/email/phone, OCR-confidence chip "OCR · 99.4%". The front card gently floats (5s ease-in-out).
- Three bullet cards bottom: "OCR แม่นยำ", "CRM อัตโนมัติ", "ติดตาม follow-up" — each with a colored 32×32 icon tile and short subtitle.

**Right panel** (40% width):
- Plain white background, padding 56px 72px.
- Form column max-width 440px, vertically centered.
- H2 (30px, 700): "ยินดีต้อนรับกลับ 👋"
- Sub: "เข้าสู่ระบบเพื่อจัดการนามบัตรและไปป์ไลน์ดีลของคุณ"
- Email field + password field (50px tall, 12px radius, 1.5px border `#E2E8F0`, focus border `#4F46E5` + 4px indigo glow ring at 12% opacity, leading icon, password trailing eye toggle).
- Field row: "ลืมรหัสผ่าน?" link aligned with password label (right side).
- Submit button: 50px tall, gradient `135deg #4F46E5 → #7C3AED`, white text, soft indigo shadow `0 12px 28px -10px rgba(79,70,229,.55)`, right arrow icon.
- Below button: "ยังไม่มีบัญชีหรือมีปัญหา? **ติดต่อผู้ดูแลระบบ**" support link (centered, 13px).
- Footer: copyright + Privacy / Terms / Language switcher (12px, #94A3B8).

### V2 · Midnight — Premium Dark
**File**: `login-v2.jsx`
**Use when**: enterprise positioning, security-forward audience.

**Left panel** (50% width):
- Background: dark navy `#0A0E1F` with mesh gradient layered on top — three overlapping radial gradients (indigo `#6366F1` 35% at 30% 10%, pink `#EC4899` 25% at 100% 100%, cyan `#22D3EE` 18% at 0% 100%), faint white grid (56px tiles, 4.5% opacity, soft radial mask), subtle dot noise overlay.
- Brand row: 38×38 light-violet icon (`#818CF8 → #C084FC`) with glow shadow, "SmartCard" + "ENTERPRISE" pill, "Sales · CRM · Pipeline" subtitle.
- Hero:
  - Eyebrow pill: indigo-tinted bg, pulsing green dot, "ระบบทำงานปกติ · 99.99% uptime".
  - H1 (52px, 700): "ทุกการพบกัน" / "**คือดีลที่กำลังเริ่มต้น**" — second line in light gradient text (`#A5B4FC → #F0ABFC → #FDA4AF`).
- Floating 3D card stack: three glass cards stacked center, all 300×182, each with `boxShadow` + glassmorphism + 3D rotation. Float animations: card-back-left (-110px, 6s), center (0, 5s, z=3), back-right (+120px, 7s) — each translates ~10-22px vertically. Center card includes "HOT LEAD" badge and full lead details.
- KPI row at bottom (3 cols): "2.4M+ นามบัตรที่สแกนแล้ว" / "99.4% ความแม่นยำ OCR" / "1,200+ ทีมที่ใช้งาน". Numbers use white→indigo gradient text (28px, 700).

**Right panel** (50% width):
- Same dark `#0A0E1F` background.
- Form is presented as a **glass card**: `rgba(255,255,255,.03)` bg, 1px white border at 8% opacity, 20px radius, padding 36px, with deep shadow + inset highlight.
- H2 (26px): "เข้าสู่ระบบ" / "กลับมาปิดดีลต่อกันได้เลย — ลงชื่อเข้าใช้บัญชีของคุณ"
- Inputs: 46px tall, `rgba(255,255,255,.04)` bg, 1px border `rgba(255,255,255,.08)`, focus border `rgba(165,180,252,.5)` + 4px ring.
- Submit: 48px, gradient `#A5B4FC → #F0ABFC` with **dark text** `#0B1020` for high contrast, label "เข้าสู่ระบบอย่างปลอดภัย".
- Trust row below card: SOC 2 Type II · ISO 27001 · PDPA Compliant (11.5px, 45% opacity).
- Footer: same pattern (Privacy / Terms / Language).

### V3 · Pulse — Bold Marketing
**File**: `login-v3.jsx`
**Use when**: brand wants to lean confident/aggressive, sales-forward.

**Full-page background** (single layer behind both panels): dark `#0F0820` with three big radial gradients — indigo `#4338CA` at 20% 20%, pink `#BE185D` at 100% 50%, violet `#7C3AED` at 50% 110% — plus repeating concentric rings at 80% 30% (4% opacity, 60px spacing) and grain.

**Left panel** (1.15fr width):
- Brand row: glass icon (white@12% bg, white border) + "SmartCard".
- Eyebrow: pink-tinted "ใหม่ · AI Lead Scoring 2026" with blinking dot.
- H1 (64px, 800): "ปิดดีลได้" / "**เร็วกว่า 3 เท่า**" (in pink-cream-indigo gradient text) / "*ด้วยนามบัตรใบเดียว.*" (italic, lighter weight).
- Sub copy.
- Testimonial glass card: quote from "คุณวรรณภา ศิริชัย · VP of Sales · Aurora Brands" with 5-star rating, decorative " mark.
- "Trusted by" logo strip: SCG · True · BANGCHAK · SCB× · +1,200 (text chips, glassmorphic).

**Right panel** (1fr width):
- Form card sits in front of the gradient as a **bright white card** (`rgba(255,255,255,.95)`, 24px radius, 40×36 padding, deep dark shadow).
- Floating "SECURE LOGIN" badge at top-right of the card (gradient pink→purple pill).
- H2 (28px, 800): "เริ่มสร้างไปป์ไลน์" / "เข้าสู่ระบบเพื่อจัดการนามบัตรและลีดของคุณ"
- Inputs: 50px tall, 13px radius, focus violet `#A855F7`.
- Submit: 54px, gradient `#7C3AED → #EC4899`, big violet shadow.
- Below card: trust row "🛡 SOC 2 · ISO 27001 · PDPA".

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Indigo 600 (primary) | `#4F46E5` | Buttons, accents, focus ring (V1) |
| Violet 600 | `#7C3AED` | Gradient endpoint |
| Pink 500 | `#EC4899` | Gradient/marketing accent (V3) |
| Indigo 300 | `#A5B4FC` | Dark-mode text accent (V2) |
| Slate 900 / Ink | `#0B1020` | Body text on light, dark surfaces |
| Slate 600 | `#475569` | Body copy |
| Slate 500 | `#64748B` | Sub copy |
| Slate 400 | `#94A3B8` | Muted / icon |
| Slate 300 | `#CBD5E1` | Inactive borders |
| Slate 200 | `#E2E8F0` | Default input border |
| Slate 100 | `#F1F5F9` | Subtle surfaces |
| Surface white | `#FFFFFF` | Cards |
| Aurora bg start | `#eef1ff` | V1 left panel gradient |
| Aurora bg mid | `#f5f0ff` | V1 left panel gradient |
| Aurora bg end | `#eaf2ff` | V1 left panel gradient |
| Midnight bg | `#0A0E1F` | V2 page background |
| Pulse bg | `#0F0820` | V3 page background |
| Success | `#10B981` / `#34D399` | Status dots |

### Typography
- **Latin / display**: `Plus Jakarta Sans` (400/500/600/700/800) via Google Fonts.
- **Thai**: `IBM Plex Sans Thai` (300/400/500/600/700) via Google Fonts.
- Stack: `'IBM Plex Sans Thai', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- Type scale used: 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 15.5 / 16 / 16.5 / 18 / 26 / 28 / 30 / 42 / 52 / 64 px
- Headline tracking: `-0.02em` to `-0.03em`. Body line-height: 1.55–1.65.

### Radius
- Inputs: 11–13px
- Buttons: 11–13px
- Small chips/pills: 5–9px / 999px
- Card: 18–24px

### Shadow
- Button (indigo): `0 12px 28px -10px rgba(79,70,229,.55)`
- Card (light): `0 30px 80px -20px rgba(15,23,42,.25)`
- Card (dark): `0 30px 80px -30px rgba(0,0,0,.6)`
- Input focus ring: `0 0 0 4px rgba(<accent>,.12)`

### Spacing
- Page padding: 48–56–72 px (varies by viewport)
- Form column max-width: 420–440 px
- Grid gap (KPI/bullets): 14–24 px

## Interactions & Behavior
- **Email/password validation**: required, email regex, password min 8 chars. Show inline errors below each input on blur (use codebase's existing form library).
- **Password show/hide**: trailing eye button, toggles input type between `password` and `text`. Already in mocks.
- **Focus state**: input border becomes the variation's accent color + 4px translucent ring. CSS-only.
- **Submit**: disable during request, swap label to spinner. On success, route to dashboard. On 401, show inline form error "อีเมลหรือรหัสผ่านไม่ถูกต้อง" above the email field.
- **"ลืมรหัสผ่าน?"** link → `/forgot-password` (route doesn't exist yet — coordinate with PM if needed).
- **"ติดต่อผู้ดูแลระบบ"** link → `mailto:` or existing support contact.
- **Animations**: card float / scan-line / pulsing dot are pure CSS keyframes — keep as-is, no JS animation library required.
- **Reduce motion**: respect `prefers-reduced-motion: reduce` and disable the keyframe animations.

## State Management
Minimal — local component state only:
- `email: string`
- `password: string`
- `showPassword: boolean`
- `submitting: boolean`
- `error: string | null`

No global state required. Auth call goes through existing auth provider (Firebase / NextAuth / whatever the codebase uses — check before implementing).

## Responsive Behavior
- ≥1280px: full split-screen as designed.
- 1024–1279px: left panel content clamps; can drop the bullet cards (V1) or KPI strip (V2) if vertical space is tight.
- <1024px (tablet/mobile): collapse to single column. Show only the form (right panel) full-width with a slim brand bar at top. Hide the marketing visuals or reduce to a small banner.

## Assets
- **Fonts**: loaded from Google Fonts (`fonts.googleapis.com`).
- **Icons**: all icons in the prototypes are inline SVG — no icon library required. Implementer can swap to the codebase's existing icon library (Lucide, Heroicons, etc.) keeping the same visual weight (1.8px stroke).
- **Images**: none — all visuals are CSS gradients + SVG.
- **Avatars in mockups**: pure CSS gradient circles as placeholders. In production, use real user/avatar imagery if available, or leave as gradient placeholders for the marketing-side mock cards.

## Files in This Handoff
| File | Purpose |
|---|---|
| `SmartCard Login.html` | Entry point that mounts the design canvas with all 3 variations. Open in a browser to preview. |
| `design-canvas.jsx` | Canvas wrapper (pan/zoom presentation only — **not** for production). |
| `login-v1.jsx` | Variation 1 — Aurora (light). |
| `login-v2.jsx` | Variation 2 — Midnight (dark premium). |
| `login-v3.jsx` | Variation 3 — Pulse (bold marketing). |

The `*.jsx` files use inline-style objects (no Tailwind, no CSS module) so values are easy to read and lift. When implementing, port styles to whatever the codebase uses — Tailwind classes, CSS modules, styled-components, etc.

## Suggested Implementation Order
1. Decide which variation to ship (recommend Aurora for safest, Midnight for enterprise feel).
2. Build the page shell (split grid + brand row + footer).
3. Implement the form (email, password, submit, error handling) using existing form primitives.
4. Add the left-panel hero (gradient bg + headline + sub).
5. Add the supporting visual (scanner mock / card stack / testimonial — depending on variation).
6. Add CSS keyframe animations + `prefers-reduced-motion` guard.
7. Wire to auth provider, test 200/401/500 flows.
8. Responsive QA at 1440 / 1280 / 1024 / 768 / 375.
