import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {FIELDS,todayKey} from '../src/core.js';
const data=JSON.parse(await readFile('src/data/programs.json','utf8'));
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const date=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const url=value=>{const u=new URL(value);assert.equal(u.protocol,'https:');assert.ok(!u.username&&!u.password,'Source URLs cannot contain credentials');};
assert.ok(Array.isArray(data)&&data.length,'Catalogue must contain records');
assert.equal(new Set(data.map(p=>p.id)).size,data.length,'Duplicate programme ID');
const identities=new Set();
for(const p of data){
  const context=p.id||'Unnamed record';
  for(const field of ['id','title','university','country','city','checkedAt','summary','gradeNote','duration','language','mode'])assert.ok(nonempty(p[field]),`${context}: missing ${field}`);
  assert.match(p.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/,`${context}: unstable ID format`);
  const identity=[p.university,p.title].map(v=>v.normalize('NFKC').trim().toLowerCase()).join('|');
  assert.ok(!identities.has(identity),`${context}: duplicate university and programme`);identities.add(identity);
  assert.ok(date(p.checkedAt)&&p.checkedAt<=todayKey(),`${context}: invalid or future review date`);
  for(const field of ['fields','tags','requirements','sources'])assert.ok(Array.isArray(p[field])&&p[field].length,`${context}: ${field} required`);
  assert.ok(p.fields.every(f=>FIELDS.includes(f)),`${context}: unknown subject group`);
  assert.ok(p.tags.every(nonempty)&&p.requirements.every(nonempty),`${context}: empty tags or requirements`);
  assert.ok(['On campus','Online','Hybrid','Not verified'].includes(p.mode),`${context}: unsupported study mode`);
  for(const s of p.sources){assert.ok(nonempty(s.label),`${context}: source label required`);url(s.url);}
  const sourced=value=>p.sources.some(s=>s.url===value);
  assert.ok(Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&p.lat>=-90&&p.lat<=90&&p.lon>=-180&&p.lon<=180,`${context}: invalid location`);
  assert.ok(nonempty(p.tuition?.label)&&typeof p.tuition.free==='boolean',`${context}: tuition label and recorded-free flag required`);
  if(p.tuition.source){url(p.tuition.source);assert.ok(sourced(p.tuition.source),`${context}: fee source absent from provenance`);}
  if(p.tuition.free)assert.ok(p.tuition.source,`${context}: no-tuition claim needs a fee source`);
  if(p.applicationURL){url(p.applicationURL);assert.ok(sourced(p.applicationURL),`${context}: application route absent from provenance`);}
  for(const [field,proof] of Object.entries(p.evidence||{})){
    assert.ok(['degree','language','duration','mode'].includes(field),`${context}: unsupported evidence field`);
    assert.ok(proof&&date(proof.checkedAt)&&proof.checkedAt<=todayKey(),`${context}: invalid evidence review date`);
    url(proof.source);assert.ok(sourced(proof.source),`${context}: field evidence absent from provenance`);
    assert.ok(field==='degree'||!/^Not verified/i.test(p[field]),`${context}: unknown field cannot have confirmed evidence`);
  }
  if(p.window){assert.ok(date(p.window.opens)&&date(p.window.closes)&&p.window.opens<=p.window.closes,`${context}: invalid application window`);assert.ok(nonempty(p.window.category)&&sourced(p.window.source),`${context}: applicant category and deadline source required`);}
  if(p.gpa){assert.ok(['required','preferred'].includes(p.gpa.type)&&['4','5','10','100','german'].includes(p.gpa.scale),`${context}: grade context required`);const max=p.gpa.scale==='german'?4:Number(p.gpa.scale);assert.ok(Number.isFinite(p.gpa.value)&&p.gpa.value>=(p.gpa.scale==='german'?1:0)&&p.gpa.value<=max,`${context}: invalid grade`);assert.equal(p.gpa.direction,p.gpa.scale==='german'?'lower':'higher',`${context}: grade direction conflicts with scale`);assert.ok(nonempty(p.gpa.text)&&sourced(p.gpa.source),`${context}: grade evidence required`);}
  if(p.ielts!=null){assert.ok(Number.isFinite(p.ielts)&&p.ielts>0&&p.ielts<=9,`${context}: invalid IELTS score`);assert.ok(p.ieltsSource&&sourced(p.ieltsSource),`${context}: language source absent from provenance`);}
  if(p.contact){assert.ok(nonempty(p.contact.name)&&sourced(p.contact.source),`${context}: professional contact provenance required`);assert.match(p.contact.email,/^[^\s@]+@[^\s@]+\.[^\s@]+$/,`${context}: invalid contact email`);}
  if(p.research){assert.ok(nonempty(p.research.label),`${context}: research label required`);url(p.research.url);assert.ok(sourced(p.research.url),`${context}: research link absent from provenance`);}
}
console.log(`Validated ${data.length} source-backed records across ${new Set(data.map(p=>p.country)).size} countries/regions and ${new Set(data.flatMap(p=>p.fields)).size} subject groups.`);
const guidance=JSON.parse(await readFile('src/data/guidance.json','utf8'));
assert.ok(Array.isArray(guidance)&&guidance.length,'Official guidance required');
assert.equal(new Set(guidance.map(g=>g.id)).size,guidance.length,'Duplicate guidance ID');
for(const g of guidance){for(const field of ['id','title','summary','scope'])assert.ok(nonempty(g[field]),`Guidance ${g.id}: missing ${field}`);url(g.url);}
console.log(`Validated ${guidance.length} scoped official application guides.`);
const indexFile=await readFile('src/data/institutions.json');
const institutions=JSON.parse(indexFile),manifest=JSON.parse(await readFile('src/data/institution-manifest.json','utf8'));
assert.equal(createHash('sha256').update(indexFile).digest('hex'),manifest.indexSha256,'Institution index differs from its import manifest');
assert.equal(institutions.length,manifest.indexCount);
assert.equal(new Set(institutions.map(p=>p.id)).size,institutions.length,'Duplicate institution ID');
assert.equal(new Set(institutions.map(p=>p.countryCode)).size,manifest.indexCountryCount);
for(const p of institutions){
  assert.equal(p.kind,'institution');assert.match(p.id,/^ror-0[a-z0-9]{8}$/);assert.equal(p.ror,'https://ror.org/'+p.id.slice(4));
  for(const field of ['name','city','country','countryCode'])assert.ok(nonempty(p[field]),`${p.id}: missing ${field}`);
  assert.ok(Array.isArray(p.names)&&p.names.every(nonempty));
  assert.ok(Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lon)&&Math.abs(p.lon)<=180,`${p.id}: invalid locality`);
  assert.ok(Number.isInteger(p.geonamesId)&&p.geonamesId>0);
  if(p.website){const u=new URL(p.website);assert.ok(['https:','http:'].includes(u.protocol)&&!u.username&&!u.password);}
}
console.log(`Validated ${institutions.length.toLocaleString('en')} ROR institution records across ${manifest.indexCountryCount} countries/territories, with matching import checksum.`);
