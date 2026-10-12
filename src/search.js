// Search normalisation is separate from the unchanged source records.
export function normalizeSearch(value='') {
  return String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/ß/g,'ss').replace(/æ/g,'ae').replace(/œ/g,'oe').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
}
const words=value=>normalizeSearch(value).split(' ').filter(Boolean);
const COUNTRY_ALIASES={'the netherlands':'netherlands','turkey':'turkiye','czech republic':'czechia','united states of america':'united states'};
export const countryKey=value=>COUNTRY_ALIASES[normalizeSearch(value)]||normalizeSearch(value);
export const sameCountry=(a,b)=>countryKey(a)===countryKey(b);
export const countryDisplay=value=>normalizeSearch(value)==='the netherlands'?'Netherlands':value;
const countryText=value=>[value,...Object.entries(COUNTRY_ALIASES).filter(([,key])=>key===countryKey(value)).map(([alias])=>alias)].join(' ');
function oneEditAway(a,b) {
  if(Math.abs(a.length-b.length)>1)return false;
  if(a.length===b.length){const differences=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])differences.push(i);return differences.length===1||(differences.length===2&&differences[1]===differences[0]+1&&a[differences[0]]===b[differences[1]]&&a[differences[1]]===b[differences[0]]);}
  if(a.length>b.length)[a,b]=[b,a];
  let i=0,j=0,skipped=false;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else if(skipped)return false;else{skipped=true;j++;}}return true;
}
function document(groups) {
  return groups.map(([value,weight])=>({text:normalizeSearch(value),tokens:[...new Set(words(value))],weight}));
}
const programmeDocuments=new WeakMap(),institutionDocuments=new WeakMap();
function programmeDocument(p){if(!programmeDocuments.has(p))programmeDocuments.set(p,document([[p.title,10],[p.university,8],[(p.fields||[]).join(' '),7],[(p.tags||[]).join(' '),5],[[p.city,countryText(p.country)].join(' '),4]]));return programmeDocuments.get(p);}
function institutionDocument(p){if(!institutionDocuments.has(p))institutionDocuments.set(p,document([[p.name,10],[(p.names||[]).join(' '),9],[[p.city,countryText(p.country)].join(' '),4]]));return institutionDocuments.get(p);}
function match(doc,query) {
  const phrase=normalizeSearch(query),terms=[...new Set(words(query))];
  if(!terms.length)return {score:0,fuzzy:false};
  let score=0,fuzzy=false;
  for(const term of terms){
    let best=0,close=false;
    for(const group of doc)for(const token of group.tokens){
      const exact=token===term,prefix=term.length>=3&&token.startsWith(term),typo=!exact&&!prefix&&term.length>=5&&token.length>=5&&oneEditAway(term,token);
      const value=exact?group.weight*10:prefix?group.weight*10-2:typo?group.weight*10-30:0;
      if(value>best){best=value;close=typo;}
    }
    if(!best)return null;
    score+=best;fuzzy||=close;
  }
  if(doc[0].text===phrase)score+=200;else if(doc[0].text.includes(phrase))score+=80;
  return {score,fuzzy};
}
export const matchProgramme=(p,query)=>match(programmeDocument(p),query);
export const matchInstitution=(p,query)=>match(institutionDocument(p),query);

const TOPICS=[
  ['supply chain',['Logistics','Operations Management']],
  ['logistics',['Supply Chain','Transport']],
  ['machine learning',['Artificial Intelligence','Deep Learning']],
  ['deep learning',['Machine Learning','Artificial Intelligence']],
  ['cybersecurity',['Information Security','Network Security']],
  ['quantum',['Quantum Computing','Quantum Information']],
  ['engineering',['Mechanical Engineering','Electrical Engineering']]
];
export function relatedTopics(query){const q=normalizeSearch(query);return TOPICS.find(([topic])=>q.includes(topic))?.[1].filter(topic=>normalizeSearch(topic)!==q)||[];}

function host(url){try{const u=new URL(url);return /^https?:$/.test(u.protocol)?u.hostname.toLowerCase().replace(/^www\./,''):null;}catch{return null;}}
function uniqueLookup(records,values){const lookup=new Map();for(const record of records)for(const value of new Set(values(record).filter(Boolean))){const current=lookup.get(value);if(current===undefined)lookup.set(value,record);else if(current?.id!==record.id)lookup.set(value,null);}return lookup;}
export function createDiscoveryIndex(programmes,institutions) {
  const rors=new Map(institutions.map(p=>[p.ror,p]));
  const names=uniqueLookup(institutions,p=>[p.name,...(p.names||[])].map(name=>countryKey(p.country)+'|'+normalizeSearch(name)));
  const domains=uniqueLookup(institutions,p=>[host(p.website)]);
  const links=new Map(),byInstitution=new Map(),methods={ror:0,name:0,domain:0};
  for(const p of programmes){
    let institution=null,method=null;
    if(p.registry?.ror){institution=rors.get(p.registry.ror);method='ror';}
    else{
      institution=names.get(countryKey(p.country)+'|'+normalizeSearch(p.university));method='name';
      if(!institution){
        const candidates=new Map();for(const source of p.sources||[]){const candidate=domains.get(host(source.url));if(candidate&&sameCountry(candidate.country,p.country))candidates.set(candidate.id,candidate);}
        if(candidates.size===1){institution=[...candidates.values()][0];method='domain';}
      }
    }
    if(!institution)continue;
    links.set(p.id,{institutionId:institution.id,method});methods[method]++;
    if(!byInstitution.has(institution.id))byInstitution.set(institution.id,[]);
    byInstitution.get(institution.id).push(p);
  }
  return {links,byInstitution,methods,group(records){const grouped=new Map();for(const p of records){const id=links.get(p.id)?.institutionId;if(!id)continue;if(!grouped.has(id))grouped.set(id,[]);grouped.get(id).push(p);}return grouped;}};
}
