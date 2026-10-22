# Changelog

## 0.11.1 — 22 October 2026

- Replace the wide selection bar with a small, collapsed button on the left. Reopen the list at any time without clearing comparisons.
- Keep selected-programme actions inside a scrollable card, separate collapse from explicit clearing, and leave programme detail actions unobstructed on phones.

## 0.11.0 — 22 October 2026

- Reveal attributed, locally hosted Natural Earth city labels, regional boundaries and more detailed geography as the map zooms in.
- Select up to six programmes on the map, keep numbered locations visible across filters and fit global selections to a portrait overview.
- Keep comparison order consistent for co-located programmes and preserve country highlights across map detail levels.

## 0.10.2 — 13 October 2026

- Keep the floating menu's icons, full labels and selection counts aligned in readable rows on mobile screens.
- Open Compare programmes in a full-screen workspace with sticky programme headings and row labels, accessible scrolling and visible Excel export controls.
- Increase the comparison limit to six across selection, browser persistence, recovery backups and sourced Excel exports. Add clear-all and add-programmes controls.
- Include iPhone-sized WebKit in the required browser checks.

## 0.10.1 — 12 October 2026

- Make Safari's two-finger twist rotate visible geography in the finger direction, preserving pinch scale and gesture-start-relative angles.
- Keep touchscreen pinch zoom independent from rotation in globe and flat views; route iOS touch gestures through MapLibre once, while preserving intentional desktop trackpad twist.
- Use GitHub Pages as the single official address and redirect the original Sites prototype there.
- Add Cloudflare Web Analytics only to the official GitHub Pages project. Exclude the old prototype, local previews, forks and unrelated GitHub project paths; disable automatic workspace route measurement.
- Explain aggregate visitor/performance measurement in workspace privacy and methodology. Personal profiles, searches, notes and enquiry contents are not sent as custom events.

## 0.10.0 — 12 October 2026

- Search programmes and institutions from one query, retain country/subject filters when switching result types, and show linked catalogue programmes on institution cards and details.
- Join programmes through explicit ROR IDs, unique country/name identities or unique source-domain matches; leave unresolved/ambiguous institutions unlinked. Source records remain unchanged.
- Add word-order independent search, accent normalisation, conservative one-edit spelling matches, explicit Best match ordering and separate related-topic suggestions.
- Label partial programme coverage, distinguish institution name matches from known programme records, and provide directory retry without interrupting programme search.

## 0.9.2 — 12 October 2026

- Load the next 50 list results automatically near the end, preserve existing cards and scrolling, and keep the visible loaded/total count.
- Replace catalogue insertion order with default University A–Z and an explicit Programme A–Z option. University sorting gives the institution name visual priority; alphabetical and deadline ties are deterministic.
- Add country/territory names using pinned Natural Earth label anchors, local fonts, zoom sizing and collision-aware placement on both globe and flat views.

## 0.9.1 — 12 October 2026

- Published the MIT-licensed GitHub source with a prominent website link, public correction/bug/feature templates and private vulnerability reporting.
- Added source and feedback links to Data & methodology and canonical/social metadata for the official website.
- Prepared English launch copy and documented domain migration, evidence limits and community outreach.
- Added the free GitHub Pages project URL and a deployment job gated by unit/data and all three browser checks on `main` pushes.

## 0.9.0 — 12 October 2026

- Added formatted workspace Excel exports for shortlist and studio, including profile, programme activity, preparation, full notes, saved enquiries and source attribution.
- Kept app-restoration JSON under an explicitly labelled recovery backup in Data & methodology.
- Clarified how grade scale, IELTS and degree/field affect profile review and draft preparation.
- Removed the menu footer slogan and prepared public website access with private GitHub source.

## 0.8.0 — 12 October 2026

- Added 107 programme-page records and 1,131 labelled DUO RIO degree identities: 1,489 programme/specialisation records across 88 countries/regions, separate from the ROR institution directory.
- Added pinned source metadata, compressed CSV, a portable DUO proposal importer, duplicate/code reconciliation, geographic provenance and explicit registry/admissions evidence scope.
- Added accurate external-link labels and provenance-carrying programme downloads; registry comparisons carry reuse/attribution notes in Excel.
- Added desktop Chromium, desktop WebKit and mobile Chromium browser suites in private GitHub CI, plus backup/draft/registry/import reproducibility regressions.
- Fixed stale draft save labels after recipient/form changes, made catalogue failure retry reload the app, disabled premature startup navigation and reported corrupt local-workspace recovery.
- Paginated methodology source disclosure on demand, avoiding thousands of hidden source nodes at startup.
- Documented purpose, problem, approach, technologies, privacy, contribution/correction routes and release verification. Production catalogue JSON is compacted without changing facts or the pinned ROR index bytes.

## 0.7.1 — 12 October 2026

- Clarified institution identity versus programme/specialisation records, research-focused registry coverage and private visitor workspaces in Data & methodology.
- Added component-specific reuse terms, commercial-use conditions, provenance/accuracy distinctions and no-endorsement scope.
- Included attribution, licence links and source metadata with directory downloads; preserved the map's raw index format.
- Removed obsolete intermediate projection statistics from the source definition/manifest and validated the published index size and licence metadata.
- Labelled registry-provided institution website links without claiming independent availability verification.

## 0.7.0 — 12 October 2026

- Replaced broad shortlist/comparison sheets with compact right-hand drawers and retained map access.
- Removed orange focus outlines; kept quiet keyboard control feedback and normal input borders.
- Renamed “Curated order” to “Catalogue order”, isolated native clustering from list sorting, and skipped unchanged map source updates.
- Added formatted local Excel comparisons with frozen labels, shared screen/export facts and a linked Sources sheet.
- Added a separate 30,174-record ROR education institution directory across 223 countries/territories, lazy loading, aliases, native clusters and paged results. Registry identity does not imply verified degrees or admissions.
- Added a pinned, checksum-verified ROR importer, public provenance manifest, source/licence disclosure and broader methodology sources.
- Clarified admissions versus supervisor enquiries, contribution rights, dataset scope and the public-release plan.

## 0.2.0 — 12 October 2026

- Replaced the dashboard-led opening with an animated geographic globe and a calm welcome screen.
- Made the world map the full-screen application workspace.
- Added floating search and filters, a compact navigation rail and on-demand programme panels.
- Kept shortlist, comparison, application studio and methodology tools in workspace panels over the map.
- Added smooth camera travel, scroll zoom and keyboard map navigation.
- Adapted the interface for phones with top filters, a bottom navigation rail and compact detail sheets.
- Preserved catalogue provenance, browser workspace data, exports and all requirement-review rules.

## 0.1.0 — 12 October 2026

- First private pilot with 16 programmes across 11 countries, official sources, local workspaces and application-preparation tools.

## 0.6.0 — 12 October 2026

- Replace moving HTML map markers with native clustered circle layers and local count images. Fit the flat map to its viewport, constrain zoom/pan, and add a reset control and keyboard equivalents.
- Add 80 primary-source programme records, reaching 251 records across 88 destinations. Recheck high-impact date, grade, language and fee claims; remove UCL's outdated cycle and correct NTU's superseded fee total.
- Add field-specific source receipts and stricter catalogue/guidance validation.
- Introduce Studio Preparation, Enquiry and Official Guides tabs, downloadable plans, editable subjects, placeholder checks and explicit local draft saving.
- Add draft-aware version 2 backups with version 1 compatibility. Explain optional profile storage, shared-device behaviour and the absence of account sync.
