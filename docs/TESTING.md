# Testing and release verification

GradAtlas tests behaviour and data consistency. Passing tests do not certify university facts or the availability of every external link.

## Reproduce

Node.js 20 or newer and Python 3 are required for the full test suite; CI uses Node.js 22. Install the pinned test dependencies:

```sh
npm ci
npm run check
npm test
npm run build
npx playwright install --with-deps chromium webkit
npm run test:e2e
```

The app itself has no runtime npm dependency. MapLibre and ExcelJS are vendored; Playwright is a development-only dependency. The browser suite starts the production `dist/` preview itself. Use `npm run test:e2e -- --project=desktop-chromium` for a single project. Run browser automation only in an environment where browser control is permitted, such as GitHub Actions.

## Coverage

- Search tests cover word-order/accents, bounded spelling matches and acronym negatives, exact-title ranking, deterministic joins, ambiguous identities/domains, subject coverage limits, safe rendering and the eight Dutch Supply Chain records linked to seven institutions.
- Unit tests cover original grading scales and preferences, language caveats, date boundaries, search/filter intersections, deterministic programme/university ordering, pinned country label assets, workspace normalization and backup versions, enquiry placeholders, field provenance, map geometry/gesture routing and stable clustering inputs.
- Excel tests read comparison and workspace workbooks and verify actual values, source hyperlinks, frozen labels, typed profile scores, checklist progress, complete long notes/saved drafts, attribution and formula-safe text. Empty workspaces retain unknown profile values.
- Data validation checks stable unique IDs, duplicate identities, coordinates, dates, required provenance, supported field values and pinned ROR source/index checksums. The DUO test reproduces the published identities from the attributed, checksum-pinned compressed CSV. It cannot replace a human review of an admission rule.
- End-to-end tests use Chromium desktop, WebKit desktop and Android-sized Chromium. They cover search/pagination, filters, details, optional local profiles, shortlist/tracking, notes/checklists, three-programme comparisons, actual `.xlsx`/text/JSON downloads, editable enquiry drafts, local draft reload, preparation guides, backup validation/confirmation and deletion in isolated test workspaces.
- Failure scenarios cover blocked/corrupt storage, an unavailable programme catalogue, unavailable institution data and absent WebGL. Map tests verify projection switching, finite zoom bounds and unchanged source revisions when only list order changes. Keyboard and viewport checks cover navigation and responsive overflow.
- Browser discovery checks cover unified result counts, retained queries/country/subject, programme detail links from institutions, spelling/related-query flows and partial-coverage explanations.
- List checks cover automatic 50 → 100 → 150 loading, retained card nodes, keyboard scrolling, visible progress, filter/sort resets and university-first card labels. Map checks require actually rendered country names in both projection flows.
- Gesture checks cover clockwise/counterclockwise trackpad twist, non-accumulating angles, unchanged map centre and pinch scale. Touchscreen pinch checks cover zooming in/out with off-axis finger motion and unchanged bearing in globe and flat views, including parallel Safari GestureEvents. Analytics origin/path checks exclude local tests, forks, the old prototype and unrelated GitHub projects from production measurement.

Tests use fresh browser contexts and synthetic applicant data. They never submit an application or send an enquiry. Failures retain screenshots, Playwright traces and HTML reports in CI artifacts for seven days. Repository visibility also affects who can access CI evidence; never add real applicant information to fixtures or reports.

## Release gate

1. Review changes to facts and licensing against their primary sources; document unknowns and withdrawn programmes.
2. Run the data checks, unit tests and production build.
3. Require all three browser jobs to pass on the same source commit. Review failures; a retry is diagnostic evidence, not permission to dismiss a persistent failure.
4. Inspect the representative desktop experience manually. Check the actual deployment outcome and preserve the existing hosting audience unless a visibility change was explicitly requested. For a public launch, verify anonymous access separately from an owner session.
5. Report source revision, catalogue scope and remaining verification limits. Never label structural validation or working links as 100% factual accuracy.

A public website launch requires a deliberate hosting visibility change. Source-repository visibility is a separate decision. Before broader community outreach, add a usable public correction channel and a regular review plan for changing admission data. Private GitHub CI does not establish that a website is publicly accessible.
