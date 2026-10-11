# 🐣 Mochi Garden · Tamagotchi + Cloudflare Workers AI

**เล่นเกม:** https://freddy198750.github.io/Tamagotchi/

เกมเลี้ยงสัตว์ผ่านเว็บด้วย HTML/CSS/JavaScript มีอาหาร อาบน้ำ เล่น นอน ร้านค้า เกมเก็บดาว และเลเวล

## 🤖 คุยกับสัตว์เลี้ยงผ่าน AI

เพิ่มแท็บ **💬 คุย AI** เรียบร้อยแล้ว โดยสัตว์เลี้ยงตอบตามความหิว ความสุข ความสะอาด พลังงาน และสุขภาพ

- เมื่อยังไม่เชื่อม Cloudflare: ตอบแบบจำลอง (ไม่ใช่โมเดล AI) และเกมอื่น ๆ เล่นได้ตามปกติ
- เมื่อเชื่อม Cloudflare Worker: ใช้ Workers AI ตอบคำถามเป็นภาษาไทย
- ประวัติแชตและ URL Worker เก็บอยู่ในเบราว์เซอร์เครื่องผู้เล่น

**วิธีตั้งค่า Cloudflare แบบทีละขั้น:** [cloudflare-worker/README.md](./cloudflare-worker/README.md)

**ไฟล์ที่เพิ่ม:** [ai-chat.js](./ai-chat.js) (หน้าเว็บแชต), [cloudflare-worker/worker.js](./cloudflare-worker/worker.js) (API), [cloudflare-worker/wrangler.jsonc](./cloudflare-worker/wrangler.jsonc) (AI binding + rate limit)

## เริ่มเล่นและเผยแพร่

เปิด GitHub Pages: ไป **Settings → Pages → Build and deployment → Deploy from a branch** เลือก **main / (root)** แล้วกด Save

เกมรุ่นนี้มี `index.html` และ `ai-chat.js` อยู่ในโฟลเดอร์หลัก (ดาวน์โหลดทั้งสองไฟล์ถ้าจะเล่นแบบออฟไลน์) ส่วนโค้ดใน `cloudflare-worker/` ใช้เผยแพร่บน Cloudflare แยกกัน

## Save Game และความปลอดภัย

เกมใช้ `localStorage` บันทึกข้อมูลบนเครื่องผู้เล่นอัตโนมัติ **ยังไม่มีระบบบัญชีล็อกอินหรือ Save Game บน Database และป้องกันการแก้ข้อมูลด้วย DevTools ไม่ได้**

AI เป็น **ระบบสนทนาอย่างเดียว** ไม่มีสิทธิ์แก้เหรียญ EXP เลเวล หรือไอเทม การเปิด Worker API ให้เล่นสาธารณะควรมี rate limit และอาจต้องมี Turnstile/Authentication เพิ่มเติมเพื่อป้องกันโควต้า AI ถูกใช้งานเกิน
