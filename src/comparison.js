import {assess,formatDate} from './core.js';

// Shared content keeps the screen and downloadable workbook in agreement.
export function comparisonRows(profile) {
  return [
    ['Field',p=>p.fields.join('\n')],
    ['Location',p=>p.city+', '+p.country],
    ['Study format',p=>p.duration+'\n'+p.mode],
    ['Teaching language',p=>p.language],
    ['Tuition',p=>p.tuition.label],
    ['Application dates',p=>p.window?`${formatDate(p.window.opens)} – ${formatDate(p.window.closes)}\n${p.window.category}`:p.scheduleNote||'Not verified. Check official source.'],
    ['Grade requirements',p=>p.gradeNote],
    ['Profile review',p=>assess(p,profile).label],
    ['Last reviewed',p=>formatDate(p.checkedAt)]
  ];
}

export async function comparisonWorkbook(programmes,profile,provenance={}) {
  if(!programmes.length||programmes.length>3)throw Error('Select one to three programmes.');
  if(programmes.some(p=>p.registry)&&(!provenance.registry?.attribution||!provenance.locations?.licenses?.geonames))throw Error('Registry attribution unavailable. Reload before exporting.');
  // The browser bundle is loaded only on export; no applicant data leaves the device.
  await import('./vendor/exceljs/exceljs.min.js');
  const workbook=new globalThis.ExcelJS.Workbook();
  workbook.creator='GradAtlas';workbook.created=new Date();
  const sheet=workbook.addWorksheet('Comparison',{views:[{state:'frozen',xSplit:1,ySplit:5,showGridLines:false}],pageSetup:{orientation:'landscape',paperSize:9,fitToPage:true,fitToWidth:1,fitToHeight:0}});
  const columns=programmes.length+1;
  sheet.getColumn(1).width=25;
  for(let i=2;i<=columns;i++)sheet.getColumn(i).width=46;
  const banner=(row,text,size,color)=>{
    sheet.mergeCells(row,1,row,columns);const cell=sheet.getCell(row,1);cell.value=text;
    cell.font={name:'Calibri',size,bold:row===1,color:{argb:color}};
    cell.alignment={vertical:'middle',wrapText:true};
    sheet.getRow(row).height=row===1?34:row===2?30:42;
  };
  banner(1,'GradAtlas · Programme comparison',20,'FF334437');
  banner(2,'Official-source discovery · '+new Date().toISOString().slice(0,10),11,'FF667660');
  banner(3,'Verify current applicant-specific requirements, fees and cutoff times. Profile review is not an admission decision. Missing information remains unknown.',10,'FF667660');
  sheet.getRow(4).height=12;
  const header=sheet.getRow(5);header.values=['Your options',...programmes.map(p=>p.title+'\n'+p.university)];
  header.eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF365A46'}};cell.font={name:'Calibri',size:12,bold:true,color:{argb:'FFFFFFFF'}};cell.alignment={vertical:'middle',wrapText:true};});
  const heightFor=(values,width=46)=>Math.max(...values.map(value=>String(value).split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/(width*.9))),0)))*15+18;
  header.height=heightFor(header.values.slice(1));
  const body=comparisonRows(profile);
  for(const [label,value] of body){const row=sheet.addRow([label,...programmes.map(value)]);row.height=heightFor(programmes.map(value));row.eachCell((cell,col)=>{
    cell.font={name:'Calibri',size:11,bold:col===1,color:{argb:col===1?'FF52684D':'FF334437'}};
    cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:col===1?'FFEAF1E4':row.number%2?'FFF7FAF3':'FFFFFFFF'}};
    cell.alignment={vertical:'top',wrapText:true};cell.border={bottom:{style:'hair',color:{argb:'FFDCE5D4'}},right:{style:'hair',color:{argb:'FFDCE5D4'}}};
  });}
  const sources=workbook.addWorksheet('Sources',{views:[{state:'frozen',ySplit:4,showGridLines:false}]});
  sources.columns=[{width:42},{width:42},{width:40},{width:85},{width:17}];
  sources.mergeCells('A1:E1');sources.getCell('A1').value='Official programme sources';sources.getCell('A1').font={name:'Calibri',size:18,bold:true,color:{argb:'FF334437'}};sources.getRow(1).height=32;
  sources.mergeCells('A2:E2');sources.getCell('A2').value='Review dates describe recorded evidence; source availability does not guarantee unchanged admissions rules.';sources.getCell('A2').alignment={wrapText:true};sources.getCell('A2').font={name:'Calibri',size:11,color:{argb:'FF667660'}};sources.getRow(2).height=28;
  sources.getRow(3).height=12;sources.getRow(4).values=['Programme','University','Source label','Source URL','Reviewed'];sources.getRow(4).height=25;
  sources.getRow(4).eachCell(cell=>{cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF365A46'}};cell.font={name:'Calibri',size:11,bold:true,color:{argb:'FFFFFFFF'}};});
  const sourceRow=sheet.addRow(['Official sources']);sourceRow.height=40;
  programmes.forEach((p,i)=>{
    const first=sources.rowCount+1;
    for(const source of p.sources){const row=sources.addRow([p.title,p.university,source.label,{text:source.url,hyperlink:source.url},formatDate(p.checkedAt)]);row.height=Math.max(32,heightFor([p.title,p.university,source.label],42),heightFor([source.url],85));row.eachCell((cell,col)=>{cell.font={name:'Calibri',size:11,color:{argb:col===4?'FF416845':'FF334437'},underline:col===4};cell.alignment={wrapText:true,vertical:'top'};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2?'FFF7FAF3':'FFFFFFFF'}};});}
    const cell=sourceRow.getCell(i+2);cell.value={text:p.sources.length+' official source'+(p.sources.length===1?'':'s')+' · open Sources',hyperlink:`#'Sources'!A${first}`};cell.font={name:'Calibri',size:11,color:{argb:'FF416845'},underline:true};cell.alignment={wrapText:true,vertical:'middle'};
  });
  sourceRow.getCell(1).font={name:'Calibri',size:11,bold:true,color:{argb:'FF52684D'}};sourceRow.getCell(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFEAF1E4'}};sourceRow.getCell(1).alignment={vertical:'middle',wrapText:true};
  sources.autoFilter={from:'A4',to:`E${sources.rowCount}`};
  const method=workbook.addWorksheet('Reuse & methodology',{views:[{showGridLines:false}]});
  method.columns=[{width:27},{width:100}];
  const notices=[['Purpose','Research aid only. Double-check current official instructions, applicant category, dates, fees and links. Passing tests and a source link do not guarantee factual accuracy.'],['Evidence scope','Programme-page records and registry-backed degree identities have different evidence. Registration does not establish an available intake or admission eligibility.'],['Source rights','Referenced university pages retain their own rights. The GradAtlas software MIT licence does not relicense external pages or datasets.']];
  if(programmes.some(p=>p.registry))notices.push(['DUO RIO attribution',provenance.registry.attribution],['DUO licence',provenance.registry.resolvedLicenceUrl+' · Creative Commons Attribution; publisher version unspecified. Keep source credit and transformation notices.'],['Location attribution',provenance.locations.attribution],['GeoNames licence',provenance.locations.licenses.geonames.url+' · CC BY 4.0. Approximate institution localities, not verified teaching campuses.']);
  notices.forEach(([label,text])=>{const row=method.addRow([label,text]);row.height=heightFor([text],100);row.eachCell((cell,col)=>{cell.font={name:'Calibri',size:11,bold:col===1,color:{argb:'FF334437'}};cell.alignment={wrapText:true,vertical:'top'};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:col===1?'FFEAF1E4':'FFFFFFFF'}};});});
  sheet.pageSetup.printTitlesRow='1:5';sheet.pageSetup.printTitlesColumn='A:A';
  return workbook.xlsx.writeBuffer();
}
