import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applicationStatus,assess,filterPrograms,todayKey,calendarEvent,makeEmail,escapeHTML,normalizeWorkspace} from '../src/core.js';
const programs=JSON.parse(await readFile(new URL('../src/data/programs.json',import.meta.url),'utf8'));
const p={...programs[0],checkedAt:'2026-10-12',window:{opens:'2026-11-01',closes:'2026-11-30',source:'https://example.edu/admissions'}};
test('application availability includes boundary days and never fabricates missing windows',()=>{
  assert.equal(applicationStatus(p,'2026-10-31').key,'upcoming');
  assert.equal(applicationStatus(p,'2026-11-01').key,'open');
  assert.equal(applicationStatus(p,'2026-11-30').key,'open');
  assert.equal(applicationStatus(p,'2026-12-01').key,'closed');
  assert.equal(applicationStatus({...p,window:null},'2026-10-12').key,'unknown');
});
test('stale records stop claiming applications are open',()=>assert.equal(applicationStatus({...p,checkedAt:'2026-01-01'},'2026-11-10').key,'review'));
test('Istanbul date does not use the execution host timezone',()=>assert.equal(todayKey(new Date('2026-10-11T22:30:00Z')),'2026-10-12'));
test('international GPA is never converted or used as a same-scale threshold',()=>{
  const tub=programs.find(p=>p.id==='tuebingen-ml');
  const result=assess(tub,{gpa:'2.82',scale:'4',ielts:'7'});
  assert.equal(result.key,'review');
  assert.ok(result.details.some(s=>s.includes('equivalency')));
  assert.equal(assess(tub,{gpa:'2.1',scale:'german',ielts:'7'}).key,'gap');
  assert.equal(assess(tub,{gpa:'2.0',scale:'german',ielts:'7'}).key,'review');
});
test('missing grades and language scores remain unknown, not zero',()=>assert.equal(assess(programs.find(p=>p.id==='tuebingen-ml'),{gpa:'',scale:'german',ielts:''}).key,'review'));
test('a published preference is not treated as a hard rejection',()=>{
  const advisory={...p,gpa:{value:3,scale:'4',type:'preferred',direction:'higher',text:'Preferred 3/4'}};
  assert.equal(assess(advisory,{gpa:2.82,scale:'4'}).key,'review');
});
test('search, country and field filters intersect, including research keywords',()=>{
  const result=filterPrograms(programs,{query:'cryptography',country:'Germany',field:'Cybersecurity'},null,'2026-10-12');
  assert.deepEqual(result.map(p=>p.id),['saarland-cyber']);
  assert.ok(filterPrograms(programs,{open:true},null,'2026-10-12').every(p=>p.window));
});
test('calendar is a transparent all-day reminder across year boundaries',()=>{
  const ics=calendarEvent({...p,window:{...p.window,closes:'2026-12-31'}});
  assert.match(ics,/DTSTART;VALUE=DATE:20261231/);
  assert.match(ics,/DTEND;VALUE=DATE:20270101/);
  assert.match(ics,/Verify the exact time/);
  assert.equal(calendarEvent({...p,window:null}),null);
});
test('email drafts preserve user facts and leave unknown information as placeholders',()=>{
  const draft=makeEmail(p,{name:'Alex',degree:'BSc Computer Engineering',recipient:'Dr Smith',interest:'network security',question:'Are my courses sufficient?'});
  assert.match(draft.body,/Dear Dr Smith/);assert.match(draft.body,/network security/);assert.match(draft.body,/Are my courses sufficient\?/);
  assert.ok(!draft.body.includes('publication')&&!draft.body.includes('excellent GPA'));
});
test('user and source text is escaped before HTML rendering',()=>assert.equal(escapeHTML('<script>"x"&\'</script>'),'&lt;script&gt;&quot;x&quot;&amp;&#39;&lt;/script&gt;'));
test('workspace import rejects malformed scores and checklist records before replacement',()=>{
  const raw={profile:{degree:'Computer Engineering',scale:'4',gpa:'2.82',ielts:''},saved:['saarland-cyber'],compare:[],notes:{'saarland-cyber':'Research notes'},tasks:{'saarland-cyber':[0,2]},tracking:{'saarland-cyber':'Preparing'}};
  assert.deepEqual(normalizeWorkspace(raw).tasks,raw.tasks);
  assert.throws(()=>normalizeWorkspace({...raw,profile:{...raw.profile,gpa:'8'}}));
  assert.throws(()=>normalizeWorkspace({...raw,tasks:{'saarland-cyber':[99]}}));
  assert.throws(()=>normalizeWorkspace({...raw,notes:{'saarland-cyber':{html:'unsafe'}}}));
  assert.equal(normalizeWorkspace({...raw,untrustedUrl:'https://example.com'}).untrustedUrl,undefined);
});
test('deadline sorting prioritises remaining windows over closed cycles',()=>{
  const list=filterPrograms(programs,{sort:'deadline'},null,'2026-10-12');
  assert.equal(list[0].id,'eth-data');
  assert.ok(list.findIndex(p=>p.id==='ucl-urban')>list.findIndex(p=>p.id==='ubc-policy'));
});
