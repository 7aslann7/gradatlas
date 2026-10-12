import {escapeHTML as e,compareNames} from './core.js';

export function filterInstitutions(records,filters) {
  const query=(filters.query||'').trim().toLocaleLowerCase('en');
  const list=records.filter(p=>(!filters.country||p.country===filters.country)&&(!query||[p.name,p.city,p.country,...p.names].join(' ').toLocaleLowerCase('en').includes(query)));
  list.sort((a,b)=>compareNames(a.name,b.name)||compareNames(a.country,b.country)||compareNames(a.city,b.city)||(a.id<b.id?-1:a.id>b.id?1:0));
  return list;
}

export function institutionCard(p,icon) {
  return `<article class="program-card institution-card"><button class="title-button" data-institution="${p.id}">${e(p.name)}</button><p class="university-name">${e(p.city)}, ${e(p.country)}</p><p class="institution-scope">Institution directory · degree availability not verified</p><button class="card-link" data-institution="${p.id}">View institution ${icon('arrow')}</button></article>`;
}

export function institutionExport(records,manifest) {
  if(!Array.isArray(records)||records.length!==manifest?.indexCount||!manifest.licenses?.ror||!manifest.licenses?.geonames)throw Error('Incomplete directory provenance');
  return {
    format:'gradatlas-institution-directory',version:1,
    scope:'Active education-type ROR identity records. Not a complete university list, verified masters catalogue or accreditation register.',
    attribution:manifest.attribution,
    reuse:'ROR metadata retains CC0 1.0. GeoNames geographic data retains CC BY 4.0: preserve attribution, licence links and modification notices. No additional restrictions or endorsement are implied.',
    accuracy:'Supplied as recorded in the pinned source release, without a guarantee of accuracy, timeliness or completeness. Coordinates are approximate localities; website availability and degree offerings require separate checks.',
    checksumScope:'source.indexSha256 describes the published compact institutions.json file, not this export envelope.',
    source:manifest,records
  };
}

export function institutionDetail(p,manifest,icon) {
  const website=p.website?`<a class="button" href="${e(p.website)}" target="_blank" rel="noopener noreferrer">Institution website · ROR link ${icon('external')}</a>`:'';
  return `<header class="detail-header"><button class="dialog-close" data-close="detail" aria-label="Close institution details">${icon('close')}</button><h1 id="detail-title">${e(p.name)}</h1><p>${e(p.city)}, ${e(p.country)}</p></header><div class="detail-content"><div class="callout">Institution directory. This ROR record does not confirm accreditation, master's availability, current admissions or supervisor capacity.</div><h2>Explore the institution</h2><p>Look for postgraduate programmes, the relevant department and applicant-specific admissions instructions on the institution's website. This registry-provided website link has not been independently checked for current availability.</p>${website}<h2>Identity and location sources</h2><p>Active education-type record in the Research Organization Registry, snapshot ${e(manifest.release)} · ${e(manifest.releasedAt)}. ROR focuses on research-related organisations; this is not an exhaustive list of universities. Independently identified organisations and campuses can have separate records.</p><p>Coordinates identify an approximate GeoNames locality. They are not independently verified campus entrances; several institutions can share a city location.</p><a class="source-link" href="${e(p.ror)}" target="_blank" rel="noopener noreferrer">ROR identity record ${icon('external')}</a><a class="source-link" href="https://www.geonames.org/${p.geonamesId}/" target="_blank" rel="noopener noreferrer">GeoNames locality ${icon('external')}</a><a class="source-link" href="${e(manifest.recordUrl)}" target="_blank" rel="noopener noreferrer">Dataset release & licence ${icon('external')}</a></div>`;
}
