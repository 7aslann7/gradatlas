# Development roadmap

## Implemented through v0.8

- A restrained interactive globe and full-screen flat map, native geographic clusters, viewport zoom/pan limits, trackpad/touch controls and keyboard-accessible location actions.
- A 1,489-record, 88-destination catalogue across 17 subject groups: 358 programme-page records and 1,131 clearly labelled DUO registered identities, with field-specific evidence, explicit unknowns and targeted audits of dates, grade thresholds, language proof and tuition.
- A pinned, licensed ROR directory of 30,174 active education institutions across 223 countries/territories, with reproducible checksum-verified import, approximate locality caveats, search and on-demand loading.
- Right-hand shortlist/comparison drawers, stable map input across list sorting and formatted local Excel exports.
- Optional browser-local profile, shortlist, comparisons, notes and preparation steps.
- Application Studio preparation plans, locally saved editable enquiries, placeholder review and eight scoped official university guides.
- Version 2 private workspace backups, backward-compatible imports and a portable static build.
- Private GitHub source, correction templates, pinned ROR/DUO adapters, source-reproduction tests and desktop/mobile browser CI.

## Next: a maintained catalogue

Move from hand-reviewed JSON to separate university, programme, intake, applicant category, requirement, fee and evidence entities. Keep current stable IDs and the static catalogue export. Do not treat campus count, programme count and specialisation count as interchangeable.

The institution index and DUO registered-degree adapter are implemented. Further programme source adapters should begin with permitted structured official sources and an internal review queue; historical offers must not be promoted as current admissions. See [catalogue pipeline](CATALOGUE_PIPELINE.md). Fetching should produce a review proposal rather than directly replace published requirements. Attach a reviewed source, timestamp, applicant scope and cycle to every mutable fact. Detect broken links and changed source content, then route changes to maintainers. Preserve a correction history and expose stale or unavailable evidence to visitors.

Prioritise exact cutoff times, international-degree recognition, prerequisite courses and credit requirements, current tuition categories and programme-specific documents. Keep unavailable facts unknown. Link checking confirms availability of a page, not correctness of its admissions contents.

Exit criterion: applicants can build a shortlist and see what is supported, what is missing, and what needs reconfirmation. Maintainers can approve or reject a source change with an audit trail.

## Then: public pilot and contribution workflow

The v0.9 website is public; its GitHub source repository remains private. The English contributor guide and data correction template are prepared for a later source release. Test the product with applicants from different degree backgrounds, countries and accessibility needs. Add a public correction route with the affected field and an official source before wider community outreach. Moderate submissions before publication; separate applicant experiences from institutional rules.

Confirm repository and site visibility as a release decision. Keep applicant workspaces out of source control. Free discovery and preparation should remain available without a profile or paid tier.

## Optional: account sync

Keep the current local workflow. Add cross-device sync only as an explicit opt-in feature, with per-user data isolation, export/deletion, conflict handling and a reviewed migration from browser backups. Hosting access accounts must not be mistaken for application workspace accounts. See [workspace privacy](WORKSPACE_PRIVACY.md).

## Later: richer research discovery

Add verified research groups and professional contacts with subject tags and source history. Supervisor availability requires its own dated evidence; a biography or published email does not establish availability. Consider moderated community experiences after the catalogue correction workflow is reliable.
