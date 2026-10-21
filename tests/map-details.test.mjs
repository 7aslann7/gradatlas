import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {comparisonLocations,locationBounds} from '../src/map-geometry.js';

test('map context assets keep pinned provenance, valid coordinates and Turkish places',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../data-sources/natural-earth-details.json',import.meta.url)));
  assert.equal(manifest.licence,'Public domain');
  for(const asset of manifest.assets){
    const bytes=await readFile(new URL('../'+asset.path,import.meta.url)),data=JSON.parse(bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
    assert.equal(data.features.length,asset.featureCount);assert.ok(asset.sourceUrl.includes(manifest.sourceRevision));
    assert.equal(new Set(data.features.map(f=>f.id)).size,data.features.length);
    function coordinates(value){if(typeof value[0]==='number'){assert.ok(Number.isFinite(value[0])&&Math.abs(value[0])<=180);assert.ok(Number.isFinite(value[1])&&Math.abs(value[1])<=90);}else value.forEach(coordinates);}
    for(const f of data.features)coordinates(f.geometry.coordinates);
    if(asset.path.endsWith('/cities.geojson')){
      assert.ok(data.features.filter(f=>f.properties.country==='TR').length>=80);
      for(const name of ['Ankara','Istanbul'])assert.ok(data.features.some(f=>f.properties.name===name));
    }
    if(asset.path.endsWith('/region-boundaries.geojson'))assert.ok(data.features.some(f=>f.properties.country==='TUR'));
  }
});

test('comparison pins preserve order and recorded positions, including co-located programmes',()=>{
  const records=[{id:'b',lon:32.785,lat:39.891},{id:'a',lon:32.785,lat:39.891},{id:'c',lon:6.99,lat:49.2}];
  const groups=comparisonLocations(records);
  assert.equal(groups.length,2);assert.deepEqual(groups[0].numbers,[1,2]);assert.equal(groups[0].label,'1·2');
  assert.deepEqual(groups[0].programmes.map(p=>p.id),['b','a']);assert.equal(groups[0].lon,32.785);
  assert.deepEqual(groups[1].numbers,[3]);assert.deepEqual(records.map(p=>p.id),['b','a','c']);
  assert.deepEqual(comparisonLocations([records[0],records[0],records[2]]).map(g=>g.label),['1','2']);
  assert.equal(comparisonLocations(Array.from({length:6},(_,i)=>({...records[0],id:String(i)})))[0].label,'1+5');
  assert.deepEqual(locationBounds(records),[[6.99,39.891],[32.785,49.2]]);assert.equal(locationBounds([]),null);
});
