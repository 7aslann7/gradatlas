import test from 'node:test';
import assert from 'node:assert/strict';
import {clusterCenter} from '../src/map-geometry.js';

test('a Pacific cluster crossing the date line stays in the Pacific',()=>{
  const [lon,lat]=clusterCenter([{lon:179,lat:20},{lon:-179,lat:22}]);
  assert.ok(Math.abs(Math.abs(lon)-180)<1e-9);
  assert.equal(lat,21);
});
test('ordinary clusters retain their geographic centre, including western longitudes',()=>{
  const [lon,lat]=clusterCenter([{lon:-81,lat:40},{lon:-79,lat:42}]);
  assert.ok(Math.abs(lon+80)<1e-9);
  assert.equal(lat,41);
});
