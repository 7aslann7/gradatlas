# Workspace storage and visitor privacy

## Current behaviour

GradAtlas is a static application. Its catalogue is public-source content shipped with the application. The personal workspace is held under `gradatlas.workspace.v1` in the current browser's local storage.

The optional profile holds a degree label, current grade, grading scale and optional IELTS overall score. A visitor can search, inspect programmes and compare them without creating a profile. Profiles support a limited review of recorded thresholds; they are not accounts or admission decisions.

Shortlists, comparisons, programme notes, preparation steps and application tracking save locally. Enquiry edits remain in session memory until the visitor explicitly chooses **Save in this browser**. A saved enquiry includes its subject, body, purpose and form fields so it can be resumed. Copy, download and email-app opening are initiated by the visitor. GradAtlas sends no enquiry automatically and does not upload profile fields, notes or drafts to an application server.

## What happens when the site is shared

Each browser profile has its own workspace for the website's origin. Visitors on different devices or browser profiles do not automatically share a workspace. People using the same browser profile on the same device and website do share the stored workspace, even if they use different hosting access accounts. Hosting sign-in controls access to the preview; it is not application workspace identity or synchronisation.

Ordinary local storage can survive closing and reopening the browser. It can still be removed by clearing site data, browser policies or storage limits. Private-browsing storage is normally cleared when the private session ends. The app falls back to session-only state when a save fails and reports that limitation. These browser behaviours are documented in [MDN's localStorage reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

Export a workspace backup to move devices or keep a recovery copy. The backup is an unencrypted private file containing profile answers, notes and saved enquiries. Keep it private. Version 2 includes drafts; version 1 imports remain supported. Import validates lengths, score ranges, task indices and draft fields before asking to replace the current local workspace. Catalogue URLs cannot be replaced through a workspace backup.

Hosting providers receive the page and asset requests needed to serve the application. Typography may request Google Fonts. The official GitHub Pages site uses Cloudflare Web Analytics for aggregate page-load, visitor and performance measurement. The browser loads Cloudflare's beacon from `static.cloudflareinsights.com` and sends measurements to `cloudflareinsights.com`. Cloudflare documents country, device, browser, path and referring-host dimensions; its beacon excludes URL query strings. See [data collection](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/), [dimensions](https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/) and [query-string limits](https://developers.cloudflare.com/web-analytics/faq/).

GradAtlas does not send profile answers, search input, selected programmes, notes or enquiry text as analytics events. Automatic SPA route measurement is disabled: switching workspace panels is not recorded as a separate page view. No profile-upload endpoint or account sync exists. Local previews, forks, unrelated GitHub project paths and the old prototype do not load the beacon. Ordinary visits to the original Sites address redirect to the official GitHub Pages website. For one-time recovery of an old browser workspace, use `https://gradatlas.decentcloud16.chatgpt.site/?recover-workspace#sources`, download its recovery backup, then restore it on the official site. The redirect never copies personal data between origins or deletes old local storage.

Measurement begins when the integration is deployed; earlier website traffic cannot be reconstructed. Privacy tools and network failures can prevent measurement, and Cloudflare may sample dashboard results. Counts are estimates of observed traffic, not admission activity or guaranteed unique people. [Cloudflare limitations](https://developers.cloudflare.com/web-analytics/faq/).

## Next stage

Keep discovery free and profile creation optional. Before adding cross-device sync, provide an explicit account and opt-in choice, a preview of what will be synchronised, per-user access controls, export and deletion support, and a migration from the existing browser workspace. A user who chooses local-only storage should retain the same discovery and preparation features.

Do not introduce central collection of applicant scores, documents, contact lists or enquiry contents merely because the site is public. Future user feedback and catalogue corrections should have their own minimal submission fields, review process and retention policy.

## Readable exports and recovery

Download workspace Excel creates a local `.xlsx` snapshot containing programme activity, profile, notes, preparation progress and explicitly saved enquiries. It makes research usable outside the app. Spreadsheet edits do not sync back into the browser workspace. Long notes and draft messages continue in numbered parts. Keep the export private when it contains personal material.

The separately labelled recovery backup remains JSON because it restores the app state exactly. It is available only from Data & methodology. Preparation plans and individual enquiry downloads remain plain text.
