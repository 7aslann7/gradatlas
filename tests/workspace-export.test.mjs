import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {workspaceWorkbook,workspaceProgrammes} from '../src/workspace-export.js';
const programmes=JSON.parse(await readFile(new URL('../src/data/programs.json',import.meta.url),'utf8'));
const empty=()=>({profile:null,saved:[],compare:[],tracking:{},notes:{},tasks:{},drafts:{}});
async function load(state){const bytes=await workspaceWorkbook(programmes,state);const book=new globalThis.ExcelJS.Workbook();await book.xlsx.load(bytes);return book;}

test('workspace Excel includes independent activity once, typed profile data and preparation progress',async()=>{
  const [p,q,r]=programmes,state={...empty(),profile:{degree:'Computer Engineering',gpa:'2.82',scale:'4',ielts:'6.5'},saved:[q.id,p.id],compare:[p.id,r.id],tracking:{[p.id]:'Preparing'},tasks:{[p.id]:[0,2]},notes:{[r.id]:'Verify prerequisites.'}};
  assert.deepEqual(workspaceProgrammes(programmes,state).map(p=>p.id),[q.id,p.id,r.id]);
  const book=await load(state),sheet=book.getWorksheet('Applications');
  assert.equal(sheet.getCell('G3').value,2.82);assert.equal(sheet.getCell('K3').value,6.5);assert.equal(sheet.getCell('E3').value,'Computer Engineering');
  assert.equal(sheet.getCell('A7').value,q.title);assert.equal(sheet.getCell('D8').value,'Shortlist, Comparison');assert.equal(sheet.getCell('E8').value,'Preparing');
  assert.equal(sheet.getCell('I8').value,.25);assert.equal(sheet.getCell('I8').numFmt,'0%');assert.ok(sheet.getCell('L8').value instanceof Date);
  assert.equal(book.getWorksheet('Preparation').rowCount,6+3*8);assert.equal(book.getWorksheet('Preparation').getCell('D15').value,'Complete');
  assert.equal(sheet.views[0].ySplit,6);assert.equal(sheet.views[0].xSplit,2);assert.ok(sheet.autoFilter);assert.equal(book.getWorksheet('Sources').getCell('D7').value.hyperlink,q.sources[0].url);
});
test('long notes and saved messages remain literal text and all parts survive the export',async()=>{
  const p=programmes[0],note='=HYPERLINK("https://example.test")\n'+'A detailed question. '.repeat(150),body='Dear team,\n'+'Reviewed question. '.repeat(150);
  const state={...empty(),notes:{[p.id]:note},drafts:{[p.id]:{purpose:'research',subject:'A question',body,recipientEmail:'supervisor@example.test',fields:{name:'QA Applicant',degree:'QA qualification'}}}};
  const book=await load(state),sheet=book.getWorksheet('Notes & drafts');
  const text=kind=>sheet.getRows(7,sheet.rowCount-6).filter(row=>row.getCell(3).value===kind).map(row=>row.getCell(5).value).join('');
  assert.equal(text('Note'),note);assert.equal(text('Message'),body);assert.equal(text('Recipient email'),'supervisor@example.test');
  assert.equal(typeof sheet.getCell('E7').value,'string');assert.equal(sheet.getCell('E7').formula,undefined);assert.match(book.getWorksheet('Applications').getCell('J7').value.hyperlink,/Notes & drafts/);
});
test('empty workspaces do not invent zero profile scores or programme activity',async()=>{
  const book=await load(empty()),sheet=book.getWorksheet('Applications');assert.equal(sheet.getCell('G3').value,'Not entered');assert.equal(sheet.getCell('K3').value,'Not entered');assert.match(sheet.getCell('A7').value,/No programme activity/);assert.equal(book.getWorksheet('Preparation'),undefined);
});
test('registry workspace exports require and retain DUO and GeoNames attribution',async()=>{
  const p=programmes.find(p=>p.registry),state={...empty(),saved:[p.id]};await assert.rejects(workspaceWorkbook(programmes,state),/attribution/);
  const registry=JSON.parse(await readFile(new URL('../src/data/programme-registry-manifest.json',import.meta.url),'utf8')),locations=JSON.parse(await readFile(new URL('../src/data/institution-manifest.json',import.meta.url),'utf8'));
  const bytes=await workspaceWorkbook(programmes,state,{registry,locations}),book=new globalThis.ExcelJS.Workbook();await book.xlsx.load(bytes);
  assert.equal(book.getWorksheet('Read me').getCell('B10').value,registry.attribution);assert.match(book.getWorksheet('Read me').getCell('B13').value,/by\/4.0/);
  assert.match(book.getWorksheet('Sources').getCell('G7').value,/Admissions unreviewed/);
});
