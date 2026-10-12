# Testing and release verification

GradAtlas tests behaviour and data consistency. Passing tests do not certify university facts or the availability of every external link.

## Reproduce

Node.js 20 or newer is required; CI uses Node.js 22. Install the pinned test dependencies:

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

- Unit tests cover original grading scales and preferences, language caveats, date boundaries, search/filter intersections, workspace normalization and backup versions, enquiry placeholders, field provenance, map geometry/gesture routing and stable clustering inputs.
- Excel tests read the generated workbook and verify actual values, source hyperlinks, frozen labels and formula-safe text.
- Data validation checks stable unique IDs, duplicate identities, coordinates, dates, required provenance, supported field values and pinned ROR source/index checksums. It cannot replace a human review of an admission rule.
- End-to-end tests use Chromium desktop, WebKit desktop and Android-sized Chromium. They cover search/pagination, filters, details, optional local profiles, shortlist/tracking, notes/checklists, three-programme comparisons, actual `.xlsx`/text/JSON downloads, editable enquiry drafts, local draft reload, preparation guides, backup validation/confirmation and deletion in isolated test workspaces.
- Failure scenarios cover blocked/corrupt storage, an unavailable programme catalogue, unavailable institution data and absent WebGL. Map tests verify projection switching, finite zoom bounds and unchanged source revisions when only list order changes. Keyboard and viewport checks cover navigation and responsive overflow.

Tests use fresh browser contexts and synthetic applicant data. They never submit an application or send an enquiry. Failures retain screenshots, Playwright traces and HTML reports in private CI artifacts for seven days. Do not add real applicant information to fixtures or reports.

## Release gate

1. Review changes to facts and licensing against their primary sources; document unknowns and withdrawn programmes.
2. Run the data checks, unit tests and production build.
3. Require all three browser jobs to pass on the same source commit. Review failures; a retry is diagnostic evidence, not permission to dismiss a persistent failure.
4. Inspect the representative desktop experience manually. Check the actual deployment outcome and preserve the existing hosting audience.
5. Report source revision, catalogue scope and remaining verification limits. Never label structural validation or working links as 100% factual accuracy.

A public launch additionally requires a deliberate change to hosting/repository visibility, a usable correction channel and a review plan for changing admission data. Private GitHub CI and a private Site preview are development readiness, not evidence of a public launch.
