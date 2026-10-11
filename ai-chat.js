/* Mochi Garden chat · only sends conversational data to Cloudflare AI.
   Chat and Worker URL are local browser settings, not cloud game saves. */
(() => {
  'use strict';
  const GAME_KEY = 'mochi_garden_save_v1';
  const CHAT_KEY = 'mochi_garden_ai_chat_v1';
  const URL_KEY = 'mochi_garden_ai_worker_url_v1';
  const $ = id => document.getElementById(id);
  let endpoint='', messages=[], busy=false, lastSent=0;
  function getPet() {
    try { return JSON.parse(localStorage.getItem(GAME_KEY)||'null') } catch (_) {return null}
  }
  function loadChat() {
    try {
      const v=JSON.parse(localStorage.getItem(CHAT_KEY)||'[]');
      return Array.isArray(v)?v.filter(x=>x&&['user','pet','system'].includes(x.role)&&typeof x.text==='string').slice(-12).map(x=>({role:x.role,text:x.text.slice(0,400)})):[];
    } catch (_) {return []}
  }
  function mood(p) {
    if(p.sleeping)return 'sleepy';
    if(p.health<30)return 'sick';
    if(p.food<25)return 'hungry';
    if(p.clean<25)return 'dirty';
    if(p.energy<22)return 'tired';
    if(p.fun<25)return 'lonely';
    return 'happy';
  }
  function endpointFrom(raw) {
    try {
      const url=new URL(String(raw).trim());
      return url.protocol==='https:' && url.pathname==='/' &&
        !url.username && !url.password && !url.search && !url.hash ? url.origin : '';
    } catch (_) {return ''}
  }
  function setStatus(txt) {
    $('aiChatStatus').textContent=txt||(endpoint?'🟢 Cloudflare Workers AI พร้อมใช้งาน':'🟡 โหมดแชตจำลอง · เชื่อม AI ได้ที่ ⚙️');
    $('aiWorkerHint').textContent=endpoint?'✅ บันทึก URL แล้ว: '+endpoint:'ยังไม่ได้ตั้งค่า Worker · คุยแบบจำลองได้ก่อน';
  }
  function renderChat() {
    const feed=$('aiChatFeed');feed.replaceChildren();
    const data=messages.length?messages:[{role:'pet',text:'สวัสดี! เรามาคุยกันนะ 💚'}];
    for(const item of data){
      const row=document.createElement('div');row.className='ai-msg'+(item.role==='user'?' user':'');
      const avatar=document.createElement('span');avatar.className='ai-avatar';
      avatar.textContent=item.role==='user'?'👤':item.role==='system'?'⚠️':'🐣';
      const bubble=document.createElement('div');bubble.className='ai-bubble';bubble.textContent=item.text;
      row.append(avatar,bubble);feed.appendChild(row);
    }
    feed.scrollTop=feed.scrollHeight;
  }
  function append(role,text) {
    messages.push({role,text:String(text).slice(0,400)});
    messages=messages.slice(-12);
    try{localStorage.setItem(CHAT_KEY,JSON.stringify(messages))}catch(_){}
    renderChat();
  }
  function showSpeech(text) {
    const bubble=$('speech');
    if(bubble)bubble.textContent=String(text).slice(0,55);
  }
  function localReply(text,p) {
    switch(mood(p)) {
      case 'sleepy':return 'ง่วงจัง... ขอหลับก่อนนะ Zzz 💤';
      case 'sick':return 'เราไม่ค่อยสบาย ❤️‍🩹 ดูแลหน่อยได้ไหม';
      case 'hungry':return 'ท้องร้องจ๊อก ๆ 🍙 ให้อาหารหน่อยได้ไหม';
      case 'dirty':return 'ตัวเลอะหมดแล้ว 🫧 อยากอาบน้ำจัง';
      case 'tired':return 'ขอพักหน่อยนะ 🥱 วันนี้เล่นเยอะเลย';
      case 'lonely':return 'เหงาจัง 🥺 อยากเล่นกับเธอ';
    }
    if(/หิว|อาหาร|กิน/.test(text))return 'อิ่มกำลังดีเลย ชอบสตรอว์เบอร์รีจัง 🍓';
    if(/เล่น|เกม/.test(text))return 'มาเล่นเกมจับดาวกัน ⭐';
    return ['ดีใจจังที่ได้คุยกัน 💚','วันนี้ดอกไม้สวยมากเลย 🌼','ขอลูบหัวหน่อยได้ไหม 🥰'][Math.floor(Math.random()*3)];
  }
  async function send(event) {
    event?.preventDefault();
    if(busy)return;
    const input=$('aiChatInput'),message=input.value.trim().slice(0,180),pet=getPet();
    if(!message||!pet)return;
    if(endpoint&&Date.now()-lastSent<3500){setStatus('⏳ ลองส่งใหม่อีกสักครู่');return}
    const history=messages.filter(m=>m.role==='user'||m.role==='pet').slice(-4).map(m=>({role:m.role,text:m.text.slice(0,160)}));
    input.value='';append('user',message);
    if(!endpoint){
      const answer=localReply(message,pet);append('pet',answer);showSpeech(answer);
      setStatus('🟡 ข้อความจำลอง · เชื่อม Worker เพื่อใช้ AI จริง');return;
    }
    busy=true;lastSent=Date.now();input.disabled=true;$('aiSendBtn').disabled=true;$('aiSendBtn').textContent='คิดอยู่...';
    setStatus('☁️ Cloudflare AI กำลังตอบ...');
    const aborter=new AbortController(),timer=setTimeout(()=>aborter.abort(),25000);
    try{
      const response=await fetch(endpoint+'/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message,history,pet:{
          name:pet.name,level:pet.level,
          day:Math.max(1,Math.floor((Date.now()-pet.created)/(5*60*1000))+1),
          food:pet.food,fun:pet.fun,clean:pet.clean,energy:pet.energy,
          health:pet.health,sleeping:pet.sleeping
        }}),
        signal:aborter.signal
      });
      let data={};try{data=await response.json()}catch(_){}
      if(!response.ok)throw new Error(data.error||'Worker ตอบ HTTP '+response.status);
      if(typeof data.reply!=='string'||!data.reply.trim())throw new Error('AI ไม่ตอบกลับ');
      const answer=data.reply.trim().slice(0,400);
      append('pet',answer);showSpeech(answer);
      setStatus('🟢 ตอบโดย Cloudflare Workers AI · อารมณ์: '+(data.mood||mood(pet)));
    }catch(error){
      const reason=error.name==='AbortError'?'รอ AI นานเกินไป ลองใหม่':String(error.message||'ไม่สามารถติดต่อ Worker');
      append('system','⚠️ '+reason.slice(0,160));
      setStatus('🔴 ติดต่อ Cloudflare AI ไม่สำเร็จ · ตรวจ URL และ AI binding');
    }finally{
      clearTimeout(timer);busy=false;input.disabled=false;$('aiSendBtn').disabled=false;$('aiSendBtn').textContent='ส่ง 💌';
    }
  }
  function setup() {
    messages=loadChat();
    try{endpoint=endpointFrom(localStorage.getItem(URL_KEY)||'')}catch(_){endpoint=''}
    $('aiWorkerUrl').value=endpoint;setStatus();renderChat();
    $('aiChatForm').addEventListener('submit',send);
    document.querySelectorAll('[data-chat-quick]').forEach(button=>button.addEventListener('click',()=>{
      $('aiChatInput').value=button.dataset.chatQuick;send();
    }));
    $('aiWorkerSave').addEventListener('click',()=>{
      const raw=$('aiWorkerUrl').value.trim(),valid=raw?endpointFrom(raw):'';
      if(raw&&!valid){setStatus('⚠️ ใส่ URL แบบ https://...workers.dev ไม่ต้องมี /chat');return}
      endpoint=valid;
      try{if(endpoint)localStorage.setItem(URL_KEY,endpoint);else localStorage.removeItem(URL_KEY)}catch(_){}
      setStatus(endpoint?'✅ ตั้งค่า Worker แล้ว · ลองคุยได้เลย':'🟡 โหมดจำลอง');
    });
    document.addEventListener('mochi-reset',()=>{messages=[];renderChat();setStatus()});
  }
  setup();
})();