import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const data=JSON.parse(await readFile('src/data/programs.json','utf8'));
assert.equal(new Set(data.map(p=>p.id)).size,data.length,'Duplicate programme ID');
for(const p of data){
  for(const field of ['id','title','university','country','city','checkedAt','summary','gradeNote','requirements']) assert.ok(p[field],`${p.id}: missing ${field}`);
  assert.ok(p.fields.length&&p.sources.length,`${p.id}: field and source required`);
  for(const s of p.sources) assert.equal(new URL(s.url).protocol,'https:');
  assert.ok(Number.isFinite(p.lat)&&Number.isFinite(p.lon));
  assert.ok(p.lat>=-90&&p.lat<=90&&p.lon>=-180&&p.lon<=180);
  if(p.window){assert.ok(p.window.opens<=p.window.closes);assert.ok(p.sources.some(s=>s.url===p.window.source),'Deadline source must be in provenance');}
  if(p.gpa){assert.ok(p.gpa.type==='required'||p.gpa.type==='preferred');assert.ok(p.gpa.source&&p.sources.some(s=>s.url===p.gpa.source));}
  if(p.contact?.email) assert.match(p.contact.email,/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}
console.log(`Validated ${data.length} source-backed programme records.`);
