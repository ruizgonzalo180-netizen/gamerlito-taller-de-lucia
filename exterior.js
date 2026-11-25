const materialNames = /carbon|plastic|gold|chrome|steel|copper|white|green/i;
function surface(ctx,label,outline){
 if(!label || !materialNames.test(label))return;
 const palette = /gold/i.test(label)?['#b99842','#f4db80']:/copper/i.test(label)?['#a85e39','#e5ae8c']:/white/i.test(label)?['#c4c6c3','#f4f3eb']:/green/i.test(label)?['#214736','#60905e']:/chrome|steel/i.test(label)?['#838b90','#d9e1df']:['#202426','#51595b'];
 ctx.save();const path=new Path2D(outline);ctx.clip(path);const grad=ctx.createLinearGradient(0,38,0,228);grad.addColorStop(0,palette[1]);grad.addColorStop(.48,palette[0]);grad.addColorStop(.68,palette[1]);grad.addColorStop(1,palette[0]);ctx.fillStyle=grad;ctx.globalAlpha=/matte|plastic/i.test(label)?.86:.72;ctx.fill(path);
 if(/carbon/i.test(label)){ctx.globalAlpha=.29;ctx.lineWidth=.72;ctx.strokeStyle='#0c0d10';ctx.beginPath();for(let i=-260;i<770;i+=2.7){ctx.moveTo(i,0);ctx.lineTo(i+245,250);}ctx.stroke();}
 ctx.restore();
}
export function fitExterior(ctx,canvas,equipped){
 const installed=key=>equipped(key)?.name||'';
 ctx.save();ctx.scale(canvas.width/1440,canvas.height/810);ctx.translate(168,375);
 surface(ctx,installed('Hood · Material'),'M466 91 Q538 82 588 96 Q630 108 669 138 Q621 126 570 117 L502 105 Z');
 surface(ctx,installed('Roof · Material'),'M174 43 Q225 28 285 27 Q341 26 389 36 L376 40 Q269 29 191 47 Z');
 surface(ctx,installed('Mirrors'),'M293 82 Q302 68 319 70 Q333 71 335 83 Q319 85 295 85 Z');
 surface(ctx,installed('Spoiler'),'M33 54 L131 54 L148 58 L32 59 Z');
 surface(ctx,installed('Trim'),'M119 104 Q139 111 152 123 L144 125 Z M161 87 Q173 125 193 148 Q202 159 224 164 L355 184 L354 193 L204 172 Q192 168 184 156 Z');
 surface(ctx,installed('Front Bumper · Material'),'M483 185 L500 207 Q507 222 515 219 L532 183 L610 178 L612 183 L538 190 L524 227 L511 232 L497 219 Z');
 const skirts=equipped('Side Skirts');
 if(skirts&&skirts.t!==569){
  ctx.fillStyle='#25292bea';ctx.strokeStyle='#778083';ctx.lineWidth=1.1;
  const path=new Path2D('M131 192 Q216 205 351 221 L355 226 Q218 216 131 199 Z');ctx.fill(path);ctx.stroke(path);
  if([572,573,574].includes(skirts.t)){ctx.beginPath();ctx.moveTo(333,220);ctx.lineTo(347,209);ctx.lineTo(350,226);ctx.closePath();ctx.fill();}
 }
 const splitter=equipped('Splitters');
 if(splitter&&splitter.t!==472){const path=new Path2D('M502 228 Q556 242 623 235 L699 215 L702 220 Q610 254 509 238 Z');ctx.fillStyle='#1b1d20';ctx.fill(path);ctx.strokeStyle='#565d61';ctx.lineWidth=1.2;ctx.stroke(path);}
 const roof=equipped('Roof Attachments');
 if(roof&&roof.t!==539){
  ctx.fillStyle='#151719';ctx.strokeStyle='#6d7375';ctx.lineWidth=1.2;
  const path=new Path2D(roof.t===542?'M213 28 Q221 7 267 3 Q323 -1 357 12 Q367 19 359 24 L238 32 Z':'M208 35 L210 27 L275 18 L334 18 L338 22 L267 22 L216 31 L217 34 Z');ctx.fill(path);ctx.stroke(path);
 }
 const hood=equipped('Hood · Style');
 if(hood&&hood.t!==427){
  ctx.fillStyle='#11181dd4';const path=new Path2D('M503 95 L541 99 L554 104 L526 101 Z M552 92 L576 95 L586 99 L564 96 Z');ctx.fill(path);
  if(hood.t===432){ctx.fill(new Path2D('M514 103 L551 109 L543 111 L522 106 Z'));}
 }
 const lights=equipped('Lights');
 if(lights){ctx.strokeStyle=({558:'#fff7d5',559:'#e8f8ff',560:'#fff28a',562:'#c2ae5e',566:'#b7d7e9'})[lights.t];ctx.globalAlpha=.8;ctx.lineWidth=2.1;ctx.beginPath();ctx.moveTo(474,132);ctx.quadraticCurveTo(504,140,546,149);ctx.stroke();ctx.globalAlpha=1;}
 if(equipped('Roll Cage')?.t===718){ctx.strokeStyle='#8b969b78';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(215,52);ctx.lineTo(265,85);ctx.moveTo(271,51);ctx.lineTo(235,84);ctx.stroke();}
 ctx.restore();
}
