const $ = id => document.getElementById(id);
const [catalog, segments] = await Promise.all(['catalog.json','segments.json'].map(url => fetch(url).then(r => r.json())));
const groups = Object.keys(catalog);
const entries = Object.values(catalog).reduce((all,group)=>Object.assign(all,group),{});
const images = new Map();
const still = $('still'), video = $('road'), canvas = $('finish'), ctx = canvas.getContext('2d');
const funding = 233098, storageKey = 'euroform-thrax-build-v1';
const release = 'https://github.com/ruizgonzalo180-netizen/gamerlito-taller-de-lucia/releases/download/original-4k/';
const total = segments.at(-1).start + segments.at(-1).duration;
let group = groups[0], part = Object.keys(catalog[group])[0], index = 0, mode='lobby';
let sceneToken=0, mediaToken=0, currentSegment=0, segmentStart=0, transientEnd=null, returnMode='bench', activeQuality='', noticeTimer;
let state = {cash:funding,equipped:{},owned:{},quality:'auto'};
try {
 const saved=JSON.parse(localStorage.getItem(storageKey));
 if(saved && Number.isFinite(saved.cash) && saved.cash>=0 && saved.cash<=funding){
   state.cash=saved.cash;
   for(const [part,items] of Object.entries(entries)){
     if(items.some(option=>option.t===saved.equipped?.[part]))state.equipped[part]=saved.equipped[part];
     state.owned[part]=items.filter(opt=>saved.owned?.[part]?.includes(opt.t)).map(opt=>opt.t);
   }
   if(['auto','avc','compat'].includes(saved.quality))state.quality=saved.quality;
 }
} catch {}
function save(){
 try{localStorage.setItem(storageKey,JSON.stringify(state));return true;}
 catch{notify('Storage is unavailable. Your build will last for this session.');return false;}
}
function money(n){return '$'+n.toLocaleString('en-US');}
function notify(message){clearTimeout(noticeTimer);$('notice').textContent=message;$('notice').hidden=false;noticeTimer=setTimeout(()=>$('notice').hidden=true,2300);}
function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);return b;}
function option(){return entries[part][index];}
function equipped(which){return entries[which]?.find(x=>x.t===state.equipped[which]);}
function owned(item){return !item.price||state.owned[part]?.includes(item.t);}
function img(t){
 if(!images.has(t)){
  const picture=new Image();picture.src='looks/'+t+'.jpg';
  const pending=picture.decode().then(()=>picture).catch(err=>{images.delete(t);throw err;});
  images.set(t,pending);
  if(images.size>10)images.delete(images.keys().next().value);
 }
 return images.get(t);
}
function modeIs(value){
 if(value!=='option')clearPreview();mode=value;$('shop').dataset.mode=value;
 $('bench').hidden=value!=='bench';$('picker').hidden=value!=='option';
 $('footer').hidden=!['bench','option','inspect'].includes(value);
 $('playerBar').hidden=value!=='video';$('skip').hidden=value!=='intro';
 $('build').textContent=value==='inspect'?'Edit parts':'My build';
 $('brand').hidden=value==='video';$('funds').hidden=['intro','video'].includes(value);
 $('funds').textContent=money(state.cash);
}
function stopVideo(){
 mediaToken++;video.onloadedmetadata=video.onseeked=video.onended=video.onerror=video.ontimeupdate=null;
 video.pause();video.hidden=true;video.removeAttribute('src');video.load();transientEnd=null;
}
const bodyPaint={
 373:[23,24,24],374:[30,54,99],375:[246,199,34],771:[30,31,30],777:[155,161,161],778:[23,65,83],781:[95,102,101]
};
async function scene(t,assembled=false){
 const token=++sceneToken;
 try{
  const source=await img(t);if(token!==sceneToken)return;
  still.src=source.src;still.hidden=false;canvas.hidden=true;
  // A native photo supplies all body contours and lighting. Only blue paint pixels are tinted.
  const color=bodyPaint[state.equipped.Respray];
  if(!assembled&&(!color||part==='Respray'||group==='Interior'||part==='Full Kits'))return;
  canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;ctx.drawImage(source,0,0);
  if(color){
   const width=canvas.width,height=canvas.height;
   const top=Math.floor(height*(assembled ? .50 : .17)), bottom=Math.floor(height*(assembled ? .79 : .80));
   const x=assembled?Math.floor(width*.15):Math.floor(width*.06);
   const w=assembled?Math.floor(width*.46):Math.floor(width*.87);
   const area=ctx.getImageData(x,top,w,bottom-top),p=area.data;
   for(let i=0;i<p.length;i+=4){
    const red=p[i],green=p[i+1],blue=p[i+2],strength=Math.min(blue-red,1.8*(blue-green));
    if(strength<17||green<red*.88)continue;
    const a=Math.min(1,(strength-17)/35),light=(green*.65+blue*.35)/155;
    const shine=Math.max(0,red-65)*.75;
    for(let c=0;c<3;c++)p[i+c]=p[i+c]*(1-a)+a*Math.min(255,color[c]*light+shine);
   }
   ctx.putImageData(area,x,top);
  }
  if(assembled){await drawFittings(token);if(token!==sceneToken)return;}
  canvas.hidden=false;
 }catch{if(token===sceneToken)notify('This preview could not load. Select the part to try again.');}
}
async function drawFittings(token){
 const rim=equipped('Rim Style');
 if(rim){
  const source=await img(rim.t);if(token!==sceneToken)return;
  // The reference has three wheel-camera positions. Coordinates are normalized to the source.
  const pos=rim.t<=641?[.585,.49]:rim.t>=655&&rim.t<=663?[.549,.50]:[.596,.50];
  const radius=rim.t>=663?.171:.158;
  for(const [cx,cy,rx,ry] of [[.406,.695,.031,.060],[.173,.669,.022,.049]]){
   const x=cx*canvas.width,y=cy*canvas.height,w=rx*canvas.width,h=ry*canvas.height;
   ctx.save();ctx.beginPath();ctx.ellipse(x,y,w,h,-.10,0,Math.PI*2);ctx.clip();
   ctx.drawImage(source,source.width*(pos[0]-radius*.5625),source.height*(pos[1]-radius),source.width*radius*1.125,source.height*radius*2,x-w,y-h,w*2,h*2);ctx.restore();
  }
 }
 const tint=equipped('Windows');
 if(tint && tint.t!==519){
  ctx.save();ctx.scale(canvas.width/720,canvas.height/405);ctx.fillStyle=({522:'#0c1115a6',523:'#060910ea',524:'#e58b2580',526:'#0fcfe77f',527:'#070b12c7'})[tint.t]||'#15181c99';
  ctx.beginPath();ctx.moveTo(172,227);ctx.bezierCurveTo(188,207,220,202,244,213);ctx.lineTo(262,228);ctx.closePath();ctx.fill();ctx.restore();
 }
 const glow={400:'#53ff79',401:'#ffffff',402:'#00e6ff',405:'#2861ff',406:'#ff9024',407:'#ffffff',408:'#ffed18',410:'#2861ff',411:'#ff138c',412:'#ffed18',413:'#9736ff'};
 for(const [name,x,y,w] of [['Underglow · Front',.557,.755,.054],['Underglow · Side',.31,.731,.134],['Underglow · Back',.164,.731,.043]]){
  const color=glow[state.equipped[name]];if(!color)continue;
  ctx.save();ctx.translate(canvas.width*x,canvas.height*y);ctx.scale(canvas.width*w,canvas.height*.022);
  const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,color+'bb');g.addColorStop(1,color+'00');
  ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
 }
}
function showBench(focusPart=false){
 stopVideo();modeIs('bench');$('groups').replaceChildren();$('parts').replaceChildren();
 for(const g of groups){
  const b=button(g,()=>{group=g;part=Object.keys(catalog[g])[0];showBench();});
  b.setAttribute('aria-pressed',String(group===g));$('groups').append(b);
 }
 for(const p of Object.keys(catalog[group])){
  const b=button(p,()=>choosePart(p));const chevron=document.createElement('b');chevron.textContent='›';b.append(chevron);$('parts').append(b);
  if(focusPart&&p===part)b.focus();
 }
 scene(294,true);
}
function choosePart(p){
 stopVideo();group=groups.find(g=>catalog[g][p]);part=p;
 index=Math.max(0,entries[p].findIndex(x=>x.t===state.equipped[p]));modeIs('option');renderOption();
}
function renderOption(){
 const items=entries[part],it=option(),installed=state.equipped[part]===it.t;
 $('partName').textContent=part;$('name').textContent=it.name;$('count').textContent=group.toUpperCase()+'  /  '+(index+1)+' OF '+items.length;
 $('prev').disabled=$('next').disabled=items.length<2;
 $('apply').textContent=installed?'Equipped':owned(it)?'Equip':'Buy · '+money(it.price);
 $('apply').disabled=installed;$('funds').textContent=money(state.cash);
 $('rail').replaceChildren(...items.map((x,i)=>{
  const b=button('',()=>{index=i;renderOption();});
  const thumb=document.createElement('img');thumb.src='swatches/'+x.t+'.jpg';thumb.alt='';thumb.loading='lazy';
  const number=document.createElement('span');number.textContent=String(i+1);b.append(thumb,number);b.title=x.name;b.setAttribute('aria-label',x.name);b.setAttribute('aria-pressed',String(i===index));return b;
 }));
 const active=$('rail').children[index];$('rail').scrollLeft=Math.max(0,active.offsetLeft-$('rail').clientWidth/2);
 scene(it.t);schedulePreview(it.t);img(items[(index+1)%items.length].t).catch(()=>{});
}
function move(n){const items=entries[part];index=(index+n+items.length)%items.length;renderOption();}
function install(){
 const it=option();if(state.equipped[part]===it.t)return;
 if(!owned(it)){if(it.price>state.cash){notify('Insufficient garage funds');return;}state.cash-=it.price;(state.owned[part]??=[]).push(it.t);}
 state.equipped[part]=it.t;renderOption();if(save())notify(it.name+' equipped');
}
function modal(title,children){
 $('heading').textContent=title;$('panelbody').replaceChildren(...children);
 if(!$('panel').open)$('panel').showModal();
}
function dismiss(){if($('panel').open)$('panel').close();}
function inspect(){dismiss();stopVideo();modeIs('inspect');scene(294,true);}
function myBuild(){
 const rows=[button('Inspect exterior',inspect)];
 const parts=Object.keys(entries).filter(p=>equipped(p));
 if(!parts.length){const p=document.createElement('p');p.textContent='Equip a part to add it to your build.';rows.push(p);}
 for(const p of parts){
  const b=button('',()=>{dismiss();choosePart(p);});b.className='buildItem';
  const h=document.createElement('small');h.textContent=p.toUpperCase();const span=document.createElement('span');span.textContent=equipped(p).name;b.append(h,span);rows.push(b);
 }
 if(parts.length)rows.push(button('Reset build…',()=>modal('Reset build?',[button('Keep my build',myBuild),button('Restore factory build and funds',()=>{state.cash=funding;state.equipped={};state.owned={};save();dismiss();showBench();})])));
 modal('My build',rows);
}
function menu(){
 if(mode==='video')video.pause();
 const sel=document.createElement('select');for(const [value,label] of [['auto','Original 4K · Auto'],['avc','4K · H.264'],['compat','Compatibility · 1080p']])sel.add(new Option(label,value));sel.value=state.quality;
 sel.onchange=()=>{state.quality=sel.value;save();if(mode==='video'){const t=segmentStart+video.currentTime;playAt(t,transientEnd);}};
 const quality=document.createElement('label');quality.append('Video quality',sel);
 const link=button('Play Lucia & Jason',()=>{dismiss();stopVideo();modeIs('mission');$('mission').hidden=false;const frame=$('mission').querySelector('iframe');frame.onload=()=>{try{frame.contentWindow.startExperience?.();}catch{}};frame.src='../gamerlito-lucia-jason-manual/';});
 const rows=[button('Resume',()=>{dismiss();if(mode==='video')video.play().catch(()=>{});}),button('Workshop',()=>{dismiss();showBench();}),button('My build',myBuild),button('Play full recording',()=>{dismiss();returnMode='bench';playAt(0);}),link,quality];
 if(document.fullscreenEnabled||document.documentElement.webkitRequestFullscreen)rows.push(button('Full screen',()=>{if(document.fullscreenElement)document.exitFullscreen();else (document.documentElement.requestFullscreen?.()||document.documentElement.webkitRequestFullscreen?.())?.catch?.(()=>{});}));
 rows.push(button('Leave experience',()=>{dismiss();stopVideo();mode='lobby';$('shop').hidden=true;window.Launcher.show('details');}));
 modal('Experience menu',rows);
}
function stamp(n){n=Math.max(0,Math.floor(n));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
function returnToShop(){if(returnMode==='option'){stopVideo();modeIs('option');renderOption();}else showBench();}
$('exitMission').onclick=()=>{const frame=$('mission').querySelector('iframe');frame.onload=null;frame.src='about:blank';$('mission').hidden=true;showBench();};
const supportsVP9=!!video.canPlayType('video/mp4; codecs="vp09.00.51.08"');
const preview=$('live');let previewTimer=0,previewToken=0,previewURL='';
function clearPreview(){
 clearTimeout(previewTimer);previewToken++;
 preview.pause();preview.hidden=true;preview.onloadedmetadata=preview.onseeked=preview.onerror=preview.ontimeupdate=null;
}
function sourceURL(kind,name){
 return kind==='compat'?'compat/'+name:release+(kind==='avc'?name.replace('drive-','avc-'):name);
}
function preferredSource(){return state.quality==='compat'?'compat':state.quality==='avc'||!supportsVP9?'avc':'original';}
function nextSource(kind){return kind==='original'?'avc':kind==='avc'?'compat':null;}
function schedulePreview(t){
 clearPreview();if(state.equipped.Respray&&part!=='Respray'&&group!=='Interior'&&part!=='Full Kits')return;
 const token=previewToken;
 const n=segments.findIndex(seg=>t>=seg.start&&t<seg.start+seg.duration);
 if(n<0)return;
 const seg=segments[n];const target=t+.22-seg.start,end=t+.82-seg.start;
 function valid(){return token===previewToken&&mode==='option';}
 function load(kind){
  if(!valid())return;
  const url=sourceURL(kind,seg.name);
  preview.onerror=()=>{const next=nextSource(kind);if(valid()&&next)load(next);};
  const seek=()=>{
   if(!valid())return;
   preview.onseeked=()=>{
    if(!valid())return;
    preview.hidden=false;preview.play().catch(()=>{preview.hidden=true;});
   };
   preview.ontimeupdate=()=>{if(valid()&&preview.currentTime>=end){preview.pause();preview.hidden=true;}};
   preview.currentTime=Math.min(target,preview.duration-.05);
  };
  if(previewURL===url&&preview.readyState>=1){seek();return;}
  previewURL=url;preview.onloadedmetadata=seek;preview.src=url;preview.load();
 }
 previewTimer=setTimeout(()=>load(preferredSource()),280);
}
function playAt(time,end=null){
 time=Math.max(0,Math.min(total-.15,time));
 let i=segments.length-1;while(i>0&&segments[i].start>time)i--;currentSegment=i;segmentStart=segments[i].start;
 transientEnd=end;const token=++mediaToken;
 modeIs('video');$('seek').max=String(total);$('pause').textContent='Play';$('clock').value=stamp(time)+' / '+stamp(total);
 sceneToken++;canvas.hidden=true;
 const item=segments[i];let ready=false,timer;
 function load(kind){
  if(token!==mediaToken)return;
  clearTimeout(timer);ready=false;activeQuality=kind==='original'?'Original 4K':kind==='avc'?'4K H.264':'1080p';
  video.hidden=true;video.pause();video.onseeked=null;
  video.onerror=()=>{
   if(token!==mediaToken)return;
   const next=nextSource(kind);if(next){load(next);return;}
   clearTimeout(timer);notify('Video unavailable. Press Play to retry.');$('pause').textContent='Retry';
  };
  video.onloadedmetadata=()=>{
   if(token!==mediaToken)return;
   const pos=Math.max(0,Math.min(time-item.start,video.duration-.05));
   const start=()=>{if(token!==mediaToken||ready)return;ready=true;clearTimeout(timer);video.hidden=false;video.play().catch(()=>{$('pause').textContent='Play';});};
   if(Math.abs(video.currentTime-pos)>.035){video.onseeked=start;video.currentTime=pos;}else start();
  };
  video.src=sourceURL(kind,item.name);video.load();
  const next=nextSource(kind);if(next)timer=setTimeout(()=>{if(token===mediaToken&&!ready)load(next);},9000);
 }
 video.onended=()=>{if(token!==mediaToken)return;if(i+1>=segments.length){returnToShop();return;}playAt(segments[i+1].start,transientEnd);};
 video.ontimeupdate=()=>{
  if(token!==mediaToken||!ready)return;
  const at=segmentStart+video.currentTime;
  $('seek').value=String(at);$('clock').value=stamp(at)+' / '+stamp(total)+' · '+activeQuality;
  if(transientEnd!==null&&at>=transientEnd){returnToShop();return;}
  
 };
 load(preferredSource());
}
let introTimer;
function enter(){
 window.Launcher.hide();$('shop').hidden=false;stopVideo();sceneToken++;canvas.hidden=true;still.src='launcher/shop-hero.jpg';modeIs('intro');
 const token=mediaToken;let switched=false;
 const end=()=>{if(mode==='intro'&&token===mediaToken){clearTimeout(introTimer);showBench();}};
 function introSource(native){
  video.onended=end;video.onerror=()=>{if(native&&!switched){switched=true;introSource(false);}else end();};
  video.onloadeddata=()=>{if(mode!=='intro'||token!==mediaToken)return;video.hidden=false;video.play().catch(end);};
  video.src=native?'arrival-vp9.mp4':'arrival-avc.mp4';video.load();
 }
 introSource(supportsVP9);introTimer=setTimeout(end,10500);
}
window.startExperience=enter;
$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);$('apply').onclick=install;$('up').onclick=()=>showBench(true);
$('menu').onclick=menu;$('build').onclick=()=>mode==='inspect'?showBench():myBuild();$('close').onclick=dismiss;
$('drive').onclick=()=>{returnMode='bench';playAt(798);};
$('motion').onclick=()=>{returnMode='option';const last=Math.max(...entries[part].map(x=>x.t));playAt(option().t+.20,Math.max(option().t+1.6,last+1.2));};
$('returnShop').onclick=returnToShop;$('skip').onclick=()=>{clearTimeout(introTimer);showBench();};
$('pause').onclick=()=>{if(video.error){playAt(segmentStart+Number(video.currentTime||0),transientEnd);return;}if(video.paused)video.play().catch(()=>notify('Press Play to resume'));else video.pause();};
video.onplay=()=>{$('pause').textContent='Pause';};video.onpause=()=>{$('pause').textContent='Play';};
$('seek').onchange=e=>{returnMode='bench';playAt(Number(e.target.value));};
document.addEventListener('keydown',e=>{
 if($('shop').hidden||$('panel').open||e.altKey||e.ctrlKey||e.metaKey||e.target.tagName==='INPUT')return;
 if(e.key==='Escape'){e.preventDefault();if(mode==='option')showBench(true);else if(mode==='video')returnToShop();else menu();return;}
 if(mode==='option'){
  if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}
  if(e.key==='Enter'&&(!e.target.closest('button')||e.target.closest('#rail'))){e.preventDefault();install();}
 }else if(mode==='bench'){
  if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const buttons=[...$('parts').children];const i=buttons.indexOf(document.activeElement);buttons[(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();}
  if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();group=groups[(groups.indexOf(group)+(e.key==='ArrowRight'?1:-1)+groups.length)%groups.length];part=Object.keys(catalog[group])[0];showBench(true);}
 }else if(mode==='video'&&e.code==='Space'&&!e.target.closest('button')){e.preventDefault();$('pause').click();}
});
$('panel').addEventListener('click',e=>{if(e.target===$('panel')){const r=$('panel').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss();}});
