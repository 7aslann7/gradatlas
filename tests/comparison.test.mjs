import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {comparisonWorkbook} from '../src/comparison.js';
import {MAX_COMPARISON} from '../src/core.js';
const programmes=JSON.parse(await readFile(new URL('../src/data/programs.json',import.meta.url),'utf8'));

test('Excel comparison retains selected order, facts, source hyperlinks and frozen labels',async()=>{
  const selected=programmes.slice(0,MAX_COMPARISON),buffer=await comparisonWorkbook(selected,null);
  const workbook=new globalThis.ExcelJS.Workbook();await workbook.xlsx.load(buffer);
  const sheet=workbook.getWorksheet('Comparison'),sources=workbook.getWorksheet('Sources');
  assert.equal(sheet.getCell('B5').value,selected[0].title+'\n'+selected[0].university);
  assert.equal(sheet.getCell('D5').value,selected[2].title+'\n'+selected[2].university);
  assert.equal(sheet.getCell('G5').value,selected[5].title+'\n'+selected[5].university);
  assert.equal(sheet.columnCount,MAX_COMPARISON+1);
  assert.equal(sheet.getCell('B10').value,selected[0].tuition.label);
  assert.equal(sheet.views[0].xSplit,1);assert.equal(sheet.views[0].ySplit,5);
  assert.equal(sources.getCell('D5').value.hyperlink,selected[0].sources[0].url);
  assert.equal(sources.rowCount,4+selected.reduce((n,p)=>n+p.sources.length,0));
  assert.ok(sheet.getColumn(2).width>=40);assert.equal(sheet.getCell('B10').alignment.wrapText,true);
});
test('untrusted text remains text, and empty or oversized comparisons are rejected',async()=>{
  const selected={...programmes[0],title:'=HYPERLINK("https://example.test")'};
  const buffer=await comparisonWorkbook([selected],null),workbook=new globalThis.ExcelJS.Workbook();await workbook.xlsx.load(buffer);
  assert.equal(typeof workbook.getWorksheet('Comparison').getCell('B5').value,'string');
  await assert.rejects(comparisonWorkbook([],null));await assert.rejects(comparisonWorkbook(programmes.slice(0,MAX_COMPARISON+1),null));
});
test('registry Excel exports require and preserve publisher and locality attribution',async()=>{
  const registry=programmes.find(p=>p.registry);
  await assert.rejects(comparisonWorkbook([registry],null),/attribution/);
  const source=JSON.parse(await readFile(new URL('../src/data/programme-registry-manifest.json',import.meta.url),'utf8'));
  const locations=JSON.parse(await readFile(new URL('../src/data/institution-manifest.json',import.meta.url),'utf8'));
  const buffer=await comparisonWorkbook([registry],null,{registry:source,locations}),workbook=new globalThis.ExcelJS.Workbook();await workbook.xlsx.load(buffer);
  assert.equal(workbook.getWorksheet('Reuse & methodology').getCell('B4').value,source.attribution);
  assert.match(workbook.getWorksheet('Reuse & methodology').getCell('B7').value,/by\/4.0/);
});
