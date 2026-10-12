# Architecture

## First edition

The first edition uses browser-native JavaScript modules and static assets. No service is needed for searching, comparisons, notes, requirement reviews or email drafts. This makes the pilot inexpensive to host and easy for contributors to run.

`programs.json` is the repository of record. `core.js` contains pure business rules, with an injected date for availability tests. `app.js` owns browser views and state. `map.js` uses the vendored MapLibre GL JS 6.14.0 renderer and a local country GeoJSON source. No remote tile service, glyph service or map API key is required. The map shares the filtered records with the list and omits back-of-globe locations from visible globe clusters. A projection control shows all continents in Mercator and restores the previous globe camera. The flat overview overrides Mercator's automatic height constraint so it can fit a whole world on portrait screens. Globe mode restores the renderer's default constraint. Closely located programmes open a scoped selection list instead of repeatedly zooming into coincident campus markers. Catalogue destination names are mapped to Natural Earth feature aliases where needed. `map-geometry.js` generates small ocean surface patches, keeping the ocean inside the sphere distinct from its dark backdrop, and averages cluster longitudes on a circle to avoid shifting date-line clusters towards Greenwich.

`map-input.js` separates normal wheel translation from browser Ctrl+wheel pinch zoom and computes Safari gesture scale/rotation relative to the gesture-start camera. Native MapLibre handlers support touch, drag, keyboard and rotation. Manual wheel movement cancels camera animation, and normal wheel translation preserves the current zoom. Both browser pinch paths use the active projection's zoom bounds. Reduced-motion preferences bypass camera and panel animations.

`experience.js` renders the search, hidden filters and hidden results. The default view opens directly on the map; the legacy welcome route aliases it. Workspace routes open a panel over the existing map, preserving its camera when returning. Personal data continues to use the original local-storage schema. The build copies the source into `dist/`; hosting serves that directory. WebGL initialisation failure leaves the search/list workflow available.

## Persistence and safety boundaries

Local storage uses the versioned key `gradatlas.workspace.v1`. Backups have a separate schema version and are validated before replacing state. Import limits file size, checks numeric bounds and checklist indices, and strips unsupported top-level fields. User and source text is escaped before HTML rendering. Catalogue external URLs are validated during checks. Imports cannot change catalogue URLs.

Workspace storage can fail due to browser privacy settings or quota. The application falls back to session memory and reports the limitation when saving fails. Exports are initiated by the user. Downloads use temporary Blob URLs and revoke them. Drafts are never posted to a server.

## Data rules

- Application windows are cycle-specific and category-specific; stale records no longer claim current availability.
- Grade comparisons require the same scale and the correct ordering direction.
- Preferred thresholds do not become required thresholds.
- An IELTS overall comparison does not establish component-score, exemption or degree eligibility.
- Missing numeric data results in individual review, not a guessed pass or failure.

## Expansion path

When the catalogue outgrows reviewed JSON, introduce a server and database rather than growing an uncontrolled scraper inside the browser. Separate university, programme, intake, requirement, fee, source evidence, faculty profile and review records. Attach field-level evidence and applicant categories to each mutable fact.

A future ingestion job should fetch permitted official sources, preserve evidence with a timestamp and generate a reviewable change proposal. A human approves material admission changes before they reach users. Jobs must respect source terms, rate limits and extraction failures. An unparseable page keeps its previous fact with a stale marker rather than inventing a replacement.

Optional cloud workspaces require identity, per-user authorization, export/deletion support and backup migration. Public contributions require moderation and audit history. Keep the current static catalogue available as a simple distributable artifact.

## Deployment

Sites hosting uses the account-specific `.openai/hosting.json` with `static.directory = dist`. The initial hosted preview is private. A public release and GitHub repository visibility should be explicit release decisions. The static build is also portable to GitHub Pages and other static hosts; configure an appropriate base path if publishing below a subdirectory.
