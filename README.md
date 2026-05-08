# SmartCard 📇

แอปสแกนนามบัตรลง Google Sheet สำหรับทีมขาย — ถ่ายรูปนามบัตร แล้วข้อมูลจะถูก OCR ด้วย Gemini API
และบันทึกลง Google Sheet เดียวกัน พร้อมระบุเครื่องที่บันทึก

```
[iPhone] → ถ่าย/เลือกรูป → [Vercel] → Gemini Vision → [แก้ไข] → Google Sheet
```

## โครงสร้างโปรเจกต์

```
SmartCard/
├── app/        # Expo (React Native) iOS app
└── server/     # Vercel serverless functions (Gemini + Google Sheets)
```

---

## ⚙️ Setup (ทำครั้งเดียว)

### 1. สร้าง Google Sheet
1. ไปที่ https://sheets.google.com → สร้างชีตใหม่ ตั้งชื่อเช่น `SmartCard - ฐานข้อมูลนามบัตร`
2. ย้ายไฟล์ไปไว้ใน folder ของทีมบน Google Drive (Drive → New → Folder → ลากไฟล์เข้า)
3. กดปุ่ม **Share** ขวาบน → ตั้งสิทธิ์ "ทุกคนในองค์กร" หรือเชิญสมาชิกทีมตามต้องการ
4. คัดลอก **Sheet ID** จาก URL: `https://docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`

### 2. ขอ Gemini API key
1. ไปที่ https://aistudio.google.com/apikey
2. กด **Create API key** → คัดลอก key เก็บไว้

### 3. สร้าง Service Account สำหรับเขียน Google Sheet
1. ไปที่ https://console.cloud.google.com/ → สร้าง Project ใหม่ (เช่น `smartcard`)
2. เปิดใช้งาน API:
   - https://console.cloud.google.com/apis/library/sheets.googleapis.com → **Enable**
3. สร้าง Service Account:
   - https://console.cloud.google.com/iam-admin/serviceaccounts → **Create Service Account**
   - ชื่ออะไรก็ได้ เช่น `smartcard-writer` → กด **Create and Continue** → ข้าม role → **Done**
4. คลิกที่ Service Account ที่สร้าง → แท็บ **Keys** → **Add Key** → **Create new key** → **JSON**
   - จะดาวน์โหลดไฟล์ `xxx.json` มา **เก็บให้ดี อย่า commit เข้า git**
5. **คัดลอก email ของ service account** (เช่น `smartcard-writer@xxx.iam.gserviceaccount.com`)
6. กลับไปที่ Google Sheet → กด **Share** → ใส่ email service account → ตั้งเป็น **Editor** → **Send**

### 4. Deploy backend ไป Vercel
```bash
cd server
npm install
npx vercel login         # ถ้ายังไม่เคย login
npx vercel link          # ผูกกับ project ใหม่ (ตอบ Y → ตั้งชื่อ smartcard)
```

ตั้งค่า environment variables (ทำผ่าน Vercel Dashboard หรือ CLI):

| ตัวแปร | ค่า |
|---|---|
| `GEMINI_API_KEY` | API key จากข้อ 2 |
| `GOOGLE_SHEET_ID` | Sheet ID จากข้อ 1 |
| `GOOGLE_SHEET_TAB` | `Sheet1` (หรือชื่อแท็บที่ใช้) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` จากไฟล์ JSON |
| `GOOGLE_PRIVATE_KEY` | `private_key` จากไฟล์ JSON (รวม `\n` ทั้งหมด) |

ใช้ CLI ตั้งค่าได้ดังนี้:
```bash
npx vercel env add GEMINI_API_KEY production
npx vercel env add GOOGLE_SHEET_ID production
npx vercel env add GOOGLE_SHEET_TAB production
npx vercel env add GOOGLE_SERVICE_ACCOUNT_EMAIL production
npx vercel env add GOOGLE_PRIVATE_KEY production
# (ทำซ้ำกับ preview/development ถ้าจะ test ผ่าน vercel dev)
```

> **GOOGLE_PRIVATE_KEY tip:** เปิดไฟล์ JSON service account → คัดลอกค่า `private_key` ทั้งก้อน
> **รวม `\n`** ที่อยู่ในนั้น (ไม่ต้องแปลงเป็น newline จริง) แล้ววางลงใน Vercel
>
> โค้ดจะ replace `\n` กลับเป็น newline ให้เอง

Deploy:
```bash
npx vercel --prod
```

จะได้ URL เช่น `https://smartcard-xxx.vercel.app` — **คัดลอก URL นี้ไว้**

ทดสอบ:
```bash
curl https://smartcard-xxx.vercel.app/api/health
# ต้องคืนค่า: {"ok":true,"hasGeminiKey":true,"hasSheetId":true,"hasServiceAccount":true}
```

### 5. ตั้งค่า mobile app

แก้ `app/app.json` → ในส่วน `extra.apiBaseUrl` ใส่ URL Vercel จากข้อ 4:

```json
"extra": {
  "apiBaseUrl": "https://smartcard-xxx.vercel.app"
}
```

ติดตั้ง dependencies + รัน:
```bash
cd app
npm install
npx expo start
```

แสกน QR code ด้วย **Expo Go** บน iPhone (ดาวน์โหลดจาก App Store)

---

## 🚀 การใช้งาน

1. เปิดแอป SmartCard บน iPhone
2. กด **📷 ถ่ายรูปนามบัตร** หรือ **🖼 เลือกจากคลังรูปภาพ**
3. รอ Gemini อ่านข้อมูล (~3-5 วินาที)
4. ตรวจสอบ/แก้ไขข้อมูลในหน้า Review
5. กด **💾 บันทึกลง Google Sheet**
6. เปิด Google Sheet เพื่อดูข้อมูลทั้งทีม → Export เป็น .xlsx ได้ทุกเมื่อ (`File → Download → Microsoft Excel`)

---

## 📊 รูปแบบข้อมูลในชีต

| วันที่ | ชื่อ | ตำแหน่ง | บริษัท | โทรศัพท์ | อีเมล | เว็บไซต์ | ที่อยู่ | บันทึกโดย (เครื่อง) |
|---|---|---|---|---|---|---|---|---|

ระบบจะใส่ header แถวแรกอัตโนมัติเมื่อเริ่มใช้ครั้งแรก

---

## 🛠 Build เป็น iOS app จริง (ไม่ผ่าน Expo Go)

ถ้าทีมใช้บ่อยและไม่อยากเปิดผ่าน Expo Go:

```bash
cd app
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
```

จะได้ `.ipa` ติดตั้งผ่าน TestFlight ได้ (ต้องมี Apple Developer Account)

---

## 🔐 Security Notes

- **ไม่ใส่ API key หรือ Service Account ลง mobile app โดยตรง** — ทุกการเรียกผ่าน Vercel backend เพื่อให้ key ไม่หลุด
- ตอนนี้ backend เปิด public ใครเรียก `/api/save` ก็เขียน Sheet ได้ — ถ้าอยากปลอดภัยขึ้นแนะนำเพิ่ม shared secret header
- Service Account ของ Gemini และ Google Sheet ต้องเก็บใน Vercel env vars เท่านั้น

---

## 📁 ตัวแปรสภาพแวดล้อม (server/.env.example)

ดูที่ [server/.env.example](server/.env.example)
