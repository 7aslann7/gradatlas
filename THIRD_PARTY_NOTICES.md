# Third-party notices

## ExcelJS

GradAtlas serves ExcelJS **4.4.0** locally, only when a visitor exports a comparison. Its browser bundle is distributed under MIT; the complete upstream notice is retained in `src/vendor/exceljs/LICENSE` and copied into the static build. The writer generates local workbooks and does not upload workspace data.

- Source: https://github.com/exceljs/exceljs
- Distribution: https://registry.npmjs.org/exceljs/-/exceljs-4.4.0.tgz

## ROR institution metadata and GeoNames localities

The separate institution index is derived from **ROR v2.14, 6 October 2026**, filtered to active education-type records and reformatted by GradAtlas. The public manifest preserves the official release URL, source and output checksums, filtering and projection. One point uses the first valid locality per ROR ID; no artificial campus offsets are introduced. ROR is research-focused and its category includes institutions beyond universities; the index does not establish degree availability or accreditation.

- ROR release: https://zenodo.org/records/23187250
- ROR metadata: CC0 1.0, https://ror.readme.io/docs/data-dump
- GeoNames geographic data: CC BY 4.0, https://www.geonames.org/about.html and https://creativecommons.org/licenses/by/4.0/
- ROR's schema documentation also retains a legacy CC BY 3.0 reference. The provenance manifest preserves this discrepancy and provider attribution.

Visible attribution credits ROR and GeoNames on the directory map and explains their licences in Data & methodology. Directory exports carry the same attribution, source release, licence links and transformation/accuracy notes alongside the records; see [data reuse](docs/DATA_REUSE.md). These third-party data rights are separate from GradAtlas's software MIT licence. Source websites, institutional names, marks and logos do not acquire an MIT licence through inclusion of a link.

## DUO RIO degree registrations

Registered Dutch master's degree identities are derived from DUO's **HO Opleidingsoverzicht**, snapshot updated **12 October 2026**. The publisher metadata identifies **Creative Commons Attribution** (`cc-by`) and links to [Open Definition's CC-BY reference](https://opendefinition.org/licenses/cc-by/); it does not specify a licence version. GradAtlas preserves that exact publisher declaration rather than relabelling it CC0 or a chosen CC BY version.

Source: DUO, Registratie Instellingen en Opleidingen (RIO), [HO Opleidingsoverzicht](https://onderwijsdata.duo.nl/datasets/ho_opleidingsoverzicht). GradAtlas filters and groups degree/provider records, reconciles duplicates, assigns title-based subject groups and joins approximate ROR/GeoNames institution localities. DUO, ROR and GeoNames do not endorse the service. Keep source credit, licence links and transformation notices when redistributing these records. The downloaded catalogue and registry-bearing comparison workbooks carry attribution; the source manifest and compressed raw snapshot are pinned in the repository.

Registration identity is separate from current admissions, fees, cutoffs and available intake. Registry-supplied institution/programme links have not all been checked individually. GeoNames geographic attribution applies separately, as above.

## Playwright

Playwright Test is a development-only npm dependency pinned by the lockfile. It is not included in the deployed static application. Source and Apache-2.0 licence: https://github.com/microsoft/playwright. Browser downloads and operating-system packages used by CI retain their upstream terms.

## MapLibre GL JS

GradAtlas locally serves MapLibre GL JS **6.14.0**, including its WebGL renderer, module worker and CSS. These files are distributed under BSD-3-Clause and include upstream third-party notices. The complete licence is retained in `src/vendor/maplibre/LICENSE.txt` and copied into the static build.

- Source: https://github.com/maplibre/maplibre-gl-js/tree/v6.14.0
- Distribution: https://registry.npmjs.org/maplibre-gl/-/maplibre-gl-6.14.0.tgz

## Natural Earth boundaries

`src/assets/countries.geojson` contains simplified Natural Earth country boundaries from the datasets/geo-countries distribution. Coordinates are rounded to four decimal places, small rings are omitted, and consecutive close points are reduced for browser rendering. This asset is for geographic discovery, not precise navigation or boundary adjudication.

- Dataset: https://github.com/datasets/geo-countries
- Public-domain terms: https://www.naturalearthdata.com/about/terms-of-use/

## Typography

DM Sans and Manrope are requested from Google Fonts. Their respective upstream licences apply to those font assets.
