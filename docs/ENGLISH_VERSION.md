# Marie Ovarian Cancer — English version and scrolling

## Launch

The complete dashboard, data files, graphics, scientific sources and FAPESP project records are included. From the project directory:

```bash
python -m pip install -r requirements.txt
streamlit run app.py
```

Use **PT** or **EN** in the upper-right corner. The selected language is kept locally in the browser; the English view can be selected at any time without resetting the scientific filters. The same 10 scientific and management sections, filters, graphs, individual-variable cross-tabulations, provenance records, and exports remain available in either language.

## Scrolling

The Streamlit iframe now reports the actual height of the dashboard content through the official component-height protocol. The host page can scroll vertically rather than clipping content at one viewport. The fixed-height `100dvh` styling was removed from the embedded component. The navigation sidebar has its own scrollbar on short screens. In standalone HTML, normal browser scrolling is preserved.

## Scientific interpretation (read carefully)

- **PNS 2019:** Survey-weighted population estimates. The 53 ovarian cancer records are **self-reported current or past diagnoses among survey respondents**; they are neither incident cases nor a disease registry. Small subgroups are exploratory and may be inconclusive. Confidence intervals account for the complex survey design when estimable.
- **SIM 2024:** 4,567 observed female deaths with ovarian cancer (ICD-10 C56) as the underlying cause in the national table. These are not the number of new cases in 2024.
- **INCA 2026:** 8,020 *estimated new annual cases* in Brazil. This is an incidence estimate, not an observed count, and is not to be divided into the SIM deaths to estimate case fatality.
- **UK Biobank:** Published adjusted associations concern an independent UK cohort and should not be applied as individual predictive probabilities to the Brazilian population. Hazard ratios and odds ratios are different effect measures.
- **Diet and cancer:** Observational associations must not be described as proof of causation. General fruit consumption, individual citrus foods, and flavanone exposure are not interchangeable.
- **One Health:** The integrated perspective is still under development and does not imply that all environmental, animal-health, or individual clinical exposures have been measured.

The language switch changes presentation only. It **does not transform study populations, incidence estimates, observed deaths, confidence intervals, survey weights, diagnostic statuses, scientific source URLs, or the source datasets**. CSV exports retain the original data-variable identifiers for reproducibility.

## Validation

```bash
node scripts/validate_frontend_data.cjs
node scripts/validate_app_interactions.cjs
node scripts/validate_bilingual.cjs
```

The checks assess data invariants, interactions, scientific text coverage, and source translation completeness. They are **not** a browser-level visual/clinical validation. Before clinical/public deployment, verify the live deployed interface at desktop and mobile sizes, assess accessibility, and have specialist reviewers approve interpretations and translations.
