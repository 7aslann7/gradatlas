"""Reproduce the bounded DUO RIO master's identity proposal import.

No admission, application-window, fee, calendar-duration or delivery-mode facts
are inferred. Input is pinned by SHA-256; output is not written to the repo.
"""
import argparse
import gzip
import csv
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = '2026-10-12'
CSV_PATH = ROOT / 'data-sources/duo-rio-2026-10-12.csv.gz'
CSV_SHA256 = '079fc3bd5ee702cb71f11d63e6e1c900daa6fd72b0deae51f4eea8410da2d53d'
SOURCE = 'https://onderwijsdata.duo.nl/dataset/7c0686f4-b5c2-418e-8e44-7be0057d8084/resource/ffffa7ad-e6a2-4ba7-9fc2-a09df4128555/download/ho_opleidingsoverzicht.csv'
DATASET = 'https://onderwijsdata.duo.nl/datasets/ho_opleidingsoverzicht'
LICENCE = 'https://opendefinition.org/licenses/cc-by/'
EXISTING_PATH = ROOT / 'src/data/programs.json'
METADATA_PATH = ROOT / 'data-sources/duo-rio-2026-10-12-metadata.json'

# The government board identifiers refer to these parent institutions. ROR is
# used only for canonical names and approximate localities, not programme facts.
BOARDS = {
 '100B349':'047cqa323','100B379':'005t9n460','100B490':'00xqtxw43',
 '100B561':'026e19k63','101B423':'03cfsyg37','105B698':'02ar29j81',
 '105B769':'05jext738','106B216':'01jwcme05','107B304':'0500gea42',
 '107B446':'04vtvrr13','107B448':'012p63287','107B449':'04pp8hn57',
 '107B450':'02c2kyt77','107B451':'04qw24q55','107B454':'053jpjd80',
 '107B460':'0230zs006','107B461':'016w23120','107B464':'0093src13',
 '107B470':'018t8yw14','107B471':'02jz4aj89','107B473':'04dkp9463',
 '107B477':'015d5s513','107B481':'04b8v1s79','107B482':'008xxew50',
 '107B483':'04dde1554','107B484':'016xsfp80','107B487':'03s2fjy85',
 '107B489':'0481e1q24','107B497':'018dfmf50','107B517':'02m6k0m40',
 '107B523':'006hf6230','107B525':'039vq9023','107B531':'04tj5wz42','107B536':'02xgxme97',
 '107B542':'04mfj5474','107B544':'04w5ec154','107B549':'00y2z2s03',
 '107B553':'028z9kw20','107B561':'03xws5b35','107B576':'057w15z03',
 '107B578':'027bh9e22','107B580':'05az93f25','107B582':'02mdbnd10',
 '107B584':'021zvq422','107B585':'04zmc0e16','107B605':'02e2c7k09',
 '107B615':'018bzp792','107B617':'02x435584',
}

FIELDS = [
 ('Cybersecurity',r'cyber|digital forensics|security and network|data protection|privacy|digital security'),
 ('Quantum Computing',r'quantum'),
 ('AI & Machine Learning',r'artificial intelligence|machine learning|data science|data driven|intelligent|business analytics'),
 ('Computer Science',r'computer|computing|computational|informatics|informatica|software|information systems|information science|information studies|applied it|\bit\b|ict:|digital business|digital innovation|business information|data science|gamified reality|serious gaming|embedded systems'),
 ('Architecture & Planning',r'architecture|architectuur|urban|landscape|spatial planning|stedenbouw|ruimtelijke|city developer'),
 ('Education',r'education|educational|teaching|teacher|leraar|leren|onderwijs|pedagog|learning and innovation|kind en educatie|jonge kind|talent development'),
 ('Law',r'\blaws?\b|\bllm\b|\bll\.m|recht|legal|justice|forensic|notarial|criminolog|aansprakelijkheid|togamaster|children.?s rights|dispute settlement|arbitration'),
 ('Medicine & Public Health',r'health|medical|medicine|nursing|nurse|physician|clinical|epidemi|therapy|therap|physiotherapy|rehabilitation|revalid|zorg|gezond|genees|tandheel|farmacie|pharmacy|pharmaceutical|midwifery|movement|sport|voeding|oncology|critical care|infection|immunity|drug discovery'),
 ('Life Sciences',r'biology|biological|biomedical|biomolecular|biotechnology|biobased|biosciences|molecular|neuroscience|brain|nutrition|veterinary|plant|animal|food science|bioinformatics|agricultur|oncology|drug discovery|infection|immunity'),
 ('Physics & Mathematics',r'physics|mathemat|statistics|statistical|actuarial|astronomy|chemistry|chemical|natuurkunde|wiskunde|scheikunde|quantum|nanoscience|\blogic\b|computational science'),
 ('Economics & Finance',r'economic|econometric|finance|financial|account|auditing|actuarial|banking|fiscal|mergers|acquisitions|valuation|insurance|real estate'),
 ('Business & Management',r'business|management|marketing|entrepreneur|organisation|organization|corporate|hotel|hospitality|logistics|innovation|leadership|coaching|audit|bedrijfs|risico|integrale bedrijfsvoering|\bmba\b|procurement|adviseur mkb|mergers|acquisitions|valuation|insurance|risk|leisure|tourism|supply chain|customs|real estate'),
 ('Engineering',r'engineering|technology|nanotechnology|robotics|systems and control|textile|materials|polymer|safety|geoinformation|geomatics|bouw|biobased|metropolitan|embedded systems|nanoscience'),
 ('Environment',r'environment|sustainab|climate|ecology|ecological|earth|geoscience|water|marine|forest|agricultur|rural|circular|resource|duurzaam|circulaire|energy|food|landscape|biobased|river|delta|spatial sciences|geograph|geo.information|hydrology|cartography'),
 ('Public Policy',r'public policy|public administration|governance|international development|political|politic|policy|development studies|social policy|bestuurs|public affairs'),
 ('Social Sciences',r'social|societ|sociolog|psycholog|anthropolog|geography|communication|politic|development studies|migration|population|demography|socio|behaviour|behavior|pedagog|human development|cultural|media|european studies|international relations|gender|talent development|diversity|jeugd|gezin|cognitive|human decision|individual differences|community development|contextuele'),
 ('Arts & Humanities',r'arts|\bart\b|culture|cultural|humanities|humanistic|heritage|history|historical|language|linguistic|literature|literary|philosophy|theolog|religio|music|opera|dance|choreograph|sonology|theatre|theater|design|film|media|archaeology|classics|ancient|european studies|area studies|\beast\b|eastern studies|asian|african|american|turkish|dutch|english|classical|filosofie|translation|animation|creative producing|illustration|performance|performing'),
]

# These five vague titles have a narrowly reviewed institutional description
# solely to support their discovery subject facet. Admissions remain unreviewed.
SUBJECT_OVERRIDES = {
 'Global Challenges':(['Environment','Public Policy','Social Sciences'],'https://www.ru.nl/en/radboud-centre-social-sciences/programmes/global-challenges/professional-programme-global-challengesamid'),
 'Professioneel Meesterschap':(['Education'],'https://www.hva.nl/opleidingen/master-pedagogiek-en-onderwijskunde-professioneel-meesterschap'),
 'Passend Meesterschap':(['Education'],'https://www.marnixacademie.nl/evenementen/meeloopdagen-master-passend-meesterschap/'),
 'Experiential Knowledge':(['Social Sciences','Medicine & Public Health'],'https://www.windesheim.nl/opleidingen/deeltijd/master/master-ervaringsdeskundigheid'),
 'Crossover Creativity':(['Arts & Humanities'],'https://www.hku.nl/en/study-at-hku/creative-transformation/master-crossover-creativity-%28part-time%29'),
}

def norm(value):
 value = unicodedata.normalize('NFKD',value).casefold()
 value = ''.join(c for c in value if not unicodedata.combining(c))
 value = re.sub(r'\b(master of science|master of arts|master|msc|ma|llm|m sc|m a)\b',' ',value)
 return re.sub(r'[^a-z0-9]','',value)

def current(row):
 if row['BEGINDATUM'] and row['BEGINDATUM']>SNAPSHOT:return False
 if row['EINDDATUM'] and row['EINDDATUM']<=SNAPSHOT:return False
 if row['AANGEBODEN_OPLEIDING_BEGINDATUM'] and row['AANGEBODEN_OPLEIDING_BEGINDATUM']>SNAPSHOT:return False
 if row['AANGEBODEN_OPLEIDING_EINDDATUM'] and row['AANGEBODEN_OPLEIDING_EINDDATUM']<=SNAPSHOT:return False
 return True

def programme_name(rows):
 # Legal degree names, rather than branded track names, are retained.
 names=Counter(r['INTERNATIONALE_NAAM'].strip() for r in rows if r['INTERNATIONALE_NAAM'].strip())
 if names:return names.most_common(1)[0][0]
 names=Counter(r['NAAM_LANG'].strip() for r in rows if r['NAAM_LANG'].strip())
 return names.most_common(1)[0][0] if names else None

def safe_https(value):
 try:
  u=urlparse(value)
  return bool(u.scheme=='https' and u.netloc and not u.username and not u.password)
 except ValueError:return False

def safe_web(value):
 try:
  u=urlparse(value)
  return bool(u.scheme in {'http','https'} and u.netloc and not u.username and not u.password)
 except ValueError:return False

def run(args):
 raw=gzip.decompress(args.csv.read_bytes()) if args.csv.suffix=='.gz' else args.csv.read_bytes()
 if hashlib.sha256(raw).hexdigest()!=CSV_SHA256:raise ValueError('DUO CSV checksum mismatch')
 rows=list(csv.DictReader(raw.decode('utf-8-sig').splitlines()))
 insts={x['ror'].rsplit('/',1)[-1]:x for x in json.loads((ROOT/'src/data/institutions.json').read_text())}
 existing=[p for p in json.loads(args.existing.read_text()) if not p.get('registry')]
 existing_nl=[p for p in existing if p['country']=='Netherlands']
 groups=defaultdict(list);held=[];counts=Counter()
 for r in rows:
  if r['GRAAD']!='MASTER' or r['SOORT']!='OPLEIDING':continue
  if not current(r):counts['future_or_ended_rows']+=1;continue
  if not re.fullmatch(r'\d{5}',r['ERKENDEOPLEIDINGSCODE']):counts['no_recognised_code_rows']+=1;continue
  if r['ERKENNER'] not in ['NVAO','OCW']:counts['unrecognised_authority_rows']+=1;continue
  groups[(r['ONDERWIJSBESTUURID'],r['ERKENDEOPLEIDINGSCODE'])].append(r)
 # The international/legal title alone cannot establish that identically named
 # registration codes are separate applicant routes. Group those conservatively
 # and retain all codes rather than inflate counts during degree replacements.
 named_groups=defaultdict(list)
 for (board,code),rs in groups.items():
  name=programme_name(rs)
  named_groups[(board,(name or '').casefold())].extend(rs)
 output=[];excluded=[];seen_joint=set();seen_identity=set();merged=[]
 for (board,name_key),rs in sorted(named_groups.items()):
  codes=sorted({r['ERKENDEOPLEIDINGSCODE'] for r in rs})
  code=codes[0]
  name=programme_name(rs)
  if len(codes)>1:merged.append({'boardId':board,'title':name,'degreeIds':codes,'reason':'Identically named registrations; distinct routes or replacement relationship not individually reviewed'})
  rid=BOARDS.get(board)
  # The Hague arts degrees have two separately named teaching institutions.
  if board=='107B546':
   rid='01mwwwn80' if re.search(r'music|opera|sonology',name or '',re.I)else'00490vc18'
  if not rid or rid not in insts:
   held.append({'reason':'Institution mapping needs review','boardId':board,'degreeId':code,'title':name,'institution':rs[0]['ONDERWIJSBESTUUR_NAAM']});continue
  inst=insts[rid];university=inst['name']
  if not name:held.append({'reason':'Missing degree title','boardId':board,'degreeId':code});continue
  names={norm(v)for r in rs for k in ['NAAM_LANG','INTERNATIONALE_NAAM','EIGENNAAM_ENGELS'] if(v:=r[k].strip())}
  duplicate=None
  for p in existing_nl:
   institution_match=norm(university)in norm(p['university'])or norm(p['university'])in norm(university)
   aliases={norm(p['title'])}
   # Only exact degrees are excluded. A parent degree may coexist with an
   # explicitly catalogued specialisation under the documented data policy.
   if p['id']=='uva-vu-cs':aliases.update(['computersciencejointdegree','computerscience'])
   if p['id']=='delft-leiden-quantum':aliases.update(['quantuminformationscienceandtechnologyjointdegree','quantuminformationsciencetechnologyjointdegree'])
   if p['id']=='maastricht-dsdm':aliases.add('datascienceanddecisionmaking')
   if p['id']=='leiden-cs':aliases.add('computerscience')
   if p['id']=='uva-security-network':aliases.add('securitynetworkengineering')
   if p['id']=='jads-data-science-business-entrepreneurship':aliases.add('datascienceinbusinessandentrepreneurshipjointdegree')
   joint_match=p['id']in ['uva-vu-cs','delft-leiden-quantum'] and ('joint' in name.lower())
   if(institution_match or joint_match)and names&aliases:duplicate=p['id'];break
  if duplicate:
   excluded.append({'reason':'Existing or independently reviewed pending degree identity','boardId':board,'degreeIds':codes,'title':name,'existingId':duplicate});continue
  joint=bool(re.search(r'joint\s*(degree|programme|program)|\(jd\)',name,re.I))
  if joint and code in seen_joint:
   excluded.append({'reason':'Joint degree already represented','boardId':board,'degreeId':code,'title':name});continue
  if joint:seen_joint.add(code)
  identity=(university.casefold(),name.casefold())
  if identity in seen_identity:
   held.append({'reason':'Same institution and title with distinct registration code','boardId':board,'degreeId':code,'title':name});continue
  seen_identity.add(identity)
  text=' '.join([name,*sorted({r['NAAM_LANG']for r in rs})])
  subjects=[field for field,pattern in FIELDS if re.search(pattern,text,re.I)]
  subject_override=SUBJECT_OVERRIDES.get(name)
  if subject_override:subjects=subject_override[0]
  if not subjects:
   held.append({'reason':'Subject taxonomy needs review','boardId':board,'degreeId':code,'title':name});continue
  languages=set()
  for r in rs:
   for token in r['VOERTAAL'].split(','):
    if token in {'ENG','NLD','DEU'}:languages.add({'ENG':'English','NLD':'Dutch','DEU':'German'}[token])
  language=' / '.join(sorted(languages))+' · registered offerings' if languages else'Not verified'
  sources=[{'label':'DUO RIO official degree-registration snapshot (identity evidence)','url':SOURCE},
           {'label':'DUO dataset description and attribution licence','url':DATASET},
           {'label':'ROR institution identity and approximate locality','url':inst['ror']},
           {'label':'GeoNames locality used through ROR (geographic source)','url':f'https://www.geonames.org/{inst["geonamesId"]}/'},
           {'label':'GeoNames geographic reuse terms','url':'https://www.geonames.org/about.html'}]
  institution_website=inst.get('website') if safe_web(inst.get('website',''))else None
  if institution_website and safe_https(institution_website):sources.append({'label':'Institution website supplied in ROR (not individually reviewed)','url':institution_website})
  if subject_override:sources.append({'label':'Institution programme description reviewed for subject classification only','url':subject_override[1]})
  programme_urls=sorted({r['WEBSITE'].strip()for r in rs if r['WEBSITE'].strip()})
  for u in programme_urls:
   if safe_https(u):sources.append({'label':'Institution URL supplied in RIO (not individually reviewed)','url':u})
  evidence={'degree':{'source':SOURCE,'checkedAt':SNAPSHOT}}
  if languages:evidence['language']={'source':SOURCE,'checkedAt':SNAPSHOT}
  registry={'provider':'DUO RIO','degreeId':code,'institutionId':board,'snapshotDate':SNAPSHOT,
            'sourceUrl':SOURCE,'licenceUrl':LICENCE,'licenceName':'Creative Commons Attribution (publisher version unspecified)',
            'degreeIds':codes,'institutionWebsite':institution_website,'institutionWebsiteSource':inst['ror'],
            'degreeUnitIds':sorted({r['OPLEIDINGSEENHEIDCODE']for r in rs}),
            'offeringIds':sorted({r['AANGEBODEN_OPLEIDINGCODE']for r in rs if r['AANGEBODEN_OPLEIDINGCODE']}),
            'providerIds':sorted({r['ONDERWIJSAANBIEDERID']for r in rs if r['ONDERWIJSAANBIEDERID']}),
            'originalTitles':sorted({r['NAAM_LANG']for r in rs}),
            'registeredInternationalTitles':sorted({r['INTERNATIONALE_NAAM']for r in rs if r['INTERNATIONALE_NAAM']}),
            'titleMethod':'Publisher international title where supplied; otherwise native legal title. No generated translation.',
            'subjectMethod':'Discovery facets inferred from registered title; not institution-certified curriculum classification.' if not subject_override else'Original discovery facets based on a narrowly reviewed institutional description; admission details not reviewed.',
            'subjectSource':subject_override[1] if subject_override else SOURCE,
            'identicallyNamedRegistrationsMerged':len(codes)>1,
            'levels':sorted({r['NIVEAU']for r in rs}),'award':'MASTER',
            'studyLoads':sorted({r['STUDIELAST']for r in rs if r['STUDIELAST']}),
            'studyForms':sorted({r['VORM']for r in rs if r['VORM']}),
            'programmeUrls':programme_urls,'ror':inst['ror'],'locationAccuracy':'institution-city',
            'location':{'provider':'GeoNames via ROR','geonamesId':inst['geonamesId'],'sourceUrl':f'https://www.geonames.org/{inst["geonamesId"]}/','rorSource':inst['ror'],'licenceUrl':'https://creativecommons.org/licenses/by/4.0/','scope':'Approximate institution city/locality; not an independently reviewed campus coordinate'},
            'scope':'Registered degree identity; no current intake or admissions review'}
  output.append({'id':f'duo-rio-{board.lower()}-{code}','title':name,'university':university,
                 'country':'Netherlands','city':inst['city'],'lat':inst['lat'],'lon':inst['lon'],
                 'fields':subjects,'tags':['Registered master\u2019s degree','DUO RIO identity'],
                 'summary':f'Registered master\u2019s degree in {name}, identified in the current Dutch government RIO snapshot. Admission details require a separate institutional review.',
                 'gradeNote':'Admission criteria have not been individually reviewed; no numerical GPA cutoff is recorded.',
                 'requirements':['Prior qualification and subject-entry requirements have not been reviewed.',
                                 'Check the institution\u2019s current admissions page for documents and accepted language evidence.',
                                 'Fees and applicant-specific application dates are not verified.'],
                 'sources':sources,'duration':'Not verified','language':language,'mode':'Not verified','checkedAt':SNAPSHOT,
                 'tuition':{'label':'Not verified \u00b7 check institution fee schedule','free':False},
                 'window':None,'gpa':None,'ielts':None,'contact':None,'research':None,
                 'dataNote':'Official DUO RIO registration evidence only. No individual programme page or admissions review has been completed. Registered language describes offerings, not an English certificate or guaranteed English-only route. Calendar duration and delivery are unverified. The map point is an approximate institution/city locality. Subject groups are assigned from the registered title.',
                 'evidence':evidence,'registry':registry})
 output.sort(key=lambda p:(p['university'],p['title'],p['id']))
 outpath=args.output
 outpath.parent.mkdir(parents=True,exist_ok=True)
 payload=(json.dumps(output,ensure_ascii=False,indent=2)+'\n').encode()
 temporary=outpath.with_suffix('.json.tmp')
 temporary.write_bytes(payload)
 temporary.replace(outpath)
 audit={'snapshotDate':SNAPSHOT,'publisher':'DUO RIO','sourceUrl':SOURCE,'datasetUrl':DATASET,
        'metadataSourceUrl':'https://onderwijsdata.duo.nl/api/3/action/package_show?id=ho_opleidingsoverzicht',
        'metadataModified':'2026-10-12T02:36:36.727879','resourceModified':'2026-10-12T02:35:35.077783',
        'licenceId':'cc-by','licenceName':'Creative Commons Attribution','licenceVersion':'Publisher did not specify',
        'publisherLicenceUrl':'http://www.opendefinition.org/licenses/cc-by','resolvedLicenceUrl':LICENCE,
        'attribution':'Source: DUO, Registratie Instellingen en Opleidingen (RIO), HO Opleidingsoverzicht, snapshot updated 12 October 2026. GradAtlas filtered and grouped the source records; DUO does not endorse this reuse.',
        'csvSha256':CSV_SHA256,'csvSizeBytes':len(raw),'csvRowCount':len(rows),
        'rawMasterRowCount':sum(r['GRAAD']=='MASTER'for r in rows),'eligibleIdentityGroups':len(groups),
        'proposedRecordCount':len(output),'proposedInstitutionCount':len({p['university']for p in output}),
        'proposalSha256':hashlib.sha256(payload).hexdigest(),'proposalSizeBytes':len(payload),
        'filterCounts':dict(counts),'excluded':excluded,'held':held,'mergedIdenticalNames':merged,
        'projection':'MASTER + OPLEIDING; current registration and offering dates where supplied; recognised 5-digit code and NVAO/OCW; board+registered degree grouping, then identically named registrations grouped conservatively with all degree codes retained; named joint degrees deduplicated across boards. Parent degree names retained, variants excluded. No individual admission review.',
        'coordinateProvider':'GeoNames via ROR','coordinateLicence':'CC-BY-4.0','coordinateLicenceUrl':'https://creativecommons.org/licenses/by/4.0/','coordinateScope':'Institution city/locality only; not independently reviewed campus coordinates',
        'existingCatalogueRecordCount':len(existing),
        'institutionIndexSha256':hashlib.sha256((ROOT/'src/data/institutions.json').read_bytes()).hexdigest(),
        'existingCatalogueSha256':hashlib.sha256(args.existing.read_bytes()).hexdigest(),
        'metadataSha256':hashlib.sha256(args.metadata.read_bytes()).hexdigest(),
        'importerSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
 manifest_path=args.manifest_output
 manifest_path.parent.mkdir(parents=True,exist_ok=True)
 temporary_manifest=manifest_path.with_suffix('.json.tmp')
 temporary_manifest.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
 temporary_manifest.replace(manifest_path)
 print(json.dumps({k:audit[k]for k in ['csvRowCount','rawMasterRowCount','eligibleIdentityGroups','proposedRecordCount','proposedInstitutionCount','filterCounts']},ensure_ascii=False,indent=2))
 print('excluded',len(excluded),'held',len(held),'held reasons',dict(Counter(x['reason']for x in held)))
 print('Held titles',[(x.get('title'),x['reason'])for x in held])

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--csv',type=Path,default=CSV_PATH,help='Pinned CSV or gzip snapshot')
 parser.add_argument('--existing',type=Path,default=EXISTING_PATH,help='Catalogue used to reconcile reviewed records; registry rows are excluded')
 parser.add_argument('--metadata',type=Path,default=METADATA_PATH)
 parser.add_argument('--output',type=Path,required=True,help='Review proposal JSON; this does not mutate the live catalogue')
 parser.add_argument('--manifest-output',type=Path,required=True)
 run(parser.parse_args())
