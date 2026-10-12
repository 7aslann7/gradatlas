# GradAtlas catalogue scale proposal
Research checked 12 October 2026. Current application data contains 251 programme/specialisation records; 88 countries/regions. This memo proposes a data pipeline, not a claim that thousands of programmes or their admission rules have already been verified.

## Decision

Use a broad institution index and a separately evidenced master's catalogue. Scale should come from licensed registries and institution feeds, stable identifiers and reviewable imports. A larger map must not imply that every indexed institution has a checked master's degree, or that every programme has current admissions information.

## Two public tiers

| Tier | Contents and minimum evidence | User-facing meaning |
|---|---|---|
| Institution index | Stable institution ID, names/aliases, country, official website, approximate location and source/version. Start with active education organisations from ROR; check campus/parent relationships. | “Institution indexed. Programmes may need review.” Separate marker style and count. No implied degree availability, ranking, GPA fit or application status. |
| Master's programme catalogue | Awarding institution(s), actual qualification, official programme identity and URL, degree versus track, evidence scope and review date. Optional language, duration, fees and entry rules each have their own evidence. | “Master's programme checked” describes the fields actually checked. Show unknown or stale admissions fields explicitly. Programme count excludes institutions, undergraduates and duplicated tracks. |

Keep bulk proposals in an internal review queue. A historical registry entry is useful discovery evidence but does not automatically become a current programme. Existing records should move to this model without receiving a blanket “fully verified” label.

## Official sources and reuse paths

| Source | Useful scope / structured access | Reuse and ingestion decision |
|---|---|---|
| [ROR dump](https://ror.readme.io/docs/data-dump), [terms](https://ror.org/about/terms/) | Global research-organisation JSON/CSV releases and API; stable IDs, aliases, websites and relationships. | Registry metadata is CC0. Eligible for the institution index immediately after import checks. ROR is not a master's programme dataset or a complete accredited-university list. |
| [France MonMaster 2024/25](https://www.data.gouv.fr/datasets/monmaster-2024-2025-voeux-de-poursuite-detudes-et-de-reorientation-en-master-et-reponses-des-etablissements) | Ministry publishes CSV (11.3 MB) and JSON; historical master's application offers. The 2025 campaign covers 8,167 offers. | Explicit Etalab Open Licence 2.0. Strong first bulk programme-proposal source. Preserve session and offer/track identity; neither row count nor historical admission statistics is a current verified-programme count. |
| [DUO/RIO degree overview](https://onderwijsdata.duo.nl/datasets/ho_opleidingsoverzicht), [resource/API documentation](https://onderwijsdata.duo.nl/datasets/ho_opleidingsoverzicht/resources/ffffa7ad-e6a2-4ba7-9fc2-a09df4128555) | Daily funded Dutch degree/offer data; CSV/JSON and CKAN datastore API. Fields include level, award, recognition code, provider, language, study load, dates and programme website. | Dataset metadata says Creative Commons Attribution, while [DUO's general reuse page](https://duo.nl/open_onderwijsdata/veelgestelde-vragen/hergebruik.jsp) says CC0. Capture the exact resource licence/version before redistribution; do not silently select the weaker condition. |
| [Onisep higher-education offers](https://www.data.gouv.fr/datasets/ideo-actions-de-formation-initiale-univers-enseignement-superieur) | Current French initial higher-education offers, degree/certificate nature, indicative duration, provider pages, locations/GPS and update dates; several export formats. | Explicit [ODbL](https://opendatacommons.org/licenses/odbl/summary/). Mixed levels and duplicate locations require filtering/deduplication. Keep a separately licensed source package and account for ODbL attribution/share-alike requirements before merging a derived public database. A listed CSV download returned 404 during this check. |
| [DAAD International Programmes](https://www2.daad.de/deutschland/studienangebote/international-programmes/en/) | Curated international programmes, with degree/course-type filters; useful discovery and cross-checks. | [DAAD's imprint](https://www.daad.de/en/imprint/) states copyright protection. No open bulk dataset licence or supported public ingestion API was verified. Link out, or obtain a publisher feed/reuse agreement. |
| [Study in NL Studyfinder](https://www.studyinnl.org/dutch-education/studies) | English-taught Dutch programmes, including bachelor's, master's and short courses. | No explicit open bulk data licence/API verified. Use discovery links or a Nuffic data agreement; [its application guide](https://www.studyinnl.org/plan-your-stay/how-to-apply) directs users to the institution's programme requirements. |
| [EACEA Erasmus Mundus catalogue](https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en) | Annually updated joint master's projects, consortium institutions and official programme links; page offers RSS. | [EU reuse notice](https://commission.europa.eu/legal-notice_en) gives CC BY 4.0 for EU-owned content unless otherwise indicated, with third-party exclusions. Attribute eligible factual catalogue metadata; consortium pages have their own rights. Funding project dates do not establish intake dates or scholarship availability. |
| [HRK Hochschulkompass partner route](https://www.hochschulkompass.de/en/about-us/collaborative-partners.html) | Nationwide German programme information supplied by institutions; formal partner publishing arrangements exist. | Partner data is restricted to the agreed purpose and modification rules. [Download lists](https://www.hochschulkompass.de/en/higher-education-institutions/downloads.html) are personal-use only without permission. Seek a compatible agreement rather than treating public access as an open licence. |
| [Finland Opintopolku API documentation](https://wiki.eduuni.fi/spaces/ophPPK/pages/190612447/Koulutustarjonta%2Bja%2BOpintopolku.fi%2Btietomallit%2Bja%2Brajapinnat) | Official Kouta/Konfo education-offer APIs; public Konfo endpoints can display published offers on other websites. | Documentation specifies caller-ID and, for some requests, CSRF requirements. Exact dataset redistribution licence and current schema must be checked before release; no open-licence claim is made here. |

ROR locations generally describe cities or administrative areas, not exact campus entrances; retain `locationAccuracy: city` until a campus source exists. [ROR fields](https://ror.readme.io/docs/fields) provide the location and type definitions.

Institution feeds should use a small provider-owned CSV/JSON schema, official-domain verification, stable degree IDs and an explicit data-reuse grant. Accept feeds or contributor proposals without requiring a public student account. HTML can support narrow factual review; do not promise an unrestricted whole-site scraper.

## First immediately eligible bulk source

France's MonMaster dataset is explicitly downloadable and openly licensed. [The licence](https://www.data.gouv.fr/pages/legal/licences/etalab-2.0) permits reuse/adaptation with source and update-date attribution, and forbids misleading endorsement/source/date presentation. Import the latest available session into proposals, retain historical sessions separately, and link to current institutional programme pages before promotion.

The publisher lists CSV/JSON, but bulk retrieval was not successfully completed in this research environment: the API/download attempts failed, and the local shell could not resolve the publisher domain. No raw file was parsed or record count independently calculated. Run a download, checksum and parser smoke check before announcing an imported count. “8,167 offers in 2025” is the publisher's scope figure, not a successful GradAtlas import.

## Ingestion, review and versioning

1. **Register each source:** publisher, source URL, licence URL/version, allowed scope, attribution, schema version, update frequency and retrieval method. Disable a source adapter when permission or schema becomes unclear.
2. **Snapshot immutable input:** retrieval time, publisher update/session, content hash, HTTP status and parser version. Use conditional requests and documented API limits; fetch bulk releases instead of thousands of repeated page calls.
3. **Normalize proposals:** preserve source IDs, original language/title and qualification; map institution IDs and subject taxonomy separately. Unknown fields stay null. Automated extraction may propose a fact with a source locator, never fabricate GPA conversion, eligibility or dates.
4. **Review diffs:** deterministic checks for degree type, official domains, chronology, provenance, fees/category and duplicates. Human review handles ambiguous qualifications, changed eligibility, conflicting sources and fuzzy matches. A broken source suspends the affected field, not all unrelated verified facts.
5. **Approve a versioned release:** manifest, added/changed/withdrawn counts, source licences, scope coverage, QA outcomes and rollback hash. Publish a small tested country/source import first, then increase batch size based on observed accuracy.

Recommended entities: `institutions`, `campuses`, `degrees`, `tracks`, `offerings`, `applicationCycles`, `sources`, `fieldEvidence`, `importRuns`. Evidence needs source, locator, value, scope, checkedAt, sourceUpdatedAt, applicable intake/category, review status and staleAfter. Keep raw licensed packages separate from the application code's licence.

Deduplicate by registry/provider degree ID and institution identity first. Separate bachelor's, integrated qualifications, master's and certificates by explicit award/level, not words such as “graduate” or EQF level alone. A specialization belongs to its parent degree. Mode, language, campus and intake are offerings; they should not multiply the degree count. Joint degrees have one degree with several awarders; separate credentials remain distinct. Similar names only produce review suggestions.

Freshness is field-specific: stable identity can use scheduled source releases; fees must name their academic year and category; windows require a complete dated cycle/category and exact closing time where published. Recheck near an application deadline, never roll dates forward automatically, and expire current-availability claims when evidence is stale. Historical admission statistics remain population- and session-specific and are not personal acceptance probabilities.

Public counters should expose institution count, checked degree count, separately counted tracks, current admission windows, coverage by country/field and source/review dates. Performance can scale independently through clustered institution layers, country/region programme shards and indexed search; loading every degree or 30,000 DOM markers at once is unnecessary.

## Nazarbayev page check

The opened [MA Political Science and International Relations page](https://nu.edu.kz/sprogram/master-of-arts-in-political-science-and-international-relations/) is valid and explicitly states master's level, English, two years and full-time campus study. It belongs to political/social sciences, not computing.

The [central master's admissions page](https://nu.edu.kz/admissions/how-to-apply/masters/regular-admissions-masters/) now labels the 2027/28 dates as “To be announced”; keep the window null and prefer this English source for current general requirements. The [Russian school page](https://ssh.nu.edu.kz/ru/mapsirgr) retains passed 2026-cycle dates and a fee explicitly labelled 2025/26. The [central fee page](https://nu.edu.kz/admissions/fees-and-funding/) publishes US$16,000 per academic year for master's programmes without an intake-year label. That does not establish a guaranteed 2027 fee or unconditional free scholarship. Existing unknown tuition/window treatment is defensible; update the schedule note to mention the pending 2027/28 central page.

No repository edits, imports, publishing or external messages were performed for this memo.
