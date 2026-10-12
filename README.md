# GradAtlas

**Master’s programmes, mapped.**

GradAtlas is a free, open-source master's discovery and application workspace. It brings official programme information, an interactive world map, comparisons and preparation tools into one calm interface.

The current catalogue contains **251 source-backed programme and specialisation records across 88 countries and regions and 17 subject groups**. The global catalogue covers computing, engineering, business, law, health, life sciences, education, social sciences and humanities alongside the original Germany/Netherlands focus. It remains a curated discovery catalogue, with partial admissions information explicitly labelled; it is not an exhaustive global directory or a university ranking.

## What works today

- A full-screen, directly interactive globe with distinct ocean, land and backdrop colours, one search bar and a small menu.
- A single control switches to a full-screen flat map and restores the previous globe camera. Viewport-aware zoom and pan limits prevent shrinking the map into empty space.
- Filters, programme lists, details and application tools open only when requested.
- Drag and two-finger pan, pinch zoom, globe rotation, keyboard controls and visible zoom/compass buttons.
- Native MapLibre circle layers and clustering keep locations attached to the map during motion; keyboard-accessible location controls, campus selection and reduced-motion support require no map API key or remote tiles.
- Search by programme, university, location and research keyword; filter by field, country, verified application availability and recorded tuition-free status.
- Programme details with requirements, applicant-category notes, official links and last-review dates.
- Profile reviews for recorded grade and IELTS thresholds. Different grade systems always require official equivalency; the app never predicts admission probability.
- Side-by-side comparison of up to three programmes and a downloadable comparison.
- Personal shortlist, application status, notes and preparation checklist.
- An application studio with preparation prompts, notes, downloadable plans, scoped official university guides and editable admissions/research enquiries.
- Explicit local draft saving, placeholder checks, copy/download tools and user-selected email-app opening.
- Calendar deadline reminders for recorded application windows.
- Version 2 workspace backups include saved drafts; version 1 backups remain compatible. Export, validated import and local deletion keep users in control.
- Responsive layouts, semantic controls, keyboard-operable details and reduced-motion support.

## Run locally

Requires Node.js 20 or later. MapLibre GL JS 6.14.0 is vendored locally; there is no package installation step.

```sh
npm run dev
```

Open the printed local address, normally `http://localhost:4173`. To run on another port:

```sh
PORT=4174 npm run dev
```

```sh
npm run check
npm test
npm run build
npm run preview
```

The production build is a static `dist/` directory. It can be hosted by any static host that serves JavaScript modules and JSON. `scripts/serve.mjs` is a loopback-only development server, not a production server.

The default route and `#explore` open directly on the map. The legacy `#welcome` route also opens the map. Shortlist, comparison, studio and methodology routes open a workspace panel over the map.

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
  map-geometry.js     Ocean surface, viewport limits and circular longitude geometry
  experience.js       Minimal map-interface templates
  atlas.css           Map workspace, panels and restrained transitions
  vendor/maplibre/    Locally served MapLibre renderer, worker and licence
  data/programs.json  Curated programme catalogue
  assets/countries.geojson  Simplified Natural Earth country boundaries
scripts/              Build, development server and data validation
tests/                Requirement, date, search and export regression tests
docs/                 Product, architecture and data policy
```

## Trust and privacy

Every catalogue record has official sources and a review date. Unknown fees, admissions criteria and dates are visibly unknown. Recurring annual dates are shown as guidance rather than converted into an assumed application cycle. Records older than 90 days need rechecking. Deadline reminders are all-day reminders, not institutional cutoff times.

The workspace is stored in this browser's local storage. It does not sync across devices or origins. Export a backup before changing devices or clearing browser data. Enquiry edits remain in memory until the user saves a local copy or downloads it. Saved drafts are included in private workspace backups; no application server receives profile fields, notes or drafts. A shared browser profile on the same origin uses the same local workspace, irrespective of hosting login. The application includes no analytics, login, paid features or bulk mailing. Google Fonts may be requested for typography; map, renderer, worker and catalogue assets are served locally. WebGL is required for the map; the programme list remains available when it cannot initialise.

The website can help organise research. The university's official process determines eligibility and admission. A programme-specific language exemption, course equivalency or exceptional admission route may change how a recorded threshold applies.

## Current limits

- No automated ingestion or scheduled source refresh; the initial review date is 12 October 2026.
- No global faculty directory, supervisor availability tracking, public reviews or community submission service yet.
- No application submission, acceptance probabilities, automatic GPA conversion or email delivery.
- Many records have partial admissions information. Check the notes and official sources for your category.
- A local profile's degree label provides context; course-level eligibility is still reviewed manually.

See [workspace privacy](docs/WORKSPACE_PRIVACY.md), [catalogue coverage](docs/CATALOGUE_COVERAGE.md), [the roadmap](docs/ROADMAP.md), [architecture](docs/ARCHITECTURE.md), [data policy](docs/DATA_POLICY.md) and [contribution guide](CONTRIBUTING.md).

## GitHub and release

The source is prepared for a private GitHub repository followed by a public release. The included CI workflow validates catalogue records, runs tests and builds the site. Remove account-specific hosting configuration in `.openai/hosting.json` when forking for an independent host; replace it with your own Site identity if using Sites.

Project code is licensed under MIT. MapLibre retains its BSD-3-Clause licence; see [third-party notices](THIRD_PARTY_NOTICES.md). Original university content and referenced pages retain their own ownership and terms. Do not contribute copied university pages, personal applicant records or unpublished contact details.
