import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
test('country labels retain pinned geography, publisher anchors and unique identities',async()=>{
  const asset=await readFile(new URL('../src/assets/country-labels.geojson',import.meta.url));
  const data=JSON.parse(asset),manifest=JSON.parse(await readFile(new URL('../data-sources/natural-earth-labels.json',import.meta.url),'utf8'));
  assert.equal(createHash('sha256').update(asset).digest('hex'),manifest.assetSha256);
  assert.equal(data.features.length,manifest.featureCount);assert.equal(new Set(data.features.map(f=>f.id)).size,data.features.length);
  assert.ok(manifest.sourceUrl.includes(manifest.sourceRevision));assert.equal(manifest.licence,'Public domain');
  for(const f of data.features){assert.equal(f.geometry.type,'Point');assert.ok(f.properties.name);assert.ok(Number.isFinite(f.properties.rank));const [lon,lat]=f.geometry.coordinates;assert.ok(Number.isFinite(lon)&&Math.abs(lon)<=180);assert.ok(Number.isFinite(lat)&&Math.abs(lat)<=90);}
  const france=data.features.find(f=>f.id==='France');assert.ok(france.geometry.coordinates[0]>-5&&france.geometry.coordinates[0]<10);assert.ok(france.geometry.coordinates[1]>40);
});
