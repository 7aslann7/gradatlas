# GradAtlas release research: Netherlands, UK, Ireland and North America

Checked 12 October 2026. Final dataset: `src/data/programs.json` (integrated by stable ID).

The file contains 53 distinct master's degree or explicitly named specialisation records: Netherlands 10, United Kingdom 14, Ireland 9, United States 10 and Canada 10. Forty-eight records include Computer Science; other represented fields include AI & Machine Learning, Cybersecurity, Engineering, Business & Management, Physics & Mathematics, Social Sciences, Arts & Humanities, Environment, Life Sciences and Medicine & Public Health.

Official university programme, course-catalogue, departmental programme and admissions pages establish every degree identity. Institution-only rows, doctorates, certificates and undergraduate awards were not used. The Radboud and Trinity computing specialisations/strands are explicitly named, with different curricula. Shared delivery routes and closely equivalent award labels are represented once: Michigan MS/MSE, Illinois MCS campus/online alternatives, JADS joint MSc and UCD full/part-time routes are not used to inflate the count.

Validation against the 251-record repository catalogue found no duplicate IDs or exact university/title identities. Manual identity checks also excluded existing Stanford MSCS, Georgia Tech OMSCS, UvA/VU joint Computer Science, Groningen AI and the previously listed Dutch CS/AI degrees. Existing named programmes at a university do not exclude a genuinely different master's there.

Coverage is intentionally partial: degree evidence 53/53, duration 43/53, language 11/53 and delivery mode 14/53 (Oxford attendance additionally checked by the integration audit). Instructional language is not inferred from the source webpage's language, the country's language or an IELTS admission rule. Unknowns are explicit. A page saying full-time is not automatically labelled on campus. General catalogue descriptions of all possible delivery modes are not treated as a programme-specific mode selection.

All evidence URLs, numeric IELTS sources, contacts and the verified numeric fee have matching provenance in each record's sources. Numeric comparable-GPA fields are null; original UK/Irish honours standards and limited institution-specific grade text are retained without conversion. There are no date-window objects: closing-only dates, annual guidance, unclear intake-year context and inconsistent headers remain notes. Review dates mean the recorded facts were checked, not that every possible admissions field has been fully reviewed.

Important source and eligibility findings:
- Toronto's research MSc in Computer Science explicitly does not consider international applicants. This batch instead uses the genuine, internationally accessible MSc in Applied Computing, with its observed 16-month in-person structure. [Research MSc restriction](https://web.cs.toronto.edu/graduate/msc), [MScAC structure](https://mscac.utoronto.ca/prospective-students/), [MScAC applications](https://mscac.utoronto.ca/apply/).
- Alberta's department explicitly discontinued the general course-based Computing Science MSc indefinitely. The addition is its thesis programme. The intake page contains an older Fall 2026 heading alongside Fall 2027 guidance, so an unambiguous application-window object was not constructed. [Programme](https://www.ualberta.ca/en/computing-science/graduate-studies/programs-and-admissions/msc-program/index.html), [Current intake page](https://www.ualberta.ca/en/computing-science/graduate-studies/index.html).
- Columbia's 2.7 enrolled-student GPA, Wisconsin's completion GPA, and Ottawa's qualifying-year/co-op rules are not treated as admission thresholds.
- UCD's generic undergraduate/school-leaving links appear within course output; they are not sufficient evidence of master's entry requirements.
- Cambridge's MPhil is an actual nine-month postgraduate master's programme. CMU's independent MSCS/MSML are distinct from degrees available only during doctoral study; the latter were excluded.
- York and Imperial official pages were accessible through official search-index content while direct page extraction sometimes failed. UCL and some Irish course pages still expose 2026 facts alongside newer-cycle links or application routes. No page's historic fee or deadline was carried forward as a current applicant offer.
- The Leeds fee is specifically GBP 34,600 total for international 2027 entry, with provenance. Other fees remain unknown.
- Published faculty research topics or general funding descriptions are not interpreted as guaranteed supervision, funding or acceptance. The user should confirm category-specific details through the official route.

## DUO registry coordination

The concurrent licensed DUO import contains eight Dutch base identities also reviewed here. These reviewed programme records should supersede the corresponding registry-only rows; their degree/language/duration evidence adds meaningful detail. The following IDs were sent to `quantum_catalogue` for exclusion from its bulk proposal:
- `uva-software-engineering`
- `vu-information-sciences`
- `delft-computer-science`
- `groningen-computing-science`
- `utrecht-human-computer-interaction`
- `utrecht-business-informatics`
- `twente-philosophy-science-technology-society`
- `jads-data-science-business-entrepreneurship`

JADS is one jointly offered Tilburg/TUe programme at 's-Hertogenbosch; both institutional registry occurrences should be reconciled if their registration identifiers confirm the same programme. The two Radboud named specialisations remain distinct from the registry's base Computing Science record. Parent owns final merge-level identity reconciliation.

All map coordinates are approximate campus/locality markers. These research results do not guarantee future link availability, an open application portal, complete admissions coverage or 100% factual accuracy. The catalogue should retain source links, field-level review evidence, correction routes and visible unknowns.

No repository edits, publication, commits, applications or external-party messages were performed.
