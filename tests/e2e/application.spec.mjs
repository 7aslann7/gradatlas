import {test, expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import '../../src/vendor/exceljs/exceljs.min.js';
const programmes = JSON.parse(await readFile(new URL('../../src/data/programs.json', import.meta.url), 'utf8'));
const KEY = 'gradatlas.workspace.v1';
const first = programmes[0];
const empty = () => ({profile: null, saved: [], compare: [], tracking: {}, notes: {}, tasks: {}, drafts: {}});
async function open(page, route = '') {
  await page.goto('/' + route, {waitUntil: 'domcontentloaded'});
  await expect(page.getByRole('button', {name: 'Open menu', exact: true})).toBeEnabled();
}
async function navigate(page, name) {
  await page.getByRole('button', {name: 'Open menu', exact: true}).click();
  await page.locator('#workspace-menu').getByRole('button', {name, exact: true}).click();
}
async function browse(page) {await navigate(page, 'Browse programmes');}
async function workspace(page) {return page.evaluate(key => JSON.parse(localStorage.getItem(key)), KEY);}
async function seed(page, state) {
  await page.addInitScript(({key, state}) => localStorage.setItem(key, JSON.stringify(state)), {key: KEY, state});
}
async function downloaded(page, click) {
  const event = page.waitForEvent('download'); await click(); const download = await event;
  expect(await download.failure()).toBeNull();
  return {name: download.suggestedFilename(), bytes: await readFile(await download.path())};
}

test('search, pagination and empty results remain usable without a profile', async ({page}) => {
  await open(page); await browse(page);
  await expect(page.locator('#sort')).toHaveValue('name');
  await expect(page.locator('#results .program-card')).toHaveCount(50);
  await expect(page.locator('#results-progress')).toHaveText(`50 of ${programmes.length.toLocaleString('en')} programmes`);
  await expect(page.getByRole('button',{name:/Show next/})).toHaveCount(0);
  const originalCard=await page.locator('#results .program-card').first().elementHandle();
  const list=page.locator('#results');
  await list.evaluate(el=>{el.scrollTop=el.scrollHeight;});
  await expect(page.locator('#results .program-card')).toHaveCount(100);
  expect(await originalCard.evaluate(el=>el.isConnected)).toBe(true);
  await list.focus();await page.keyboard.press('End');
  await expect(page.locator('#results .program-card')).toHaveCount(150);
  await expect(page.locator('#results-progress')).toHaveText(`150 of ${programmes.length.toLocaleString('en')} programmes`);
  await page.locator('#sort').selectOption('title');
  await expect(page.locator('#results .program-card')).toHaveCount(50);
  await expect.poll(()=>list.evaluate(el=>el.scrollTop)).toBe(0);
  await expect(list).toHaveAttribute('data-order','programme');
  await page.locator('#sort').selectOption('name');
  await expect(list).toHaveAttribute('data-order','university');
  const firstCard=page.locator('#results .program-card').first();
  await expect(firstCard.locator('.university-name')).toHaveText('Aalto University');
  const universityBox=await firstCard.locator('.university-name').boundingBox(),programmeBox=await firstCard.locator('.title-button').boundingBox();
  expect(universityBox.y).toBeLessThan(programmeBox.y);
  await page.locator('#search').fill('impossibleprogramme12345');
  await expect(page.locator('#result-count')).toHaveText('0 programmes');
  await page.getByRole('button', {name: 'Clear filters', exact: true}).click();
  await expect(page.locator('#search')).toHaveValue('');
  await page.locator('#search').fill(first.university);
  await expect(page.locator('#results .program-card').first()).toContainText(first.university);
});

test('country and field filters intersect and reset consistently', async ({page}) => {
  await open(page);
  await page.getByRole('button', {name: 'Filter programmes', exact: true}).click();
  await page.locator('#country').selectOption(first.country);
  await page.locator('#field').selectOption(first.fields[0]);
  await page.getByRole('button', {name: /^Show .* programmes?$/}).click();
  const expected = programmes.filter(p => p.country === first.country && p.fields.includes(first.fields[0]));
  await expect(page.locator('#result-count')).toHaveText(`${expected.length} programme${expected.length === 1 ? '' : 's'}`);
  await page.getByRole('button', {name: 'Filter programmes', exact: true}).click();
  await page.getByRole('button', {name: 'Reset', exact: true}).click();
  await expect(page.locator('#country')).toHaveValue(''); await expect(page.locator('#field')).toHaveValue('');
});

test('profile uses native grade scales, persists and explains local privacy', async ({page}) => {
  await open(page); await navigate(page, 'My profile');
  await expect(page.locator('#profile-dialog')).toContainText('GradAtlas does not upload these answers');
  await page.locator('#profile-form [name=degree]').fill('Computer Engineering');
  await page.locator('#profile-form [name=scale]').selectOption('german');
  await page.locator('#profile-form [name=gpa]').fill('2.5');
  await expect(page.locator('#profile-form [name=gpa]')).toHaveAttribute('min', '1');
  await page.getByRole('button', {name: /Save my profile/}).click();
  expect((await workspace(page)).profile.scale).toBe('german');
  await page.reload(); await expect(page.getByRole('button', {name: 'Open menu', exact: true})).toBeEnabled();
  await navigate(page, 'My profile · local');
  await expect(page.locator('#profile-form [name=gpa]')).toHaveValue('2.5');
  await page.keyboard.press('Escape'); await expect(page.locator('#profile-dialog')).not.toBeVisible();
});

test('shortlist tracking, checklist and escaped notes survive reload', async ({page}) => {
  await open(page); await browse(page);
  await page.locator(`[data-save="${first.id}"]`).first().click();
  await navigate(page, 'My shortlist');
  await expect(page.locator('.shortlist-drawer')).toBeVisible();
  await page.locator(`[data-track="${first.id}"]`).selectOption('Preparing');
  await page.locator('.shortlist-drawer [data-tab=notes]').click();
  const note = '<img src=x onerror=alert(1)> My research note';
  await page.locator('#programme-note').fill(note); await page.locator('[data-task="0"]').check();
  await page.reload(); await expect(page.getByRole('button', {name: 'Open menu', exact: true})).toBeEnabled();
  await page.locator('.shortlist-drawer [data-tab=notes]').click();
  await expect(page.locator('#programme-note')).toHaveValue(note);
  await expect(page.locator('[data-task="0"]')).toBeChecked();
  await expect(page.locator('#detail-content img')).toHaveCount(0);
  expect((await workspace(page)).tracking[first.id]).toBe('Preparing');
});

test('comparison enforces three selections and downloads a real sourced Excel table', async ({page}) => {
  await open(page); await browse(page);
  for (const p of programmes.slice(0, 3)) await page.locator(`[data-compare="${p.id}"]`).check();
  await page.locator(`[data-compare="${programmes[3].id}"]`).click();
  await expect(page.locator(`[data-compare="${programmes[3].id}"]`)).not.toBeChecked();
  await navigate(page, 'Compare programmes');
  await expect(page.locator('.comparison-table thead th')).toHaveCount(4);
  const file = await downloaded(page, () => page.getByRole('button', {name: 'Download Excel .xlsx'}).click());
  expect(file.name).toBe('gradatlas-comparison.xlsx'); expect(file.bytes.subarray(0, 2).toString()).toBe('PK');
  const workbook = new globalThis.ExcelJS.Workbook(); await workbook.xlsx.load(file.bytes);
  expect(workbook.getWorksheet('Comparison').getCell('B5').value).toBe(first.title + '\n' + first.university);
  expect(workbook.getWorksheet('Sources').getCell('D5').value.hyperlink).toBe(first.sources[0].url);
  await page.locator(`[data-remove-compare="${first.id}"]`).click();
  await expect(page.locator('.comparison-table thead th')).toHaveCount(3);
});

test('studio drafts are editable, recipient changes are unsaved, and nothing sends automatically', async ({page}) => {
  const posts = []; page.on('request', r => {if (r.method() === 'POST') posts.push(r.url());});
  await open(page); await navigate(page, 'Application studio');
  await page.getByRole('tab', {name: 'Enquiry draft', exact: true}).click();
  await expect(page.locator('#draft-review')).toContainText('placeholders');
  await page.locator('#email-form [name=name]').fill('QA Applicant');
  await page.locator('#email-form [name=degree]').fill('Computer Engineering at QA University');
  await page.locator('#email-form [name=question]').fill('Where are the current course prerequisite instructions?');
  await page.locator('#email-form [name=recipientEmail]').fill('admissions@example.test');
  await page.getByRole('button', {name: 'Create draft'}).click();
  await expect(page.locator('#email-draft')).toHaveValue(/QA Applicant/);
  await page.locator('#email-draft').fill('Dear team,\nA personally reviewed question.\nRegards, QA Applicant');
  await page.getByRole('button', {name: 'Save in this browser'}).click();
  await expect(page.locator('#draft-save-status')).toHaveText('Local copy saved');
  await page.locator('#email-form [name=recipientEmail]').fill('research@example.test');
  await expect(page.locator('#draft-save-status')).toHaveText('Unsaved changes');
  await page.locator('#enquiry-purpose').selectOption('research');
  await expect(page.locator('#email-form [name=recipientEmail]')).toHaveValue('');
  await expect(page.getByRole('button', {name: 'Open email app'})).toBeDisabled();
  await expect(page.locator('.recipient-scope')).toContainText('No supervisor directory or availability is verified');
  const file = await downloaded(page, () => page.getByRole('button', {name: 'Download .txt'}).click());
  expect(file.bytes.toString()).toContain('A personally reviewed question.');
  expect(posts).toEqual([]);
  await page.reload(); await expect(page.getByRole('button', {name: 'Open menu', exact: true})).toBeEnabled();
  await page.getByRole('tab', {name: 'Enquiry draft', exact: true}).click();
  await expect(page.locator('#email-draft')).toHaveValue(/A personally reviewed question/);
  await expect(page.locator('#email-form [name=recipientEmail]')).toHaveValue('admissions@example.test');
});

test('preparation autosaves and official guides retain programme scope', async ({page}) => {
  await open(page, '#workspace');
  await page.locator('[data-studio-task="0"]').check(); await page.locator('#studio-note').fill('Check transcript equivalency.');
  const file = await downloaded(page, () => page.getByRole('button', {name: 'Download preparation plan'}).click());
  expect(file.bytes.toString()).toContain('[x] Check degree and course prerequisites');
  await page.reload(); await expect(page.getByRole('button', {name: 'Open menu', exact: true})).toBeEnabled();
  await expect(page.locator('#studio-note')).toHaveValue('Check transcript equivalency.');
  await page.getByRole('tab', {name: 'Official guides'}).click();
  await expect(page.locator('.studio-guide-intro')).toContainText('not universal requirements');
  await expect(page.locator('.studio-guide')).toHaveCount(8);
});

test('backup export/import, cancellation, invalid files and local deletion protect state', async ({page}) => {
  const state = {...empty(), saved: [first.id], notes: {[first.id]: 'Retain this note'}};
  await seed(page, state); await open(page, '#sources');
  const file = await downloaded(page, () => page.getByRole('button', {name: 'Download recovery backup (.json)', exact: true}).click());
  expect(JSON.parse(file.bytes.toString()).workspace.notes[first.id]).toBe('Retain this note');
  await page.locator('#import-workspace').setInputFiles({name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{')});
  await expect(page.locator('#toast')).toContainText('not a valid'); expect((await workspace(page)).saved).toEqual([first.id]);
  const replacement = {...empty(), notes: {[first.id]: 'Imported note'}, saved: [first.id, 'removed-degree']};
  const payload = {name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({version: 2, workspace: replacement}))};
  page.once('dialog', d => d.dismiss()); await page.locator('#import-workspace').setInputFiles(payload);
  expect((await workspace(page)).notes[first.id]).toBe('Retain this note');
  await page.locator('#import-workspace').setInputFiles([]);
  page.once('dialog', d => d.accept()); await page.locator('#import-workspace').setInputFiles(payload);
  await expect(page.locator('#toast')).toHaveText('Workspace restored.');
  expect((await workspace(page)).saved).toEqual([first.id]); expect((await workspace(page)).notes[first.id]).toBe('Imported note');
  page.once('dialog', d => d.dismiss()); await page.getByRole('button', {name: 'Delete local data'}).click();
  expect((await workspace(page)).saved).toEqual([first.id]);
  page.once('dialog', d => d.accept()); await page.getByRole('button', {name: 'Delete local data'}).click();
  expect(await workspace(page)).toEqual(empty());
});

test('blocked storage keeps a useful session and explains the limitation', async ({page}) => {
  await page.addInitScript(() => {Storage.prototype.getItem = Storage.prototype.setItem = () => {throw new DOMException('Storage blocked', 'SecurityError');};});
  await open(page); await browse(page); await page.locator(`[data-save="${first.id}"]`).first().click();
  await navigate(page, 'My shortlist'); await expect(page.locator('.shortlist-drawer')).toContainText(first.title);
  await navigate(page, 'My profile'); await expect(page.locator('#profile-dialog')).toContainText('Session only');
});

test('corrupt storage reports recovery without rendering untrusted data', async ({page}) => {
  await page.addInitScript(key => localStorage.setItem(key, '{broken'), KEY);
  await open(page); await expect(page.locator('#toast')).toContainText('saved workspace could not be read');
  await browse(page); await expect(page.locator('#results .program-card').first()).toBeVisible();
});

test('catalogue outage offers a real retry and preserves existing workspace', async ({page}) => {
  await seed(page, {...empty(), saved: [first.id]}); await page.route('**/data/programs.json', route => route.fulfill({status: 503, body: 'Unavailable'}));
  await page.goto('/'); await expect(page.getByRole('heading', {name: 'The atlas could not load.'})).toBeVisible();
  expect((await workspace(page)).saved).toEqual([first.id]);
  await page.unroute('**/data/programs.json'); await page.getByRole('button', {name: 'Reload the atlas'}).click();
  await expect(page.getByRole('button', {name: 'Open menu', exact: true})).toBeEnabled();
});

test('map failure leaves programme discovery and requirements available', async ({page}) => {
  await page.addInitScript(() => {const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) {return /webgl/i.test(type) ? null : original.call(this, type, ...args);};});
  await open(page); await expect(page.locator('.map-error')).toBeVisible();
  await page.locator('.map-error').getByRole('button', {name: 'Browse programmes'}).click();
  await page.locator(`[data-detail="${first.id}"]`).first().click();
  await page.getByRole('tab', {name: 'Requirements', exact: true}).click();
  await expect(page.locator('#detail-content')).toContainText('Check the original information');
});

test('directory is distinct, lazy loaded and its export includes reuse terms', async ({page}) => {
  let directoryRequests = 0; page.on('request', r => {if (r.url().endsWith('/data/institutions.json')) directoryRequests++;});
  await open(page, '#sources'); expect(directoryRequests).toBe(0);
  await expect(page.locator('.catalogue-explanation')).toContainText('does not establish a master');
  await expect(page.locator('#programme-source-records .source-row')).toHaveCount(0);
  await page.locator('#programme-sources summary').click();
  await expect(page.locator('#programme-source-records .source-row')).toHaveCount(50);
  await page.getByRole('button', {name: 'Show more source records'}).click();
  await expect(page.locator('#programme-source-records .source-row')).toHaveCount(100);
  await page.locator('#programme-sources summary').click();
  await expect(page.locator('#programme-source-records .source-row')).toHaveCount(0);
  await page.getByRole('button', {name: 'Explore institution directory'}).click();
  await expect(page.locator('#result-count')).toContainText('institutions'); expect(directoryRequests).toBe(1);
  await expect(page.locator('#results .institution-card')).toHaveCount(50);
  await page.locator('[data-institution]').first().click();
  await expect(page.locator('#detail-dialog')).toContainText('master');
  await page.getByRole('button', {name: /Close institution/}).click();
  await navigate(page, 'Data & methodology');
  const file = await downloaded(page, () => page.getByRole('button', {name: 'Download directory + licences'}).click());
  const data = JSON.parse(file.bytes.toString()); expect(data.records.length).toBe(30174);
  expect(JSON.stringify(data)).toContain('CC-BY-4.0'); expect(JSON.stringify(data)).toContain('CC0-1.0');
});

test('directory outage returns safely to programme mode', async ({page}) => {
  await page.route('**/data/institutions.json', r => r.fulfill({status: 503, body: 'Unavailable'}));
  await open(page); await page.getByRole('button', {name: 'Filter programmes', exact: true}).click();
  await page.locator('#catalogue-mode').selectOption('institutions');
  await expect(page.locator('#toast')).toContainText('Programme discovery remains available');
  await expect(page.locator('#catalogue-mode')).toHaveValue('programmes');
  await expect(page.locator('#catalogue-mode')).toBeEnabled();
});

test('map projection, zoom bounds and clustering stay stable when only list order changes', async ({page}) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await open(page); await expect(page.locator('.map-canvas')).toHaveClass(/map-ready/);
  const canvas = page.locator('.map-canvas');
  await expect.poll(async()=>Number(await canvas.getAttribute('data-country-label-count'))).toBeGreaterThan(0);
  await page.getByRole('button', {name: 'Show flat map', exact: true}).click();
  await expect(canvas).toHaveAttribute('data-projection', 'mercator');
  await browse(page); const revision = await canvas.getAttribute('data-data-revision');
  await page.locator('#sort').selectOption('name'); await expect(canvas).toHaveAttribute('data-data-revision', revision);
  await page.locator('#sort').selectOption('title'); await expect(canvas).toHaveAttribute('data-data-revision', revision);
  await page.locator('#sort').selectOption('deadline'); await expect(canvas).toHaveAttribute('data-data-revision', revision);
  await page.getByRole('button', {name: 'Close programme list'}).click();
  for (let i = 0; i < 10 && await page.getByRole('button', {name: 'Zoom out', exact: true}).isEnabled(); i++) await page.getByRole('button', {name: 'Zoom out', exact: true}).click();
  await expect.poll(async () => Number(await canvas.getAttribute('data-zoom')) - Number(await canvas.getAttribute('data-min-zoom'))).toBeLessThan(0.02);
  await page.getByRole('button', {name: 'Show 3D globe', exact: true}).click();
  await expect(canvas).toHaveAttribute('data-projection', 'globe'); expect(errors).toEqual([]);
  await expect.poll(async()=>Number(await canvas.getAttribute('data-country-label-count'))).toBeGreaterThan(0);
});

test('keyboard navigation and compact layouts expose visible usable controls', async ({page}, testInfo) => {
  await open(page); await page.keyboard.press('/'); await expect(page.locator('#search')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(page.locator('#map-results')).not.toBeVisible();
  await navigate(page, 'Application studio');
  await page.getByRole('tab', {name: 'Preparation', exact: true}).focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', {name: 'Enquiry draft', exact: true})).toHaveAttribute('aria-selected', 'true');
  const width = await page.evaluate(() => ({scroll: document.documentElement.scrollWidth, viewport: innerWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport + 1);
  await navigate(page, 'My shortlist'); const box = await page.locator('.shortlist-drawer').boundingBox();
  expect(box.width).toBeLessThan(testInfo.project.use.viewport.width);
  await page.getByRole('button', {name: 'Back to the map'}).click();
  await expect(page.locator('.workspace-sheet')).toHaveCount(0);
});

test('registry records expose unreviewed scope and an institution route, not a false programme-page claim', async ({page}) => {
  const p = programmes.find(p => p.registry && !p.registry.programmeUrls.length);
  expect(p).toBeTruthy();
  await open(page); await page.locator('#search').fill(p.title + ' ' + p.university);
  await expect(page.locator('#results')).toContainText('Registry identity · admissions unreviewed');
  await page.locator(`[data-detail="${p.id}"]`).first().click();
  await expect(page.locator('#detail-dialog')).toContainText('Registry-backed degree identity');
  await expect(page.locator('#detail-dialog')).toContainText('No individual programme page or admissions review');
  await expect(page.locator('#detail-dialog').getByRole('link', {name: 'Find programmes at institution'})).toHaveAttribute('href', new URL(p.registry.institutionWebsite).href);
  await expect(page.locator('#detail-dialog').getByRole('link', {name: 'Official programme page', exact: true})).toHaveCount(0);
});

test('catalogue and registry comparisons carry attribution and exclude personal workspace data', async ({page}) => {
  const p = programmes.find(p => p.registry);
  await seed(page, {...empty(), compare: [first.id, p.id], notes: {[first.id]: 'PRIVATE_QA_NOTE'}});
  await open(page, '#sources');
  const catalogue = await downloaded(page, () => page.getByRole('button', {name: 'Download programme catalogue'}).click());
  const data = JSON.parse(catalogue.bytes.toString());
  expect(data.format).toBe('gradatlas-programme-catalogue'); expect(data.records.length).toBe(programmes.length);
  expect(data.sources.duo.attribution).toContain('DUO'); expect(data.sources.locations.licenses.geonames.url).toContain('/by/4.0/');
  expect(catalogue.bytes.toString()).not.toContain('PRIVATE_QA_NOTE');
  await navigate(page, 'Compare programmes');
  const file = await downloaded(page, () => page.getByRole('button', {name: 'Download Excel .xlsx'}).click());
  const workbook = new globalThis.ExcelJS.Workbook(); await workbook.xlsx.load(file.bytes);
  const method = workbook.getWorksheet('Reuse & methodology');
  expect(method.getCell('A4').value).toBe('DUO RIO attribution'); expect(method.getCell('B4').value).toContain('DUO');
});


test('shortlist exports a useful Excel workspace and the menu stays uncluttered', async ({page}) => {
  const state={...empty(),profile:{degree:'Computer Engineering',gpa:'2.82',scale:'4',ielts:'6.5'},saved:[first.id],tasks:{[first.id]:[0,2]},notes:{[first.id]:'My application research'},tracking:{[first.id]:'Preparing'}};
  await seed(page,state);await open(page,'#shortlist');
  const file=await downloaded(page,()=>page.locator('.shortlist-drawer').getByRole('button',{name:'Download Excel .xlsx'}).click());
  expect(file.name).toBe('gradatlas-workspace.xlsx');expect(file.bytes.subarray(0,2).toString()).toBe('PK');
  const book=new globalThis.ExcelJS.Workbook();await book.xlsx.load(file.bytes);
  expect(book.getWorksheet('Applications').getCell('A7').value).toBe(first.title);
  expect(book.getWorksheet('Applications').getCell('G3').value).toBe(2.82);
  expect(book.getWorksheet('Applications').getCell('E7').value).toBe('Preparing');
  expect(book.getWorksheet('Applications').getCell('I7').value).toBe(.25);
  expect(book.getWorksheet('Notes & drafts').getCell('E7').value).toBe('My application research');
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await expect(page.locator('#workspace-menu')).not.toContainText('Free & open source');
  await page.locator('#workspace-menu').getByRole('button',{name:'My profile · local',exact:true}).click();
  await expect(page.locator('#profile-dialog')).toContainText('course prerequisites are not matched automatically');
});
