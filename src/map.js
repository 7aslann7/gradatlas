import {Map,Popup,LngLat,setWorkerUrl} from './vendor/maplibre/maplibre-gl.mjs';
import {wheelIntent,gestureCamera} from './map-input.js';
import {clusterCenter,minimumFlatZoom,flatViewportCamera,oceanSurface} from './map-geometry.js';
setWorkerUrl(new URL('./vendor/maplibre/maplibre-gl-worker.mjs',import.meta.url).href);
const ALIASES={'Türkiye':'Turkey','United States':'United States of America','Hong Kong':'Hong Kong S.A.R.','Tanzania':'United Republic of Tanzania','Serbia':'Republic of Serbia'};
const flatIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z" stroke-linejoin="round"/><path d="M9 3v16M15 5v16"/></svg>';
const globeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';

export async function createMap(container,programmes,onSelect,onCluster) {
  const canvas=container.querySelector('.map-canvas'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let items=programmes,selected=null,destroyed=false,gesture=null,projection='globe',globeCamera=null,revision=0;
  const initialZoom=()=>Math.max(.4,Math.log2(Math.min(canvas.clientWidth,canvas.clientHeight)*.88*Math.PI/512));
  const points=()=>({type:'FeatureCollection',features:items.map(p=>({type:'Feature',id:p.id,properties:{id:p.id,title:p.title,university:p.university,selected:p.id===selected?1:0},geometry:{type:'Point',coordinates:[p.lon,p.lat]}}))});
  const map=new Map({
    container:canvas,center:[15,22],zoom:initialZoom(),minZoom:.4,maxZoom:12,maxPitch:0,
    attributionControl:false,scrollZoom:false,touchZoomRotate:true,touchPitch:false,dragRotate:true,keyboard:true,renderWorldCopies:false,fadeDuration:0,canvasContextAttributes:{antialias:true},
    style:{version:8,projection:{type:'globe'},
      sky:{'sky-color':'#142d3b','horizon-color':'#cce4ee','sky-horizon-blend':0,'atmosphere-blend':['interpolate',['linear'],['zoom'],0,.3,5,.3,7,0]},
      sources:{ocean:{type:'geojson',data:oceanSurface()},countries:{type:'geojson',data:new URL('./assets/countries.geojson',import.meta.url).href},programmes:{type:'geojson',data:points(),cluster:true,clusterRadius:50,clusterMaxZoom:9,clusterProperties:{selected_count:['+',['get','selected']]}}},
      layers:[
        {id:'flat-water',type:'background',layout:{visibility:'none'},paint:{'background-color':'#c4dce7'}},
        {id:'water',type:'fill',source:'ocean',paint:{'fill-color':'#c4dce7','fill-antialias':false}},
        {id:'land',type:'fill',source:'countries',paint:{'fill-color':'#e4eada'}},
        {id:'catalogue-countries',type:'fill',source:'countries',filter:['in','name',''],paint:{'fill-color':'#cbdcbc'}},
        {id:'borders',type:'line',source:'countries',paint:{'line-color':'#f5f7ed','line-width':.8}},
        {id:'programme-clusters',type:'circle',source:'programmes',filter:['has','point_count'],paint:{'circle-color':['case',['>', ['get','selected_count'],0],'#b78150','#365a46'],'circle-radius':16,'circle-stroke-width':2,'circle-stroke-color':'#fffdf4'}},
        {id:'programme-counts',type:'symbol',source:'programmes',filter:['has','point_count'],layout:{'icon-image':['concat','count-',['to-string',['get','point_count']]],'icon-size':.5,'icon-allow-overlap':true,'icon-ignore-placement':true}},
        {id:'programme-points',type:'circle',source:'programmes',filter:['!',['has','point_count']],paint:{'circle-color':['case',['==',['get','selected'],1],'#b78150','#365a46'],'circle-radius':['case',['==',['get','selected'],1],8,6],'circle-stroke-width':2,'circle-stroke-color':'#fffdf4'}}
      ]}
  });
  map.getCanvas().setAttribute('aria-label','World map. Drag or use two fingers to move. Pinch to zoom. Shift and drag to rotate. Programme locations are also keyboard accessible, or use Browse programmes from the menu.');
  const projectionButton=container.querySelector('[data-map="projection"]');projectionButton.disabled=true;
  const accessible=document.createElement('div');accessible.className='map-location-links';accessible.setAttribute('role','group');accessible.setAttribute('aria-label','Visible programme locations');container.append(accessible);
  const tooltip=new Popup({closeButton:false,closeOnClick:false,offset:18,className:'map-tooltip'});
  function cameraState(){
    if(destroyed)return;const center=map.getCenter();
    Object.assign(canvas.dataset,{zoom:map.getZoom().toFixed(3),minZoom:map.getMinZoom().toFixed(3),center:`${center.lng.toFixed(3)},${center.lat.toFixed(3)}`,bearing:map.getBearing().toFixed(2),projection});
    container.querySelector('.compass').style.transform=`rotate(${-map.getBearing()}deg)`;
    container.querySelector('[data-map="minus"]').disabled=map.getZoom()<=map.getMinZoom()+.001;
    container.querySelector('[data-map="plus"]').disabled=map.getZoom()>=map.getMaxZoom()-.001;
  }
  function move(options){map.easeTo({...options,padding:0,duration:reduced.matches?0:500});}
  function setFlatBounds(adjustOverview=false){if(projection!=='mercator')return;const previous=map.getMinZoom(),overview=Math.abs(map.getZoom()-previous)<.01,min=minimumFlatZoom(canvas.clientWidth,canvas.clientHeight,map.getBearing());if(Math.abs(previous-min)>.001){map.setMinZoom(min);if(adjustOverview&&overview)map.jumpTo({zoom:min});}cameraState();}
  function home(){move({center:[15,22],zoom:projection==='globe'?initialZoom():minimumFlatZoom(canvas.clientWidth,canvas.clientHeight),bearing:0});}
  function update(list){
    items=list;revision++;tooltip.remove();
    if(map.getLayer('catalogue-countries'))map.setFilter('catalogue-countries',['in','name',...new Set(items.map(p=>ALIASES[p.country]||p.country)),'']);
    map.getSource('programmes')?.setData(points());
  }
  async function activate(feature){
    if(!feature||destroyed||!map.isSourceLoaded('programmes'))return;
    tooltip.remove();const startRevision=revision;
    if(!feature.properties.cluster){selected=feature.properties.id;onSelect(selected);return;}
    try{
      const source=map.getSource('programmes'),id=Number(feature.properties.cluster_id);
      const leaves=await source.getClusterLeaves(id,Number(feature.properties.point_count),0);
      if(destroyed||revision!==startRevision)return;
      const ids=new Set(leaves.map(f=>f.properties.id)),list=items.filter(p=>ids.has(p.id));
      if(!list.length)return;
      const [lng]=clusterCenter(list),longitudes=list.map(p=>((p.lon-lng+540)%360)-180);
      const span=Math.max(...longitudes)-Math.min(...longitudes)+Math.max(...list.map(p=>p.lat))-Math.min(...list.map(p=>p.lat));
      if(span<.05||map.getZoom()>=7)onCluster?.(list);
      else{const zoom=await source.getClusterExpansionZoom(id);if(!destroyed&&revision===startRevision)move({center:feature.geometry.coordinates,zoom:Math.min(12,Math.max(map.getZoom()+1,zoom+.15))});}
    }catch{/* A filtered source may have replaced this cluster while the request was in flight. */}
  }
  function accessibleLocations(){
    if(destroyed||!map.getLayer('programme-points'))return;
    const unique=new Set(),center=map.getCenter(),rad=Math.PI/180;accessible.replaceChildren();
    for(const f of map.queryRenderedFeatures({layers:['programme-clusters','programme-points']})){
      const key=f.properties.cluster?'c'+f.properties.cluster_id:f.properties.id;if(unique.has(key))continue;unique.add(key);
      const [lon,lat]=f.geometry.coordinates;
      if(projection==='globe'&&map.getZoom()<5&&Math.sin(lat*rad)*Math.sin(center.lat*rad)+Math.cos(lat*rad)*Math.cos(center.lat*rad)*Math.cos((lon-center.lng)*rad)<.02)continue;
      const xy=map.project([lon,lat]);if(xy.x<0||xy.y<0||xy.x>canvas.clientWidth||xy.y>canvas.clientHeight)continue;
      const button=document.createElement('button');button.type='button';button.className='map-accessible-pin';button.dataset.count=f.properties.point_count||1;
      button.textContent=f.properties.cluster?`Explore ${f.properties.point_count} programmes in this area`:`View ${f.properties.title} at ${f.properties.university}`;
      button.onclick=()=>activate(f);accessible.append(button);
    }
  }
  // Count labels are generated locally; no glyph service or moving HTML markers are needed.
  map.setMissingStyleImageResolver(id=>{
    if(!/^count-\d+$/.test(id)||map.hasImage(id))return;const count=id.slice(6),label=document.createElement('canvas');label.width=label.height=64;
    const context=label.getContext('2d');context.fillStyle='#fff';context.font=`600 ${count.length>2?22:25}px Arial`;context.textAlign='center';context.textBaseline='middle';context.fillText(count,32,33);map.addImage(id,context.getImageData(0,0,64,64));
  });
  for(const layer of ['programme-clusters','programme-points']){
    map.on('click',layer,event=>activate(event.features?.[0]));
    map.on('mouseenter',layer,event=>{const f=event.features?.[0];if(!f)return;map.getCanvas().style.cursor='pointer';tooltip.setLngLat(f.geometry.coordinates).setText(f.properties.cluster?`${f.properties.point_count} programmes · select to explore`:f.properties.university).addTo(map);});
    map.on('mouseleave',layer,()=>{map.getCanvas().style.cursor='';tooltip.remove();});
  }
  const bounds=()=>({minZoom:map.getMinZoom(),maxZoom:map.getMaxZoom()});
  const wheel=event=>{event.preventDefault();if(gesture)return;map.stop();const intent=wheelIntent(event,map.getZoom(),bounds());if(intent.type==='pan'){const center=map.unproject([canvas.clientWidth/2+intent.offset[0],canvas.clientHeight/2+intent.offset[1]]);map.jumpTo({center,zoom:map.getZoom()});}else{const rect=canvas.getBoundingClientRect();map.zoomTo(intent.zoom,{around:map.unproject([event.clientX-rect.left,event.clientY-rect.top]),duration:0});}};
  const gestureStart=event=>{event.preventDefault();map.stop();gesture={zoom:map.getZoom(),bearing:map.getBearing()};};
  const gestureChange=event=>{event.preventDefault();if(gesture)map.jumpTo(gestureCamera(gesture,event,bounds()));};
  const gestureEnd=event=>{event.preventDefault();gesture=null;};
  canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('gesturestart',gestureStart,{passive:false});canvas.addEventListener('gesturechange',gestureChange,{passive:false});canvas.addEventListener('gestureend',gestureEnd,{passive:false});
  projectionButton.onclick=()=>{
    map.stop();tooltip.remove();
    if(projection==='globe'){
      globeCamera={center:map.getCenter(),zoom:map.getZoom(),bearing:map.getBearing()};projection='mercator';map.setProjection({type:projection});
      map.setTransformConstrain((center,zoom)=>{const camera=flatViewportCamera(center,zoom,{width:canvas.clientWidth,height:canvas.clientHeight,bearing:map.getBearing()});return {zoom:camera.zoom,center:new LngLat(camera.center.lng,camera.center.lat)};});
      setFlatBounds();home();
    }else{
      projection='globe';map.setTransformConstrain(null);map.setMinZoom(.4);map.setProjection({type:projection});move(globeCamera||{center:[15,22],zoom:initialZoom(),bearing:0});
    }
    map.setLayoutProperty('flat-water','visibility',projection==='mercator'?'visible':'none');container.classList.toggle('flat-map',projection==='mercator');
    map.setSky({'sky-color':projection==='globe'?'#142d3b':'#c4dce7','horizon-color':'#cce4ee','sky-horizon-blend':0,'atmosphere-blend':projection==='globe'?['interpolate',['linear'],['zoom'],0,.3,5,.3,7,0]:0});
    projectionButton.innerHTML=projection==='globe'?flatIcon:globeIcon;const label=projection==='globe'?'Show flat map':'Show 3D globe';projectionButton.setAttribute('aria-label',label);projectionButton.title=label;cameraState();
  };
  container.querySelector('[data-map="plus"]').onclick=()=>move({zoom:Math.min(map.getMaxZoom(),map.getZoom()+1)});
  container.querySelector('[data-map="minus"]').onclick=()=>move({zoom:Math.max(map.getMinZoom(),map.getZoom()-1)});
  container.querySelector('[data-map="north"]').onclick=()=>move({bearing:0});container.querySelector('[data-map="home"]').onclick=home;
  map.on('move',cameraState);map.on('rotate',()=>setFlatBounds());map.on('movestart',()=>tooltip.remove());map.on('idle',accessibleLocations);
  map.on('load',()=>{update(items);projectionButton.disabled=false;canvas.classList.add('map-ready');});cameraState();
  const resize=new ResizeObserver(()=>{map.resize();setFlatBounds(true);});resize.observe(canvas);
  return {update,focus(p){selected=p.id;update(items);move({center:[p.lon,p.lat],zoom:Math.max(3,map.getZoom()),offset:innerWidth>900?[-150,0]:[0,-80]});},focusCountry(list){if(!list.length)return;if(list.length===1){move({center:[list[0].lon,list[0].lat],zoom:4});return;}map.fitBounds([[Math.min(...list.map(p=>p.lon)),Math.min(...list.map(p=>p.lat))],[Math.max(...list.map(p=>p.lon)),Math.max(...list.map(p=>p.lat))]],{padding:120,maxZoom:5,duration:reduced.matches?0:600});},destroy(){destroyed=true;resize.disconnect();tooltip.remove();accessible.remove();canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('gesturestart',gestureStart);canvas.removeEventListener('gesturechange',gestureChange);canvas.removeEventListener('gestureend',gestureEnd);map.remove();}};
}
