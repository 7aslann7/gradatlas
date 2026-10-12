# Security and privacy reports

Do not post applicant information, credentials or private browser backups in an issue.

Use [GitHub private vulnerability reporting](https://github.com/7aslann7/gradatlas/security/advisories/new) to report security concerns to the maintainers. Private vulnerability reporting is enabled for this public repository. A public repository issue is not an appropriate disclosure channel for an unpatched vulnerability or personal data.

GradAtlas is a static application. Profiles, notes, saved drafts and backups are browser-local. It has no application submission API, account-sync endpoint, bulk-email delivery or analytics integration. Hosting access is separate from workspace storage. Anyone sharing a browser profile and origin can access the same local workspace.

External university links open under those services' own policies. Hosting providers receive normal requests and may log request metadata. Remote fonts may also make ordinary font requests; no profile, notes or draft content is intentionally transmitted with them.

A report should describe the affected release, browser, reproducible behaviour and expected outcome, using synthetic examples. Keep source credentials, applicant documents and access tokens out of attachments. See [workspace privacy](docs/WORKSPACE_PRIVACY.md) for data handling and backup limitations.
