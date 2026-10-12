import {CHECKLIST,assess,todayKey} from './core.js';
import {programmeRoute} from './catalogue.js';

export function workspaceProgrammes(programmes,workspace) {
  const ids=[...workspace.saved,...workspace.compare,...Object.keys(workspace.tracking),...Object.keys(workspace.notes),...Object.keys(workspace.tasks),...Object.keys(workspace.drafts)];
  const byId=new Map(programmes.map(p=>[p.id,p]));
  return [...new Set(ids)].map(id=>byId.get(id)).filter(Boolean);
}
const date=value=>value?new Date(value+'T12:00:00Z'):null;
const chunks=text=>String(text).match(/[\s\S]{1,1200}/g)||[''];
const height=(values,widths)=>Math.min(409,Math.max(1,...values.map((value,i)=>String(value?.text??value??'').split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/(widths[i]*.85))),0)))*15+12);
function table(workbook,name,title,headers,widths,rows,description='') {
  const sheet=workbook.addWorksheet(name,{views:[{state:'frozen',xSplit:Math.min(2,headers.length-1),ySplit:6,showGridLines:false}],pageSetup:{orientation:'landscape',paperSize:9}});
  widths.forEach((width,i)=>sheet.getColumn(i+1).width=width);
  sheet.mergeCells(2,1,2,headers.length);sheet.getCell('A2').value=title;sheet.getCell('A2').font={name:'Arial',size:16,bold:true,color:{argb:'FF334437'}};sheet.getRow(2).height=30;
  if(description){sheet.mergeCells(4,1,4,headers.length);sheet.getCell('A4').value=description;sheet.getCell('A4').font={name:'Arial',size:10,color:{argb:'FF667660'}};sheet.getCell('A4').alignment={wrapText:true,vertical:'middle'};sheet.getRow(4).height=32;}
  sheet.getRow(6).values=headers;sheet.getRow(6).height=34;
  sheet.getRow(6).eachCell(cell=>{cell.font={name:'Arial',size:11,bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF365A46'}};cell.alignment={horizontal:'center',vertical:'middle',wrapText:true};cell.border={right:{style:'thin',color:{argb:'FFFFFFFF'}}};});
  rows.forEach(values=>{const row=sheet.addRow(values);row.height=height(values,widths);row.eachCell({includeEmpty:true},cell=>{cell.font={name:'Arial',size:11,color:{argb:'FF334437'}};cell.alignment={vertical:'top',wrapText:true,horizontal:typeof cell.value==='number'||cell.value instanceof Date?'right':'left'};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:row.number%2?'FFF7FAF3':'FFFFFFFF'}};if(cell.value instanceof Date)cell.numFmt='dd mmm yyyy';if(cell.value?.hyperlink)cell.font={...cell.font,color:{argb:'FF416845'},underline:true};});});
  if(rows.length)sheet.autoFilter={from:'A6',to:{row:6+rows.length,column:headers.length}};
  sheet.pageSetup.printTitlesRow='1:6';
  return sheet;
}
export async function workspaceWorkbook(programmes,workspace,provenance={}) {
  const selected=workspaceProgrammes(programmes,workspace);
  if(selected.some(p=>p.registry)&&(!provenance.registry?.attribution||!provenance.locations?.licenses?.geonames))throw Error('Registry attribution unavailable. Reload before exporting.');
  await import('./vendor/exceljs/exceljs.min.js');
  const book=new globalThis.ExcelJS.Workbook();book.creator='GradAtlas';book.created=new Date();
  const privateRows=[],noteStarts=new Map();
  const addText=(p,kind,text)=>{if(!text)return;const parts=chunks(text);if(kind==='Note')noteStarts.set(p.id,7+privateRows.length);parts.forEach((part,i)=>privateRows.push([p.title,p.university,kind,parts.length>1?`${i+1} of ${parts.length}`:null,part]));};
  for(const p of selected){
    addText(p,'Note',workspace.notes[p.id]);const draft=workspace.drafts[p.id];
    if(draft){addText(p,'Draft purpose',draft.purpose);addText(p,'Recipient email',draft.recipientEmail);addText(p,'Subject',draft.subject);addText(p,'Message',draft.body);
      for(const [field,label] of Object.entries({name:'Your name',recipient:'Recipient name',degree:'Your qualification',interest:'Your interest',question:'Your question'}))addText(p,label,draft.fields?.[field]);}
  }
  const rows=selected.map(p=>{
    const memberships=[workspace.saved.includes(p.id)?'Shortlist':null,workspace.compare.includes(p.id)?'Comparison':null].filter(Boolean).join(', ')||'Preparation / notes';
    const route=programmeRoute(p),note=workspace.notes[p.id]||'',review=assess(p,workspace.profile);
    return [p.title,p.university,p.city+', '+p.country,memberships,workspace.tracking[p.id]||'Researching',p.window?date(p.window.closes):'Not recorded',p.tuition.label,review.label,(workspace.tasks[p.id]||[]).length/CHECKLIST.length,note?{text:note.length>220?note.slice(0,200)+'… Open full note':note,hyperlink:`#'Notes & drafts'!A${noteStarts.get(p.id)}`}:null,{text:route.label,hyperlink:route.url},date(p.checkedAt)];
  });
  const sheet=table(book,'Applications','GradAtlas application workspace',['Programme','University','Location','Workspace use','Application status','Recorded deadline','Tuition','Profile review','Preparation complete','My note','Programme / institution link','Source reviewed'],[36,32,25,19,21,18,40,30,18,42,36,18],rows,'Private snapshot of your browser workspace. Includes profile, notes and saved drafts. Excel edits do not sync back to GradAtlas. Double-check current official instructions.');
  sheet.getCell('A3').value='Exported';sheet.getCell('B3').value=date(todayKey());sheet.getCell('B3').numFmt='dd mmm yyyy';
  sheet.getCell('D3').value='Degree / field';sheet.getCell('E3').value=workspace.profile?.degree||'Not entered';
  sheet.getCell('F3').value='Grade';sheet.getCell('G3').value=workspace.profile?.gpa!==''&&workspace.profile?.gpa!=null?Number(workspace.profile.gpa):'Not entered';sheet.getCell('G3').numFmt='0.00';
  sheet.getCell('H3').value=workspace.profile?`Scale ${workspace.profile.scale==='german'?'German 1–4 (lower is better)':workspace.profile.scale}`:'';
  sheet.getCell('J3').value='IELTS overall';sheet.getCell('K3').value=workspace.profile?.ielts!==''&&workspace.profile?.ielts!=null?Number(workspace.profile.ielts):'Not entered';sheet.getCell('K3').numFmt='0.0';
  sheet.getRow(3).height=36;sheet.getRow(3).eachCell(cell=>{cell.font={name:'Arial',size:11,color:{argb:'FF52684D'}};cell.alignment={wrapText:true,vertical:'middle'};});
  rows.forEach((_,i)=>sheet.getCell(i+7,9).numFmt='0%');
  if(!rows.length){sheet.mergeCells('A7:L7');sheet.getCell('A7').value='No programme activity recorded yet. Save a programme or start a preparation plan in GradAtlas.';sheet.getRow(7).height=30;}
  if(selected.length){
    table(book,'Preparation','Preparation checklist',['Programme','University','Preparation prompt','Status'],[38,33,84,18],selected.flatMap(p=>CHECKLIST.map((prompt,i)=>[p.title,p.university,prompt,(workspace.tasks[p.id]||[]).includes(i)?'Complete':'To do'])),'General preparation prompts. Follow the programme’s own document list and applicant-specific process.');
    if(privateRows.length)table(book,'Notes & drafts','Your notes and saved enquiries',['Programme','University','Content','Part','Text'],[38,33,24,12,100],privateRows,'Only explicitly saved enquiries are included. Long text continues in numbered parts without loss. No enquiry has been sent by this export.');
    table(book,'Sources','Official source references',['Programme','University','Source','URL','Reviewed','Application category','Evidence scope'],[38,33,42,85,18,60,46],selected.flatMap(p=>p.sources.map(source=>[p.title,p.university,source.label,{text:source.url,hyperlink:source.url},date(p.checkedAt),p.window?.category||'Current window not recorded',p.registry?'Registered degree identity. Admissions unreviewed.':'Programme-page record. Admissions evidence is partial.'])),'Review dates describe recorded evidence. Links and admission rules may change. A recorded deadline is not a live portal check or an exact cutoff time.');
  }
  const notices=[['Profile review','Grades are compared only within the same grading system. IELTS uses recorded overall scores; components and exemptions need review. Degree/field is context, not automated prerequisite matching. No admission probability is calculated.'],['Private snapshot','This file contains your local workspace data. Choose what to share. Restore the app using its recovery backup; this spreadsheet is a readable export.'],['Source rights','University pages retain their own rights. The software MIT licence does not relicense third-party pages or datasets.']];
  if(selected.some(p=>p.registry))notices.push(['DUO attribution',provenance.registry.attribution],['DUO licence',provenance.registry.resolvedLicenceUrl+' · Creative Commons Attribution; publisher version unspecified. Keep attribution and transformation notices.'],['Location attribution',provenance.locations.attribution],['GeoNames licence',provenance.locations.licenses.geonames.url+' · CC BY 4.0. Approximate institution localities.']);
  table(book,'Read me','Workspace export notes',['Topic','Details'],[26,110],notices);
  return book.xlsx.writeBuffer();
}
