# GradAtlas

**Find your next chapter. Make it a world of possibilities.**

GradAtlas is a free, open-source master's discovery and application workspace. It brings official programme information, an interactive world map, comparisons and preparation tools into one calm interface.

The first edition contains **16 manually researched programmes across 11 countries**, with an initial emphasis on computer science, cybersecurity, machine learning and quantum computing in Germany and the Netherlands. It also includes environmental science, urban planning and public policy. This is a curated pilot, not a comprehensive catalogue or university ranking.

## What works today

- A calm animated welcome screen with a rotating geographic globe, followed by a full-screen world map.
- Floating search and filters, a compact workspace rail, and programme lists/details that open on demand.
- Smooth map travel, clustering, scroll/keyboard zoom, pan and a Europe view, with reduced-motion support.
- Search by programme, university, location and research keyword; filter by field, country, verified application availability and recorded tuition-free status.
- Programme details with requirements, applicant-category notes, official links and last-review dates.
- Profile reviews for recorded grade and IELTS thresholds. Different grade systems always require official equivalency; the app never predicts admission probability.
- Side-by-side comparison of up to three programmes and a downloadable comparison.
- Personal shortlist, application status, notes and preparation checklist.
- Editable enquiry drafts, copy and download tools, and explicit opening of an email app for a recorded official contact.
- Calendar deadline reminders for recorded application windows.
- Workspace export, validated import and local deletion.
- Responsive layouts, semantic controls, keyboard-operable details and reduced-motion support.

## Run locally

Requires Node.js 20 or later. There are no runtime package dependencies and no installation step.

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

The default route opens the welcome screen. `#explore` links directly to the map. Shortlist, comparison, studio and methodology routes open a workspace panel over the map.

## Structure

```text
src/
  index.html          Accessible application shell
  styles.css          Responsive design and motion preferences
  app.js              Navigation, views and browser workspace
  core.js             Filtering, requirement review, validation and export logic
  map.js              Geographic rendering, animated camera and interaction
  geography.js        Shared geographic data and coordinate projection
  globe.js            Animated orthographic canvas globe
  experience.js       Welcome and map-interface templates
  atlas.css           Map workspace, panels and entrance transitions
  data/programs.json  Curated programme catalogue
  assets/world.json   Simplified Natural Earth map paths
scripts/              Build, development server and data validation
tests/                Requirement, date, search and export regression tests
docs/                 Product, architecture and data policy
```

## Trust and privacy

Every catalogue record has official sources and a review date. Unknown fees, admissions criteria and dates are visibly unknown. Recurring annual dates are shown as guidance rather than converted into an assumed application cycle. Records older than 90 days need rechecking. Deadline reminders are all-day reminders, not institutional cutoff times.

The workspace is stored in this browser's local storage. It does not sync across devices or origins. Export a backup before changing devices or clearing browser data. Email drafts remain in memory; no server receives them. The application includes no analytics, login, paid features or bulk mailing. Google Fonts may be requested for typography; map and catalogue assets are served locally.

The website can help organise research. The university's official process determines eligibility and admission. A programme-specific language exemption, course equivalency or exceptional admission route may change how a recorded threshold applies.

## Current limits

- No automated ingestion or scheduled source refresh; the initial review date is 12 October 2026.
- No global faculty directory, supervisor availability tracking, public reviews or community submission service yet.
- No application submission, acceptance probabilities, automatic GPA conversion or email delivery.
- Many records have partial admissions information. Check the notes and official sources for your category.
- A local profile's degree label provides context; course-level eligibility is still reviewed manually.

See [the roadmap](docs/ROADMAP.md), [architecture](docs/ARCHITECTURE.md), [data policy](docs/DATA_POLICY.md) and [contribution guide](CONTRIBUTING.md).

## GitHub and release

The source is prepared for a private GitHub repository followed by a public release. The included CI workflow validates catalogue records, runs tests and builds the site. Remove account-specific hosting configuration in `.openai/hosting.json` when forking for an independent host; replace it with your own Site identity if using Sites.

Code is licensed under MIT. Original university content and referenced pages retain their own ownership and terms. Do not contribute copied university pages, personal applicant records or unpublished contact details.
