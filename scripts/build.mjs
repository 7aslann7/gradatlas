import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
await cp('src','dist',{recursive:true});
// Compact the growing catalogue without changing facts or the pinned ROR index bytes.
for(const name of ['programs.json','guidance.json','programme-registry-manifest.json']){
  const path='dist/data/'+name;
  await writeFile(path,JSON.stringify(JSON.parse(await readFile(path,'utf8'))));
}
console.log('Built GradAtlas into dist/.');
