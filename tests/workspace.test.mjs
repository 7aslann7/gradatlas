import test from 'node:test';
import assert from 'node:assert/strict';
import {parseWorkspaceBackup, draftMatches,normalizeWorkspace,MAX_COMPARISON} from '../src/core.js';
const empty = {profile: null, saved: [], compare: [], tracking: {}, notes: {}, tasks: {}, drafts: {}};
test('six comparisons survive local reload and both recovery formats, with excess IDs capped', () => {
  const ids=Array.from({length:MAX_COMPARISON+1},(_,i)=>'programme-'+i);
  const raw={...empty,compare:[ids[0],...ids]};
  assert.deepEqual(normalizeWorkspace(raw).compare,ids.slice(0,MAX_COMPARISON));
  for(const version of [1,2])assert.deepEqual(parseWorkspaceBackup(JSON.stringify({version,workspace:raw}),ids).compare,ids.slice(0,MAX_COMPARISON));
});
test('both backup versions restore only current catalogue references', () => {
  for(const version of [1,2]) {
    const raw = {...empty, saved: ['kept','gone'], compare: ['gone'], notes: {kept:'My note',gone:'Old note'}, tracking: {gone:'Preparing'}, tasks:{gone:[0]}};
    const restored=parseWorkspaceBackup(JSON.stringify({version,workspace:raw}),['kept']);
    assert.deepEqual(restored,{...empty,saved:['kept'],notes:{kept:'My note'}});
  }
});
test('invalid or oversized backups cannot replace a workspace', () => {
  for(const data of ['{', '{}', 'null', JSON.stringify({version:3,workspace:empty}), JSON.stringify({version:2,workspace:{}}), ' '.repeat(2000001)]) assert.throws(()=>parseWorkspaceBackup(data,['kept']));
});
test('draft save status includes recipient, purpose and generation fields', () => {
  const draft={subject:'Question',body:'Message',fields:{purpose:'admissions',recipientEmail:'a@example.test',name:'Applicant'}};
  const saved={...draft,purpose:'admissions',recipientEmail:'a@example.test'};
  assert.equal(draftMatches(saved,draft),true);
  for(const [field,value] of [['recipientEmail','b@example.test'],['name','Another applicant'],['purpose','research']]) assert.equal(draftMatches(saved,{...draft,fields:{...draft.fields,[field]:value}}),false);
  assert.equal(draftMatches(saved,{...draft,body:'Edited'}),false);
});
