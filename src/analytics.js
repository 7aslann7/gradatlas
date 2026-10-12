// Public site identifiers from Cloudflare's HTML snippets, not API credentials.
// Keep forks, local previews and other GitHub projects outside our metrics.
export function analyticsConfig({protocol,hostname,pathname}) {
  if(protocol!=='https:')return null;
  if(hostname==='7aslann7.github.io'&&(pathname==='/gradatlas'||pathname.startsWith('/gradatlas/')))
    return {token:'5894aa259a78488b9d2e0c59daf03150',spa:false};
  return null;
}

if(typeof document!=='undefined') {
  const config=analyticsConfig(window.location);
  if(config&&!document.querySelector('script[data-cf-beacon]')) {
    const script=document.createElement('script');
    script.type='module';script.src='https://static.cloudflareinsights.com/beacon.min.js';
    script.dataset.cfBeacon=JSON.stringify(config);
    document.body.append(script);
  }
}
