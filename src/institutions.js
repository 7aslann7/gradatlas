import {escapeHTML as e} from './core.js';

export function filterInstitutions(records,filters) {
  const query=(filters.query||'').trim().toLocaleLowerCase('en');
  const list=records.filter(p=>(!filters.country||p.country===filters.country)&&(!query||[p.name,p.city,p.country,...p.names].join(' ').toLocaleLowerCase('en').includes(query)));
  if(filters.sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}

export function institutionCard(p,icon) {
  return `<article class="program-card institution-card"><button class="title-button" data-institution="${p.id}">${e(p.name)}</button><p class="university-name">${e(p.city)}, ${e(p.country)}</p><p class="institution-scope">Institution directory · degree availability not verified</p><button class="card-link" data-institution="${p.id}">View institution ${icon('arrow')}</button></article>`;
}

export function institutionDetail(p,manifest,icon) {
  const website=p.website?`<a class="button" href="${e(p.website)}" target="_blank" rel="noopener noreferrer">Official website ${icon('external')}</a>`:'';
  return `<header class="detail-header"><button class="dialog-close" data-close="detail" aria-label="Close institution details">${icon('close')}</button><h1 id="detail-title">${e(p.name)}</h1><p>${e(p.city)}, ${e(p.country)}</p></header><div class="detail-content"><div class="callout">Institution directory. This ROR record does not confirm accreditation, master's availability, current admissions or supervisor capacity.</div><h2>Explore the official institution</h2><p>Look for postgraduate programmes, the relevant department and applicant-specific admissions instructions on the institution's own website.</p>${website}<h2>Identity and location sources</h2><p>Active education-type record in the Research Organization Registry, snapshot ${e(manifest.release)} · ${e(manifest.releasedAt)}. The education category includes institutions and subdivisions beyond universities.</p><p>Coordinates identify an approximate GeoNames locality. They are not independently verified campus entrances; several institutions can share a city location.</p><a class="source-link" href="${e(p.ror)}" target="_blank" rel="noopener noreferrer">ROR identity record ${icon('external')}</a><a class="source-link" href="https://www.geonames.org/${p.geonamesId}/" target="_blank" rel="noopener noreferrer">GeoNames locality ${icon('external')}</a><a class="source-link" href="${e(manifest.recordUrl)}" target="_blank" rel="noopener noreferrer">Dataset release & licence ${icon('external')}</a></div>`;
}
