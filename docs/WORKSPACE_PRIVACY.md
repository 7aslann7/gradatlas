# Workspace storage and visitor privacy

## Current behaviour

GradAtlas is a static application. Its catalogue is public-source content shipped with the application. The personal workspace is held under `gradatlas.workspace.v1` in the current browser's local storage.

The optional profile holds a degree label, current grade, grading scale and optional IELTS overall score. A visitor can search, inspect programmes and compare them without creating a profile. Profiles support a limited review of recorded thresholds; they are not accounts or admission decisions.

Shortlists, comparisons, programme notes, preparation steps and application tracking save locally. Enquiry edits remain in session memory until the visitor explicitly chooses **Save in this browser**. A saved enquiry includes its subject, body, purpose and form fields so it can be resumed. Copy, download and email-app opening are initiated by the visitor. GradAtlas sends no enquiry automatically and does not upload profile fields, notes or drafts to an application server.

## What happens when the site is shared

Each browser profile has its own workspace for the website's origin. Visitors on different devices or browser profiles do not automatically share a workspace. People using the same browser profile on the same device and website do share the stored workspace, even if they use different hosting access accounts. Hosting sign-in controls access to the preview; it is not application workspace identity or synchronisation.

Ordinary local storage can survive closing and reopening the browser. It can still be removed by clearing site data, browser policies or storage limits. Private-browsing storage is normally cleared when the private session ends. The app falls back to session-only state when a save fails and reports that limitation. These browser behaviours are documented in [MDN's localStorage reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

Export a workspace backup to move devices or keep a recovery copy. The backup is an unencrypted private file containing profile answers, notes and saved enquiries. Keep it private. Version 2 includes drafts; version 1 imports remain supported. Import validates lengths, score ranges, task indices and draft fields before asking to replace the current local workspace. Catalogue URLs cannot be replaced through a workspace backup.

Hosting providers receive the page and asset requests needed to serve the application. Typography may request Google Fonts. The app includes no visitor analytics or profile-upload endpoint. An optional future cloud service would have a separately defined data flow and access model.

## Next stage

Keep discovery free and profile creation optional. Before adding cross-device sync, provide an explicit account and opt-in choice, a preview of what will be synchronised, per-user access controls, export and deletion support, and a migration from the existing browser workspace. A user who chooses local-only storage should retain the same discovery and preparation features.

Do not introduce central collection of applicant scores, documents, contact lists or enquiry contents merely because the site is public. Future user feedback and catalogue corrections should have their own minimal submission fields, review process and retention policy.
