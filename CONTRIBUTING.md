# Contributing to GradAtlas

GradAtlas should be useful without a subscription or account. Contributions should make information easier to find, easier to understand and easier to verify.

## Programme records

1. Find the official programme and admission pages. Third-party aggregators and student discussions can suggest leads, but cannot establish a formal requirement.
2. Add a stable ID and short original summary to `src/data/programs.json`.
3. Record the review date, official URLs and the applicant category for each date or fee.
4. Keep an unknown value unknown. Use `window: null` when a current cycle is not verified. Put recurring guidance in `scheduleNote`.
5. Use a numeric grade rule only for a published requirement. Include its source, grading scale, direction and whether it is required or preferred. Never invent a cross-country conversion.
6. Add only published professional contacts. Include the page where the contact was found. A contact does not establish supervisor availability.
7. Run the data check, tests and build. Explain the sources and information limits in your pull request.

## Code changes

Keep business rules in `src/core.js`, UI state in `src/app.js` and geography interactions in `src/map.js`. Test meaningful requirement, date and persistence behavior. Verify desktop and phone layouts after UI changes. Keep keyboard navigation and reduced-motion preferences working.

## Community content

Public reviews and programme submissions are planned, not currently available. When implemented, experiences must be separated from formal requirements and moderated for spam, personal information, conflicts of interest and abusive content. Do not add invented ratings or synthetic student testimonials.

## Reporting corrections

Provide the programme ID, field to correct, official source, relevant applicant category and date of review. Do not include your passport, transcript, personal email or private admissions correspondence in a public issue.

Use the subject groups exported from `src/core.js`, canonical delivery modes (`On campus`, `Online`, `Hybrid`, `Not verified`) and stable programme IDs. A specialisation must be named explicitly. Include the exact applicant category with every dated window, and `ieltsSource` for newly recorded numeric language thresholds. Every contact and research URL must appear in the record’s official source list.
