# DUO RIO master's identity import — release proposals

Prepared 12 October 2026. No repository files were edited or published.

## Concrete result

`/private/tmp/gradatlas-release-bulk-or-global.json` contains **1,131 additional registry-backed master's identities across 50 Dutch institutions/parent providers**. Together with the current 304 curated records, the proposed catalogue has **1,435 records**. These are registered master's identities, **not 1,131 individually reviewed admission routes or currently open application offers**.

The existing catalogue's programme validator was run against the combined 1,435 records and passed: unique IDs and institution/title pairs, all 17 accepted subject groups, source/evidence membership, dates, coordinates, null admission values and valid delivery labels. No curated record was overwritten. The raw source has 6,861 rows, including 2,751 rows labelled MASTER; raw rows are not programme counts.

## Official source and reuse permission

The [DUO HO Opleidingsoverzicht dataset](https://onderwijsdata.duo.nl/datasets/ho_opleidingsoverzicht) is a government RIO degree/offer registration feed. [Publisher CKAN metadata](https://onderwijsdata.duo.nl/api/3/action/package_show?id=ho_opleidingsoverzicht) identifies resource `ffffa7ad-e6a2-4ba7-9fc2-a09df4128555`, changed `2026-10-12T02:35:35.077783`. Metadata changed `2026-10-12T02:36:36.727879`.

The dataset-specific licence is explicitly `cc-by`, **Creative Commons Attribution**. The publisher supplies `http://www.opendefinition.org/licenses/cc-by`; its [resolved licence overview](https://opendefinition.org/licenses/cc-by/) permits reuse/redistribution with attribution and modification. The publisher does **not specify a licence version**, so these proposals preserve the exact family label rather than relabel the feed CC0 or assert CC BY 4.0 for DUO. The overview points to CC BY 4.0 and also lists earlier versions; this is retained as publisher ambiguity. Dataset-specific attribution applies to DUO-derived content independently of the project's code licence.

Suggested notice: **Source: DUO, Registratie Instellingen en Opleidingen (RIO), HO Opleidingsoverzicht, snapshot updated 12 October 2026. GradAtlas filtered and grouped the source records; DUO does not endorse this reuse.** Preserve the dataset and publisher licence links. No third-party photographs, logos or university prose were copied.

## Filtering and conservative deduplication

The importer selects explicit `GRAAD=MASTER`, `SOORT=OPLEIDING`, a recognised five-digit registration code, and `ERKENNER=NVAO` or `OCW`. Registration/offering start and end dates, when supplied, must cover the snapshot date. The CSV's 1,166 MASTER variant rows are excluded. Some registrations lack offering metadata; they are retained only as degree identities, without a claim about active recruitment.

Current recognised degree groups are initially keyed by board ID and recognised code: 1,175 groups. **23 groups of identically named registrations are merged conservatively**, retaining all codes in `registry.degreeIds`. Different codes can represent different routes or a replacement transition; the feed title alone does not justify counting both separately. No research status, programme succession or calendar duration is inferred from credit loads. Joint degrees explicitly named as joint or `(jd)` are deduplicated across boards by registration code.

**20 candidates are excluded:** 16 already represented in the curated catalogue, and four extra registrations of a joint degree already represented in the proposals. **One is held for institution mapping review:** Thomas More Hogeschool's `Leiderschap in Onderwijstransities`. No matching institution/campus position was invented.

Six of the Netherlands agent's independently reviewed base records supersede these registry proposals, including JADS code 65018 (one Tilburg registration in this snapshot). Utrecht Human-Computer Interaction and Business Informatics are explicitly `VARIANT` records under Information Science code 60809; the registered parent is retained alongside these named applicant-facing variants under the project's current data policy. Radboud's two named Computing Science specialisations are also retained alongside its registered parent, without creating extra DUO variant rows.

## Facts, classifications and unknowns

Each proposal has `registry.provider`, `degreeId`, `institutionId`, `snapshotDate`, `sourceUrl` and `licenceUrl`, plus preserved degree/unit/provider/offering codes, original native/international titles and study-load/form data. Degree evidence refers to the pinned official CSV.

Titles use a **publisher-supplied international name**, otherwise the native legal name. No generated translation is asserted as official English naming. Subject facets are discovery classifications inferred from title terms, not certified curriculum classifications. Five vague titles have a narrowly reviewed official programme description solely to support subject classification; their admissions remain unreviewed. `registry.titleMethod`, `subjectMethod` and `subjectSource` record these distinctions.

Registered language codes are preserved as language evidence for known offerings; **392 proposals have unknown language**, and 475 have English among their recorded languages. Missing language entries are not filled from webpage language. English in a mixed offering set does not guarantee an English-only route. `duration` and delivery `mode` are **Not verified** throughout: full-time/part-time/dual and credit load do not establish online/on-campus delivery or calendar length. GPA, IELTS, fees, application windows, contacts and research capacity remain unknown/null. `tuition.free=false` denotes no recorded no-tuition claim, not a verified paid fee.

The 313 proposals with RIO programme URLs preserve them exactly as supplied; they have not all been visited. The remainder still has a ROR-supplied institution website. `registry.institutionWebsiteSource` is the institution's ROR record. UI links must distinguish a supplied programme URL, an institution website for finding programmes, and the downloadable registration dataset; the raw CSV is not an “Official programme page”. All published navigation should validate HTTP/HTTPS and reject credentials.

## Geographic provenance

Names and approximate localities reuse the existing pinned ROR institution index. [ROR metadata is CC0](https://ror.org/about/terms/); [GeoNames geography is separately attributed](https://www.geonames.org/about.html) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Each proposal includes the GeoNames ID/source URL, ROR source and geographic licence in `registry.location`, with source-list links. Geographic scope is the institution city/locality, **not a checked campus coordinate**. Group-level boards such as Aeres retain the ROR parent locality; specific teaching campuses are not inferred.

Suggested geographic notice: **Institution metadata: Research Organization Registry (ROR), CC0 1.0. Geographic data: GeoNames, CC BY 4.0. Filtered and reformatted by GradAtlas.** Preserve provider/licence links and the existing institution manifest's documented legacy GeoNames licence-link context.

## Reproduction files and integrity

- Raw official CSV: `/private/tmp/gradatlas-release-duo.csv` (3,965,724 bytes).
- SHA-256: `079fc3bd5ee702cb71f11d63e6e1c900daa6fd72b0deae51f4eea8410da2d53d`.
- Pinned metadata: `/private/tmp/gradatlas-release-duo-metadata.json`.
- Proposal JSON: `/private/tmp/gradatlas-release-bulk-or-global.json`.
- Importer: `/private/tmp/gradatlas-release-duo-import.py`.
- Checksum/count/exclusion manifest: `/private/tmp/gradatlas-release-duo-manifest.json`.
- Existing 304-record baseline used for overlap checks: `/private/tmp/gradatlas-release-existing-catalogue.json`; pending source file is now wholly represented in that baseline.

The release integration made the importer portable as `scripts/import-duo.py`, stored the compressed raw CSV and publisher metadata in `data-sources`, and published the provenance manifest with the application. Run the documented CLI in [the catalogue pipeline](../CATALOGUE_PIPELINE.md); it writes proposals, never the live catalogue. The importer verifies the pinned CSV checksum before processing and atomically replaces proposal/manifest outputs. The manifest records CSV, metadata, importer, institution index, existing/pending catalogue and proposal hashes. The raw CSV must remain pinned outside the product bundle or stored as a separately attributed compressed source; a future download from the same mutable URL is a new release requiring diff review. The parent will make paths portable before committing its release pipeline.

Future registry refreshes should compare degree codes, withdrawals, title/code transitions, provider relationships and changed languages, rather than overwrite curated admissions. Admit new identity-only records with their registry badge; promote individual fields only after their own official source review. No historical MonMaster offers or funding project dates are imported as current application windows in this release.

## Integrated v0.8.0 scope

The subsequent Europe batch adds 54 programme-page records. The published catalogue therefore contains 1,489 total records: 358 programme-page records and the same 1,131 registry identities. Original temporary handoff paths above document research provenance; maintained reproduction inputs and commands are in the repository pipeline.
