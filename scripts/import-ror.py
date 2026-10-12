"""Build the public institution index from a pinned, checksum-verified ROR v2 release.

This importer records identity/locality facts only. It never creates programme,
accreditation, eligibility, deadline or supervisor-availability claims.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import re
from urllib.parse import urlparse
import zipfile


def project_record(record):
    if record.get('status') != 'active' or 'education' not in record.get('types', []):
        return None
    ror = record.get('id', '')
    if not re.fullmatch(r'https://ror\.org/0[a-z0-9]{8}', ror):
        raise ValueError('Invalid ROR ID')
    names = [n['value'] for n in record['names'] if isinstance(n.get('value'), str)]
    name = next((n['value'] for n in record['names'] if 'ror_display' in n['types']), None)
    if not name:
        raise ValueError('Missing display name')
    locations = []
    for location in record['locations']:
        geo = location['geonames_details']
        lat, lon = geo.get('lat'), geo.get('lng')
        if isinstance(lat, (int, float)) and isinstance(lon, (int, float)) and math.isfinite(lat) and math.isfinite(lon) and -90 <= lat <= 90 and -180 <= lon <= 180:
            locations.append((location, geo))
    if not locations:
        raise ValueError('Active education record without a valid locality')
    location, geo = locations[0]
    website = next((link['value'] for link in record.get('links', []) if link.get('type') == 'website' and urlparse(link.get('value', '')).scheme in ('http', 'https') and urlparse(link['value']).netloc), None)
    return {'id': 'ror-' + ror.rsplit('/', 1)[-1], 'ror': ror, 'kind': 'institution',
            'name': name, 'names': sorted(set(names) - {name}), 'website': website,
            'country': geo['country_name'], 'countryCode': geo['country_code'],
            'city': geo['name'], 'lat': geo['lat'], 'lon': geo['lng'],
            'geonamesId': location['geonames_id']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', required=True, type=Path)
    parser.add_argument('--release', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--manifest-output', required=True, type=Path)
    args = parser.parse_args()
    release = json.loads(args.release.read_text())
    raw = args.archive.read_bytes()
    algorithm, expected = release['archiveChecksum'].split(':', 1)
    if algorithm != 'md5' or hashlib.md5(raw).hexdigest() != expected:
        raise ValueError('Archive does not match the pinned publisher checksum')
    with zipfile.ZipFile(args.archive) as archive:
        source = json.loads(archive.read(release['sourceFilename']))
    records = sorted(filter(None, (project_record(record) for record in source)), key=lambda record: record['id'])
    if len({record['id'] for record in records}) != len(records):
        raise ValueError('Duplicate ROR identifiers')
    payload = (json.dumps(records, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
    manifest = {**release, 'archiveSha256': hashlib.sha256(raw).hexdigest(),
                'projection': 'One point per active education ROR ID; first valid GeoNames locality. No synthetic campus offsets.',
                'indexSha256': hashlib.sha256(payload).hexdigest(), 'indexSizeBytes': len(payload),
                'indexCount': len(records), 'indexCountryCount': len({record['countryCode'] for record in records}),
                'indexWebsiteCount': sum(bool(record['website']) for record in records)}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.manifest_output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(payload)
    args.manifest_output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f"Imported {len(records):,} education institutions across {manifest['indexCountryCount']} countries/territories. No programmes inferred.")


if __name__ == '__main__':
    main()
