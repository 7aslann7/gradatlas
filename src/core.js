import {matchProgramme,sameCountry} from './search.js';
export const MAX_COMPARISON = 6;
export const FIELDS = ['AI & Machine Learning', 'Architecture & Planning', 'Arts & Humanities', 'Business & Management', 'Computer Science', 'Cybersecurity', 'Economics & Finance', 'Education', 'Engineering', 'Environment', 'Law', 'Life Sciences', 'Medicine & Public Health', 'Physics & Mathematics', 'Public Policy', 'Quantum Computing', 'Social Sciences'];
export const CHECKLIST = ['Check degree and course prerequisites', 'Confirm official grade equivalency', 'Prepare transcript and degree certificate', 'Check language tests and exemptions', 'Check whether a CV and programme-specific statement are required', 'Arrange references if required', 'Check fees, funding and visa costs', 'Verify deadline and submit on the official portal'];
export function normalizeWorkspace(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.saved) || !Array.isArray(raw.compare)) throw Error('Invalid workspace');
  const ids = list => {if(list.length>500||list.some(id=>typeof id!=='string'||id.length>100))throw Error('Invalid programme IDs');return [...new Set(list)];};
  const dict = value => {if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>500)throw Error('Invalid workspace records');return value;};
  const notes=Object.fromEntries(Object.entries(dict(raw.notes)).map(([k,v])=>{if(typeof v!=='string'||v.length>10000)throw Error('Invalid note');return [k,v];}));
  const tasks=Object.fromEntries(Object.entries(dict(raw.tasks)).map(([k,v])=>{if(!Array.isArray(v)||v.some(i=>!Number.isInteger(i)||i<0||i>=CHECKLIST.length))throw Error('Invalid checklist');return [k,[...new Set(v)]];}));
  const statuses=['Researching','Preparing','Submitted','Offer received','Not proceeding'];
  const tracking=Object.fromEntries(Object.entries(dict(raw.tracking)).map(([k,v])=>{if(!statuses.includes(v))throw Error('Invalid application status');return [k,v];}));
  let profile=null;
  if(raw.profile){
    const p=raw.profile,scales=['4','5','10','100','german'];
    if(!scales.includes(p.scale)||typeof p.degree!=='string'||p.degree.length>200)throw Error('Invalid profile');
    const number=(value,max,min=0)=>{if(value===''||value==null)return '';const n=Number(value);if(!Number.isFinite(n)||n<min||n>max)throw Error('Invalid score');return String(n);};
    profile={degree:p.degree,name:'',scale:p.scale,gpa:number(p.gpa,p.scale==='german'?4:Number(p.scale),p.scale==='german'?1:0),ielts:number(p.ielts,9)};
  }
  const drafts=Object.fromEntries(Object.entries(dict(raw.drafts===undefined?{}:raw.drafts)).map(([k,v])=>{
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(k)||!v||typeof v!=='object'||typeof v.subject!=='string'||v.subject.length>300||typeof v.body!=='string'||v.body.length>10000||!['admissions','research'].includes(v.purpose))throw Error('Invalid enquiry draft');
    if(v.recipientEmail!=null&&(typeof v.recipientEmail!=='string'||v.recipientEmail.length>320))throw Error('Invalid draft recipient');
    const fields={};
    if(v.fields!=null){dict(v.fields);for(const [field,limit] of Object.entries({name:100,recipient:100,recipientEmail:320,degree:250,interest:1000,question:1500})){if(v.fields[field]==null)continue;if(typeof v.fields[field]!=='string'||v.fields[field].length>limit)throw Error('Invalid draft field');fields[field]=v.fields[field];}}
    return [k,{subject:v.subject,body:v.body,purpose:v.purpose,recipientEmail:v.recipientEmail||'',fields}];
  }));
  return {profile,saved:ids(raw.saved),compare:ids(raw.compare).slice(0,MAX_COMPARISON),tracking,notes,tasks,drafts};
}
export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function parseWorkspaceBackup(text, validIds) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > 2e6) throw Error('Backup too large');
  const backup = JSON.parse(text);
  if (!backup || ![1, 2].includes(backup.version)) throw Error('Invalid backup version');
  const workspace = normalizeWorkspace(backup.workspace);
  const ids = new Set(validIds);
  for (const field of ['saved', 'compare']) workspace[field] = workspace[field].filter(id => ids.has(id));
  for (const field of ['tracking', 'notes', 'tasks', 'drafts']) workspace[field] = Object.fromEntries(Object.entries(workspace[field]).filter(([id]) => ids.has(id)));
  return workspace;
}
export function draftMatches(saved, draft) {
  if (!saved || !draft) return false;
  const fields = draft.fields || {};
  if (saved.subject !== draft.subject || saved.body !== draft.body || saved.purpose !== (fields.purpose || 'admissions') || saved.recipientEmail !== (fields.recipientEmail || '')) return false;
  return ['name', 'recipient', 'recipientEmail', 'degree', 'interest', 'question'].every(field => (saved.fields?.[field] || '') === (fields[field] || ''));
}
export function todayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function isStale(p, now = todayKey()) {
  return Date.parse(now) - Date.parse(p.checkedAt) > 90 * 86400000;
}
export function applicationStatus(p, now = todayKey()) {
  if (isStale(p, now)) return {key:'review', label:'Dates need rechecking'};
  const w = p.window;
  if (!w) return {key:'unknown', label:'Check application dates'};
  if (now < w.opens) return {key:'upcoming',label:'Opens '+formatDate(w.opens)};
  if (now > w.closes) return {key:'closed',label:'Recorded cycle closed'};
  return {key:'open', label:'Within recorded dates'};
}
export function formatDate(value) {
  return new Date(value+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
}
export function assess(p, profile) {
  if (!profile) return {key:'none',label:'Add your profile',details:[]};
  const details=[];
  let gap = false;
  if (isStale(p)) details.push('Recorded requirements are over 90 days old. Recheck the official source.');
  if (p.gpa) {
    if (profile.gpa === '' || profile.gpa == null) details.push('Add your current grade to check the recorded threshold.');
    else if (profile.scale !== p.gpa.scale) details.push('Official grade equivalency is needed. We do not convert between grading systems.');
    else {
      const met = p.gpa.direction==='lower' ? Number(profile.gpa)<=p.gpa.value : Number(profile.gpa)>=p.gpa.value;
      if (!met && p.gpa.type==='required') {gap=true;details.push('Your grade is outside the recorded requirement: '+p.gpa.text);}
      else if (!met) details.push('Your grade is below a published preference, not an automatic rejection: '+p.gpa.text);
      else details.push('Your grade meets this recorded threshold. Other admission criteria still apply.');
    }
  } else details.push('No comparable numeric grade threshold recorded. Admissions must assess your transcript.');
  if (p.ielts) {
    if (profile.ielts === '' || profile.ielts == null) details.push('Recorded IELTS overall minimum: '+p.ielts+'. Check accepted tests, component scores and exemptions.');
    else if (Number(profile.ielts)<p.ielts) {gap=true;details.push('Your IELTS overall score is below '+p.ielts+'. Check alternative evidence and exemptions.');}
    else details.push('IELTS overall threshold met. Component scores, validity and exemptions still need review.');
  } else details.push('Review the official language requirements and any exemptions.');
  details.push('Degree recognition, prerequisite courses, supporting documents and selection remain subject to university review.');
  return {key:gap?'gap':'review',label:gap?'Recorded requirement gap':'Individual review needed',details};
}
const nameCollator=new Intl.Collator('en',{sensitivity:'base',numeric:true,ignorePunctuation:true});
export const compareNames=(a,b)=>nameCollator.compare(a||'',b||'');
const universityOrder=(a,b)=>compareNames(a.university,b.university)||compareNames(a.title,b.title)||compareNames(a.country,b.country)||compareNames(a.city,b.city)||(a.id<b.id?-1:a.id>b.id?1:0);
const programmeOrder=(a,b)=>compareNames(a.title,b.title)||universityOrder(a,b);
export function filterPrograms(programs, filters, profile, now=todayKey()) {
  const scores=new Map();
  let result=programs.filter(p=> {const match=matchProgramme(p,filters.query);if(!match)return false;scores.set(p.id,match.score);return (!filters.field||p.fields.includes(filters.field))
    && (!filters.country||sameCountry(p.country,filters.country))
    && (!filters.open||applicationStatus(p,now).key==='open')
    && (!filters.free||p.tuition.free===true)
    && (!filters.fit||assess(p,profile).key===filters.fit);});
  if(filters.sort==='relevance')result.sort((a,b)=>scores.get(b.id)-scores.get(a.id)||universityOrder(a,b));
  else if(filters.sort==='name')result.sort(universityOrder);
  else if(filters.sort==='deadline'){const deadline=p=>p.window?.closes>=now?p.window.closes:'9999';result.sort((a,b)=>deadline(a).localeCompare(deadline(b))||programmeOrder(a,b));}
  else result.sort(programmeOrder);
  return result;
}
export function makeEmail(p, fields) {
  const name=(fields.name||'').trim()||'[Your name]',degree=(fields.degree||'').trim()||'[Your degree and university]';
  const interest=(fields.interest||'').trim(),question=(fields.question||'').trim()||'[Your specific question after checking the programme instructions]';
  const research=fields.purpose==='research',salutation=(fields.recipient||'').trim()||(research?'[Recipient name]':'Admissions team');
  const context=research?`My research interests include ${interest||'[A specific research topic and its connection to the recipient’s work]'}.\n\nI would appreciate clarification on the following:`:`${interest?'My academic interests include '+interest+'.\n\n':''}I would appreciate clarification on the following:`;
  return {subject:`${research?'Research supervision':'Master’s application'} enquiry — ${p.title}`,body:`Dear ${salutation},\n\nMy name is ${name}. My academic background is ${degree}. I am interested in ${p.title} at ${p.university}.\n\n${context}\n\n${question}\n\nThank you for your time and guidance.\n\nBest regards,\n${name}`};
}

export function reviewDraft(subject,body) {
  const issues=[];
  if(!subject.trim())issues.push('Add a specific subject.');
  if(!body.trim())issues.push('Write the enquiry.');
  if(/\[[^\]\n]+\]/.test(subject+'\n'+body))issues.push('Replace the remaining placeholders with your own details.');
  const words=body.trim()?body.trim().split(/\s+/).length:0;
  if(words>300)issues.push('Consider shortening the message to one focused enquiry. This is a writing suggestion, not an admissions rule.');
  return {issues,words};
}
export function calendarEvent(p) {
  if(!p.window) return null;
  const date=p.window.closes.replaceAll('-','');
  const next=new Date(p.window.closes+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);
  const end=next.toISOString().slice(0,10).replaceAll('-','');
  const esc=s=>String(s).replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
  // An all-day reminder, deliberately not a claimed institutional cutoff time.
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//GradAtlas//Application reminder//EN','BEGIN:VEVENT',`UID:${p.id}-${date}@gradatlas.local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${date}`,`DTEND;VALUE=DATE:${end}`,`SUMMARY:${esc('Check application deadline: '+p.university)}`,`DESCRIPTION:${esc('Recorded application deadline. Verify the exact time, time zone and applicant category on the official source: '+p.window.source)}`,'END:VEVENT','END:VCALENDAR'];
  return lines.join('\r\n')+'\r\n';
}
