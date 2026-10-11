import {escapeHTML} from './core.js';
let worldPromise;
const project=p=>[(p.lon+180)/360*1000,(85-p.lat)/150*510];
const NS='http://www.w3.org/2000/svg';
export async function createMap(container, programs, onSelect, icon) {
  const svg=container.querySelector('.world-map');
  let items=programs,scale=1,cx=500,cy=255,selected=null,drag=null,moved=false;
  const info=container.querySelector('.map-info');
  const paths=await (worldPromise ||= fetch('assets/world.json').then(r=>{if(!r.ok)throw Error('Map data unavailable');return r.json();}));
  svg.innerHTML='<title>World map of master’s programmes. Use the zoom controls, drag to pan, or select programme markers.</title><g class="geography" aria-hidden="true">'+paths.map(p=>`<path class="land" d="${p.d}"/>`).join('')+'</g><g class="marker-layer"></g>';
  function clusters(){
    const groups=[];
    const pixelFactor=1000/Math.max(200,svg.getBoundingClientRect().width);
    for(const p of items){const [x,y]=project(p);let g=groups.find(g=>Math.hypot(g.x-x,g.y-y)<25*pixelFactor/scale);if(g){g.items.push(p);g.x=g.items.reduce((s,p)=>s+project(p)[0],0)/g.items.length;g.y=g.items.reduce((s,p)=>s+project(p)[1],0)/g.items.length;}else groups.push({x,y,items:[p]});}
    return groups;
  }
  function redraw(){
    const w=1000/scale,h=510/scale;
    cx=Math.max(w/2-70,Math.min(1000-w/2+70,cx));cy=Math.max(h/2-30,Math.min(510-h/2+30,cy));
    svg.setAttribute('viewBox',`${cx-w/2} ${cy-h/2} ${w} ${h}`);
    const layer=svg.querySelector('.marker-layer');
    layer.replaceChildren();
    for(const g of clusters()){
      const multi=g.items.length>1,p=g.items[0];
      const node=document.createElementNS(NS,'g');node.classList.add('map-marker');
      if(g.items.some(p=>p.id===selected))node.classList.add('selected');
      node.setAttribute('transform',`translate(${g.x},${g.y})`);node.setAttribute('tabindex','0');node.setAttribute('role','button');
      node.setAttribute('aria-label',multi?`Zoom to ${g.items.length} programmes: ${g.items.map(p=>p.university).join(', ')}`:`View ${p.title} at ${p.university}`);
      const factor=1000/Math.max(200,svg.getBoundingClientRect().width)/scale;
      const r=(multi?10:6)*factor;
      node.innerHTML=`<title>${escapeHTML(multi?g.items.length+' programmes — select to zoom':p.university+' · '+p.title)}</title><circle fill="transparent" r="${19*factor}"/><circle class="marker-ring" r="${r+6*factor}"/><circle class="marker-core" r="${r}"/>`+(multi?`<text text-anchor="middle" dominant-baseline="central" fill="white" font-size="${9*factor}" font-weight="700" pointer-events="none">${g.items.length}</text>`:'');
      if(scale>1.3&&!multi){node.innerHTML+=`<text class="marker-label" x="${12*factor}" y="${4*factor}" style="font-size:${10*factor}px;stroke-width:${3*factor}px">${escapeHTML(p.city.split(' · ')[0])}</text>`;}
      const select=()=>{if(moved)return;if(multi){scale=Math.min(7,scale*2.1);cx=g.x;cy=g.y;redraw();}else{selected=p.id;redraw();onSelect(p.id);}};
      node.addEventListener('click',select);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
      node.addEventListener('mouseenter',()=>{info.innerHTML=`<span class="map-info-icon">${icon('pin')}</span><div><strong>${escapeHTML(multi?g.items.length+' programmes in this area':p.university)}</strong><small>${escapeHTML(multi?'Select the cluster to explore closer':p.city+', '+p.country)}</small></div>`;});
      layer.append(node);
    }
    if(!items.length)info.innerHTML=`<span class="map-info-icon">${icon('search')}</span><div><strong>No programmes match</strong><small>Try changing your filters</small></div>`;
    else if(!selected)info.innerHTML=`<span class="map-info-icon">${icon('globe')}</span><div><strong>A world of possibilities</strong><small>Select a pin to explore. Select a cluster to zoom.</small></div>`;
  }
  function zoom(mult){scale=Math.max(1,Math.min(7,scale*mult));if(scale===1){cx=500;cy=255;}redraw();}
  container.querySelector('[data-map="plus"]').onclick=()=>zoom(1.5);
  container.querySelector('[data-map="minus"]').onclick=()=>zoom(1/1.5);
  container.querySelector('[data-map="reset"]').onclick=()=>{scale=1;cx=500;cy=255;selected=null;redraw();};
  container.querySelector('[data-map="europe"]').onclick=()=>{scale=3.5;cx=project({lon:12,lat:51})[0];cy=project({lon:12,lat:51})[1];redraw();};
  const pointerDown=e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,cx,cy};moved=false;};
  const pointerMove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;if(moved){const ratio=1000/scale/svg.getBoundingClientRect().width;cx=drag.cx-dx*ratio;cy=drag.cy-dy*ratio;redraw();}};
  const pointerUp=()=>{drag=null;setTimeout(()=>moved=false,0);};
  svg.addEventListener('pointerdown',pointerDown);window.addEventListener('pointermove',pointerMove);window.addEventListener('pointerup',pointerUp);
  window.addEventListener('resize',redraw);
  redraw();
  return {update(list){items=list;selected=null;redraw();},destroy(){window.removeEventListener('pointermove',pointerMove);window.removeEventListener('pointerup',pointerUp);window.removeEventListener('resize',redraw);}};
}
