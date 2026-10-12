import test from 'node:test';
import assert from 'node:assert/strict';
import {clusterCenter,minimumFlatZoom,flatViewportCamera} from '../src/map-geometry.js';

test('a Pacific cluster crossing the date line stays in the Pacific',()=>{
  const [lon,lat]=clusterCenter([{lon:179,lat:20},{lon:-179,lat:22}]);
  assert.ok(Math.abs(Math.abs(lon)-180)<1e-9);
  assert.equal(lat,21);
});
test('the flat map minimum covers both desktop and portrait viewport dimensions',()=>{
  for(const [width,height] of [[1400,800],[390,844]]){
    const zoom=minimumFlatZoom(width,height),world=512*2**zoom;
    assert.ok(world>=Math.max(width,height)-1e-9);
    assert.ok(minimumFlatZoom(width,height,45)>zoom);
  }
});
test('zooming out and dragging towards the poles cannot expose space beyond the flat world',()=>{
  const size={width:900,height:700};
  const result=flatViewportCamera({lng:350,lat:90},-5,size);
  assert.equal(result.zoom,minimumFlatZoom(size.width,size.height));
  assert.ok(Math.abs(result.center.lng)<1e-9);
  const y=(1-Math.log(Math.tan(Math.PI/4+result.center.lat*Math.PI/360))/Math.PI)/2;
  const half=size.height/(512*2**result.zoom)/2;
  assert.ok(y-half>=-1e-9&&y+half<=1+1e-9);
});
test('ordinary clusters retain their geographic centre, including western longitudes',()=>{
  const [lon,lat]=clusterCenter([{lon:-81,lat:40},{lon:-79,lat:42}]);
  assert.ok(Math.abs(lon+80)<1e-9);
  assert.equal(lat,41);
});
