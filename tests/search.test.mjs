import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeSearch,matchProgramme,matchInstitution,createDiscoveryIndex,relatedTopics} from '../src/search.js';
import {filterPrograms} from '../src/core.js';
import {filterInstitutions,institutionCard,institutionDetail} from '../src/institutions.js';
const programme=(id,title,university,country='Netherlands',extra={})=>({id,title,university,country,fields:[],tags:[],city:'Amsterdam',sources:[],...extra});
const institution=(id,name,country='Netherlands',extra={})=>({id,name,names:[],country,city:'Amsterdam',ror:'https://ror.org/'+id,website:null,...extra});

test('search combines words in any order and normalises accents without changing source text',()=>{
  const p=programme('p','Supply Chain Management','Universität Tübingen','Germany');
  assert.ok(matchProgramme(p,'germany supply chain'));assert.ok(matchProgramme(p,'tubingen'));
  assert.equal(p.university,'Universität Tübingen');assert.equal(normalizeSearch('Straße — École'),'strasse ecole');
  assert.equal(matchProgramme(p,'supply chain france'),null);
});
test('long words allow one edit or transposition while short acronyms do not match substrings',()=>{
  const p=programme('p','Supply Chain Management','Test University');
  assert.ok(matchProgramme(p,'suply chain').fuzzy);assert.ok(matchProgramme(p,'suplpy chain').fuzzy);
  assert.equal(matchProgramme(p,'spplyy chain'),null);assert.equal(matchProgramme(p,'AI'),null);
  assert.ok(matchProgramme({...p,title:'AI and Robotics'},'AI'));
  assert.equal(matchProgramme(p,'impossibleprogramme12345'),null);
});
test('best match ranks exact titles above a spelling match and explicit alphabetical order remains available',()=>{
  const p=[programme('typo','Supply Chaine','A University'),programme('exact','Supply Chain','Z University')];
  assert.deepEqual(filterPrograms(p,{query:'supply chain',sort:'relevance'}).map(p=>p.id),['exact','typo']);
  assert.deepEqual(filterPrograms(p,{query:'supply chain',sort:'name'}).map(p=>p.id),['typo','exact']);
});
test('programme joins use explicit ROR identity, unique names with country, and unique official domains',()=>{
  const i=[institution('a','School A'),institution('b','Other Name','Netherlands',{website:'https://www.schoolb.edu'}),institution('c','School A','Germany')];
  const p=[programme('ror','Course','Unrelated Display','Netherlands',{registry:{ror:i[0].ror}}),programme('name','Course','School A'),programme('domain','Course','Local School Name','Netherlands',{sources:[{url:'https://schoolb.edu/masters/course'}]})];
  const index=createDiscoveryIndex(p,i);
  assert.equal(index.links.get('ror').institutionId,'a');assert.equal(index.links.get('name').institutionId,'a');assert.equal(index.links.get('domain').institutionId,'b');
  assert.deepEqual(index.methods,{ror:1,name:1,domain:1});
});
test('ambiguous institution names/domains and unknown explicit ROR IDs stay unlinked',()=>{
  const i=[institution('a','Shared Name','Netherlands',{website:'https://shared.edu'}),institution('b','Shared Name','Netherlands',{website:'https://shared.edu'})];
  const p=[programme('ambiguous','Course','Shared Name','Netherlands',{sources:[{url:'https://shared.edu/masters'}]}),programme('missing','Course','Shared Name','Netherlands',{registry:{ror:'https://ror.org/missing'}})];
  assert.equal(createDiscoveryIndex(p,i).links.size,0);
});
test('institution subject filtering requires linked programmes, and name matches retain unknown programme coverage',()=>{
  const i=[institution('a','Ordinary University','The Netherlands'),institution('b','Engineering Institute','The Netherlands')],p=[programme('p','Civil Engineering','Ordinary University','Netherlands',{fields:['Engineering']})];
  const index=createDiscoveryIndex(p,i),filters={query:'engineering',field:'Engineering',sort:'relevance'},context={matching:index.group(filterPrograms(p,filters))};
  assert.deepEqual(filterInstitutions(i,filters,context).map(p=>p.id),['a']);
  assert.deepEqual(filterInstitutions(i,{...filters,country:'Netherlands'},context).map(p=>p.id),['a']);
  assert.deepEqual(filterInstitutions(i,{query:'engineering'},context).map(p=>p.id),['b','a']);
  assert.match(institutionCard(i[1],()=>''),/Programme information not yet indexed/);
  assert.match(institutionDetail(i[1],{},()=>''),/does not mean the institution has no/);
  assert.equal(matchInstitution(i[0],'engineering'),null);
  assert.match(institutionCard(i[0],()=>'', [{...p[0],title:'<img src=x>'}]),/&lt;img src=x&gt;/);
});
test('related topics are explicit suggestions and do not silently expand a query',()=>{
  assert.deepEqual(relatedTopics('supply chain'),['Logistics','Operations Management']);
  assert.equal(matchProgramme(programme('p','Logistics','School'),'supply chain'),null);
});
test('all Dutch registry identities join to their pinned institutions and Supply Chain connects seven institutions',async()=>{
  const programmes=JSON.parse(await readFile(new URL('../src/data/programs.json',import.meta.url))),institutions=JSON.parse(await readFile(new URL('../src/data/institutions.json',import.meta.url)));
  const index=createDiscoveryIndex(programmes,institutions),registered=programmes.filter(p=>p.registry);
  assert.equal(registered.length,1131);assert.ok(registered.every(p=>index.links.get(p.id)?.method==='ror'));
  const matches=filterPrograms(programmes,{query:'supply chain netherlands'});
  assert.equal(matches.length,8);assert.equal(index.group(matches).size,7);
  assert.equal(filterInstitutions(institutions,{query:'supply chain netherlands'},{matching:index.group(matches)}).length,7);
});
