// Clustering must use stable input order, independently of list sorting.
export function stableLocations(records) {
  return [...records].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
}

// The comparison order is shared by the map numbers and comparison columns.
// Co-located programmes stay at the recorded location rather than being displaced.
export function comparisonLocations(records) {
  const seen=new Set(),groups=new Map();
  for(const p of records){
    if(seen.has(p.id)||!Number.isFinite(p.lon)||!Number.isFinite(p.lat))continue;
    seen.add(p.id);const number=seen.size,key=`${p.lon.toFixed(4)},${p.lat.toFixed(4)}`;
    if(!groups.has(key))groups.set(key,{id:key,lon:p.lon,lat:p.lat,programmes:[],numbers:[]});
    const group=groups.get(key);group.programmes.push(p);group.numbers.push(number);
  }
  return [...groups.values()].map(group=>({...group,label:group.numbers.length>3?`${group.numbers[0]}+${group.numbers.length-1}`:group.numbers.join('·')}));
}

export function locationBounds(records) {
  if(!records.length)return null;
  const longitudes=records.map(p=>p.lon),latitudes=records.map(p=>p.lat);
  return [[Math.min(...longitudes),Math.min(...latitudes)],[Math.max(...longitudes),Math.max(...latitudes)]];
}

// Average longitudes on a circle so a cluster spanning the date line stays there.
export function clusterCenter(points) {
  const rad=Math.PI/180;
  const x=points.reduce((sum,p)=>sum+Math.cos(p.lon*rad),0);
  const y=points.reduce((sum,p)=>sum+Math.sin(p.lon*rad),0);
  const lon=Math.hypot(x,y)<1e-9?points[0].lon:Math.atan2(y,x)/rad;
  return [lon,points.reduce((sum,p)=>sum+p.lat,0)/points.length];
}

// Small geographic patches cover the sphere without a polygon crossing the date line.
export function minimumFlatZoom(width,height,bearing=0) {
  const angle=bearing*Math.PI/180,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
  return Math.log2(Math.max(1,width*c+height*s,height*c+width*s)/512);
}

export function flatViewportCamera(center,zoom,{width,height,bearing=0}) {
  const z=Math.max(minimumFlatZoom(width,height,bearing),Math.min(12,zoom));
  const angle=bearing*Math.PI/180,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
  const world=512*2**z,halfX=(width*c+height*s)/world/2,halfY=(height*c+width*s)/world/2;
  const lngLimit=Math.max(0,180-halfX*360),lat=Math.max(-85.05112878,Math.min(85.05112878,center.lat));
  const y=(1-Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))/Math.PI)/2;
  const cy=Math.max(halfY,Math.min(1-halfY,y));
  return {zoom:z,center:{lng:Math.max(-lngLimit,Math.min(lngLimit,center.lng)),lat:Math.atan(Math.sinh(Math.PI*(1-2*cy)))*180/Math.PI}};
}

export function oceanSurface() {
  const features=[];
  for(let lon=-180;lon<180;lon+=30)for(let lat=-90;lat<90;lat+=30){
    features.push({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[lon,lat],[lon+30,lat],[lon+30,lat+30],[lon,lat+30],[lon,lat]]]}});
  }
  return {type:'FeatureCollection',features};
}
