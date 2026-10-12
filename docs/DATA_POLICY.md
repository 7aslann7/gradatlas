# Data policy

## Authority and provenance

Use official university programme pages, admission regulations, fees pages and application portals as primary sources. Programme summaries must be original short descriptions, not copied pages. Store official links and a review date. Use subject groups from `FIELDS` in `core.js`; retain stable IDs as the catalogue grows. Programme and explicitly named specialisation records may coexist, but do not duplicate a joint degree under each teaching institution. Numeric grade rules, IELTS values, no-tuition claims and application windows must point directly to their supporting source. `evidence` stores individually reviewed degree, teaching-language, duration and delivery sources with dates. Every evidence URL must belong to the record's source list. Unknown fields cannot be labelled as confirmed evidence.

An official programme page may confirm programme scope while leaving the admission cycle unknown. A record's review date describes when its stated information was checked; it does not mean every potential field is complete. Use `dataNote` to explain partial verification. Teaching language, duration and delivery mode are facts to verify, not assumptions from the webpage language. Unknown delivery mode is `Not verified`; use `Hybrid` for verified blended delivery and explain any attendance ambiguity. Country/region labels describe catalogue destinations and include Hong Kong as a separate admissions jurisdiction.

## Dates

Only record a window when its year, opening date, closing date and applicant category are supported. Keep annual recurring guidance in `scheduleNote`. Do not infer a new-year deadline from a previous cycle. Calendar files are all-day reminders to verify the recorded deadline, not a claim about a university's exact cutoff time.

Recorded date-window status is evaluated on calendar dates in Europe/Istanbul. The label “Within recorded dates” describes date coverage, not a live check of the application portal. The interface always asks applicants to check the official cutoff time and time zone. Data older than 90 days is stale; this is a backstop, not a guarantee that a source cannot change sooner.

## Academic and language requirements

Keep the original grading system. Never convert a Turkish 4-point GPA into a Dutch or German grade without an institution-authorised method and its applicability conditions. Distinguish a hard threshold, an expectation, a preference and an individual review process.

Numeric IELTS additions must include `ieltsSource` pointing to a listed official source. IELTS overall thresholds are an incomplete screen. The university may also require component scores, accepted test versions, validity periods or an exemption. A gap badge describes a recorded comparison, not an admission decision.

## Fees and funding

State currency, period, published year and applicant category wherever verified. "No tuition" does not mean no semester contributions or living costs. Avoid comparing totals across currencies without a dated conversion and clear assumptions. Funding availability and scholarship eligibility require their own verified records; a scholarship name alone is insufficient.

## Faculty and community material

Record only official professional contacts. Do not guess email patterns or infer supervision capacity from a faculty biography. Future student experiences must remain visibly separate from institutional rules. Any future reviews require moderation and a correction route.

## Geographic data

The ROR institution directory is a separate identity/locality layer. It filters a pinned, checksum-verified release to active education-type records and preserves ROR IDs, names/aliases, registry website links and approximate GeoNames locations. This category can include schools, subdivisions and research-linked education bodies; no accreditation, university status or master's availability is inferred. Metadata is CC0, with GeoNames geographic attribution retained separately. Importing a registry does not reverify every website or introduce programme facts. See `CATALOGUE_PIPELINE.md` and `THIRD_PARTY_NOTICES.md`.

The base map is a simplified rendering of Natural Earth boundaries, distributed by [datasets/geo-countries](https://github.com/datasets/geo-countries). Locations are approximate programme or campus locations. The map is a discovery aid and is not intended to adjudicate disputed boundaries.
