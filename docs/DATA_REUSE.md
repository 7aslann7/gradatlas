# Data scope, reuse and publication

Reviewed 12 October 2026 against the linked primary-source terms. This describes the current datasets and their licences; it is not blanket clearance for every future data source or product use.

## Two catalogues and a private workspace

The programme catalogue contains 1,489 degree/specialisation records across 88 countries/regions: 358 programme-page records and 1,131 explicitly labelled DUO registry identities. Programme-page records have partial admission evidence; DUO identities have not received an individual admissions review. Multiple programmes can belong to one institution, and named specialisations can be recorded separately. These are not 1,489 universities or a complete world programme inventory.

The institution directory contains 30,174 active education-type ROR identity records from a pinned release, across 223 countries/territories. ROR's purpose is research-organisation identification, not accreditation or a complete university register. Separate independently identified organisations or campuses can have separate IDs. Names, aliases, registry website links and approximate GeoNames localities do not establish master's availability, admission rules, course prerequisites or supervision capacity. See [ROR's scope](https://ror.org/registry).

For example, Nazarbayev University is an institution, while its Political Science and International Relations MA is a programme. The directory exposes institutions whose postgraduate programmes have not been reviewed by GradAtlas. Both catalogues are shared discovery data. A visitor's profile, shortlist, private notes and drafts are a separate browser-local workspace and are excluded from directory exports.

## Rights by component

| Component | Reuse terms and practical obligations |
|---|---|
| ROR identity metadata | [ROR publishes metadata under CC0 1.0](https://ror.readme.io/docs/data-dump). The [CC0 terms](https://creativecommons.org/publicdomain/zero/1.0/) permit copying, modification and redistribution, including commercial use, to the extent covered. CC0 does not grant trademark rights or endorsement. Keep provenance for users even though CC0 does not require copyright attribution. |
| GeoNames locality data | [GeoNames permits commercial reuse with attribution](https://www.geonames.org/export/), and its [current notice](https://www.geonames.org/about.html) links CC BY 4.0. Under the [licence](https://creativecommons.org/licenses/by/4.0/legalcode.en), retain supplied attribution, copyright/licence/disclaimer notices and practicable source links, indicate modifications, and link the licence. Do not imply endorsement or impose additional restrictions on recipients' licensed rights. The ROR release's historical documentation reference to CC BY 3.0 is preserved in the manifest. |
| DUO RIO registered degrees | [Dataset-specific publisher metadata](https://onderwijsdata.duo.nl/api/3/action/package_show?id=ho_opleidingsoverzicht) declares Creative Commons Attribution and supplies [this licence reference](https://opendefinition.org/licenses/cc-by/), without specifying a version. Preserve this declaration, DUO/RIO source credit, source/licence links and GradAtlas filtering/grouping notices. Do not relabel these records CC0 or assume a particular version. Approximate ROR/GeoNames coordinates retain separate geographic attribution. |
| Natural Earth boundaries | [Public domain](https://www.naturalearthdata.com/about/terms-of-use/), including commercial use and modifications. GradAtlas still credits the provider and describes its simplification. |
| Software | GradAtlas and ExcelJS use MIT; MapLibre uses BSD-3-Clause. Preserve the applicable source/binary licence notices when redistributing. See [third-party notices](../THIRD_PARTY_NOTICES.md). |
| University pages and other third-party materials | Official links and short factual information do not grant a licence to copy entire pages, protected descriptions, photos, logos or third-party databases. The software MIT licence does not relicense those materials. Public Internet availability alone does not make a protected work public domain; see [WIPO's explanation](https://www.wipo.int/en/web/copyright/faq-copyright). Check each new source's terms and applicable rights before bulk redistribution. |

The site displays ROR/GeoNames credit, licence links and the fact that the records have been filtered and reformatted. Programme downloads include an envelope with records, scope, DUO provenance and geographic attribution. Registry-bearing Excel comparisons include a Reuse & methodology sheet. Institution downloads contain `records` and `source` together with attribution, reuse and accuracy notes. The compact raw index remains an application asset; use the documented export for redistribution so its accompanying information travels with it. `source.indexSha256` is the hash of that compact published index, not of the export wrapper.

## Quality is separate from permission

An open licence permits defined uses; it does not guarantee factual accuracy, completeness, current links or unchanged admission criteria. Neither a successful validator nor a source review date proves that every field is current. Validation checks structure, identities, provenance, consistency and source/output hashes. The programme interface distinguishes source-linked facts, facts awaiting a field-specific source and missing data. The 90-day freshness flag is a backstop; a fee or deadline can change earlier.

Discovery should be described as a research aid with partial coverage. Use the current programme-specific institution instructions before submitting an application. Registry presence must not be advertised as confirmed eligibility, official endorsement or a verified current master's offer.

## Public release status

The current hosted Site remains an owner-private preview. Updating source and redeploying it does not change access. A public Site launch and public GitHub repository are separate release actions. Before directing public traffic, establish the official repository/maintainer identity and a working correction route, keep licence/provenance notices with distributed assets, and accurately describe the data coverage and browser-local workspace. Central applicant accounts, telemetry or document collection would introduce new data flows that are not present in the current application.
