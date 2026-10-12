# Maintained catalogue and bulk ingestion

## Published in v0.7

The checked master's catalogue contains 251 programme/specialisation records in 88 countries/regions. The separate ROR directory contains 30,174 active education-type institution records in 223 countries/territories, from release v2.14 (6 October 2026). Institution metadata is not proof of accreditation, university status, a master's offer or admissions eligibility.

`data-sources/ror-v2.14.json` pins the official release, archive checksum, schema, filter and source licences. `scripts/import-ror.py` verifies that archive and produces `src/data/institutions.json` plus its provenance manifest. One ROR ID becomes one institution point at its first valid GeoNames locality. No random offsets or invented campus coordinates are added. The browser loads the index on request; native clustering and 50-result pages keep 30,000 HTML cards or markers out of the interface.

```sh
python3 scripts/import-ror.py \
  --archive /absolute/path/v2.14-2026-10-06-ror-data.zip \
  --release data-sources/ror-v2.14.json \
  --output src/data/institutions.json \
  --manifest-output src/data/institution-manifest.json
npm run check
```

Download the pinned release from its manifest's official HTTPS URL. Review a new release and update the pinned source definition deliberately; there is no unreviewed background refresh. The validator checks the published SHA-256, IDs, counts, locality bounds, name fields and URL protocols. A successful import confirms structural consistency, not all registry websites' availability.

## Scaling programme coverage

The institution layer solves broad institution discovery. Programme growth needs a second pipeline with licensed provider feeds and source-backed review. Tens of thousands of rows can represent overlapping tracks or historical application offers, so importing them directly as current degrees would overstate coverage.

1. Register the source's exact reuse rights, scope, original IDs and attribution. Public HTML access alone does not establish bulk redistribution rights.
2. Store an immutable, hashed raw snapshot with its publisher date, intake/session and parser version.
3. Normalize proposals into institutions, degrees, tracks, campuses, offerings and application cycles. Keep qualification and original-language titles; do not infer level from the word “graduate”.
4. Validate field evidence, dated cycles, applicant categories, prerequisites, fee periods and identities. Fuzzy name matches propose a review; they do not silently merge degrees.
5. Review changes and publish a versioned diff. Preserve withdrawn records and correction history. Recheck mutable facts near deadlines, without rolling dates forward automatically.

The next candidate source is the French ministry's licensed MonMaster dataset. Its 2025 campaign lists 8,167 historical application offers; those have not been imported into GradAtlas. First verify the downloadable resource, parse it and deduplicate degree/track/offer/cycle records into a review queue. Current admission facts then require current institutional evidence. Dutch DUO/RIO feeds and Erasmus Mundus metadata are other candidates after exact source licence and scope checks. DAAD and Hochschulkompass need their publisher's permitted reuse route. See [source research](research/2026-10-12-catalogue-scale.md).

## Acceptance criteria for the next programme import

Publish counts of distinct degrees, separately counted specialisations, countries and currently evidenced admission fields. Every promoted record needs an actual master's qualification, institution identity, official programme URL and review date. Each fee, deadline, grade and language fact needs its own source and applicant scope. Missing fields remain visible, and no personal acceptance probability is derived from historical cohorts.

The public directory download wraps `records` and `source` together with attribution, licence links and limitations. The compact raw array remains an internal map asset; see [data reuse](DATA_REUSE.md).

The review queue, programme source adapters and scheduled evidence maintenance remain to be implemented. The ROR index importer and its validation are implemented. These are different milestones.
