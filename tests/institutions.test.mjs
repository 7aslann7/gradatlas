import test from 'node:test';
import assert from 'node:assert/strict';
import {filterInstitutions,institutionDetail,institutionExport} from '../src/institutions.js';
const records=[{id:'ror-b',name:'University Beta',names:['Beta Institute','Βήτα'],country:'Germany',city:'Berlin',website:null,ror:'https://ror.org/012345678',geonamesId:2950159},{id:'ror-a',name:'University Alpha',names:['Alpha'],country:'Netherlands',city:'Amsterdam'}];
test('institution aliases and country intersect without pretending to filter degree subjects',()=>{
  assert.deepEqual(filterInstitutions(records,{query:'Beta Institute',country:'Germany',field:'Cybersecurity'}),[records[0]]);
  assert.deepEqual(filterInstitutions(records,{query:'Beta',country:'Netherlands'}),[]);
  assert.deepEqual(filterInstitutions(records,{sort:'name'}).map(p=>p.id),['ror-a','ror-b']);
});
test('registry-only institutions state degree and campus verification limits and handle missing websites',()=>{
  const html=institutionDetail(records[0],{release:'v2.14',releasedAt:'2026-10-06',recordUrl:'https://zenodo.org/records/23187250'},()=> '');
  assert.match(html,/does not confirm accreditation/);assert.match(html,/GeoNames locality/);assert.doesNotMatch(html,/href="null"/);
});
test('directory exports retain attribution, source release and both licences and reject incomplete provenance',()=>{
  const manifest={indexCount:2,release:'v2.14',recordUrl:'https://zenodo.org/records/23187250',attribution:'ROR CC0; GeoNames CC BY 4.0. Filtered by GradAtlas.',licenses:{ror:{url:'https://creativecommons.org/publicdomain/zero/1.0/'},geonames:{url:'https://creativecommons.org/licenses/by/4.0/'}}};
  const exported=JSON.parse(JSON.stringify(institutionExport(records,manifest)));
  assert.deepEqual(exported.records,records);assert.equal(exported.source.release,'v2.14');
  assert.equal(exported.source.licenses.geonames.url,manifest.licenses.geonames.url);
  assert.equal(exported.attribution,manifest.attribution);assert.match(exported.accuracy,/without a guarantee/);
  assert.equal('workspace' in exported,false);
  assert.throws(()=>institutionExport(records,{...manifest,licenses:{ror:manifest.licenses.ror}}));
  assert.throws(()=>institutionExport(records.slice(0,1),manifest));
});
