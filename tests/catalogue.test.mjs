import test from 'node:test';
import assert from 'node:assert/strict';
import {programmeRoute, catalogueSummary, programmeExport} from '../src/catalogue.js';
const curated={title:'Degree',country:'Country',fields:['Computer Science'],sources:[{url:'https://university.example/degree',label:'Degree'}]};
const registry={...curated,registry:{sourceUrl:'https://registry.example/data.csv',programmeUrls:[],institutionWebsite:'https://university.example/'}};
test('registry records never mislabel a CSV as an individually reviewed programme page',()=>{
  assert.equal(programmeRoute(curated).label,'Official programme page');
  assert.equal(programmeRoute(registry).label,'Find programmes at institution');
  assert.equal(programmeRoute({...registry,registry:{...registry.registry,programmeUrls:['javascript:alert(1)','https://user:secret@example.test','https://university.example/programme']}}).url,'https://university.example/programme');
  assert.equal(programmeRoute({...registry,registry:{sourceUrl:'https://registry.example/data.csv'}}).label,'Official degree registration');
});
test('catalogue counts separate programme-page and registry-only evidence',()=>{
  assert.deepEqual(catalogueSummary([curated,registry]),{total:2,programmeSources:1,registry:1,countries:1,fields:1});
});
test('registry catalogue exports require and carry separate attribution',()=>{
  assert.throws(()=>programmeExport([registry],null,null));
  const manifest={attribution:'DUO, adapted by GradAtlas',resolvedLicenceUrl:'https://opendefinition.org/licenses/cc-by/'};
  const index={attribution:'ROR + GeoNames',licenses:{geonames:{id:'CC-BY-4.0'}}};
  const result=programmeExport([registry],manifest,index);assert.equal(result.sources.duo.attribution,manifest.attribution);assert.equal(result.records[0],registry);assert.match(result.accuracy,/Double-check/);
});
