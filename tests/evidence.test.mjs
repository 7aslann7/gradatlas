import test from 'node:test';
import assert from 'node:assert/strict';
import {programmeEvidence} from '../src/evidence.js';
const p={title:'Example MSc',language:'English',duration:'2 years',mode:'Not verified',checkedAt:'2026-10-12',tuition:{label:'Check official fee schedule',free:false},sources:[{label:'Programme',url:'https://example.edu/msc'}],evidence:{degree:{source:'https://example.edu/msc',checkedAt:'2026-10-12'}}};
test('a programme citation does not imply every individual admission fact is source-linked',()=>{
  const rows=programmeEvidence(p,'2026-10-12');
  assert.equal(rows.find(r=>r.id==='degree').status,'linked');
  assert.equal(rows.find(r=>r.id==='language').status,'recorded');
  assert.equal(rows.find(r=>r.id==='tuition').status,'unknown');
  assert.equal(rows.find(r=>r.id==='window').status,'unknown');
});
test('field sources must belong to the record, and older evidence is explicitly stale',()=>{
  const rows=programmeEvidence({...p,evidence:{...p.evidence,language:{source:'https://unrelated.example/english',checkedAt:'2026-10-12'}}},'2027-02-01');
  assert.equal(rows.find(r=>r.id==='degree').status,'stale');
  assert.equal(rows.find(r=>r.id==='language').status,'recorded');
});
