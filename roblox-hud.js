(() => {
  "use strict";
  const root = document.getElementById("game-hud");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const byAction = (a) => $('[data-gh="' + a + '"]');
  const shade = $(".gh-shade"), menu = $(".gh-menu"), content = $(".gh-content");
  const quick = $(".gh-quick"), chat = $(".gh-chatbox"), chatInput = $(".gh-chat-form input");
  const stick = $(".gh-stick"), knob = $(".gh-stick span");
  const sprintButton = byAction("sprint"), sceneAction = byAction("act");
  const prefsKey = `gamerlito.${document.body.dataset.duoMode}.lucia-jason.hud.prefs.v2`, reportsKey = `gamerlito.${document.body.dataset.duoMode}.lucia-jason.hud.notes.v1`;
  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }
  const choices = { rate: [0.75,1,1.25,1.5], fit: ["cover","contain"], sensitivity: [0.55,1,1.6], quality: ["original","1080p"] };
  const currentPrefs = load(prefsKey,null);
  const saved = currentPrefs || {...load(`gamerlito.${document.body.dataset.duoMode}.lucia-jason.hud.prefs.v1`,{}),fit:"cover"};
  const settings = { volume: 0.65, feedback: false, rate: 1, fit: "cover", sensitivity: 1, quality: "original" };
  for (const [key, values] of Object.entries(choices)) if (values.includes(saved?.[key])) settings[key] = saved[key];
  if (Number.isFinite(saved?.volume)) settings.volume = Math.min(1, Math.max(0, saved.volume));
  settings.feedback = saved?.feedback === true;
  if(!choices.quality.includes(currentPrefs?.quality)) store(prefsKey,settings);
  let reports = load(reportsKey, []);
  if (!Array.isArray(reports)) reports = [];
  let active = false, tab = "people", dialog = "", chatTab = "here", view = "grid", stage = "launch";
  let messages = [], shots = [], selectedShot = null, selectedPointer = null, toastTimer = null, audioContext;
  const keys = new Set();
  const sprintKeys = new Set();
  let sprintPointer = null, sprinting = false;
  const player = (action,...args) => window.Player?.[action]?.(...args);
  const escape = (text) => String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function clickTone() {
    if (!settings.feedback || !settings.volume) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state !== "running") audioContext.resume().catch(()=>{});
      const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
      const t = audioContext.currentTime;
      oscillator.type = "sine"; oscillator.frequency.setValueAtTime(540,t);
      oscillator.frequency.exponentialRampToValueAtTime(370,t+.055);
      gain.gain.setValueAtTime(0.035*settings.volume,t);
      gain.gain.exponentialRampToValueAtTime(.0001,t+.065);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
      oscillator.start(t); oscillator.stop(t+.07);
    } catch { /* Buttons remain usable when the browser has no audio output. */ }
  }
  function applySettings() {
    player("setVolume", settings.volume); player("setRate",settings.rate);
    player("setFit",settings.fit); player("setSensitivity",settings.sensitivity);
    player("setQuality",settings.quality);
  }
  function updateQualityStatus() {
    const line = $("[data-quality-status]");
    if (line) line.textContent = player("qualityStatus") || "Ready on game entry";
  }
  document.getElementById("road").addEventListener("gamequalitychange",updateQualityStatus);
  function toast(message) {
    clearTimeout(toastTimer);
    $(".gh-toast").textContent=message; $(".gh-toast").hidden=false;
    toastTimer=setTimeout(()=>{ $(".gh-toast").hidden=true; },2200);
  }
  function stopMovement() {
    keys.clear();
    sprintKeys.clear();
    const pointer = sprintPointer;
    sprintPointer = null;
    if (pointer !== null && sprintButton.hasPointerCapture(pointer)) sprintButton.releasePointerCapture(pointer);
    syncSprint();
    if (selectedPointer !== null && stick.hasPointerCapture?.(selectedPointer)) stick.releasePointerCapture(selectedPointer);
    selectedPointer = null;
    knob.style.transform = "";
    player("control",0,0);
  }
  function syncSprint() {
    const held = sprintPointer !== null || sprintKeys.size > 0;
    if (sprinting === held) return;
    sprinting = held;
    sprintButton.dataset.held = String(held);
    player("sprint",held);
  }
  function setAction(label) {
    const text = typeof label === "string" ? label.trim() : "";
    if (!text && document.activeElement === sceneAction) root.focus({preventScroll:true});
    sceneAction.hidden = !text;
    sceneAction.querySelector("span").textContent = text;
    sceneAction.title = text ? text+" (E)" : "";
    const glyph = /^(talk|greet)\b/i.test(text) ? "cross" : /^interact$/i.test(text) ? "L2" : "";
    const badge = sceneAction.querySelector(".gh-action-glyph");
    badge.hidden = !glyph;
    badge.dataset.glyph = glyph;
    badge.textContent = glyph === "cross" ? "×" : glyph;
    sceneAction.querySelector("svg").toggleAttribute("hidden",Boolean(glyph));
  }
  function canAct() {
    return active && stage === "playing" && shade.hidden && chat.hidden && quick.hidden;
  }
  function hideQuick() { quick.hidden=true; byAction("tools").setAttribute("aria-expanded","false"); }
  function setChatTab(next) {
    chatTab=next;
    $(".gh-messages").hidden=next!=="here"; $(".gh-phrases").hidden=next==="here";
    byAction("here").setAttribute("aria-pressed",String(next==="here"));
    byAction("phrases").setAttribute("aria-pressed",String(next==="phrases"));
  }
  function closeChat() {
    if (chat.contains(document.activeElement)) document.activeElement.blur();
    chat.hidden=true; byAction("chat").setAttribute("aria-expanded","false");
  }
  function showChat(focus) {
    if (!shade.hidden) closeMenu(false);
    hideQuick(); stopMovement();
    chat.hidden=false; setChatTab("here"); byAction("chat").setAttribute("aria-expanded","true");
    if(focus) chatInput.focus({preventScroll:true});
  }
  function renderMessages() {
    const box=$(".gh-messages"); box.replaceChildren();
    const note=document.createElement("p"); note.textContent="👋 Say hi to everyone playing now!"; box.append(note);
    for (const message of messages) {
      const line=document.createElement("p"), author=document.createElement("strong");
      author.textContent="Rzrobiiz: "; line.append(author,document.createTextNode(message)); box.append(line);
    }
    box.scrollTop=box.scrollHeight;
  }
  function sendMessage(raw) {
    const value=String(raw).trim().slice(0,180);
    if (!value) return;
    messages.push(value); if (messages.length>80) messages.shift();
    chatInput.value=""; setChatTab("here"); renderMessages();
  }
  function closeMenu(focus=true) {
    if (shade.hidden) return;
    shade.hidden=true; dialog=""; root.classList.remove("gh-modal-open"); byAction("menu").setAttribute("aria-expanded","false");
    player("resume");
    if(focus) root.focus({preventScroll:true});
  }
  function showMenu(next="people") {
    closeChat(); hideQuick(); stopMovement(); tab=next; dialog="";
    const wasClosed=shade.hidden;
    shade.hidden=false; root.classList.add("gh-modal-open"); byAction("menu").setAttribute("aria-expanded","true");
    if(wasClosed) player("pause");
    renderMenu();
    menu.focus({preventScroll:true});
  }
  function confirm(action) {
    dialog=action; renderMenu(); $('[data-gh="cancel"]').focus({preventScroll:true});
  }
  const actionButton=(action,label,primary=false)=>'<button type="button" class="gh-action'+(primary?' gh-primary':'')+'" data-gh="'+action+'">'+label+'</button>';
  function picker(key, label, options) {
    return '<label class="gh-row"><span>'+label+'</span><select data-pref="'+key+'">'+options.map(([v,s])=>'<option value="'+v+'"'+(String(v)===String(settings[key])?' selected':'')+'>'+s+'</option>').join("")+'</select></label>';
  }
  function person() {
    return '<div class="gh-heading"><h2>In this server</h2><div class="gh-row-switch"><button type="button" aria-label="Grid view" aria-pressed="'+(view==="grid")+'" data-gh="grid">▦</button><button type="button" aria-label="List view" aria-pressed="'+(view==="list")+'" data-gh="list">☷</button></div></div>'+
      '<button type="button" class="gh-player '+(view==="list"?'gh-player-list':'')+'" data-gh="profile"><img src="launcher/ee506ee9693c698a.webp" alt=""><strong>Rzrobiiz</strong></button>';
  }
  function settingsBody() {
    return '<h2>Audio</h2><label class="gh-row"><span>Volume <small class="gh-vol-value">'+Math.round(settings.volume*100)+'%</small></span><input aria-label="Volume" type="range" min="0" max="100" value="'+Math.round(settings.volume*100)+'" data-pref="volume"></label>'+
      picker("feedback","Interface sounds",[[false,"Off"],[true,"On"]])+
      '<h2 style="margin-top:1em">Experience</h2>'+
      picker("quality","Video quality",[["original","Original (4K, 60 fps)"],["1080p","1080p (60 fps)"]])+
      '<p role="status" data-quality-status></p>'+
      picker("rate","Playback speed",choices.rate.map(v=>[v,v+"×"]))+
      picker("fit","Display",[['cover','Fill screen'],['contain','Fit to screen']])+
      picker("sensitivity","Camera sensitivity",[[.55,"Low"],[1,"Normal"],[1.6,"High"]]);
  }
  function gallery() {
    return '<div class="gh-heading"><h2>Gallery</h2>'+actionButton("capture","Capture",true)+'</div>'+
      (!shots.length?'<p>Your captures appear here.</p>':'<div class="gh-gallery">'+shots.map((s,i)=>'<button type="button" data-shot="'+i+'" aria-label="Open capture '+(i+1)+'"><img src="'+s+'" alt="Capture '+(i+1)+'"></button>').join("")+'</div>');
  }
  function report() {
    const recent = reports.length ? '<p>Latest note · '+escape(reports[0].kind)+' · '+escape(reports[0].note)+'</p>' : '';
    return '<h2>Report an issue</h2><form class="gh-report"><label>Category<select name="kind"><option>Playback</option><option>Controls</option><option>Interface</option></select></label><label>What happened?<textarea name="note" required maxlength="300" placeholder="Describe the issue"></textarea></label><p>Notes are saved on this device.</p><button type="submit" class="gh-action gh-primary">Save note</button></form>'+recent;
  }
  function help() {
    const rows=[
      ["Pan the view","Joystick or WASD"],
      ["Skip to the next scene","Action button or E"],
      ["Skip ahead 5 seconds","On-screen arrow or Space"],
      ["Speed up playback","Hold the sprint button or Shift"],
      ["Pause or resume","P"],
      ["Restart the clip","R"],
      ["Open the Roblox menu","Esc"]
    ];
    if(document.body.dataset.duoMode==="manual") rows.splice(1,0,["Next or previous scene","Hold the joystick up or down"]);

    return '<h2>Controls</h2>'+rows.map(([name,key])=>'<div class="gh-row"><span>'+name+'</span><span class="gh-key">'+key+'</span></div>').join("");
  }
  function renderMenu() {
    const modal=dialog==="respawn"||dialog==="leave";
    $(".gh-tabs").hidden=modal; $(".gh-footer").hidden=modal;
    $$(".gh-tabs [data-tab]").forEach(b=>b.setAttribute("aria-current",b.dataset.tab===tab?"page":"false"));
    if (modal) {
      const leave=dialog==="leave";
      content.innerHTML='<div class="gh-confirm"><h2>'+(leave?'Are you sure you want to leave the game?':'Are you sure you want to respawn your character?')+'</h2><div class="gh-confirm-actions">'+actionButton("confirm",leave?"Leave":"Respawn",true)+actionButton("cancel",leave?"Don’t Leave":"Don’t Respawn")+'</div></div>';
    } else if (dialog==="profile") {
      content.innerHTML='<h2>Player profile</h2><div class="gh-player"><img src="launcher/ee506ee9693c698a.webp" alt="Player avatar"><strong>Rzrobiiz</strong></div><p class="gh-hidden-title">Grand Theft Auto VI</p>'+actionButton("back","Back to People");
    } else if (dialog==="photo" && shots[selectedShot]) {
      content.innerHTML='<h2>Capture '+(selectedShot+1)+'</h2><img class="gh-shot-preview" src="'+shots[selectedShot]+'" alt="Captured frame"><div class="gh-actions">'+actionButton("download","Save image",true)+actionButton("delete-shot","Delete")+actionButton("back","Back")+'</div>';
    } else {
      content.innerHTML=({people:person,settings:settingsBody,gallery,report,help}[tab]||person)();
      if(tab==="people")content.insertAdjacentHTML("beforeend",actionButton("garage","Workshop controls"));
      if (tab==="settings") updateQualityStatus();
    }
    content.scrollTop=0;
  }
  function reset() {
    stopMovement(); hideQuick(); closeChat(); shade.hidden=true; dialog=""; tab="people"; view="grid"; selectedShot=null;
    root.classList.remove("gh-modal-open"); byAction("menu").setAttribute("aria-expanded","false");
    chatInput.value=""; clearTimeout(toastTimer); $(".gh-toast").hidden=true;
    messages=[]; renderMessages(); setChatTab("here");
  }
  function mount() {
    active=true; root.hidden=false; reset(); setStage("launch"); applySettings();
  }
  function setStage(value) {
    stage=value==="playing"?"playing":"launch"; root.dataset.stage=stage;
    if (stage!=="playing") { stopMovement(); setAction(null); }
  }
  function unmount() {
    if(root.contains(document.activeElement)) document.activeElement.blur();
    active=false; root.hidden=true; reset();
  }
  function persistPref(input) {
    const key=input.dataset.pref;
    if (key==="volume") settings.volume=Math.max(0,Math.min(1,Number(input.value)/100));
    else if (key==="feedback") settings.feedback=input.value==="true";
    else if (key==="fit") settings.fit=input.value==="contain"?"contain":"cover";
    else if (key==="quality" && choices.quality.includes(input.value)) settings.quality=input.value;
    else if (choices[key]?.includes(Number(input.value))) settings[key]=Number(input.value);
    else return;
    if(key==="volume") {
      const display=$(".gh-vol-value"); if(display) display.textContent=Math.round(settings.volume*100)+"%";
      player("setVolume",settings.volume);
    } else applySettings();
    store(prefsKey,settings);
  }
  async function capture() {
    let shot;
    try { shot=await player("snapshot"); } catch {}
    if(!active||shade.hidden||tab!=="gallery") return;
    if(typeof shot!=="string" || !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(shot)) { toast("This frame isn’t ready yet."); return; }
    shots.unshift(shot); shots=shots.slice(0,8); dialog=""; renderMenu(); toast("Capture saved to Gallery");
  }
  function handle(action) {
    if(action==="timeline"){hideQuick();player("timeline");return;}
    if(action==="garage"){closeMenu(false);hideQuick();player("garage");return;}
    if (action==="menu") { if(shade.hidden) showMenu(); else closeMenu(); }
    else if (action==="tools") { if(!shade.hidden) closeMenu(false); closeChat(); stopMovement(); quick.hidden=!quick.hidden; byAction("tools").setAttribute("aria-expanded",String(!quick.hidden)); }
    else if (action==="chat") { if(chat.hidden) showChat(false); else closeChat(); }
    else if (action==="close-chat") closeChat();
    else if (action==="audio"||action==="settings") showMenu("settings");
    else if (action==="gallery"||action==="help") showMenu(action);
    else if (action==="here"||action==="phrases") setChatTab(action);
    else if (action==="playback" && canAct()) player("togglePlayback");
    else if (action==="replay" && canAct()) player("restart");
    else if (action==="jump" && canAct()) player("jump");
    else if (action==="act" && canAct() && !sceneAction.hidden) player("performAction");
    else if (action==="resume") closeMenu();
    else if (action==="leave"||action==="respawn") confirm(action);
    else if (action==="confirm") {
      const leave=dialog==="leave";
      if(leave) { unmount(); player("leave"); }
      else { reset(); player("restart"); }
    }
    else if (action==="cancel"||action==="back") { dialog=""; selectedShot=null; renderMenu(); }
    else if (action==="grid"||action==="list") { view=action; renderMenu(); }
    else if (action==="profile") { dialog="profile"; renderMenu(); }
    else if (action==="capture") capture();
    else if (action==="download"&&shots[selectedShot]) {
      const a=document.createElement("a"); a.href=shots[selectedShot]; a.download="Gamerlito-capture-"+(selectedShot+1)+"."+((a.href.match(/^data:image\/(\w+)/)||[])[1]||"png").replace("jpeg","jpg"); document.body.append(a); a.click(); a.remove();
    } else if(action==="delete-shot"&&shots[selectedShot]) { shots.splice(selectedShot,1); selectedShot=null; dialog=""; renderMenu(); }
  }
  root.addEventListener("click",e=>{
    if(!active) return;
    if(e.target===shade) { if(dialog==="leave"||dialog==="respawn") { dialog=""; renderMenu(); } else closeMenu(); return; }
    const b=e.target.closest("button"); if (!b||!root.contains(b)) return;
    clickTone();
    if (b.dataset.gh) handle(b.dataset.gh);
    else if(b.dataset.tab) { tab=b.dataset.tab; dialog=""; selectedShot=null; renderMenu(); }
    else if(b.dataset.phrase) sendMessage(b.dataset.phrase);
    else if(b.dataset.shot!==undefined) { selectedShot=Number(b.dataset.shot); dialog="photo"; renderMenu(); }
  });
  root.addEventListener("submit",e=>{
    if(!active) return;
    if(e.target.matches(".gh-chat-form")) { e.preventDefault(); sendMessage(chatInput.value); chatInput.focus(); }
    if(e.target.matches(".gh-report")) {
      e.preventDefault(); const f=e.target, note=f.elements.note.value.trim(); if(!note) { f.elements.note.focus(); return; }
      reports.unshift({kind:f.elements.kind.value,note:note.slice(0,300)}); reports=reports.slice(0,10);
      const ok=store(reportsKey,reports); renderMenu(); toast(ok?"Note saved on this device":"Note saved for this session");
    }
  });
  root.addEventListener("input",e=>{ if(e.target.dataset.pref==="volume") persistPref(e.target); });
  root.addEventListener("change",e=>{ if(e.target.dataset.pref) { persistPref(e.target); clickTone(); } });
  function drift(x,y) {
    const mag=Math.max(1,Math.hypot(x,y)), dx=x/mag, dy=y/mag;
    const r=stick.getBoundingClientRect().width*.23;
    knob.style.transform="translate("+dx*r+"px,"+dy*r+"px)"; player("control",dx,dy);
  }
  function movePointer(e) {
    if(e.pointerId!==selectedPointer) return;
    const r=stick.getBoundingClientRect(), span=Math.max(1,r.width*.35);
    drift((e.clientX-r.left-r.width/2)/span,(e.clientY-r.top-r.height/2)/span);
  }
  stick.addEventListener("pointerdown",e=>{
    if (!canAct() || selectedPointer!==null) return;
    e.preventDefault(); selectedPointer=e.pointerId; stick.setPointerCapture(e.pointerId); movePointer(e);
  });
  stick.addEventListener("pointermove",movePointer);
  sprintButton.addEventListener("pointerdown",e=>{
    if(!canAct() || e.button!==0 || sprintPointer!==null) return;
    e.preventDefault(); sprintPointer=e.pointerId;
    sprintButton.setPointerCapture(e.pointerId); syncSprint();
  });
  ["pointerup","pointercancel","lostpointercapture"].forEach(evt=>sprintButton.addEventListener(evt,e=>{
    if(e.pointerId===sprintPointer) { sprintPointer=null; syncSprint(); }
  }));
  sprintButton.addEventListener("contextmenu",e=>e.preventDefault());
  ["pointerup","pointercancel","lostpointercapture"].forEach(evt=>stick.addEventListener(evt,e=>{
    if(e.pointerId===selectedPointer) { selectedPointer=null; knob.style.transform=""; player("control",0,0); }
  }));
  const dirs={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0]};
  function keyboardMovement() {
    let x=0,y=0;
    for(const k of keys) { x+=dirs[k][0]; y+=dirs[k][1]; }
    drift(x,y);
  }
  function isTyping(node) { return node?.matches?.("input,select,textarea,[contenteditable=true]"); }
  document.addEventListener("keydown",e=>{
    if(document.querySelector('dialog[open]'))return;
    if(window.Player?.workshopActive() && shade.hidden && quick.hidden && chat.hidden && e.key!=="/")return;
    if(!active || e.ctrlKey||e.metaKey||e.altKey) return;
    if(e.key==="Escape") {
      e.preventDefault(); e.stopImmediatePropagation();
      if(e.repeat) return;
      if(!shade.hidden) { if(dialog) { dialog=""; renderMenu(); } else closeMenu(); }
      else if(!chat.hidden) closeChat(); else if(!quick.hidden) hideQuick(); else showMenu();
      return;
    }
    if(!shade.hidden) {
      if(e.key==="Tab") {
        const items=[...menu.querySelectorAll("button,select,textarea,input")].filter(n=>n.getClientRects().length&&!n.disabled);
        if(items.length && (e.shiftKey&&(document.activeElement===items[0]||document.activeElement===menu)||!e.shiftKey&&document.activeElement===items.at(-1))) {
          e.preventDefault(); (e.shiftKey?items.at(-1):items[0]).focus();
        }
      }
      return;
    }
    if(isTyping(e.target)) return;
    if(e.key==="/"&&!e.repeat) { e.preventDefault(); showChat(true); return; }
    if(!canAct()) return;
    if(e.code==="KeyP" || e.code==="KeyR") {
      e.preventDefault();
      if(!e.repeat) handle(e.code==="KeyP"?"playback":"replay");
      return;
    }
    if(canAct() && e.code==="KeyE" && !sceneAction.hidden) {
      e.preventDefault();
      if(!e.repeat) handle("act");
      return;
    }
    if(canAct() && (e.code==="ShiftLeft" || e.code==="ShiftRight" || (e.target===sprintButton && (e.code==="Space" || e.code==="Enter")))) {
      e.preventDefault();
      if(!e.repeat) { sprintKeys.add(e.code); syncSprint(); }
      return;
    }
    if(dirs[e.code]) { e.preventDefault(); keys.add(e.code); keyboardMovement(); }
    if(e.code==="Space"&&!e.repeat&&!e.target.closest?.("button,a")) { e.preventDefault(); player("jump"); }
  });
  document.addEventListener("keyup",e=>{
    if(sprintKeys.delete(e.code)) { e.preventDefault(); syncSprint(); }
    if(active&&keys.delete(e.code)) { e.preventDefault(); keyboardMovement(); }
  });
  window.addEventListener("blur",()=>{ if(active) stopMovement(); });
  document.addEventListener("visibilitychange",()=>{ if(active&&document.hidden) stopMovement(); });
  player("setQuality",settings.quality);
  window.GameHUD={mount,reset,setStage,setAction,unmount,canAct,stickInUse:()=>selectedPointer!==null || keys.size>0,isBlocking:()=>active&&(!shade.hidden||isTyping(document.activeElement)),openMenu:showMenu};
})();
