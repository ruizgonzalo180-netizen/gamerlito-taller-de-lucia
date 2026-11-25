(() => {
  'use strict';
  const screen = document.getElementById('join-screen');
  const canvas = document.getElementById('join-surface');
  const status = document.getElementById('join-announcement');
  const context = canvas.getContext('2d', {alpha:false});
  const images = Object.fromEntries([...screen.querySelectorAll('[data-join-image]')].map(image => [image.dataset.joinImage,image]));
  // Source is iPad video at 60 Hz, starting when its play button first changes state.
  const tapFrame = 731, coverFrame = 766, gameFrame = 958;
  const coverMs = (coverFrame-tapFrame)*1000/60;
  const durationMs = (gameFrame-tapFrame)*1000/60;
  const statuses = ['Waiting for an available server','Waiting for an available server','Waiting for an available server. Retrying...(1)','Joining server'];
  // Original frames' measured tile geometry, foreground/scene opacity and edge gradient RGB values.
  const frames = [[420,330,0,0,69,72,85,0,0,0],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,0,0,35,37,43,19,21,25],[420,330,92,0,35,37,43,19,21,25],[420,330,97,73,30,33,39,17,19,21],[420,330,104,85,30,32,38,17,19,21],[420,330,110,97,30,32,38,16,18,20],[420,330,118,109,29,31,37,16,18,20],[420,330,126,109,28,31,36,16,18,20],[420,330,135,121,28,31,35,16,18,20],[420,330,143,134,28,30,36,16,18,20],[420,330,153,134,28,30,35,15,17,19],[420,330,161,146,27,29,35,15,17,19],[420,330,170,158,27,29,35,15,17,19],[420,330,179,158,27,29,33,15,17,19],[420,330,187,158,26,29,32,15,17,19],[420,330,196,170,25,28,32,15,17,19],[420,330,204,170,25,29,32,15,17,19],[420,330,212,170,24,28,31,14,16,18],[420,330,221,194,24,26,30,14,16,18],[420,330,230,194,24,26,30,14,16,18],[420,330,239,219,24,26,30,14,16,18],[420,330,247,219,24,25,29,13,15,17],[420,330,255,219,23,25,29,13,15,17],[420,330,255,219,23,25,29,13,15,17],[420,330,255,243,22,24,28,15,15,17],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,243,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,29,12,14,18],[420,330,255,255,21,23,29,12,14,18],[420,330,255,255,21,23,29,12,14,18],[420,330,255,255,21,23,29,12,14,18],[420,330,255,255,21,23,29,12,14,18],[420,330,255,255,21,23,29,12,14,18],[420,330,255,255,21,23,29,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,28,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,26,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,21,23,27,12,14,18],[420,330,255,255,19,21,27,12,14,18],[426,322,255,255,19,21,27,12,14,18],[434,310,223,231,21,23,29,12,14,18],[436,306,217,231,21,23,29,12,14,18],[438,306,216,231,21,23,29,12,14,18],[440,298,209,219,22,24,30,13,15,17],[444,294,195,219,21,23,30,12,14,18],[446,290,190,194,22,24,31,13,15,17],[448,290,183,182,23,25,32,13,15,17],[450,286,176,182,23,25,32,13,15,19],[452,282,167,182,23,25,32,13,15,19],[454,278,152,158,24,26,33,14,16,18],[458,274,147,158,24,26,33,14,16,20],[458,274,147,158,24,26,33,14,16,20],[458,270,137,158,24,26,33,14,16,20],[458,270,137,158,24,26,33,14,16,20],[466,262,117,121,25,28,35,15,17,19],[470,254,105,109,25,28,35,15,17,21],[470,254,100,97,26,29,36,15,17,19],[470,254,100,97,26,29,36,15,17,19],[472,250,96,97,26,29,36,15,17,19],[478,242,80,97,26,29,36,15,17,21],[478,238,77,85,27,30,37,16,18,20],[478,238,78,85,27,30,37,16,18,20],[482,234,67,73,27,30,37,16,18,22],[486,226,48,61,28,31,38,16,18,22],[488,226,46,61,29,32,41,17,19,23],[490,222,36,49,29,32,39,17,19,23],[492,214,31,36,29,32,41,17,19,23],[496,214,24,24,30,33,40,17,19,23],[498,206,18,24,30,33,40,17,19,23],[500,206,11,12,30,33,40,18,20,24],[502,198,3,0,31,34,41,18,20,24],[502,198,0,0,19,21,25,14,14,16]];
  let currentFrame = -1, drawnFrame = -1, lastStatus = '';


  let prepared, resolved=false;
  function prepare() {
    if (prepared) return prepared;
    prepared=Promise.all(Object.values(images).map(image=>{
      const loaded=new Promise(resolve=>{
        image.onload=image.onerror=resolve;
      });
      image.src=image.dataset.entrySrc;
      return image.decode ? image.decode().catch(()=>{}) : loaded;
    })).then(()=>{resolved=true;});
    return prepared;
  }
  function hide() {
    screen.hidden=true;
    screen.setAttribute('aria-hidden','true');
    status.textContent=lastStatus='';
    currentFrame=drawnFrame=-1;
  }
  function render(force=false) {
    if (currentFrame<coverFrame || screen.hidden) return;
    const rect=canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const density=Math.min(3,window.devicePixelRatio||1);
    const pixelsWide=Math.round(rect.width*density), pixelsHigh=Math.round(rect.height*density);
    if (canvas.width!==pixelsWide || canvas.height!==pixelsHigh) {
      canvas.width=pixelsWide; canvas.height=pixelsHigh; force=true;
    }
    if (currentFrame===drawnFrame && !force) return;
    drawnFrame=currentFrame;
    const width=rect.width, height=rect.height;
    const index=currentFrame-coverFrame, params=frames[index];
    const [tileTop,tileSize,textAlpha,backAlpha,tr,tg,tb,br,bg,bb] = params;
    const scale=Math.min(height/1488,width/(height>width?1050:1450));
    const cx=width/2, cy=height/2, shrink=tileSize/330;
    const posY=y=>cy+(y-744)*scale;
    const ready=image=>image.complete && image.naturalWidth>0;
    const draw=(key,...args)=>{if (ready(images[key])) context.drawImage(images[key],...args);};
    context.setTransform(pixelsWide/width,0,0,pixelsHigh/height,0,0);
    context.imageSmoothingEnabled=true;
    context.imageSmoothingQuality='high';
    context.globalAlpha=1;
    const gradient = context.createLinearGradient(0,0,0,height);
    gradient.addColorStop(0,`rgb(${tr},${tg},${tb})`);
    gradient.addColorStop(.42,`rgb(${tr},${tg},${tb})`);
    gradient.addColorStop(1,`rgb(${br},${bg},${bb})`);
    context.fillStyle=gradient;context.fillRect(0,0,width,height);
    if (currentFrame===coverFrame) { draw('window',0,0,width,height); return; }
    if (backAlpha>0 && ready(images.tile)) {
      context.globalAlpha=.13*backAlpha/255;
      const fit=Math.max(width/images.tile.naturalWidth,height/images.tile.naturalHeight);
      const drift=(currentFrame-coverFrame)/192;
      const zoom=1.03+.045*drift, bw=images.tile.naturalWidth*fit*zoom, bh=images.tile.naturalHeight*fit*zoom;
      draw('tile',(width-bw)*(.25+.25*drift),(height-bh)*.56,bw,bh);
    }
    if (textAlpha && currentFrame!==957) {
      context.globalAlpha=textAlpha/255;
      context.fillStyle='rgba(24,25,30,.79)';
      const pw=1258*scale*shrink, ph=318*scale*shrink;
      context.beginPath(); context.roundRect(cx-pw/2,cy-ph/2,pw,ph,16*scale*shrink);context.fill();
    }
    if (currentFrame!==957) {
      context.globalAlpha=1;
      const size=tileSize*scale,ty=posY(tileTop);
      context.save();context.beginPath();context.roundRect(cx-size/2,ty,size,size,13*scale*shrink);context.clip();
      // Sample the artwork directly from its high-resolution source. Only the moving
      // reflection is stored in the animation atlas, so tablet pixel density is preserved.
      const artAlpha=Math.min(1,Math.max(0,(currentFrame-793)/3))*textAlpha/255;
      if (artAlpha>0) {
        context.globalAlpha=artAlpha;
        draw('tile',cx-size/2,ty,size,size);
      }
      context.globalAlpha=1;
      const cell=96, sx=(index%8)*cell, sy=(Math.floor(index/8)%8)*cell;
      const image=images['sheet'+Math.floor(index/64)];
      if (ready(image)) context.drawImage(image,sx,sy,cell,cell,cx-size/2,ty,size,size);
      context.restore();
      if (textAlpha) {
        context.globalAlpha=textAlpha/255;
        const ds=scale*shrink, nameY=posY(795+(1-shrink)*21);
        draw('name',cx-210*ds,nameY-32*ds,420*ds,64*ds);
      }
    }
    context.globalAlpha=1;
    const row=currentFrame===767?0:currentFrame<798?1:currentFrame<889?2:3;
    draw('status',0,row*36,408,36,cx-204*scale,height-64*scale,408*scale,36*scale);
    if (lastStatus!==statuses[row]) { lastStatus=statuses[row];status.textContent=lastStatus; }
  }
  function paint(elapsedMs) {
    if (!Number.isFinite(elapsedMs) || elapsedMs<coverMs || elapsedMs>=durationMs) {
      if (!screen.hidden) hide();
      return false;
    }
    currentFrame=Math.min(gameFrame-1,tapFrame+Math.floor(elapsedMs*60/1000+1e-6));
    if (screen.hidden) {screen.hidden=false;screen.setAttribute('aria-hidden','false');}
    render();
    return true;
  }
  for (const image of Object.values(images)) image.addEventListener('load',()=>render(true));
  window.addEventListener('resize',()=>render(true),{passive:true});
  if (window.ResizeObserver) new ResizeObserver(()=>render(true)).observe(canvas);
  window.JoinScreen=Object.freeze({paint,hide,coverMs,durationMs,prepare,get ready(){return resolved;}});
})();
