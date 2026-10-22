import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {comparisonLocations} from '../../src/map-geometry.js';
const programmes=JSON.parse(await readFile(new URL('../../src/data/programs.json',import.meta.url)));
const KEY='gradatlas.workspace.v1';
const turkey=programmes.find(p=>p.country==='Türkiye');
const sameCampus=programmes.filter(p=>p.lon===programmes[0].lon&&p.lat===programmes[0].lat).slice(0,2);
const selected=[...sameCampus,turkey];
async function start(page,compare=[]){
  if(compare.length)await page.addInitScript(({key,compare})=>localStorage.setItem(key,JSON.stringify({profile:null,saved:[],compare,tracking:{},notes:{},tasks:{},drafts:{}})),{key:KEY,compare});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.map-canvas')).toHaveClass(/map-ready/);
}
async function turkeyView(page){
  await page.getByRole('button',{name:'Filter programmes',exact:true}).click();
  await page.getByRole('combobox',{name:'Country or region',exact:true}).selectOption('Türkiye');
  await page.getByRole('button',{name:'Close filters',exact:true}).click();
  for(let i=0;i<3;i++){
    const before=Number(await page.locator('.map-canvas').getAttribute('data-zoom'));
    await page.getByRole('button',{name:'Zoom in',exact:true}).click();
    await expect.poll(async()=>Number(await page.locator('.map-canvas').getAttribute('data-zoom'))).toBeGreaterThan(before+.8);
  }
}

test('zoom reveals local city names and regional boundaries without an external map service',async({page})=>{
  const requests=[];page.on('request',r=>requests.push(r.url()));await start(page);
  expect(requests.some(url=>url.includes('cities.geojson'))).toBe(false);
  await turkeyView(page);const canvas=page.locator('.map-canvas');
  await expect(canvas).toHaveAttribute('data-detail-state','ready');
  await expect.poll(async()=>Number(await canvas.getAttribute('data-city-label-count'))).toBeGreaterThan(0);
  await expect.poll(async()=>Number(await canvas.getAttribute('data-region-boundary-count'))).toBeGreaterThan(1);
  expect(requests.filter(url=>/cities.geojson|region-boundaries.geojson|detail-countries.geojson/.test(url)).every(url=>new URL(url).hostname==='127.0.0.1')).toBe(true);
});

test('selected pins persist through filters, co-locate honestly and link to comparison',async({page})=>{
  await start(page,selected.map(p=>p.id));const canvas=page.locator('.map-canvas');
  await expect(canvas).toHaveAttribute('data-selection-count',String(selected.length));
  await expect(canvas).toHaveAttribute('data-selection-location-count',String(comparisonLocations(selected).length));
  await page.getByRole('searchbox').fill('no-such-programme-123456');
  await expect(page.locator('#result-count')).toHaveText('0 programmes');
  await expect(canvas).toHaveAttribute('data-selection-count',String(selected.length));
  await page.locator('.selection-summary').click();
  await page.getByRole('button',{name:'Show all selected programmes on the map',exact:true}).click();
  await expect(page.locator('#map-results')).toBeHidden();
  await expect.poll(async()=>Number(await canvas.getAttribute('data-visible-selection-count'))).toBe(comparisonLocations(selected).length);
  await page.locator('.selection-summary').click();
  await expect(page.locator('.map-selection-row')).toHaveCount(selected.length);
  await expect(page.locator('.map-selection-row .selection-number')).toHaveText(selected.map((p,i)=>String(i+1)));
  await page.keyboard.press('Escape');
  await expect(page.locator('#map-selection-list')).toBeHidden();
  await page.locator('.selection-summary').click();
  await page.locator('.compare-tray [data-nav=compare]').click();
  await expect(page.locator('.comparison-table thead .selection-number')).toHaveText(selected.map((p,i)=>String(i+1)));
  await page.getByRole('button',{name:'Show on map',exact:true}).click();
  await expect(page.locator('.comparison-workspace')).toHaveCount(0);
  await expect(canvas).toHaveAttribute('data-selection-count',String(selected.length));
  await expect(page.locator('.compare-tray')).toBeVisible();
  const tray=await page.locator('.compare-tray').boundingBox();expect(tray.x).toBeGreaterThanOrEqual(0);
  expect(tray.x+tray.width).toBeLessThanOrEqual(page.viewportSize().width);
});

test('map selection toggles programmes and failed detail loading offers a usable retry',async({page})=>{
  let fail=true;await page.route('**/assets/cities.geojson',route=>fail?route.abort():route.continue());
  await start(page);await turkeyView(page);
  await expect(page.locator('.map-detail-status')).toBeVisible();fail=false;
  await page.getByRole('button',{name:'Retry',exact:true}).click();
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-detail-state','ready');
  await page.getByRole('button',{name:'Select programmes on the map',exact:true}).click();
  await page.getByRole('button',{name:`Add to comparison: ${turkey.title} at ${turkey.university}`,exact:true}).press('Enter');
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-selection-count','1');
  await expect(page.locator('.selection-summary')).toContainText('1');
  await page.getByRole('button',{name:`Selected 1: ${turkey.university} · ${turkey.title}`,exact:true}).press('Enter');
  await expect(page.locator('.compare-tray')).toHaveCount(0);
  await page.getByRole('button',{name:'Done',exact:true}).click();
  await expect(page.getByRole('button',{name:'Select programmes on the map',exact:true})).toHaveAttribute('aria-pressed','false');
});

test('selection dock stays compact, reopens without losing choices and leaves detail actions clear',async({page},testInfo)=>{
  const choices=programmes.slice(0,6),ids=choices.map(p=>p.id);
  await start(page,ids);
  const summary=page.locator('.selection-summary'),panel=page.locator('#map-selection-list');
  await expect(summary).toHaveAttribute('aria-expanded','false');
  await expect(panel).toBeHidden();
  const dock=await page.locator('.compare-tray').boundingBox();
  expect(dock.width).toBeLessThan(160);expect(dock.height).toBeGreaterThanOrEqual(44);
  expect(dock.x).toBeLessThanOrEqual(24);
  for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(size);
    await summary.click();await expect(panel).toBeVisible();
    const bounds=await panel.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(size.width);
    expect(bounds.y).toBeGreaterThanOrEqual(78);expect(bounds.y+bounds.height).toBeLessThan(size.height);
    await expect(panel.getByRole('button',{name:'Compare',exact:true})).toBeInViewport();
    await page.getByRole('button',{name:'Collapse selected programmes',exact:true}).click();
    await expect(summary).toBeFocused();await expect(panel).toBeHidden();
    expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).compare,KEY)).toEqual(ids);
  }
  await page.setViewportSize({width:390,height:844});
  await summary.click();await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect(panel).toBeHidden();
  await summary.click();await page.screenshot({path:testInfo.outputPath('selection-panel-mobile.png')});
  await panel.locator('[data-selection-focus]').first().click();
  await expect(page.locator('#detail-dialog')).toBeVisible();await expect(summary).toBeHidden();
  const toggle=page.locator('#detail-dialog [data-toggle-compare]');
  await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','false');
  await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Close programme details',exact:true}).click();
  await expect(summary).toBeVisible();await expect(summary).toHaveAttribute('aria-expanded','false');
  await summary.click();await expect(page.locator('.map-selection-row')).toHaveCount(6);
  await panel.getByRole('button',{name:'Compare',exact:true}).click();
  await expect(page.locator('.comparison-count')).toHaveText('6 / 6 selected');
  await page.getByRole('button',{name:'Back to the map',exact:true}).click();
  await expect(summary).toHaveAttribute('aria-expanded','false');
  await page.reload();await expect(summary).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).compare.length,KEY)).toBe(6);
  await expect(page.locator('.map-canvas')).toHaveClass(/map-ready/);
  await page.screenshot({path:testInfo.outputPath('selection-dock-mobile.png')});
});
