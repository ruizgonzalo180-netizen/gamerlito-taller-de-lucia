'use strict';
const drive=document.getElementById('drive');
const play=document.getElementById('play');
const {original,avc,fallback}=drive.dataset;
const urls=[];
if(drive.canPlayType('video/mp4; codecs="vp09.00.51.08"')) urls.push(original);
if(drive.canPlayType('video/mp4; codecs="avc1.640034"')) urls.push(avc);
if(fallback)urls.push(fallback);
let source=0,timer=0,lastTime=0;
function attempt(){
 drive.play().catch(error=>{
  if(error.name==='NotAllowedError'){clearTimeout(timer);play.textContent='Play';play.hidden=false;}
 });
}
function watch(){
 clearTimeout(timer);
 if(source<urls.length-1)timer=setTimeout(next,12000);
}
function load(){
 clearTimeout(timer);play.hidden=true;
 drive.src=urls[source];drive.load();attempt();watch();
}
function next(){
 clearTimeout(timer);lastTime=Math.max(lastTime,drive.currentTime||0);
 if(++source<urls.length){load();return;}
 play.textContent='Try again';play.hidden=false;
}
drive.addEventListener('loadedmetadata',()=>{if(lastTime>0)drive.currentTime=Math.min(lastTime,drive.duration-.2);});
drive.addEventListener('playing',()=>{clearTimeout(timer);play.hidden=true;lastTime=0;});
drive.addEventListener('waiting',()=>{if(!drive.paused)watch();});
drive.addEventListener('error',next);
drive.addEventListener('click',()=>{if(drive.paused)attempt();});
play.addEventListener('click',()=>{if(source>=urls.length){source=0;load();}else attempt();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&drive.paused&&source<urls.length)attempt();});
load();
