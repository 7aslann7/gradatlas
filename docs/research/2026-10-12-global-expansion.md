# Global expansion source audit

Reviewed 12 October 2026. The 90-record expansion uses official university sources. Each record retains its source links and material limitations. Campus coordinates are approximate. This document records the regional evidence caveats.

The final integration leaves Makerere’s current duration explicitly unverified and adds Manchester’s published postgraduate admissions contact from its official programme page.

## GradAtlas Americas and Africa expansion v5


30 additional master’s records, 17 countries, 23 mapped cities and 23 distinct institutions. Eight programmes deepen US/Canada coverage in Seattle, New York, Cambridge, Pittsburgh, Chicago, Montréal, Waterloo and Calgary. Fifteen new countries: Colombia, Peru, Ecuador, Costa Rica, Uruguay, Nigeria, Uganda, Tanzania, Rwanda, Ethiopia, Morocco, Tunisia, Mauritius, Botswana and Senegal. Coordinates are approximate campus/institution map points.

Every record links primary official programme or degree sources. Fields use the existing taxonomy. Native grade rules and category-specific GPA scopes remain text, with `gpa: null`; no foreign-grade conversion or acceptance probability is asserted. Only the University of Washington and Waterloo have numeric IELTS values, each with programme-specific source URLs. Every contact includes its source, also in the record’s sources array. Fees are conservatively unverified; no default free-tuition claim is made. No recurring annual date is promoted into a dated window.

Three complete current windows: Andes Economics, Andes Architecture (27 July–18 November 2026 for January 2027) and CMU MSE (9 September–9 December 2026 for autumn 2027). CMU deadline time and separate coding-assessment deadline are in `scheduleNote`. The Andes Economics main degree page supports the window, while a lower paragraph on the admissions page has an inconsistent year; no date is taken from that paragraph.

Important review caveats:

- Many Latin American and African programmes publish their pages in Spanish/French/English without explicitly stating teaching language. These remain `Not verified`; page language is not treated as instruction language. Format likewise remains unknown when not explicit.
- UCR Biology and Genetics/Molecular Biology are two separately awarded academic master’s degrees. The common admissions source is paraphrased sparingly across both records. Their degrees do not guarantee professional registration in Costa Rica. The third UCR degree, Bioinformatics/Systems Biology, has substantial verified entry criteria but no verified duration.
- Makerere’s current live official page supplies degree and entry conditions. The 22-month duration is from a school-hosted test-site curriculum copy and is flagged for current confirmation. The source remains a university-school domain; no third-party advising site was used.
- Rwanda’s centre currently links a 2026–27 call through Google Drive, but its PDF content could not be inspected. The current existence is supported by the centre and entry/duration by the university college document. The 2021 call’s alternative lower-class route and dates are not treated as current.
- Mauritius explicitly lists MSc Financial Economics SH506 for 2026–27, two years part-time. Its full catalogue is restricted; the public abridged PDF did not render. The archived official programme description supports subject scope, while current entry criteria and exact format remain unknown.
- Dar es Salaam Development Studies has a verified 18-month coursework/dissertation structure, but the entry section is blank. It is explicitly a partial admission record; criteria from the distinct Development Evaluation degree are not transplanted.
- Jimma MPH’s 3.0 graduation CGPA is not an admission cutoff. Jimma’s route-specific schedules should be confirmed, and its MSc Environmental Science entry disciplines are recorded directly from the relevant degree page.
- Botswana MMed Public Health Medicine is a genuine postgraduate medical specialty degree, four years, requiring a medical degree and clinical practice including internship. It should not be presented as a general-entry MPH.
- CMU’s current MSE is 20 or 24 months and publishes cumulative QPA greater than 2.5. Professional experience is recommended rather than required. The current autumn-2027 offering supersedes older 16-month descriptions. Harris MPP requires GRE or a qualifying waiver; MIT MFin has no minimum GPA and does not accept TOEFL/IELTS scores, instead assessing English at interview.
- UW and Calgary grade thresholds concern the last two undergraduate years, not overall GPA. McGill’s three years is a maximum completion period. Waterloo’s current programme is 24 months, not the shorter duration in older summaries.

Each JSON record includes its exact official source links and any material limitation in `dataNote` or `scheduleNote`. No closed 2025/2026 cycle is relabelled as an open future cycle.

## GradAtlas Asia/MENA v5 research — 12 October 2026

30 additional master's degree/specialisation records, across 15 study destinations and 14 existing subject fields. Sources are university/programme primary pages or university-linked regulations and curricula. No repo edits, commits, publication or external messages were made.

## Representation rules

- All GPA filter values are null. National/institutional grade rules are described only in their own grading context; no foreign GPA conversion or admission-probability estimate is supplied.
- Numeric IELTS values are supplied only with an ieltsSource URL also present in sources. Where admission has conditional/bridging routes or unclear programme-specific language rules, the numeric field stays null.
- A missing fee means “Current tuition not verified,” with free:false serving the existing schema, not evidence that a price was found.
- Only ITB's exact January 2027 Batch 2 window (6–26 October 2026) and Chulalongkorn's explicitly closed 2026 window (1 February–5 April 2026) are encoded. No annual deadline has been extrapolated into a new cycle. Exact opening dates missing at LUMS, AIM and ISET are kept as schedule notes.
- Campus coordinates are approximate map locations, not precise wayfinding.

## Material source issues kept visible

- LUMS now publishes Fall 2027 entry criteria with HAT-II, not the older GAT listing; its tuition table is FY 2026–27 Year 1, not the whole two-year degree or the 2027 cohort. Work experience is preferred, not mandatory, and the FAQ explicitly says no minimum CGPA.
- ITB Bandung General Management MBA is now a 48-credit, 18-month offline route. Double-degree partners are not duplicated. Its current admissions page has January 2027 dates; fee intake labels conflict, so the fee stays unknown. Foreign-applicant aptitude-test rules must be checked rather than treating 3.25 as a universal hard grade cutoff.
- UM Data Science's May 2026 programme-specific honours requirements (3.30 science / 3.50 accepted non-science) supersede an older 3.00 handbook and the generic university section. Teaching language is not asserted from an English-test requirement.
- UM MPH has programme-specific grade/experience bands and an interview requirement; the broad university CGPA section alone is insufficient.
- USM Linguistics/English page contains an apparent copied computer-science accreditation paragraph and a warning that English scores vary. Neither is promoted as a definitive programme rule.
- AIT ESAM is a genuine professional master's, but its hybrid-delivery FAQ is pandemic-specific and its fee discount refers to the introductory cohort. Current delivery mode, current fee and cohort availability are not asserted.
- Chulalongkorn's current programme FAQ confirms on-site, full-time study. Its main university admissions criteria are labelled 2023; current English evidence is checked against the 2026 student guide. An explicit teaching-language statement was not found, so the teaching language remains unknown. The published total fee and breakdown disagree.
- VJU's current Vietnamese listing states Vietnamese + English for Public Policy, despite an older English page saying English-only. Old 2023 GPA/IELTS values are not imported as current cutoffs. Climate Change/Development is primarily English, with philosophy and Japanese courses taught in other languages; its detailed current entry rules remain unknown.
- NTHU Teaching Chinese is a real MA and primarily Chinese, with a 2–4-year degree period. The C1 TOCFL, publication and practicum requirements shown are graduation rules, not admission thresholds. Current international entry rules remain unknown.
- SQU's Marine Science and Fisheries record covers coursework + thesis (two years full-time / three years part-time); its shorter thesis-only route has additional prerequisites. The 3.00 course-completion GPA is not an entry cutoff. Both SQU programmes allow IELTS 5.5 with a language course, so a hard 6.00 IELTS filter would be misleading.
- GUtech–WU MBA has an 18-month MBA-specific overview and admission section, followed by a copied Computer Science FAQ. Only the MBA-specific sections are used. Actual teaching language and any online component remain unverified.
- AUM's Kuwait MBA includes an HEC Montréal graduate diploma; it is not two MBA degrees. Work-permit/residency and Ministry equivalence rules must be checked for international applicants.
- Bahrain architecture's actual programme text identifies M.Arch, while the browser title retains an MSc label. The environmental degree's two-year duration is a curriculum sequence, not a statutory maximum.
- AUA current TEFL is 1.5 years, overriding older two-year event wording. MSE is one year in Dilijan, with assigned summer preparation potentially in Yerevan. GPA 3.00 values in the general application table are test-waiver conditions, not universal degree-entry thresholds.
- ISET's international B2 English examples contain ranges, so there is no single IELTS cutoff. Local and international admission routes/dates differ.

## Coverage

India 3; Pakistan 1; Bangladesh 2; Indonesia 1; Malaysia 3; Thailand 3; Vietnam 3; Philippines 1; Taiwan 2; Oman 3; Kuwait 1; Bahrain 2; Uzbekistan 1; Georgia 1; Armenia 3.

Not added: NUST Cyber Security (campus/teaching-language uncertainty), GJU programmes (duration/teaching-language not confirmed), UGM public policy (teaching-language uncertainty), and UP urban planning (current duration evidence insufficient). These were omitted rather than used to fill counts.

Seven teaching languages explicitly remain unverified: IIM Ahmedabad MBA, LUMS MBA, ITB General Management MBA, UM Data Science, USM Linguistics/English, Chula MAIDS and GUtech–WU MBA. Each has a verified master's identity and duration, and the missing metadata is visible in the record.

## Europe catalogue expansion — 12 October 2026


30 additional university master's records, 20 countries and 16 existing subject groups. All links in the record provenance are official university programme, admission, curriculum or course-catalogue pages. Campus points are approximate and are not entrances or directions.

Coverage: Portugal, Belgium, Austria, Czechia, Denmark, Norway, Estonia, Latvia, Lithuania, Hungary, Greece, Romania, Slovenia, Croatia, Iceland, Serbia, United Kingdom, Italy, Switzerland and Spain. Five UK additions are Manchester, Edinburgh, Glasgow, Bristol/UWE and Sussex. Four further additions are Politecnico di Milano, Padua, EPFL and UAB. Additional NOVA, Antwerp, Graz, Masaryk and Aarhus records broaden disciplines within the priority countries.

The temporary JSON passed checks for non-empty schema fields, existing field taxonomy, IDs and exact degree identity duplicates against the current catalogue, valid mode labels and coordinates, and provenance membership for fees, application windows, contacts and every numeric IELTS score. No numeric GPA conversions or estimated acceptance probabilities are included.

## Evidence limits

- Masaryk Energy Policy Studies has one fully dated spring 2027 single-degree window: 1 July–31 October 2026. Other programmes generally lack a fully dated, applicant-category opening and closing pair in this research, so `window` is null.
- Numeric IELTS scores are recorded only with a matching official source. UK degree classifications and country-specific academic comparisons remain text; they are not converted into a universal GPA.
- RTU cybersecurity has differing fee figures across official pages. Masaryk also has inconsistent fee amounts. Neither amount is asserted. NOVA's page does not clearly establish the fee payment period.
- UAB is an official 60 ECTS master's taught face to face entirely in English. Its duration label states the credit structure and directs users to the study plan, rather than inferring a calendar period.
- Edinburgh's current programme and 2026/27 handbook are verified; detailed entry criteria use the university's published 2026/27 admission page. The next cycle needs confirmation.
- ELTE's published Psychology criteria and route-specific requirements need applicant-route confirmation. The record does not assume that one procedure covers all international applicants.
- Vilnius Molecular Biology is 90 ECTS / 1.5 years according to the official linked programme listing; the programme page alone does not expose all structure details.
- Babeș-Bolyai Econometrics and Applied Statistics is taught in Romanian. NOVA Public Health is Portuguese and hybrid. These are accurately labelled rather than presented as English degrees.
- Zagreb's management master's is a one-year route requiring an appropriate four-year / 240 ECTS first degree. Antwerp distinguishes academic university degrees from professional bachelor's qualifications.
- EPFL Urban Systems distinguishes admission routes for external and EPFL graduates. Padua's international qualification route differs from its domestic school admission process.
- Reykjavik's local grade expectation and NTNU's C-grade requirement are preserved in their native context. Vienna explicitly states no minimum GPA, which does not remove its selection process.
- Belgrade's 2026 page contains differing application-phase dates, with the last published phase already past. The record does not claim current availability.

Fee amounts that are recorded identify the published entry year and applicable category. Unknown fees, certificate details, upcoming cycle dates and programme contacts remain explicit. No messages were sent and no repository or publishing changes were made.

