# GradAtlas

**Master’s programmes, mapped.**

[**Open GradAtlas ↗**](https://7aslann7.github.io/gradatlas/) · [Report a data correction](https://github.com/7aslann7/gradatlas/issues/new?template=data-correction.yml) · [Suggest an improvement](https://github.com/7aslann7/gradatlas/issues/new?template=feature-request.yml)

GradAtlas is a free, open-source master's discovery and application workspace, licensed under MIT. It brings official programme information, an interactive world map, comparisons and preparation tools into one calm interface.

The current programme catalogue contains **1,489 degree and specialisation records across 88 countries/regions and 17 subject groups**: **358 records with reviewed programme-page sources**, plus **1,131 registered Dutch degree identities** imported from the official DUO RIO feed. Admissions coverage remains partial. A registry identity is not an individually reviewed admission route or currently available intake; none of these counts is a university ranking or an exhaustive world inventory.

A separate, licensed institution directory indexes **30,174 active education-type ROR records across 223 countries/territories**. It supports broader discovery without claiming that all indexed institutions offer a verified master’s programme. Identity and approximate GeoNames locality information are distinct from programme and admissions evidence.

## The problem

Master's research is scattered across programme pages, regulations, application portals and faculty websites. Students repeatedly rebuild their own spreadsheets and risk treating an old deadline, a foreign grade scale or an institution's existence as proof of eligibility. GradAtlas brings discovery and preparation together while leaving the admission decision with the university.

## Our approach

Start on a map, narrow by subject and country, compare a small shortlist, then follow the official programme's own process. Keep evidence next to each fact; show unknown information rather than guessing. Preserve applicant categories and original grading systems. Profiles, notes and editable enquiries stay in the student's browser, and the core service remains free.

Institution identity, programme identity and reviewed admission criteria are different levels of evidence. GradAtlas is a research aid: always double-check current information, links and instructions before applying. Neither a source link nor a passing software test guarantees unchanged rules.

## Technologies

The production application uses semantic HTML, CSS and native JavaScript modules. MapLibre GL JS renders a local Natural Earth map with native geographic clusters; ExcelJS writes comparison workbooks locally. Node.js builds and validates the static site. Node's test runner covers business rules and data integrity; Playwright checks browser flows in GitHub Actions. A checksum-pinned Python importer prepares the ROR institution directory. No application database, paid map API key or applicant account is required.

Created and maintained by [@7aslann7](https://github.com/7aslann7). The [GradAtlas website](https://7aslann7.github.io/gradatlas/) and official source repository, [7aslann7/gradatlas](https://github.com/7aslann7/gradatlas), are public. Data corrections, bug reports and proposals can be submitted through [GitHub Issues](https://github.com/7aslann7/gradatlas/issues/new/choose).

## What works today

- A full-screen, directly interactive globe with distinct ocean, land and backdrop colours, one search bar and a small menu.
- A single control switches to a full-screen flat map and restores the previous globe camera. Viewport-aware zoom and pan limits prevent shrinking the map into empty space.
- Filters, programme lists, details and application tools open only when requested.
- Programme browsing starts in University A–Z order, with university names first. Programme A–Z and recorded-deadline orders are also available. Scrolling near the end appends the next 50 results and retains a loaded/total count.
- Country/territory labels use pinned Natural Earth label anchors and local fonts, with zoom-dependent sizing and collision handling in both map projections.
- Drag and two-finger pan, pinch zoom, globe rotation, keyboard controls and visible zoom/compass buttons.
- Native MapLibre circle layers and clustering keep locations attached to the map during motion; keyboard-accessible location controls, campus selection and reduced-motion support require no map API key or remote tiles.
- One query searches programmes and institutions, with counted result-type controls and programme links on institution cards/details. Country and subject filters remain when switching result types; institution subject filters require linked catalogue programmes.
- Word-order independent search supports accents, conservative spelling matches and optional related-topic suggestions. Best match ranking is available alongside explicit alphabetical order.
- Search reviewed programme records and clearly labelled registered degrees by programme, university, location and research keyword; filter by field, country, recorded application availability and recorded tuition-free status. Unindexed programme coverage remains explicit.
- Programme details with requirements, applicant-category notes, official links and last-review dates.
- Profile reviews for recorded grade and IELTS thresholds. Different grade systems always require official equivalency; the app never predicts admission probability.
- A compact right-hand comparison drawer for up to three programmes, with a formatted Excel `.xlsx` export and linked source sheet.
- A compact right-hand shortlist drawer, application status, notes and preparation checklist.
- An application studio with preparation prompts, notes, downloadable plans, scoped official university guides and editable admissions/research enquiries.
- Explicit local draft saving, placeholder checks, copy/download tools and user-selected email-app opening.
- Calendar deadline reminders for recorded application windows.
- Readable workspace Excel exports include programme activity, preparation progress, notes, explicitly saved enquiries and official sources.
- Separate version 2 recovery backups include saved drafts; version 1 backups remain compatible. Export, validated import and local deletion keep users in control.
- Responsive layouts, semantic controls, keyboard-operable details and reduced-motion support.

## Run locally

Requires Node.js 20 or later. Python 3 is needed for the data importer reproducibility test. MapLibre GL JS 6.14.0 and ExcelJS 4.4.0 are vendored locally; the application needs no runtime package installation. The test suite uses a pinned development dependency.

```sh
npm run dev
```

Open the printed local address, normally `http://localhost:4173`. To run on another port:

```sh
PORT=4174 npm run dev
```

```sh
npm ci
npm run check
npm test
npm run build
npm run preview
```

The production build is a static `dist/` directory. It can be hosted by any static host that serves JavaScript modules and JSON. `scripts/serve.mjs` is a loopback-only development server, not a production server.

The default route and `#explore` open directly on the map. The legacy `#welcome` route also opens the map. Shortlist and comparison open right-hand drawers while the map remains usable. Studio and methodology keep their broader workspace layout.

## Structure

```text
src/
  index.html          Accessible application shell
  styles.css          Responsive design and motion preferences
  app.js              Navigation, views and browser workspace
  core.js             Filtering, requirement review, validation and export logic
  map.js              Geographic rendering, animated camera and interaction
  map-input.js        Trackpad/pinch routing and Safari gesture math
  studio.js           Preparation, enquiry and official-guidance templates
  evidence.js         Field provenance, missing information and coverage
  institutions.js     Registry discovery, filtering and evidence limits
  comparison.js       Shared comparison rows and local Excel exports
  workspace-export.js Readable local workspace Excel exports
  catalogue.js        Evidence scopes, labelled routes and attributed exports
  map-geometry.js     Ocean surface, viewport limits and circular longitude geometry
  experience.js       Minimal map-interface templates
  atlas.css           Map workspace, panels and restrained transitions
  vendor/maplibre/    Locally served MapLibre renderer, worker and licence
  vendor/exceljs/     On-demand Excel writer and MIT licence
  data/programs.json  Programme-page and labelled registry catalogue
  data/programme-registry-manifest.json  DUO source, licence and checksums
  data/institutions.json  Pinned ROR identity/locality index
  data/institution-manifest.json  Source, licence and import checksums
  assets/countries.geojson  Simplified Natural Earth country boundaries
scripts/              Build, development server and data validation
tests/                Requirement, date, search and export regression tests
docs/                 Product, architecture and data policy
```

## Trust and privacy

Every catalogue record has official provenance and a source-review or registry-snapshot date. Unknown fees, admissions criteria and dates are visibly unknown. Recurring annual dates are shown as guidance rather than converted into an assumed application cycle. Records older than 90 days need rechecking. Deadline reminders are all-day reminders, not institutional cutoff times.

The workspace is stored in this browser's local storage. It does not sync across devices or origins. Export a backup before changing devices or clearing browser data. Enquiry edits remain in memory until the user saves a local copy or downloads it. Saved drafts are included in private workspace backups; no application server receives profile fields, notes or drafts. A shared browser profile on the same origin uses the same local workspace, irrespective of hosting login. The official GitHub Pages project uses Cloudflare Web Analytics for aggregate visitor and page-load performance measurement; no profile answers, searches, notes or drafts are sent as custom events, and automatic workspace route measurement is disabled. Local previews and forks are excluded. The original Sites prototype redirects to the official website. The application includes no login, paid features or bulk mailing. Google Fonts may be requested for typography; map, renderer, worker and catalogue assets are served locally. WebGL is required for the map; the programme list remains available when it cannot initialise.

The website can help organise research. The university's official process determines eligibility and admission. A programme-specific language exemption, course equivalency or exceptional admission route may change how a recorded threshold applies.

## Current limits

- ROR and DUO importers use attributed, checksum-pinned snapshots. They prepare bounded identity data; there is no scheduled source refresh or automatic admission-rule extraction. Current applicant-specific rules still need separate review.
- No global faculty directory, supervisor availability tracking or public applicant reviews yet. GitHub corrections require maintainer review; there is no automatic community-data publishing service.
- No application submission, acceptance probabilities, automatic GPA conversion or email delivery.
- Many records have partial admissions information. Check the notes and official sources for your category.
- A local profile's degree label provides context; course-level eligibility is still reviewed manually.

See [workspace privacy](docs/WORKSPACE_PRIVACY.md), [catalogue coverage](docs/CATALOGUE_COVERAGE.md), [data reuse and publication](docs/DATA_REUSE.md), [catalogue pipeline](docs/CATALOGUE_PIPELINE.md), [ownership and launch plan](docs/OWNERSHIP_AND_LAUNCH.md), [the roadmap](docs/ROADMAP.md), [architecture](docs/ARCHITECTURE.md), [data policy](docs/DATA_POLICY.md) and [contribution guide](CONTRIBUTING.md).

## GitHub and release

The website and GitHub repository are public. The included CI workflow validates catalogue records, runs unit tests, builds the site and executes desktop Chromium, desktop WebKit and mobile Chromium end-to-end tests. A successful push to `main` then publishes `dist/` to GitHub Pages; pull requests cannot deploy. The official website is `https://7aslann7.github.io/gradatlas/`. All runtime asset paths support this project subdirectory. See [testing and release verification](docs/TESTING.md) and the [launch copy and outreach plan](docs/LAUNCH.md). Repository visibility and hosting audience are separate settings. Remove account-specific hosting configuration in `.openai/hosting.json` when forking for an independent host; replace it with your own Site identity if using Sites. The original Sites preview remains a separate hosting origin.

Project code is licensed under MIT. MapLibre retains BSD-3-Clause and ExcelJS retains MIT. ROR metadata and GeoNames locality data retain their separate CC0 and attribution terms; see [third-party notices](THIRD_PARTY_NOTICES.md). Original university content and referenced pages retain their own ownership and terms. Do not contribute copied university pages, personal applicant records or unpublished contact details.
