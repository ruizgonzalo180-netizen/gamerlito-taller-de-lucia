const byId=id=>document.getElementById(id);
const screen=byId('recorded-entry'),stage=screen.querySelector('.rec-stage');
const frame=byId('rec-frame'),film=byId('rec-open'),targets=byId('entry-targets'),launch=byId('openRoblox');
let landing='desktop',openingTimer;
function hotspot(parent,name,x,y,w,h,fn){
 const b=document.createElement('button');b.type='button';b.className='rec-hit';b.title=name;b.setAttribute('aria-label',name);
 Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});b.onclick=fn;parent.append(b);return b;
}
function navigate(action,id){
 screen.hidden=true;film.pause();window.Launcher.show('home');const root=byId('launcher');
 const target=root.querySelector('[data-lx="'+action+'"]'+(id?'[data-id="'+id+'"]':''));
 if(target)target.click();
}
function home(){
 if(landing==='home')return;
 clearTimeout(openingTimer);landing='home';screen.dataset.page='home';film.hidden=true;film.pause();frame.src='entry/home.jpg';frame.alt='Roblox Home';launch.hidden=true;targets.replaceChildren();window.JoinScreen.prepare();
 hotspot(targets,'Open game experience',7.8,48,8.5,24,()=>navigate('details','gta'));
 ['hospital','hunt','egg','mm2'].forEach((id,i)=>hotspot(targets,['Animal Hospital','The Hunt','Steal An Egg','Murder Mystery 2'][i],17+i*8.9,48,8.4,24,()=>navigate('details',id)));
 ['Throw Food For Animals','Collect Every Coin','Brookhaven RP','Barber Showdown','Summon a Pet'].forEach((name,i)=>hotspot(targets,name,7.8+i*17.7,16.5,17.2,28.2,()=>navigate('details','ref'+i)));
 hotspot(targets,'Search experiences',39,0,28,7,()=>{navigate('home');byId('lx-query').focus();});
 [['Home','home'],['Moments','moments'],['Chat','chat'],['Me','me']].forEach(([name,act],i)=>hotspot(targets,name,0,7+i*8.3,6,8.3,()=>navigate(act)));
 hotspot(targets,'Continue',7.8,43.4,14,5.2,()=>navigate('continue'));
 hotspot(targets,'Charts',15,8,8,4,()=>navigate('charts'));hotspot(targets,'Discover avatars',7.7,75,91,24,()=>navigate('me'));
}
launch.onclick=()=>{
 if(landing!=='desktop')return;landing='opening';launch.hidden=true;film.hidden=false;film.onended=home;film.onerror=home;
 film.play().catch(home);openingTimer=setTimeout(home,11500);
};
let down;
stage.addEventListener('touchstart',e=>{down=e.changedTouches[0].clientY;},{passive:true});
stage.addEventListener('touchend',e=>{if(landing==='home'&&Math.abs(e.changedTouches[0].clientY-down)>55)navigate('home');},{passive:true});
stage.addEventListener('wheel',()=>{if(landing==='home')navigate('home');},{passive:true});
window.addEventListener('keydown',e=>{if(!screen.hidden&&landing==='opening'&&e.key==='Escape')home();});
export async function joinGame(reveal){
 const root=byId('launcher');root.inert=true;root.classList.add('join-pending');
 await window.JoinScreen.prepare();
 await new Promise(resolve=>{let start;function step(now){
  start??=now;const elapsed=now-start;
  if(elapsed>=window.JoinScreen.durationMs){window.Launcher.hide();reveal();window.JoinScreen.hide();resolve();return;}
  window.JoinScreen.paint(elapsed);requestAnimationFrame(step);
 }requestAnimationFrame(step);});
 root.inert=false;root.classList.remove('join-pending');
}
