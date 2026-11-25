(() => {
  'use strict';
  const root = document.getElementById('launcher');
  const shell = root.querySelector('.lx-shell');
  const content = root.querySelector('#lx-content');
  const query = root.querySelector('#lx-query');
  const dialog = root.querySelector('#lx-dialog');
  const dialogBody = root.querySelector('#lx-dialog-body');
  const toast = root.querySelector('#lx-toast');
  const paths = {
    menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
    home:'<path d="m3 10 9-7 9 7v10h-6v-6H9v6H3z"/>',
    moments:'<path d="m5 2 16 4-4 16-16-4z"/><path d="m9 8 6 4-7 2z"/>',
    chat:'<path d="M3 4h18v13h-6l-4 4v-4H3z"/><path d="M7 9h10m-10 4h6"/>',
    more:'<circle cx="12" cy="12" r="9"/><path d="M7.9 12h.2m3.8 0h.2m3.8 0h.2"/>',
    search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
    star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2l-5-4.9 6.9-1z"/>',
    bell:'<path d="M4 17c2.1-3.3 2-5 2.5-7a5.6 5.6 0 0 1 11 0c.5 2 .4 3.7 2.5 7z"/><path d="M9.6 20a3 3 0 0 0 4.8 0"/>',
    plus:'<path d="M15 21v-7m-3.5 3.5h7"/><path d="M14 4H6l-1 7h8zm-4 10H6c-2 0-3 3-3 6h7"/>',
    next:'<path d="m9 4 8 8-8 8"/>',
    back:'<path d="m15 4-8 8 8 8"/>',
    like:'<path d="M3 10h3v11H3zM9 10l5-7c1-1 3 0 2.5 2l-1 4H20a1.5 1.5 0 0 1 1.4 2l-2.1 8a2 2 0 0 1-2 1.5H9z"/>',
    people:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3zm12-15a3 3 0 0 1 0 6m2 2c3 0 4 3 4 6"/>',
    close:'<path d="m6 6 12 12m0-12L6 18"/>',
    play:'<path fill="currentColor" stroke="none" d="M5 2.5c0-.8.8-1 1.5-.6l15.1 9.2a1 1 0 0 1 0 1.8L6.5 22.1C5.8 22.5 5 22.3 5 21.5Z"/>',
    share:'<path d="m14 3 7 6-7 6v-4c-5.5 0-8.4 2-11 7 .6-8 4-11.5 11-12z"/>',
    expand:'<path d="M15 4h5v5m0-5-7 7M9 20H4v-5m0 5 7-7"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 18 6-6 3 3 4-5 5 6"/>',
    edit:'<path d="m4 16 12-12 4 4L8 20l-5 1z"/>',
    check:'<path d="m3 12 6 6L21 5"/>',
    settings:'<path d="M3 7h18M3 17h18"/><circle cx="8" cy="7" r="2.6" fill="white"/><circle cx="16" cy="17" r="2.6" fill="white"/>'
  };
  const icons = node => node.querySelectorAll('i[data-ico]').forEach(i => {
    if (i.childElementCount) return;
    const p=paths[i.dataset.ico];
    if (p) i.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
  });
  const ico = n => '<i data-ico="'+n+'"></i>';
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const namePattern=()=>/\b(?:grand[\s-]+theft[\s-]+auto(?:[\s-]*(?:vi|6))?|gta(?:[\s-]*(?:vi|6))?)\b/gi;
  function visibleText(text){
    const s=String(text);
    let html='',start=0;
    for(const match of s.matchAll(namePattern())){
      html+=esc(s.slice(start,match.index))+'<span class="lx-hidden-name">'+esc(match[0])+'</span>';
      start=match.index+match[0].length;
    }
    return html+esc(s.slice(start));
  }
  const maskInput=input=>input.classList.toggle('lx-hidden-input',namePattern().test(input.value));
  const hiddenCreator='<span class="lx-hidden-name" aria-hidden="true">Game creator</span>';
  const games = [
    {id:'gta',name:'Euroform Automotive',aliases:['gta','gta6','gta 6','gta vi','gtavi','grand theft auto 6'],img:'launcher/shop-tile.jpg',hero:'launcher/shop-hero.jpg',rating:100},
    {id:'egg',name:'Steal An Egg',img:'launcher/c0b1b2b1c83dbb5e.webp',rating:91},
    {id:'mm2',name:'Murder Mystery 2',img:'launcher/12b244e5d98bbd3f.webp',rating:90},
    {id:'hospital',name:'Animal Hospital (Anomaly)',img:'launcher/58b29309838ee324.webp',hero:'launcher/42a7400b6c02f3dc.webp',rating:92},
    {id:'hunt',name:'The Hunt: Roblox 20',img:'launcher/2c4f5dfdacc8a817.webp',rating:83},
    {id:'creepy',name:'Climb the Creepypasta Tower',img:'launcher/aa13bfe819765b18.webp',rating:63},
    {id:'corner',name:'The Corner [18+]',img:'launcher/76ac454293fee6f5.webp',rating:85},
    {id:'tsunami',name:'Survive Your Ideas',img:'launcher/69c12b798f6edac8.webp',rating:89},
    {id:'roworld',name:'RoWorld [World PvP]',img:'launcher/fc05b3f1c2dd65cb.webp',rating:83},
    {id:'pool',name:'[ABILITIES] CRAZY 8 Ball',img:'launcher/d721fdedb3d2dd64.webp',rating:98}
  ];
  const getGame = id => games.find(g=>g.id===id) || games[0];
  const people = [
    {name:'rafa2026rblox',img:'launcher/930d1dc3d96dd3b2.webp'},{name:'MoxZ',img:'launcher/9b65cde048bbad91.webp'},
    {name:'Rzrobiz',img:'launcher/e7dbdb877544afa0.webp'},{name:'rip_mercury',img:'launcher/dae645cff8bc2859.webp'},
    {name:'luiza_star96',img:'launcher/32eb9bc847452929.webp'},{name:'Albacona',img:'launcher/4c05f79037cd64b4.webp'},
    {name:'Marii',img:'launcher/095a57cf70c1cc27.webp'}
  ];
  const defaults = {favorites:[],likes:[],alerts:[],friends:[],messages:[],name:'Rzrobiz',compact:false};
  let saved;
  try { saved=JSON.parse(localStorage.getItem(`gamerlito-${document.body.dataset.duoMode}-lucia-jason-launcher-v1`)||'{}')||{}; }
  catch { saved={}; }
  const data={...defaults,...saved};
  for (const key of ['favorites','likes','alerts','friends','messages']) if (!Array.isArray(data[key])) data[key]=[];
  const persist=()=>{try{localStorage.setItem(`gamerlito-${document.body.dataset.duoMode}-lucia-jason-launcher-v1`,JSON.stringify(data));}catch{}};
  let page='details', selection='gta', detailOrigin='home', modal='', selectedPerson=0, homeScroll=0, timer;
  const localGame = () => getGame(selection);
  function notify(message) {
    clearTimeout(timer);toast.textContent=message;toast.classList.add('lx-visible');
    timer=setTimeout(()=>toast.classList.remove('lx-visible'),1800);
  }
  function toggle(key,id) {
    const list=data[key],index=list.indexOf(id);
    if(index<0) list.push(id); else list.splice(index,1);
    persist();return index<0;
  }
  const button=(id,label,icon,css='lx-secondary',extra='')=>'<button type="button" class="'+css+'" data-lx="'+id+'" '+extra+'>'+(icon?ico(icon):'')+label+'</button>';
  function card(g, wide=false){
    const src=(wide?g.hero:null)||g.img;
    return '<button type="button" class="lx-card" data-lx="details" data-id="'+g.id+'" aria-label="'+esc(g.name)+'"><img alt="" decoding="async" data-lx-src="'+src+'"><span class="lx-card-title">'+visibleText(g.name)+'</span><span class="lx-meta">'+ico('like')+g.rating+'%</span></button>';
  }
  function grid(list,square=true){
    return '<div class="lx-cards'+(square?' lx-squares':'')+'">'+list.map(g=>card(g,!square)).join('')+'</div>';
  }
  function section(label,list,square,target){
    const title=target?'<button type="button" data-lx="'+target+'">'+label+ico('next')+'</button>':label;
    return '<section class="lx-section"><h2>'+title+'</h2>'+grid(list,square)+'</section>';
  }
  function tabs() {
    return '<nav class="lx-tabs" aria-label="Discovery" role="tablist">'+
      button('home','For you',null,'','role="tab" aria-selected="'+(page==='home')+'"')+
      button('charts','Charts',null,'','role="tab" aria-selected="'+(page==='charts')+'"')+'</nav>';
  }
  function portraits(){
    return '<div class="lx-friends">'+button('connections','<span class="lx-portrait lx-add">'+ico('plus')+'</span><span>Add Friends</span>',null,'')+
      people.map((p,i)=>'<button type="button" data-lx="person" data-person="'+i+'"><img class="lx-portrait" decoding="async" data-lx-src="'+p.img+'" alt=""><span>'+p.name+(i===0?'<small class="lx-friend-activity">RIVALS</small>':'')+'</span></button>').join('')+'</div>';
  }
  function discoverAvatars(){
    const cards=people.slice(0,6).map((p,i)=>'<button type="button" class="lx-card" data-lx="person" data-person="'+i+'" aria-label="View '+p.name+' profile"><img decoding="async" data-lx-src="'+p.img+'" alt=""><span class="lx-card-title">'+p.name+'</span></button>');
    return '<section class="lx-section lx-discover"><h2>Discover Avatars</h2><div class="lx-cards lx-squares">'+cards.join('')+'</div></section>';
  }
  function home(){
    return tabs()+portraits()+section('Recommended For You',[5,6,7,8,9,3].map(i=>games[i]),false)+
      section('Continue',games.slice(0,5),true,'continue')+discoverAvatars();
  }
  function detail(){
    const g=localGame(),play=g.id==='gta',favorite=data.favorites.includes(g.id),like=data.likes.includes(g.id),alert=data.alerts.includes(g.id);
    const ctl=(id,label,icon,on)=>button(id,label,icon,'','aria-pressed="'+on+'"');
    return '<div class="lx-detail-nav">'+button('back','', 'close','lx-back','aria-label="Back to library"')+button('navigation','','menu','lx-nav-toggle','aria-label="Navigation menu" aria-haspopup="dialog" aria-controls="lx-dialog"')+'</div><article class="lx-detail-inner"><div class="lx-detail-head"><img class="lx-detail-tile" src="'+g.img+'" alt=""><div class="lx-detail-meta"><h1>'+visibleText(g.name)+'</h1>'+
      '<div class="lx-age">'+(play?'Maturity: Content May Vary · Ages 16+':'Experience preview')+'</div>'+
      (play?button('creator',hiddenCreator,null,'lx-creator','aria-label="Open creator profile"'):'')+
      '<div class="lx-play-row">'+(play?button('play','', 'play','lx-play','aria-label="Enter Euroform Automotive" title="Play"'):button('art','View artwork',null,'lx-play'))+
      button('favorite','','star','lx-square-button','aria-label="'+(favorite?'Remove from favorites':'Add to favorites')+'" aria-pressed="'+favorite+'"')+
      button('detail-more','','more','lx-square-button','aria-label="More options"')+'</div></div></div>'+
      '<div class="lx-chips">'+ctl('like',g.rating+'%','like',like)+(play?button('server','Local server','people',''):'')+
      ctl('alert','Notify','bell',alert)+ctl('favorite','Favorite','star',favorite)+button('share','Share','share','')+'</div>'+
      '<button type="button" data-lx="art" class="lx-hero" aria-label="Expand artwork"><img src="'+(g.hero||g.img)+'" alt="'+esc(g.name)+' artwork">'+ico('expand')+'</button></article>';
  }
  function simple(title,html){return '<div class="lx-plain"><h2 class="lx-page-title">'+title+'</h2>'+html+'</div>';}

  function loadLauncherImage(image) {
    image.src=image.dataset.lxSrc;
    delete image.dataset.lxSrc;
  }
  const artworkObserver=window.IntersectionObserver && new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting || !entry.target.isConnected || !entry.target.dataset.lxSrc)continue;
      loadLauncherImage(entry.target);
      artworkObserver.unobserve(entry.target);
    }
  },{root:content,rootMargin:'64px'});
  function render(preserve=false){
    const old=content.scrollTop;const g=localGame();
    shell.classList.toggle('lx-detail',page==='details');shell.classList.toggle('lx-compact',!!data.compact);shell.classList.toggle('lx-home',page==='home');
    root.querySelectorAll('[data-nav]').forEach(b=>{if(b.dataset.nav===page||b.dataset.nav==='home'&&['details','charts','continue','favorites','search'].includes(page)) b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    let view;
    switch(page){
      case 'details': view=detail();break;
      case 'home':view=home();break;
      case 'charts':view=tabs()+section('Top rated',[...games].sort((a,b)=>b.rating-a.rating),true);break;
      case 'continue':view=simple('Continue',grid(games.slice(0,5)));break;
      case 'moments':view=simple('Moments','<button type="button" data-lx="moment-art" class="lx-hero"><img src="'+games[0].hero+'" alt="Grand Theft Auto VI artwork">'+ico('expand')+'</button>');break;
      case 'favorites':{const list=games.filter(x=>data.favorites.includes(x.id));view=simple('Favorites',list.length?grid(list):'<p class="lx-empty">Tap the star on an experience to save it here.</p>');break;}
      case 'me':view=simple('Me','<div class="lx-profile"><img src="launcher/e7dbdb877544afa0.webp" alt=""><div><h2>'+visibleText(data.name)+'</h2>'+button('edit-profile','Edit name','edit','lx-secondary')+'</div></div>'+section('Favorites',games.filter(x=>data.favorites.includes(x.id)),true,'favorites'));break;
      case 'search':{const q=query.value.toLocaleLowerCase().trim();const matches=games.filter(x=>[x.name,...(x.aliases||[])].some(name=>name.toLocaleLowerCase().includes(q)));view=simple('Search results',matches.length?grid(matches):'<p class="lx-empty">No matching experiences.</p>');break;}
      default:view=home();
    }
    content.innerHTML=page==='details'?view:'<div class="lx-main">'+view+'</div>';
    icons(content);content.scrollTop=preserve?old:0;
    if(artworkObserver)artworkObserver.disconnect();
    for(const image of content.querySelectorAll('[data-lx-src]')){
      if(artworkObserver)artworkObserver.observe(image);else loadLauncherImage(image);
    }
    if(page==='details')root.setAttribute('aria-label',g.name+' experience details');else root.setAttribute('aria-label','Roblox experience launcher');
  }
  function close(){if(dialog.open)dialog.close();modal='';}
  function setPage(name){
    if(page==='home')homeScroll=content.scrollTop;
    if(name!=='search'){query.value='';maskInput(query);}
    close();page=name;render();
  }
  function details(id){
    detailOrigin=page;selection=id;setPage('details');
    if(id!=='gta')return;
    
    const article=content.querySelector('.lx-detail-inner');
    for(const [state,frames] of [['cover',13],['meta',19],['hero',35]]){
      const phase='lx-'+state+'-pending';
      article.classList.add(phase);
      setTimeout(()=>article.classList.remove(phase),frames*1000/60);
    }
  }
  function openModal(id,title,body,gallery=false){
    modal=id;root.querySelector('#lx-dialog-title').innerHTML=visibleText(title);dialogBody.innerHTML=body;
    dialogBody.querySelectorAll('input').forEach(maskInput);
    dialog.classList.toggle('lx-gallery',gallery);icons(dialogBody);
    if(!dialog.open)dialog.showModal();
  }
  function artwork(g){
    openModal('art',g.name,'<img class="lx-gallery-image" src="'+(g.hero||g.img)+'" alt="'+esc(g.name)+'">',true);
  }
  function profile(index){
    const p=people[index];if(!p)return;
    selectedPerson=index;const added=data.friends.includes(p.name);
    openModal('person','Profile','<div class="lx-profile"><img src="'+p.img+'" alt=""><h2>'+esc(p.name)+'</h2></div>'+button('friend-toggle',added?'Remove from saved friends':'Save friend',added?'check':'plus','lx-secondary'));
  }
  function connections(){
    openModal('connections','Friends',people.map((p,i)=>button('person',esc(p.name)+(data.friends.includes(p.name)?' ✓':''),null,'lx-menu-row','data-person="'+i+'"')).join(''));
  }
  function chat(){
    openModal('chat','Local chat','<div class="lx-conversation">'+(data.messages.length?data.messages.map(m=>'<div class="lx-bubble">'+visibleText(m)+'</div>').join(''):'<p>Your messages stay on this device.</p>')+'</div><form id="lx-chat-form" class="lx-form"><input aria-label="Message" placeholder="Message" maxlength="260" required autocomplete="off"><button class="lx-primary">Send</button></form>');
    const history=dialogBody.querySelector('.lx-conversation');history.scrollTop=history.scrollHeight;
  }
  const fullDisplay=window.matchMedia('(display-mode: fullscreen)');
  const fullButton=root.querySelector('.lx-header-tools [data-lx="fullscreen"]');
  function hasFullscreenElement(){return Boolean(document.fullscreenElement||document.webkitFullscreenElement);}
  function updateFullButton(){
    const active=hasFullscreenElement();
    const label=active?'Exit full screen':'Full screen';
    fullButton.hidden=fullDisplay.matches&&!active;
    fullButton.title=label;
    fullButton.setAttribute('aria-label',label);
    fullButton.setAttribute('aria-pressed',String(active));
    if(dialog.open && modal==='more'){
      dialogBody.innerHTML=menuItems();
      icons(dialogBody);
    }
  }
  function menuItems(){
    const fullLabel=hasFullscreenElement()?'Exit full screen':'Full screen';
    return button('favorites','Favorites','star','lx-menu-row')+button('connections','Friends','people','lx-menu-row')+
      button('compact','Compact home layout: '+(data.compact?'On':'Off'),'settings','lx-menu-row')+
      (fullButton.hidden?'':button('fullscreen',fullLabel,'expand','lx-menu-row'));
  }
  function more(){
    openModal('more','More',menuItems());
  }
  function fullscreenHelp(){
    const appleTouch=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    let message='Open this link in your browser, then tap Full screen again.';
    if(appleTouch){
      message=navigator.standalone
        ? 'Turn your device sideways to use the full screen. iOS controls whether the clock appears.'
        : 'In Safari, tap Share, choose Add to Home Screen, and turn on Open as Web App. Open Gamerlito from your Home Screen and turn your device sideways. iOS controls whether the clock appears.';
    }
    openModal('fullscreen-help','Full screen','<p>'+message+'</p>');
  }
  async function enterFullscreen(showHelp){
    if(hasFullscreenElement()||fullDisplay.matches)return;
    const screen=document.documentElement;
    try{
      if(document.fullscreenEnabled!==false && typeof screen.requestFullscreen==='function'){
        await screen.requestFullscreen({navigationUI:'hide'});
      }else if(document.webkitFullscreenEnabled!==false && typeof screen.webkitRequestFullscreen==='function'){
        await screen.webkitRequestFullscreen();
      }else if(showHelp) fullscreenHelp();
    }catch{if(showHelp)fullscreenHelp();}
  }
  async function toggleFullscreen(){
    close();
    if(!hasFullscreenElement()){await enterFullscreen(true);return;}
    try{
      if(document.exitFullscreen)await document.exitFullscreen();
      else await document.webkitExitFullscreen();
    }catch{notify('Use your device controls to exit full screen.');}
  }
  function shareGame(){
    const g=localGame();openModal('share','Share experience','<form class="lx-form" id="lx-copy-form"><input readonly aria-label="Experience title" value="'+esc(g.name)+'"><button class="lx-primary">Copy name</button></form>');
  }
  root.addEventListener('click',event=>{
    const b=event.target.closest('button[data-lx]');if(!b||!root.contains(b))return;
    const act=b.dataset.lx,g=localGame();
    switch(act){
      case 'home':case 'charts':case 'me':case 'moments':case 'favorites':case 'continue':setPage(act);break;
      case 'details':details(b.dataset.id);break;
      case 'back':setPage(detailOrigin==='details'?'home':detailOrigin);if(page==='home')content.scrollTop=homeScroll;break;
      case 'play':if(typeof window.startExperience==='function'){close();enterFullscreen(false);window.startExperience();}break;
      case 'art':artwork(g);break;
      case 'moment-art':artwork(games[0]);break;
      case 'close':close();break;
      case 'favorite':{const added=toggle('favorites',g.id);render(true);notify(added?'Added to Favorites':'Removed from Favorites');break;}
      case 'like':{const added=toggle('likes',g.id);render(true);notify(added?'Liked':'Like removed');break;}
      case 'alert':{const added=toggle('alerts',g.id);render(true);notify(added?'Added to Notifications':'Removed from Notifications');break;}
      case 'server':openModal('server','Local server','<div class="lx-profile"><img src="launcher/e7dbdb877544afa0.webp" alt=""><div><h2>'+visibleText(data.name)+'</h2><p>1 player on this device</p></div></div>');break;
      case 'creator':openModal('creator','Creator','<div class="lx-profile"><img src="launcher/e7dbdb877544afa0.webp" alt=""><h2 aria-label="Creator name hidden">'+hiddenCreator+'</h2></div>');break;
      case 'detail-more':openModal('detail-more',g.name,button('art','View artwork','image','lx-menu-row')+button('share','Share','share','lx-menu-row'));break;
      case 'share':shareGame();break;
      case 'more':more();break;
      case 'navigation':{
        const links=Array.from(root.querySelectorAll('.lx-rail button'),item=>{
          const row=item.cloneNode(true);
          row.className='lx-menu-row';
          row.removeAttribute('data-nav');
          return row.outerHTML;
        });
        openModal('navigation','Menu',links.join(''));break;
      }
      case 'chat':chat();break;
      case 'connections':connections();break;
      case 'person':profile(Number(b.dataset.person));break;
      case 'friend-toggle':toggle('friends',people[selectedPerson].name);profile(selectedPerson);break;
      case 'notices':{const list=games.filter(x=>data.alerts.includes(x.id));openModal('notices','Notifications',list.length?list.map(x=>button('details',visibleText(x.name),'bell','lx-menu-row','data-id="'+x.id+'"')).join(''):'<p>No notifications. Tap Notify on an experience to keep it here.</p>');break;}
      case 'compact':data.compact=!data.compact;persist();render(true);more();break;
      case 'fullscreen':toggleFullscreen();break;
      case 'edit-profile':openModal('edit-profile','Edit display name','<form class="lx-form" id="lx-profile-form"><input aria-label="Display name" maxlength="26" required value="'+esc(data.name)+'"><button class="lx-primary">Save</button></form>');break;
    }
  });
  root.addEventListener('submit',async e=>{
    const form=e.target;if(!['lx-chat-form','lx-copy-form','lx-profile-form','lx-search-form'].includes(form.id))return;
    e.preventDefault();const input=form.querySelector('input'),value=input.value.trim();
    if(form.id==='lx-search-form'){if(value){setPage('search');input.blur();}return;}
    if(!value) return;
    if(form.id==='lx-chat-form'){data.messages.push(value);data.messages=data.messages.slice(-100);persist();chat();dialogBody.querySelector('input').focus();}
    if(form.id==='lx-profile-form'){data.name=value;persist();close();render(true);}
    if(form.id==='lx-copy-form'){try{await navigator.clipboard.writeText(value);close();notify('Copied');}catch{input.select();try{if(document.execCommand('copy')){close();notify('Copied');}}catch{}}}
  });
  root.addEventListener('input',e=>{if(e.target instanceof HTMLInputElement)maskInput(e.target);});
  query.addEventListener('input',()=>{if(query.value.trim()){page='search';render();}else{page='home';render();}});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  dialog.addEventListener('close',()=>{modal='';});
  document.addEventListener('keydown',e=>{
    if(root.hidden||root.getClientRects().length===0||e.key!=='Escape')return;
    if(dialog.open){e.stopImmediatePropagation();e.preventDefault();close();}
    else if(page!=='home'){e.stopImmediatePropagation();e.preventDefault();setPage('home');}
  },true);
  window.Launcher={show(name='home'){root.hidden=false;root.style.removeProperty('display');selection='gta';detailOrigin='home';setPage(name==='details'?'details':'home');},hide(){close();root.hidden=true;}};
  document.addEventListener('fullscreenchange',updateFullButton);
  document.addEventListener('webkitfullscreenchange',updateFullButton);
  if(fullDisplay.addEventListener)fullDisplay.addEventListener('change',updateFullButton);
  else if(fullDisplay.addListener)fullDisplay.addListener(updateFullButton);
  icons(root);render();updateFullButton();
})();
