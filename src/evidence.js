import {todayKey} from './core.js';
const unknown=value=>!value||/not verified|not recorded|check official|check.*fee|to be confirmed/i.test(value);
export function programmeEvidence(p,now=todayKey()) {
  const rows=[
    ['degree','Programme',p.title,p.evidence?.degree],
    ['language','Teaching language',p.language,p.evidence?.language],
    ['duration','Duration',p.duration,p.evidence?.duration],
    ['mode','Delivery',p.mode,p.evidence?.mode],
    ['tuition','Tuition',p.tuition.label,p.tuition.source?{source:p.tuition.source,checkedAt:p.checkedAt}:null],
    ['grade','Comparable grade rule',p.gpa?.text,p.gpa?{source:p.gpa.source,checkedAt:p.checkedAt}:null],
    ['ielts','IELTS overall',p.ielts!=null?String(p.ielts):null,p.ieltsSource?{source:p.ieltsSource,checkedAt:p.checkedAt}:null],
    ['window','Application window',p.window?`${p.window.opens} – ${p.window.closes}`:null,p.window?{source:p.window.source,checkedAt:p.checkedAt}:null],
    ['contact','Published contact',p.contact?.email,p.contact?{source:p.contact.source,checkedAt:p.checkedAt}:null]
  ];
  return rows.map(([id,label,value,proof])=>{
    const missing=unknown(value),valid=proof&&p.sources.some(s=>s.url===proof.source);
    const stale=valid&&Date.parse(now)-Date.parse(proof.checkedAt)>90*86400000;
    return {id,label,value:missing?'Not recorded':value,status:missing?'unknown':valid?(stale?'stale':'linked'):'recorded',source:valid?proof.source:null,checkedAt:valid?proof.checkedAt:null};
  });
}
export function evidenceCoverage(programmes) {
  const all=programmes.flatMap(p=>programmeEvidence(p));
  return {records:programmes.length,sourceLinked:all.filter(r=>r.status==='linked').length,unknown:all.filter(r=>r.status==='unknown').length,recorded:all.filter(r=>r.status==='recorded').length,stale:all.filter(r=>r.status==='stale').length};
}
