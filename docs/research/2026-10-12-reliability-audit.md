# GradAtlas reliability audit — 12 October 2026

Scope: all 18 encoded application windows, all four numeric GPA rules, all nine no-tuition flags and the five legacy IELTS scores missing an explicit language source in the 171-record catalogue. Every supporting page was re-browsed on this date. This is a targeted audit, not re-verification of every fact in all 171 records.

Artifacts:

## Findings and corrections

Seventeen dated windows remain supported. UCL's live Sustainable Urbanism page has rolled over to September 2027 and lists its dates and fees as pending; the old 2026 window is removed and tuition becomes an explicitly unknown 2027/28 amount. Its full-time duration remains one calendar year. The refreshed entry text states the normal UK upper-second-class qualification requirement and preserves the exceptional experience routes.

All nine no-tuition claims are explicitly supported by their respective programme pages. Each receives `tuition.source`; semester contributions are still separate. These programme-level confirmations must not be generalised to every German university or every applicant cost.

All four encoded German grade rules remain supported in their native grading system. No conversion is performed. These thresholds do not establish eligibility without the remaining subject and qualification conditions.

All five missing IELTS sources are repaired. Twente's per-section minimum, test age and excluded test formats are explicit. KTH's English Level 2 component requirement is supported by Swedish University Admissions, linked from KTH. Prior-study or other certificate routes must be evaluated individually.

A further Passau clarification preserves its alternative academic rule: German grade 2.7 or better OR ranking in the best 70% of the graduating cohort. It stays in prose rather than becoming a misleading single numeric filter.

## All application windows

| Record | Recorded dates | Audit outcome / category | Evidence |
|---|---|---|---|
| eth-data | 2026-11-01 → 2026-11-30 | Retain: International bachelor’s degree · autumn 2027 | [Official page](https://ethz.ch/en/studies/master/application/dates.html) |
| kth-ml | 2026-10-16 → 2027-01-15 | Retain: Autumn 2027 standard application | [Official page](https://www.kth.se/en/studies/master/machine-learning) |
| aalto-cs | 2026-12-07 → 2027-01-05 | Retain: Master’s admission 2027 | [Official page](https://www.aalto.fi/en/study-options/computer-science-master-of-science-technology) |
| ucl-urban | 2025-10-20 → 2026-06-26 | Remove: live 2027 dates to be confirmed | [Official page](https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees/sustainable-urbanism-msc) |
| ubc-policy | 2026-10-05 → 2027-01-26 | Retain: Primary application · September 2027 | [Official page](https://sppga.ubc.ca/master-public-policy-global-affairs/admissions/) |
| maastricht-ai | 2026-10-01 → 2027-05-01 | Retain: Non-EU/EEA nationality · September 2027 intake | [Official page](https://www.maastrichtuniversity.nl/education/master/programmes/artificial-intelligence/admission-requirements) |
| maastricht-dsdm | 2026-07-01 → 2026-11-01 | Retain: Non-EU/EEA nationality · February 2027 intake | [Official page](https://www.maastrichtuniversity.nl/education/master/programmes/data-science-decision-making/admission-requirements) |
| ubc-economics | 2026-10-15 → 2026-12-15 | Retain: Canadian and international applicants · September 2027 intake | [Official page](https://www.grad.ubc.ca/prospective-students/graduate-degree-programs/master-of-arts-economics) |
| karolinska-global-health | 2026-10-16 → 2027-01-15 | Retain: Autumn 2027 · first international admissions round | [Official page](https://www.universityadmissions.se/en/key-dates-and-deadlines/autumn-semester-dates/) |
| eth-biology | 2026-11-01 → 2026-11-30 | Retain: International bachelor’s degree · autumn 2027 | [Official page](https://ethz.ch/en/studies/master/application/dates.html) |
| tokyo-mpp-international | 2026-11-01 → 2026-12-01 | Retain: MPP/IP AY2027 · international application | [Official page](https://www.pp.u-tokyo.ac.jp/en/mppip/admissions/general-information/) |
| kdi-development-policy | 2026-08-05 → 2026-08-14 | Retain: International general admissions · Spring 2027 | [Official page](https://www.kdischool.ac.kr/boardDownload.es?bid=ATT&list_no=19840&seq=1) |
| andes-economics-peg | 2026-07-27 → 2026-11-18 | Retain: Regular master’s applicants · January 2027 | [Official page](https://www.uniandes.edu.co/es/programas/maestria-en-economia) |
| andes-architecture-marq | 2026-07-27 → 2026-11-18 | Retain: Architecture master’s applicants · January 2027 | [Official page](https://arqdis.uniandes.edu.co/posgrado/informacion/admisiones-marq/) |
| cmu-software-engineering | 2026-09-09 → 2026-12-09 | Retain: On-campus MSE applicants · Autumn 2027 | [Official page](https://mse.s3d.cmu.edu/applicants/mse-as/apply.html) |
| itb-general-management-mba-bandung | 2026-10-06 → 2026-10-26 | Retain: January 2027 MBA intake · Batch 2 · Bandung/Jakarta | [Official page](https://www.sbm.itb.ac.id/academic-programs/mba/admission/) |
| chula-international-development-ma | 2026-02-01 → 2026-04-05 | Retain: Academic year 2026 MAIDS–GRID admissions · published closed cycle | [Official page](https://www.maids-chula.org/application-new) |
| masaryk-energy-policy | 2026-07-01 → 2026-10-31 | Retain: Spring 2027 · single-degree applicants | [Official page](https://www.muni.cz/uchazeci/navazujici-magisterske-studium/nabidka-studia/23258-energy-policy-studies) |

The date fields represent calendar days. Some sources specify earlier closing hours: ETH 11:59 AM CET, Tokyo 5 PM JST, CMU 3 PM EST, ITB 3 PM and KDI 6 PM KST. A date badge must not substitute for the source's exact submission time. KDI and Chulalongkorn are explicitly closed cycles, not current openings. Maastricht Data Science's February row is clear; unrelated conflicting September labels remain outside the encoded window.

## All numeric grade rules

| Record | Rechecked rule | Evidence |
|---|---|---|
| tuebingen-ml | German 2.0 or better, required | [Official requirement](https://uni-tuebingen.de/en/study/finding-a-course/degree-programs-available/detail/course/machine-learning-master/) |
| saarland-quantum | German 2.5 or better, required | [Official requirement](https://www.uni-saarland.de/en/study/programmes/master/quantum-engineering.html) |
| ulm-quantum | German 2.7 or better, required | [Official requirement](https://www.uni-ulm.de/en/study/application-and-enrolment/masters-programmes/quantum-engineering/) |
| jena-quantum | German 2.0 or better, required | [Official requirement](https://www.uni-jena.de/en/237358/m-sc-quantum-science-and-technology) |

Ulm also describes an interview condition for certain non-EHEA degrees and grades. No encoded German threshold is asserted as a raw Turkish GPA equivalent. Passing a grade check is not an admission decision.

## All no-tuition flags

| Record | Outcome | Evidence |
|---|---|---|
| saarland-cyber | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.uni-saarland.de/en/study/programmes/master/cybersecurity.html) |
| saarland-cs | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.uni-saarland.de/en/study/programmes/master/informatics.html) |
| saarland-dsai | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.uni-saarland.de/en/study/programmes/master/data-science.html) |
| passau-cs | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.uni-passau.de/en/msc-computer-science) |
| hildesheim-data | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.uni-hildesheim.de/en/studium/studieninteressierte/studiengaenge/masterstudium/data-analytics-msc/) |
| saarland-quantum | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.uni-saarland.de/en/study/programmes/master/quantum-engineering.html) |
| wuerzburg-quantum | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.physik.uni-wuerzburg.de/en/international/quantum-engineering/) |
| jena-quantum | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.uni-jena.de/en/237358/m-sc-quantum-science-and-technology) |
| siegen-quantum | Retain no-tuition flag; semester contributions excluded | [Official fee statement](https://www.uni-siegen.de/en/studentsstudyprogram/m-sc-quantum-science) |

Hildesheim's fee paragraph uses a broad generalisation about German universities. This audit only accepts it as the programme's own fee statement and does not repeat it as a country rule.

## Five legacy IELTS scores

| Record | Outcome | Evidence |
|---|---|---|
| twente-cyber | Retain IELTS 6.5; add explicit source | [Official language rule](https://www.utwente.nl/en/education/master/programmes/computer-science/admission/admission-international/) |
| tuebingen-ml | Retain IELTS 7.0; add explicit source | [Official language rule](https://uni-tuebingen.de/en/study/finding-a-course/degree-programs-available/detail/course/machine-learning-master/) |
| kth-ml | Retain IELTS 6.5; add explicit source | [Official language rule](https://www.universityadmissions.se/en/entry-requirements/english-language-requirements/) |
| nus-computing | Retain IELTS 6.0; add explicit source | [Official language rule](https://www.comp.nus.edu.sg/programmes/pg/mcomp-gen/admissions/) |
| melbourne-env | Retain IELTS 6.5; add explicit source | [Official language rule](https://study.unimelb.edu.au/find/courses/graduate/master-of-environment/entry-requirements/) |

Tübingen publishes IELTS 7.0 as one accepted English proof. NUS General Track gives IELTS 6.0 for the applicable language-test route and sets test-validity rules. Melbourne lists Academic IELTS 6.5 with 6.0 in each component and permits recognised alternative evidence. None is converted into a blanket requirement for every applicant irrespective of exemption.

## Core field evidence and limits

Evidence objects are added only where directly supported: language and duration for the reviewed Saarland degrees, Hildesheim, Würzburg, Jena and Tübingen; Passau's English route; Siegen's two-year duration; Aalto and KTH duration/language/campus delivery; Masaryk language and campus delivery; Karolinska language and explicit on-campus delivery; and UCL full-time duration. Fee, grade and IELTS provenance remain in their dedicated source properties.

UCL now names UCL East, Stratford. Its existing approximate map point should be reviewed by the parent before publishing the updated record. No exact campus coordinates were verified in this audit.

The guidance entries distinguish taught applications, research supervision and programme-specific document rules. A template must not make supervisor outreach, references, a separate CV or a research proposal mandatory for every degree. All advice is scoped to the linked university page; no visa or legal advice is included.
