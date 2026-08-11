const $ = (id) => document.getElementById(id);
const pages = [...document.querySelectorAll('.page')];

function go(id){
  pages.forEach(p => p.classList.toggle('active', p.id === id));
  window.scrollTo({top:0, behavior:'instant'});
  if(id === 'home') refreshStats();
  if(id === 'orders') renderOrders();
}
document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));

function toast(msg){
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}

async function copyText(text){
  if(!text.trim()) return toast('暂无内容可复制');
  try{ await navigator.clipboard.writeText(text); toast('已复制'); }
  catch{ const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('已复制'); }
}
document.querySelectorAll('[data-copy-target]').forEach(btn => btn.addEventListener('click', () => copyText($(btn.dataset.copyTarget).value)));

// 提示词生成器
$('generatePrompt').addEventListener('click', () => {
  const identity = $('pIdentity').checked ? '严格保持参考人物本人五官结构、脸型轮廓、眉眼、鼻子、嘴唇、发际线、肤色、年龄感和整体人物辨识度一致，不重新设计人物面部。' : '';
  const skin = $('pSkin').checked ? '保留真实皮肤纹理、毛孔、自然面部不对称、细微眼神光、真实发丝与布料纹理，不过度磨皮。' : '';
  const anti = $('pAntiAI').checked ? '减少 AI 感，不网红脸、不欧美化、不夸张瘦脸、不放大眼睛、不塑料皮肤，人体与手部解剖结构真实。' : '';
  const extra = $('pExtra').value.trim();
  const text = [
    `以参考图中的${$('pSubject').value}为唯一人物身份参考。`,
    identity,
    `生成一张${$('pRatio').value}、照片级真实的${$('pStyle').value}。场景为${$('pScene').value}。`,
    `人物发型：${$('pHair').value}；服装：${$('pOutfit').value}。`,
    `人物姿势：${$('pPose').value}。表情松弛、自然、克制，避免僵硬摆拍。`,
    `光线采用${$('pLight').value}；镜头感为${$('pLens').value}，真实光学景深，主体清晰，背景保持自然空间层次。`,
    skin,
    anti,
    '整体色彩自然、低饱和、层次细腻，captured in-camera，minimal retouching，真实摄影质感，无明显噪点、无过度锐化、无明显 AI 痕迹。',
    extra ? `额外要求：${extra}。` : ''
  ].filter(Boolean).join('\n\n');
  $('promptOutput').value = text;
  toast('提示词已生成');
});

// 证件照换算
function gcd(a,b){ while(b){ [a,b]=[b,a%b]; } return a; }
function approxRatio(w,h){
  const W=Math.round(w*100), H=Math.round(h*100), g=gcd(W,H); let a=W/g,b=H/g;
  if(a>50 || b>50){
    const ratios=[[11,16],[5,7],[7,9],[2,3],[3,4],[4,5]];
    let best=ratios[0], err=Infinity; ratios.forEach(r=>{const e=Math.abs(w/h-r[0]/r[1]);if(e<err){err=e;best=r}}); return `${best[0]} : ${best[1]}`;
  }
  return `${a} : ${b}`;
}
function calcId(){
  const w=Number($('idW').value), h=Number($('idH').value), dpi=Number($('idDpi').value);
  if(!(w>0&&h>0&&dpi>0)) return toast('请输入有效尺寸');
  const pxW=Math.round(w/25.4*dpi), pxH=Math.round(h/25.4*dpi);
  $('idPixels').textContent=`${pxW} × ${pxH} px`; $('idRatio').textContent=approxRatio(w,h); $('idMm').textContent=`${w} × ${h} mm`;
}
$('idPreset').addEventListener('change', e => {
  if(e.target.value==='custom') return;
  const [w,h,dpi]=e.target.value.split(','); $('idW').value=w;$('idH').value=h;$('idDpi').value=dpi;calcId();
});
$('calcId').addEventListener('click', calcId); calcId();

// 订单管理
const ORDER_KEY='luck_ai_orders_v1';
function getOrders(){ try{return JSON.parse(localStorage.getItem(ORDER_KEY))||[]}catch{return[]} }
function saveOrders(orders){ localStorage.setItem(ORDER_KEY, JSON.stringify(orders)); refreshStats(); }
function makeId(){ const d=new Date(); return `LK${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,5).toUpperCase()}`; }
$('oId').placeholder = `自动生成，如 ${makeId()}`;
$('addOrder').addEventListener('click',()=>{
  const name=$('oName').value.trim(); if(!name) return toast('请填写客户/备注名');
  const orders=getOrders(); orders.unshift({id:$('oId').value.trim()||makeId(),name,type:$('oType').value,status:$('oStatus').value,note:$('oNote').value.trim(),createdAt:new Date().toISOString()});
  saveOrders(orders); $('oName').value='';$('oId').value='';$('oNote').value='';renderOrders();toast('订单已添加');
});
$('orderFilter').addEventListener('change', renderOrders);
function renderOrders(){
  const all=getOrders(), filter=$('orderFilter').value; const data=filter==='全部'?all:all.filter(o=>o.status===filter); const box=$('orderList');
  if(!data.length){box.innerHTML='<div class="empty">暂无订单</div>';return;}
  box.innerHTML=data.map(o=>`<article class="order-card" data-id="${escapeHtml(o.id)}"><div class="order-top"><div><h3>${escapeHtml(o.name)}</h3><div class="order-meta">${escapeHtml(o.id)} · ${escapeHtml(o.type)} · ${new Date(o.createdAt).toLocaleDateString('zh-CN')}</div></div></div>${o.note?`<div class="order-note">${escapeHtml(o.note)}</div>`:''}<div class="order-actions"><select class="status-select"><option${o.status==='待处理'?' selected':''}>待处理</option><option${o.status==='制作中'?' selected':''}>制作中</option><option${o.status==='已完成'?' selected':''}>已完成</option><option${o.status==='已交付'?' selected':''}>已交付</option></select><button class="delete-btn">删除</button></div></article>`).join('');
  box.querySelectorAll('.status-select').forEach(sel=>sel.addEventListener('change',e=>{const card=e.target.closest('.order-card');const orders=getOrders();const item=orders.find(x=>x.id===card.dataset.id);if(item){item.status=e.target.value;saveOrders(orders);refreshStats();toast('状态已更新')}}));
  box.querySelectorAll('.delete-btn').forEach(btn=>btn.addEventListener('click',e=>{const id=e.target.closest('.order-card').dataset.id;saveOrders(getOrders().filter(x=>x.id!==id));renderOrders();toast('订单已删除')}));
}
function refreshStats(){ const o=getOrders(); $('statPending').textContent=o.filter(x=>x.status==='待处理').length; $('statDoing').textContent=o.filter(x=>x.status==='制作中').length; $('statDone').textContent=o.filter(x=>['已完成','已交付'].includes(x.status)).length; }
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
$('exportOrders').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(getOrders(),null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=`luck-orders-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('备份已导出');
});

// 商品文案
$('generateCopy').addEventListener('click',()=>{
  const platform=$('cPlatform').value, service=$('cService').value, price=$('cPrice').value.trim()||'价格可咨询', points=$('cPoints').value.trim()||'保持本人辨识度、自然真实、支持沟通修改', tone=$('cTone').value;
  const titleMap={淘宝:`${service}｜真人自然质感｜保持本人相貌｜手机提交即可`,小红书:`最近在做的${service}，重点是自然、不像 AI`,闲鱼:`接${service}定制｜自然写实｜可沟通修改`,抖音:`${service}定制｜真实自然｜拒绝千篇一律网红脸`};
  const toneLine={自然可信:'不是一键套模板，会根据原图和需求调整细节，尽量保留本人真实特征。',简洁专业:'按需求确认风格、比例与用途，制作后提供预览并支持合理范围内调整。',小红书种草感:'比较适合想要“还是自己，但更上镜一点”的感觉，不追求假面式精修。',高端克制:'重点放在人物辨识度、真实光影与细节质感，避免过度美化与模板感。'}[tone];
  const body=`【${titleMap[platform]}】\n\n服务：${service}\n套餐：${price}\n\n核心特点：\n${points.split(/[，,、\n]/).filter(Boolean).map(x=>'• '+x.trim()).join('\n')}\n\n${toneLine}\n\n下单流程：提交原图与需求 → 确认风格/比例 → 制作预览 → 沟通调整 → 交付高清图。\n\n#AI写真 #AI职业照 #人物精修 #照片定制 #高清修图`;
  $('copyOutput').value=body;toast('文案已生成');
});

// PWA 安装
let deferredPrompt=null; const installBtn=$('installBtn');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});
installBtn.addEventListener('click',async()=>{if(!deferredPrompt){toast('请用 Safari 的“添加到主屏幕”');return;} deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null;installBtn.hidden=true;});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}

refreshStats(); renderOrders();
