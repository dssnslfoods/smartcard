# SmartCard 📇

แอปสแกนนามบัตรด้วย AI สำหรับทีมขาย — ถ่ายรูปนามบัตร 1-2 รูป AI อ่านข้อมูลแล้ว
บันทึกลงฐานข้อมูล Supabase พร้อมจัดการ event และรายงาน

```
[Web (mobile/desktop)] → Gemini Vision OCR → [แก้ไข] → Supabase
                                ↓
                        Firebase Storage (รูป)
```

---

## ⚖️ License & Copyright

**SmartCard — Business Card Scanner Application**

**Copyright © 2026 Arnon Arpaket. All rights reserved.**

This software is proprietary and confidential. Unauthorized copying,
modification, distribution, or use of this software, in whole or in part,
is strictly prohibited without prior written permission.

For licensing inquiries: **arnon@def2design.com**

See [LICENSE](LICENSE) for full terms.

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────┐
│  GitHub (source)                                  │
└────────────────┬─────────────────────────────────┘
                 │ auto-deploy
┌────────────────▼─────────────────────────────────┐
│  Firebase App Hosting (Next.js webapp)           │
└────────────────┬─────────────────────────────────┘
                 │
        ┌────────┼────────┬─────────────┐
        ▼        ▼        ▼             ▼
   ┌────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐
   │Supabase│ │Firebase │ │ Gemini  │ │ Web      │
   │        │ │ Storage │ │   API   │ │ (mobile  │
   │DB+Auth │ │  (รูป)  │ │  (OCR)  │ │ + desktop)│
   └────────┘ └─────────┘ └─────────┘ └──────────┘
```

## 📐 Database Schema

```
contacts (master)        attendances (join)        events
─────────────────        ──────────────────        ──────
id                  ←──  contact_id                id
name                     event_id  ──→             slug
position                 event_data (jsonb)        name
company                  image_urls                fields (jsonb)
phone                    scanned_by                event_date
email (FK dedup)         scanned_at                active
website                  notes
address
image_urls
first/last_scanned_at
```

## 🚀 Setup

### Required services
1. **Supabase** project (DB + Auth + RLS)
2. **Firebase** project (App Hosting + Storage)
3. **Gemini API** key (Google AI Studio)

### Environment variables
See [server/apphosting.yaml](server/apphosting.yaml) for required env vars.

### Deploy
Push to `main` branch → Firebase App Hosting auto-builds and deploys.

```bash
# Manual rollout (if needed)
firebase apphosting:rollouts:create smartcard --git-branch main --project smartcard-d24ec
```

## 📂 Project Structure

```
SmartCard/
├── server/                  # Next.js webapp
│   ├── app/                 # Routes (App Router)
│   │   ├── login/
│   │   ├── scan/            # User landing — scan flow
│   │   ├── dashboard/       # Admin overview + reports
│   │   ├── admin/events/    # Event management + templates
│   │   ├── admin/users/     # User management
│   │   └── api/             # API routes
│   ├── components/          # Shared UI
│   └── lib/                 # Backend libs (supabase, storage, etc.)
└── LICENSE                  # All rights reserved
```

## 🔐 Security

- Row Level Security (RLS) enforced at database level
- Auth via Supabase Auth (email/password)
- All admin routes gated by `role='admin'` check
- Service-account credentials never exposed to client

---

**© 2026 Arnon Arpaket** — Proprietary software. All rights reserved.
