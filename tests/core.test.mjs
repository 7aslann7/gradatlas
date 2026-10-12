import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applicationStatus,assess,filterPrograms,todayKey,calendarEvent,makeEmail,escapeHTML,normalizeWorkspace,reviewDraft} from '../src/core.js';
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
  const sample=programs.filter(p=>['saarland-cyber','twente-cyber','tuebingen-ml'].includes(p.id));
  const result=filterPrograms(sample,{query:'cryptography',country:'Germany',field:'Cybersecurity'},null,'2026-10-12');
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
test('enquiry templates do not invent a completed qualification, page review or research experience',()=>{
  const draft=makeEmail(p,{purpose:'research',name:'Alex',degree:'Current BSc student',interest:'privacy-preserving learning',question:'Does your group consider master’s research enquiries?'});
  assert.match(draft.subject,/Research supervision/);
  assert.match(draft.body,/Current BSc student/);
  assert.ok(!draft.body.includes('I have reviewed')&&!draft.body.includes('completed'));
  assert.ok(reviewDraft(draft.subject,draft.body).issues.some(s=>s.includes('placeholder')));
});
test('workspace backups preserve locally saved drafts and migrate older backups safely',()=>{
  const old={profile:null,saved:[],compare:[],notes:{},tasks:{},tracking:{}};
  assert.deepEqual(normalizeWorkspace(old).drafts,{});
  const drafts={'saarland-cyber':{subject:'Programme question',body:'My own enquiry',purpose:'admissions',recipientEmail:'team@example.edu',fields:{name:'Alex',question:'My own question'}}};
  assert.deepEqual(normalizeWorkspace({...old,drafts}).drafts,drafts);
  assert.throws(()=>normalizeWorkspace({...old,drafts:{'saarland-cyber':{...drafts['saarland-cyber'],body:{html:'unsafe'}}}}));
  assert.throws(()=>normalizeWorkspace({...old,drafts:{'saarland-cyber':{...drafts['saarland-cyber'],purpose:'unsupported'}}}));
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
  const sample=[
    {...p,id:'later',window:{...p.window,closes:'2026-11-30'}},
    {...p,id:'expired',window:{...p.window,opens:'2026-08-01',closes:'2026-09-30'}},
    {...p,id:'earlier',window:{...p.window,opens:'2026-10-01',closes:'2026-10-20'}},
    {...p,id:'undated',window:null}
  ];
  const list=filterPrograms(sample,{sort:'deadline'},null,'2026-10-12');
  assert.deepEqual(list.slice(0,2).map(p=>p.id),['earlier','later']);
  assert.deepEqual(new Set(list.slice(2).map(p=>p.id)),new Set(['expired','undated']));
});
test('programme and university ordering use their named fields, natural numbers and stable ties',()=>{
  const sample=[
    {...p,id:'z',title:'Zoology',university:'École 10'},
    {...p,id:'c',title:'Chemistry',university:'Aalto University'},
    {...p,id:'b',title:'Biology',university:'Ecole 2'},
    {...p,id:'a2',title:'Astronomy',university:'école 2'},
    {...p,id:'a1',title:'Astronomy',university:'Ecole 2'}
  ];
  const original=sample.map(p=>p.id);
  assert.deepEqual(filterPrograms(sample,{sort:'name'},null).map(p=>p.id),['c','a1','a2','b','z']);
  assert.deepEqual(filterPrograms(sample,{sort:'title'},null).map(p=>p.id),['a1','a2','b','c','z']);
  assert.deepEqual(filterPrograms([...sample].reverse(),{sort:'name'},null).map(p=>p.id),['c','a1','a2','b','z']);
  assert.deepEqual(sample.map(p=>p.id),original);
  const punctuation=[{...sample[4],id:'a1'},{...sample[4],id:'a-1'}];
  assert.deepEqual(filterPrograms(punctuation,{sort:'name'},null).map(p=>p.id),['a-1','a1']);
});
