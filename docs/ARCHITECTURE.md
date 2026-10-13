# Architecture

## First edition

The first edition uses browser-native JavaScript modules and static assets. No service is needed for searching, comparisons, notes, requirement reviews or email drafts. This makes the pilot inexpensive to host and easy for contributors to run.

`programs.json` is the repository of record. `core.js` contains pure business rules, with an injected date for availability tests. `app.js` owns browser views and state. `map.js` uses the vendored MapLibre GL JS 6.14.0 renderer and a local country GeoJSON source. No remote tile service, glyph service or map API key is required. The map shares the filtered records with the list and omits back-of-globe locations from visible globe clusters. A projection control opens a full-viewport Mercator map and restores the previous globe camera. Its viewport constraint prevents zooming out beyond a screen-covering world. Globe mode restores the renderer's default constraint. Closely located programmes open a scoped selection list instead of repeatedly zooming into coincident campus markers. Catalogue destination names are mapped to Natural Earth feature aliases where needed. `map-geometry.js` generates small ocean surface patches, keeping the ocean inside the sphere distinct from its dark backdrop, and measures campus spread with circular longitudes to avoid a false 360-degree separation at the date line.

`map-input.js` separates trackpad pan from browser pinch and Safari scale/rotation. Trackpad rotation uses the opposite sign from camera bearing so visible geography follows the fingers. Touchscreen rotation is disabled independently from pinch zoom; captured touch state keeps Safari's parallel GestureEvents out of the trackpad handler, avoiding duplicate zoom and accidental bearing changes. `map-geometry.js` computes flat-map minimum zoom from viewport dimensions and bearing, then constrains the Mercator camera so viewport corners stay within a single world. Resizing updates the minimum and preserves a zoomed-in camera. A reset control restores the relevant overview.

Programme and institution locations use a clustered GeoJSON source and native circle/symbol layers. Count glyphs are generated locally through MapLibre's missing-image resolver. No moving HTML marker overlays are used. Input is sorted by stable ID independently of list order. A source fingerprint avoids resetting clusters for unchanged membership or sorting, and symbol fading is disabled to avoid transient duplicate count labels. An offscreen button group provides keyboard equivalents for visible map features. Cluster activation retrieves original programme IDs, chooses coincident campuses or expands the geographic cluster, and discards responses from a replaced source revision. Studio and methodology sheets make the map stage inert while open. Shortlist and comparison use right-hand drawers, retaining map access and shifting map controls outside the drawer.

`catalogue.js` separates programme-page records from licensed registry identities, selects accurately labelled external routes and builds provenance-carrying catalogue downloads. `studio.js` renders progressive Preparation, Enquiry and Official Guides tabs. `evidence.js` distinguishes linked, recorded, missing and stale field evidence. Neither a generic programme citation nor an HTTP response establishes every admissions fact.

`experience.js` renders the search, hidden filters and hidden results. The default view opens directly on the map; the legacy welcome route aliases it. Workspace routes open a panel over the existing map, preserving its camera when returning. Personal data continues to use the original local-storage schema. The build copies the source into `dist/`; hosting serves that directory. WebGL initialisation failure leaves the search/list workflow available.

Lists default to university/institution names in deterministic English natural order, with programme names and IDs breaking ties. Programme order and deadline order are explicit alternatives. When sorted by university, that name takes visual priority in the card. A sentinel observed inside the scrollable list appends 50 more cards; a passive scroll fallback and focusable list support keyboard/browser variations. Appending keeps existing card nodes and scroll position, changes only the loaded/total status, and does not update map data. Changing query, filters, catalogue or sort resets the list to 50 and returns it to the top.

Country/territory names use a separate local point asset containing publisher-provided Natural Earth anchors and label ranks, pinned in `data-sources/natural-earth-labels.json`. Native text layers use installed fonts, restrained sizing and collision placement. Half-zoom density levels use the actual camera zoom rather than a GeoJSON tile zoom, so country names remain visible on the globe. Labels are independent of catalogue membership and never become HTML marker overlays.

The institution index comes from a checksum-verified ROR release, projected by `scripts/import-ror.py`. Metadata and its public provenance manifest are local assets, loaded separately from the programme catalogue; the large index loads on request. Native points and incremental 50-result batches avoid rendering the whole directory at once. Registry identities/localities do not become admissions claims. `comparison.js` shares row content between the screen and a lazy ExcelJS writer; its Excel workbook preserves selected columns, wraps text, freezes labels and includes source hyperlinks.

## Persistence and safety boundaries

Local storage uses the versioned key `gradatlas.workspace.v1`. Version 2 backups include explicitly saved enquiries and their form fields; version 1 backups remain importable. Backups are validated before replacing state. Import limits file size, checks numeric bounds and checklist indices, and strips unsupported top-level fields. User and source text is escaped before HTML rendering. Catalogue external URLs are validated during checks. Imports cannot change catalogue URLs.

Workspace storage can fail due to browser privacy settings or quota. The application falls back to session memory and reports the limitation when saving fails. Exports are initiated by the user. Downloads use temporary Blob URLs and revoke them. Profile answers, notes and drafts are never posted to an application server. A failed local save reports session-only state. Accounts and cross-device sync are not implemented. See `WORKSPACE_PRIVACY.md`.

## Data rules

- Application windows are cycle-specific and category-specific; stale records no longer claim current availability.
- Grade comparisons require the same scale and the correct ordering direction.
- Preferred thresholds do not become required thresholds.
- An IELTS overall comparison does not establish component-score, exemption or degree eligibility.
- Missing numeric data results in individual review, not a guessed pass or failure.

## Tests

The development-only Playwright suite runs against the static production build in GitHub Actions, across Chromium desktop, WebKit desktop and mobile Chromium. Node tests verify business rules, map constraints, workbook contents and provenance. CI artifacts retain synthetic failure evidence. See [testing](TESTING.md).

## Expansion path

When the catalogue outgrows reviewed JSON, introduce a server and database rather than growing an uncontrolled scraper inside the browser. Separate university, programme, intake, requirement, fee, source evidence, faculty profile and review records. Attach field-level evidence and applicant categories to each mutable fact.

A future ingestion job should fetch permitted official sources, preserve evidence with a timestamp and generate a reviewable change proposal. A human approves material admission changes before they reach users. Jobs must respect source terms, rate limits and extraction failures. An unparseable page keeps its previous fact with a stale marker rather than inventing a replacement.

Optional cloud workspaces require identity, per-user authorization, export/deletion support and backup migration. Public contributions require moderation and audit history. Keep the current static catalogue available as a simple distributable artifact.

## Deployment

The primary public website is the GitHub Pages project site at `https://7aslann7.github.io/gradatlas/`. Runtime imports, assets and data requests use relative paths and support the project subdirectory. The `pages` CI job publishes `dist/` only after unit/data and all four browser jobs succeed on a push to `main`; pull requests cannot deploy. Sites also hosts a separate public origin using the account-specific `.openai/hosting.json` with `static.directory = dist`. Repository visibility and hosting audiences are independent settings. Browser-local workspaces do not sync across these origins.

## Unified discovery search

`search.js` normalises search text without changing source records. Cached token documents match all query words across title, institution, field, tags and location. Long words allow one edit or adjacent transposition; short acronyms require exact tokens. Best match scores emphasise titles, with stable name/ID ties. Related topics are buttons that replace the query only after selection, not silent synonym expansion.

The institution directory loads lazily after a query/subject selection or explicit directory navigation. A cached local index links explicit ROR programme IDs first, then unique normalised institution names within a country, then a single unambiguous institution source domain within that country. Ambiguous domains/names and unresolved explicit ROR identities remain unlinked; joint programmes may link only the identifiable provider, so institution programme lists are not exhaustive. No source facts, admissions claims or profile data are uploaded.

Programme matches are grouped by linked institution, allowing a subject query to find institutions whose names omit that subject. Direct institution-name/location matches can also appear, with an explicit missing programme-coverage label. Selecting a subject filter requires an associated catalogue programme carrying that facet; inferred registry facets retain their original evidence scope. An empty result never establishes degree absence. Cards show at most two programme links; institution details show all associated catalogue records. Directory-load failure leaves programme results available and exposes a retry.
