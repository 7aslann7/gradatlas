#!/usr/bin/env python3
"""Build small, self-hosted context layers from a pinned Natural Earth release.

Download the four source files listed in data-sources/natural-earth-details.json
into a directory, then run: python3 scripts/import-map-details.py DIRECTORY.
No geographic data is fetched by this importer or from visitors' browsers.
"""
import hashlib
import json
import math
import sys
from pathlib import Path

REVISION = 'ca96624a56bd078437bca8184e78163e5039ad19'
ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])


def simplify(points, tolerance=0.008):
    """Douglas-Peucker in degrees; retain endpoints and valid closed rings."""
    if len(points) < 4:
        return [[round(v, 4) for v in p[:2]] for p in points]
    keep = {0, len(points) - 1}
    stack = [(0, len(points) - 1)]
    while stack:
        first, last = stack.pop()
        ax, ay = points[first][:2]
        bx, by = points[last][:2]
        dx, dy = bx - ax, by - ay
        length = dx * dx + dy * dy
        best, index = tolerance * tolerance, None
        for i in range(first + 1, last):
            x, y = points[i][:2]
            t = max(0, min(1, ((x - ax) * dx + (y - ay) * dy) / length)) if length else 0
            distance = (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2
            if distance > best:
                best, index = distance, i
        if index is not None:
            keep.add(index)
            stack.extend([(first, index), (index, last)])
    result = [[round(v, 4) for v in points[i][:2]] for i in sorted(keep)]
    if points[0] == points[-1] and len(result) < 4:
        result = [[round(v, 4) for v in points[i][:2]] for i in [0, len(points)//3, 2*len(points)//3, len(points)-1]]
    return result


def geometry(g):
    kind, coords = g['type'], g['coordinates']
    depth = {'LineString': 0, 'MultiLineString': 1, 'Polygon': 1, 'MultiPolygon': 2}[kind]
    def walk(value, level):
        return simplify(value) if level == 0 else [walk(part, level-1) for part in value]
    return {'type': kind, 'coordinates': walk(coords, depth)}


manifest = {
    'publisher': 'Natural Earth', 'sourceRevision': REVISION, 'licence': 'Public domain',
    'licenceUrl': 'https://www.naturalearthdata.com/about/terms-of-use/',
    'scope': 'Simplified country outlines, first-level administrative boundaries, selected populated places and lakes. Context only; not campus, street or navigation data. Natural Earth default de facto boundary view.',
    'transformations': 'Retained geographic coordinates and English/source place names. Feature IDs combine publisher ID with source row to disambiguate duplicate upstream IDs. Omitted null geometries and unused properties; rounded to four decimals; Douglas-Peucker simplification at 0.008 degrees. Publisher min_zoom values bounded for gradual display; map collision placement may omit names.',
    'assets': []
}
specs = [
    ('ne_10m_admin_0_countries', 'detail-countries', lambda p: {'name': p['NAME']}),
    ('ne_10m_admin_1_states_provinces_lines', 'region-boundaries', lambda p: {'country': p.get('ADM0_A3', ''), 'minZoom': max(4.5, min(6.5, p.get('MIN_ZOOM') or 5))}),
    ('ne_10m_populated_places_simple', 'cities', lambda p: {'name': p['name'], 'country': p.get('iso_a2', ''), 'region': p.get('adm1name') or '', 'rank': p.get('scalerank') or 0, 'minZoom': max(4, min(8.5, p.get('min_zoom') or 5)), 'capital': bool(p.get('adm0cap'))}),
    ('ne_50m_lakes', 'lakes', lambda p: {'name': p.get('name_en') or p.get('name') or ''}),
]
for filename, asset, properties in specs:
    raw = (SOURCE / (filename + '.geojson')).read_bytes()
    source = json.loads(raw)
    features = []
    for i, f in enumerate(source['features']):
        p, g = f['properties'], f['geometry']
        if not g:
            continue
        if g['type'] == 'Point':
            if not p.get('name') or not all(math.isfinite(v) for v in g['coordinates'][:2]):
                continue
            shape = {'type': 'Point', 'coordinates': [round(v, 4) for v in g['coordinates'][:2]]}
        else:
            shape = geometry(g)
        features.append({'type': 'Feature', 'id': f'{p.get("ne_id") or p.get("NE_ID") or "feature"}-{i}', 'properties': properties(p), 'geometry': shape})
    data = json.dumps({'type': 'FeatureCollection', 'features': features}, ensure_ascii=False, separators=(',', ':')).encode()
    path = ROOT / 'src' / 'assets' / (asset + '.geojson')
    path.write_bytes(data)
    manifest['assets'].append({'path': 'src/assets/' + path.name, 'featureCount': len(features), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'sourceSha256': hashlib.sha256(raw).hexdigest(), 'sourceUrl': f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{REVISION}/geojson/{filename}.geojson'})
    print(f'{path.name}: {len(features)} features, {len(data):,} bytes')
(ROOT / 'data-sources' / 'natural-earth-details.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
