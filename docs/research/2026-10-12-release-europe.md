# Europe release source review

Checked on 2026-10-12. Deliverable: `src/data/programs.json` (integrated by stable ID) (54 additional catalogue records), prepared without repository changes or publication. The optional local builder is `/private/tmp/build-gradatlas-release-europe.py`.

| Country | Additional records |
| --- | ---: |
| Germany | 22 |
| Austria | 7 |
| Switzerland | 7 |
| Sweden | 8 |
| Finland | 4 |
| Norway | 1 |
| Denmark | 5 |

These are 53 degree-level programme records and one explicitly named Tampere specialisation. TU Graz/TU Wien DI awards are labelled as MSc equivalents, preserving the actual award. The two joint programmes have one record each, rather than a record for every participating university. Innsbruck's record is the Physics degree; its quantum options are not separate awards. No record is just an institution registry entry.

## Evidence and scope

All 54 records have degree evidence; 53 have teaching-language evidence, 53 have duration evidence and 10 have verified teaching-format evidence. `Not verified` teaching format is intentional: full-time status, an English webpage and a campus address alone are not treated as proof of in-person delivery. RWTH Computer Science's exact teaching-language mix and Hamburg Data Science/AI's calendar duration remain unknown. Programme pages support the displayed language labels, including German/mixed-language programmes. Helsinki lists English, Finnish and Swedish degree-language choices.

Every numeric IELTS, professional contact and verified fee/no-tuition statement has a source present in `sources`. Seven numeric IELTS scores are recorded. Native grade rules stay in `gradeNote`, and all numeric `gpa` values are null. Source-linked formal grade rules should be read in their applicant-category context; subject preparation and selection still matter.

The concise summaries are original paraphrases of factual programme scope. No reviews, rankings, admissions probabilities, invented contacts or implied guaranteed eligibility are included. The sample is manually reviewed; it is not a licensed bulk master’s feed. No new bulk-licence/reuse claim is made. Source pages may later move or fail to load; the evidence does not guarantee perpetual link availability.

Map pins are approximate university/campus locations selected for navigation, not independently verified room/building locations. Bern and Copenhagen pins represent a partner campus for their joint programmes; teaching may occur elsewhere.

## Material exclusions and limitations

- [Potsdam Data Science](https://www.uni-potsdam.de/en/studium/what-to-study/master/data-science) was excluded because the official main programme page suspends new enrolment from winter 2026/27. A departmental overview continuing to describe the degree does not override that notice.
- [TU Dresden Distributed Systems Engineering](https://tu-dresden.de/ing/informatik/studium/studienangebot/master-studiengaenge/distributed-systems-engineering) is marked discontinuing and was excluded. Old official brochures were not used to invent a currently open intake or current fees.
- [Würzburg AI & Extended Reality admissions](https://www.informatik.uni-wuerzburg.de/studium/studiengaenge/master-artificial-intelligence-extended-reality/application-admission-requirements/) state winter 2026/27 is the last possible start, with no later applications. This was excluded; the still-described programme homepage did not justify adding a future option. Würzburg's regular AI MSc remains in the batch.
- Three TU Berlin programme pages returned HTTP 403 on direct retrieval. Their official university indexed text was reviewed instead; this limitation is preserved in each record. The Scientific Computing mathematics prerequisites also have a separate official department FAQ. No personal browser login was used.
- Hamburg Intelligent Adaptive Systems has confirmed degree/language/duration and an official programme contact, but the detailed current admission thresholds were not captured; its record says so. Hamburg DSAI has substantial verified credit/English conditions, but no calendar duration is asserted. Its informational English regulations say the German version is legally binding.
- Tampere Information Security is explicitly a specialisation in Computing Sciences and Electrical Engineering, not a separately invented master's degree. Its degree, duration and published fees/window are supported by the programme page. English evidence is from the official 120-credit module covering academic years through 2026/27. Detailed admission thresholds remain unverified and the Studyinfo route is named for individual checking.
- [EPFL Computer Science structure](https://www.epfl.ch/schools/ic/education/master/computer-science/program-structure/) and the [official Data Science guide](https://www.epfl.ch/schools/ic/wp-content/uploads/2025/06/Key-points-for-your-MSc-studies-in-Data-Science.pdf) give at least three coursework semesters followed by a project. Mandatory internship/project arrangements can change elapsed calendar time; the duration labels preserve this structure rather than promise two years.
- JKU AI's `Hybrid` label describes campus lectures streamed to optional satellite sites and in-person exams. It does not assert an entirely online degree.
- [University of Bern](https://www.philnat.unibe.ch/studies/study_programs/master_s_in_computer_science/index_eng.html) confirms the Bern–Fribourg–Neuchâtel joint programme and its dedicated `mcs.unibnf.ch` primary programme site. The 90-ECTS standard and longer optional 120-ECTS minor route are not separately counted.

## Dates, tuition and admission categories

Only fully year-identified future windows are recorded. Chalmers explicitly publishes 16 October 2026–15 January 2027. Helsinki, Oulu and Tampere publish dated future application periods. TU Graz's 2027/28 admission-procedure registration is scoped to applicants required to complete that procedure; it is not a universal enrolment deadline. The page lists relevant degree-location exemptions, including changes from winter 2027/28.

KTH's future-cycle dates, recurring German month/day dates and closed 2026 Swedish/Hamburg rounds were not promoted into invented universal future windows. The records preserve relevant recurring/closed-cycle notes. Deadline category, document submission and exemption rules should be checked on the linked official page.

Fee amounts are applicant-specific published amounts; they are not guaranteed universal charges. No German public-university no-tuition assumption was made. Only Potsdam Cognitive Systems has an explicit no-tuition claim. Fees remain unknown for the other degrees unless the programme source gave a concrete amount. Semester contributions, exemptions and future changes require confirmation.

Konstanz's official admission procedure is a points system with subject and degree-country rules. Its native 3.0 condition and IELTS Academic 6.0 are sourced without GPA conversion. Ulm AI has different native grade requirements for computing vs broader related-degree entrants. Lübeck's official international document page lists its grade prerequisite and required eligibility form; the record points back to current programme regulations for exceptions. Mannheim's current degree-specific English page confirms IELTS Academic 6.0 and prior-education alternatives.

## Validation

The builder re-read the current catalogue (304 entries during the final pass) and found no ID collision. Record IDs are unique within the batch. Existing field taxonomy is used. All evidence, IELTS, window, contact and tuition provenance URLs are included in `sources`; every window contains a category. All `gpa` values are null. The source-check and incomplete-metadata limitations remain in the JSON, not just this memo.
