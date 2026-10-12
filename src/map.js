import {Map,Marker,LngLat,setWorkerUrl} from './vendor/maplibre/maplibre-gl.mjs';
import {wheelIntent,gestureCamera} from './map-input.js';
import {clusterCenter,oceanSurface} from './map-geometry.js';
setWorkerUrl(new URL('./vendor/maplibre/maplibre-gl-worker.mjs',import.meta.url).href);
const ALIASES={'Türkiye':'Turkey','United States':'United States of America','Hong Kong':'Hong Kong S.A.R.','Tanzania':'United Republic of Tanzania','Serbia':'Republic of Serbia'};
const flatIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z" stroke-linejoin="round"/><path d="M9 3v16M15 5v16"/></svg>';
const globeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';

export async function createMap(container,programmes,onSelect,onCluster) {
  const canvas=container.querySelector('.map-canvas'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let items=programmes,selected=null,markers=[],destroyed=false,gesture=null,projection='globe',globeCamera=null;
  const initialZoom=Math.max(.4,Math.log2(Math.min(canvas.clientWidth,canvas.clientHeight)*.88*Math.PI/512));
  const map=new Map({
    container:canvas,center:[15,22],zoom:initialZoom,minZoom:.4,maxZoom:12,maxPitch:0,
    attributionControl:false,scrollZoom:false,touchZoomRotate:true,touchPitch:false,dragRotate:true,keyboard:true,renderWorldCopies:false,canvasContextAttributes:{antialias:true},
    style:{version:8,projection:{type:'globe'},
      sky:{'sky-color':'#142d3b','horizon-color':'#cce4ee','sky-horizon-blend':0,'atmosphere-blend':['interpolate',['linear'],['zoom'],0,.3,5,.3,7,0]},
      sources:{ocean:{type:'geojson',data:oceanSurface()},countries:{type:'geojson',data:new URL('./assets/countries.geojson',import.meta.url).href}},
      layers:[
        {id:'flat-water',type:'background',layout:{visibility:'none'},paint:{'background-color':'#c4dce7'}},
        {id:'water',type:'fill',source:'ocean',paint:{'fill-color':'#c4dce7','fill-antialias':false}},
        {id:'land',type:'fill',source:'countries',paint:{'fill-color':'#e4eada'}},
        {id:'catalogue-countries',type:'fill',source:'countries',filter:['in','name',''],paint:{'fill-color':'#cbdcbc'}},
        {id:'borders',type:'line',source:'countries',paint:{'line-color':'#f5f7ed','line-width':.8}}
      ]}
  });
  map.getCanvas().setAttribute('aria-label','World map. Drag to pan. Use two fingers to move, pinch to zoom, or the zoom buttons. Shift and drag to rotate.');
  const projectionButton=container.querySelector('[data-map="projection"]');
  projectionButton.disabled=true;
  function cameraState(){
    const center=map.getCenter();canvas.dataset.zoom=map.getZoom().toFixed(3);canvas.dataset.center=`${center.lng.toFixed(3)},${center.lat.toFixed(3)}`;canvas.dataset.bearing=map.getBearing().toFixed(2);canvas.dataset.projection=projection;
    container.querySelector('.compass').style.transform=`rotate(${-map.getBearing()}deg)`;
  }
  function move(options){map.easeTo({...options,duration:reduced.matches?0:500});}
  function groups(){
    const grouped=[],center=map.getCenter(),rad=Math.PI/180;
    for(const p of items){
      // Back-of-globe points must never join a visible cluster. Flat maps show both hemispheres.
      const front=Math.sin(p.lat*rad)*Math.sin(center.lat*rad)+Math.cos(p.lat*rad)*Math.cos(center.lat*rad)*Math.cos((p.lon-center.lng)*rad);
      if(projection==='globe'&&map.getZoom()<5&&front<.02)continue;
      const xy=map.project([p.lon,p.lat]);
      if(xy.x< -35||xy.x>canvas.clientWidth+35||xy.y< -35||xy.y>canvas.clientHeight+35)continue;
      const group=grouped.find(g=>Math.hypot(g.x-xy.x,g.y-xy.y)<25);
      if(group)group.items.push(p);else grouped.push({x:xy.x,y:xy.y,items:[p]});
    }
    return grouped;
  }
  function redrawMarkers(){
    if(destroyed)return;
    markers.forEach(marker=>marker.remove());markers=[];
    for(const group of groups()){
      const multi=group.items.length>1,p=group.items[0],button=document.createElement('button');
      const [lng,lat]=clusterCenter(group.items);
      const span=Math.max(...group.items.map(p=>((p.lon-lng+540)%360)-180))-Math.min(...group.items.map(p=>((p.lon-lng+540)%360)-180))+Math.max(...group.items.map(p=>p.lat))-Math.min(...group.items.map(p=>p.lat));
      const choose=multi&&(span<.05||map.getZoom()>=7);button.className='atlas-pin'+(multi?' cluster':'')+(group.items.some(p=>p.id===selected)?' selected':'');
      button.setAttribute('aria-label',multi?`${choose?'Choose from':'Zoom to'} ${group.items.length} programmes: ${[...new Set(group.items.map(p=>p.university))].join(', ')}`:`View ${p.title} at ${p.university}`);
      const dot=document.createElement('span');dot.className='pin-dot';dot.textContent=multi?group.items.length:'';button.append(dot);
      const label=document.createElement('span');label.className='pin-label';label.textContent=multi?`${group.items.length} programmes`:p.university;button.append(label);
      button.onclick=()=>{if(choose)onCluster?.(group.items);else if(multi)move({center:[lng,lat],zoom:Math.min(12,map.getZoom()+1.6)});else{selected=p.id;onSelect(p.id);}};
      markers.push(new Marker({element:button,anchor:'center',locationOccludedOpacity:0}).setLngLat([lng,lat]).addTo(map));
    }
  }
  function update(list){items=list;if(map.getLayer('catalogue-countries'))map.setFilter('catalogue-countries',['in','name',...new Set(items.map(p=>ALIASES[p.country]||p.country)),'']);redrawMarkers();}
  const bounds=()=>({minZoom:map.getMinZoom(),maxZoom:map.getMaxZoom()});
  const wheel=event=>{event.preventDefault();if(gesture)return;map.stop();const intent=wheelIntent(event,map.getZoom(),bounds());if(intent.type==='pan'){const center=map.unproject([canvas.clientWidth/2+intent.offset[0],canvas.clientHeight/2+intent.offset[1]]);map.jumpTo({center,zoom:map.getZoom()});}else{const rect=canvas.getBoundingClientRect();map.zoomTo(intent.zoom,{around:map.unproject([event.clientX-rect.left,event.clientY-rect.top]),duration:0});}};
  // Safari exposes trackpad pinch and twist through its native gesture events.
  const gestureStart=event=>{event.preventDefault();map.stop();gesture={zoom:map.getZoom(),bearing:map.getBearing()};};
  const gestureChange=event=>{event.preventDefault();if(gesture)map.jumpTo(gestureCamera(gesture,event,bounds()));};
  const gestureEnd=event=>{event.preventDefault();gesture=null;};
  canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('gesturestart',gestureStart,{passive:false});canvas.addEventListener('gesturechange',gestureChange,{passive:false});canvas.addEventListener('gestureend',gestureEnd,{passive:false});
  projectionButton.onclick=()=>{
    map.stop();
    if(projection==='globe'){
      globeCamera={center:map.getCenter(),zoom:map.getZoom(),bearing:map.getBearing()};projection='mercator';map.setMinZoom(-2);map.setProjection({type:projection});
      // The default Mercator constraint fills viewport height, clipping continents on portrait screens.
      map.setTransformConstrain((center,zoom)=>({center:new LngLat(Math.max(-180,Math.min(180,center.lng)),Math.max(-85,Math.min(85,center.lat))),zoom:Math.max(-2,Math.min(12,zoom))}));
      map.fitBounds([[-180,-62],[180,80]],{padding:{top:90,bottom:40,left:24,right:64},bearing:0,duration:reduced.matches?0:650});
    }else{
      projection='globe';map.setTransformConstrain(null);map.setProjection({type:projection});map.setMinZoom(.4);move(globeCamera||{center:[15,22],zoom:initialZoom,bearing:0});
    }
    map.setLayoutProperty('flat-water','visibility',projection==='mercator'?'visible':'none');
    container.classList.toggle('flat-map',projection==='mercator');
    map.setSky({'sky-color':projection==='globe'?'#142d3b':'#c4dce7','horizon-color':'#cce4ee','sky-horizon-blend':0,'atmosphere-blend':projection==='globe'?['interpolate',['linear'],['zoom'],0,.3,5,.3,7,0]:0});
    projectionButton.innerHTML=projection==='globe'?flatIcon:globeIcon;
    const label=projection==='globe'?'Show all continents':'Show 3D globe';projectionButton.setAttribute('aria-label',label);projectionButton.title=label;cameraState();redrawMarkers();
  };
  container.querySelector('[data-map="plus"]').onclick=()=>move({zoom:Math.min(map.getMaxZoom(),map.getZoom()+1)});
  container.querySelector('[data-map="minus"]').onclick=()=>move({zoom:Math.max(map.getMinZoom(),map.getZoom()-1)});
  container.querySelector('[data-map="north"]').onclick=()=>move({bearing:0});
  map.on('move',cameraState);map.on('moveend',redrawMarkers);map.on('load',()=>{update(items);projectionButton.disabled=false;canvas.classList.add('map-ready');});cameraState();
  const resize=new ResizeObserver(()=>map.resize());resize.observe(canvas);
  return {update,focus(p){selected=p.id;move({center:[p.lon,p.lat],zoom:Math.max(3,map.getZoom()),offset:innerWidth>900?[-150,0]:[0,-80]});redrawMarkers();},focusCountry(list){if(!list.length)return;if(list.length===1){move({center:[list[0].lon,list[0].lat],zoom:4});return;}map.fitBounds([[Math.min(...list.map(p=>p.lon)),Math.min(...list.map(p=>p.lat))],[Math.max(...list.map(p=>p.lon)),Math.max(...list.map(p=>p.lat))]],{padding:120,maxZoom:5,duration:reduced.matches?0:600});},destroy(){destroyed=true;resize.disconnect();markers.forEach(marker=>marker.remove());canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('gesturestart',gestureStart);canvas.removeEventListener('gesturechange',gestureChange);canvas.removeEventListener('gestureend',gestureEnd);map.remove();}};
}
