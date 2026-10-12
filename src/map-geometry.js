// Average longitudes on a circle so a cluster spanning the date line stays there.
export function clusterCenter(points) {
  const rad=Math.PI/180;
  const x=points.reduce((sum,p)=>sum+Math.cos(p.lon*rad),0);
  const y=points.reduce((sum,p)=>sum+Math.sin(p.lon*rad),0);
  const lon=Math.hypot(x,y)<1e-9?points[0].lon:Math.atan2(y,x)/rad;
  return [lon,points.reduce((sum,p)=>sum+p.lat,0)/points.length];
}

// Small geographic patches cover the sphere without a polygon crossing the date line.
export function oceanSurface() {
  const features=[];
  for(let lon=-180;lon<180;lon+=30)for(let lat=-90;lat<90;lat+=30){
    features.push({type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[lon,lat],[lon+30,lat],[lon+30,lat+30],[lon,lat+30],[lon,lat]]]}});
  }
  return {type:'FeatureCollection',features};
}
