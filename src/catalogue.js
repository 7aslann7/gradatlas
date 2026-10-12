function safeURL(value) {
  try {const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;} catch {return null;}
}
export function programmeRoute(programme) {
  if (!programme.registry) return {url: programme.sources[0].url, label: 'Official programme page', studioLabel: 'Programme instructions'};
  const programmeURL = programme.registry.programmeUrls?.map(safeURL).find(Boolean);
  if (programmeURL) return {url: programmeURL, label: 'Programme link · registry supplied', studioLabel: 'Registered programme link'};
  const website = safeURL(programme.registry.institutionWebsite);
  if (website) return {url: website, label: 'Find programmes at institution', studioLabel: 'Find programme instructions'};
  return {url: programme.sources.find(source => /dataset description/i.test(source.label))?.url || programme.registry.sourceUrl, label: 'Official degree registration', studioLabel: 'Official degree registration'};
}
export function catalogueSummary(programmes) {
  const registry = programmes.filter(programme => !!programme.registry).length;
  return {total: programmes.length, programmeSources: programmes.length - registry, registry, countries: new Set(programmes.map(programme => programme.country)).size, fields: new Set(programmes.flatMap(programme => programme.fields)).size};
}
export function programmeExport(programmes, registryManifest, institutionManifest) {
  if (programmes.some(programme => programme.registry) && (!registryManifest?.attribution || !registryManifest?.resolvedLicenceUrl || !institutionManifest?.licenses?.geonames)) throw Error('Programme registry provenance unavailable');
  return {format: 'gradatlas-programme-catalogue', version: 1, scope: catalogueSummary(programmes),
    accuracy: 'Research aid only. Registry degree identity is separate from reviewed admission criteria. No guarantee of factual accuracy, current links, intake availability or completeness. Double-check official applicant-specific requirements before applying.',
    reuse: 'The software MIT licence does not relicense university pages or third-party datasets. Retain applicable source attribution, licence links and modification notices. Referenced pages retain their own terms.',
    sources: {duo: registryManifest || null, locations: institutionManifest ? {attribution: institutionManifest.attribution, licenses: institutionManifest.licenses, recordUrl: institutionManifest.recordUrl, projection: institutionManifest.projection} : null},
    records: programmes};
}
