# 🐣 Cloudflare Workers AI สำหรับ Mochi Garden

เกมหน้าเว็บ: https://freddy198750.github.io/Tamagotchi/

## วิธีง่าย: ทำใน Cloudflare Dashboard

1. เข้า https://dash.cloudflare.com/ → **Workers & Pages → Create application → Create Worker** (หรือ **Start with Hello World** ตามหน้าจอ)
2. ตั้งชื่อ **mochi-garden-ai** แล้วกด **Deploy**
3. เปิด Worker → **Edit Code** นำโค้ดจากไฟล์ [worker.js](./worker.js) ทั้งหมดไปแทน และกด **Deploy**
4. เปิด **Settings → Bindings → Add binding → Workers AI** แล้วตั้งชื่อตัวแปรเป็น **AI** จากนั้น Save/Deploy ให้ binding มีผลจริง
5. คัดลอก URL ของ Worker ที่ลงท้ายด้วย **workers.dev** เช่น `https://mochi-garden-ai.SUBDOMAIN.workers.dev`
6. เปิดเกม https://freddy198750.github.io/Tamagotchi/ → กด ⚙️ **ตั้งค่า** → วาง URL ในช่อง **Cloudflare Worker (AI)** → กด **บันทึกการเชื่อมต่อ AI**
7. เปิดแท็บ **💬 คุย AI** แล้วลองพิมพ์ "หิวไหม?" / "วันนี้เป็นไงบ้าง?" จะได้คำตอบจาก Workers AI

> ต้องเปิดหน้าเกมบน **GitHub Pages** เพื่อคุยกับ Worker; เปิดไฟล์ HTML ผ่าน `file://` จะถูกบล็อกโดย CORS ที่ตั้งไว้เฉพาะ GitHub Pages

## วิธีแนะนำสำหรับเผยแพร่จริง: ใช้ Wrangler (มีการจำกัดข้อความ)

ติดตั้ง Node.js จาก https://nodejs.org และเปิด Terminal ในโฟลเดอร์ `cloudflare-worker` แล้วรัน

```bash
npx wrangler login
npx wrangler deploy
```

ไฟล์ `wrangler.jsonc` กำหนด AI binding อัตโนมัติ และเพิ่ม **AI_LIMITER จำกัด 6 ข้อความต่อนาทีต่อ IP ต่อศูนย์ข้อมูล** (อาจทำให้หลายคนที่ใช้อินเทอร์เน็ตร่วมกันติดขีดจำกัด และไม่ใช่ระบบจำกัดการใช้ทั่วโลกแบบเด็ดขาด)

ถ้าทำใน Dashboard อย่างเดียว จะ **ไม่ได้เปิด AI_LIMITER อัตโนมัติ**: เมื่อเปิดให้คนอื่นเล่น ควรเพิ่มการป้องกันการยิง API เช่น Turnstile ที่ตรวจ token ทาง Worker หรือใช้ Wrangler และเฝ้าดูการใช้งาน

## ทดสอบ

- บน GitHub Pages ให้ไปที่แท็บแชตแล้วส่งข้อความ
- ถ้าไม่ได้ใส่ Worker URL: เกมจะตอบด้วยคำจำลองออฟไลน์ และระบุโหมดทดลองชัดเจน
- ถ้าตั้งค่าแล้วแต่ใช้ไม่ได้: ตรวจสอบว่า Worker ติดตั้ง AI binding ชื่อ `AI` และ Deploy โค้ดใหม่ รวมถึง URL ไม่มี `/chat` ต่อท้าย
- บน Cloudflare ให้ดู **Workers AI Usage** ถ้าโควต้าฟรีเต็ม ระบบจะตอบข้อผิดพลาดและเกมยังเล่นได้ตามปกติ

## ความปลอดภัยและข้อจำกัด

- เกม **ไม่ใส่ API Token หรือรหัสลับไว้ใน HTML** และ Workers AI เรียกผ่าน `env.AI`
- Worker รับข้อความและสถิติสัตว์เลี้ยงไว้เพื่อสร้างคำตอบเท่านั้น ไม่มีสิทธิ์เปลี่ยนข้อมูลเงิน/เลเวลหรือฐานข้อมูล
- `Origin`/CORS ไม่ใช่ระบบ Authentication; ผู้โจมตีอาจปลอม `Origin` ในคำขอที่ไม่ใช่เบราว์เซอร์ได้ ดังนั้นเมื่อเปิดสาธารณะควรมี rate limit / Turnstile / ระบบบัญชี
- Save Game ยังเก็บใน `localStorage` **ไม่ใช่ Save Game ออนไลน์ และยังแก้ค่าได้จากเครื่องผู้เล่น**; ระบบ AI นี้ไม่ได้เปลี่ยนให้เป็นระบบกันโกง
- โควต้า Workers AI ฟรี ณ ตุลาคม 2026: 10,000 Neurons ต่อวัน ปริมาณแชตจริงแตกต่างตามโมเดลและความยาวข้อความ

เอกสาร:
- https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/
- https://developers.cloudflare.com/workers-ai/platform/pricing/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
