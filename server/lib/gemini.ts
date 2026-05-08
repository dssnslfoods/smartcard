const MODELS = ["gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-2.5-flash"];
const MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type CardData = {
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
};

const SYSTEM_PROMPT = `คุณเป็น OCR สำหรับนามบัตร อ่านข้อมูลจากรูปนามบัตรแล้วคืนค่าเป็น JSON ตาม schema
- name: ชื่อ-นามสกุล (ใส่คำนำหน้าถ้ามี)
- position: ตำแหน่งงาน
- company: ชื่อบริษัท
- phone: เบอร์โทรศัพท์ — ใช้รูปแบบนี้เคร่งครัด:
    • ถ้าขึ้นต้นด้วย "+" (รหัสประเทศ) ให้คงไว้ เช่น "+66 2 123 4567"
    • ลบสัญลักษณ์ส่วนเกินออก (วงเล็บ, จุด) ใช้ "-" หรือเว้นวรรคคั่นกลุ่มตัวเลข
    • ถ้ามี ext./ต่อ ใช้ " ext. 123" ต่อท้าย
    • ถ้ามีหลายเบอร์ คั่นด้วย ", " (เช่น มือถือ + ออฟฟิศ + แฟกซ์ ให้แยกเป็นรายการ)
    • ใช้เฉพาะเลขโทรศัพท์เท่านั้น ห้ามรวม fax label หรือคำว่า "Tel:" / "Mobile:" / "โทร" / "มือถือ" ใน string
- email: อีเมล (lowercase, ไม่มีช่องว่าง)
- website: URL เว็บไซต์ (ตัด http:// ออก ถ้าไม่จำเป็น)
- address: ที่อยู่ (รวมเป็นบรรทัดเดียว, คั่นบรรทัดเดิมด้วยเว้นวรรค)

กฎสำคัญ:
- ถ้าฟิลด์ไหนหาไม่เจอให้ใส่ string ว่าง ""
- อย่าเดาข้อมูลที่ไม่มีในรูป
- อย่าใส่ตัวอักษรพิเศษที่ Spreadsheet อาจตีความเป็นสูตร เช่น ขึ้นต้น phone ด้วย "=" หรือ "@"`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string" },
    position: { type: "string" },
    company: { type: "string" },
    phone: { type: "string" },
    email: { type: "string" },
    website: { type: "string" },
    address: { type: "string" },
  },
  required: ["name", "position", "company", "phone", "email", "website", "address"],
};

async function callGemini(
  model: string,
  body: object,
  apiKey: string
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  let lastErr = "";
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(`${model} returned no text content`);
      return text;
    }

    lastErr = await res.text();
    const retryable = res.status === 503 || res.status === 429 || res.status >= 500;
    if (!retryable || attempt === MAX_RETRIES) {
      throw new Error(`${model} error (${res.status}): ${lastErr}`);
    }
    await sleep(500 * Math.pow(2, attempt));
  }
  throw new Error(`${model} failed: ${lastErr}`);
}

export async function extractCardFromImage(imageBase64: string): Promise<CardData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: "image/jpeg", data: imageBase64 } },
          { text: SYSTEM_PROMPT },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0,
    },
  };

  let lastErr: unknown = null;
  for (const model of MODELS) {
    try {
      const text = await callGemini(model, body, apiKey);
      const parsed = JSON.parse(text) as CardData;
      return {
        name: parsed.name ?? "",
        position: parsed.position ?? "",
        company: parsed.company ?? "",
        phone: parsed.phone ?? "",
        email: parsed.email ?? "",
        website: parsed.website ?? "",
        address: parsed.address ?? "",
      };
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const overloaded = /\b(503|429|UNAVAILABLE|overloaded|high demand)\b/i.test(msg);
      if (!overloaded) throw err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All Gemini models unavailable");
}
