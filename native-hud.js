export const decks={
 'Pro Builds':{t:297,rows:['Full Kits','Wheel Kits']},
 'Cosmetics':{t:372,rows:['Respray','Customizable Liveries','Decals','Underglow','Plates']},
 'Bodywork':{t:426,rows:['Hood','Spoiler','Front Bumper','Rear Bumper','Towing','Mirrors','Windows','Roof','Trim','Lights','Side Skirts','Exhaust']},
 'Performance':{t:600,rows:['Full Engine','Induction','Transmission','Boost']},
 'Wheels':{t:639,rows:['Tire Style','Rim Style','Rim Colors','Calipers']},
 'Interior':{t:699,rows:['Steering Wheel','Seats','Roll Cage','Upholstery Material','Upholstery Color','Stitching','Cabin Trim']}
};
export const submenus={
 Hood:{t:434,rows:['Hood · Style','Hood · Material','Hood Catches']},
 'Front Bumper':{t:455,rows:['Front Bumper · Material','Splitters']},
 'Rear Bumper':{t:484,rows:['Rear Bumper · Material','Diffuser']},
 Roof:{t:544,rows:['Roof · Material','Roof Attachments']},
 Exhaust:{t:580,rows:['Exhaust · Material','Exhaust · Flames']},
 Underglow:{t:404,rows:['Underglow · Front','Underglow · Side','Underglow · Back']}
};
export function target(root,name,x,y,w,h,fn,visible=''){
 const b=document.createElement('button');b.type='button';b.className='ref-hit';b.setAttribute('aria-label',name);b.title=name;b.textContent=visible;
 Object.assign(b.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
 b.addEventListener('click',fn);root.append(b);return b;
}
export function bindStrip(root,items,index,select){
 const page=Math.max(0,Math.min(items.length-6,index-3)),list=items.slice(page,page+6);
 const box=document.createElement('div');box.className='ref-strip';root.append(box);
 for(const item of list){
  const i=items.indexOf(item),b=document.createElement('button');b.title=item.name;b.setAttribute('aria-label',item.name);b.setAttribute('aria-pressed',String(index===i));
  const im=document.createElement('img');im.alt='';im.src='entry/chips/'+item.t+'.jpg';b.append(im);
  b.onclick=()=>select(i);box.append(b);
 }
}
export const hasStrip=part=>['Respray','Decals','Plates','Rim Colors','Rim Style','Tire Style','Windows','Mirrors','Spoiler','Lights','Trim','Calipers','Upholstery Material','Upholstery Color','Stitching'].includes(part)||part.includes('Material')||part.includes('Underglow')||part.includes('Flames');
