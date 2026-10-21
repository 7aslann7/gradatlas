import {Map,Popup,LngLat,setWorkerUrl} from './vendor/maplibre/maplibre-gl.mjs';
import {wheelIntent,gestureCamera} from './map-input.js';
import {clusterCenter,minimumFlatZoom,flatViewportCamera,oceanSurface,stableLocations,comparisonLocations,locationBounds} from './map-geometry.js';
setWorkerUrl(new URL('./vendor/maplibre/maplibre-gl-worker.mjs',import.meta.url).href);
const ALIASES={'Türkiye':'Turkey','United States':'United States of America','Hong Kong':'Hong Kong S.A.R.','Tanzania':'United Republic of Tanzania','Serbia':'Republic of Serbia'};
const flatIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z" stroke-linejoin="round"/><path d="M9 3v16M15 5v16"/></svg>';
const globeIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';

export async function createMap(container,programmes,onSelect,onCluster,options={}) {
  const canvas=container.querySelector('.map-canvas'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let items=stableLocations(programmes),selected=null,destroyed=false,gesture=null,screenTouches=0,projection='globe',globeCamera=null,revision=0,dataKey=null,labelZoom=-1;
  let comparison=options.comparison||[],selectionMode=false,kind=options.kind||'programmes',detailState='idle',selectionOverview=false;
  let comparisonKey=comparison.map(p=>p.id).join('|');
  const detailAbort=new AbortController(),empty=()=>({type:'FeatureCollection',features:[]});
  const comparisonData=()=>({type:'FeatureCollection',features:comparisonLocations(comparison).map(group=>({type:'Feature',id:group.id,properties:{ids:JSON.stringify(group.programmes.map(p=>p.id)),label:group.label},geometry:{type:'Point',coordinates:[group.lon,group.lat]}}))});
  // The stage fills the viewport. WebKit can report zero or pre-stylesheet
  // stage dimensions during startup, so size the initial camera from the viewport.
  const initialZoom=()=>Math.max(.4,Math.log2(Math.min(innerWidth,innerHeight)*.88*Math.PI/512));
  const points=()=>{const excluded=new Set(comparison.map(p=>p.id));return {type:'FeatureCollection',features:items.filter(p=>!excluded.has(p.id)).map(p=>({type:'Feature',id:p.id,properties:{id:p.id,title:p.title||p.name,university:p.university||p.name,kind:p.kind||'programme',selected:p.id===selected?1:0},geometry:{type:'Point',coordinates:[p.lon,p.lat]}}))};};
  const map=new Map({
    container:canvas,center:[15,22],zoom:initialZoom(),minZoom:.4,maxZoom:12,maxPitch:0,
    attributionControl:false,scrollZoom:false,touchZoomRotate:true,touchPitch:false,dragRotate:true,keyboard:true,renderWorldCopies:false,fadeDuration:0,canvasContextAttributes:{antialias:true},
    style:{version:8,projection:{type:'globe'},
      sky:{'sky-color':'#142d3b','horizon-color':'#cce4ee','sky-horizon-blend':0,'atmosphere-blend':['interpolate',['linear'],['zoom'],0,.3,5,.3,7,0]},
      sources:{ocean:{type:'geojson',data:oceanSurface()},countries:{type:'geojson',data:new URL('./assets/countries.geojson',import.meta.url).href},'country-labels':{type:'geojson',data:new URL('./assets/country-labels.geojson',import.meta.url).href},cities:{type:'geojson',data:empty()},regions:{type:'geojson',data:empty()},lakes:{type:'geojson',data:empty()},comparison:{type:'geojson',data:comparisonData()},programmes:{type:'geojson',data:points(),cluster:true,clusterRadius:50,clusterMaxZoom:9,clusterProperties:{selected_count:['+',['get','selected']],institution_count:['+',['case',['==',['get','kind'],'institution'],1,0]]}}},
      layers:[
        {id:'flat-water',type:'background',layout:{visibility:'none'},paint:{'background-color':'#c4dce7'}},
        {id:'water',type:'fill',source:'ocean',paint:{'fill-color':'#c4dce7','fill-antialias':false}},
        {id:'land',type:'fill',source:'countries',paint:{'fill-color':'#e4eada'}},
        {id:'catalogue-countries',type:'fill',source:'countries',filter:['in','name',''],paint:{'fill-color':'#cbdcbc'}},
        {id:'lakes',type:'fill',source:'lakes',minzoom:3.5,paint:{'fill-color':'#c4dce7'}},
        {id:'region-borders',type:'line',source:'regions',minzoom:4.5,filter:['<=',['get','minZoom'],0],paint:{'line-color':'#96aa90','line-width':['interpolate',['linear'],['zoom'],4.5,.45,8,1],'line-opacity':.65,'line-dasharray':[3,2]}},
        {id:'borders',type:'line',source:'countries',paint:{'line-color':['interpolate',['linear'],['zoom'],2,'#f5f7ed',5,'#899d7f'],'line-width':['interpolate',['linear'],['zoom'],2,.8,6,1.15]}},
        {id:'country-names',type:'symbol',source:'country-labels',filter:['<=',['get','minZoom'],Math.floor(initialZoom()*2)/2],layout:{'text-field':['get','name'],'text-font':['Arial','Helvetica','sans-serif'],'text-size':['interpolate',['linear'],['zoom'],0,10,3,12,6,14],'text-max-width':9,'text-letter-spacing':.025,'text-padding':7,'symbol-sort-key':['get','rank'],'text-allow-overlap':false,'text-ignore-placement':false},paint:{'text-color':'#52634e','text-halo-color':'#f5f7ed','text-halo-width':1.2,'text-halo-blur':.3}},
        {id:'city-dots',type:'circle',source:'cities',minzoom:4,filter:['<=',['get','minZoom'],0],paint:{'circle-radius':['case',['get','capital'],2.5,1.6],'circle-color':'#667e68','circle-stroke-color':'#f5f7ed','circle-stroke-width':1}},
        {id:'city-names',type:'symbol',source:'cities',minzoom:4,filter:['<=',['get','minZoom'],0],layout:{'text-field':['get','name'],'text-font':['Arial','Helvetica','sans-serif'],'text-size':['interpolate',['linear'],['zoom'],4,10,8,12,12,14],'text-anchor':'top','text-offset':[0,.5],'text-max-width':10,'text-padding':6,'symbol-sort-key':['get','rank'],'text-allow-overlap':false},paint:{'text-color':'#52675a','text-halo-color':'#f8faf2','text-halo-width':1.4}},
        {id:'programme-clusters',type:'circle',source:'programmes',filter:['has','point_count'],paint:{'circle-color':['case',['>', ['get','selected_count'],0],'#b78150',['>',['get','institution_count'],0],'#3b6475','#365a46'],'circle-radius':16,'circle-stroke-width':2,'circle-stroke-color':'#fffdf4'}},
        {id:'programme-counts',type:'symbol',source:'programmes',filter:['has','point_count'],layout:{'icon-image':['concat','count-',['to-string',['get','point_count']]],'icon-size':.5,'icon-allow-overlap':true,'icon-ignore-placement':false}},
        {id:'programme-points',type:'circle',source:'programmes',filter:['!',['has','point_count']],paint:{'circle-color':['case',['==',['get','selected'],1],'#b78150',['==',['get','kind'],'institution'],'#3b6475','#365a46'],'circle-radius':['case',['==',['get','selected'],1],11,6],'circle-stroke-width':2,'circle-stroke-color':'#fffdf4'}},
        {id:'comparison-halos',type:'circle',source:'comparison',paint:{'circle-color':'#b78150','circle-radius':25,'circle-opacity':.22}},
        {id:'comparison-points',type:'circle',source:'comparison',paint:{'circle-color':'#a76c3e','circle-radius':['case',['>', ['length',['get','label']],1],19,15],'circle-stroke-width':3,'circle-stroke-color':'#fffdf4'}},
        {id:'comparison-numbers',type:'symbol',source:'comparison',layout:{'icon-image':['concat','selection-',['get','label']],'icon-size':.5,'icon-allow-overlap':true,'icon-ignore-placement':true}}
      ]}
  });
  // Touchscreen pinches zoom and pan without accidental bearing changes.
  map.touchZoomRotate.disableRotation();
  map.getCanvas().setAttribute('aria-label','World map. Drag or use two fingers to move. Pinch to zoom without rotating. Shift and drag to rotate. Programme locations are also keyboard accessible, or use Browse programmes from the menu.');
  const projectionButton=container.querySelector('[data-map="projection"]');projectionButton.disabled=true;
  const selectButton=container.querySelector('[data-map="select"]');
  const detailNotice=container.querySelector('.map-detail-status');
  function setSelectionMode(on){selectionMode=on&&kind!=='institutions';selectButton.setAttribute('aria-pressed',String(selectionMode));container.querySelector('.map-selection-hint').hidden=!selectionMode;accessibleLocations();}
  selectButton.onclick=()=>setSelectionMode(!selectionMode);
  container.querySelector('[data-map="selection-done"]').onclick=()=>setSelectionMode(false);
  container.querySelector('[data-map="retry-details"]').onclick=()=>loadDetails(true);
  const accessible=document.createElement('div');accessible.className='map-location-links';accessible.setAttribute('role','group');accessible.setAttribute('aria-label','Visible programme locations');container.append(accessible);
  const tooltip=new Popup({closeButton:false,closeOnClick:false,offset:18,className:'map-tooltip'});
  async function loadDetails(retry=false){
    if(destroyed||(!retry&&map.getZoom()<3.5)||detailState==='loading'||detailState==='ready'||(detailState==='error'&&!retry))return;
    detailState='loading';canvas.dataset.detailState=detailState;detailNotice.hidden=true;
    try{
      const names=['detail-countries','region-boundaries','cities','lakes'];
      const data=await Promise.all(names.map(async name=>{const r=await fetch(new URL(`./assets/${name}.geojson`,import.meta.url),{signal:detailAbort.signal});if(!r.ok)throw Error('Map detail unavailable');return r.json();}));
      if(destroyed)return;
      ['countries','regions','cities','lakes'].forEach((name,i)=>map.getSource(name).setData(data[i]));
      detailState='ready';canvas.dataset.detailState=detailState;
    }catch{if(destroyed)return;detailState='error';canvas.dataset.detailState=detailState;detailNotice.hidden=false;}
  }
  function cameraState(){
    if(destroyed)return;const center=map.getCenter();
    const labelLevel=Math.floor(map.getZoom()*2)/2;
    if(labelLevel!==labelZoom&&map.getLayer('country-names')){labelZoom=labelLevel;for(const layer of ['country-names','city-names','city-dots','region-borders'])map.setFilter(layer,['<=',['get','minZoom'],labelLevel]);}
    Object.assign(canvas.dataset,{zoom:map.getZoom().toFixed(3),minZoom:map.getMinZoom().toFixed(3),center:`${center.lng.toFixed(3)},${center.lat.toFixed(3)}`,bearing:map.getBearing().toFixed(2),projection});
    container.querySelector('.compass').style.transform=`rotate(${-map.getBearing()}deg)`;
    container.querySelector('[data-map="minus"]').disabled=map.getZoom()<=map.getMinZoom()+.001;
    container.querySelector('[data-map="plus"]').disabled=map.getZoom()>=map.getMaxZoom()-.001;
    if(map.getLayer('city-names'))loadDetails();
  }
  function move(options){map.easeTo({...options,padding:0,duration:reduced.matches?0:500});}
  const flatSize=()=>({width:canvas.clientWidth,height:selectionOverview?Math.min(canvas.clientHeight,canvas.clientWidth):canvas.clientHeight});
  function setFlatBounds(adjustOverview=false){if(projection!=='mercator')return;const previous=map.getMinZoom(),overview=Math.abs(map.getZoom()-previous)<.01,size=flatSize(),min=minimumFlatZoom(size.width,size.height,map.getBearing());if(Math.abs(previous-min)>.001){map.setMinZoom(min);if(adjustOverview&&overview)map.jumpTo({zoom:min});}cameraState();}
  function home(){selectionOverview=false;setFlatBounds();move({center:[15,22],zoom:projection==='globe'?initialZoom():minimumFlatZoom(canvas.clientWidth,canvas.clientHeight),bearing:0});}
  function update(list,nextKind=kind){
    kind=nextKind;selectButton.disabled=kind==='institutions';if(selectButton.disabled)setSelectionMode(false);
    const stable=stableLocations(list),key=stable.map(p=>p.id).join('|')+';'+selected+';'+comparison.map(p=>p.id).join('|');
    if(key===dataKey)return;
    items=stable;accessible.replaceChildren();accessible.setAttribute('aria-label',items[0]?.kind==='institution'?'Visible institution locations':'Visible programme locations');dataKey=key;revision++;canvas.dataset.dataRevision=revision;tooltip.remove();
    if(map.getLayer('catalogue-countries'))map.setFilter('catalogue-countries',['in','name',...new Set(items.map(p=>ALIASES[p.country]||p.country)),'']);
    map.getSource('programmes')?.setData(points());
  }
  async function activate(feature){
    if(!feature||destroyed)return;
    if(feature.source==='comparison'){
      const ids=JSON.parse(feature.properties.ids),list=comparison.filter(p=>ids.includes(p.id));
      if(list.length>1){options.onSelectionGroup?.(list);return;}
      if(list.length){if(selectionMode)options.onCompare?.(list[0].id);else onSelect(list[0].id);}return;
    }
    if(!map.isSourceLoaded('programmes'))return;
    tooltip.remove();const startRevision=revision;
    if(!feature.properties.cluster){if(selectionMode&&feature.properties.kind!=='institution')options.onCompare?.(feature.properties.id);else{selected=feature.properties.id;onSelect(selected);}return;}
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
    canvas.dataset.countryLabelCount=new Set(map.queryRenderedFeatures({layers:['country-names']}).map(f=>f.properties.name)).size;
    canvas.dataset.cityLabelCount=new Set(map.queryRenderedFeatures({layers:['city-names']}).map(f=>f.properties.name)).size;
    canvas.dataset.regionBoundaryCount=map.queryRenderedFeatures({layers:['region-borders']}).length;
    canvas.dataset.selectionCount=comparison.length;canvas.dataset.selectionLocationCount=comparisonLocations(comparison).length;
    canvas.dataset.visibleSelectionCount=new Set(map.queryRenderedFeatures({layers:['comparison-points']}).map(f=>f.id)).size;
    const unique=new Set(),center=map.getCenter(),rad=Math.PI/180;accessible.replaceChildren();
    for(const f of map.queryRenderedFeatures({layers:['comparison-points','programme-clusters','programme-points']})){
      const key=f.source==='comparison'?'selected-'+f.id:f.properties.cluster?'c'+f.properties.cluster_id:f.properties.id;if(unique.has(key))continue;unique.add(key);
      const [lon,lat]=f.geometry.coordinates;
      if(projection==='globe'&&map.getZoom()<5&&Math.sin(lat*rad)*Math.sin(center.lat*rad)+Math.cos(lat*rad)*Math.cos(center.lat*rad)*Math.cos((lon-center.lng)*rad)<.02)continue;
      const xy=map.project([lon,lat]);if(xy.x<0||xy.y<0||xy.x>canvas.clientWidth||xy.y>canvas.clientHeight)continue;
      const button=document.createElement('button');button.type='button';button.className='map-accessible-pin';button.dataset.count=f.properties.point_count||1;
      const noun=items[0]?.kind==='institution'?'institutions':'programmes';button.textContent=f.properties.cluster?`Explore ${f.properties.point_count} ${noun} in this area`:f.properties.kind==='institution'?`View institution: ${f.properties.title}`:`View ${f.properties.title} at ${f.properties.university}`;
      if(f.source==='comparison'){const ids=JSON.parse(f.properties.ids),list=comparison.filter(p=>ids.includes(p.id));button.textContent=`Selected ${f.properties.label}: ${list.map(p=>p.university+' · '+p.title).join('; ')}`;button.dataset.selection=f.properties.label;}
      else if(selectionMode&&!f.properties.cluster&&f.properties.kind!=='institution')button.textContent=`Add to comparison: ${f.properties.title} at ${f.properties.university}`;
      button.dataset.longitude=lon;button.dataset.latitude=lat;button.onclick=()=>activate(f);accessible.append(button);
    }
  }
  // Count labels are generated locally; no glyph service or moving HTML markers are needed.
  map.setMissingStyleImageResolver(id=>{
    if(!/^(count-\d+|selection-[\d·+]+)$/.test(id)||map.hasImage(id))return;const count=id.replace(/^(count-|selection-)/,''),label=document.createElement('canvas');label.width=id.startsWith('selection-')?128:64;label.height=64;
    const context=label.getContext('2d');context.fillStyle='#fff';context.font=`600 ${count.length>7?17:count.length>4?20:count.length>2?22:25}px Arial`;context.textAlign='center';context.textBaseline='middle';context.fillText(count,label.width/2,33);map.addImage(id,context.getImageData(0,0,label.width,64));
  });
  for(const layer of ['programme-clusters','programme-points','comparison-points']){
    map.on('click',layer,event=>{const top=map.queryRenderedFeatures(event.point,{layers:['comparison-points']})[0];if(top&&layer!=='comparison-points')return;activate(event.features?.[0]);});
    map.on('mouseenter',layer,event=>{const f=event.features?.[0];if(!f)return;map.getCanvas().style.cursor='pointer';const noun=items[0]?.kind==='institution'?'institutions':'programmes';const text=f.source==='comparison'?`Selected ${f.properties.label} · ${comparison.filter(p=>JSON.parse(f.properties.ids).includes(p.id)).map(p=>p.university).join(' · ')}`:f.properties.cluster?`${f.properties.point_count} ${noun} · select to explore`:f.properties.university;tooltip.setLngLat(f.geometry.coordinates).setText(text).addTo(map);});
    map.on('mouseleave',layer,()=>{map.getCanvas().style.cursor='';tooltip.remove();});
  }
  const bounds=()=>({minZoom:map.getMinZoom(),maxZoom:map.getMaxZoom()});
  const wheel=event=>{event.preventDefault();if(gesture)return;map.stop();const intent=wheelIntent(event,map.getZoom(),bounds());if(intent.type==='pan'){const center=map.unproject([canvas.clientWidth/2+intent.offset[0],canvas.clientHeight/2+intent.offset[1]]);map.jumpTo({center,zoom:map.getZoom()});}else{const rect=canvas.getBoundingClientRect();map.zoomTo(intent.zoom,{around:map.unproject([event.clientX-rect.left,event.clientY-rect.top]),duration:0});}};
  const touchState=event=>{screenTouches=event.touches.length;if(screenTouches)gesture=null;};
  const gestureStart=event=>{event.preventDefault();if(screenTouches)return;map.stop();gesture={zoom:map.getZoom(),bearing:map.getBearing()};};
  const gestureChange=event=>{event.preventDefault();if(gesture&&!screenTouches)map.jumpTo(gestureCamera(gesture,event,bounds()));};
  const gestureEnd=event=>{event.preventDefault();gesture=null;};
  canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('gesturestart',gestureStart,{passive:false});canvas.addEventListener('gesturechange',gestureChange,{passive:false});canvas.addEventListener('gestureend',gestureEnd,{passive:false});
  // iOS also emits GestureEvents for touch input; leave its zoom to MapLibre.
  for(const type of ['touchstart','touchend','touchcancel'])canvas.addEventListener(type,touchState,{capture:true,passive:true});
  projectionButton.onclick=()=>{
    map.stop();tooltip.remove();
    if(projection==='globe'){
      globeCamera={center:map.getCenter(),zoom:map.getZoom(),bearing:map.getBearing()};projection='mercator';map.setProjection({type:projection});
      map.setTransformConstrain((center,zoom)=>{const camera=flatViewportCamera(center,zoom,{...flatSize(),bearing:map.getBearing()});return {zoom:camera.zoom,center:new LngLat(camera.center.lng,camera.center.lat)};});
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
  map.on('load',()=>{update(items);cameraState();projectionButton.disabled=false;canvas.classList.add('map-ready');});cameraState();
  const resize=new ResizeObserver(()=>{map.resize();setFlatBounds(true);});resize.observe(canvas);
  return {update,setComparison(list){const key=list.map(p=>p.id).join('|');if(key===comparisonKey)return;comparisonKey=key;comparison=list;map.getSource('comparison')?.setData(comparisonData());update(items);accessibleLocations();},focusComparison(){const bounds=locationBounds(comparison);if(!bounds)return;const wide=bounds[1][0]-bounds[0][0]>150;if(wide&&projection==='globe')projectionButton.onclick();selectionOverview=wide;setFlatBounds();map.fitBounds(bounds,{padding:{top:110,bottom:110,left:innerWidth<700?45:100,right:innerWidth<700?70:100},maxZoom:7,duration:reduced.matches?0:600});},focus(p){selected=p.id;update(items);move({center:[p.lon,p.lat],zoom:Math.max(4,map.getZoom()),offset:innerWidth>900?[-150,0]:[0,-80]});},focusCountry(list){if(!list.length)return;if(list.length===1){move({center:[list[0].lon,list[0].lat],zoom:4});return;}map.fitBounds(locationBounds(list),{padding:120,maxZoom:5,duration:reduced.matches?0:600});},destroy(){destroyed=true;detailAbort.abort();resize.disconnect();tooltip.remove();accessible.remove();canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('gesturestart',gestureStart);canvas.removeEventListener('gesturechange',gestureChange);canvas.removeEventListener('gestureend',gestureEnd);for(const type of ['touchstart','touchend','touchcancel'])canvas.removeEventListener(type,touchState,true);map.remove();}};
}
