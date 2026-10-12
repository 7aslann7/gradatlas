import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const manifest=JSON.parse(await readFile('src/data/programme-registry-manifest.json','utf8'));
const programmes=JSON.parse(await readFile('src/data/programs.json','utf8'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
test('DUO identity import is reproducible from the pinned attributed snapshot',async()=>{
  const compressed=await readFile(manifest.compressedSnapshot);
  assert.equal(digest(compressed),manifest.compressedSha256);
  assert.equal(digest(gunzipSync(compressed)),manifest.csvSha256);
  assert.equal(digest(await readFile('data-sources/duo-rio-2026-10-12-metadata.json')),manifest.metadataSha256);
  assert.equal(digest(await readFile('scripts/import-duo.py')),manifest.importerSha256);
  const directory=await mkdtemp(join(tmpdir(),'gradatlas-duo-test-'));
  try {
    const output=join(directory,'proposals.json'),audit=join(directory,'audit.json');
    const process=spawnSync('python3',['scripts/import-duo.py','--output',output,'--manifest-output',audit],{encoding:'utf8'});
    assert.equal(process.status,0,process.stderr||process.error?.message);
    const proposals=await readFile(output);assert.equal(digest(proposals),manifest.proposalSha256);
    assert.deepEqual(JSON.parse(proposals),programmes.filter(p=>p.registry));
    const result=JSON.parse(await readFile(audit,'utf8'));
    assert.equal(result.proposedRecordCount,1131);assert.equal(result.licenceVersion,'Publisher did not specify');
  } finally {await rm(directory,{recursive:true,force:true});}
});
