import {escapeHTML} from './core.js';
import {loadGeography,projectLocation as project} from './geography.js';
const NS='http://www.w3.org/2000/svg';
const ALIASES={'Türkiye':'Turkey','United States':'United States of America'};
export async function createMap(container,programmes,onSelect,icon) {
  const svg=container.querySelector('.world-map'),info=container.querySelector('.map-info'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let items=programmes,selected=null,drag=null,moved=false,frame=0,destroyed=false,camera={scale:1,cx:500,cy:255};
  const paths=await loadGeography();
  svg.innerHTML='<title>Explore programme locations. Drag to move, scroll to zoom, or use the map controls.</title><g class="map-graticule" aria-hidden="true"></g><g class="geography" aria-hidden="true">'+paths.map(p=>`<path class="land" data-region="${escapeHTML(p.name)}" d="${p.d}"/>`).join('')+'</g><g class="continent-layer" aria-hidden="true"></g><g class="marker-layer"></g>';
  const geography=svg.querySelector('.geography'),layer=svg.querySelector('.marker-layer');
  function dimensions(){const r=svg.getBoundingClientRect();return {width:Math.max(200,r.width),height:Math.max(200,r.height),aspect:Math.max(200,r.height)/Math.max(200,r.width)};}
  function cluster(){const groups=[],threshold=28*1000/dimensions().width/camera.scale;for(const p of items){const [x,y]=project(p),g=groups.find(g=>Math.hypot(g.x-x,g.y-y)<threshold);if(g){g.items.push(p);g.x=g.items.reduce((sum,p)=>sum+project(p)[0],0)/g.items.length;g.y=g.items.reduce((sum,p)=>sum+project(p)[1],0)/g.items.length;}else groups.push({x,y,items:[p]});}return groups;}
  function background(){
    const d=dimensions(),factor=1000/d.width/camera.scale;
    svg.querySelector('.map-graticule').innerHTML=Array.from({length:11},(_,i)=>`<path d="M${i*100},-800V1400"/>`).join('')+Array.from({length:9},(_,i)=>`<path d="M-1000,${i*100-150}H2000"/>`).join('');
    const labels=[['NORTH AMERICA',225,120],['SOUTH AMERICA',350,366],['EUROPE',540,82],['AFRICA',551,302],['ASIA',756,142],['OCEANIA',895,401]],continents=svg.querySelector('.continent-layer');continents.style.opacity=camera.scale>2?'0':'.6';continents.innerHTML=labels.map(([name,x,y])=>`<text x="${x}" y="${y}" text-anchor="middle" style="font-size:${9*factor}px;letter-spacing:${1.8*factor}px">${name}</text>`).join('');
  }
  function markers(){
    const factor=1000/dimensions().width/camera.scale;layer.replaceChildren();
    for(const g of cluster()){
      const multi=g.items.length>1,p=g.items[0],node=document.createElementNS(NS,'g');node.classList.add('map-marker');if(g.items.some(p=>p.id===selected))node.classList.add('selected');node.setAttribute('transform',`translate(${g.x},${g.y})`);node.setAttribute('tabindex','0');node.setAttribute('role','button');node.setAttribute('aria-label',multi?`Zoom to ${g.items.length} programmes: ${g.items.map(p=>p.university).join(', ')}`:`View ${p.title} at ${p.university}`);
      const r=(multi?15:9)*factor;node.innerHTML=`<title>${escapeHTML(multi?`${g.items.length} programmes — explore closer`:p.university+' · '+p.title)}</title><circle class="marker-hit" fill="transparent" r="${23*factor}"/><circle class="marker-shadow" r="${r+5*factor}"/><circle class="marker-core" r="${r}"/>`+(multi?`<text text-anchor="middle" dominant-baseline="central" fill="white" style="font-size:${11*factor}px;font-weight:650" pointer-events="none">${g.items.length}</text>`:`<circle class="marker-center" r="${3*factor}"/>`);
      if(camera.scale>2.5&&!multi)node.innerHTML+=`<text class="marker-label" x="${15*factor}" y="${4*factor}" style="font-size:${11*factor}px;stroke-width:${5*factor}px">${escapeHTML(p.city.split(' · ')[0])}</text>`;
      const select=()=>{if(moved)return;if(multi)flyTo({scale:Math.min(28,camera.scale*2.35),cx:g.x,cy:g.y});else{selected=p.id;onSelect(p.id);}};
      node.addEventListener('click',select);node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});node.addEventListener('mouseenter',()=>{info.innerHTML=`<span class="map-info-icon">${icon('pin')}</span><div><strong>${escapeHTML(multi?g.items.length+' programmes to discover':p.university)}</strong><small>${escapeHTML(multi?'Select to explore closer':p.city+', '+p.country)}</small></div>`;});layer.append(node);
    }
  }
  function redraw(){if(destroyed)return;const {aspect}=dimensions(),w=1000/camera.scale,h=w*aspect;camera.cx=Math.max(-50,Math.min(1050,camera.cx));camera.cy=Math.max(-180,Math.min(690,camera.cy));svg.setAttribute('viewBox',`${camera.cx-w/2} ${camera.cy-h/2} ${w} ${h}`);background();markers();}
  function flyTo(target,duration=850){
    cancelAnimationFrame(frame);if(reduced.matches){camera={...target};redraw();return;}
    const start={...camera},time=performance.now(),animate=now=>{if(destroyed)return;const t=Math.min(1,(now-time)/duration),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;camera={scale:start.scale+(target.scale-start.scale)*ease,cx:start.cx+(target.cx-start.cx)*ease,cy:start.cy+(target.cy-start.cy)*ease};redraw();if(t<1)frame=requestAnimationFrame(animate);};frame=requestAnimationFrame(animate);
  }
  function focusProgramme(p){selected=p.id;const [x,y]=project(p),scale=Math.max(4.6,camera.scale);flyTo({scale,cx:x,cy:y+(innerWidth<720?1000/scale*dimensions().aspect*.17:0)});}
  function zoom(mult){flyTo({...camera,scale:Math.max(1,Math.min(28,camera.scale*mult))},400);}
  container.querySelector('[data-map="plus"]').onclick=()=>zoom(1.55);container.querySelector('[data-map="minus"]').onclick=()=>zoom(1/1.55);container.querySelector('[data-map="reset"]').onclick=()=>{selected=null;flyTo({scale:1,cx:500,cy:255},1000);};container.parentElement.querySelector('[data-map="europe"]').onclick=()=>{const [cx,cy]=project({lon:12,lat:51});flyTo({scale:3.7,cx,cy});};
  const pointerDown=event=>{if(event.button!==0)return;cancelAnimationFrame(frame);drag={x:event.clientX,y:event.clientY,camera:{...camera}};moved=false;};
  const pointerMove=event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;if(moved){if(!svg.hasPointerCapture(event.pointerId))svg.setPointerCapture(event.pointerId);const ratio=1000/drag.camera.scale/dimensions().width;camera={...drag.camera,cx:drag.camera.cx-dx*ratio,cy:drag.camera.cy-dy*ratio};redraw();}};
  const pointerUp=event=>{drag=null;if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);setTimeout(()=>moved=false,0);};
  const wheel=event=>{event.preventDefault();zoom(Math.exp(-Math.max(-90,Math.min(90,event.deltaY))*.003));};
  const keyboard=event=>{if(event.target!==svg)return;const offset=70/camera.scale;if(event.key==='+'||event.key==='='){event.preventDefault();zoom(1.55);}else if(event.key==='-'){event.preventDefault();zoom(1/1.55);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();flyTo({...camera,cx:camera.cx+(event.key==='ArrowRight'?offset:event.key==='ArrowLeft'?-offset:0),cy:camera.cy+(event.key==='ArrowDown'?offset:event.key==='ArrowUp'?-offset:0)},200);}};
  svg.addEventListener('pointerdown',pointerDown);svg.addEventListener('pointermove',pointerMove);svg.addEventListener('pointerup',pointerUp);svg.addEventListener('pointercancel',pointerUp);svg.addEventListener('wheel',wheel,{passive:false});svg.addEventListener('keydown',keyboard);window.addEventListener('resize',redraw);redraw();
  return {update(list){items=list;const countries=new Set(items.map(p=>ALIASES[p.country]||p.country));geography.querySelectorAll('.land').forEach(path=>path.classList.toggle('has-programmes',countries.has(path.dataset.region)));redraw();if(!items.length)info.innerHTML='<div><strong>A different direction?</strong><small>Try broadening your filters.</small></div>';},focus:focusProgramme,focusCountry(list){if(!list.length)return;const points=list.map(project);flyTo({scale:3.5,cx:points.reduce((s,p)=>s+p[0],0)/points.length,cy:points.reduce((s,p)=>s+p[1],0)/points.length});},destroy(){destroyed=true;cancelAnimationFrame(frame);svg.removeEventListener('pointerdown',pointerDown);svg.removeEventListener('pointermove',pointerMove);svg.removeEventListener('pointerup',pointerUp);svg.removeEventListener('pointercancel',pointerUp);svg.removeEventListener('wheel',wheel);svg.removeEventListener('keydown',keyboard);window.removeEventListener('resize',redraw);}};
}
