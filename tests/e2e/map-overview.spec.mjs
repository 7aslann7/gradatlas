import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const programmes=JSON.parse(await readFile(new URL('../../src/data/programs.json',import.meta.url)));
const chosen=['United States','Australia','Türkiye'].map(country=>programmes.find(p=>p.country===country));
test('global selections fit a portrait overview and reset restores normal map limits',async({page},testInfo)=>{
  await page.addInitScript(compare=>localStorage.setItem('gradatlas.workspace.v1',JSON.stringify({profile:null,saved:[],compare,tracking:{},notes:{},tasks:{},drafts:{}})),chosen.map(p=>p.id));
  await page.goto('/',{waitUntil:'domcontentloaded'});const canvas=page.locator('.map-canvas');
  await expect(canvas).toHaveClass(/map-ready/);
  const expected=Math.max(.4,Math.log2(Math.min(page.viewportSize().width,page.viewportSize().height)*.88*Math.PI/512));
  await expect.poll(async()=>Number(await canvas.getAttribute('data-zoom'))).toBeCloseTo(expected,1);
  await page.getByRole('button',{name:'Show all selected programmes on the map',exact:true}).click();
  await expect(canvas).toHaveAttribute('data-projection','mercator');
  await expect.poll(async()=>Number(await canvas.getAttribute('data-visible-selection-count'))).toBe(3);
  await page.screenshot({path:testInfo.outputPath('selected-world-map.png')});
  await page.getByRole('button',{name:'Reset map view',exact:true}).click();
  const normal=Math.log2(Math.max(page.viewportSize().width,page.viewportSize().height)/512);
  await expect.poll(async()=>Number(await canvas.getAttribute('data-min-zoom'))).toBeCloseTo(normal,2);
});
