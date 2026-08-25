const $ = (id) => document.getElementById(id);
const pages = [...document.querySelectorAll('.page')];

function go(id){
  pages.forEach(p => p.classList.toggle('active', p.id === id));
  window.scrollTo({top:0, behavior:'instant'});
  if(id === 'home') refreshStats();
  if(id === 'orders') renderOrders();
  if(id === 'prompt') renderFavorites();
}
document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));

function toast(msg){
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => t.classList.remove('show'), 1700);
}

async function copyText(text){
  if(!String(text||'').trim()) return toast('暂无内容可复制');
  try{ await navigator.clipboard.writeText(text); toast('已复制'); }
  catch{ const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('已复制'); }
}
document.querySelectorAll('[data-copy-target]').forEach(btn => btn.addEventListener('click', () => copyText($(btn.dataset.copyTarget).value)));

// ---------- 高级提示词 ----------
const hairOptions = {
  female:[
    '保持参考图发型不变','黑色中分长直发','自然中分锁骨发','齐肩直发','轻盈层次锁骨发','法式自然微卷长发','韩系大波浪长发','低马尾，保留自然碎发','高马尾，清爽利落','低盘发，干净知性','齐刘海波波头','空气刘海长发','八字刘海长发','耳下短发 / 日系短发','利落中短发，轻微内扣'
  ],
  male:[
    '保持参考图发型不变','韩系三七分短发','自然中分短发','清爽短碎发','低层次纹理短发','自然侧分短发','法式碎盖短发','轻微卷度中短发','利落背梳短发','商务侧分短发','日系蓬松短发','极短寸头，轮廓干净','自然微湿发感','短发保持原长度，仅整理碎发'
  ]
};

const scenes = [
  {name:'极简暖灰米棕摄影棚',color:'#C8B9A7',desc:'warm greige / oatmeal beige，低饱和、哑光、无缝，高级柔和'},
  {name:'燕麦米色纯色摄影棚',color:'#D9CBB8',desc:'oatmeal beige，温柔高级，适合白衬衫与浅色西装'},
  {name:'象牙白纯色摄影棚',color:'#F4F0E8',desc:'ivory white，比纯白更柔和，清爽轻商务'},
  {name:'纯白无缝摄影棚',color:'#FFFFFF',desc:'clean white，高调但不过曝，极简商业感'},
  {name:'高级雾灰纯色背景',color:'#C7C8C6',desc:'soft mist gray，克制、现代、适合职业肖像'},
  {name:'鸽灰纯色摄影棚',color:'#AEB2B5',desc:'dove gray，中性高级，适合科技公司 / 企业头像'},
  {name:'石墨灰纯色摄影棚',color:'#56585A',desc:'graphite gray，沉稳、有层次，适合创始人专访'},
  {name:'炭黑纯色背景',color:'#242424',desc:'charcoal black，低调电影感，适合强轮廓光'},
  {name:'低饱和鼠尾草绿背景',color:'#A7AD9D',desc:'muted sage，安静文艺，适合生活方式 Editorial'},
  {name:'低饱和雾霾蓝背景',color:'#8797A5',desc:'dusty blue，现代、清爽、不俗艳'},
  {name:'低饱和海军蓝背景',color:'#2F4052',desc:'muted navy，专业高级，适合男士 / 职业肖像'},
  {name:'深酒红纯色背景',color:'#5A3035',desc:'deep burgundy，克制复古，适合杂志感人像'},
  {name:'窗边自然光室内',color:'linear-gradient(135deg,#e8e2d9,#fbfaf6)',desc:'大面积窗光，真实居家 / 工作室空间层次'},
  {name:'极简咖啡馆靠窗位置',color:'linear-gradient(135deg,#b9a28b,#5e6f59)',desc:'木质、绿植、玻璃窗，生活方式抓拍感'},
  {name:'深色木桌创始人专访场景',color:'linear-gradient(135deg,#2a2928,#7b604d)',desc:'深色桌面与暗背景，商业杂志采访氛围'},
  {name:'现代建筑空间',color:'linear-gradient(135deg,#d8d8d5,#9da2a5)',desc:'玻璃、石材、简洁线条，环境人像更有空间感'},
  {name:'城市夜景室内',color:'linear-gradient(135deg,#20283a,#74564d)',desc:'冷暖混合灯光，现代电影感但不过度霓虹'},
  {name:'夏日户外自然光',color:'linear-gradient(135deg,#c8d6a8,#f4ddb1)',desc:'树荫、自然逆光、轻松抓拍，干净通透'}
];

const stylePresets = {
  '极简高级灰 Editorial':{scene:'高级雾灰纯色背景',pose:'身体轻微侧转约 30°，肩膀放松，下颌自然',light:'大型柔光箱从侧前方照射，柔和自然',lens:'85mm F1.4 人像视角',tone:'低饱和高级灰，干净通透',desc:'现代人物杂志 Editorial，极简、克制、清爽，有高级商业摄影质感，不过度职业化。'},
  '白棚科技公司轻商务':{scene:'象牙白纯色摄影棚',pose:'半身正面，眼神自然直视镜头，嘴角轻微放松',light:'高调柔和漫射光，画面干净但不过曝',lens:'85mm F1.8 人像视角',tone:'自然真实色彩，轻微暖调',desc:'现代科技公司、大学教师主页、研究型岗位或企业团队成员介绍页风格，专业但不严肃，年轻但不幼稚。'},
  '年轻创始人 / 高管专访':{scene:'深色木桌创始人专访场景',pose:'身体侧转约 45°，头部轻轻转回镜头方向',light:'伦勃朗光 + 轻微轮廓光',lens:'85mm F1.4 人像视角',tone:'电影感低饱和冷暖层次',desc:'高级商业杂志人物专访，沉稳、克制、自信，有创始人 / 年轻高管气质，但不要霸总感。'},
  '日系杂志安静人像':{scene:'纯白无缝摄影棚',pose:'轻轻看向镜头旁边，似笑非笑，采访感',light:'高调柔和漫射光，画面干净但不过曝',lens:'50mm F2.0 自然人像视角',tone:'低对比柔和日系色调',desc:'日系人物杂志与生活方式 Editorial，安静、自然、年轻、松弛，留白充足。'},
  '韩系轻商务职业写真':{scene:'燕麦米色纯色摄影棚',pose:'身体轻微侧转约 30°，肩膀放松，下颌自然',light:'大型柔光箱从侧前方照射，柔和自然',lens:'85mm F1.8 人像视角',tone:'自然真实色彩，轻微暖调',desc:'韩系轻商务人物形象照，干净、亲和、专业但不呆板，服装简约，不要传统黑西装证件照感。'},
  '暖灰米棕高级棚拍':{scene:'极简暖灰米棕摄影棚',pose:'坐在极简椅子上，身体微微前倾，双手自然放松',light:'大型柔光箱从侧前方照射，柔和自然',lens:'85mm F1.4 人像视角',tone:'低饱和高级灰，干净通透',desc:'warm greige 高级棚拍，画面哑光、柔和、干净，有轻奢编辑感，不像传统影楼。'},
  '窗边知识女性 / 研究员':{scene:'窗边自然光室内',pose:'一只手自然搭桌面，另一只手放松垂下',light:'大面积自然窗光，阴影柔和通透',lens:'50mm F2.0 自然人像视角',tone:'Portra 400 轻胶片质感',desc:'杂志采访里的年轻研究员、创作者或文艺知识女性，松弛、有思考感，真实生活空间。'},
  '极简咖啡馆生活方式':{scene:'极简咖啡馆靠窗位置',pose:'不看镜头，目光望向画面外，抓拍感',light:'大面积自然窗光，阴影柔和通透',lens:'50mm F2.0 自然人像视角',tone:'Portra 400 轻胶片质感',desc:'高级生活方式 Editorial，像真实咖啡馆抓拍，轻松自然，不刻意摆拍，不网红探店感。'},
  '黑色电影感人物专访':{scene:'炭黑纯色背景',pose:'身体侧转约 45°，头部轻轻转回镜头方向',light:'硬朗侧光 + 深色环境，电影感明暗层次',lens:'85mm F1.4 人像视角',tone:'电影感低饱和冷暖层次',desc:'暗调人物专访，强烈但克制的明暗关系，保留皮肤细节与眼神光，避免廉价影楼黑棚感。'},
  '黑白高反差杂志肖像':{scene:'石墨灰纯色摄影棚',pose:'半身正面，眼神自然直视镜头，嘴角轻微放松',light:'硬朗侧光 + 深色环境，电影感明暗层次',lens:'85mm F1.4 人像视角',tone:'黑白高反差，细腻灰阶',desc:'高反差黑白杂志肖像，重点表现轮廓、眼神与材质，黑位有细节，肤质真实。'},
  '现代建筑环境肖像':{scene:'现代建筑空间',pose:'自然行走或转身瞬间，保持真实动态感',light:'柔和侧逆光，形成自然发丝轮廓',lens:'35mm 环境人像视角',tone:'低饱和高级灰，干净通透',desc:'现代建筑环境人物写真，空间线条简洁，人物与环境比例自然，有建筑杂志和品牌 Campaign 感。'},
  '低饱和胶片生活方式':{scene:'夏日户外自然光',pose:'不看镜头，目光望向画面外，抓拍感',light:'柔和侧逆光，形成自然发丝轮廓',lens:'50mm F1.4 浅景深',tone:'Portra 400 轻胶片质感',desc:'真实生活方式胶片人像，轻微颗粒、柔和高光、自然肤色、轻松抓拍，不做复古滤镜堆砌。'},
  '低饱和蓝灰商业肖像':{scene:'低饱和雾霾蓝背景',pose:'双臂自然交叉，下颌微收，手指结构自然',light:'伦勃朗光 + 轻微轮廓光',lens:'85mm F1.8 人像视角',tone:'低饱和高级灰，干净通透',desc:'蓝灰色现代商业肖像，理性、专业、年轻，适合咨询、科技、研究、设计等职业形象。'},
  '深酒红复古杂志感':{scene:'深酒红纯色背景',pose:'坐在极简椅子上，身体微微前倾，双手自然放松',light:'暖色主光 + 微弱冷色环境光',lens:'85mm F1.4 人像视角',tone:'自然真实色彩，轻微暖调',desc:'深酒红背景的复古 Editorial，成熟但不老气，色彩克制、材质高级、人物是视觉中心。'}
};

function fillSelect(select, values){ select.innerHTML = values.map(v=>`<option>${v}</option>`).join(''); }
function updateHair(){
  fillSelect($('pHair'), hairOptions[$('pGender').value]);
  const isFemale=$('pGender').value==='female';
  const subject=$('pSubject');
  const options=isFemale?['年轻东亚女性','职业女性','大学生女生']:['年轻东亚男性','职业男性','大学生男生'];
  fillSelect(subject,options);
}
function initStyles(){ fillSelect($('pStyle'), Object.keys(stylePresets)); }
function initScenes(){ fillSelect($('pScene'), scenes.map(s=>s.name)); updateScenePreview(); }
function updateScenePreview(){
  const s=scenes.find(x=>x.name===$('pScene').value)||scenes[0];
  const sw=document.querySelector('#scenePreview .scene-swatch'); sw.style.background=s.color; $('sceneDesc').textContent=s.desc;
}
function applyPreset(){
  const p=stylePresets[$('pStyle').value]; if(!p) return;
  $('pScene').value=p.scene; $('pPose').value=p.pose; $('pLight').value=p.light; $('pLens').value=p.lens; $('pTone').value=p.tone; updateScenePreview(); toast('已应用推荐组合');
}

$('pGender').addEventListener('change',updateHair);
$('pScene').addEventListener('change',updateScenePreview);
$('applyPreset').addEventListener('click',applyPreset);

function generatePromptText(){
  const identity = $('pIdentity').checked ? '人物一致性为最高优先级。严格保持参考人物本人真实五官结构、脸型轮廓、眉眼关系、眼睛大小、鼻型、嘴唇、下巴轮廓、发际线、肤色、年龄感与整体人物辨识度一致；不换脸、不重新设计五官、不融合其他人物面部特征。' : '';
  const skin = $('pSkin').checked ? '保留真实皮肤纹理、毛孔、轻微自然面部不对称、细微眼神光、真实发丝飞发、真实布料纹理与褶皱；minimal retouching，不过度磨皮。' : '';
  const anti = $('pAntiAI').checked ? '减少 AI 感：不网红脸、不欧美化、不夸张瘦脸、不放大眼睛、不塑料皮肤、不假睫毛堆叠、不夸张妆容，不生成陌生人。' : '';
  const hands = $('pHands').checked ? '人体结构真实准确：头身比例协调，肩颈自然，手指数量与关节结构正确，四肢长度合理，避免畸形手、粘连手指、异常肢体与不自然姿态。' : '';
  const clean = $('pClean').checked ? '画面高清、通透、干净，无明显噪点、无脏污、无过度锐化、无过曝死白、无严重欠曝，细节丰富但不过分数码锐利。' : '';
  const preset=stylePresets[$('pStyle').value];
  const scene=scenes.find(x=>x.name===$('pScene').value);
  const extra=$('pExtra').value.trim();
  return [
    `以参考图片中的${$('pSubject').value}作为唯一人物身份参考。`,
    identity,
    `生成一张 ${$('pRatio').value}、照片级真实、商业摄影级质感的「${$('pStyle').value}」。${preset?.desc||''}`,
    `人物造型：发型为${$('pHair').value}；服装为${$('pOutfit').value}。发丝需要有真实层次，不做油亮塑料发型，服装版型、垂坠、材质与细节自然。`,
    `背景与环境：${$('pScene').value}。${scene?.desc||''} 背景保持干净、简洁、有真实空间层次，不抢人物主体。`,
    `人物姿势：${$('pPose').value}。表情松弛、自然、克制，眼神有真实交流感，避免标准影楼笑容和僵硬摆拍。`,
    `摄影光线：${$('pLight').value}。镜头感：${$('pLens').value}，真实光学景深，焦点准确落在眼睛与面部，透视自然，不使用夸张广角变形。`,
    `整体色彩与质感：${$('pTone').value}；true color science，captured in-camera，editorial photography，authentic portrait，细腻高光与阴影过渡。`,
    skin,anti,hands,clean,
    extra ? `额外要求：${extra}。` : '',
    '最终效果应像真实摄影师完成的高质量人物照片，而不是 AI 合成图；人物身份、审美、摄影逻辑和物理光线保持一致。'
  ].filter(Boolean).join('\n\n');
}
$('generatePrompt').addEventListener('click',()=>{ $('promptOutput').value=generatePromptText(); toast('高级提示词已生成'); });
$('resetPrompt').addEventListener('click',()=>{ $('pExtra').value=''; $('pGender').value='female'; updateHair(); $('pStyle').selectedIndex=0; $('pOutfit').selectedIndex=0; $('pRatio').value='3:4 竖版'; $('pIdentity').checked=$('pSkin').checked=$('pAntiAI').checked=$('pHands').checked=$('pClean').checked=true; applyPreset(); $('promptOutput').value=''; toast('已重置'); });

const FAVORITE_KEY='luck_ai_prompt_favorites_v2';
function getFavorites(){try{return JSON.parse(localStorage.getItem(FAVORITE_KEY))||[]}catch{return[]}}
function saveFavorites(v){localStorage.setItem(FAVORITE_KEY,JSON.stringify(v));renderFavorites();}
$('savePrompt').addEventListener('click',()=>{
  const text=$('promptOutput').value.trim(); if(!text) return toast('请先生成提示词');
  const data=getFavorites(); data.unshift({id:Date.now(),title:`${$('pStyle').value} · ${$('pGender').value==='female'?'女生':'男生'}`,text,createdAt:new Date().toISOString()});
  saveFavorites(data.slice(0,30));toast('已收藏');
});
function renderFavorites(){
  const box=$('promptFavorites'); if(!box) return; const data=getFavorites();
  if(!data.length){box.innerHTML='<div class="empty small-empty">还没有收藏的提示词</div>';return;}
  box.innerHTML=data.map(x=>`<article class="favorite-card" data-id="${x.id}"><div><strong>${escapeHtml(x.title)}</strong><small>${new Date(x.createdAt).toLocaleDateString('zh-CN')}</small></div><div class="favorite-actions"><button class="fav-load">载入</button><button class="fav-copy">复制</button><button class="fav-delete">删除</button></div></article>`).join('');
  box.querySelectorAll('.fav-load').forEach(b=>b.addEventListener('click',e=>{const x=data.find(i=>String(i.id)===e.target.closest('.favorite-card').dataset.id);if(x){$('promptOutput').value=x.text;toast('已载入')}}));
  box.querySelectorAll('.fav-copy').forEach(b=>b.addEventListener('click',e=>{const x=data.find(i=>String(i.id)===e.target.closest('.favorite-card').dataset.id);if(x)copyText(x.text)}));
  box.querySelectorAll('.fav-delete').forEach(b=>b.addEventListener('click',e=>{const id=e.target.closest('.favorite-card').dataset.id;saveFavorites(data.filter(i=>String(i.id)!==id));toast('已删除')}));
}

// ---------- 证件照 ----------
function gcd(a,b){ while(b){ [a,b]=[b,a%b]; } return a; }
function approxRatio(w,h){
  const W=Math.round(w*100), H=Math.round(h*100), g=gcd(W,H); let a=W/g,b=H/g;
  if(a>50 || b>50){
    const ratios=[[11,16],[5,7],[7,9],[2,3],[3,4],[4,5]]; let best=ratios[0], err=Infinity;
    ratios.forEach(r=>{const e=Math.abs(w/h-r[0]/r[1]);if(e<err){err=e;best=r}}); return `${best[0]} : ${best[1]}`;
  }
  return `${a} : ${b}`;
}
let selectedIdBg={name:'蓝色',color:'#438EDB'};
document.querySelectorAll('.id-bg').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.id-bg').forEach(x=>x.classList.remove('active'));btn.classList.add('active'); selectedIdBg={name:btn.querySelector('strong').textContent,color:btn.dataset.color}; calcId();
}));
function calcId(){
  const w=Number($('idW').value), h=Number($('idH').value), dpi=Number($('idDpi').value);
  if(!(w>0&&h>0&&dpi>0)) return toast('请输入有效尺寸');
  const pxW=Math.round(w/25.4*dpi), pxH=Math.round(h/25.4*dpi);
  $('idPixels').textContent=`${pxW} × ${pxH} px`; $('idRatio').textContent=approxRatio(w,h); $('idMm').textContent=`${w} × ${h} mm`;
  $('idPromptOutput').value=`生成一张高清、照片级真实的标准证件照。\n\n人物要求：保持本人真实五官、脸型、肤色、发际线、年龄感和整体辨识度不变；头部摆正，肩线端正，双眼自然直视镜头，表情自然克制，嘴巴自然闭合；发型整洁，露出清晰面部轮廓。\n\n背景：${selectedIdBg.name}纯色背景（当前视觉参考色 ${selectedIdBg.color}），背景均匀、无渐变、无纹理、无阴影、无杂物。\n\n尺寸参考：${w} × ${h} mm，${dpi} DPI，换算约 ${pxW} × ${pxH} px。\n\n光线：从略高于视线的正前方或侧前方提供柔和均匀的人像光，面部曝光自然，避免逆光、重阴影与局部过曝。\n\n画质：真实皮肤纹理，高清、干净、无噪点、无过度磨皮、无明显 AI 感；不改变人物身份，不夸张瘦脸，不放大眼睛。\n\n正式提交前请以目标机构对尺寸、像素、背景色、服装与头部占比的最新要求为准。`;
}
$('idPreset').addEventListener('change', e => { if(e.target.value==='custom') return; const [w,h,dpi]=e.target.value.split(','); $('idW').value=w;$('idH').value=h;$('idDpi').value=dpi;calcId(); });
$('calcId').addEventListener('click',()=>{calcId();toast('已更新证件照要求')});
['idW','idH','idDpi'].forEach(id=>$(id).addEventListener('input',calcId));

// ---------- 订单管理（沿用 V1 key，保留旧数据） ----------
const ORDER_KEY='luck_ai_orders_v1';
function getOrders(){ try{return JSON.parse(localStorage.getItem(ORDER_KEY))||[]}catch{return[]} }
function saveOrders(orders){ localStorage.setItem(ORDER_KEY, JSON.stringify(orders)); refreshStats(); }
function makeId(){ const d=new Date(); return `LK${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,5).toUpperCase()}`; }
$('oId').placeholder = `自动生成，如 ${makeId()}`;
$('addOrder').addEventListener('click',()=>{
  const name=$('oName').value.trim(); if(!name) return toast('请填写客户/备注名');
  const orders=getOrders(); orders.unshift({id:$('oId').value.trim()||makeId(),name,platform:$('oPlatform').value,type:$('oType').value,status:$('oStatus').value,deadline:$('oDeadline').value,note:$('oNote').value.trim(),createdAt:new Date().toISOString()});
  saveOrders(orders); $('oName').value='';$('oId').value='';$('oNote').value='';$('oDeadline').value='';renderOrders();toast('订单已添加');
});
$('orderFilter').addEventListener('change', renderOrders);
function renderOrders(){
  const all=getOrders(), filter=$('orderFilter').value; const data=filter==='全部'?all:all.filter(o=>o.status===filter); const box=$('orderList');
  if(!data.length){box.innerHTML='<div class="empty">暂无订单</div>';return;}
  box.innerHTML=data.map(o=>`<article class="order-card" data-id="${escapeHtml(o.id)}"><div class="order-top"><div><h3>${escapeHtml(o.name)}</h3><div class="order-meta">${escapeHtml(o.id)} · ${escapeHtml(o.platform||'未记录平台')} · ${escapeHtml(o.type)} · ${new Date(o.createdAt).toLocaleDateString('zh-CN')}</div></div></div>${o.deadline?`<div class="deadline">交付：${escapeHtml(o.deadline)}</div>`:''}${o.note?`<div class="order-note">${escapeHtml(o.note)}</div>`:''}<div class="order-actions"><select class="status-select"><option${o.status==='待处理'?' selected':''}>待处理</option><option${o.status==='制作中'?' selected':''}>制作中</option><option${o.status==='已完成'?' selected':''}>已完成</option><option${o.status==='已交付'?' selected':''}>已交付</option></select><button class="delete-btn">删除</button></div></article>`).join('');
  box.querySelectorAll('.status-select').forEach(sel=>sel.addEventListener('change',e=>{const card=e.target.closest('.order-card');const orders=getOrders();const item=orders.find(x=>x.id===card.dataset.id);if(item){item.status=e.target.value;saveOrders(orders);refreshStats();toast('状态已更新')}}));
  box.querySelectorAll('.delete-btn').forEach(btn=>btn.addEventListener('click',e=>{const id=e.target.closest('.order-card').dataset.id;saveOrders(getOrders().filter(x=>x.id!==id));renderOrders();toast('订单已删除')}));
}
function refreshStats(){ const o=getOrders(); $('statPending').textContent=o.filter(x=>x.status==='待处理').length; $('statDoing').textContent=o.filter(x=>x.status==='制作中').length; $('statDone').textContent=o.filter(x=>['已完成','已交付'].includes(x.status)).length; }
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
$('exportOrders').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(getOrders(),null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=`luck-orders-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('备份已导出');
});

// ---------- 商品文案 ----------
$('generateCopy').addEventListener('click',()=>{
  const platform=$('cPlatform').value, service=$('cService').value, price=$('cPrice').value.trim()||'价格可咨询', points=$('cPoints').value.trim()||'保持本人辨识度、自然真实、细节干净、支持沟通修改', tone=$('cTone').value;
  const titleMap={淘宝:`${service}｜真人自然质感｜保持本人相貌｜高清定制`,小红书:`最近在做的${service}：重点是自然、耐看、别一眼 AI`,闲鱼:`接${service}定制｜自然写实｜保持本人｜可沟通修改`,抖音:`${service}定制｜真实自然｜拒绝千篇一律网红脸`};
  const toneLine={自然可信:'不是简单套模板，会根据原图、用途和人物特征调整细节，尽量保留本人真实辨识度。',简洁专业:'确认用途、风格、比例与细节后制作，提供预览，并在合理范围内沟通调整。',小红书种草感:'比较适合想要“还是自己，但更上镜、更有氛围一点”的感觉，不追求假面式精修。',高端克制:'重点放在人物辨识度、真实光影、服装材质与摄影质感，避免过度美化、模板感和廉价影楼感。',成交导向:'手机提交原图即可，需求沟通清楚后开始制作；适合职业主页、社交头像、简历、纪念写真等多种用途。'}[tone];
  const tags=service.includes('证件')?'#证件照 #证件照精修 #形象照 #高清修图':service.includes('职业')?'#AI职业照 #职业形象照 #简历头像 #职场写真':service.includes('写真')?'#AI写真 #高级写真 #人物摄影 #Editorial':'#AI图片定制 #人物精修 #高清修图 #照片定制';
  const body=`【${titleMap[platform]}】\n\n服务：${service}\n套餐：${price}\n\n核心特点：\n${points.split(/[，,、\n]/).filter(Boolean).map(x=>'• '+x.trim()).join('\n')}\n\n${toneLine}\n\n下单流程：提交原图与需求 → 确认风格/比例 → 制作预览 → 沟通调整 → 交付高清图。\n\n${tags}`;
  $('copyOutput').value=body;toast('文案已生成');
});

// ---------- PWA ----------
let deferredPrompt=null; const installBtn=$('installBtn');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});
installBtn.addEventListener('click',async()=>{if(!deferredPrompt){toast('请用 Safari 的“添加到主屏幕”');return;} deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null;installBtn.hidden=true;});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}

// init
initStyles(); initScenes(); updateHair(); applyPreset(); calcId(); refreshStats(); renderOrders(); renderFavorites();
